import crypto from "node:crypto";

export function sha256FromBuffer(buf: Buffer): string {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

export function sha256FromFileAndMetadata(
  fileBuffer: Buffer,
  metadataJson: string,
): string {
  const metaBuf = Buffer.from(metadataJson, "utf8");
  return sha256FromBuffer(Buffer.concat([fileBuffer, metaBuf]));
}
