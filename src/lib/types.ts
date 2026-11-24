export type UserRole = 'admin' | 'professor' | 'tecnico' | 'representante';

export const ALLOWED_ROLES: UserRole[] = [
  'admin',
  'professor',
  'tecnico',
  'representante',
];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  professor: 'Professor',
  tecnico: 'Técnico Administrativo',
  representante: 'Representante de Classe',
};

export const ROLE_SHORT_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  professor: 'Professor',
  tecnico: 'Téc. Admin.',
  representante: 'Representante',
};

export type CursoId = 'AUTOMACAO' | 'INFORMATICA' | 'MECANICA';
export type SerieId = 'ANO_1' | 'ANO_2' | 'ANO_3';

export const CURSOS: ReadonlyArray<{
  id: CursoId;
  label: string;
  short: string;
  accent: 'amber' | 'blue' | 'emerald';
  rangeLabel: string;
}> = [
  { id: 'AUTOMACAO', label: 'Automação', short: 'Auto', accent: 'amber', rangeLabel: '1 · 2 · 3' },
  { id: 'INFORMATICA', label: 'Informática', short: 'Info', accent: 'blue', rangeLabel: '4 · 5 · 6' },
  { id: 'MECANICA', label: 'Mecânica', short: 'Mec', accent: 'emerald', rangeLabel: '7 · 8 · 9' },
];

export const SERIES: ReadonlyArray<{
  id: SerieId;
  numero: 1 | 2 | 3;
  label: string;
}> = [
  { id: 'ANO_1', numero: 1, label: '1º Ano' },
  { id: 'ANO_2', numero: 2, label: '2º Ano' },
  { id: 'ANO_3', numero: 3, label: '3º Ano' },
];

export type DirectTurmaButton =
  | 'AUTO_1'
  | 'AUTO_2'
  | 'AUTO_3'
  | 'INFO_1'
  | 'INFO_2'
  | 'INFO_3'
  | 'MEC_1'
  | 'MEC_2'
  | 'MEC_3';

export interface RoomDefinition {
  number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  button: DirectTurmaButton;
  turma: string;
  curso: CursoId;
  cursoLabel: string;
  serie: SerieId;
  serieLabel: string;
  accent: 'amber' | 'blue' | 'emerald';
}

export const ROOMS: ReadonlyArray<RoomDefinition> = [
  { number: 1, button: 'AUTO_1', turma: '1º Automação', curso: 'AUTOMACAO', cursoLabel: 'Automação', serie: 'ANO_1', serieLabel: '1º Ano', accent: 'amber' },
  { number: 2, button: 'AUTO_2', turma: '2º Automação', curso: 'AUTOMACAO', cursoLabel: 'Automação', serie: 'ANO_2', serieLabel: '2º Ano', accent: 'amber' },
  { number: 3, button: 'AUTO_3', turma: '3º Automação', curso: 'AUTOMACAO', cursoLabel: 'Automação', serie: 'ANO_3', serieLabel: '3º Ano', accent: 'amber' },
  { number: 4, button: 'INFO_1', turma: '1º Informática', curso: 'INFORMATICA', cursoLabel: 'Informática', serie: 'ANO_1', serieLabel: '1º Ano', accent: 'blue' },
  { number: 5, button: 'INFO_2', turma: '2º Informática', curso: 'INFORMATICA', cursoLabel: 'Informática', serie: 'ANO_2', serieLabel: '2º Ano', accent: 'blue' },
  { number: 6, button: 'INFO_3', turma: '3º Informática', curso: 'INFORMATICA', cursoLabel: 'Informática', serie: 'ANO_3', serieLabel: '3º Ano', accent: 'blue' },
  { number: 7, button: 'MEC_1', turma: '1º Mecânica', curso: 'MECANICA', cursoLabel: 'Mecânica', serie: 'ANO_1', serieLabel: '1º Ano', accent: 'emerald' },
  { number: 8, button: 'MEC_2', turma: '2º Mecânica', curso: 'MECANICA', cursoLabel: 'Mecânica', serie: 'ANO_2', serieLabel: '2º Ano', accent: 'emerald' },
  { number: 9, button: 'MEC_3', turma: '3º Mecânica', curso: 'MECANICA', cursoLabel: 'Mecânica', serie: 'ANO_3', serieLabel: '3º Ano', accent: 'emerald' },
];

export const TURMAS = [
  'Geral / Campus',
  '1º Automação',
  '2º Automação',
  '3º Automação',
  '1º Informática',
  '2º Informática',
  '3º Informática',
  '1º Mecânica',
  '2º Mecânica',
  '3º Mecânica',
] as const;

export type Turma = (typeof TURMAS)[number] | string;

export type TotemButton = DirectTurmaButton | CursoId | SerieId | 'VOLTAR';

export const DIRECT_BUTTON_TO_TURMA: Record<DirectTurmaButton, string> = {
  AUTO_1: '1º Automação',
  AUTO_2: '2º Automação',
  AUTO_3: '3º Automação',
  INFO_1: '1º Informática',
  INFO_2: '2º Informática',
  INFO_3: '3º Informática',
  MEC_1: '1º Mecânica',
  MEC_2: '2º Mecânica',
  MEC_3: '3º Mecânica',
};

export const NUMBER_TO_DIRECT_BUTTON: Record<string, DirectTurmaButton> = {
  '1': 'AUTO_1',
  '2': 'AUTO_2',
  '3': 'AUTO_3',
  '4': 'INFO_1',
  '5': 'INFO_2',
  '6': 'INFO_3',
  '7': 'MEC_1',
  '8': 'MEC_2',
  '9': 'MEC_3',
};

export const TURMA_TO_ROOM: Record<string, RoomDefinition> = Object.fromEntries(
  ROOMS.map((r) => [r.turma, r])
);

export function normalizeRoomTurma(raw: string | undefined): string | null {
  if (!raw || !raw.trim()) return null;
  const trimmed = raw.trim();
  if (trimmed in TURMA_TO_ROOM) return trimmed;

  // Match numeric room 1..9
  if (/^[1-9]$/.test(trimmed)) {
    const found = ROOMS.find((r) => r.number === Number(trimmed));
    return found ? found.turma : null;
  }

  const norm = trimmed
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  const yearMatch = /[123]/.exec(norm);
  if (!yearMatch) return null;
  const yearNum = yearMatch[0];

  if (norm.includes('auto')) return `${yearNum}º Automação`;
  if (norm.includes('info')) return `${yearNum}º Informática`;
  if (norm.includes('mec')) return `${yearNum}º Mecânica`;
  return null;
}

export function getTurmaName(curso: CursoId, serie: SerieId): string {
  const serieNum = serie === 'ANO_1' ? '1º' : serie === 'ANO_2' ? '2º' : '3º';
  const cursoLabel =
    curso === 'AUTOMACAO'
      ? 'Automação'
      : curso === 'INFORMATICA'
        ? 'Informática'
        : 'Mecânica';
  return `${serieNum} ${cursoLabel}`;
}

export function normalizeTotemButton(raw: string): TotemButton | null {
  const cleaned = raw.trim().toUpperCase();
  if (!cleaned) return null;
  if (cleaned === '0' || cleaned === 'BACK' || cleaned === 'HOME' || cleaned === 'VOLTAR') {
    return 'VOLTAR';
  }
  if (cleaned in NUMBER_TO_DIRECT_BUTTON) {
    return NUMBER_TO_DIRECT_BUTTON[cleaned];
  }
  if ((VALID_TOTEM_BUTTONS as string[]).includes(cleaned)) {
    return cleaned as TotemButton;
  }
  return null;
}

export const VALID_TOTEM_BUTTONS: TotemButton[] = [
  'AUTO_1',
  'AUTO_2',
  'AUTO_3',
  'INFO_1',
  'INFO_2',
  'INFO_3',
  'MEC_1',
  'MEC_2',
  'MEC_3',
  'AUTOMACAO',
  'INFORMATICA',
  'MECANICA',
  'ANO_1',
  'ANO_2',
  'ANO_3',
  'VOLTAR',
];

export const BUTTON_LABELS: Record<TotemButton, string> = {
  AUTO_1: '1º Automação',
  AUTO_2: '2º Automação',
  AUTO_3: '3º Automação',
  INFO_1: '1º Informática',
  INFO_2: '2º Informática',
  INFO_3: '3º Informática',
  MEC_1: '1º Mecânica',
  MEC_2: '2º Mecânica',
  MEC_3: '3º Mecânica',
  AUTOMACAO: 'Automação',
  INFORMATICA: 'Informática',
  MECANICA: 'Mecânica',
  ANO_1: '1º Ano',
  ANO_2: '2º Ano',
  ANO_3: '3º Ano',
  VOLTAR: 'Voltar',
};

export interface UserRecord {
  id: string;
  ht: string;
  nome: string;
  role: UserRole;
  isSuperuser: boolean;
  turma?: string;
  passwordHash: string | null;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface PublicUser {
  id: string;
  ht: string;
  nome: string;
  role: UserRole;
  isSuperuser: boolean;
  turma?: string;
  hasPassword: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export type AvisoCategoria = 'urgente' | 'prova' | 'sala' | 'evento' | 'comunicado';

export const AVISO_CATEGORIA_LABELS: Record<AvisoCategoria, string> = {
  urgente: 'Urgente',
  prova: 'Prova / Avaliação',
  sala: 'Troca de Sala',
  evento: 'Evento',
  comunicado: 'Comunicado',
};

export interface Aviso {
  id: string;
  titulo: string;
  conteudo: string;
  turma: string;
  categoria: AvisoCategoria;
  urgente: boolean;
  ativo: boolean;
  autorNome: string;
  autorHt: string;
  autorRole: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type TotemPowerMode = 'AUTO' | 'FORCE_ON' | 'FORCE_OFF';

export interface TotemPowerState {
  mode: TotemPowerMode;
  updatedAt: string;
}

export interface TotemEventLog {
  id: string;
  button: TotemButton;
  source: 'esp32' | 'dashboard' | 'simulator';
  deviceId: string;
  timestamp: string;
}

export interface ParsedSpreadsheetRow {
  lineNumber: number;
  nome: string;
  ht: string;
  role: UserRole | null;
  roleRaw?: string;
  turma?: string;
  error?: string;
}
