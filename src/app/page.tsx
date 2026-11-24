'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CURSOS, ROOMS } from '@/lib/types';

function IconGithub({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function IconArrowRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function IconSparkle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z" />
    </svg>
  );
}

const softwareStack = [
  { label: 'Interface & Quiosque', tech: 'Next.js 16 · React 19' },
  { label: 'Banco de dados', tech: 'MongoDB Atlas' },
  { label: 'Comunicação ESP32', tech: 'HTTP POST + SSE' },
  { label: 'Autenticação', tech: 'HT + 1º Acesso' },
  { label: 'Cadastro em lote', tech: 'Planilhas .xlsx / .csv' },
];

const hardwareStack = [
  { label: 'Microcontrolador', tech: 'ESP32 / Arduino' },
  { label: 'Conectividade', tech: 'USB Serial / Wi-Fi' },
  { label: 'Painel físico', tech: 'Botões por curso e ano' },
  { label: 'Botão dedicado', tech: 'Voltar (Vermelho)' },
  { label: 'Exibição', tech: 'Monitor em modo Totem' },
];

const team = [
  { name: 'Felipe Savazi', initials: 'FS', grad: 'from-amber-400 to-orange-500' },
  { name: 'Julia Moreira', initials: 'JM', grad: 'from-sky-400 to-blue-600' },
  { name: 'Lara Moreira', initials: 'LM', grad: 'from-fuchsia-500 to-rose-500' },
  { name: 'Laura Vitória', initials: 'LV', grad: 'from-emerald-400 to-teal-500' },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] flex flex-col">
      {/* ════ FLOATING APPLE NAVBAR ════ */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-2xl border-b border-black/[0.06] shadow-[0_1px_20px_rgba(0,0,0,0.04)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2.5 no-underline group">
            <div className="w-8 h-8 rounded-[10px] bg-[#1d1d1f] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition">
              <IconSparkle />
            </div>
            <span className="font-display font-bold text-[17px] tracking-tight text-[#1d1d1f]">
              Life <span className="font-normal text-[#86868b] text-sm">· Totem HTO</span>
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-7 text-[13px] font-medium text-[#6e6e73]">
            <a href="#solucao" className="hover:text-[#1d1d1f] transition">
              A Solução
            </a>
            <a href="#como-funciona" className="hover:text-[#1d1d1f] transition">
              Como Funciona
            </a>
            <a href="#arquitetura" className="hover:text-[#1d1d1f] transition">
              Arquitetura
            </a>
            <a href="#equipe" className="hover:text-[#1d1d1f] transition">
              Equipe
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-[13px] font-semibold shadow-sm shadow-[#0071e3]/20 transition"
            >
              Acessar Dashboard
            </Link>
            <a
              href="https://github.com/FelipeSavazii/TCC-Automacao"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Repositório GitHub"
              className="w-9 h-9 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-[#1d1d1f] flex items-center justify-center transition"
            >
              <IconGithub size={17} />
            </a>
          </div>
        </div>
      </header>

      {/* ════ HERO ════ */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        {/* Soft Cupertino Ambient Glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div
            className="ambient-blob ambient-blob-a"
            style={{
              width: '44vw',
              height: '44vw',
              top: '-14%',
              right: '-6%',
              background: 'radial-gradient(circle, rgba(0,113,227,0.16) 0%, rgba(94,92,230,0.06) 65%, transparent 100%)',
            }}
          />
          <div
            className="ambient-blob ambient-blob-b"
            style={{
              width: '38vw',
              height: '38vw',
              bottom: '-12%',
              left: '-8%',
              background: 'radial-gradient(circle, rgba(255,159,10,0.14) 0%, rgba(255,59,48,0.05) 70%, transparent 100%)',
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-xl border border-black/[0.06] text-[12px] font-semibold text-[#6e6e73] shadow-xs mb-7">
            <span className="w-2 h-2 rounded-full bg-[#30d158]" />
            TCC Automação Industrial · IFSP Hortolândia
          </div>

          <h1 className="font-display font-bold text-[42px] sm:text-[62px] lg:text-[76px] leading-[1.03] tracking-[-0.04em] text-[#1d1d1f] max-w-4xl mx-auto">
            Avisos escolares.{' '}
            <span className="text-[#86868b]">Sem precisar do celular.</span>
          </h1>

          <p className="mt-6 text-[17px] sm:text-[20px] leading-[1.55] text-[#6e6e73] max-w-2xl mx-auto font-normal">
            O <strong className="text-[#1d1d1f] font-semibold">Life</strong> conecta a Dashboard de professores e representantes a um totem físico com botões dedicados para cada turma — levando comunicados em tempo real aos corredores da escola.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-[15px] font-semibold shadow-lg shadow-[#0071e3]/25 transition hover:-translate-y-0.5"
            >
              Acessar Dashboard
              <IconArrowRight />
            </Link>
            <button
              type="button"
              onClick={() => document.getElementById('solucao')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-white/90 text-[#1d1d1f] text-[15px] font-semibold border border-black/[0.08] shadow-xs transition hover:-translate-y-0.5 cursor-pointer"
            >
              Conhecer o projeto
            </button>
          </div>

          {/* Sleek Hardware Preview Bento */}
          <div className="mt-16 rounded-[32px] bg-[#0b0c10] text-white p-6 sm:p-8 border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.18)] text-left">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#30d158]" />
                <span className="text-xs font-semibold tracking-wide text-zinc-300">
                  Cursos e Turmas no Totem · IFSP Hortolândia
                </span>
              </div>
              <span className="text-xs font-medium text-zinc-500">
                1º, 2º e 3º Ano Integrado
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {CURSOS.map((curso) => {
                const courseRooms = ROOMS.filter((r) => r.curso === curso.id);
                const dotColor =
                  curso.accent === 'amber'
                    ? 'bg-[#ff9f0a]'
                    : curso.accent === 'blue'
                      ? 'bg-[#0a84ff]'
                      : 'bg-[#30d158]';
                return (
                  <div
                    key={curso.id}
                    className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                      <span className="font-display font-bold text-sm text-white">
                        {curso.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {courseRooms.map((room) => (
                        <div
                          key={room.turma}
                          className="rounded-xl bg-white/[0.06] border border-white/[0.07] py-2 text-center text-xs font-semibold text-zinc-200"
                        >
                          {room.serieLabel}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10 text-xs text-zinc-400">
              <span>Aperte o botão físico da sua sala no gabinete do totem para ver os avisos ao vivo.</span>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ff3b30]/20 border border-[#ff3b30]/50 text-[#ff6961] font-bold">
                <span className="w-2 h-2 rounded-full bg-[#ff3b30]" />
                Botão Vermelho · Voltar
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ════ PILARES ════ */}
      <section id="solucao" className="py-24 bg-white border-t border-black/[0.05]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0071e3] mb-3">
              Arquitetura da solução
            </p>
            <h2 className="font-display font-bold text-[34px] sm:text-[48px] leading-[1.08] tracking-[-0.035em] text-[#1d1d1f]">
              Simples para o aluno.{' '}
              <span className="text-[#86868b]">Instantâneo para a escola.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                tag: '01 · Conformidade',
                title: 'Informação sem smartphone',
                desc: 'Respeita integralmente a restrição de celulares no campus. Estudantes consultam trocas de sala, provas e comunicados urgentes diretamente nos corredores.',
              },
              {
                tag: '02 · Interação física',
                title: 'Botões por turma + Voltar',
                desc: 'Botões físicos dedicados no gabinete para Automação, Informática e Mecânica (1º ao 3º ano) e um botão vermelho dedicado para voltar à tela inicial.',
              },
              {
                tag: '03 · Gestão segura',
                title: 'Dashboard por HT e Planilha',
                desc: 'Professores, técnicos administrativos, representantes e administradores acessam com HT pessoal — com importação inteligente de planilhas e primeiro acesso sem senha.',
              },
            ].map((item) => (
              <div
                key={item.tag}
                className="apple-card apple-card-hover rounded-[28px] p-8 flex flex-col gap-4 bg-[#f5f5f7]/60"
              >
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#86868b]">
                  {item.tag}
                </span>
                <h3 className="font-display font-bold text-[22px] tracking-[-0.025em] text-[#1d1d1f]">
                  {item.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-[#6e6e73]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ COMO FUNCIONA ════ */}
      <section id="como-funciona" className="py-24 bg-[#f5f5f7] border-t border-black/[0.05]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0071e3] mb-3">
              Fluxo em tempo real
            </p>
            <h2 className="font-display font-bold text-[34px] sm:text-[48px] leading-[1.08] tracking-[-0.035em] text-[#1d1d1f]">
              Publicou na Dashboard. Apareceu no Totem.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: 'Passo 1',
                title: 'Aviso publicado',
                desc: 'Um professor, técnico ou representante faz login com seu HT e cadastra um aviso para uma turma específica ou para todo o campus.',
              },
              {
                step: 'Passo 2',
                title: 'Sincronização ao vivo',
                desc: 'O aviso é salvo no MongoDB Atlas e transmitido imediatamente para a tela do totem via Server-Sent Events (SSE), sem recarregar o navegador.',
              },
              {
                step: 'Passo 3',
                title: 'Leitura em 1 clique físico',
                desc: 'No corredor, o aluno aperta o botão físico da sua sala no painel do totem e lê o aviso em segundos. O botão vermelho retorna ao início.',
              },
            ].map((s) => (
              <div key={s.step} className="apple-card rounded-[28px] p-8 flex flex-col gap-3">
                <span className="inline-flex w-fit px-3 py-1 rounded-full bg-[#f5f5f7] text-[11px] font-bold uppercase tracking-wider text-[#6e6e73]">
                  {s.step}
                </span>
                <h3 className="font-display font-bold text-[21px] tracking-[-0.02em] text-[#1d1d1f]">
                  {s.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-[#6e6e73]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ ARQUITETURA / STACK ════ */}
      <section id="arquitetura" className="py-24 bg-white border-t border-black/[0.05]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0071e3] mb-3">
              Engenharia
            </p>
            <h2 className="font-display font-bold text-[34px] sm:text-[48px] leading-[1.08] tracking-[-0.035em] text-[#1d1d1f]">
              Software moderno.{' '}
              <span className="text-[#86868b]">Hardware direto ao ponto.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 apple-card rounded-[28px] p-7 bg-[#f5f5f7]/60">
              <p className="text-xs font-bold uppercase tracking-wider text-[#86868b] mb-1">
                Camada Web & Dados
              </p>
              <h3 className="font-display font-bold text-xl mb-5">Software</h3>
              <div className="space-y-2.5">
                {softwareStack.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white border border-black/[0.05]"
                  >
                    <span className="text-xs font-semibold text-[#6e6e73]">{item.label}</span>
                    <span className="text-xs font-bold text-[#1d1d1f]">{item.tech}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 apple-card rounded-[28px] p-7 bg-[#f5f5f7]/60">
              <p className="text-xs font-bold uppercase tracking-wider text-[#86868b] mb-1">
                Eletrônica Embarcada
              </p>
              <h3 className="font-display font-bold text-xl mb-5">Hardware</h3>
              <div className="space-y-2.5">
                {hardwareStack.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white border border-black/[0.05]"
                  >
                    <span className="text-xs font-semibold text-[#6e6e73]">{item.label}</span>
                    <span className="text-xs font-bold text-[#1d1d1f]">{item.tech}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 rounded-[28px] bg-[#1d1d1f] text-white p-8 flex flex-col justify-between shadow-[0_24px_60px_rgba(0,0,0,0.16)]">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400 mb-3">
                  Painel Administrativo
                </p>
                <h3 className="font-display font-bold text-3xl tracking-tight leading-tight">
                  Pronto para publicar avisos.
                </h3>
                <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                  Entre com seu prontuário HT para gerenciar avisos por turma e cadastrar pessoas em lote via planilha.
                </p>
              </div>

              <Link
                href="/dashboard"
                className="mt-8 inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-full bg-white hover:bg-zinc-100 text-[#1d1d1f] font-semibold text-sm transition"
              >
                Acessar Dashboard
                <IconArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════ EQUIPE ════ */}
      <section id="equipe" className="py-24 bg-[#f5f5f7] border-t border-black/[0.05]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0071e3] mb-3">
              A Equipe
            </p>
            <h2 className="font-display font-bold text-[34px] sm:text-[44px] leading-[1.08] tracking-[-0.035em] text-[#1d1d1f]">
              Quem faz o Life acontecer.
            </h2>
            <p className="mt-3 text-[15px] text-[#6e6e73]">
              Automação Industrial · Turma TCC 2026 · IFSP Hortolândia
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {team.map((m) => (
              <div
                key={m.name}
                className="apple-card apple-card-hover rounded-[28px] p-7 flex flex-col items-center justify-center text-center"
              >
                <div
                  className={`w-16 h-16 rounded-full bg-gradient-to-br ${m.grad} text-white font-display font-bold text-xl flex items-center justify-center shadow-md mb-4`}
                >
                  {m.initials}
                </div>
                <h3 className="font-display font-bold text-[17px] text-[#1d1d1f]">{m.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ FOOTER ════ */}
      <footer className="bg-white border-t border-black/[0.06] py-12 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#86868b]">
          <div className="flex items-center gap-2.5">
            <span className="font-display font-bold text-sm text-[#1d1d1f]">Life · Totem HTO</span>
            <span>·</span>
            <span>IFSP Hortolândia</span>
          </div>
          <div className="flex items-center gap-5 font-medium">
            <Link href="/dashboard" className="hover:text-[#1d1d1f] transition">
              Dashboard
            </Link>
            <Link href="/login" className="hover:text-[#1d1d1f] transition">
              Login HT
            </Link>
            <a
              href="https://github.com/FelipeSavazii/TCC-Automacao"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1d1d1f] transition"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
