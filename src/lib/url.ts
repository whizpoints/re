/**
 * Dynamic URL Resolver
 * Automatically detects whether the request came through:
 * - Localhost (e.g. http://localhost:3000)
 * - Cloudflare Tunnel (e.g. https://api.whizpoint.app)
 * - Production Custom Domain (e.g. https://e.whizpoint.app)
 *
 * Checks standard reverse-proxy headers: x-forwarded-host, x-forwarded-proto, and host.
 */
export function getRequestBaseUrl(req?: Request): string {
  if (req) {
    try {
      const forwardedHost = req.headers.get('x-forwarded-host');
      const host = forwardedHost || req.headers.get('host');
      const forwardedProto =
        req.headers.get('x-forwarded-proto') || req.headers.get('x-forwarded-protocol');

      if (host) {
        const isLocal =
          host.includes('localhost') || host.includes('127.0.0.1') || host.startsWith('192.168.');
        const proto = forwardedProto || (isLocal ? 'http' : 'https');
        return `${proto}://${host}`;
      }
    } catch (e) {
      console.warn('[URL RESOLVER] Failed to read headers from request:', e);
    }
  }

  return process.env.NEXT_PUBLIC_APP_URL || 'https://e.whizpoint.app';
}
