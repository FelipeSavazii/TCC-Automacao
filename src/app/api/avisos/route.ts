import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createAviso, findUserById, listAvisos } from '@/lib/db';
import { broadcastDataUpdate } from '@/lib/totem-bus';
import type { AvisoCategoria } from '@/lib/types';

const VALID_CATEGORIAS: AvisoCategoria[] = ['urgente', 'prova', 'sala', 'evento', 'comunicado'];

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }
  return NextResponse.json({ avisos: await listAvisos(false) });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const actor = await findUserById(session.userId);
  if (!actor) {
    return NextResponse.json({ error: 'Sessão inválida.' }, { status: 401 });
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

    const titulo = (body.titulo ?? '').trim();
    const conteudo = (body.conteudo ?? '').trim();
    let turma = (body.turma ?? 'Geral / Campus').trim();
    const categoria: AvisoCategoria =
      body.categoria && VALID_CATEGORIAS.includes(body.categoria)
        ? body.categoria
        : 'comunicado';

    if (actor.role === 'representante') {
      if (!actor.turma) {
        return NextResponse.json(
          {
            error:
              'Seu perfil de representante não possui uma sala vinculada. Solicite a um professor ou técnico.',
          },
          { status: 403 }
        );
      }
      if (body.turma && body.turma.trim() !== actor.turma) {
        return NextResponse.json(
          {
            error: `Representantes de classe só podem enviar avisos para a própria sala (${actor.turma}).`,
          },
          { status: 403 }
        );
      }
      turma = actor.turma;
    }

    if (titulo.length < 3) {
      return NextResponse.json(
        { error: 'Informe um título com pelo menos 3 caracteres.' },
        { status: 400 }
      );
    }
    if (conteudo.length < 5) {
      return NextResponse.json({ error: 'Informe a descrição do aviso.' }, { status: 400 });
    }

    const aviso = await createAviso({
      titulo,
      conteudo,
      turma,
      categoria,
      urgente: Boolean(body.urgente || categoria === 'urgente'),
      ativo: body.ativo !== false,
      autorNome: actor.nome,
      autorHt: actor.ht,
      autorRole: actor.role,
    });

    broadcastDataUpdate('aviso-created');
    return NextResponse.json({ aviso }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro ao criar aviso.' }, { status: 400 });
  }
}
