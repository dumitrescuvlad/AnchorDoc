/**
 * Request / wire shape: fields may be omitted or null.
 */
export type DocumentBusinessMetadata = {
  issuer?: string;
  receiver?: string;
  shipmentId?: string;
  documentType?: string;
};

/**
 * Normalized form: fixed four keys, string values (empty when absent).
 * Used for SHA-256(file || canonical JSON), DB `metadataJson`, and IOTA updatable metadata.
 */
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

export function isBlankMetadata(metadata: CanonicalBusinessMetadata): boolean {
  return (
    metadata.issuer === "" &&
    metadata.receiver === "" &&
    metadata.documentType === "" &&
    metadata.shipmentId === ""
  );
}

/** Same bytes appended to the file buffer for hashing and stored on-chain as updatable metadata. */
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

export function parseMetadataJsonField(
  raw: unknown,
):
  | { ok: true; value: CanonicalBusinessMetadata }
  | { ok: false; error: string } {
  if (raw == null || raw === "") {
    return { ok: true, value: normalizeMetadata({}) };
  }

  if (typeof raw !== "string") {
    return { ok: false, error: "metadata must be a JSON string" };
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    return { ok: true, value: normalizeMetadata(parsed) };
  } catch {
    return { ok: false, error: "Invalid JSON in metadata field" };
  }
}
