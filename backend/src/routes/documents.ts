import { Router } from "express";
import { upload } from "../middleware/upload.js";
import { z } from "zod";

import {
  insertDocument,
  getDocuments,
  getDocumentById,
} from "../db/documentsRepo.js";

import { notarizeDocument } from "../services/documentsService.js";
import { verifyDocument } from "../services/verifyService.js";

export const documentsRouter = Router();

documentsRouter.post("/notarize", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Missing file" });

    const metaSchema = z.object({
      documentNumber: z.string().trim().min(1).optional(),
      documentDate: z.string().trim().min(1).optional(),
      client: z.string().trim().min(1).optional(),
    });

    const parsedMetadata = metaSchema.safeParse({
      documentNumber: req.body?.documentNumber,
      documentDate: req.body?.documentDate,
      client: req.body?.client,
    });

    if (!parsedMetadata.success) {
      return res.status(400).json({ error: "Invalid metadata" });
    }

    const metadata = parsedMetadata.data;

    const result = await notarizeDocument({
      fileBuffer: req.file.buffer,
      originalFilename: req.file.originalname,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      metadata,
    });

    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Notarize failed" });
  }
});

documentsRouter.get("/", (req, res) => {
  const limit = Math.min(Number(req.query.limit || "20"), 100);
  const offset = Math.max(Number(req.query.offset || "0"), 0);
  const q = typeof req.query.q === "string" ? req.query.q : undefined;

  const out = getDocuments(limit, offset, q);
  return res.json(out);
});

documentsRouter.get("/:id", (req, res) => {
  const doc = getDocumentById(req.params.id);
  if (!doc) return res.status(404).json({ error: "Not found" });

  return res.json({
    ...doc,
    metadata: JSON.parse(doc.metadataJson || "{}"),
  });
});

documentsRouter.post("/verify", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Missing file" });

    const bodySchema = z.object({
      docId: z.string().optional(),
      sha256: z.string().optional(),
    });

    const parsed = bodySchema.safeParse(req.body || {});
    if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

    const result = await verifyDocument(req.file.buffer, parsed.data);

    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Verify failed" });
  }
});
