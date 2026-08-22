import type { DeliveryResult } from '../core/types.js';

export interface HttpDeliveryOptions {
  readonly endpoint: string;
  readonly method: string;
  readonly headers: Readonly<Record<string, string>>;
  readonly body: string;
  readonly fetch: typeof globalThis.fetch;
  readonly timeout: number;
  readonly signal?: AbortSignal;
}

export const deliverHttp = async (options: HttpDeliveryOptions): Promise<DeliveryResult> => {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), options.timeout);
  const onAbort = () => controller.abort();
  options.signal?.addEventListener('abort', onAbort, { once: true });
  try {
    const response = await options.fetch(options.endpoint, {
      method: options.method,
      headers: options.headers,
      body: options.body,
      credentials: 'omit',
      keepalive: true,
      redirect: 'error',
      signal: controller.signal,
    });
    if (!response.ok)
      return {
        ok: false,
        sent: 0,
        failed: 1,
        dropped: 0,
        status: response.status,
        code: 'HTTP_NON_2XX',
      };
    return { ok: true, sent: 1, failed: 0, dropped: 0, status: response.status };
  } catch (error) {
    const code = controller.signal.aborted
      ? 'HTTP_TIMEOUT_OR_ABORT'
      : error instanceof TypeError
        ? 'HTTP_NETWORK_ERROR'
        : 'HTTP_ERROR';
    return { ok: false, sent: 0, failed: 1, dropped: 0, code };
  } finally {
    globalThis.clearTimeout(timeout);
    options.signal?.removeEventListener('abort', onAbort);
  }
};
