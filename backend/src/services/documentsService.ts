import fs from "node:fs";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";

import { env } from "../config/env.js";
import { sha256FromBuffer } from "../utils/hash.js";
import { notarizeLocked } from "../iota/notarizationClient.js";
import { insertDocument } from "../db/documentsRepo.js";

export type NotarizeParams = {
  fileBuffer: Buffer;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  metadata: Record<string, any>;
};

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

export async function notarizeDocument(params: NotarizeParams) {
  const sha256 = sha256FromBuffer(params.fileBuffer);

  const iota = await notarizeLocked({
    sha256Hex: sha256,
    description: "AnchorDoc DDT integrity proof",
    updatableMetadata: JSON.stringify(params.metadata),
  });

  const docId = uuidv4();

  ensureDir(env.uploadDir);

  const destPath = path.join(env.uploadDir, `${docId}.pdf`);
  fs.writeFileSync(destPath, params.fileBuffer);

  const nowIso = new Date().toISOString();

  insertDocument({
    id: docId,
    originalFilename: params.originalFilename,
    mimeType: params.mimeType,
    sizeBytes: params.sizeBytes,
    sha256,
    iotaNetwork: env.iota.networkName,
    iotaObjectId: iota.objectId,
    iotaTxDigest: iota.txDigest,
    iotaExplorerUrl: iota.explorerUrl,
    notarizedAt: iota.notarizedAtIso,
    status: "NOTARIZED",
    metadataJson: JSON.stringify(params.metadata),
    createdAt: nowIso,
  });

  return {
    id: docId,
    originalFilename: params.originalFilename,
    mimeType: params.mimeType,
    sizeBytes: params.sizeBytes,
    sha256,
    iotaNetwork: env.iota.networkName,
    iotaObjectId: iota.objectId,
    iotaTxDigest: iota.txDigest,
    iotaExplorerUrl: iota.explorerUrl,
    notarizedAt: iota.notarizedAtIso,
    status: "NOTARIZED",
    metadata: params.metadata,
    createdAt: nowIso,
  };
}
