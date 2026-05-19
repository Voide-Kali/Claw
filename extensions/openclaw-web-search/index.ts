import { z } from 'zod';
import { envConfig, type EnvConfig } from '../../lib/env';
import { logger } from '../../lib/logger';
import { createRequestContext } from '../../lib/request-context';
import { rateLimiter } from '../../lib/rate-limiter';

// Re-export envConfig for testing
export { envConfig };
export type { EnvConfig };

const {
  WEB_SEARCH_API,
  WEB_FETCH_API,
  OLLAMA_API_KEY,
  MAX_RESULTS,
  TIMEOUT_MS,
  CONTENT_TRUNCATE_LENGTH,
  RETRY_ATTEMPTS
} = envConfig;

const querySchema = z.object({
  query: z.string().trim().min(3, 'query must be at least 3 characters long')
});

const urlSchema = z.object({
  url: z.string().trim().url('url must be a valid absolute URL')
});

interface OllamaApi {
  registerTool(tool: Tool): void;
}

interface Tool {
  name: string;
  label: string;
  description: string;
  parameters: { type: string; properties: Record<string, any>; required: string[] };
  execute: (toolCallId: string, params: any, signal?: AbortSignal) => Promise<any>;
}

interface WebSearchResult {
  title: string;
  url: string;
  content: string;
}

interface WebFetchResult {
  title: string;
  content: string;
  links: string[];
}

interface WebSearchResponse {
  results: WebSearchResult[];
}

interface WebFetchResponse extends WebFetchResult {}

async function ollamaFetch(
  url: string,
  body: Record<string, any>,
  signal?: AbortSignal,
  retries = RETRY_ATTEMPTS
): Promise<Response> {
  // Check rate limit before making request
  if (envConfig.ENABLE_RATE_LIMITING) {
    const canProceed = await rateLimiter.acquire();
    if (!canProceed) {
      const waitTime = rateLimiter.getTimeUntilNextToken();
      logger.warn('Rate limit exceeded, waiting before retry', {
        url,
        waitTimeMs: waitTime,
        remainingTokens: rateLimiter.getRemainingTokens()
      });

      // Wait for next available token
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    // Cleanup function to ensure timeout is always cleared
    const cleanup = () => clearTimeout(timeoutId);

    // Link external signal to controller (without memory leak)
    const abortListener = signal
      ? () => {
          cleanup();
          controller.abort();
        }
      : null;

    if (abortListener) {
      signal!.addEventListener('abort', abortListener, { once: true });
    }

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (OLLAMA_API_KEY) {
        headers.Authorization = `Bearer ${OLLAMA_API_KEY}`;
      }

      logger.debug('ollamaFetch attempt', {
        url,
        attempt,
        timeoutMs: TIMEOUT_MS,
        hasApiKey: Boolean(OLLAMA_API_KEY),
        remainingTokens: rateLimiter.getRemainingTokens()
      });

      const response = await globalThis.fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal
      });
      cleanup();
      if (abortListener && signal) {
        signal.removeEventListener('abort', abortListener);
      }

      // Handle rate limit response (429 Too Many Requests)
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : 60000; // Default 1 minute

        logger.warn('API rate limit reached, implementing backoff', {
          url,
          attempt,
          retryAfter: retryAfter || 'not specified',
          waitTimeMs: waitTime
        });

        if (attempt === retries) {
          throw new Error(`API rate limit reached. Please try again later. (Retry-After: ${retryAfter || 'unknown'})`);
        }

        // Wait according to Retry-After header or exponential backoff
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue; // Retry the request
      }

      return response;
    } catch (err) {
      logger.warn('ollamaFetch request failed', { url, attempt, error: err instanceof Error ? err.message : String(err) });
      cleanup();
      if (abortListener && signal) {
        signal.removeEventListener('abort', abortListener);
      }

      if (attempt === retries) {
        if (err instanceof Error) {
        if (err.name === 'AbortError') {
            throw new Error(`Request timed out after ${TIMEOUT_MS}ms`);
          }
          throw new Error(`Fetch failed: ${err.message}`);
        }

        const cause = new Error(String(err));
        // eslint-disable-next-line preserve-caught-error
        throw new Error(`Fetch failed: ${cause.message}`);
      }

      // Exponential backoff with jitter to avoid thundering herd
      const delay = 1000 * Math.pow(2, attempt);
      const jitter = Math.random() * delay * 0.1; // 10% jitter
      await new Promise(resolve => setTimeout(resolve, delay + jitter));
    }
  }
  throw new Error('Unreachable');
}

async function executeWebSearch(
  _toolCallId: string,
  params: { query: string },
  signal?: AbortSignal
) {
  const ctx = createRequestContext();

  const validated = querySchema.safeParse(params);
  if (!validated.success) {
    const message = 'query parameter is required and must be at least 3 characters';
    logger.error('Web search request validation failed', { ...ctx.toJSON(), message });
    throw new Error(message);
  }
  const { query } = validated.data;

  logger.info('Web search request started', { ...ctx.toJSON(), query });
  const response = await ollamaFetch(WEB_SEARCH_API, { query, max_results: MAX_RESULTS }, signal);

  if (response.status === 401) {
    throw new Error(
      'Web search authentication failed. Make sure you are signed in to ollama (run `ollama signin`).'
    );
  }
  if (response.status === 403) {
    throw new Error('Web search is unavailable (ensure ollama cloud is enabled).');
  }
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Web search failed (${response.status}): ${body}`);
  }

  let data: WebSearchResponse;
  try {
    data = await response.json();
  } catch (err) {
    const cause = err instanceof Error ? err : new Error(String(err));
    // eslint-disable-next-line preserve-caught-error
    throw new Error(`Invalid JSON response from web search: ${cause.message}`);
  }

  // Validate response structure
  if (!data || typeof data !== 'object' || !Array.isArray(data.results)) {
    const message = 'Invalid web search response: missing or invalid results array';
    logger.error('Web search response validation failed', { ...ctx.toJSON(), message, responseBody: data });
    throw new Error(message);
  }

  logger.info('Web search request completed', {
    ...ctx.toJSON(),
    query,
    resultCount: data.results.length
  });

  if (!data.results.length) {
    return { content: [{ type: 'text' as const, text: `No results for: ${query}` }] };
  }

  const text = data.results
    .map(
      (r, i) =>
        `${i + 1}. ${r.title}\n   ${r.url}\n   ${r.content?.length > CONTENT_TRUNCATE_LENGTH ? r.content.slice(0, CONTENT_TRUNCATE_LENGTH) + '...' : r.content}`
    )
    .join('\n\n');

  return { content: [{ type: 'text' as const, text }] };
}

async function executeWebFetch(_toolCallId: string, params: { url: string }, signal?: AbortSignal) {
  const ctx = createRequestContext();
  const validated = urlSchema.safeParse(params);
  if (!validated.success) {
    const message = 'url parameter must be a valid URL';
    logger.error('Web fetch request validation failed', { ...ctx.toJSON(), message });
    throw new Error(message);
  }
  const url = new URL(validated.data.url).toString();

  logger.info('Web fetch request started', { ...ctx.toJSON(), url });
  const response = await ollamaFetch(WEB_FETCH_API, { url }, signal);

  if (response.status === 401) {
    const message = 'Web fetch authentication failed. Make sure you are signed in to ollama (run `ollama signin`).';
    logger.error('Web fetch request failed', { ...ctx.toJSON(), url, status: response.status });
    throw new Error(message);
  }
  if (response.status === 403) {
    throw new Error('Web fetch is unavailable (ensure ollama cloud is enabled).');
  }
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Web fetch failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as WebFetchResponse;

  const parts = [];
  if (data.title) parts.push(`# ${data.title}`);
  if (data.content) parts.push(data.content);
  if (data.links?.length) {
    parts.push('\n## Links\n' + data.links.map(l => `- ${l}`).join('\n'));
  }

  const text = parts.join('\n\n') || 'No content returned.';
  logger.info('Web fetch request completed', {
    ...ctx.toJSON(),
    url,
    responseSize: text.length
  });
  return { content: [{ type: 'text' as const, text }] };
}

const ollamaWebSearchPlugin = {
  id: 'openclaw-web-search',
  name: 'Ollama Web Search',
  description: 'Web search and fetch via local ollama server',
  register(api: OllamaApi) {
    api.registerTool({
      name: 'ollama_web_search',
      label: 'Ollama Web Search',
      description: "Search the web for current information using Ollama's search API.",
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'The search query' }
        },
        required: ['query']
      },
      execute: executeWebSearch
    });
    api.registerTool({
      name: 'ollama_web_fetch',
      label: 'Ollama Web Fetch',
      description: 'Fetch the content of a web page by URL.',
      parameters: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'The URL to fetch' }
        },
        required: ['url']
      },
      execute: executeWebFetch
    });
  }
};

export default ollamaWebSearchPlugin;
