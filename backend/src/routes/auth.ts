import { Router } from "express";
import { z } from "zod";

export const authRouter = Router();

authRouter.post("/login", (req, res) => {
  const schema = z.object({
    role: z.enum(["company", "auditor"]),
    companyName: z.string().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({ error: "Invalid body", details: parsed.error.flatten() });

  const { role, companyName } = parsed.data;

  return res.json({
    token: "mock-token",
    role,
    companyName:
      role === "company" ? companyName || "AnchorDoc Demo Company" : undefined,
  });
});
