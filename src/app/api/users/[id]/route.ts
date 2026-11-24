import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  deleteUserById,
  findUserById,
  resetUserPassword,
  setUserSuperuser,
  toPublicUser,
} from '@/lib/db';
import {
  canDeleteUser,
  canResetUserPassword,
  canToggleSuperuser,
  isEffectiveSuperuser,
} from '@/lib/permissions';

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const actorDb = await findUserById(session.userId);
  if (!actorDb) {
    return NextResponse.json({ error: 'Sessão inválida.' }, { status: 401 });
  }

  const { id } = await ctx.params;
  const target = await findUserById(id);
  if (!target) {
    return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
  }

  const actor = {
    userId: actorDb.id,
    role: actorDb.role,
    isSuperuser: isEffectiveSuperuser(actorDb.role, actorDb.isSuperuser),
  };

  const body = (await req.json()) as { action?: string; isSuperuser?: boolean };

  if (body.action === 'reset-password') {
    if (!canResetUserPassword(actor, target)) {
      return NextResponse.json(
        { error: 'Você não tem permissão para resetar a senha deste usuário.' },
        { status: 403 }
      );
    }
    const updated = await resetUserPassword(id);
    if (!updated) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }
    return NextResponse.json({ user: toPublicUser(updated) });
  }

  if (body.action === 'toggle-superuser') {
    if (!canToggleSuperuser(actor, target)) {
      return NextResponse.json(
        { error: 'Apenas superusuários podem alterar o status de superusuário em professores e técnicos.' },
        { status: 403 }
      );
    }
    const updated = await setUserSuperuser(id, Boolean(body.isSuperuser));
    if (!updated) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }
    return NextResponse.json({ user: toPublicUser(updated) });
  }

  return NextResponse.json({ error: 'Ação não suportada.' }, { status: 400 });
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const actorDb = await findUserById(session.userId);
  if (!actorDb) {
    return NextResponse.json({ error: 'Sessão inválida.' }, { status: 401 });
  }

  const { id } = await ctx.params;
  if (id === actorDb.id) {
    return NextResponse.json(
      { error: 'Você não pode excluir seu próprio usuário enquanto está logado.' },
      { status: 400 }
    );
  }

  const target = await findUserById(id);
  if (!target) {
    return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
  }

  const actor = {
    userId: actorDb.id,
    role: actorDb.role,
    isSuperuser: isEffectiveSuperuser(actorDb.role, actorDb.isSuperuser),
  };

  if (!canDeleteUser(actor, target)) {
    return NextResponse.json(
      {
        error:
          target.role === 'admin'
            ? 'Apenas Administradores podem remover outro Administrador.'
            : 'Apenas um Superusuário (ou Administrador) pode remover Professores e Técnicos Administrativos.',
      },
      { status: 403 }
    );
  }

  const deleted = await deleteUserById(id);
  if (!deleted) {
    return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
