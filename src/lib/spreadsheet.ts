import zlib from 'node:zlib';
import { normalizeHt } from './auth';
import type { ParsedSpreadsheetRow, UserRole } from './types';

export interface SpreadsheetColumnMapping {
  nomeCol: number;
  htCol: number;
  roleCol: number; // -1 = usar defaultRole
  turmaCol: number; // -1 = nenhuma
  hasHeader: boolean;
}

export interface SpreadsheetInspection {
  columns: Array<{ index: number; label: string; samples: string[] }>;
  sampleRows: string[][];
  totalRows: number;
  suggestedMapping: SpreadsheetColumnMapping;
}

function stripAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function parseRoleString(
  raw: string | undefined,
  fallback?: UserRole
): UserRole | null {
  if (!raw || !raw.trim()) {
    return fallback ?? null;
  }
  const s = stripAccents(raw);
  if (s === 'admin' || s === 'administrador' || s.includes('administrador')) {
    return 'admin';
  }
  if (s.includes('prof') || s.includes('docente')) {
    return 'professor';
  }
  if (
    s.includes('tecnic') ||
    s.includes('tae') ||
    s.includes('administrativ') ||
    s.includes('servidor') ||
    s.includes('coorden')
  ) {
    return 'tecnico';
  }
  if (s.includes('represent') || s.includes('lider') || s === 'rep') {
    return 'representante';
  }
  return null;
}

function decodeXmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(Number(num)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function extractZipEntries(buf: Buffer): Map<string, Buffer> {
  const entries = new Map<string, Buffer>();

  let eocdOffset = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) {
    throw new Error('Arquivo XLSX inválido (cabeçalho ZIP não encontrado).');
  }

  const totalEntries = buf.readUInt16LE(eocdOffset + 10);
  const centralDirOffset = buf.readUInt32LE(eocdOffset + 16);

  let offset = centralDirOffset;
  for (let i = 0; i < totalEntries; i++) {
    if (offset + 46 > buf.length || buf.readUInt32LE(offset) !== 0x02014b50) {
      break;
    }
    const compressionMethod = buf.readUInt16LE(offset + 10);
    const compressedSize = buf.readUInt32LE(offset + 20);
    const nameLen = buf.readUInt16LE(offset + 28);
    const extraLen = buf.readUInt16LE(offset + 30);
    const commentLen = buf.readUInt16LE(offset + 32);
    const localHeaderOffset = buf.readUInt32LE(offset + 42);
    const fileName = buf.subarray(offset + 46, offset + 46 + nameLen).toString('utf-8');

    offset += 46 + nameLen + extraLen + commentLen;

    if (localHeaderOffset + 30 > buf.length) continue;
    const localNameLen = buf.readUInt16LE(localHeaderOffset + 26);
    const localExtraLen = buf.readUInt16LE(localHeaderOffset + 28);
    const dataStart = localHeaderOffset + 30 + localNameLen + localExtraLen;
    const compressedData = buf.subarray(dataStart, dataStart + compressedSize);

    if (compressionMethod === 0) {
      entries.set(fileName, compressedData);
    } else if (compressionMethod === 8) {
      entries.set(fileName, zlib.inflateRawSync(compressedData));
    }
  }

  return entries;
}

function colLettersToIndex(letters: string): number {
  let idx = 0;
  for (let i = 0; i < letters.length; i++) {
    idx = idx * 26 + (letters.charCodeAt(i) - 64);
  }
  return idx - 1;
}

function indexToColLetter(idx: number): string {
  let n = idx + 1;
  let str = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    str = String.fromCharCode(65 + rem) + str;
    n = Math.floor((n - 1) / 26);
  }
  return str;
}

function parseXlsxMatrix(buf: Buffer): string[][] {
  const entries = extractZipEntries(buf);

  const sharedStrings: string[] = [];
  const sharedStringsXml = entries.get('xl/sharedStrings.xml')?.toString('utf-8');
  if (sharedStringsXml) {
    const siRegex = /<si\b[^>]*>([\s\S]*?)<\/si>/g;
    let siMatch: RegExpExecArray | null;
    while ((siMatch = siRegex.exec(sharedStringsXml)) !== null) {
      const inner = siMatch[1];
      const textParts: string[] = [];
      const tRegex = /<t\b[^>]*>([\s\S]*?)<\/t>/g;
      let tMatch: RegExpExecArray | null;
      while ((tMatch = tRegex.exec(inner)) !== null) {
        textParts.push(decodeXmlEntities(tMatch[1]));
      }
      sharedStrings.push(textParts.join(''));
    }
  }

  let sheetEntryName = 'xl/worksheets/sheet1.xml';
  if (!entries.has(sheetEntryName)) {
    const found = Array.from(entries.keys()).find((k) =>
      /^xl\/worksheets\/sheet\d+\.xml$/i.test(k)
    );
    if (!found) {
      throw new Error('Nenhuma aba encontrada no arquivo XLSX.');
    }
    sheetEntryName = found;
  }

  const sheetXml = entries.get(sheetEntryName)!.toString('utf-8');
  const rows: string[][] = [];

  const rowRegex = /<row\b[^>]*>([\s\S]*?)<\/row>/g;
  let rowMatch: RegExpExecArray | null;
  while ((rowMatch = rowRegex.exec(sheetXml)) !== null) {
    const rowContent = rowMatch[1];
    const rowValues: string[] = [];
    const cellRegex = /<c\b([^>]*)>([\s\S]*?)<\/c>/g;
    let cellMatch: RegExpExecArray | null;
    while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
      const attrs = cellMatch[1];
      const body = cellMatch[2];
      const refMatch = /\br="([A-Z]+)\d+"/i.exec(attrs);
      const typeMatch = /\bt="([^"]+)"/.exec(attrs);
      const cellType = typeMatch ? typeMatch[1] : '';
      const colIdx = refMatch ? colLettersToIndex(refMatch[1].toUpperCase()) : rowValues.length;

      let value = '';
      if (cellType === 's') {
        const vMatch = /<v>([\s\S]*?)<\/v>/.exec(body);
        if (vMatch) value = sharedStrings[Number(vMatch[1])] ?? '';
      } else if (cellType === 'inlineStr') {
        const tParts: string[] = [];
        const tRegex = /<t\b[^>]*>([\s\S]*?)<\/t>/g;
        let tM: RegExpExecArray | null;
        while ((tM = tRegex.exec(body)) !== null) {
          tParts.push(decodeXmlEntities(tM[1]));
        }
        value = tParts.join('');
      } else {
        const vMatch = /<v>([\s\S]*?)<\/v>/.exec(body);
        if (vMatch) value = decodeXmlEntities(vMatch[1]);
      }

      rowValues[colIdx] = value.trim();
    }

    if (rowValues.some((v) => v && v.trim() !== '')) {
      rows.push(Array.from(rowValues, (v) => v ?? ''));
    }
  }

  return rows;
}

function parseCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCsvMatrix(text: string): string[][] {
  const clean = text.replace(/^\uFEFF/, '');
  const lines = clean
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return [];

  const firstLine = lines[0];
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;

  let delimiter = ',';
  if (tabCount > semicolonCount && tabCount > commaCount) delimiter = '\t';
  else if (semicolonCount >= commaCount && semicolonCount > 0) delimiter = ';';

  return lines.map((line) => parseCsvLine(line, delimiter));
}

export function extractMatrixFromBuffer(buffer: Buffer, fileName: string): string[][] {
  const lowerName = fileName.toLowerCase();
  if (lowerName.endsWith('.xlsx')) {
    return parseXlsxMatrix(buffer);
  }
  let text = buffer.toString('utf-8');
  if (text.includes('\uFFFD')) {
    text = buffer.toString('latin1');
  }
  return parseCsvMatrix(text);
}

function looksLikeHtValue(val: string): boolean {
  const clean = val.trim().toUpperCase().replace(/[\s.-]+/g, '');
  return /^HT\d{4,10}[A-Z0-9]?$/.test(clean) || /^\d{5,10}$/.test(clean);
}

function looksLikeTurmaValue(val: string): boolean {
  const s = stripAccents(val);
  return (
    /(1|2|3).*?(auto|info|mec)/.test(s) ||
    s.includes('automacao') ||
    s.includes('informatica') ||
    s.includes('mecanica')
  );
}

/**
 * Inspects headers AND data patterns to auto-detect which column is Nome, HT, Cargo, Turma.
 */
export function inspectSpreadsheetBuffer(
  buffer: Buffer,
  fileName: string
): SpreadsheetInspection {
  const matrix = extractMatrixFromBuffer(buffer, fileName);
  if (matrix.length === 0) {
    return {
      columns: [],
      sampleRows: [],
      totalRows: 0,
      suggestedMapping: { nomeCol: 0, htCol: 1, roleCol: -1, turmaCol: -1, hasHeader: true },
    };
  }

  const colCount = Math.max(...matrix.map((r) => r.length));
  const padded = matrix.map((r) =>
    Array.from({ length: colCount }, (_, idx) => (r[idx] ?? '').trim())
  );

  const firstRowNorm = padded[0].map((c) => stripAccents(c));
  const headerKeywords = firstRowNorm.some(
    (h) =>
      h.includes('nome') ||
      h === 'name' ||
      h === 'ht' ||
      h.includes('prontuario') ||
      h.includes('matricula') ||
      h.includes('cargo') ||
      h.includes('perfil') ||
      h.includes('funcao') ||
      h.includes('turma')
  );
  const firstRowHasHtData = padded[0].some((c) => looksLikeHtValue(c));
  const hasHeader = headerKeywords && !firstRowHasHtData;

  const dataRows = hasHeader ? padded.slice(1) : padded;
  const sampleSlice = dataRows.slice(0, 12);

  let nomeCol = -1;
  let htCol = -1;
  let roleCol = -1;
  let turmaCol = -1;

  // 1) Try header-name matching first
  if (hasHeader) {
    nomeCol = firstRowNorm.findIndex(
      (h) => h.includes('nome') || h === 'name' || h.includes('servidor') || h.includes('docente')
    );
    htCol = firstRowNorm.findIndex(
      (h) =>
        h === 'ht' ||
        h.includes('prontuario') ||
        h.includes('matricula') ||
        h.includes('codigo') ||
        h.includes('registro')
    );
    roleCol = firstRowNorm.findIndex(
      (h) =>
        h.includes('cargo') ||
        h.includes('perfil') ||
        h.includes('tipo') ||
        h.includes('funcao') ||
        h.includes('role') ||
        h.includes('categoria')
    );
    turmaCol = firstRowNorm.findIndex(
      (h) => h.includes('turma') || h.includes('sala') || h.includes('curso') || h.includes('serie')
    );
  }

  // 2) Content-based pattern detection for any column still unrecognized
  if (sampleSlice.length > 0) {
    if (htCol === -1) {
      let bestCol = -1;
      let bestScore = 0;
      for (let c = 0; c < colCount; c++) {
        const score = sampleSlice.filter((r) => looksLikeHtValue(r[c] ?? '')).length;
        if (score > bestScore) {
          bestScore = score;
          bestCol = c;
        }
      }
      if (bestScore > 0) htCol = bestCol;
    }

    if (roleCol === -1) {
      let bestCol = -1;
      let bestScore = 0;
      for (let c = 0; c < colCount; c++) {
        if (c === htCol || c === nomeCol) continue;
        const score = sampleSlice.filter((r) => parseRoleString(r[c]) !== null).length;
        if (score > bestScore) {
          bestScore = score;
          bestCol = c;
        }
      }
      if (bestScore >= Math.max(1, Math.ceil(sampleSlice.length * 0.4))) {
        roleCol = bestCol;
      }
    }

    if (turmaCol === -1) {
      let bestCol = -1;
      let bestScore = 0;
      for (let c = 0; c < colCount; c++) {
        if (c === htCol || c === nomeCol || c === roleCol) continue;
        const score = sampleSlice.filter((r) => looksLikeTurmaValue(r[c] ?? '')).length;
        if (score > bestScore) {
          bestScore = score;
          bestCol = c;
        }
      }
      if (bestScore > 0) turmaCol = bestCol;
    }

    if (nomeCol === -1) {
      let bestCol = -1;
      let bestScore = -1;
      for (let c = 0; c < colCount; c++) {
        if (c === htCol || c === roleCol || c === turmaCol) continue;
        const score = sampleSlice.filter((r) => {
          const v = r[c] ?? '';
          return v.length >= 3 && /[a-zA-ZÀ-ÿ]/.test(v) && !looksLikeHtValue(v);
        }).length;
        if (score > bestScore) {
          bestScore = score;
          bestCol = c;
        }
      }
      if (bestCol !== -1) nomeCol = bestCol;
    }
  }

  if (nomeCol === -1) nomeCol = 0;
  if (htCol === -1) htCol = colCount > 1 ? (nomeCol === 0 ? 1 : 0) : 0;

  const columns = Array.from({ length: colCount }, (_, idx) => {
    const letter = indexToColLetter(idx);
    const headerLabel = hasHeader && padded[0][idx] ? `${padded[0][idx]} (Col. ${letter})` : `Coluna ${letter}`;
    const samples = dataRows
      .slice(0, 3)
      .map((r) => r[idx])
      .filter((v) => v.length > 0);
    return { index: idx, label: headerLabel, samples };
  });

  return {
    columns,
    sampleRows: padded.slice(0, 6),
    totalRows: dataRows.length,
    suggestedMapping: {
      nomeCol,
      htCol,
      roleCol,
      turmaCol,
      hasHeader,
    },
  };
}

export function parseSpreadsheetWithMapping(
  buffer: Buffer,
  fileName: string,
  defaultRole: UserRole,
  mappingOverride?: Partial<SpreadsheetColumnMapping>
): { rows: ParsedSpreadsheetRow[]; mapping: SpreadsheetColumnMapping } {
  const inspection = inspectSpreadsheetBuffer(buffer, fileName);
  const mapping: SpreadsheetColumnMapping = {
    ...inspection.suggestedMapping,
    ...mappingOverride,
  };

  const matrix = extractMatrixFromBuffer(buffer, fileName);
  if (matrix.length === 0) {
    return { rows: [], mapping };
  }

  const startRow = mapping.hasHeader ? 1 : 0;
  const rows: ParsedSpreadsheetRow[] = [];

  for (let i = startRow; i < matrix.length; i++) {
    const cols = matrix[i];
    const nome = (cols[mapping.nomeCol] ?? '').trim();
    const rawHt = (cols[mapping.htCol] ?? '').trim();
    const ht = normalizeHt(rawHt);
    const roleRaw = mapping.roleCol >= 0 ? (cols[mapping.roleCol] ?? '').trim() : '';
    const turma = mapping.turmaCol >= 0 ? (cols[mapping.turmaCol] ?? '').trim() : undefined;

    if (!nome && !rawHt) continue;

    const role = parseRoleString(roleRaw, defaultRole);
    let error: string | undefined;

    if (!nome || nome.length < 2) {
      error = 'Nome ausente ou muito curto';
    } else if (!ht || ht.length < 4) {
      error = 'HT ausente ou inválido';
    } else if (!role) {
      error = `Cargo "${roleRaw}" não permitido (use Professor, Técnico Administrativo, Representante de Classe ou Administrador)`;
    }

    rows.push({
      lineNumber: i + 1,
      nome,
      ht,
      role,
      roleRaw: roleRaw || undefined,
      turma: turma || undefined,
      error,
    });
  }

  return { rows, mapping };
}
