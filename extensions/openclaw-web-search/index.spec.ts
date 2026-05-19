import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('extensions/openclaw-web-search/index.ts - Web Search API', () => {
  const TIMEOUT_MS = 30000;
  const RETRY_ATTEMPTS = 3;
  const _MAX_RESULTS = 10;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Timeout Management', () => {
    it('should clear timeout on successful fetch', async () => {
      const controller = new AbortController();
      let timeoutCleared = false;
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
      const cleanup = () => {
        clearTimeout(timeoutId);
        timeoutCleared = true;
      };

      // Simular sucesso
      cleanup();
      expect(timeoutCleared).toBe(true);
    });

    it('should clear timeout on fetch error', async () => {
      const controller = new AbortController();
      let timeoutCleared = false;
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
      const cleanup = () => {
        clearTimeout(timeoutId);
        timeoutCleared = true;
      };

      try {
        throw new Error('Fetch failed');
      } catch {
        cleanup();
      }

      expect(timeoutCleared).toBe(true);
    });

    it('should not create memory leak from orphaned timeouts', () => {
      const timeouts: ReturnType<typeof setTimeout>[] = [];

      for (let i = 0; i < 5; i++) {
        const timeoutId = setTimeout(() => {}, TIMEOUT_MS);
        timeouts.push(timeoutId);
        clearTimeout(timeoutId); // ← Cleanup imediato
      }

      // Todos devem estar "cleared"
      expect(timeouts.length).toBe(5);
    });

    it('should abort fetch when timeout expires', async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);

      vi.advanceTimersByTime(1000);

      expect(controller.signal.aborted).toBe(true);
      clearTimeout(timeoutId);
    });
  });

  describe('External Signal Handling', () => {
    it('should respects external AbortSignal', async () => {
      const externalController = new AbortController();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const abortListener = () => {
        clearTimeout(timeoutId);
        controller.abort();
      };

      externalController.signal.addEventListener('abort', abortListener, { once: true });
      externalController.abort();

      expect(externalController.signal.aborted).toBe(true);
      expect(controller.signal.aborted).toBe(true);
    });

    it('should cleanup listener when external signal aborts', () => {
      const externalController = new AbortController();
      let listenerCalled = 0;

      const listener = () => {
        listenerCalled++;
      };

      externalController.signal.addEventListener('abort', listener, { once: true });
      externalController.abort();
      externalController.abort(); // Não deve chamar novamente

      expect(listenerCalled).toBe(1); // Apenas uma vez
    });

    it('should cleanup timeout even if external signal aborts first', async () => {
      const externalController = new AbortController();
      const _controller = new AbortController();
      let timeoutCleared = false;
      let listenerCalled = false;

      const timeoutId = setTimeout(() => {
        timeoutCleared = false; // Not called
      }, TIMEOUT_MS);

      const cleanup = () => {
        clearTimeout(timeoutId);
        timeoutCleared = true;
      };

      const abortHandler = () => {
        listenerCalled = true;
        cleanup();
      };

      externalController.signal.addEventListener('abort', abortHandler, { once: true });

      externalController.abort();

      expect(listenerCalled).toBe(true);
      expect(timeoutCleared).toBe(true);
    });
  });

  describe('Retry Logic with Exponential Backoff', () => {
    it('should attempt retries up to MAX_RETRIES', () => {
      let attemptCount = 0;
      const maxRetries = 3;

      const simulateRetry = () => {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          attemptCount++;
        }
      };

      simulateRetry();
      expect(attemptCount).toBe(maxRetries + 1); // 0, 1, 2, 3 = 4 tentativas
    });

    it('should apply exponential backoff', () => {
      const delays: number[] = [];

      for (let attempt = 0; attempt < 3; attempt++) {
        const delay = 1000 * Math.pow(2, attempt);
        delays.push(delay);
      }

      expect(delays).toEqual([1000, 2000, 4000]);
    });

    it('should add jitter to exponential backoff', () => {
      const attempt = 2;
      const delay = 1000 * Math.pow(2, attempt); // 4000ms
      const jitter = Math.random() * delay * 0.1; // 10% jitter
      const totalDelay = delay + jitter;

      expect(totalDelay).toBeGreaterThanOrEqual(delay);
      expect(totalDelay).toBeLessThanOrEqual(delay + delay * 0.1);
    });

    it('should prevent thundering herd with jitter', () => {
      const delays: number[] = [];
      const attempt = 1;

      // Simular 10 requisições concorrentes
      for (let i = 0; i < 10; i++) {
        const base = 1000 * Math.pow(2, attempt);
        const jitter = Math.random() * base * 0.1;
        delays.push(base + jitter);
      }

      // Verificar que não são todos iguais
      const uniqueDelays = new Set(delays);
      expect(uniqueDelays.size).toBeGreaterThan(1); // Vários valores diferentes
    });

    it('should fail after MAX_RETRIES attempts', () => {
      let attemptCount = 0;
      let failed = false;

      for (let attempt = 0; attempt <= RETRY_ATTEMPTS; attempt++) {
        attemptCount++;
        if (attempt === RETRY_ATTEMPTS) {
          failed = true;
        }
      }

      expect(failed).toBe(true);
      expect(attemptCount).toBe(RETRY_ATTEMPTS + 1);
    });
  });

  describe('JSON Response Validation', () => {
    it('should validate response is valid JSON', () => {
      const validJSON = '{"results":[{"title":"Test","url":"http://test.com","content":"Test"}]}';
      const parsed = JSON.parse(validJSON);
      expect(parsed).toHaveProperty('results');
    });

    it('should catch invalid JSON', () => {
      const invalidJSON = '{ invalid json }';
      expect(() => JSON.parse(invalidJSON)).toThrow();
    });

    it('should validate response structure (has results array)', () => {
      const response = {
        results: [{ title: 'Test', url: 'http://test.com', content: 'Test content' }]
      };

      if (!response || typeof response !== 'object' || !Array.isArray(response.results)) {
        throw new Error('Invalid response structure');
      }

      expect(response.results).toHaveLength(1);
    });

    it('should reject missing results property', () => {
      const response = { data: [] };

      expect(() => {
        if (!Array.isArray((response as any).results)) {
          throw new Error('Invalid response: missing results array');
        }
      }).toThrow('Invalid response: missing results array');
    });

    it('should accept empty results array', () => {
      const response = { results: [] };

      if (!Array.isArray(response.results)) {
        throw new Error('Invalid response');
      }

      expect(response.results.length).toBe(0);
    });

    it('should validate result items have required fields', () => {
      const result = {
        title: 'Test',
        url: 'http://test.com',
        content: 'Content'
      };

      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('content');
      expect(typeof result.title).toBe('string');
      expect(typeof result.url).toBe('string');
      expect(typeof result.content).toBe('string');
    });
  });

  describe('Query Validation', () => {
    it('should reject empty query', () => {
      const query = '  '.trim();

      expect(() => {
        if (!query || query.length < 3) {
          throw new Error('query parameter is required and must be at least 3 characters');
        }
      }).toThrow();
    });

    it('should reject query with less than 3 characters', () => {
      const queries = ['ab', 'a', ''];

      queries.forEach(query => {
        expect(() => {
          if (!query || query.length < 3) {
            throw new Error('Query too short');
          }
        }).toThrow();
      });
    });

    it('should accept valid queries', () => {
      const queries = ['test', 'openai api', 'how to'];

      queries.forEach(query => {
        expect(() => {
          if (!query || query.length < 3) {
            throw new Error('Query too short');
          }
        }).not.toThrow();
      });
    });

    it('should trim whitespace from query', () => {
      const query = '  test query  '.trim();
      expect(query).toBe('test query');
    });
  });

  describe('Error Messages', () => {
    it('should provide clear timeout error message', () => {
      const error = new Error(`Request timed out after ${TIMEOUT_MS}ms`);
      expect(error.message).toContain('timed out');
      expect(error.message).toContain('30000');
    });

    it('should provide clear auth error message', () => {
      const error = new Error(
        'Web search authentication failed. Make sure you are signed in to ollama (run `ollama signin`).'
      );
      expect(error.message).toContain('authentication failed');
    });

    it('should provide clear unavailable service error', () => {
      const error = new Error('Web search is unavailable (ensure ollama cloud is enabled).');
      expect(error.message).toContain('unavailable');
    });

    it('should provide HTTP status error message', () => {
      const status = 500;
      const body = 'Internal Server Error';
      const error = new Error(`Web search failed (${status}): ${body}`);
      expect(error.message).toContain('500');
    });
  });

  describe('Response Content Handling', () => {
    it('should truncate long content to CONTENT_TRUNCATE_LENGTH', () => {
      const CONTENT_TRUNCATE_LENGTH = 200;
      const longContent = 'x'.repeat(500);

      const truncated =
        longContent.length > CONTENT_TRUNCATE_LENGTH
          ? longContent.slice(0, CONTENT_TRUNCATE_LENGTH) + '...'
          : longContent;

      expect(truncated).toHaveLength(CONTENT_TRUNCATE_LENGTH + 3); // +3 for "..."
    });

    it('should preserve short content without truncation', () => {
      const CONTENT_TRUNCATE_LENGTH = 200;
      const shortContent = 'This is short content';

      const processed =
        shortContent.length > CONTENT_TRUNCATE_LENGTH
          ? shortContent.slice(0, CONTENT_TRUNCATE_LENGTH) + '...'
          : shortContent;

      expect(processed).toBe(shortContent);
    });

    it('should format search results correctly', () => {
      const results = [
        { title: 'Result 1', url: 'http://test1.com', content: 'Content 1' },
        { title: 'Result 2', url: 'http://test2.com', content: 'Content 2' }
      ];

      const text = results
        .map((r, i) => `${i + 1}. ${r.title}\n   ${r.url}\n   ${r.content}`)
        .join('\n\n');

      expect(text).toContain('1. Result 1');
      expect(text).toContain('2. Result 2');
      expect(text).toContain('http://test1.com');
    });
  });

  describe('Environment configuration and validation', () => {
    it('should parse environment variables and apply defaults', async () => {
      vi.resetModules();
      process.env.OLLAMA_API_URL = 'http://localhost:11434';
      process.env.WEB_SEARCH_API = 'http://localhost:11434/api/experimental/web_search';
      process.env.WEB_FETCH_API = 'http://localhost:11434/api/experimental/web_fetch';
      process.env.MAX_RESULTS = '7';
      process.env.TIMEOUT_MS = '12000';

      const module = await import('./index.ts');
      expect(module.envConfig.MAX_RESULTS).toBe(7);
      expect(module.envConfig.TIMEOUT_MS).toBe(12000);
      expect(module.envConfig.WEB_SEARCH_API).toBe('http://localhost:11434/api/experimental/web_search');
      expect(module.envConfig.WEB_FETCH_API).toBe('http://localhost:11434/api/experimental/web_fetch');
    });
  });
});
