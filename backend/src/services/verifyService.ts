import { sha256FromBuffer, sha256FromFileAndMetadata } from "../utils/hash.js";
import {
  isBlankMetadata,
  serializeMetadataForHash,
  type DocumentBusinessMetadata,
} from "../utils/documentMetadata.js";
import {
  getDocumentById,
  getDocumentBySha,
  type DocumentRow,
} from "../db/documentsRepo.js";

export type VerifyParams = {
  docId?: string;
  sha256?: string;
  submittedMetadata: DocumentBusinessMetadata;
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
      submittedMetadata: DocumentBusinessMetadata;
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
      submittedMetadata: DocumentBusinessMetadata;
    };

export async function verifyDocument(
  fileBuffer: Buffer,
  params: VerifyParams,
): Promise<VerifyResult> {
  const metadataJson = serializeMetadataForHash(params.submittedMetadata);
  const computedSha256 = sha256FromFileAndMetadata(fileBuffer, metadataJson);
  const legacyBlank = isBlankMetadata(params.submittedMetadata);
  const legacyFileOnlySha = legacyBlank ? sha256FromBuffer(fileBuffer) : null;

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

  if (!record && legacyFileOnlySha) {
    record = getDocumentBySha(legacyFileOnlySha);
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
      submittedMetadata: params.submittedMetadata,
    };
  }

  const notarizedSha256 = record.sha256;
  const isMatch =
    computedSha256 === notarizedSha256 ||
    (legacyBlank &&
      legacyFileOnlySha != null &&
      legacyFileOnlySha === notarizedSha256);

  return {
    result: isMatch ? "VERIFIED" : "MODIFIED",
    computedSha256,
    notarizedSha256,
    notarizedAt: record.notarizedAt,
    iotaExplorerUrl: record.iotaExplorerUrl,
    iotaTxDigest: record.iotaTxDigest,
    iotaObjectId: record.iotaObjectId,
    metadata: JSON.parse(record.metadataJson || "{}"),
    submittedMetadata: params.submittedMetadata,
  };
}
