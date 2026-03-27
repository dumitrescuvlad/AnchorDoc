import { db } from "./db.js";

export type DocumentRow = {
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
  status: string;
  metadataJson: string;
  createdAt: string;
};

export function insertDocument(row: DocumentRow) {
  const stmt = db.prepare(`
    INSERT INTO documents (
      id, originalFilename, mimeType, sizeBytes, sha256,
      iotaNetwork, iotaObjectId, iotaTxDigest, iotaExplorerUrl, notarizedAt,
      status, metadataJson, createdAt
    ) VALUES (
      @id, @originalFilename, @mimeType, @sizeBytes, @sha256,
      @iotaNetwork, @iotaObjectId, @iotaTxDigest, @iotaExplorerUrl, @notarizedAt,
      @status, @metadataJson, @createdAt
    )
  `);
  stmt.run(row);
}

export function getDocuments(limit: number, offset: number, q?: string) {
  const where = q ? `WHERE originalFilename LIKE ? OR sha256 LIKE ?` : "";
  const params = q ? [`%${q}%`, `%${q}%`] : [];
  const items = db
    .prepare(
      `
    SELECT * FROM documents
    ${where}
    ORDER BY createdAt DESC
    LIMIT ? OFFSET ?
  `,
    )
    .all(...params, limit, offset) as DocumentRow[];

  const total = db
    .prepare(
      `
    SELECT COUNT(*) as c FROM documents
    ${where}
  `,
    )
    .get(...params) as { c: number };

  return { items, total: total.c };
}

export function getDocumentById(id: string) {
  return db.prepare(`SELECT * FROM documents WHERE id = ?`).get(id) as
    | DocumentRow
    | undefined;
}

export function getDocumentBySha(sha256: string) {
  return db.prepare(`SELECT * FROM documents WHERE sha256 = ?`).get(sha256) as
    | DocumentRow
    | undefined;
}
