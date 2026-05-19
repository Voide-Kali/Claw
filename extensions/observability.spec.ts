import { describe, it, expect } from 'vitest';
import { createRequestContext } from '../lib/request-context.ts';
import { logger } from '../lib/logger.ts';

describe('Observability utilities', () => {
  it('should create request context with traceId and duration', () => {
    const ctx = createRequestContext('user-test');
    expect(ctx.traceId).toBeTruthy();
    expect(ctx.startTime).toBeGreaterThan(0);
    expect(ctx.userId).toBe('user-test');
    expect(ctx.duration).toBeGreaterThanOrEqual(0);
    expect(ctx.toJSON()).toMatchObject({
      traceId: ctx.traceId,
      userId: 'user-test'
    });
  });

  it('logger should have a valid level and no throw on info', () => {
    expect(logger.level).toBeDefined();
    expect(() => logger.info('Observability test', { passed: true })).not.toThrow();
  });
});
