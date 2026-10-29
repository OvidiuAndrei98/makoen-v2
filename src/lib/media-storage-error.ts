/** Report actionable storage failures without exposing SDK messages or credentials. */
export function mediaStorageErrorMessage(error: unknown): string | undefined {
  let current = error;
  const seen = new Set<unknown>();
  while (current && typeof current === "object" && !seen.has(current) && seen.size < 5) {
    seen.add(current);
    const value = current as { name?: string; code?: string; Code?: string; cause?: unknown };
    const codes = [value.name, value.code, value.Code];
    if (codes.includes("AccessDenied")) return "Cloudflare R2 a refuzat accesul la imagini. Verifică permisiunea Object Read & Write a tokenului pentru bucketul configurat.";
    if (codes.some(code => code && ["InvalidAccessKeyId", "SignatureDoesNotMatch", "ExpiredToken", "InvalidToken"].includes(code))) {
      return "Credențialele Cloudflare R2 nu sunt acceptate. Verifică Access Key ID, Secret Access Key și endpointul din configurația serverului.";
    }
    if (codes.includes("NoSuchBucket")) return "Bucketul Cloudflare R2 nu a fost găsit. Verifică numele bucketului și endpointul din configurația serverului.";
    current = value.cause;
  }
}
