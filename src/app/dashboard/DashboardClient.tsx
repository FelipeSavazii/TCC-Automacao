'use client';

import React, { useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { canAccessUsersSection } from '@/lib/permissions';
import {
  AVISO_CATEGORIA_LABELS,
  ROLE_LABELS,
  TURMAS,
  type Aviso,
  type AvisoCategoria,
  type PublicUser,
  type TotemPowerState,
  type UserRole,
} from '@/lib/types';
import { UsersSection } from './UsersSection';
import { TotemControlSection, type TotemStatusInfo } from './TotemControlSection';

type Tab = 'overview' | 'avisos' | 'usuarios' | 'totem';

interface CurrentUser {
  userId: string;
  ht: string;
  nome: string;
  role: UserRole;
  isSuperuser: boolean;
  turma?: string;
}

const CATEGORIA_STYLE: Record<AvisoCategoria, string> = {
  urgente: 'bg-[#ff3b30]/12 text-[#d70015] border-[#ff3b30]/25',
  sala: 'bg-[#ff9f0a]/15 text-[#9a5700] border-[#ff9f0a]/30',
  prova: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
  evento: 'bg-[#0071e3]/10 text-[#0071e3] border-[#0071e3]/20',
  comunicado: 'bg-black/[0.05] text-[#424245] border-black/[0.08]',
};

export function DashboardClient({
  currentUser,
  initialAvisos,
  initialUsers,
  initialPowerState,
  initialTotemStatus,
}: {
  currentUser: CurrentUser;
  initialAvisos: Aviso[];
  initialUsers: PublicUser[];
  initialPowerState: TotemPowerState;
  initialTotemStatus: TotemStatusInfo;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [avisos, setAvisos] = useState<Aviso[]>(initialAvisos);
  const [users, setUsers] = useState<PublicUser[]>(initialUsers);
  const [powerState, setPowerState] = useState<TotemPowerState>(initialPowerState);
  const [totemStatus, setTotemStatus] = useState<TotemStatusInfo>(initialTotemStatus);

  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const showToast = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const [avisoSearch, setAvisoSearch] = useState('');
  const [avisoTurmaFilter, setAvisoTurmaFilter] = useState('all');

  const [avisoModalOpen, setAvisoModalOpen] = useState(false);
  const [editingAvisoId, setEditingAvisoId] = useState<string | null>(null);
  const [avisoForm, setAvisoForm] = useState({
    titulo: '',
    conteudo: '',
    turma: currentUser.turma || 'Geral / Campus',
    categoria: 'comunicado' as AvisoCategoria,
    urgente: false,
  });
  const [savingAviso, setSavingAviso] = useState(false);

  const canManageUsers = canAccessUsersSection(currentUser.role);
  const isRepresentante = currentUser.role === 'representante';
  const canEditAviso = (a: Aviso) =>
    !isRepresentante || (Boolean(currentUser.turma) && a.turma === currentUser.turma);

  async function refreshAvisos() {
    const res = await fetch('/api/avisos');
    if (res.ok) {
      const data = await res.json();
      setAvisos(data.avisos);
    }
  }

  async function refreshUsers() {
    const res = await fetch('/api/users');
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
    }
  }

  async function refreshTotemStatus() {
    const res = await fetch('/api/totem/input');
    if (res.ok) {
      const data = await res.json();
      setTotemStatus(data);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  function openNewAviso() {
    setEditingAvisoId(null);
    setAvisoForm({
      titulo: '',
      conteudo: '',
      turma: currentUser.turma || 'Geral / Campus',
      categoria: 'comunicado',
      urgente: false,
    });
    setAvisoModalOpen(true);
  }

  function openEditAviso(a: Aviso) {
    setEditingAvisoId(a.id);
    setAvisoForm({
      titulo: a.titulo,
      conteudo: a.conteudo,
      turma: a.turma,
      categoria: a.categoria,
      urgente: a.urgente,
    });
    setAvisoModalOpen(true);
  }

  async function handleSaveAviso(e: React.FormEvent) {
    e.preventDefault();
    setSavingAviso(true);
    try {
      const url = editingAvisoId ? `/api/avisos/${editingAvisoId}` : '/api/avisos';
      const method = editingAvisoId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(avisoForm),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Erro ao salvar aviso.', 'err');
        return;
      }
      setAvisoModalOpen(false);
      showToast(
        editingAvisoId
          ? 'Aviso atualizado e sincronizado com o totem.'
          : 'Aviso publicado ao vivo no totem!'
      );
      await refreshAvisos();
    } finally {
      setSavingAviso(false);
    }
  }

  async function handleToggleAvisoAtivo(a: Aviso) {
    const res = await fetch(`/api/avisos/${a.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: !a.ativo }),
    });
    if (res.ok) {
      showToast(a.ativo ? 'Aviso ocultado do totem.' : 'Aviso reativado no totem.');
      await refreshAvisos();
    }
  }

  async function handleDeleteAviso(a: Aviso) {
    if (!confirm(`Excluir o aviso "${a.titulo}"?`)) return;
    const res = await fetch(`/api/avisos/${a.id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Aviso excluído.');
      await refreshAvisos();
    }
  }

  const filteredAvisos = avisos.filter((a) => {
    const matchesTurma = avisoTurmaFilter === 'all' || a.turma === avisoTurmaFilter;
    const q = avisoSearch.trim().toLowerCase();
    const matchesQ =
      !q ||
      a.titulo.toLowerCase().includes(q) ||
      a.conteudo.toLowerCase().includes(q) ||
      a.turma.toLowerCase().includes(q);
    return matchesTurma && matchesQ;
  });

  const activeAvisosCount = avisos.filter((a) => a.ativo).length;
  const urgentAvisosCount = avisos.filter((a) => a.ativo && a.urgente).length;
  const pendingUsersCount = users.filter((u) => !u.hasPassword).length;

  const navItems: Array<{ id: Tab; label: string; count?: number }> = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'avisos', label: 'Avisos', count: activeAvisosCount },
    ...(canManageUsers
      ? [{ id: 'usuarios' as Tab, label: 'Usuários & Planilha', count: users.length }]
      : []),
    { id: 'totem', label: 'Totem & ESP32' },
  ];

  function formatTurmaBadge(turma: string) {
    return turma;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] flex flex-col">
      {/* Floating Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl text-[13px] font-semibold text-white backdrop-blur-xl transition ${
            toast.type === 'err' ? 'bg-[#ff3b30]' : 'bg-[#1d1d1f]/95'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* ════ FROSTED APPLE TOPBAR ════ */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-2xl border-b border-black/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 rounded-[10px] bg-[#1d1d1f] text-white flex items-center justify-center shadow-sm">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z" />
              </svg>
            </div>
            <span className="font-display font-bold text-[16px] tracking-tight text-[#1d1d1f]">
              Life <span className="text-xs font-normal text-[#86868b]">· Dashboard</span>
            </span>
          </Link>

          {/* Segmented Control (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-[#f5f5f7] p-1 rounded-full border border-black/[0.05]">
            {navItems.map((item) => {
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setTab(item.id);
                    if (item.id === 'totem') void refreshTotemStatus();
                  }}
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-semibold transition cursor-pointer ${
                    active
                      ? 'bg-white text-[#1d1d1f] shadow-xs'
                      : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.count !== undefined && (
                    <span
                      className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                        active ? 'bg-[#f5f5f7] text-[#1d1d1f]' : 'bg-black/[0.05] text-[#6e6e73]'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right User Controls */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/totem"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#1d1d1f] hover:bg-zinc-800 text-white transition"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#30d158]" />
              Modo Totem
            </Link>

            <div className="hidden lg:flex items-center gap-2.5 pl-3 pr-1.5 py-1 rounded-full bg-[#f5f5f7] border border-black/[0.05]">
              <div className="text-right leading-tight">
                <p className="text-xs font-semibold text-[#1d1d1f] flex items-center justify-end gap-1">
                  {currentUser.nome}
                  {currentUser.isSuperuser && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#0071e3] text-white">
                      SUPER
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-[#86868b]">
                  {currentUser.ht} · {ROLE_LABELS[currentUser.role]}
                </p>
              </div>
              <div className="w-7 h-7 rounded-full bg-[#1d1d1f] text-white text-xs font-bold flex items-center justify-center">
                {currentUser.nome.slice(0, 1).toUpperCase()}
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#6e6e73] hover:text-[#1d1d1f] bg-[#f5f5f7] hover:bg-black/[0.08] transition cursor-pointer"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Mobile Segmented Tabs */}
        <div className="md:hidden px-4 pb-2.5 overflow-x-auto">
          <nav className="flex items-center gap-1.5">
            {navItems.map((item) => {
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setTab(item.id);
                    if (item.id === 'totem') void refreshTotemStatus();
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    active
                      ? 'bg-[#1d1d1f] text-white'
                      : 'bg-[#f5f5f7] text-[#6e6e73]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ════ MAIN CONTENT ════ */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div className="space-y-6 animate-fade-up">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#86868b]">
                  Painel de Avisos · IFSP Hortolândia
                </p>
                <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-[#1d1d1f] mt-1">
                  Olá, {currentUser.nome.split(' ')[0]}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={openNewAviso}
                  className="px-5 py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-[13px] font-semibold shadow-sm shadow-[#0071e3]/20 transition cursor-pointer"
                >
                  + Novo Aviso
                </button>
                {canManageUsers && (
                  <button
                    type="button"
                    onClick={() => setTab('usuarios')}
                    className="px-5 py-2.5 rounded-full bg-white hover:bg-zinc-50 text-[#1d1d1f] border border-black/[0.08] text-[13px] font-semibold shadow-xs transition cursor-pointer"
                  >
                    Importar Planilha
                  </button>
                )}
              </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="apple-card rounded-[24px] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b]">
                  Avisos ativos
                </p>
                <p className="font-display text-4xl font-bold text-[#1d1d1f] mt-2">
                  {activeAvisosCount}
                </p>
                <p className="text-xs text-[#6e6e73] mt-1">Exibidos em tempo real no totem</p>
              </div>

              <div className="apple-card rounded-[24px] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b]">
                  Alertas urgentes
                </p>
                <p className="font-display text-4xl font-bold text-[#ff3b30] mt-2">
                  {urgentAvisosCount}
                </p>
                <p className="text-xs text-[#6e6e73] mt-1">Destacados na faixa superior</p>
              </div>

              {canManageUsers ? (
                <div className="apple-card rounded-[24px] p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b]">
                    Usuários cadastrados
                  </p>
                  <p className="font-display text-4xl font-bold text-[#1d1d1f] mt-2">
                    {users.length}
                  </p>
                  <p className="text-xs text-[#6e6e73] mt-1">
                    {pendingUsersCount} aguardando 1º acesso
                  </p>
                </div>
              ) : (
                <div className="apple-card rounded-[24px] p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b]">
                    Seu perfil
                  </p>
                  <p className="font-display text-xl font-bold text-[#1d1d1f] mt-2.5">
                    {currentUser.turma ? formatTurmaBadge(currentUser.turma) : 'Representante'}
                  </p>
                  <p className="text-xs text-[#6e6e73] mt-1">
                    Publicação de avisos para a sua sala
                  </p>
                </div>
              )}

              <div className="rounded-[24px] bg-[#1d1d1f] text-white p-5 flex flex-col justify-between shadow-md">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Totem ao vivo
                  </p>
                  <p className="font-display text-2xl font-bold mt-2">
                    {totemStatus.connectedScreens} tela(s) ativa(s)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTab('totem')}
                  className="mt-3 text-left text-xs font-semibold text-[#64d2ff] hover:underline cursor-pointer"
                >
                  Abrir painel remoto →
                </button>
              </div>
            </div>

            {/* Recent Avisos */}
            <div className="apple-card rounded-[28px] p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-display text-lg font-bold text-[#1d1d1f]">
                    Avisos recentes
                  </h2>
                  <p className="text-xs text-[#86868b]">
                    Últimos comunicados enviados ao totem
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTab('avisos')}
                  className="text-xs font-semibold text-[#0071e3] hover:underline cursor-pointer"
                >
                  Gerenciar todos →
                </button>
              </div>

              {avisos.length === 0 ? (
                <div className="rounded-2xl bg-[#f5f5f7] border border-black/[0.04] py-12 px-6 text-center">
                  <p className="font-display font-semibold text-base text-[#1d1d1f]">
                    Nenhum aviso publicado ainda
                  </p>
                  <p className="text-xs text-[#6e6e73] mt-1 mb-4">
                    Crie seu primeiro aviso para vê-lo aparecer imediatamente na tela do totem.
                  </p>
                  <button
                    type="button"
                    onClick={openNewAviso}
                    className="px-5 py-2 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold transition cursor-pointer"
                  >
                    + Criar primeiro aviso
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {avisos.slice(0, 6).map((a) => (
                    <div
                      key={a.id}
                      className="rounded-2xl bg-[#f5f5f7]/80 border border-black/[0.05] p-4 flex flex-col justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${CATEGORIA_STYLE[a.categoria]}`}
                          >
                            {a.urgente ? 'URGENTE' : AVISO_CATEGORIA_LABELS[a.categoria]}
                          </span>
                          <span className="text-[11px] font-semibold text-[#6e6e73]">
                            {formatTurmaBadge(a.turma)}
                          </span>
                        </div>
                        <p className="text-[15px] font-semibold text-[#1d1d1f]">{a.titulo}</p>
                        <p className="text-xs text-[#6e6e73] line-clamp-2 mt-1 leading-relaxed">
                          {a.conteudo}
                        </p>
                      </div>
                      <p className="text-[11px] text-[#86868b]">
                        {a.autorNome} · {new Date(a.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* AVISOS TAB */}
        {tab === 'avisos' && (
          <div className="space-y-5 animate-fade-up">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
                  Avisos do Totem
                </h1>
                <p className="text-xs text-[#6e6e73] mt-0.5">
                  Publicou aqui, aparece instantaneamente nas salas do totem.
                </p>
              </div>
              <button
                type="button"
                onClick={openNewAviso}
                className="px-5 py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-sm shadow-[#0071e3]/20 transition cursor-pointer"
              >
                + Novo Aviso
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                type="search"
                value={avisoSearch}
                onChange={(e) => setAvisoSearch(e.target.value)}
                placeholder="Buscar aviso..."
                className="flex-1 min-w-[220px] rounded-full border border-black/[0.1] bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-[#0071e3]/15 focus:border-[#0071e3]"
              />
              <select
                value={avisoTurmaFilter}
                onChange={(e) => setAvisoTurmaFilter(e.target.value)}
                className="rounded-full border border-black/[0.1] bg-white px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#0071e3]"
              >
                <option value="all">Todas as salas</option>
                {TURMAS.map((t) => (
                  <option key={t} value={t}>
                    {formatTurmaBadge(t)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-3.5">
              {filteredAvisos.map((a) => (
                <div
                  key={a.id}
                  className={`apple-card rounded-[24px] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                    !a.ativo ? 'opacity-55' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${CATEGORIA_STYLE[a.categoria]}`}
                      >
                        {AVISO_CATEGORIA_LABELS[a.categoria]}
                      </span>
                      {a.urgente && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#ff3b30] text-white">
                          URGENTE
                        </span>
                      )}
                      <span className="text-xs font-semibold text-[#1d1d1f] bg-[#f5f5f7] px-3 py-0.5 rounded-full">
                        {formatTurmaBadge(a.turma)}
                      </span>
                      <span className="text-[11px] text-[#86868b]">
                        · {a.autorNome} ({a.autorHt})
                      </span>
                    </div>

                    <h3 className="font-display text-[17px] font-bold text-[#1d1d1f] mb-1">
                      {a.titulo}
                    </h3>
                    <p className="text-[14px] text-[#424245] leading-relaxed whitespace-pre-line">
                      {a.conteudo}
                    </p>
                  </div>

                  <div className="pt-3 lg:pt-0 lg:pl-5 border-t lg:border-t-0 lg:border-l border-black/[0.06] flex items-center justify-end gap-1.5 shrink-0">
                    {canEditAviso(a) ? (
                      <>
                        <button
                          type="button"
                          onClick={() => void handleToggleAvisoAtivo(a)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#f5f5f7] hover:bg-black/[0.08] text-[#1d1d1f] transition cursor-pointer"
                        >
                          {a.ativo ? 'Ocultar' : 'Reativar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditAviso(a)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#0071e3]/10 hover:bg-[#0071e3]/15 text-[#0071e3] transition cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteAviso(a)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#ff3b30]/10 hover:bg-[#ff3b30]/15 text-[#d70015] transition cursor-pointer"
                        >
                          Excluir
                        </button>
                      </>
                    ) : (
                      <span className="text-[11px] font-medium text-[#86868b]">
                        Somente leitura
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {filteredAvisos.length === 0 && (
                <div className="apple-card rounded-[24px] p-12 text-center text-sm text-[#86868b]">
                  Nenhum aviso encontrado.
                </div>
              )}
            </div>
          </div>
        )}

        {/* USUÁRIOS & PLANILHA TAB */}
        {tab === 'usuarios' && canManageUsers && (
          <UsersSection
            users={users}
            actor={{
              userId: currentUser.userId,
              role: currentUser.role,
              isSuperuser: currentUser.isSuperuser,
            }}
            onUsersChange={refreshUsers}
            onToast={showToast}
          />
        )}

        {/* TOTEM & ESP32 TAB */}
        {tab === 'totem' && (
          <TotemControlSection
            status={totemStatus}
            powerState={powerState}
            onPowerStateChange={setPowerState}
            onRefresh={refreshTotemStatus}
            onToast={showToast}
          />
        )}
      </main>

      {/* ════ MODAL: AVISO ════ */}
      {avisoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/35 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-[28px] bg-white p-7 shadow-2xl border border-black/[0.08] animate-fade-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl font-bold text-[#1d1d1f]">
                {editingAvisoId ? 'Editar Aviso' : 'Novo Aviso no Totem'}
              </h3>
              <button
                type="button"
                onClick={() => setAvisoModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f5f5f7] hover:bg-black/[0.08] text-[#6e6e73] font-bold text-sm flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAviso} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1.5">
                  Título
                </label>
                <input
                  type="text"
                  required
                  value={avisoForm.titulo}
                  onChange={(e) => setAvisoForm({ ...avisoForm, titulo: e.target.value })}
                  placeholder="Ex.: Troca de sala — Automação"
                  className="w-full rounded-2xl border border-black/[0.12] px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-[#0071e3]/15 focus:border-[#0071e3]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1.5">
                    Sala destino {isRepresentante ? '(sua sala)' : ''}
                  </label>
                  {isRepresentante ? (
                    <div className="w-full rounded-2xl border border-black/[0.08] bg-[#f5f5f7] px-3.5 py-3 text-sm font-semibold text-[#1d1d1f]">
                      {currentUser.turma ? formatTurmaBadge(currentUser.turma) : 'Sala não vinculada'}
                    </div>
                  ) : (
                    <select
                      value={avisoForm.turma}
                      onChange={(e) => setAvisoForm({ ...avisoForm, turma: e.target.value })}
                      className="w-full rounded-2xl border border-black/[0.12] bg-white px-3.5 py-3 text-sm focus:outline-none focus:border-[#0071e3]"
                    >
                      {TURMAS.map((t) => (
                        <option key={t} value={t}>
                          {formatTurmaBadge(t)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1.5">
                    Categoria
                  </label>
                  <select
                    value={avisoForm.categoria}
                    onChange={(e) =>
                      setAvisoForm({
                        ...avisoForm,
                        categoria: e.target.value as AvisoCategoria,
                        urgente: e.target.value === 'urgente' ? true : avisoForm.urgente,
                      })
                    }
                    className="w-full rounded-2xl border border-black/[0.12] bg-white px-3.5 py-3 text-sm focus:outline-none focus:border-[#0071e3]"
                  >
                    <option value="comunicado">Comunicado</option>
                    <option value="sala">Troca de Sala</option>
                    <option value="prova">Prova / Avaliação</option>
                    <option value="evento">Evento</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-1.5">
                  Mensagem completa
                </label>
                <textarea
                  required
                  rows={4}
                  value={avisoForm.conteudo}
                  onChange={(e) => setAvisoForm({ ...avisoForm, conteudo: e.target.value })}
                  placeholder="Escreva o aviso exatamente como aparecerá na tela do totem..."
                  className="w-full rounded-2xl border border-black/[0.12] px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-[#0071e3]/15 focus:border-[#0071e3]"
                />
              </div>

              <label className="flex items-center gap-2.5 text-sm font-medium text-[#424245] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={avisoForm.urgente}
                  onChange={(e) => setAvisoForm({ ...avisoForm, urgente: e.target.checked })}
                  className="w-4 h-4 rounded border-zinc-300"
                />
                Destacar como aviso urgente no topo do totem
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAvisoModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#6e6e73] hover:bg-[#f5f5f7] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingAviso}
                  className="px-6 py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-50 text-white text-xs font-semibold shadow-sm cursor-pointer"
                >
                  {savingAviso ? 'Salvando...' : editingAvisoId ? 'Salvar alterações' : 'Publicar aviso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
