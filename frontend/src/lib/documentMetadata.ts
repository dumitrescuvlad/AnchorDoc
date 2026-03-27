export type DocumentBusinessMetadata = {
  issuer: string;
  receiver: string;
  documentType: string;
  shipmentId: string;
};

export function serializeMetadataForHash(
  metadata: DocumentBusinessMetadata,
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
  metadata: DocumentBusinessMetadata,
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
