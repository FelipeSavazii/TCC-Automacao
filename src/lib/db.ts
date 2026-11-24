import crypto from 'node:crypto';
import { hashPassword, normalizeHt } from './auth';
import { getMongoDb } from './mongodb';
import { isEffectiveSuperuser } from './permissions';
import type {
  Aviso,
  PublicUser,
  TotemPowerMode,
  TotemPowerState,
  UserRecord,
  UserRole,
} from './types';

const globalForBootstrap = globalThis as unknown as {
  __lifeAdminBootstrapped?: boolean;
};

/**
 * Garante a existência da conta inicial de Administrador se a coleção `users` estiver vazia.
 * Não cria nenhum aviso, material ou usuário fictício de demonstração.
 */
async function getReadyDb() {
  const db = await getMongoDb();
  if (!globalForBootstrap.__lifeAdminBootstrapped) {
    const count = await db.collection('users').estimatedDocumentCount();
    if (count === 0) {
      const rootAdmin: UserRecord = {
        id: 'usr-admin-root',
        ht: 'admin@admin.com',
        nome: 'Administrador',
        role: 'admin',
        isSuperuser: true,
        passwordHash: hashPassword('123456'),
        createdAt: new Date().toISOString(),
        lastLoginAt: null,
      };
      await db
        .collection<UserRecord>('users')
        .updateOne({ ht: rootAdmin.ht }, { $setOnInsert: rootAdmin }, { upsert: true });
    }
    globalForBootstrap.__lifeAdminBootstrapped = true;
  }
  return db;
}

function stripMongoId<T extends object>(doc: T & { _id?: unknown }): T {
  const copy = { ...doc };
  delete copy._id;
  return copy as T;
}

export function toPublicUser(u: UserRecord): PublicUser {
  return {
    id: u.id,
    ht: u.ht,
    nome: u.nome,
    role: u.role,
    isSuperuser: isEffectiveSuperuser(u.role, u.isSuperuser),
    turma: u.turma,
    hasPassword: Boolean(u.passwordHash),
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
  };
}

/* ─── USERS ─── */
export async function findUserByHt(rawHt: string): Promise<UserRecord | undefined> {
  const ht = normalizeHt(rawHt);
  if (!ht) return undefined;
  const db = await getReadyDb();
  const doc = await db.collection<UserRecord>('users').findOne({ ht });
  return doc ? stripMongoId(doc) : undefined;
}

export async function findUserById(id: string): Promise<UserRecord | undefined> {
  const db = await getReadyDb();
  const doc = await db.collection<UserRecord>('users').findOne({ id });
  return doc ? stripMongoId(doc) : undefined;
}

export async function setUserPassword(
  userId: string,
  newPassword: string
): Promise<UserRecord | null> {
  const passwordHash = hashPassword(newPassword);
  const lastLoginAt = new Date().toISOString();
  const db = await getReadyDb();
  const updated = await db
    .collection<UserRecord>('users')
    .findOneAndUpdate(
      { id: userId },
      { $set: { passwordHash, lastLoginAt } },
      { returnDocument: 'after' }
    );
  return updated ? stripMongoId(updated) : null;
}

export async function recordUserLogin(userId: string): Promise<void> {
  const lastLoginAt = new Date().toISOString();
  const db = await getReadyDb();
  await db.collection<UserRecord>('users').updateOne({ id: userId }, { $set: { lastLoginAt } });
}

export async function resetUserPassword(userId: string): Promise<UserRecord | null> {
  const db = await getReadyDb();
  const updated = await db
    .collection<UserRecord>('users')
    .findOneAndUpdate(
      { id: userId },
      { $set: { passwordHash: null } },
      { returnDocument: 'after' }
    );
  return updated ? stripMongoId(updated) : null;
}

export async function setUserSuperuser(
  userId: string,
  isSuperuser: boolean
): Promise<UserRecord | null> {
  const db = await getReadyDb();
  const updated = await db
    .collection<UserRecord>('users')
    .findOneAndUpdate(
      { id: userId },
      { $set: { isSuperuser } },
      { returnDocument: 'after' }
    );
  return updated ? stripMongoId(updated) : null;
}

export async function createUserWithoutPassword(input: {
  nome: string;
  ht: string;
  role: UserRole;
  isSuperuser?: boolean;
  turma?: string;
}): Promise<{ user?: UserRecord; error?: string }> {
  const ht = normalizeHt(input.ht);
  const nome = input.nome.trim();

  if (!nome || nome.length < 2) {
    return { error: 'Nome inválido.' };
  }
  if (!ht || ht.length < 4) {
    return { error: 'HT ou e-mail inválido.' };
  }

  const db = await getReadyDb();
  const existing = await db.collection<UserRecord>('users').findOne({ ht });
  if (existing) {
    return { error: `O acesso ${ht} já está cadastrado.` };
  }

  const user: UserRecord = {
    id: `usr-${crypto.randomUUID().slice(0, 8)}`,
    ht,
    nome,
    role: input.role,
    isSuperuser: isEffectiveSuperuser(input.role, input.isSuperuser),
    turma: input.turma?.trim() || undefined,
    passwordHash: null,
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
  };

  await db.collection<UserRecord>('users').insertOne(user);
  return { user };
}

export async function importUsersBatch(
  rows: Array<{ nome: string; ht: string; role: UserRole; turma?: string }>
): Promise<{
  created: PublicUser[];
  skipped: Array<{ ht: string; nome: string; reason: string }>;
}> {
  const db = await getReadyDb();
  const existingDocs = await db
    .collection<UserRecord>('users')
    .find({}, { projection: { ht: 1 } })
    .toArray();
  const existingHts = new Set(existingDocs.map((u) => u.ht));

  const createdRecords: UserRecord[] = [];
  const skipped: Array<{ ht: string; nome: string; reason: string }> = [];

  for (const row of rows) {
    const ht = normalizeHt(row.ht);
    const nome = row.nome.trim();
    if (!nome || !ht) {
      skipped.push({ ht: row.ht, nome: row.nome, reason: 'Nome ou HT em branco' });
      continue;
    }
    if (existingHts.has(ht)) {
      skipped.push({ ht, nome, reason: 'HT já cadastrado' });
      continue;
    }

    const user: UserRecord = {
      id: `usr-${crypto.randomUUID().slice(0, 8)}`,
      ht,
      nome,
      role: row.role,
      isSuperuser: row.role === 'admin',
      turma: row.turma?.trim() || undefined,
      passwordHash: null,
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
    };

    existingHts.add(ht);
    createdRecords.push(user);
  }

  if (createdRecords.length > 0) {
    await db.collection<UserRecord>('users').insertMany(createdRecords);
  }

  return { created: createdRecords.map(toPublicUser), skipped };
}

export async function deleteUserById(userId: string): Promise<boolean> {
  const db = await getReadyDb();
  const res = await db.collection<UserRecord>('users').deleteOne({ id: userId });
  return res.deletedCount > 0;
}

export async function listUsers(): Promise<PublicUser[]> {
  const db = await getReadyDb();
  const docs = await db
    .collection<UserRecord>('users')
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map((d) => toPublicUser(stripMongoId(d)));
}

/* ─── AVISOS ─── */
export async function listAvisos(onlyActive = false): Promise<Aviso[]> {
  const db = await getReadyDb();
  const filter = onlyActive ? { ativo: true } : {};
  const docs = await db
    .collection<Aviso>('avisos')
    .find(filter)
    .sort({ urgente: -1, createdAt: -1 })
    .toArray();
  return docs.map(stripMongoId);
}

export async function findAvisoById(id: string): Promise<Aviso | undefined> {
  const db = await getReadyDb();
  const doc = await db.collection<Aviso>('avisos').findOne({ id });
  return doc ? stripMongoId(doc) : undefined;
}

export async function createAviso(
  input: Omit<Aviso, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Aviso> {
  const now = new Date().toISOString();
  const aviso: Aviso = {
    ...input,
    id: `avs-${crypto.randomUUID().slice(0, 8)}`,
    createdAt: now,
    updatedAt: now,
  };
  const db = await getReadyDb();
  await db.collection<Aviso>('avisos').insertOne(aviso);
  return aviso;
}

export async function updateAviso(
  id: string,
  patch: Partial<Pick<Aviso, 'titulo' | 'conteudo' | 'turma' | 'categoria' | 'urgente' | 'ativo'>>
): Promise<Aviso | null> {
  const updatedAt = new Date().toISOString();
  const db = await getReadyDb();
  const updated = await db
    .collection<Aviso>('avisos')
    .findOneAndUpdate(
      { id },
      { $set: { ...patch, updatedAt } },
      { returnDocument: 'after' }
    );
  return updated ? stripMongoId(updated) : null;
}

export async function deleteAviso(id: string): Promise<boolean> {
  const db = await getReadyDb();
  const res = await db.collection<Aviso>('avisos').deleteOne({ id });
  return res.deletedCount > 0;
}

/* ─── TOTEM POWER STATE (persisted in MongoDB for Vercel compatibility) ─── */
interface TotemStateDoc {
  id: string;
  mode: TotemPowerMode;
  updatedAt: string;
}

export async function getTotemPowerState(): Promise<TotemPowerState> {
  const db = await getReadyDb();
  const doc = await db.collection<TotemStateDoc>('totem_state').findOne({ id: 'main' });
  if (!doc) {
    return { mode: 'AUTO', updatedAt: new Date(0).toISOString() };
  }
  return { mode: doc.mode, updatedAt: doc.updatedAt };
}

export async function setTotemPowerState(mode: TotemPowerMode): Promise<TotemPowerState> {
  const db = await getReadyDb();
  const updatedAt = new Date().toISOString();
  await db.collection<TotemStateDoc>('totem_state').updateOne(
    { id: 'main' },
    { $set: { id: 'main', mode, updatedAt } },
    { upsert: true }
  );
  return { mode, updatedAt };
}
