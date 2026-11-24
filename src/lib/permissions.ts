import type { UserRole } from './types';

export interface PermissionActor {
  userId: string;
  role: UserRole;
  isSuperuser: boolean;
}

export interface PermissionTarget {
  id: string;
  role: UserRole;
  isSuperuser?: boolean;
}

export function isEffectiveSuperuser(
  role: UserRole,
  isSuperuser?: boolean
): boolean {
  if (role === 'admin') return true;
  if (role === 'professor' || role === 'tecnico') return Boolean(isSuperuser);
  return false;
}

export function canManageAvisos(role: UserRole): boolean {
  return (
    role === 'admin' ||
    role === 'tecnico' ||
    role === 'professor' ||
    role === 'representante'
  );
}

export function canAccessUsersSection(role: UserRole): boolean {
  return role === 'admin' || role === 'tecnico' || role === 'professor';
}

export function getAssignableRoles(actor: PermissionActor): UserRole[] {
  if (actor.role === 'admin') {
    return ['professor', 'tecnico', 'representante', 'admin'];
  }
  if (actor.role === 'professor' || actor.role === 'tecnico') {
    return ['professor', 'tecnico', 'representante'];
  }
  return [];
}

export function canDeleteUser(
  actor: PermissionActor,
  target: PermissionTarget
): boolean {
  if (actor.userId === target.id) return false;
  if (actor.role === 'representante') return false;
  if (actor.role === 'admin') return true;

  const actorSuper = isEffectiveSuperuser(actor.role, actor.isSuperuser);
  if (target.role === 'admin') return false;
  if (target.role === 'representante') {
    return actor.role === 'professor' || actor.role === 'tecnico';
  }
  return actorSuper;
}

export function canResetUserPassword(
  actor: PermissionActor,
  target: PermissionTarget
): boolean {
  if (actor.userId === target.id) return false;
  return canDeleteUser(actor, target);
}

export function canToggleSuperuser(
  actor: PermissionActor,
  target: PermissionTarget
): boolean {
  if (actor.userId === target.id) return false;
  if (target.role !== 'professor' && target.role !== 'tecnico') return false;
  return isEffectiveSuperuser(actor.role, actor.isSuperuser);
}
