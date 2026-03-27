import { buildUrl, handleJson } from "./client";

export type LoginRole = "company" | "auditor";

export type LoginResponse = {
  token: string;
  role: LoginRole;
  companyName?: string;
};

export async function apiLogin(
  role: LoginRole,
  companyName?: string,
): Promise<LoginResponse> {
  const res = await fetch(buildUrl("/api/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role, companyName }),
  });

  return handleJson<LoginResponse>(res);
}
