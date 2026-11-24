'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { UserRole } from '@/lib/types';

type Step = 'ht' | 'password' | 'first-access';

interface CheckedUser {
  ht: string;
  nome: string;
  role: UserRole;
  roleLabel: string;
  needsPasswordSetup: boolean;
}

const ROLE_STYLES: Record<UserRole, string> = {
  admin: 'bg-purple-50 text-purple-700 border-purple-200/80',
  professor: 'bg-blue-50 text-[#0071e3] border-blue-200/80',
  tecnico: 'bg-amber-50 text-amber-800 border-amber-200/80',
  representante: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
};

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('ht');
  const [ht, setHt] = useState('');
  const [checkedUser, setCheckedUser] = useState<CheckedUser | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckHt(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/check-ht', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ht }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Acesso não encontrado.');
        return;
      }
      setCheckedUser(data as CheckedUser);
      setHt(data.ht);
      setPassword('');
      setConfirmPassword('');
      setStep(data.needsPasswordSetup ? 'first-access' : 'password');
    } catch {
      setError('Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!checkedUser) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ht: checkedUser.ht, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.needsPasswordSetup) setStep('first-access');
        setError(data.error || 'Credenciais inválidas.');
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  }

  async function handleFirstAccess(e: React.FormEvent) {
    e.preventDefault();
    if (!checkedUser) return;
    setError(null);

    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/first-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ht: checkedUser.ht,
          password,
          confirmPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao cadastrar senha.');
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Erro ao salvar nova senha.');
    } finally {
      setLoading(false);
    }
  }

  function resetToHt() {
    setStep('ht');
    setCheckedUser(null);
    setPassword('');
    setConfirmPassword('');
    setError(null);
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-[#f5f5f7] text-[#1d1d1f] overflow-hidden">
      {/* Subtle Ambient Light */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
        <div
          className="ambient-blob ambient-blob-a"
          style={{
            width: '40vw',
            height: '40vw',
            top: '-14%',
            right: '-8%',
            background: 'radial-gradient(circle, rgba(0,113,227,0.14) 0%, transparent 70%)',
          }}
        />
        <div
          className="ambient-blob ambient-blob-b"
          style={{
            width: '34vw',
            height: '34vw',
            bottom: '-14%',
            left: '-8%',
            background: 'radial-gradient(circle, rgba(255,159,10,0.12) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 rounded-[10px] bg-[#1d1d1f] text-white flex items-center justify-center shadow-sm">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z" />
            </svg>
          </div>
          <span className="font-display font-bold text-[17px] tracking-tight text-[#1d1d1f]">
            Life <span className="text-sm font-normal text-[#86868b]">· Totem HTO</span>
          </span>
        </Link>

        <Link
          href="/"
          className="text-[13px] font-medium text-[#6e6e73] hover:text-[#1d1d1f] transition"
        >
          Voltar ao início
        </Link>
      </header>

      {/* Center Apple ID-style Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[420px] animate-fade-up">
          <div className="apple-glass rounded-[32px] p-8 sm:p-9">
            <div className="text-center mb-7">
              <div className="w-12 h-12 rounded-2xl bg-[#1d1d1f] text-white flex items-center justify-center mx-auto mb-5 shadow-md">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z" />
                </svg>
              </div>
              <h1 className="font-display text-[28px] font-bold tracking-[-0.03em] text-[#1d1d1f]">
                {step === 'ht' && 'Iniciar sessão'}
                {step === 'password' && 'Digite sua senha'}
                {step === 'first-access' && 'Primeiro acesso'}
              </h1>
              <p className="text-[14px] text-[#6e6e73] mt-1.5 leading-relaxed">
                {step === 'ht' && 'Use seu prontuário HT ou e-mail para acessar a Dashboard de avisos.'}
                {step === 'password' && 'Confirme sua senha para continuar.'}
                {step === 'first-access' && 'Seu acesso foi pré-cadastrado sem senha. Crie sua senha pessoal agora.'}
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl bg-[#ff3b30]/10 border border-[#ff3b30]/25 px-4 py-3 text-[13px] text-[#d70015] font-medium text-center">
                {error}
              </div>
            )}

            {/* STEP 1: HT / E-MAIL */}
            {step === 'ht' && (
              <form onSubmit={handleCheckHt} className="space-y-4">
                <div>
                  <label
                    htmlFor="ht-input"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-2"
                  >
                    Prontuário (HT) ou E-mail
                  </label>
                  <input
                    id="ht-input"
                    type="text"
                    required
                    autoFocus
                    value={ht}
                    onChange={(e) => setHt(e.target.value)}
                    placeholder="HT3012345 ou admin@admin.com"
                    className="w-full rounded-2xl border border-black/[0.12] bg-white px-4 py-3.5 text-[15px] font-medium text-[#1d1d1f] placeholder:text-[#a1a1a6] focus:outline-none focus:ring-4 focus:ring-[#0071e3]/15 focus:border-[#0071e3] transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || ht.trim().length < 4}
                  className="w-full rounded-full bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 text-[15px] shadow-md shadow-[#0071e3]/20 transition cursor-pointer"
                >
                  {loading ? 'Verificando...' : 'Continuar'}
                </button>
              </form>
            )}

            {/* Checked User Summary Pill */}
            {checkedUser && step !== 'ht' && (
              <div className="mb-5 rounded-2xl bg-[#f5f5f7] border border-black/[0.06] px-4 py-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-[#1d1d1f] truncate">
                    {checkedUser.nome}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs font-mono text-[#6e6e73]">{checkedUser.ht}</span>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${ROLE_STYLES[checkedUser.role]}`}
                    >
                      {checkedUser.roleLabel}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resetToHt}
                  className="text-xs font-semibold text-[#0071e3] hover:underline shrink-0 cursor-pointer"
                >
                  Alterar
                </button>
              </div>
            )}

            {/* STEP 2A: PASSWORD */}
            {step === 'password' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label
                    htmlFor="password-input"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-2"
                  >
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      id="password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoFocus
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Digite sua senha"
                      className="w-full rounded-2xl border border-black/[0.12] bg-white px-4 py-3.5 pr-20 text-[15px] text-[#1d1d1f] placeholder:text-[#a1a1a6] focus:outline-none focus:ring-4 focus:ring-[#0071e3]/15 focus:border-[#0071e3] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#0071e3] hover:underline cursor-pointer"
                    >
                      {showPassword ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !password}
                  className="w-full rounded-full bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-40 text-white font-semibold py-3.5 px-6 text-[15px] shadow-md shadow-[#0071e3]/20 transition cursor-pointer"
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>
            )}

            {/* STEP 2B: FIRST ACCESS */}
            {step === 'first-access' && (
              <form onSubmit={handleFirstAccess} className="space-y-4">
                <div>
                  <label
                    htmlFor="new-password"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-2"
                  >
                    Nova senha
                  </label>
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full rounded-2xl border border-black/[0.12] bg-white px-4 py-3.5 text-[15px] text-[#1d1d1f] placeholder:text-[#a1a1a6] focus:outline-none focus:ring-4 focus:ring-[#0071e3]/15 focus:border-[#0071e3] transition"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-2"
                  >
                    Confirmar senha
                  </label>
                  <input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full rounded-2xl border border-black/[0.12] bg-white px-4 py-3.5 text-[15px] text-[#1d1d1f] placeholder:text-[#a1a1a6] focus:outline-none focus:ring-4 focus:ring-[#0071e3]/15 focus:border-[#0071e3] transition"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs text-[#6e6e73] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="rounded border-zinc-300"
                  />
                  Mostrar senhas
                </label>

                <button
                  type="submit"
                  disabled={loading || password.length < 6 || confirmPassword.length < 6}
                  className="w-full rounded-full bg-[#30d158] hover:bg-[#28bd4d] disabled:opacity-40 text-white font-semibold py-3.5 px-6 text-[15px] shadow-md shadow-[#30d158]/20 transition cursor-pointer"
                >
                  {loading ? 'Salvando...' : 'Criar senha e entrar'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-5 text-center text-xs text-[#86868b]">
        Life · Totem HTO — IFSP Hortolândia
      </footer>
    </div>
  );
}
