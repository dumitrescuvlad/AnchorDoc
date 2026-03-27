import express from "express";
import cors from "cors";
import "dotenv/config";
import { authRouter } from "./routes/auth.js";
import { documentsRouter } from "./routes/documents.js";
import { initDb } from "./db/init.js";

const app = express();

initDb();

const origins = (process.env.CORS_ORIGIN || "https://anchordoc.pages.dev")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({ origin: origins }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/documents", documentsRouter);

app.use((err: any, _req: any, res: any, _next: any) => {
  const msg = err?.message || "Server error";
  const isMulterSize = msg.includes("File too large");
  return res.status(isMulterSize ? 413 : 400).json({ error: msg });
});

const port = Number(process.env.PORT || "4000");
app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
