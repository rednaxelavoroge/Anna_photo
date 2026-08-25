import { createHmac } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "anna_photo_admin";

export function adminPassword() {
  return process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === "production" ? "" : "anna");
}

function sign() {
  const secret = adminPassword();
  if (!secret) return "";
  return createHmac("sha256", secret).update("anna-photo-admin").digest("hex");
}

export async function isAdmin() {
  const token = sign();
  if (!token) return false;
  const jar = await cookies();
  return jar.get(ADMIN_COOKIE)?.value === token;
}

export function sessionToken() {
  return sign();
}
