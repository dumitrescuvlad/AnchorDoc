PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  originalFilename TEXT NOT NULL,
  mimeType TEXT NOT NULL,
  sizeBytes INTEGER NOT NULL,
  sha256 TEXT NOT NULL,

  iotaNetwork TEXT NOT NULL,
  iotaObjectId TEXT,
  iotaTxDigest TEXT,
  iotaExplorerUrl TEXT,
  notarizedAt TEXT,
  status TEXT NOT NULL,

  metadataJson TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_documents_createdAt ON documents(createdAt);
CREATE INDEX IF NOT EXISTS idx_documents_sha256 ON documents(sha256);