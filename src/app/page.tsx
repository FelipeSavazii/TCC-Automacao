'use client';
import React, { useEffect, useRef, useState } from 'react';

/* ─────────────────────────── SVG ICONS ─────────────────────────── */
const IconEyeOff = ({ size = 28, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

const IconZap = ({ size = 28, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IconBarcode = ({ size = 28, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <path d="M8 7v10" /><path d="M12 7v10" /><path d="M16 7v10" />
  </svg>
);

const IconGithub = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

const IconCode = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const IconCpu = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" />
    <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" />
  </svg>
);

const IconCheck = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/* ─────────────────────────── COMPONENT: Blob ─────────────────────────── */
function HeroBlobs() {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
      <div className="blob animate-float"
        style={{ width: 380, height: 380, background: '#FFD700', top: '-80px', right: '-60px' }} />
      <div className="blob animate-float2"
        style={{ width: 280, height: 280, background: '#4FC3F7', top: '40%', right: '15%' }} />
      <div className="blob animate-float3"
        style={{ width: 220, height: 220, background: '#FF6B35', bottom: '-40px', right: '30%' }} />
      <div className="blob animate-float2"
        style={{ width: 180, height: 180, background: '#B69EFF', top: '20%', left: '-60px', animationDelay: '3s' }} />
    </div>
  );
}

/* ─────────────────────────── COMPONENT: ValueCard ─────────────────────────── */
interface ValueCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  accentColor: string;
  bgColor: string;
}
function ValueCard({ icon, title, description, accentColor, bgColor }: ValueCardProps) {
  return (
    <div className="card" style={{ borderTopColor: accentColor, borderTopWidth: 4 }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16, background: bgColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem'
      }}>
        {icon}
      </div>
      <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.6rem', color: '#1A1A2E' }}>{title}</h3>
      <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.65 }}>{description}</p>
    </div>
  );
}

/* ─────────────────────────── COMPONENT: TeamCard ─────────────────────────── */
interface TeamCardProps {
  name: string;
  initials: string;
  role: string;
  bg: string;
  color: string;
}
function TeamCard({ name, initials, role, bg, color }: TeamCardProps) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
      <div className="team-avatar" style={{ background: bg, color: color, fontSize: '1.3rem' }}>
        {initials}
      </div>
      <p style={{ fontWeight: 800, fontSize: '1rem', color: '#1A1A2E', marginBottom: '0.25rem' }}>{name}</p>
      <p style={{ color: '#64748B', fontSize: '0.82rem' }}>{role}</p>
    </div>
  );
}

/* ─────────────────────────── COMPONENT: FlowStep ─────────────────────────── */
interface FlowStepProps {
  emoji: string;
  label: string;
  description: string;
  bg: string;
  showArrow?: boolean;
}
function FlowStep({ emoji, label, description, bg, showArrow = true }: FlowStepProps) {
  return (
    <>
      <div className="flow-step">
        <div className="flow-icon" style={{ background: bg }}>
          <span style={{ fontSize: '1.4rem' }}>{emoji}</span>
        </div>
        <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1A1A2E' }}>{label}</span>
        <span style={{ color: '#64748B', fontSize: '0.78rem', lineHeight: 1.4 }}>{description}</span>
      </div>
      {showArrow && (
        <div className="flow-arrow" aria-hidden="true">→</div>
      )}
    </>
  );
}

/* ─────────────────────────── MAIN PAGE ─────────────────────────── */
export default function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', color: '#1A1A2E' }}>

      {/* ══════════════════════════════ HEADER ══════════════════════════════ */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: scrolled ? 'rgba(255,255,255,0.92)' : '#fff',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '2px solid #E8ECF4' : '2px solid transparent',
        transition: 'all 0.3s',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #FFD700, #FF6B35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', boxShadow: '0 4px 12px rgba(255,107,53,0.3)'
            }}>✨</div>
            <span style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.03em' }}>
              <span style={{ color: '#FF6B35' }}>Life</span>
              <span style={{ color: '#B0B8C8', fontWeight: 400, fontSize: '0.9rem', marginLeft: '0.4rem' }}>· Totem HTO</span>
            </span>
          </div>

          {/* Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="badge" style={{ background: '#FFF3B0', color: '#B8860B', border: '1.5px solid #FFD700' }}>
              <span className="animate-pulse-soft" style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#FFD700' }} />
              MVP em Desenvolvimento
            </div>
            <a
              href="https://github.com/FelipeSavazii/TCC-Automacao"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                color: '#64748B', fontWeight: 600, fontSize: '0.85rem',
                textDecoration: 'none', transition: 'color 0.2s',
                padding: '0.4rem 0.8rem', borderRadius: 8,
                border: '2px solid #E8ECF4',
              }}
            >
              <IconGithub size={16} color="#64748B" />
              <span style={{ display: 'none' }} className="sm:inline">GitHub</span>
            </a>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>

        {/* ══════════════════════════════ HERO ══════════════════════════════ */}
        <section style={{ position: 'relative', paddingTop: '5rem', paddingBottom: '5rem', borderBottom: '2px solid #F0F2F8', overflow: 'hidden' }}>
          <HeroBlobs />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: 680 }}>
            {/* Badge */}
            <div className="badge" style={{
              background: 'rgba(255,255,255,0.85)', border: '2px solid #4FC3F7',
              color: '#0288D1', marginBottom: '1.5rem',
              backdropFilter: 'blur(8px)',
            }}>
              <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#4FC3F7' }} />
              Sistema de Governança Estudantil — TCC Automação Industrial
            </div>

            {/* Headline */}
            <h1 style={{
              fontWeight: 900, lineHeight: 1.1,
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              marginBottom: '1.25rem', letterSpacing: '-0.03em'
            }}>
              Esqueça o celular.<br />
              <span style={{
                background: 'linear-gradient(90deg, #FF6B35 0%, #FFD700 60%, #4FC3F7 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Você não precisa dele.
              </span>
            </h1>

            <p style={{ fontSize: '1.2rem', color: '#64748B', lineHeight: 1.7, marginBottom: '0.5rem', maxWidth: 560 }}>
              Aproveite o <strong style={{ color: '#FF6B35' }}>Life</strong> — o totem físico que concentra{' '}
              <em>tudo que o aluno precisa</em> sem depender do smartphone.
            </p>
            <p style={{ fontSize: '0.95rem', color: '#94A3B8', lineHeight: 1.6, marginBottom: '2.5rem', maxWidth: 560 }}>
              Presença automatizada e cronogramas em tempo real via leitura óptica da carteirinha estudantil.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2.5rem' }}>
              <button className="btn-primary" id="cta-especificacoes">Ver Especificações</button>
              <button className="btn-secondary" id="cta-docente">Acesso Docente</button>
            </div>

            {/* Stats strip */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
              {[
                { emoji: '💰', label: 'R$ 225–340', sub: 'Custo total' },
                { emoji: '⚡', label: '< 5 segundos', sub: 'Para exibir dados' },
                { emoji: '🏫', label: '100% legal', sub: 'Respeita a legislação' },
                { emoji: '📋', label: 'CSV automático', sub: 'Registro de presença' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.3rem' }}>{s.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1A1A2E' }}>{s.label}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════ VALOR ══════════════════════════════ */}
        <section style={{ padding: '4.5rem 0', borderBottom: '2px solid #F0F2F8' }}>
          <p className="badge" style={{ background: '#FFE8DF', color: '#C0440A', border: '1.5px solid #FF6B35', marginBottom: '0.75rem', display: 'inline-flex' }}>
            🏗️ Arquitetura da Solução
          </p>
          <h2 className="section-title">Três pilares, uma solução.</h2>
          <p className="section-subtitle">O Life resolve os três maiores gargalos criados pelo banimento do celular nas escolas.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <ValueCard
              icon={<IconEyeOff size={28} color="#B8860B" />}
              title="Governança sem Telas"
              description="Respeita a legislação de restrição de smartphones. Os alunos mantêm acesso a dados acadêmicos vitais sem infringir as regras escolares."
              accentColor="#FFD700"
              bgColor="#FFF3B0"
            />
            <ValueCard
              icon={<IconZap size={28} color="#C0440A" />}
              title="Informação em 5 segundos"
              description="Fim da desinformação sobre datas de provas e avisos. Interface projetada para leitura ultrarrápida nos corredores movimentados."
              accentColor="#FF6B35"
              bgColor="#FFE8DF"
            />
            <ValueCard
              icon={<IconBarcode size={28} color="#5E35B1" />}
              title="Integração Frugal"
              description="Nenhum crachá novo necessário. O sistema usa o código de barras já existente na carteirinha padrão como chave de acesso única."
              accentColor="#B69EFF"
              bgColor="#EDE7FF"
            />
          </div>
        </section>

        {/* ══════════════════════════════ PERSONA ══════════════════════════════ */}
        <section style={{ padding: '4.5rem 0', borderBottom: '2px solid #F0F2F8' }}>
          <p className="badge" style={{ background: '#E1F5FE', color: '#0277BD', border: '1.5px solid #4FC3F7', marginBottom: '0.75rem', display: 'inline-flex' }}>
            👤 A Persona
          </p>
          <h2 className="section-title">Por que isso importa?</h2>
          <p className="section-subtitle">O projeto foi desenvolvido focado em uma persona real: Felipe, estudante técnico de 16 anos.</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-start' }}>
            {/* Character card */}
            <div style={{
              background: 'linear-gradient(135deg, #4FC3F7 0%, #B69EFF 100%)',
              borderRadius: 24, padding: '2rem', color: '#fff',
              minWidth: 240, flex: '0 0 240px', textAlign: 'center',
              boxShadow: '0 12px 40px rgba(79,195,247,0.3)',
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%', margin: '0 auto 1rem',
                background: 'rgba(255,255,255,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.5rem', border: '3px solid rgba(255,255,255,0.5)'
              }}>🎒</div>
              <p style={{ fontWeight: 900, fontSize: '1.3rem', marginBottom: '0.2rem' }}>Felipe</p>
              <p style={{ opacity: 0.85, fontSize: '0.9rem' }}>Estudante Técnico · 16 anos</p>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {['Automação', 'TCC', 'Sem celular'].map(t => (
                  <span key={t} style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 999, padding: '0.2rem 0.65rem', fontSize: '0.72rem', fontWeight: 700 }}>{t}</span>
                ))}
              </div>
            </div>

            {/* Pain vs Need */}
            <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Pain */}
              <div className="card" style={{ borderLeft: '4px solid #FF6B35', borderRadius: 16 }}>
                <p style={{ fontWeight: 800, color: '#C0440A', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>😟</span> A Dor Diária
                </p>
                <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.65 }}>
                  Felipe depende exclusivamente de <strong>informações descentralizadas e murais estáticos</strong> para tentar gerenciar as datas das suas provas e o ensalamento. Sem o celular, ele navega às cegas.
                </p>
              </div>
              {/* Need */}
              <div className="card" style={{ borderLeft: '4px solid #7DCE82', borderRadius: 16 }}>
                <p style={{ fontWeight: 800, color: '#2E7D32', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>✅</span> A Necessidade
                </p>
                <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.65 }}>
                  Acesso a informações <strong>táticas, personalizadas e em tempo real</strong> de uma forma que respeite integralmente a legislação vigente da escola. O Life entrega exatamente isso.
                </p>
              </div>
              {/* Solution */}
              <div className="card" style={{ borderLeft: '4px solid #FFD700', borderRadius: 16, background: '#FFFEF0' }}>
                <p style={{ fontWeight: 800, color: '#B8860B', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>💡</span> A Solução
                </p>
                <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.65 }}>
                  "Bipa" a carteirinha no Totem HTO e em <strong>menos de 5 segundos</strong> vê seus alertas de prova, cronograma do dia e mudanças de sala — sem tocar em nenhum smartphone.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════ FUNCIONAMENTO ══════════════════════════════ */}
        <section style={{ padding: '4.5rem 0', borderBottom: '2px solid #F0F2F8' }}>
          <p className="badge" style={{ background: '#E8F5E9', color: '#2E7D32', border: '1.5px solid #7DCE82', marginBottom: '0.75rem', display: 'inline-flex' }}>
            ⚙️ Como Funciona
          </p>
          <h2 className="section-title">Três passos. Cinco segundos.</h2>
          <p className="section-subtitle">Do "bip" da carteirinha ao dado na tela — simples assim.</p>

          <div style={{
            display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start',
            gap: '0.5rem', background: '#F8F9FE', borderRadius: 24, padding: '2rem'
          }}>
            <FlowStep emoji="🪪" label="Passo 1 — Entrada" description="Aluno aproxima a carteirinha do leitor óptico GM65 (UART)" bg="#FFF3B0" />
            <FlowStep emoji="📡" label="Passo 2 — Sincronização" description="ESP32 envia o prontuário ao Back-end Python via Wi-Fi/HTTP" bg="#FFE8DF" />
            <FlowStep emoji="🖥️" label="Passo 3 — Exibição & Log" description="Display TFT mostra cronograma. Back-end registra presença em CSV" bg="#E1F5FE" showArrow={false} />
          </div>

          {/* 4 Layers Architecture */}
          <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              { emoji: '📥', title: 'Camada de Entrada', desc: 'Carteirinha + Módulo GM65', color: '#FFD700', bg: '#FFF3B0' },
              { emoji: '🧠', title: 'Processamento', desc: 'Raspberry Pi (cérebro)', color: '#FF6B35', bg: '#FFE8DF' },
              { emoji: '☁️', title: 'Dados', desc: 'Back-end Python + CSV', color: '#4FC3F7', bg: '#E1F5FE' },
              { emoji: '📺', title: 'Saída', desc: 'Display TFT + Next.js', color: '#B69EFF', bg: '#EDE7FF' },
            ].map(l => (
              <div key={l.title} className="card" style={{ borderTop: `4px solid ${l.color}`, borderRadius: 16, padding: '1.25rem' }}>
                <div style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>{l.emoji}</div>
                <p style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{l.title}</p>
                <p style={{ color: '#64748B', fontSize: '0.82rem' }}>{l.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════ STACK ══════════════════════════════ */}
        <section style={{ padding: '4.5rem 0', borderBottom: '2px solid #F0F2F8' }}>
          <p className="badge" style={{ background: '#EDE7FF', color: '#5E35B1', border: '1.5px solid #B69EFF', marginBottom: '0.75rem', display: 'inline-flex' }}>
            🛠️ Stack Tecnológica
          </p>
          <h2 className="section-title">O motor por dentro.</h2>
          <p className="section-subtitle">Tecnologias escolhidas pela robustez e pelo custo acessível.</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
            {/* Software */}
            <div className="card" style={{ flex: 1, minWidth: 280 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid #F0F2F8' }}>
                <div style={{ padding: '0.5rem', background: '#E1F5FE', borderRadius: 10 }}>
                  <IconCode size={20} color="#0288D1" />
                </div>
                <span style={{ fontWeight: 800, letterSpacing: '0.06em', color: '#0288D1', fontSize: '0.9rem' }}>SOFTWARE</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {[
                  ['Front-end Web', 'Next.js + Tailwind', '#4FC3F7', '#E1F5FE'],
                  ['Lógica & Back-end', 'Python / API REST', '#7DCE82', '#E8F5E9'],
                  ['Firmware', 'C / C++', '#B69EFF', '#EDE7FF'],
                  ['Integração LMS', 'API Moodle', '#FF6B35', '#FFE8DF'],
                ].map(([label, tech, color, bg]) => (
                  <li key={label as string} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, color: '#1A1A2E', fontSize: '0.9rem' }}>{label}</span>
                    <span style={{ fontFamily: 'monospace', background: bg as string, color: color as string, fontSize: '0.8rem', fontWeight: 700, padding: '0.2rem 0.7rem', borderRadius: 999 }}>{tech}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hardware */}
            <div className="card" style={{ flex: 1, minWidth: 280 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid #F0F2F8' }}>
                <div style={{ padding: '0.5rem', background: '#FFE8DF', borderRadius: 10 }}>
                  <IconCpu size={20} color="#C0440A" />
                </div>
                <span style={{ fontWeight: 800, letterSpacing: '0.06em', color: '#C0440A', fontSize: '0.9rem' }}>HARDWARE</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {[
                  ['Processamento', 'Raspberry Pi', '#FF6B35', '#FFE8DF'],
                  ['Conectividade', 'ESP32 (Wi-Fi)', '#FFD700', '#FFF3B0'],
                  ['Leitura Óptica', 'Leitor GM65 1D', '#B69EFF', '#EDE7FF'],
                  ['Interface Visual', 'Display TFT ILI9341', '#4FC3F7', '#E1F5FE'],
                ].map(([label, tech, color, bg]) => (
                  <li key={label as string} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, color: '#1A1A2E', fontSize: '0.9rem' }}>{label}</span>
                    <span style={{ fontFamily: 'monospace', background: bg as string, color: color as string, fontSize: '0.8rem', fontWeight: 700, padding: '0.2rem 0.7rem', borderRadius: 999 }}>{tech}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Custo */}
            <div className="card" style={{ flex: '0 0 100%', background: 'linear-gradient(135deg, #FFF3B0 0%, #FFE8DF 100%)', borderColor: '#FFD700' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontWeight: 900, fontSize: '2rem', color: '#1A1A2E' }}>R$ 225 – R$ 340</p>
                  <p style={{ color: '#64748B', fontWeight: 600 }}>Custo total estimado do hardware</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    'Tela TFT ILI9341 (obrigatória)',
                    'Leitor Óptico GM65 (obrigatório)',
                    'Raspberry Pi + ESP32 (modular)',
                  ].map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#7DCE82', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <IconCheck size={11} color="#fff" />
                      </div>
                      <span style={{ fontSize: '0.85rem', color: '#1A1A2E', fontWeight: 500 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════ ROADMAP ══════════════════════════════ */}
        <section style={{ padding: '4.5rem 0', borderBottom: '2px solid #F0F2F8' }}>
          <p className="badge" style={{ background: '#FFF3B0', color: '#B8860B', border: '1.5px solid #FFD700', marginBottom: '0.75rem', display: 'inline-flex' }}>
            🗺️ Roadmap
          </p>
          <h2 className="section-title">Cronograma de Execução</h2>
          <p className="section-subtitle">Quatro fases do MVP até a defesa do TCC.</p>

          {/* Progress bar */}
          <div style={{ background: '#F0F2F8', borderRadius: 999, height: 8, marginBottom: '2rem', overflow: 'hidden' }}>
            <div style={{ width: '25%', height: '100%', background: 'linear-gradient(90deg, #FFD700, #FF6B35)', borderRadius: 999 }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              {
                phase: 'FASE 01', status: 'active',
                title: 'MVP Local',
                desc: 'Raspberry Pi + Next.js + dados mockados. Landing page. Validação de viabilidade.',
                emoji: '🚀',
              },
              {
                phase: 'FASE 02', status: 'upcoming',
                title: 'Integração',
                desc: 'Banco de dados, Back-end Python e integração com o Leitor 1D e ESP32.',
                emoji: '🔌',
              },
              {
                phase: 'FASE 03', status: 'upcoming',
                title: 'Validação de Campo',
                desc: 'Testes práticos no campus com alunos reais e geração automática de CSVs.',
                emoji: '🧪',
              },
              {
                phase: 'FASE 04', status: 'upcoming',
                title: 'Defesa TCC',
                desc: 'Modelagem 3D do totem, documentação final e apresentação à banca.',
                emoji: '🎓',
              },
            ].map((f) => (
              <div
                key={f.phase}
                className="phase-card"
                style={f.status === 'active' ? {
                  borderColor: '#E6B800',
                  background: 'linear-gradient(135deg, #FFF9D6, #FFF3B0)',
                } : {}}
              >
                <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{f.emoji}</div>
                <span style={{
                  fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em',
                  color: f.status === 'active' ? '#B8860B' : '#94A3B8',
                  display: 'block', marginBottom: '0.3rem'
                }}>{f.phase}</span>
                <p style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.4rem', color: f.status === 'active' ? '#1A1A2E' : '#64748B' }}>
                  {f.title}
                  {f.status === 'active' && (
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', background: '#FFD700', color: '#7A5C00', borderRadius: 999, padding: '0.1rem 0.5rem', fontWeight: 700 }}>ATUAL</span>
                  )}
                </p>
                <p style={{ fontSize: '0.8rem', color: '#94A3B8', lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════ EQUIPE ══════════════════════════════ */}
        <section style={{ padding: '4.5rem 0' }}>
          <p className="badge" style={{ background: '#E8F5E9', color: '#2E7D32', border: '1.5px solid #7DCE82', marginBottom: '0.75rem', display: 'inline-flex' }}>
            👥 A Equipe
          </p>
          <h2 className="section-title">Quem faz o Life acontecer.</h2>
          <p className="section-subtitle">Estudantes de Automação Industrial — Turma TCC 2026.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <TeamCard name="Felipe Savazi" initials="FS" role="Arquitetura de Hardware & Firmware" bg="linear-gradient(135deg, #FF6B35, #FFD700)" color="#fff" />
            <TeamCard name="Julia Moreira" initials="JM" role="Back-end Python & Integrações" bg="linear-gradient(135deg, #4FC3F7, #B69EFF)" color="#fff" />
            <TeamCard name="Lara Moreira" initials="LM" role="Front-end Next.js & UI/UX" bg="linear-gradient(135deg, #7DCE82, #4FC3F7)" color="#fff" />
            <TeamCard name="Laura Vitoria" initials="LV" role="Documentação & Validação de Campo" bg="linear-gradient(135deg, #B69EFF, #FF6B35)" color="#fff" />
          </div>
        </section>

      </main>

      {/* ══════════════════════════════ FOOTER ══════════════════════════════ */}
      <footer style={{
        marginTop: '2rem',
        borderTop: '4px solid transparent',
        borderImage: 'linear-gradient(90deg, #FFD700, #FF6B35, #4FC3F7, #B69EFF) 1',
        background: '#F8F9FE',
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.2rem' }}>✨</span>
            <span style={{ fontWeight: 900, color: '#FF6B35', fontSize: '1.1rem' }}>Life</span>
            <span style={{ color: '#B0B8C8' }}>·</span>
            <span style={{ color: '#64748B', fontWeight: 600 }}>Totem HTO</span>
          </div>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
            Desenvolvido para Trabalho de Conclusão de Curso em Automação Industrial.
          </p>
          <p style={{ color: '#B0B8C8', fontSize: '0.78rem' }}>
            {new Date().getFullYear()} © Felipe Savazi · Julia Moreira · Lara Moreira · Laura Vitoria
          </p>
          <a
            href="https://github.com/FelipeSavazii/TCC-Automacao"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              color: '#64748B', fontWeight: 600, fontSize: '0.82rem',
              textDecoration: 'none', marginTop: '1rem',
              transition: 'color 0.2s',
            }}
          >
            <IconGithub size={15} color="#64748B" />
            github.com/FelipeSavazii/TCC-Automacao
          </a>
        </div>
      </footer>

    </div>
  );
}