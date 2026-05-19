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
  const traceId = typeof globalThis.crypto?.randomUUID === 'function'
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  return new RequestContext(traceId, Date.now(), userId);
}
