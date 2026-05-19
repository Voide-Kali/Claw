import { envConfig } from './env';
import { logger } from './logger';

interface RateLimitState {
  tokens: number;
  lastRefill: number;
}

class TokenBucketRateLimiter {
  private state: RateLimitState;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per millisecond

  constructor(
    maxRequests: number,
    windowMs: number
  ) {
    this.maxTokens = maxRequests;
    this.refillRate = maxRequests / windowMs;
    this.state = {
      tokens: maxRequests,
      lastRefill: Date.now()
    };

    logger.info('Rate limiter initialized', {
      maxRequests,
      windowMs,
      refillRate: this.refillRate
    });
  }

  private refill(): void {
    const now = Date.now();
    const timePassed = now - this.state.lastRefill;
    const tokensToAdd = timePassed * this.refillRate;

    this.state.tokens = Math.min(this.maxTokens, this.state.tokens + tokensToAdd);
    this.state.lastRefill = now;
  }

  async acquire(): Promise<boolean> {
    this.refill();

    if (this.state.tokens >= 1) {
      this.state.tokens -= 1;
      logger.debug('Rate limiter token acquired', {
        remainingTokens: Math.floor(this.state.tokens)
      });
      return true;
    }

    logger.warn('Rate limiter token acquisition failed - limit exceeded', {
      remainingTokens: Math.floor(this.state.tokens),
      timeUntilNextToken: this.getTimeUntilNextToken()
    });
    return false;
  }

  getRemainingTokens(): number {
    this.refill();
    return Math.floor(this.state.tokens);
  }

  getTimeUntilNextToken(): number {
    if (this.state.tokens >= 1) return 0;

    const tokensNeeded = 1 - this.state.tokens;
    return Math.ceil(tokensNeeded / this.refillRate);
  }
}

// Global rate limiter instance
const rateLimiter = new TokenBucketRateLimiter(
  envConfig.RATE_LIMIT_REQUESTS,
  envConfig.RATE_LIMIT_WINDOW_MS
);

export { rateLimiter, TokenBucketRateLimiter };
