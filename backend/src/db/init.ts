import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { env } from "../config/env.js";

const SCHEMA = `
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
`;

export function initDb() {
  const dbPath = env.dbPath;

  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new Database(dbPath);
  db.exec(SCHEMA);
  db.close();

  console.log(`DB initialized at: ${dbPath}`);
}

if (process.argv[1] && process.argv[1].includes("init")) {
  initDb();
}
