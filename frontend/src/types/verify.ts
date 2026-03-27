import type { DocumentMetadata } from "./document";

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
      submittedMetadata: DocumentMetadata;
    }
  | {
      result: "VERIFIED" | "MODIFIED";
      computedSha256: string;
      notarizedSha256: string;
      notarizedAt: string | null;
      iotaExplorerUrl: string | null;
      iotaTxDigest: string | null;
      iotaObjectId: string | null;
      metadata: DocumentMetadata;
      submittedMetadata: DocumentMetadata;
    };
