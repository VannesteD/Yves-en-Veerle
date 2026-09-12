const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

function parseOrigin(value: string | null | undefined): URL | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

function effectivePort(url: URL) {
  return url.port || (url.protocol === "https:" ? "443" : "80");
}

export function isAllowedCheckoutOrigin(
  requestOrigin: string | null,
  configuredSiteUrl: string | undefined,
  serverRequestOrigin: string,
) {
  if (!requestOrigin) return true;

  const origin = parseOrigin(requestOrigin);
  const trustedOrigin = parseOrigin(configuredSiteUrl) ?? parseOrigin(serverRequestOrigin);
  if (!origin || !trustedOrigin) return false;
  if (origin.origin === trustedOrigin.origin) return true;

  return (
    LOOPBACK_HOSTS.has(origin.hostname) &&
    LOOPBACK_HOSTS.has(trustedOrigin.hostname) &&
    origin.protocol === trustedOrigin.protocol &&
    effectivePort(origin) === effectivePort(trustedOrigin)
  );
}
