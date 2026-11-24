import { NextRequest, NextResponse } from 'next/server';
import { normalizeHt } from '@/lib/auth';
import { findUserByHt } from '@/lib/db';
import { ROLE_LABELS } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { ht?: string };
    const ht = normalizeHt(body.ht ?? '');

    if (!ht || ht.length < 4) {
      return NextResponse.json(
        { error: 'Informe um prontuário HT válido (ex.: HT3000001).' },
        { status: 400 }
      );
    }

    const user = await findUserByHt(ht);
    if (!user) {
      return NextResponse.json(
        {
          exists: false,
          error:
            'HT não encontrado. Apenas professores, técnicos administrativos e representantes de classe pré-cadastrados têm acesso.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      exists: true,
      ht: user.ht,
      nome: user.nome,
      role: user.role,
      roleLabel: ROLE_LABELS[user.role],
      needsPasswordSetup: user.passwordHash === null,
    });
  } catch {
    return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 });
  }
}
