import { sha256FromBuffer } from "../utils/hash.js";
import {
  getDocumentById,
  getDocumentBySha,
  type DocumentRow,
} from "../db/documentsRepo.js";

export type VerifyParams = {
  docId?: string;
  sha256?: string;
};

export type VerifyResult =
  | {
      result: "NOT_FOUND";
      computedSha256: string;
      notarizedSha256: null;
      notarizedAt: null;
      iotaExplorerUrl: null;
      iotaTxDigest: null;
      iotaObjectId: null;
      metadata: Record<string, unknown>;
    }
  | {
      result: "VERIFIED" | "MODIFIED";
      computedSha256: string;
      notarizedSha256: string;
      notarizedAt: string | null;
      iotaExplorerUrl: string | null;
      iotaTxDigest: string | null;
      iotaObjectId: string | null;
      metadata: Record<string, unknown>;
    };

export async function verifyDocument(
  fileBuffer: Buffer,
  params: VerifyParams,
): Promise<VerifyResult> {
  const computedSha256 = sha256FromBuffer(fileBuffer);

  let record: DocumentRow | undefined;

  if (params.docId) {
    record = getDocumentById(params.docId);
  }

  if (!record && params.sha256) {
    record = getDocumentBySha(params.sha256);
  }

  if (!record) {
    record = getDocumentBySha(computedSha256);
  }

  if (!record) {
    return {
      result: "NOT_FOUND",
      computedSha256,
      notarizedSha256: null,
      notarizedAt: null,
      iotaExplorerUrl: null,
      iotaTxDigest: null,
      iotaObjectId: null,
      metadata: {},
    };
  }

  const notarizedSha256 = record.sha256;
  const isMatch = computedSha256 === notarizedSha256;

  return {
    result: isMatch ? "VERIFIED" : "MODIFIED",
    computedSha256,
    notarizedSha256,
    notarizedAt: record.notarizedAt,
    iotaExplorerUrl: record.iotaExplorerUrl,
    iotaTxDigest: record.iotaTxDigest,
    iotaObjectId: record.iotaObjectId,
    metadata: JSON.parse(record.metadataJson || "{}"),
  };
}
