export type DocumentBusinessMetadata = {
  issuer?: string;
  receiver?: string;
  shipmentId?: string;
  documentType?: string;
};

export type CanonicalBusinessMetadata = {
  issuer: string;
  receiver: string;
  documentType: string;
  shipmentId: string;
};

export function normalizeMetadata(input: unknown): CanonicalBusinessMetadata {
  const raw =
    input != null && typeof input === "object" && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {};

  const str = (key: string) => {
    const v = raw[key];
    if (v == null) return "";
    return String(v).trim();
  };

  return {
    issuer: str("issuer"),
    receiver: str("receiver"),
    documentType: str("documentType"),
    shipmentId: str("shipmentId"),
  };
}

export function serializeMetadataForHash(
  metadata: CanonicalBusinessMetadata,
): string {
  return JSON.stringify({
    issuer: metadata.issuer,
    receiver: metadata.receiver,
    documentType: metadata.documentType,
    shipmentId: metadata.shipmentId,
  });
}

export async function sha256FileAndMetadata(
  file: File,
  metadata: CanonicalBusinessMetadata,
): Promise<string> {
  const fileBuf = await file.arrayBuffer();
  const metaBytes = new TextEncoder().encode(serializeMetadataForHash(metadata));
  const out = new Uint8Array(fileBuf.byteLength + metaBytes.byteLength);
  out.set(new Uint8Array(fileBuf), 0);
  out.set(metaBytes, fileBuf.byteLength);
  const hash = await crypto.subtle.digest("SHA-256", out.buffer);
  const bytes = Array.from(new Uint8Array(hash));
  return bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
