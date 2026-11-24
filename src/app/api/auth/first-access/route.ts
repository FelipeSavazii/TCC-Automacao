import { NextRequest, NextResponse } from 'next/server';
import { createSession, normalizeHt } from '@/lib/auth';
import { findUserByHt, setUserPassword, toPublicUser } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      ht?: string;
      password?: string;
      confirmPassword?: string;
    };

    const ht = normalizeHt(body.ht ?? '');
    const password = body.password ?? '';
    const confirmPassword = body.confirmPassword ?? '';

    if (!ht) {
      return NextResponse.json({ error: 'HT obrigatório.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres.' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'As senhas não coincidem.' }, { status: 400 });
    }

    const user = await findUserByHt(ht);
    if (!user) {
      return NextResponse.json({ error: 'HT não cadastrado.' }, { status: 404 });
    }

    if (user.passwordHash !== null) {
      return NextResponse.json(
        { error: 'Este usuário já possui senha definida. Faça login normalmente.' },
        { status: 409 }
      );
    }

    const updated = await setUserPassword(user.id, password);
    if (!updated) {
      return NextResponse.json({ error: 'Erro ao salvar senha.' }, { status: 500 });
    }

    await createSession(updated);
    return NextResponse.json({ user: toPublicUser(updated) });
  } catch {
    return NextResponse.json({ error: 'Erro ao definir senha.' }, { status: 500 });
  }
}
