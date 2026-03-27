import crypto from "node:crypto";

export function sha256FromBuffer(buf: Buffer): string {
  return crypto.createHash("sha256").update(buf).digest("hex");
}
