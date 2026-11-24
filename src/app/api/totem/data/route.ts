import { NextResponse } from 'next/server';
import { getTotemPowerState, listAvisos } from '@/lib/db';
import { getTotemStatus } from '@/lib/totem-bus';
import { ROOMS } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [avisos, powerState] = await Promise.all([
    listAvisos(true),
    getTotemPowerState(),
  ]);

  const turmas = ROOMS.map((room) => {
    const matching = avisos.filter(
      (a) => a.turma === room.turma || a.turma === 'Geral / Campus'
    );
    return {
      number: room.number,
      nome: room.turma,
      avisosCount: matching.length,
      urgentesCount: matching.filter((a) => a.urgente).length,
    };
  });

  return NextResponse.json({
    avisos,
    turmas,
    powerState,
    status: getTotemStatus(),
    serverTime: new Date().toISOString(),
  });
}
