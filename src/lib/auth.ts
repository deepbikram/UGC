// Sessions are a signed JWT in an httpOnly cookie. The signing key comes from
// AUTH_SECRET, which `npm run setup` generates into .env.local. There is no
// third-party auth provider and no API key anywhere in this file.
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { Role } from "./db";

const DEV_SECRET = "portico-development-secret-do-not-use-in-production";

if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET) {
  console.warn("[portico] AUTH_SECRET is not set. Run `npm run setup` before deploying.");
}

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || DEV_SECRET);

export const COOKIE_NAME = "portico_session";
const MAX_AGE = 60 * 60 * 24 * 7;

export type Session = {
  userId: number;
  email: string;
  name: string;
  role: Role;
  mustReset: boolean;
};

export async function createSessionToken(session: Session) {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifySessionToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as Session;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/** Throws-free guard for route handlers: returns the session or null. */
export async function requireRole(role: Role): Promise<Session | null> {
  const session = await getSession();
  if (!session) return null;
  if (role === "admin" && session.role !== "admin") return null;
  return session;
}

export const sessionCookie = {
  name: COOKIE_NAME,
  options: { httpOnly: true, sameSite: "lax" as const, path: "/", maxAge: MAX_AGE, secure: process.env.NODE_ENV === "production" },
};
