import { NextRequest, NextResponse } from 'next/server';
import { createSession, normalizeHt, verifyPassword } from '@/lib/auth';
import { findUserByHt, recordUserLogin, toPublicUser } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { ht?: string; password?: string };
    const ht = normalizeHt(body.ht ?? '');
    const password = body.password ?? '';

    if (!ht || !password) {
      return NextResponse.json({ error: 'Informe seu HT e senha.' }, { status: 400 });
    }

    const user = await findUserByHt(ht);
    if (!user) {
      return NextResponse.json({ error: 'HT ou senha inválidos.' }, { status: 401 });
    }

    if (user.passwordHash === null) {
      return NextResponse.json(
        {
          error: 'Primeiro acesso detectado. Defina sua senha antes de entrar.',
          needsPasswordSetup: true,
        },
        { status: 403 }
      );
    }

    if (!verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: 'HT ou senha inválidos.' }, { status: 401 });
    }

    await recordUserLogin(user.id);
    await createSession(user);

    return NextResponse.json({ user: toPublicUser(user) });
  } catch {
    return NextResponse.json({ error: 'Erro ao processar login.' }, { status: 500 });
  }
}
