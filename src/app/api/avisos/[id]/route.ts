import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { deleteAviso, findAvisoById, findUserById, updateAviso } from '@/lib/db';
import { broadcastDataUpdate } from '@/lib/totem-bus';
import type { AvisoCategoria } from '@/lib/types';

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const actor = await findUserById(session.userId);
  if (!actor) {
    return NextResponse.json({ error: 'Sessão inválida.' }, { status: 401 });
  }

  const { id } = await ctx.params;
  const existing = await findAvisoById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Aviso não encontrado.' }, { status: 404 });
  }

  if (actor.role === 'representante') {
    if (!actor.turma || existing.turma !== actor.turma) {
      return NextResponse.json(
        { error: 'Representantes de classe só podem editar avisos da própria sala.' },
        { status: 403 }
      );
    }
  }

  try {
    const body = (await req.json()) as {
      titulo?: string;
      conteudo?: string;
      turma?: string;
      categoria?: AvisoCategoria;
      urgente?: boolean;
      ativo?: boolean;
    };

    if (
      actor.role === 'representante' &&
      body.turma !== undefined &&
      body.turma.trim() !== actor.turma
    ) {
      return NextResponse.json(
        {
          error: `Representantes de classe só podem manter avisos na própria sala (${actor.turma}).`,
        },
        { status: 403 }
      );
    }

    const updated = await updateAviso(id, {
      ...(body.titulo !== undefined ? { titulo: body.titulo.trim() } : {}),
      ...(body.conteudo !== undefined ? { conteudo: body.conteudo.trim() } : {}),
      ...(body.turma !== undefined ? { turma: body.turma.trim() } : {}),
      ...(body.categoria !== undefined ? { categoria: body.categoria } : {}),
      ...(body.urgente !== undefined ? { urgente: Boolean(body.urgente) } : {}),
      ...(body.ativo !== undefined ? { ativo: Boolean(body.ativo) } : {}),
    });

    if (!updated) {
      return NextResponse.json({ error: 'Aviso não encontrado.' }, { status: 404 });
    }

    broadcastDataUpdate('aviso-updated');
    return NextResponse.json({ aviso: updated });
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar aviso.' }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const actor = await findUserById(session.userId);
  if (!actor) {
    return NextResponse.json({ error: 'Sessão inválida.' }, { status: 401 });
  }

  const { id } = await ctx.params;
  const existing = await findAvisoById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Aviso não encontrado.' }, { status: 404 });
  }

  if (actor.role === 'representante') {
    if (!actor.turma || existing.turma !== actor.turma) {
      return NextResponse.json(
        { error: 'Representantes de classe só podem excluir avisos da própria sala.' },
        { status: 403 }
      );
    }
  }

  const ok = await deleteAviso(id);
  if (!ok) {
    return NextResponse.json({ error: 'Aviso não encontrado.' }, { status: 404 });
  }

  broadcastDataUpdate('aviso-deleted');
  return NextResponse.json({ ok: true });
}
