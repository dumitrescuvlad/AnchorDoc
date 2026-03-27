import type { DocumentMetadata } from "./document";

export type VerifyResult =
  | {
      result: "NOT_FOUND";
      computedSha256: string;
      notarizedSha256: null;
      notarizedAt: null;
      iotaExplorerUrl: null;
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
    };
