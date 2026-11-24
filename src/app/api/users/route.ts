import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  createUserWithoutPassword,
  findUserById,
  listUsers,
  toPublicUser,
} from '@/lib/db';
import {
  canAccessUsersSection,
  getAssignableRoles,
  isEffectiveSuperuser,
} from '@/lib/permissions';
import { ALLOWED_ROLES, normalizeRoomTurma, type UserRole } from '@/lib/types';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }
  const actor = await findUserById(session.userId);
  if (!actor || !canAccessUsersSection(actor.role)) {
    return NextResponse.json(
      { error: 'Representantes de classe não têm acesso à gestão de usuários.' },
      { status: 403 }
    );
  }

  return NextResponse.json({ users: await listUsers() });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }
  const actor = await findUserById(session.userId);
  if (!actor || !canAccessUsersSection(actor.role)) {
    return NextResponse.json(
      {
        error:
          'Apenas Administradores, Professores e Técnicos Administrativos podem cadastrar usuários.',
      },
      { status: 403 }
    );
  }

  try {
    const body = (await req.json()) as {
      nome?: string;
      ht?: string;
      role?: UserRole;
      isSuperuser?: boolean;
      turma?: string;
    };

    const actorSuper = isEffectiveSuperuser(actor.role, actor.isSuperuser);
    const assignable = getAssignableRoles({
      userId: actor.id,
      role: actor.role,
      isSuperuser: actorSuper,
    });

    if (!body.role || !ALLOWED_ROLES.includes(body.role)) {
      return NextResponse.json(
        {
          error:
            'Cargo inválido. Permitido: Administrador, Professor, Técnico Administrativo ou Representante de Classe.',
        },
        { status: 400 }
      );
    }

    if (!assignable.includes(body.role)) {
      return NextResponse.json(
        { error: 'Apenas Administradores podem cadastrar outro Administrador.' },
        { status: 403 }
      );
    }

    const allowSuperFlag =
      actorSuper && (body.role === 'professor' || body.role === 'tecnico')
        ? Boolean(body.isSuperuser)
        : body.role === 'admin';

    let normalizedTurma: string | undefined;
    if (body.role === 'representante') {
      const parsedTurma = normalizeRoomTurma(body.turma);
      if (!parsedTurma) {
        return NextResponse.json(
          { error: 'Selecione a sala (1 a 9) que o representante de classe representa.' },
          { status: 400 }
        );
      }
      normalizedTurma = parsedTurma;
    }

    const result = await createUserWithoutPassword({
      nome: body.nome ?? '',
      ht: body.ht ?? '',
      role: body.role,
      isSuperuser: allowSuperFlag,
      turma: normalizedTurma,
    });

    if (result.error || !result.user) {
      return NextResponse.json({ error: result.error ?? 'Erro ao criar usuário.' }, { status: 400 });
    }

    return NextResponse.json({ user: toPublicUser(result.user) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
  }
}
