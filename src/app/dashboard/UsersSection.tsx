'use client';

import React, { useRef, useState } from 'react';
import {
  canDeleteUser,
  canResetUserPassword,
  canToggleSuperuser,
  getAssignableRoles,
  isEffectiveSuperuser,
  type PermissionActor,
} from '@/lib/permissions';
import type { SpreadsheetColumnMapping } from '@/lib/spreadsheet';
import {
  ROLE_LABELS,
  ROOMS,
  type PublicUser,
  type UserRole,
} from '@/lib/types';

interface ColumnInfo {
  index: number;
  label: string;
  samples: string[];
}

interface InspectResponse {
  fileName: string;
  columns: ColumnInfo[];
  sampleRows: string[][];
  totalRows: number;
  suggestedMapping: SpreadsheetColumnMapping;
}

interface PreviewRow {
  lineNumber: number;
  nome: string;
  ht: string;
  role: UserRole | null;
  roleRaw?: string;
  turma?: string;
  status: 'novo' | 'duplicado' | 'invalido';
  reason?: string;
}

interface PreviewResponse {
  fileName: string;
  mapping: SpreadsheetColumnMapping;
  rows: PreviewRow[];
  summary: {
    total: number;
    novos: number;
    duplicados: number;
    invalidos: number;
  };
}

const ROLE_BADGE: Record<UserRole, string> = {
  admin: 'bg-purple-50 text-purple-700 border-purple-200',
  professor: 'bg-blue-50 text-blue-700 border-blue-200',
  tecnico: 'bg-amber-50 text-amber-800 border-amber-200',
  representante: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export function UsersSection({
  users,
  actor,
  onUsersChange,
  onToast,
}: {
  users: PublicUser[];
  actor: PermissionActor;
  onUsersChange: () => Promise<void>;
  onToast: (msg: string, type?: 'ok' | 'err') => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const actorIsSuper = isEffectiveSuperuser(actor.role, actor.isSuperuser);
  const assignableRoles = getAssignableRoles(actor);

  // Manual creation
  const [nome, setNome] = useState('');
  const [ht, setHt] = useState('');
  const [role, setRole] = useState<UserRole>('professor');
  const [makeSuperuser, setMakeSuperuser] = useState(false);
  const [turma, setTurma] = useState('');
  const [creating, setCreating] = useState(false);

  // 3-step spreadsheet importer: upload -> confirm-columns -> preview
  const [importStep, setImportStep] = useState<'upload' | 'confirm-columns' | 'preview'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inspection, setInspection] = useState<InspectResponse | null>(null);
  const [mapping, setMapping] = useState<SpreadsheetColumnMapping>({
    nomeCol: 0,
    htCol: 1,
    roleCol: -1,
    turmaCol: -1,
    hasHeader: true,
  });
  const [defaultRole, setDefaultRole] = useState<UserRole>('professor');
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [busyImport, setBusyImport] = useState(false);

  // Table filter
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

  function downloadTemplateCsv() {
    const csvContent =
      '\uFEFFNome;HT;Cargo;Turma\n' +
      'Prof. Marcos Oliveira;HT3010101;Professor;\n' +
      'Ana Paula Santos;HT3010102;Técnico Administrativo;\n' +
      'Lucas Ferreira;HT3010103;Representante de Classe;3º Automação\n' +
      'Beatriz Lima;HT3010104;Representante de Classe;2º Informática\n' +
      'Gabriel Rocha;HT3010105;Representante de Classe;1º Mecânica\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modelo-cadastro-life.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function resetImporter() {
    setImportStep('upload');
    setSelectedFile(null);
    setInspection(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // Step 1 -> Step 2: Inspect file & auto-detect columns
  async function handleFileSelect(file: File | null) {
    if (!file) return;
    setSelectedFile(file);
    setBusyImport(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('mode', 'inspect');

      const res = await fetch('/api/users/import', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        onToast(data.error || 'Erro ao ler planilha.', 'err');
        resetImporter();
        return;
      }

      const info = data as InspectResponse;
      setInspection(info);
      setMapping(info.suggestedMapping);
      setImportStep('confirm-columns');
    } catch {
      onToast('Falha ao inspecionar planilha.', 'err');
      resetImporter();
    } finally {
      setBusyImport(false);
    }
  }

  // Step 2 -> Step 3: Validate with user-confirmed columns
  async function handleValidateColumns() {
    if (!selectedFile) return;
    setBusyImport(true);
    try {
      const fd = new FormData();
      fd.append('file', selectedFile);
      fd.append('mode', 'preview');
      fd.append('defaultRole', defaultRole);
      fd.append('nomeCol', String(mapping.nomeCol));
      fd.append('htCol', String(mapping.htCol));
      fd.append('roleCol', String(mapping.roleCol));
      fd.append('turmaCol', String(mapping.turmaCol));
      fd.append('hasHeader', String(mapping.hasHeader));

      const res = await fetch('/api/users/import', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        onToast(data.error || 'Erro ao validar colunas.', 'err');
        return;
      }
      setPreview(data as PreviewResponse);
      setImportStep('preview');
    } catch {
      onToast('Erro ao validar planilha.', 'err');
    } finally {
      setBusyImport(false);
    }
  }

  // Step 3 -> Commit import
  async function handleConfirmImport() {
    if (!selectedFile) return;
    setBusyImport(true);
    try {
      const fd = new FormData();
      fd.append('file', selectedFile);
      fd.append('mode', 'commit');
      fd.append('defaultRole', defaultRole);
      fd.append('nomeCol', String(mapping.nomeCol));
      fd.append('htCol', String(mapping.htCol));
      fd.append('roleCol', String(mapping.roleCol));
      fd.append('turmaCol', String(mapping.turmaCol));
      fd.append('hasHeader', String(mapping.hasHeader));

      const res = await fetch('/api/users/import', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        onToast(data.error || 'Erro ao importar planilha.', 'err');
        return;
      }
      onToast(
        `${data.importedCount} usuário(s) pré-cadastrado(s) sem senha! Já podem criar a senha no 1º acesso.`
      );
      resetImporter();
      await onUsersChange();
    } catch {
      onToast('Erro ao salvar importação.', 'err');
    } finally {
      setBusyImport(false);
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          ht,
          role,
          isSuperuser:
            actorIsSuper && (role === 'professor' || role === 'tecnico')
              ? makeSuperuser
              : role === 'admin',
          turma: role === 'representante' ? turma : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onToast(data.error || 'Erro ao cadastrar usuário.', 'err');
        return;
      }
      setNome('');
      setHt('');
      setTurma('');
      setMakeSuperuser(false);
      onToast(`${data.user.nome} (${data.user.ht}) pré-cadastrado sem senha!`);
      await onUsersChange();
    } catch {
      onToast('Erro de conexão.', 'err');
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleSuperuser(user: PublicUser) {
    const nextVal = !user.isSuperuser;
    const res = await fetch(`/api/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle-superuser', isSuperuser: nextVal }),
    });
    const data = await res.json();
    if (res.ok) {
      onToast(
        nextVal
          ? `${user.nome} agora é Superusuário e pode remover outros usuários.`
          : `Permissão de Superusuário removida de ${user.nome}.`
      );
      await onUsersChange();
    } else {
      onToast(data.error || 'Sem permissão.', 'err');
    }
  }

  async function handleResetPassword(user: PublicUser) {
    if (
      !confirm(
        `Resetar a senha de ${user.nome} (${user.ht})? No próximo login, a pessoa deverá criar uma nova senha.`
      )
    ) {
      return;
    }
    const res = await fetch(`/api/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset-password' }),
    });
    const data = await res.json();
    if (res.ok) {
      onToast(`Senha de ${user.nome} limpa. Aguardando novo 1º acesso.`);
      await onUsersChange();
    } else {
      onToast(data.error || 'Erro ao resetar senha.', 'err');
    }
  }

  async function handleDeleteUser(user: PublicUser) {
    if (!confirm(`Remover o acesso de ${user.nome} (${user.ht})?`)) return;
    const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) {
      onToast(`Usuário ${user.ht} removido.`);
      await onUsersChange();
    } else {
      onToast(data.error || 'Erro ao remover usuário.', 'err');
    }
  }

  const filtered = users.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q || u.nome.toLowerCase().includes(q) || u.ht.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  const sampleDataRows = inspection
    ? mapping.hasHeader
      ? inspection.sampleRows.slice(1, 5)
      : inspection.sampleRows.slice(0, 4)
    : [];

  return (
    <div className="space-y-6">
      {/* Permission Summary Banner */}
      <div className="rounded-2xl bg-white border border-zinc-200/80 px-5 py-3.5 text-xs text-zinc-600 flex flex-wrap items-center justify-between gap-2">
        <div>
          <strong className="text-[#1d1d1f]">Suas permissões:</strong>{' '}
          {actor.role === 'admin' &&
            'Administrador (Superusuário total da equipe do projeto — pode cadastrar e remover qualquer cargo e promover superusuários).'}
          {actor.role !== 'admin' &&
            actorIsSuper &&
            'Superusuário — você pode cadastrar/importar usuários, promover superusuários e apagar Professores, Técnicos e Representantes.'}
          {!actorIsSuper &&
            'Você pode cadastrar/importar usuários e apagar Representantes de Classe. Para apagar Professores ou Técnicos, é necessário um Superusuário ou Administrador.'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ════ SPREADSHEET IMPORT CARD (3 STEPS) ════ */}
        <div className="lg:col-span-7 rounded-3xl bg-white border border-zinc-200/80 shadow-xs p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full mb-2">
                📊 Importação inteligente por planilha
              </span>
              <h3
                className="text-xl font-bold text-[#1d1d1f]"
                style={{ fontFamily: 'var(--font-space), sans-serif' }}
              >
                Importar Nome e HT (.xlsx / .csv)
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                O sistema reconhece automaticamente qual coluna é qual e pede sua confirmação antes
                de cadastrar sem senha.
              </p>
            </div>

            <button
              type="button"
              onClick={downloadTemplateCsv}
              className="px-3.5 py-2 rounded-full text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition cursor-pointer shrink-0"
            >
              ⬇ Baixar modelo (.csv)
            </button>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-4 text-[11px] font-bold">
            {[
              { id: 'upload', label: '1. Enviar arquivo' },
              { id: 'confirm-columns', label: '2. Confirmar colunas' },
              { id: 'preview', label: '3. Revisar e cadastrar' },
            ].map((s) => (
              <span
                key={s.id}
                className={`px-2.5 py-1 rounded-full ${
                  importStep === s.id
                    ? 'bg-[#1d1d1f] text-white'
                    : 'bg-zinc-100 text-zinc-500'
                }`}
              >
                {s.label}
              </span>
            ))}
          </div>

          {/* STEP 1: UPLOAD */}
          {importStep === 'upload' && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                void handleFileSelect(e.dataTransfer.files?.[0] ?? null);
              }}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-2xl border-2 border-dashed border-zinc-300 hover:border-zinc-900 bg-zinc-50/70 hover:bg-zinc-50 p-8 text-center transition cursor-pointer"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.csv,.tsv,.txt"
                className="hidden"
                onChange={(e) => void handleFileSelect(e.target.files?.[0] ?? null)}
              />
              <div className="text-3xl mb-2">📄</div>
              <p className="text-sm font-semibold text-[#1d1d1f]">
                {busyImport
                  ? 'Analisando colunas da planilha...'
                  : 'Clique ou arraste sua planilha (.xlsx ou .csv) aqui'}
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Não precisa seguir um padrão rígido — vamos identificar as colunas e perguntar se
                estão certas!
              </p>
            </div>
          )}

          {/* STEP 2: CONFIRM AUTO-DETECTED COLUMNS */}
          {importStep === 'confirm-columns' && inspection && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-blue-50 border border-blue-200/80 px-4 py-3 text-xs text-blue-900">
                <strong>🔎 As colunas abaixo estão certas?</strong> Detectamos automaticamente as
                colunas de <strong>{inspection.fileName}</strong> ({inspection.totalRows} linha(s)).
                Ajuste se necessário e clique em confirmar.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    Coluna de Nome *
                  </label>
                  <select
                    value={mapping.nomeCol}
                    onChange={(e) =>
                      setMapping({ ...mapping, nomeCol: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold focus:outline-none focus:border-zinc-900"
                  >
                    {inspection.columns.map((c) => (
                      <option key={c.index} value={c.index}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    Coluna de HT *
                  </label>
                  <select
                    value={mapping.htCol}
                    onChange={(e) =>
                      setMapping({ ...mapping, htCol: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold focus:outline-none focus:border-zinc-900"
                  >
                    {inspection.columns.map((c) => (
                      <option key={c.index} value={c.index}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    Coluna de Cargo (opcional)
                  </label>
                  <select
                    value={mapping.roleCol}
                    onChange={(e) =>
                      setMapping({ ...mapping, roleCol: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold focus:outline-none focus:border-zinc-900"
                  >
                    <option value={-1}>Não usar coluna (usar cargo padrão)</option>
                    {inspection.columns.map((c) => (
                      <option key={c.index} value={c.index}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    Coluna de Turma (opcional)
                  </label>
                  <select
                    value={mapping.turmaCol}
                    onChange={(e) =>
                      setMapping({ ...mapping, turmaCol: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold focus:outline-none focus:border-zinc-900"
                  >
                    <option value={-1}>Nenhuma</option>
                    {inspection.columns.map((c) => (
                      <option key={c.index} value={c.index}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <label className="flex items-center gap-2 text-xs font-medium text-zinc-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mapping.hasHeader}
                    onChange={(e) =>
                      setMapping({ ...mapping, hasHeader: e.target.checked })
                    }
                    className="rounded border-zinc-300"
                  />
                  A primeira linha é cabeçalho
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-zinc-500">Cargo padrão:</span>
                  <select
                    value={defaultRole}
                    onChange={(e) => setDefaultRole(e.target.value as UserRole)}
                    className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-semibold"
                  >
                    {assignableRoles.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sample preview with chosen columns */}
              <div className="rounded-2xl border border-zinc-200 overflow-hidden">
                <div className="bg-zinc-50 px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200">
                  Amostra lida com as colunas selecionadas
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white border-b border-zinc-100 text-zinc-400">
                      <tr>
                        <th className="px-3 py-2">Nome</th>
                        <th className="px-3 py-2">HT</th>
                        <th className="px-3 py-2">Cargo</th>
                        {mapping.turmaCol >= 0 && <th className="px-3 py-2">Turma</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 bg-white">
                      {sampleDataRows.map((row, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2 font-medium text-zinc-900">
                            {row[mapping.nomeCol] || '—'}
                          </td>
                          <td className="px-3 py-2 font-mono text-zinc-700">
                            {row[mapping.htCol] || '—'}
                          </td>
                          <td className="px-3 py-2 text-zinc-600">
                            {mapping.roleCol >= 0
                              ? row[mapping.roleCol] || `(${ROLE_LABELS[defaultRole]})`
                              : ROLE_LABELS[defaultRole]}
                          </td>
                          {mapping.turmaCol >= 0 && (
                            <td className="px-3 py-2 text-zinc-500">
                              {row[mapping.turmaCol] || '—'}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={resetImporter}
                  className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 cursor-pointer"
                >
                  ← Trocar arquivo
                </button>
                <button
                  type="button"
                  disabled={busyImport}
                  onClick={() => void handleValidateColumns()}
                  className="px-5 py-2.5 rounded-full bg-[#1d1d1f] hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-bold transition cursor-pointer"
                >
                  {busyImport ? 'Validando...' : 'Sim, colunas certas →'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: VALIDATED PREVIEW & COMMIT */}
          {importStep === 'preview' && preview && (
            <div className="border border-zinc-200 rounded-2xl overflow-hidden">
              <div className="bg-zinc-50 px-4 py-3 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {preview.summary.novos} novo(s)
                  </span>
                  {preview.summary.duplicados > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {preview.summary.duplicados} já existe(m)
                    </span>
                  )}
                  {preview.summary.invalidos > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700">
                      {preview.summary.invalidos} inválido(s)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setImportStep('confirm-columns')}
                    className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 px-2 py-1 cursor-pointer"
                  >
                    ← Ajustar colunas
                  </button>
                  <button
                    type="button"
                    disabled={busyImport || preview.summary.novos === 0}
                    onClick={() => void handleConfirmImport()}
                    className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold transition cursor-pointer"
                  >
                    {busyImport
                      ? 'Importando...'
                      : `Cadastrar ${preview.summary.novos} sem senha`}
                  </button>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white sticky top-0 border-b border-zinc-100 text-zinc-400 uppercase">
                    <tr>
                      <th className="px-4 py-2">Nome</th>
                      <th className="px-4 py-2">HT</th>
                      <th className="px-4 py-2">Cargo</th>
                      <th className="px-4 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 bg-white">
                    {preview.rows.map((r) => (
                      <tr key={`${r.lineNumber}-${r.ht}`}>
                        <td className="px-4 py-2 font-medium text-zinc-900">
                          {r.nome || '—'}
                        </td>
                        <td className="px-4 py-2 font-mono text-zinc-600">{r.ht || '—'}</td>
                        <td className="px-4 py-2">
                          {r.role ? ROLE_LABELS[r.role] : r.roleRaw || '—'}
                        </td>
                        <td className="px-4 py-2">
                          {r.status === 'novo' && (
                            <span className="text-emerald-700 font-bold">Pronto</span>
                          )}
                          {r.status === 'duplicado' && (
                            <span className="text-amber-700 font-semibold">{r.reason}</span>
                          )}
                          {r.status === 'invalido' && (
                            <span className="text-red-600 font-semibold">{r.reason}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ════ MANUAL INDIVIDUAL REGISTRATION CARD ════ */}
        <div className="lg:col-span-5 rounded-3xl bg-white border border-zinc-200/80 shadow-xs p-6">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full mb-2">
            👤 Cadastro manual
          </span>
          <h3
            className="text-xl font-bold text-[#1d1d1f] mb-1"
            style={{ fontFamily: 'var(--font-space), sans-serif' }}
          >
            Pré-cadastrar pessoa
          </h3>
          <p className="text-xs text-zinc-500 mb-4">
            Cadastra sem senha; a pessoa cria a senha no primeiro acesso com o HT.
          </p>

          <form onSubmit={handleCreateUser} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                Nome completo
              </label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex.: Prof. Roberto Silva"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 px-3.5 py-2.5 text-sm focus:outline-none focus:bg-white focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                Prontuário (HT) ou E-mail
              </label>
              <input
                type="text"
                required
                value={ht}
                onChange={(e) => setHt(e.target.value)}
                placeholder="Ex.: HT3020456 ou equipe@email.com"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 px-3.5 py-2.5 text-sm font-mono font-semibold focus:outline-none focus:bg-white focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                Cargo
              </label>
              <select
                value={role}
                onChange={(e) => {
                  const nextRole = e.target.value as UserRole;
                  setRole(nextRole);
                  if (nextRole !== 'professor' && nextRole !== 'tecnico') {
                    setMakeSuperuser(false);
                  }
                }}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:bg-white focus:border-zinc-900"
              >
                {assignableRoles.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                    {r === 'admin' ? ' (Equipe · Superusuário)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {actorIsSuper && (role === 'professor' || role === 'tecnico') && (
              <label className="flex items-center gap-2 text-xs font-semibold text-purple-800 bg-purple-50 border border-purple-200/80 px-3 py-2.5 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={makeSuperuser}
                  onChange={(e) => setMakeSuperuser(e.target.checked)}
                  className="rounded border-purple-300"
                />
                ⭐ Marcar como Superusuário (pode apagar outros usuários)
              </label>
            )}

            {role === 'representante' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Sala que representa (obrigatório)
                </label>
                <select
                  required
                  value={turma}
                  onChange={(e) => setTurma(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/70 px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:bg-white focus:border-zinc-900"
                >
                  <option value="">Selecione a sala</option>
                  {ROOMS.map((room) => (
                    <option key={room.turma} value={room.turma}>
                      {room.turma}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={creating}
              className="w-full rounded-full bg-[#1d1d1f] hover:bg-zinc-800 disabled:opacity-50 text-white font-semibold py-3 text-sm transition cursor-pointer"
            >
              {creating ? 'Cadastrando...' : 'Cadastrar sem senha'}
            </button>
          </form>
        </div>
      </div>

      {/* ════ USERS TABLE ════ */}
      <div className="rounded-3xl bg-white border border-zinc-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3
              className="text-lg font-bold text-[#1d1d1f]"
              style={{ fontFamily: 'var(--font-space), sans-serif' }}
            >
              Usuários cadastrados ({filtered.length})
            </h3>
            <p className="text-xs text-zinc-500">
              Administradores, Professores, Técnicos Administrativos e Representantes de Classe
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar nome ou HT..."
              className="rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs focus:outline-none focus:bg-white focus:border-zinc-900"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'all' | UserRole)}
              className="rounded-full border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-zinc-900"
            >
              <option value="all">Todos os cargos</option>
              <option value="admin">Administradores</option>
              <option value="professor">Professores</option>
              <option value="tecnico">Técnicos Admin.</option>
              <option value="representante">Representantes</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50/70 text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-100">
              <tr>
                <th className="px-5 py-3">Nome</th>
                <th className="px-5 py-3">HT</th>
                <th className="px-5 py-3">Cargo</th>
                <th className="px-5 py-3">Acesso</th>
                <th className="px-5 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((u) => {
                const allowSuper = canToggleSuperuser(actor, u);
                const allowReset = canResetUserPassword(actor, u);
                const allowDelete = canDeleteUser(actor, u);

                return (
                  <tr key={u.id} className="hover:bg-zinc-50/60 transition">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-[#1d1d1f]">{u.nome}</p>
                      {u.turma && <p className="text-xs text-zinc-400">Turma: {u.turma}</p>}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-zinc-700">
                      {u.ht}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-flex text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${ROLE_BADGE[u.role]}`}
                        >
                          {ROLE_LABELS[u.role]}
                        </span>
                        {u.isSuperuser && (
                          <span className="inline-flex text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-600 text-white">
                            ⭐ Super
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {u.hasPassword ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Senha ativa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Aguardando 1º acesso
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap space-x-1.5">
                      {allowSuper && (
                        <button
                          type="button"
                          onClick={() => void handleToggleSuperuser(u)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full transition cursor-pointer ${
                            u.isSuperuser
                              ? 'bg-purple-100 hover:bg-purple-200 text-purple-800'
                              : 'bg-zinc-100 hover:bg-purple-100 text-zinc-700 hover:text-purple-800'
                          }`}
                        >
                          {u.isSuperuser ? 'Tirar Super' : '⭐ Super'}
                        </button>
                      )}
                      {allowReset && u.hasPassword && (
                        <button
                          type="button"
                          onClick={() => void handleResetPassword(u)}
                          className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-full transition cursor-pointer"
                        >
                          Resetar senha
                        </button>
                      )}
                      {allowDelete && (
                        <button
                          type="button"
                          onClick={() => void handleDeleteUser(u)}
                          className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition cursor-pointer"
                        >
                          Remover
                        </button>
                      )}
                      {!allowSuper && !allowReset && !allowDelete && (
                        <span className="text-[11px] text-zinc-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-zinc-400">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
