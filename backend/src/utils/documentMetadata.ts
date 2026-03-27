export type DocumentBusinessMetadata = {
  issuer: string;
  receiver: string;
  documentType: string;
  shipmentId: string;
};

export function normalizeMetadata(input: unknown): DocumentBusinessMetadata {
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

export function isBlankMetadata(metadata: DocumentBusinessMetadata): boolean {
  return (
    metadata.issuer === "" &&
    metadata.receiver === "" &&
    metadata.documentType === "" &&
    metadata.shipmentId === ""
  );
}

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

export function parseMetadataJsonField(
  raw: unknown,
):
  | { ok: true; value: DocumentBusinessMetadata }
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
