export const LUMI_SESSION_COOKIE = "lumi_session";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;

type SessionPayload = {
  email: string;
  exp: number;
};

function base64UrlEncode(input: string | Uint8Array): string {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function getAuthSecret(): string {
  return process.env.LUMI_AUTH_SECRET || process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "";
}

async function hmacSha256(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return base64UrlEncode(new Uint8Array(signature));
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function configuredUsers(): Array<{ email: string; password: string }> {
  const users: Array<{ email: string; password: string }> = [];
  const singleEmail = process.env.LUMI_AUTH_EMAIL?.trim().toLowerCase();
  const singlePassword = process.env.LUMI_AUTH_PASSWORD ?? "";
  if (singleEmail && singlePassword) users.push({ email: singleEmail, password: singlePassword });

  const rawUsers = process.env.LUMI_AUTH_USERS ?? "";
  rawUsers
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .forEach((entry) => {
      const separator = entry.indexOf(":");
      if (separator <= 0) return;
      const email = entry.slice(0, separator).trim().toLowerCase();
      const password = entry.slice(separator + 1);
      if (email && password) users.push({ email, password });
    });

  return users;
}

export function isLumiAuthConfigured(): boolean {
  return Boolean(getAuthSecret()) && configuredUsers().length > 0;
}

export function validateLumiCredentials(email: string, password: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) return false;
  return configuredUsers().some((user) => user.email === normalizedEmail && safeEqual(user.password, password));
}

export async function createLumiSessionToken(email: string): Promise<string> {
  const secret = getAuthSecret();
  if (!secret) throw new Error("LUMI_AUTH_SECRET is not configured");
  const payload: SessionPayload = {
    email: email.trim().toLowerCase(),
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await hmacSha256(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

export async function verifyLumiSessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  const secret = getAuthSecret();
  if (!secret) return null;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;
  const expectedSignature = await hmacSha256(encodedPayload, secret);
  if (!safeEqual(signature, expectedSignature)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload;
    if (!payload.email || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function lumiSessionMaxAgeSeconds(): number {
  return SESSION_TTL_SECONDS;
}
