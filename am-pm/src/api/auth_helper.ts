export function pickBearerFromHeaders(headers: Headers): string | null {
  const raw = headers.get("Authorization") || headers.get("authorization");
  if (!raw) return null;
  const v = raw.trim();
  return v.toLowerCase().startsWith("bearer ") ? v.slice(7) : null;
}
