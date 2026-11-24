import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { isEffectiveSuperuser } from './permissions';
import { SESSION_COOKIE_NAME, signSessionToken, verifySessionToken, type SessionPayload } from './session-token';
import type { UserRecord } from './types';

export function normalizeHt(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (trimmed.includes('@')) {
    return trimmed.toLowerCase();
  }
  const cleaned = trimmed.toUpperCase().replace(/[\s.-]+/g, '');
  if (!cleaned) return '';
  if (/^\d+$/.test(cleaned)) {
    return `HT${cleaned}`;
  }
  return cleaned;
}

export function isValidHt(ht: string): boolean {
  return /^[A-Z]{2}\d{5,9}[A-Z0-9]?$/.test(ht) || /^HT\d{4,10}$/.test(ht);
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  if (!salt || !keyHex) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const storedBuf = Buffer.from(keyHex, 'hex');
  if (derived.length !== storedBuf.length) return false;
  return crypto.timingSafeEqual(derived, storedBuf);
}

export async function createSession(user: UserRecord): Promise<void> {
  const token = await signSessionToken({
    userId: user.id,
    ht: user.ht,
    nome: user.nome,
    role: user.role,
    isSuperuser: isEffectiveSuperuser(user.role, user.isSuperuser),
    turma: user.turma,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
