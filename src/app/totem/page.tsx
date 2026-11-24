import type { Metadata } from 'next';
import { getTotemPowerState, listAvisos } from '@/lib/db';
import { getTotemStatus } from '@/lib/totem-bus';
import { ROOMS } from '@/lib/types';
import { TotemClient } from './TotemClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Totem HTO | Mural Digital · Life',
  description:
    'Tela do totem escolar Life operada por botões físicos dedicados e botão vermelho Voltar.',
};

export default async function TotemPage() {
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

  const status = getTotemStatus();

  return (
    <TotemClient
      initialData={{
        avisos,
        turmas,
        powerState,
        status: {
          connectedScreens: status.connectedScreens,
          esp32Online: status.esp32Online,
          lastEsp32SeenAt: status.lastEsp32SeenAt,
        },
      }}
    />
  );
}
