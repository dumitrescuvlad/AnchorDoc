import { Router } from "express";
import { upload } from "../middleware/upload.js";
import { z } from "zod";

import { getDocuments, getDocumentById } from "../db/documentsRepo.js";

import { notarizeDocument } from "../services/documentsService.js";
import { verifyDocument } from "../services/verifyService.js";
import { parseMetadataJsonField } from "../utils/documentMetadata.js";

export const documentsRouter = Router();

documentsRouter.post("/notarize", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Missing file" });

    const parsedMetadata = parseMetadataJsonField(req.body?.metadata);
    if (!parsedMetadata.ok) {
      return res.status(400).json({ error: parsedMetadata.error });
    }

    const metadata = parsedMetadata.value;

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
      metadata: z.string().optional(),
    });

    const parsed = bodySchema.safeParse(req.body || {});
    if (!parsed.success) return res.status(400).json({ error: "Invalid body" });

    const parsedMetadata = parseMetadataJsonField(parsed.data.metadata);
    if (!parsedMetadata.ok) {
      return res.status(400).json({ error: parsedMetadata.error });
    }

    const result = await verifyDocument(req.file.buffer, {
      docId: parsed.data.docId,
      sha256: parsed.data.sha256,
      submittedMetadata: parsedMetadata.value,
    });

    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Verify failed" });
  }
});
