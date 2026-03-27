import multer from "multer";
import { env } from "../config/env.js";

const maxBytes = env.maxFileMb * 1024 * 1024;

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxBytes },
  fileFilter: (_req, file, cb) => {
    const isPdfMime = file.mimetype === "application/pdf";
    const isPdfExt = file.originalname.toLowerCase().endsWith(".pdf");

    if (!isPdfMime && !isPdfExt) {
      return cb(new Error("Only PDF files are allowed"));
    }

    cb(null, true);
  },
});
