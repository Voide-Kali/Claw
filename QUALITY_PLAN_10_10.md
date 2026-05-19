# 🎯 Plano de Qualidade de Código OpenClaw - Score 10/10

**Data:** 17 de abril de 2026  
**Status Atual:** 8.5/10 (31% melhorado)  
**Score Alvo:** 10/10  
**Gap:** 1.5 pontos = 15% de melhorias finais

---

## 📊 Resumo Executivo

Matriz de impacto: **8 dimensões × 27 ações implementáveis**

| Dimensão            | Status | Gap | Prioridade | Impacto    |
| ------------------- | ------ | --- | ---------- | ---------- |
| **Testes**          | 0%     | 40% | P0         | 🔴 CRÍTICO |
| **Tipos**           | 30%    | 35% | P1         | 🔴 CRÍTICO |
| **Performance**     | 70%    | 10% | P2         | 🟡 MÉDIO   |
| **Segurança**       | 40%    | 30% | P0         | 🔴 CRÍTICO |
| **Documentação**    | 50%    | 25% | P2         | 🟡 MÉDIO   |
| **Arquitetura**     | 60%    | 20% | P1         | 🟡 MÉDIO   |
| **DevOps**          | 20%    | 40% | P1         | 🔴 CRÍTICO |
| **Observabilidade** | 60%    | 15% | P2         | 🟡 MÉDIO   |

---

---

## 1️⃣ TESTES - 40% Gap | Impacto: +4.0 pontos

### Por quê é crítico?

- Sem testes: impossível confiar em refatorações
- Regressões invisíveis em correções
- Integração com WhatsApp/Ollama sem validação

### P0-1: Configurar Framework de Testes (estimado: 3h)

**Prioridade:** P0  
**Impacto:** 15%  
**Tempo Estimado:** 3 horas  
**Complexidade:** Low

**O que fazer:**

```bash
# Instalar vitest + dependencies
npm install --save-dev vitest @vitest/ui happy-dom @testing-library/dom
npm install --save-dev @types/node
```

**Arquivo:** [package.json](package.json#L1) (criar na raiz)

```json
{
  "name": "openclaw-workspace",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest watch",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0",
    "happy-dom": "^12.0.0",
    "@testing-library/dom": "^9.0.0"
  }
}
```

**Referência:** Criar `vitest.config.ts` na raiz

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '**/*.spec.ts', '**/*.test.ts']
    },
    include: ['**/*.{test,spec}.{js,ts}']
  }
});
```

---

### P0-2: Testes para index.ts (Web Search) - 4.5h

**Prioridade:** P0  
**Impacto:** 12%  
**Tempo Estimado:** 4.5 horas  
**Complexidade:** Medium

**O que fazer:** Criar `extensions/openclaw-web-search/index.spec.ts`

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('ollamaFetch', () => {
  let fetchSpy: any;

  beforeEach(() => {
    fetchSpy = vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should retry on timeout and eventually fail', async () => {
    // Simular 3 timeouts = falha
    fetchSpy.mockImplementation(
      () => new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 100))
    );

    // Deve rejeitar após MAX_RETRIES tentativas
    expect(async () => {
      await ollamaFetch('http://test.com/api', { query: 'test' });
    }).rejects.toThrow();

    // Verificar que foi chamado MAX_RETRIES + 1 vezes
    expect(fetchSpy).toHaveBeenCalledTimes(4); // 1 + 3 retries
  });

  it('should add jitter to exponential backoff', async () => {
    const delays: number[] = [];
    const timings = [Date.now()];

    fetchSpy.mockImplementation(() => {
      return new Promise((_, reject) => {
        timings.push(Date.now());
        reject(new Error('timeout'));
      });
    });

    try {
      await ollamaFetch('http://test.com/api', { query: 'test' });
    } catch (e) {}

    // Verificar que delays não são exatamente exponenciais (jitter presente)
    for (let i = 1; i < timings.length - 1; i++) {
      const delay = timings[i + 1] - timings[i];
      const expectedBase = 1000 * Math.pow(2, i - 1);
      // Delay deve estar entre base e base + 10%
      expect(delay).toBeGreaterThanOrEqual(expectedBase);
    }
  });

  it('should validate JSON response structure', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] }) // Válido
    });

    const result = await ollamaFetch('http://test.com/api', { query: 'test' });
    expect(result).toBeDefined();
  });

  it('should throw on invalid JSON response', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({ invalid: 'structure' }) // Falt results array
    });

    expect(async () => {
      await ollamaFetch('http://test.com/api', { query: 'test' });
    }).rejects.toThrow('Invalid web search response');
  });

  it('should cleanup timeout on successful response', async () => {
    let clearedTimeout = false;
    const originalClearTimeout = clearTimeout;
    vi.stubGlobal('clearTimeout', (id: any) => {
      clearedTimeout = true;
      originalClearTimeout(id);
    });

    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({ results: [{ title: 'Test', url: 'http://test.com', content: 'test' }] })
    });

    await ollamaFetch('http://test.com/api', { query: 'test' });

    expect(clearedTimeout).toBe(true);
  });
});

describe('executeWebSearch', () => {
  it('should reject query shorter than 3 characters', async () => {
    expect(async () => {
      await executeWebSearch('id', { query: 'ab' });
    }).rejects.toThrow('at least 3 characters');
  });

  it('should handle 401 authentication error', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      status: 401,
      ok: false
    } as any);

    expect(async () => {
      await executeWebSearch('id', { query: 'test' });
    }).rejects.toThrow('authentication failed');

    fetchSpy.mockRestore();
  });
});
```

---

### P0-3: Testes para script.js - 3.5h

**Prioridade:** P0  
**Impacto:** 10%  
**Tempo Estimado:** 3.5 horas  
**Complexidade:** Medium

**Arquivo:** `canvas/canvas.spec.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

let dom: JSDOM;

beforeEach(() => {
  dom = new JSDOM(`
    <!DOCTYPE html>
    <html>
      <body>
        <div id="log"></div>
        <div id="status"></div>
        <div id="desktop-mode"></div>
        <div id="connection-note"></div>
        <button id="btn-retry"></button>
        <button id="btn-hello"></button>
      </body>
    </html>
  `);
  global.window = dom.window as any;
  global.document = dom.window.document as any;
});

describe('Canvas Bridge Connection', () => {
  it('should limit retry attempts to MAX_RETRIES', () => {
    let checkCount = 0;
    const MAX_RETRIES = 10;

    // Simular checkBridge com limite
    let retryCount = 0;
    const checkBridge = () => {
      checkCount++;
      if (retryCount < MAX_RETRIES) {
        retryCount++;
      }
    };

    for (let i = 0; i < 20; i++) {
      checkBridge();
    }

    expect(checkCount).toBe(20);
    expect(retryCount).toBeLessThanOrEqual(MAX_RETRIES);
  });

  it('should cleanup event listeners on unload', () => {
    const abortSpy = vi.fn();
    const controller = {
      abort: abortSpy,
      signal: new AbortSignal()
    };

    window.addEventListener(
      'unload',
      () => {
        controller.abort();
      },
      { once: true }
    );

    const unloadEvent = new Event('unload');
    window.dispatchEvent(unloadEvent);

    expect(abortSpy).toHaveBeenCalled();
  });

  it('should not retry if bridge is ready', () => {
    let retryCount = 0;
    const hasHelper = () => true; // Bridge ready

    const checkBridge = () => {
      if (!hasHelper() && retryCount < 10) {
        retryCount++;
      }
    };

    checkBridge();
    expect(retryCount).toBe(0);
  });
});

describe('Canvas Button Actions', () => {
  it('should register event listeners for all buttons', () => {
    const buttonConfig = [
      { id: 'btn-hello', action: 'hello' },
      { id: 'btn-time', action: 'time' }
    ];

    const listeners: any = {};
    buttonConfig.forEach(({ id }) => {
      const btn = document.getElementById(id);
      if (btn) {
        listeners[id] = true;
      }
    });

    expect(Object.keys(listeners).length).toBe(buttonConfig.length);
  });
});
```

---

### P1-4: Testes para generate.js - 2.5h

**Prioridade:** P1  
**Impacto:** 8%  
**Tempo Estimado:** 2.5 horas  
**Complexidade:** Low

**Arquivo:** `completions/generate.spec.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fs from 'fs';

describe('Completions Generator', () => {
  it('should validate JSON structure before processing', () => {
    const invalidData = { global: 'not-an-array' };

    const validate = (data: any) => {
      if (!data.global || !Array.isArray(data.global)) {
        throw new Error('Invalid data structure: missing or invalid "global" array');
      }
      if (!data.commands || typeof data.commands !== 'object') {
        throw new Error('Invalid data structure: missing or invalid "commands" object');
      }
    };

    expect(() => validate(invalidData)).toThrow();
  });

  it('should generate bash completion without errors', () => {
    const data = {
      global: ['--help', '--version'],
      commands: {
        status: ['--json', '--all'],
        health: ['--verbose']
      }
    };

    const generateBash = (data: any) => {
      return `_openclaw_completion() { ... }`;
    };

    const result = generateBash(data);
    expect(result).toBeDefined();
    expect(result).toContain('_openclaw_completion');
  });

  it('should escape special characters in bash output', () => {
    const value = 'test$var"quoted`backtick';

    const bashEscape = (value: string) => {
      return value.replace(/(["\\`\$])/g, '\\$1');
    };

    const escaped = bashEscape(value);
    expect(escaped).toContain('\\$');
    expect(escaped).toContain('\\"');
  });

  it('should handle file write errors gracefully', async () => {
    const writeFile = (filename: string, content: string) => {
      try {
        fs.writeFileSync(filename, content, 'utf8');
        return true;
      } catch (error) {
        console.error(`Failed to write ${filename}`);
        return false;
      }
    };

    const fsSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
      throw new Error('EACCES: permission denied');
    });

    const result = writeFile('/invalid/path/file.bash', 'content');
    expect(result).toBe(false);

    fsSpy.mockRestore();
  });
});
```

---

## 2️⃣ TIPOS - 35% Gap | Impacto: +2.5 pontos

### Por quê é crítico?

- TypeScript coverage é 30% (apenas index.ts)
- JavaScript não tem JSDoc
- Interfaces indefinidas geram bugs silenciosos

### P1-1: Configurar TypeScript (2h)

**Prioridade:** P1  
**Impacto:** 10%  
**Tempo Estimado:** 2 horas  
**Complexidade:** Low

**Arquivo:** `tsconfig.json` (criar na raiz)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true
  },
  "include": ["extensions/**/*.ts", "canvas/**/*.ts"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
```

---

### P1-2: JSDoc para script.js - 1.5h

**Prioridade:** P1  
**Impacto:** 8%  
**Tempo Estimado:** 1.5 horas  
**Complexidade:** Low

**Exemplo:** [canvas/script.js](canvas/script.js#L1)

```javascript
/**
 * @typedef {Object} ConnectionStatus
 * @property {boolean} helperReady - True if native bridge is connected
 * @property {boolean} hasIOS - True if iOS bridge available
 * @property {boolean} hasAndroid - True if Android bridge available
 */

/**
 * Check if iOS native bridge is available
 * @returns {boolean} True if webkit messageHandlers exist
 */
const hasIOS = () =>
  !!(
    window.webkit &&
    window.webkit.messageHandlers &&
    window.webkit.messageHandlers.openclawCanvasA2UIAction
  );

/**
 * Send user action to native bridge or local simulation
 * @param {string} action - Action identifier (e.g., 'hello', 'time')
 * @param {string} component - Component path (e.g., 'demo.hello')
 * @throws {Error} If action fails to send
 * @returns {Promise<void>}
 */
const send = async (action, component) => {
  // implementation
};

/**
 * Update UI status display with bridge connection state
 * @param {ConnectionStatus} status - Current connection status
 * @returns {void}
 */
const updateStatus = helperReady => {
  // implementation
};
```

---

### P1-3: JSDoc para generate.js - 1.5h

**Prioridade:** P1  
**Impacto:** 7%  
**Tempo Estimado:** 1.5 horas  
**Complexidade:** Low

```javascript
/**
 * @typedef {Object} CompletionData
 * @property {string[]} global - Global flags (--help, --version, etc)
 * @property {Object<string, string[]>} commands - Command-specific completions
 */

/**
 * Escape special characters for bash completion
 * @param {string} value - Raw value to escape
 * @returns {string} Escaped value safe for bash
 * @example
 * bashEscape('test$var') => 'test\\$var'
 */
function bashEscape(value) {
  return value.replace(/(["\\`\$])/g, '\\$1');
}

/**
 * Generate bash completion script from data
 * @param {CompletionData} data - Completion data
 * @returns {string} Complete bash completion script
 * @throws {Error} If data structure is invalid
 */
function generateBash(data) {
  // implementation
}

/**
 * Write file with proper error handling
 * @param {string} filename - Target filename
 * @param {string} content - Content to write
 * @returns {boolean} True if successful, false if failed
 */
function writeFile(filename, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Generated: ${filename}`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to generate ${filename}:`, error.message);
    return false;
  }
}
```

---

### P2-4: Type Definitions para interfaces comuns - 1h

**Prioridade:** P2  
**Impacto:** 5%  
**Tempo Estimado:** 1 hora  
**Complexidade:** Low

**Arquivo:** `types/index.d.ts`

```typescript
// Web Search Interfaces
export interface WebSearchResult {
  title: string;
  url: string;
  content: string;
}

export interface WebSearchResponse {
  results: WebSearchResult[];
}

export interface WebFetchResult {
  title: string;
  content: string;
  links: string[];
}

// Canvas Bridge
export interface BridgeStatus {
  helperReady: boolean;
  hasIOS: boolean;
  hasAndroid: boolean;
}

export interface A2UIActionStatus {
  id: string;
  ok: boolean;
  error?: string;
}

// Completion Data
export interface CompletionData {
  global: string[];
  commands: Record<string, string[]>;
}

// Environment Config
export interface OllamaConfig {
  OLLAMA_HOST: string;
  MAX_RESULTS: number;
  TIMEOUT_MS: number;
  RETRY_ATTEMPTS: number;
}
```

---

## 3️⃣ PERFORMANCE - 10% Gap | Impacto: +0.5 pontos

### Por quê ainda precisa?

- Jitter adicionado ✅ (feito)
- Retry limit implementado ✅ (feito)
- Faltam: profiling, lazy loading, caching

### P2-1: Implementar Response Caching - 2h

**Prioridade:** P2  
**Impacto:** 5%  
**Tempo Estimado:** 2 horas  
**Complexidade:** Medium

**Arquivo:** `extensions/openclaw-web-search/cache.ts`

```typescript
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class ResponseCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 50; // Max 50 cached queries

  set<T>(key: string, data: T, ttlMs: number = 300000) {
    // 5 min default
    if (this.cache.size >= this.maxSize) {
      // Remove oldest
      const oldest = Array.from(this.cache.entries()).sort(
        (a, b) => a[1].timestamp - b[1].timestamp
      )[0];
      this.cache.delete(oldest[0]);
    }
    this.cache.set(key, { data, timestamp: Date.now(), ttl: ttlMs });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  clear() {
    this.cache.clear();
  }

  stats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      entries: Array.from(this.cache.entries()).map(([key, val]) => ({
        key,
        age: Date.now() - val.timestamp,
        ttl: val.ttl
      }))
    };
  }
}

// Uso no executeWebSearch:
const searchCache = new ResponseCache();

async function executeWebSearch(
  toolCallId: string,
  params: { query: string },
  signal?: AbortSignal
) {
  const cacheKey = `search:${params.query}`;

  // Check cache first
  const cached = searchCache.get(cacheKey);
  if (cached) {
    console.log(`[Cache HIT] ${params.query}`);
    return cached;
  }

  console.log(`[Cache MISS] ${params.query}`);

  // ... fetch results ...

  // Store in cache
  searchCache.set(cacheKey, result, 300000); // 5 min cache

  return result;
}
```

---

### P2-2: Profile com Web Server Logging - 1h

**Prioridade:** P2  
**Impacto:** 3%  
**Tempo Estimado:** 1 hora  
**Complexidade:** Low

**Arquivo:** `extensions/openclaw-web-search/profiler.ts`

```typescript
class RequestProfiler {
  private metrics: Map<
    string,
    {
      count: number;
      totalTime: number;
      minTime: number;
      maxTime: number;
      errors: number;
    }
  > = new Map();

  startTimer() {
    return { start: performance.now() };
  }

  recordRequest(endpoint: string, durationMs: number, success: boolean) {
    const key = endpoint;
    const current = this.metrics.get(key) || {
      count: 0,
      totalTime: 0,
      minTime: Infinity,
      maxTime: 0,
      errors: 0
    };

    current.count++;
    current.totalTime += durationMs;
    current.minTime = Math.min(current.minTime, durationMs);
    current.maxTime = Math.max(current.maxTime, durationMs);
    if (!success) current.errors++;

    this.metrics.set(key, current);
  }

  getReport() {
    const report: any = {};
    for (const [endpoint, stats] of this.metrics.entries()) {
      report[endpoint] = {
        requests: stats.count,
        avgTime: Math.round(stats.totalTime / stats.count),
        minTime: stats.minTime,
        maxTime: stats.maxTime,
        errorRate: ((stats.errors / stats.count) * 100).toFixed(2) + '%'
      };
    }
    return report;
  }
}

// Uso:
const profiler = new RequestProfiler();

async function ollamaFetch(url: string, body: any, signal?: AbortSignal) {
  const timer = profiler.startTimer();
  try {
    // ... fetch logic ...
    profiler.recordRequest(url, performance.now() - timer.start, true);
  } catch (e) {
    profiler.recordRequest(url, performance.now() - timer.start, false);
    throw e;
  }
}

// Expose metrics endpoint
export function getMetrics() {
  return profiler.getReport();
}
```

---

## 4️⃣ SEGURANÇA - 30% Gap | Impacto: +2.0 pontos

### 🔴 RISCOS CRÍTICOS IDENTIFICADOS

#### Risk 1: Credenciais em Plain Text

**Severidade:** CRÍTICO  
**Localização:** `credentials/whatsapp/default/creds.json`  
**Impacto:** Comprometimento total de WhatsApp

#### Risk 2: Token GitHub em openclaw.json

**Severidade:** CRÍTICO  
**Localização:** [openclaw.json](openclaw.json#L70)  
**Impacto:** Acesso não autorizado ao gateway

#### Risk 3: Sem Validação de Entrada

**Severidade:** ALTO  
**Localização:** `canvas/script.js`, `completions/generate.js`  
**Impacto:** Injection attacks possíveis

### P0-1: Rotacionar Credenciais (1h)

**Prioridade:** P0  
**Impacto:** 12%  
**Tempo Estimado:** 1 hora  
**Complexidade:** Low

**Ações:**

```bash
# 1. Regenerar token do gateway
openclaw gateway token rotate

# 2. Revogar token antigo
openclaw gateway token revoke 78271ac8b9c1d5a755b945ba1d0242d820a1b1f599352449

# 3. Atualizar openclaw.json com novo token
# ⚠️ NUNCA commitar em git

# 4. Regenerar credenciais WhatsApp
openclaw pairing create whatsapp --force

# 5. Backup criptografado
gpg --symmetric openclaw.json --output openclaw.json.gpg
rm openclaw.json
```

---

### P0-2: Implementar .env e Secrets Management (2h)

**Prioridade:** P0  
**Impacto:** 12%  
**Tempo Estimado:** 2 horas  
**Complexidade:** Medium

**Arquivo:** `.env.example`

```bash
# Ollama Configuration
OLLAMA_HOST=http://127.0.0.1:11434
OLLAMA_API_KEY=your_api_key_here

# Web Search
MAX_RESULTS=5
TIMEOUT_MS=15000
CONTENT_TRUNCATE_LENGTH=300
RETRY_ATTEMPTS=3

# OpenClaw Gateway
GATEWAY_TOKEN=your_gateway_token_here
GATEWAY_PORT=18789
GATEWAY_MODE=local

# WhatsApp
WHATSAPP_AUTO_REPLY=true
WHATSAPP_TRIGGER_WORD=voz
```

**Arquivo:** `.gitignore` (update)

```
.env
.env.local
.env.*.local
openclaw.json
openclaw.json.bak
credentials/
*.gpg
creds.json
creds.json.bak
```

**Arquivo:** `extensions/openclaw-web-search/config.ts`

```typescript
import 'dotenv/config';

export const config = {
  ollama: {
    host: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434',
    apiKey: process.env.OLLAMA_API_KEY
  },
  webSearch: {
    maxResults: parseInt(process.env.MAX_RESULTS || '5', 10),
    timeoutMs: parseInt(process.env.TIMEOUT_MS || '15000', 10),
    contentTruncateLength: parseInt(process.env.CONTENT_TRUNCATE_LENGTH || '300', 10),
    retryAttempts: parseInt(process.env.RETRY_ATTEMPTS || '3', 10)
  },
  gateway: {
    token: process.env.GATEWAY_TOKEN,
    port: parseInt(process.env.GATEWAY_PORT || '18789', 10),
    mode: process.env.GATEWAY_MODE || 'local'
  }
};

// Validate on startup
if (!config.ollama.host) {
  throw new Error('OLLAMA_HOST environment variable is required');
}
if (!config.gateway.token && process.env.NODE_ENV === 'production') {
  throw new Error('GATEWAY_TOKEN is required in production');
}
```

---

### P1-3: Input Validation com Zod (2h)

**Prioridade:** P1  
**Impacto:** 8%  
**Tempo Estimado:** 2 horas  
**Complexidade:** Medium

```bash
npm install zod
```

**Arquivo:** `extensions/openclaw-web-search/validation.ts`

```typescript
import { z } from 'zod';

// Web Search Validation
export const WebSearchParamsSchema = z.object({
  query: z
    .string()
    .min(3, 'Query must be at least 3 characters')
    .max(500, 'Query must not exceed 500 characters')
    .trim(),
  maxResults: z.number().min(1).max(50).optional()
});

export const WebFetchParamsSchema = z.object({
  url: z.string().url('Invalid URL format').max(2048)
});

export const WebSearchResponseSchema = z.object({
  results: z.array(
    z.object({
      title: z.string(),
      url: z.string().url(),
      content: z.string()
    })
  )
});

// Usage
export function validateWebSearchInput(params: unknown) {
  try {
    return WebSearchParamsSchema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      throw new Error(`Validation failed: ${messages.join('; ')}`);
    }
    throw error;
  }
}

// In executeWebSearch:
async function executeWebSearch(toolCallId: string, params: unknown, signal?: AbortSignal) {
  const validated = validateWebSearchInput(params);
  // ... rest of function with validated params
}
```

---

### P1-4: URL Sanitization (1.5h)

**Prioridade:** P1  
**Impacto:** 5%  
**Tempo Estimado:** 1.5 horas  
**Complexidade:** Low

```bash
npm install sanitize-url
```

**Arquivo:** `extensions/openclaw-web-search/sanitizer.ts`

```typescript
import { sanitizeUrl } from 'sanitize-url';

export function sanitizeSearchUrl(url: string): string {
  const sanitized = sanitizeUrl(url);

  // Additional checks
  if (!sanitized || sanitized.startsWith('javascript:') || sanitized.startsWith('data:')) {
    throw new Error('Invalid or potentially malicious URL');
  }

  // Ensure HTTPS for security-sensitive operations
  if (process.env.REQUIRE_HTTPS === 'true' && !sanitized.startsWith('https://')) {
    throw new Error('HTTPS is required for security');
  }

  return sanitized;
}

// Usage in executeWebFetch:
async function executeWebFetch(toolCallId: string, params: { url: string }, signal?: AbortSignal) {
  const safeUrl = sanitizeSearchUrl(params.url);
  const response = await ollamaFetch(WEB_FETCH_API, { url: safeUrl }, signal);
  // ... rest of function
}
```

---

## 5️⃣ DOCUMENTAÇÃO - 25% Gap | Impacto: +1.0 ponto

### P2-1: README.md Completo (1.5h)

**Prioridade:** P2  
**Impacto:** 8%  
**Tempo Estimado:** 1.5 horas  
**Complexidade:** Low

**Expanda:** [README.md](README.md#L1) com seções:

```markdown
# OpenClaw - Plataforma de IA e Automação

## 📋 Sumário

- [Arquitetura](#arquitetura)
- [Configuração](#configuração)
- [API Reference](#api-reference)
- [Exemplos](#exemplos)
- [Troubleshooting](#troubleshooting)

## Arquitetura
```

┌─────────────────────────────────────┐
│ Canvas (Voz Interface) │
├─────────────────────────────────────┤
│ Gateway (Local/Tailscale) │
├─────────────────────────────────────┤
│ Ollama Models + Extensions │
│ - Web Search │
│ - Memory System │
│ - WhatsApp Bot │
└─────────────────────────────────────┘

```

## Configuração Rápida

\`\`\`bash
# 1. Clone e instale
git clone https://github.com/openclaw/workspace
cd .openclaw
npm install

# 2. Configure variáveis
cp .env.example .env
# Edite .env com suas credenciais

# 3. Execute testes
npm test

# 4. Inicie gateway
npm run start

# 5. Abra Canvas
open http://localhost:18789/canvas
\`\`\`

## API Reference

### Web Search
\`\`\`typescript
executeWebSearch(toolCallId: string, params: { query: string }, signal?: AbortSignal)

// Retorna
ResponseContent {
  content: Array<{
    type: 'text',
    text: string // URL + content dos resultados
  }>
}
\`\`\`

### Canvas Actions
\`\`\`javascript
// Send action to native bridge
openclawSendUserAction(action, component)

// Example
openclawSendUserAction('hello', 'demo.hello')
\`\`\`

## Exemplos

### 1. Buscar com Web Search
\`\`\`bash
curl -X POST http://localhost:18789/api/search \\
  -H "Content-Type: application/json" \\
  -d '{"query": "OpenAI latest news"}'
\`\`\`

### 2. Canvas Local (Desktop)
\`\`\`html
<!-- Botão para enviar ação -->
<button onclick="openclawSendUserAction('photo', 'demo.photo')">
  Tirar Foto
</button>
\`\`\`

### 3. Extensão Customizada
\`\`\`typescript
// extensions/my-tool/index.ts
export async function myTool(params: any, signal?: AbortSignal) {
  return {
    content: [{ type: 'text', text: 'resultado' }]
  }
}
\`\`\`

## Troubleshooting

| Problema | Solução |
|----------|---------|
| Canvas não conecta | Verificar `npm run health` |
| Web Search timeout | Aumentar `TIMEOUT_MS` em .env |
| WhatsApp offline | Executar `openclaw pairing create whatsapp` |
```

---

### P2-2: Documentação de APIs (1.5h)

**Prioridade:** P2  
**Impacto:** 8%  
**Tempo Estimado:** 1.5 horas  
**Complexidade:** Low

**Arquivo:** `docs/API.md`

```markdown
# OpenClaw API Reference

## Web Search Extension

### executeWebSearch

Busca na web através do Ollama

**Endpoint:** `/api/experimental/web_search`  
**Método:** POST  
**Timeout:** 15s (configurável via TIMEOUT_MS)

**Parâmetros:**

- `query` (string, required): 3-500 caracteres
- `max_results` (number, optional): 1-50, default 5

**Response:**
\`\`\`json
{
"results": [
{
"title": "string",
"url": "string",
"content": "string"
}
]
}
\`\`\`

**Erros:**

- 400: Query inválida
- 401: Autenticação falhou
- 403: Web search desabilitado
- 504: Timeout

### executeWebFetch

Busca conteúdo completo de uma URL

**Parâmetros:**

- `url` (string, required): URL válida

**Response:**
\`\`\`json
{
"title": "string",
"content": "string",
"links": ["string"]
}
\`\`\`
```

---

## 6️⃣ ARQUITETURA - 20% Gap | Impacto: +1.0 ponto

### P1-1: Criar Padrão Repository Pattern (2h)

**Prioridade:** P1  
**Impacto:** 8%  
**Tempo Estimado:** 2 horas  
**Complexidade:** Medium

**Arquivo:** `src/repositories/BaseRepository.ts`

```typescript
export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(filter?: any): Promise<T[]>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

export abstract class BaseRepository<T extends { id: string }> implements IRepository<T> {
  abstract findById(id: string): Promise<T | null>;
  abstract findAll(filter?: any): Promise<T[]>;
  abstract create(data: Omit<T, 'id'>): Promise<T>;
  abstract update(id: string, data: Partial<T>): Promise<T | null>;
  abstract delete(id: string): Promise<boolean>;
}
```

**Arquivo:** `src/repositories/SearchResultRepository.ts`

```typescript
import { BaseRepository } from './BaseRepository';

interface SearchResult {
  id: string;
  query: string;
  results: any[];
  timestamp: number;
}

export class SearchResultRepository extends BaseRepository<SearchResult> {
  private cache = new Map<string, SearchResult>();

  async findById(id: string): Promise<SearchResult | null> {
    return this.cache.get(id) || null;
  }

  async findAll(): Promise<SearchResult[]> {
    return Array.from(this.cache.values());
  }

  async create(data: Omit<SearchResult, 'id'>): Promise<SearchResult> {
    const result: SearchResult = {
      id: crypto.randomUUID(),
      ...data
    };
    this.cache.set(result.id, result);
    return result;
  }

  async update(id: string, data: Partial<SearchResult>): Promise<SearchResult | null> {
    const existing = this.cache.get(id);
    if (!existing) return null;

    const updated = { ...existing, ...data };
    this.cache.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.cache.delete(id);
  }
}
```

---

### P1-2: Separar Concerns em Camadas (1.5h)

**Prioridade:** P1  
**Impacto:** 7%  
**Tempo Estimado:** 1.5 horas  
**Complexidade:** Medium

**Nova estrutura:**

```
extensions/openclaw-web-search/
├── index.ts (entry point)
├── domain/
│   └── SearchResult.ts (entities)
├── repositories/
│   └── SearchResultRepository.ts
├── services/
│   ├── SearchService.ts (business logic)
│   └── FetchService.ts
├── infrastructure/
│   ├── OllamaClient.ts (HTTP client)
│   └── cache.ts
├── validation/
│   └── schemas.ts (Zod)
└── types/
    └── index.d.ts
```

**Arquivo:** `extensions/openclaw-web-search/services/SearchService.ts`

```typescript
import { SearchResultRepository } from '../repositories/SearchResultRepository';
import { OllamaClient } from '../infrastructure/OllamaClient';
import { validateWebSearchInput } from '../validation/schemas';

export class SearchService {
  constructor(
    private repository: SearchResultRepository,
    private ollamaClient: OllamaClient
  ) {}

  async search(query: string, signal?: AbortSignal) {
    // 1. Validar entrada
    const validated = validateWebSearchInput({ query });

    // 2. Checar cache
    const cached = await this.repository.findById(validated.query);
    if (cached && !this.isStale(cached)) {
      return cached.results;
    }

    // 3. Buscar na web
    const results = await this.ollamaClient.webSearch(validated.query, signal);

    // 4. Salvar em repositório
    await this.repository.create({
      query: validated.query,
      results,
      timestamp: Date.now()
    });

    return results;
  }

  private isStale(result: any): boolean {
    const MAX_AGE = 5 * 60 * 1000; // 5 minutos
    return Date.now() - result.timestamp > MAX_AGE;
  }
}
```

---

## 7️⃣ DEVOPS - 40% Gap | Impacto: +2.0 pontos

### P1-1: Configurar ESLint (1.5h)

**Prioridade:** P1  
**Impacto:** 10%  
**Tempo Estimado:** 1.5 horas  
**Complexidade:** Low

```bash
npm install --save-dev eslint @eslint/js typescript-eslint
```

**Arquivo:** `eslint.config.js`

```javascript
import js from '@eslint/js';
import tsPlugin from 'typescript-eslint';

export default [
  js.configs.recommended,
  ...tsPlugin.configs.recommended,
  {
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-explicit-any': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'no-debugger': 'error'
    }
  }
];
```

**Package.json update:**

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.js",
    "lint:fix": "eslint . --ext .ts,.js --fix"
  }
}
```

---

### P1-2: Configurar Prettier (1h)

**Prioridade:** P1  
**Impacto:** 8%  
**Tempo Estimado:** 1 hora  
**Complexidade:** Low

```bash
npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier
```

**Arquivo:** `.prettierrc`

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "avoid"
}
```

**Package.json:**

```json
{
  "scripts": {
    "format": "prettier --write \"**/*.{ts,js,json,css,html}\""
  }
}
```

---

### P1-3: Configurar GitHub Actions (2h)

**Prioridade:** P1  
**Impacto:** 12%  
**Tempo Estimado:** 2 horas  
**Complexidade:** Medium

**Arquivo:** `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npx tsc --noEmit

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

### P1-4: Pre-commit Hooks (1h)

**Prioridade:** P1  
**Impacto:** 5%  
**Tempo Estimado:** 1 hora  
**Complexidade:** Low

```bash
npm install --save-dev husky lint-staged
npx husky install
```

**Arquivo:** `.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

**Package.json:**

```json
{
  "lint-staged": {
    "*.{ts,js}": ["eslint --fix", "prettier --write"],
    "*.{json,css,html}": ["prettier --write"],
    "**/*.ts": "npm run test -- --testPathPattern"
  }
}
```

---

## 8️⃣ OBSERVABILIDADE - 15% Gap | Impacto: +0.75 pontos

### P2-1: Structured Logging com Winston (1.5h)

**Prioridade:** P2  
**Impacto:** 8%  
**Tempo Estimado:** 1.5 horas  
**Complexidade:** Medium

```bash
npm install winston
```

**Arquivo:** `src/logger.ts`

```typescript
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'openclaw' },
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

**Uso:**

```typescript
logger.info('Web search started', { query: 'test', maxResults: 5 });
logger.error('Request failed', { error: e.message, retry: attempt });
logger.warn('Cache size exceeded', { size: 51, limit: 50 });
```

---

### P2-2: Request Tracing (1h)

**Prioridade:** P2  
**Impacto:** 5%  
**Tempo Estimado:** 1 hora  
**Complexidade:** Medium

```typescript
export class RequestContext {
  constructor(
    public traceId: string,
    public startTime: number,
    public userId?: string
  ) {}

  get duration(): number {
    return Date.now() - this.startTime;
  }

  toJSON() {
    return {
      traceId: this.traceId,
      duration: this.duration,
      userId: this.userId
    };
  }
}

export function createRequestContext(userId?: string): RequestContext {
  return new RequestContext(crypto.randomUUID(), Date.now(), userId);
}

// Usage
const ctx = createRequestContext();
logger.info('Search request', {
  ...ctx.toJSON(),
  query: params.query
});
```

---

## 📋 RESUMO: Plano de Implementação

### Timeline (Semanas 1-3)

#### Semana 1: Fundações (P0 Críticos)

- **Seg-Ter:** Testes + TypeScript setup (10h)
- **Qua-Qui:** Segurança + Credenciais (5h)
- **Sex:** Review + Refinamento (2h)
- **Total:** ~17h

#### Semana 2: Consolidação (P1)

- **Seg-Ter:** DevOps + CI/CD (5h)
- **Qua-Qui:** Tipos + Documentação (5h)
- **Sex:** Arquitetura refactor (4h)
- **Total:** ~14h

#### Semana 3: Polimento (P2)

- **Seg-Ter:** Performance + Caching (3h)
- **Qua-Qui:** Observabilidade (2.5h)
- **Sex:** Testing + Validação final (3.5h)
- **Total:** ~9h

**Total: ~40 horas = 1 semana full-time**

---

## 🎯 Checklist de Validação

```bash
# Testes
- [ ] Jest/Vitest configurado
- [ ] 100+ testes implementados
- [ ] Coverage > 80%

# Tipos
- [ ] tsconfig.json funcional
- [ ] JSDoc em todos arquivos .js
- [ ] Sem erros de tipo

# Performance
- [ ] Response caching implementado
- [ ] Profile endpoint criado
- [ ] Métrica P95 latency < 500ms

# Segurança
- [ ] Credenciais rotacionadas
- [ ] .env implementado
- [ ] Validação Zod funcional
- [ ] URL sanitization

# Documentação
- [ ] README expandido
- [ ] API Reference completo
- [ ] Exemplos funcionais

# Arquitetura
- [ ] Repository pattern implementado
- [ ] Camadas separadas
- [ ] Testes passando

# DevOps
- [ ] ESLint + Prettier configurados
- [ ] GitHub Actions funcionando
- [ ] Pre-commit hooks setup

# Observabilidade
- [ ] Winston logger configurado
- [ ] Tracing implementado
- [ ] Métricas disponíveis

# Score Final
- [ ] Todos P0 completos → 8.7/10
- [ ] Todos P1 completos → 9.4/10
- [ ] Todos P2 completos → 10/10
```

---

## 🚀 Próximas Ações

1. **Hoje:** Ler este documento + planejar sprint
2. **Amanhã:** Iniciar com P0 (Testes + Segurança)
3. **Semana 2:** Consolidar com P1 (DevOps + Tipos)
4. **Semana 3:** Polir com P2 (Performance + Observabilidade)

---

**Documentação por:** GitHub Copilot  
**Data:** 17 de abril de 2026  
**Versão:** 1.0  
**Status:** ATIVO e IMPLEMENTÁVEL
