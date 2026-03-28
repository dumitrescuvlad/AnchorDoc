export type DocumentStatus = "NOTARIZED";

/** Normalized metadata returned by the API (all keys present). */
export type DocumentMetadata = {
  issuer: string;
  receiver: string;
  documentType: string;
  shipmentId: string;
};

export type DocumentItem = {
  id: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  iotaNetwork: string;
  iotaObjectId: string | null;
  iotaTxDigest: string | null;
  iotaExplorerUrl: string | null;
  notarizedAt: string | null;
  status: DocumentStatus;
  createdAt: string;
};

export type DocumentDetails = DocumentItem & {
  metadata: DocumentMetadata;
};

export type DocumentsListResponse = {
  items: DocumentItem[];
  total: number;
};

export type NotarizeResponse = DocumentDetails;
