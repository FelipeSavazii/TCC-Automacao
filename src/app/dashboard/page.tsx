import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { findUserById, getTotemPowerState, listAvisos, listUsers } from '@/lib/db';
import { canAccessUsersSection, isEffectiveSuperuser } from '@/lib/permissions';
import { getTotemStatus } from '@/lib/totem-bus';
import { DashboardClient } from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const dbUser = await findUserById(session.userId);
  if (!dbUser) {
    redirect('/login');
  }

  const canSeeUsers = canAccessUsersSection(dbUser.role);
  const [avisos, users, powerState] = await Promise.all([
    listAvisos(false),
    canSeeUsers ? listUsers() : Promise.resolve([]),
    getTotemPowerState(),
  ]);
  const totemStatus = getTotemStatus();

  return (
    <DashboardClient
      currentUser={{
        userId: dbUser.id,
        ht: dbUser.ht,
        nome: dbUser.nome,
        role: dbUser.role,
        isSuperuser: isEffectiveSuperuser(dbUser.role, dbUser.isSuperuser),
        turma: dbUser.turma,
      }}
      initialAvisos={avisos}
      initialUsers={users}
      initialPowerState={powerState}
      initialTotemStatus={totemStatus}
    />
  );
}
