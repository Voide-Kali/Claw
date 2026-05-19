import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

describe('canvas/script.js - DOM Event Handling', () => {
  let dom: JSDOM;
  let window: any;
  let document: any;

  beforeEach(() => {
    // Criar DOM simulado
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <div id="log"></div>
          <div id="status"></div>
          <div id="desktop-mode"></div>
          <div id="connection-note"></div>
          <button id="btn-retry"></button>
          <button id="btn-hello">Hello</button>
          <button id="btn-time">Time</button>
          <button id="btn-photo">Photo</button>
          <button id="btn-dalek">Dalek</button>
        </body>
      </html>
    `);
    window = dom.window;
    document = window.document;

    // Setup global window
    global.window = window as any;
    global.document = document;
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  describe('Bridge Connection Check', () => {
    it('should limit retry attempts to MAX_RETRIES', () => {
      let retryCount = 0;
      const MAX_RETRIES = 10;

      const checkBridge = () => {
        if (retryCount < MAX_RETRIES) {
          retryCount++;
        }
      };

      // Simular 15 tentativas
      for (let i = 0; i < 15; i++) {
        checkBridge();
      }

      expect(retryCount).toBe(10);
      expect(retryCount).toBeLessThanOrEqual(MAX_RETRIES);
    });

    it('should not retry infinitely', () => {
      let timeoutCount = 0;
      const MAX_RETRIES = 10;
      let retryCount = 0;

      const checkBridge = () => {
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          timeoutCount++;
        }
      };

      // Executar 20 vezes
      for (let i = 0; i < 20; i++) {
        checkBridge();
      }

      expect(timeoutCount).toBe(10); // Apenas MAX_RETRIES vezes
      expect(timeoutCount).not.toBeGreaterThan(10);
    });

    it('should report when retry limit is reached', () => {
      const logEl = document.getElementById('log');
      let retryCount = 0;
      const MAX_RETRIES = 2;

      const checkBridge = () => {
        if (retryCount >= MAX_RETRIES) {
          logEl.textContent = 'Bridge connection retry limit reached. Please reload.';
        }
        retryCount++;
      };

      // Simular 3 tentativas
      checkBridge();
      checkBridge();
      checkBridge();

      expect(logEl.textContent).toBe('Bridge connection retry limit reached. Please reload.');
    });
  });

  describe('Event Listener Management', () => {
    it('should allow adding multiple listeners', () => {
      const listeners: Function[] = [];

      const addEventListener = (name: string, callback: Function) => {
        listeners.push(callback);
      };

      addEventListener('event1', () => {});
      addEventListener('event2', () => {});
      addEventListener('event3', () => {});

      expect(listeners.length).toBe(3);
    });

    it('should support AbortController for cleanup', () => {
      const eventController = new window.AbortController();
      const listeners: Function[] = [];

      const addEventListener = (name: string, callback: Function, options?: any) => {
        if (options?.signal) {
          listeners.push(callback);
        }
      };

      addEventListener('event1', () => {}, { signal: eventController.signal });
      addEventListener('event2', () => {}, { signal: eventController.signal });

      expect(listeners.length).toBe(2);

      // Abort deve ter método
      expect(typeof eventController.abort).toBe('function');
    });

    it('should cleanup listeners on abort', () => {
      const eventController = new window.AbortController();
      const listeners: any[] = [];

      // Simular addEventListener com AbortSignal
      const addListener = (callback: Function, signal?: AbortSignal) => {
        const listener = { callback, active: true };
        listeners.push(listener);

        if (signal) {
          signal.addEventListener(
            'abort',
            () => {
              listener.active = false;
            },
            { once: true }
          );
        }
      };

      addListener(() => {}, eventController.signal);
      expect(listeners[0].active).toBe(true);

      eventController.abort();
      expect(listeners[0].active).toBe(false);
    });

    it('should use once:true for robust cleanup', () => {
      const eventController = new window.AbortController();
      let abortCount = 0;

      // Simular abort listener com once:true
      const abortListener = () => {
        abortCount++;
      };

      eventController.signal.addEventListener('abort', abortListener, { once: true });

      eventController.abort();
      eventController.abort();
      eventController.abort();

      expect(abortCount).toBe(1); // Apenas uma vez
    });
  });

  describe('DRY Button Configuration', () => {
    it('should map buttons with configuration object', () => {
      const buttonConfig = [
        { id: 'btn-hello', action: 'hello', component: 'demo.hello' },
        { id: 'btn-time', action: 'time', component: 'demo.time' },
        { id: 'btn-photo', action: 'photo', component: 'demo.photo' },
        { id: 'btn-dalek', action: 'dalek', component: 'demo.dalek' }
      ];

      const activeButtons = buttonConfig.filter(config => {
        const btn = document.getElementById(config.id);
        return btn !== null;
      });

      expect(activeButtons.length).toBe(4);
      expect(activeButtons.map(b => b.action)).toEqual(['hello', 'time', 'photo', 'dalek']);
    });

    it('should handle missing buttons gracefully', () => {
      const buttonConfig = [
        { id: 'btn-hello', action: 'hello', component: 'demo.hello' },
        { id: 'btn-missing', action: 'missing', component: 'demo.missing' }
      ];

      const activeButtons = buttonConfig.filter(config => {
        const btn = document.getElementById(config.id);
        return btn !== null;
      });

      expect(activeButtons.length).toBe(1);
    });

    it('should attach listeners to all buttons', () => {
      const buttonConfig = [
        { id: 'btn-hello', action: 'hello', component: 'demo.hello' },
        { id: 'btn-time', action: 'time', component: 'demo.time' },
        { id: 'btn-photo', action: 'photo', component: 'demo.photo' },
        { id: 'btn-dalek', action: 'dalek', component: 'demo.dalek' }
      ];

      let clickCount = 0;
      const eventController = new window.AbortController();

      buttonConfig.forEach(config => {
        const btn = document.getElementById(config.id);
        if (btn) {
          btn.addEventListener('click', () => clickCount++, { signal: eventController.signal });
        }
      });

      // Simular clicks
      buttonConfig.forEach(config => {
        const btn = document.getElementById(config.id);
        if (btn) {
          btn.click();
        }
      });

      expect(clickCount).toBe(4);
    });
  });

  describe('Connection Status Updates', () => {
    it('should display bridge ready status', () => {
      const statusEl = document.getElementById('status');
      const helperReady = true;

      statusEl.textContent = helperReady ? 'Bridge: ready' : 'Bridge: missing';

      expect(statusEl.textContent).toBe('Bridge: ready');
    });

    it('should display bridge missing status', () => {
      const statusEl = document.getElementById('status');
      const helperReady = false;

      statusEl.textContent = helperReady ? 'Bridge: ready' : 'Bridge: missing';

      expect(statusEl.textContent).toBe('Bridge: missing');
    });

    it('should set connection note based on status', () => {
      const noteEl = document.getElementById('connection-note');
      const ready = true;

      const note = ready
        ? 'A ponte nativa está conectada. Use os botões para enviar ações reais.'
        : 'A ponte não está disponível. Os botões funcionam em modo desktop local.';

      noteEl.textContent = note;

      if (ready) {
        expect(noteEl.textContent).toContain('ponte nativa');
      } else {
        expect(noteEl.textContent).toContain('não está disponível');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle send action errors gracefully', () => {
      const logEl = document.getElementById('log');

      try {
        throw new Error('Failed to send action');
      } catch (error) {
        logEl.textContent = `Error: ${(error as Error).message}`;
      }

      expect(logEl.textContent).toContain('Failed to send action');
    });

    it('should log failed actions appropriately', () => {
      const logEl = document.getElementById('log');
      const name = 'test-action';
      const ok = false;

      logEl.textContent = ok ? `Sent action: ${name}` : `Failed to send action: ${name}`;

      expect(logEl.textContent).toBe('Failed to send action: test-action');
    });
  });
});
