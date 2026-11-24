import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { findUserById, importUsersBatch, listUsers } from '@/lib/db';
import {
  canAccessUsersSection,
  getAssignableRoles,
  isEffectiveSuperuser,
} from '@/lib/permissions';
import {
  inspectSpreadsheetBuffer,
  parseSpreadsheetWithMapping,
  type SpreadsheetColumnMapping,
} from '@/lib/spreadsheet';
import { ALLOWED_ROLES, normalizeRoomTurma, type UserRole } from '@/lib/types';

function parseOptionalInt(val: FormDataEntryValue | null): number | undefined {
  if (val === null || val === '') return undefined;
  const n = Number(val);
  return Number.isInteger(n) ? n : undefined;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }
  const actorDb = await findUserById(session.userId);
  if (!actorDb || !canAccessUsersSection(actorDb.role)) {
    return NextResponse.json(
      { error: 'Sem permissão para importar planilhas.' },
      { status: 403 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const mode = String(formData.get('mode') || 'inspect');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Envie um arquivo .xlsx ou .csv.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // STEP 1: INSPECT — detect columns & return sample rows for user confirmation
    if (mode === 'inspect') {
      const inspection = inspectSpreadsheetBuffer(buffer, file.name);
      if (inspection.columns.length === 0) {
        return NextResponse.json(
          { error: 'A planilha está vazia ou não pôde ser lida.' },
          { status: 400 }
        );
      }
      return NextResponse.json({
        fileName: file.name,
        ...inspection,
      });
    }

    const defaultRoleRaw = String(formData.get('defaultRole') || 'professor') as UserRole;
    const assignable = getAssignableRoles({
      userId: actorDb.id,
      role: actorDb.role,
      isSuperuser: isEffectiveSuperuser(actorDb.role, actorDb.isSuperuser),
    });

    if (!ALLOWED_ROLES.includes(defaultRoleRaw) || !assignable.includes(defaultRoleRaw)) {
      return NextResponse.json({ error: 'Cargo padrão inválido ou sem permissão.' }, { status: 400 });
    }

    const mappingOverride: Partial<SpreadsheetColumnMapping> = {};
    const nomeCol = parseOptionalInt(formData.get('nomeCol'));
    const htCol = parseOptionalInt(formData.get('htCol'));
    const roleCol = parseOptionalInt(formData.get('roleCol'));
    const turmaCol = parseOptionalInt(formData.get('turmaCol'));
    const hasHeaderRaw = formData.get('hasHeader');

    if (nomeCol !== undefined) mappingOverride.nomeCol = nomeCol;
    if (htCol !== undefined) mappingOverride.htCol = htCol;
    if (roleCol !== undefined) mappingOverride.roleCol = roleCol;
    if (turmaCol !== undefined) mappingOverride.turmaCol = turmaCol;
    if (hasHeaderRaw !== null) mappingOverride.hasHeader = String(hasHeaderRaw) === 'true';

    const { rows, mapping } = parseSpreadsheetWithMapping(
      buffer,
      file.name,
      defaultRoleRaw,
      mappingOverride
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma linha válida encontrada com as colunas selecionadas.' },
        { status: 400 }
      );
    }

    const existingUsers = await listUsers();
    const existingHts = new Set(existingUsers.map((u) => u.ht));
    const seenInFile = new Set<string>();

    const previewRows = rows.map((row) => {
      let status: 'novo' | 'duplicado' | 'invalido' = 'novo';
      let reason = row.error;
      const normalizedTurma =
        row.role === 'representante' ? normalizeRoomTurma(row.turma) : undefined;

      if (row.error || !row.role) {
        status = 'invalido';
      } else if (!assignable.includes(row.role)) {
        status = 'invalido';
        reason = 'Apenas Administradores podem importar cargo Administrador';
      } else if (row.role === 'representante' && !normalizedTurma) {
        status = 'invalido';
        reason = 'Representante precisa de uma sala válida (1 a 9 ou ex.: 2º Automação)';
      } else if (existingHts.has(row.ht)) {
        status = 'duplicado';
        reason = 'HT já cadastrado no sistema';
      } else if (seenInFile.has(row.ht)) {
        status = 'duplicado';
        reason = 'HT repetido nesta planilha';
      } else {
        seenInFile.add(row.ht);
      }

      return {
        ...row,
        turma: normalizedTurma ?? row.turma,
        status,
        reason,
      };
    });

    // STEP 2: PREVIEW validated rows
    if (mode === 'preview') {
      return NextResponse.json({
        fileName: file.name,
        mapping,
        rows: previewRows,
        summary: {
          total: previewRows.length,
          novos: previewRows.filter((r) => r.status === 'novo').length,
          duplicados: previewRows.filter((r) => r.status === 'duplicado').length,
          invalidos: previewRows.filter((r) => r.status === 'invalido').length,
        },
      });
    }

    // STEP 3: COMMIT valid rows without password
    const validToCreate = previewRows
      .filter((r) => r.status === 'novo' && r.role !== null)
      .map((r) => ({
        nome: r.nome,
        ht: r.ht,
        role: r.role as UserRole,
        turma: r.turma,
      }));

    const result = await importUsersBatch(validToCreate);

    return NextResponse.json({
      importedCount: result.created.length,
      created: result.created,
      skipped: result.skipped,
      invalidCount: previewRows.filter((r) => r.status === 'invalido').length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao processar planilha.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
