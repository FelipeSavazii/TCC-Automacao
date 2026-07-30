'use client';
import React, { useEffect, useState, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════════
   ÍCONES
   ═══════════════════════════════════════════════════════════ */
const IconGithub = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);
const IconX = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconCheck = ({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconZap = ({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
);
const IconArrow = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);
const IconCode = ({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
  </svg>
);
const IconCpu = ({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" />
    <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════
   BOLAS FLUTUANTES (Divertidamente)
   ═══════════════════════════════════════════════════════════ */
function FloatingOrbs() {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
      <div className="orb orb-joy"     style={{ width: 340, height: 340, top: '-80px',  right: '6%' }} />
      <div className="orb orb-sadness" style={{ width: 220, height: 220, top: '38%',   left: '-60px' }} />
      <div className="orb orb-angry"   style={{ width: 180, height: 180, bottom: '-30px', right: '18%' }} />
      <div className="orb orb-fear"    style={{ width: 160, height: 160, top: '8%',    left: '28%' }} />
      <div className="orb orb-disgust" style={{ width: 140, height: 140, bottom: '12%', left: '12%' }} />
      <div className="orb orb-envy"    style={{ width: 120, height: 120, top: '22%',   right: '28%' }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MODAL DOCENTE
   ═══════════════════════════════════════════════════════════ */
function DocenteModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<'aviso' | 'export'>('aviso');
  const [form, setForm] = useState({ disciplina: '', data: '', descricao: '' });
  const [sent, setSent] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <p style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9B59B6', marginBottom: '0.25rem' }}>Portal docente</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>Administração do totem</h2>
          </div>
          <button onClick={onClose} id="modal-close" style={{ background: 'var(--bg-soft)', border: '1.5px solid var(--border-md)', borderRadius: 10, padding: '0.45rem', cursor: 'pointer', color: 'var(--text-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <IconX size={15} />
          </button>
        </div>

        <div className="tab-nav" style={{ marginBottom: '1.5rem' }}>
          <button className={`tab-btn ${tab === 'aviso' ? 'active' : ''}`} onClick={() => setTab('aviso')}>Aviso de prova</button>
          <button className={`tab-btn ${tab === 'export' ? 'active' : ''}`} onClick={() => setTab('export')}>Exportar CSV</button>
        </div>

        {tab === 'aviso' && (
          !sent ? (
            <form onSubmit={e => { e.preventDefault(); setSent(true); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-md)', display: 'block', marginBottom: '0.4rem' }}>Disciplina</label>
                <input id="modal-disciplina" className="modal-input" required placeholder="Ex: Matemática Aplicada" value={form.disciplina} onChange={e => setForm(f => ({ ...f, disciplina: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-md)', display: 'block', marginBottom: '0.4rem' }}>Data da prova</label>
                <input id="modal-data" className="modal-input" required type="date" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-md)', display: 'block', marginBottom: '0.4rem' }}>Conteúdo</label>
                <textarea id="modal-descricao" className="modal-input" rows={3} placeholder="Ex: Capítulos 3 a 7, derivadas..." value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} style={{ resize: 'vertical' }} />
              </div>
              <button id="modal-submit" type="submit" className="btn btn-primary" style={{ marginTop: '0.25rem' }}>
                <IconZap size={14} color="#fff" />
                Publicar no totem
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#E0FAF0', border: '2px solid #2ECC71', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <IconCheck size={26} color="#2ECC71" />
              </div>
              <p style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.35rem' }}>Aviso publicado!</p>
              <p style={{ color: 'var(--text-md)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>Os alunos verão o alerta ao acessar o totem e selecionar sua sala.</p>
              <button className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '0.65rem 1.5rem' }} onClick={() => setSent(false)}>Publicar outro aviso</button>
            </div>
          )
        )}

        {tab === 'export' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ color: 'var(--text-md)', fontSize: '0.9rem', lineHeight: 1.7 }}>
              O arquivo <strong style={{ color: 'var(--text)' }}>CSV</strong> é gerado automaticamente pelo back-end Python a cada acesso ao totem, sem nenhuma ação manual.
            </p>
            <div style={{ background: 'var(--bg-soft)', border: '1.5px solid var(--border-md)', borderRadius: 12, padding: '1rem', fontFamily: 'monospace', fontSize: '0.72rem' }}>
              <div style={{ color: '#4A90D9', marginBottom: 4, fontWeight: 700 }}>timestamp,sala,aluno,evento</div>
              <div style={{ color: 'var(--text-md)', marginBottom: 2 }}>16:22:01,HT12345,&quot;Felipe Savazi&quot;,Entrada</div>
              <div style={{ color: 'var(--text-md)', marginBottom: 2 }}>16:24:15,HT12346,&quot;Julia Moreira&quot;,Entrada</div>
              <div style={{ color: 'var(--text-md)' }}>16:30:42,HT12347,&quot;Lara Moreira&quot;,Entrada</div>
            </div>
            {!exported ? (
              <button id="modal-export" className="btn btn-primary" onClick={() => { setExporting(true); setTimeout(() => { setExporting(false); setExported(true); }, 1800); }} disabled={exporting}>
                {exporting ? '⏳ Gerando...' : 'Exportar presenca.csv'}
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1rem', background: '#E0FAF0', border: '1.5px solid #2ECC71', borderRadius: 12 }}>
                <IconCheck size={15} color="#2ECC71" />
                <span style={{ color: '#0f7a3c', fontWeight: 700, fontSize: '0.88rem' }}>presenca_2026-07-30.csv baixado!</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
   ═══════════════════════════════════════════════════════════ */
export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [stackTab, setStackTab] = useState<'software' | 'hardware'>('software');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = showModal ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showModal]);

  const handleCardMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${(e.clientX - rect.left) / rect.width * 100}%`);
    el.style.setProperty('--my', `${(e.clientY - rect.top) / rect.height * 100}%`);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).style.opacity = '1';
          (e.target as HTMLElement).style.animation = 'fade-up 0.65s ease-out both';
        }
      }),
      { threshold: 0.08 }
    );
    document.querySelectorAll('[data-fade]').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const softwareStack = [
    { label: 'Front-end web', tech: 'Next.js 16', color: '#4A90D9', accent: '#E3EEFA' },
    { label: 'Lógica e back-end', tech: 'Python / API REST', color: '#2ECC71', accent: '#E0FAF0' },
    { label: 'Firmware', tech: 'C / C++', color: '#9B59B6', accent: '#F0E6FA' },
    { label: 'Integração LMS', tech: 'API Moodle', color: '#FF6B35', accent: '#FFE8DF' },
    { label: 'Log de presença', tech: 'CSV automático', color: '#B8860B', accent: '#FFF9D6' },
  ];
  const hardwareStack = [
    { label: 'Processamento central', tech: 'Raspberry Pi', color: '#FF4B4B', accent: '#FFEAEA' },
    { label: 'Conectividade Wi-Fi', tech: 'Raspberry Pi', color: '#FF6B35', accent: '#FFE8DF' },
    { label: 'Entrada do usuário', tech: 'Teclado físico', color: '#4A90D9', accent: '#E3EEFA' },
    { label: 'Interface visual', tech: 'Display TFT ILI9341', color: '#9B59B6', accent: '#F0E6FA' },
    { label: 'Custo total', tech: 'R$ 225 – R$ 340', color: '#2ECC71', accent: '#E0FAF0' },
  ];

  const phases = [
    { phase: '01', status: 'active',   title: 'MVP local',          desc: 'Raspberry Pi + Next.js + dados mockados. Landing page e validação de viabilidade.', emoji: '🚀', color: '#FFD700', textColor: '#5a3e00' },
    { phase: '02', status: 'upcoming', title: 'Integração',         desc: 'Banco de dados, back-end Python e integração do teclado e interface do totem.',             emoji: '🔌', color: '#4A90D9', textColor: '#1a4fa0' },
    { phase: '03', status: 'upcoming', title: 'Validação de campo', desc: 'Testes práticos no campus com alunos reais e geração automática de CSVs.',           emoji: '🧪', color: '#9B59B6', textColor: '#5a1a8a' },
    { phase: '04', status: 'upcoming', title: 'Defesa do TCC',      desc: 'Modelagem 3D do totem, documentação final e apresentação à banca.',                   emoji: '🎓', color: '#FF6B35', textColor: '#8a2800' },
  ];

  const team = [
    { name: 'Felipe Savazi',  initials: 'FS', role: 'Hardware e firmware', tags: ['Raspberry Pi', 'Python', 'C++'],              gradient: 'linear-gradient(135deg,#FFD700,#FF6B35)', glow: 'rgba(255,107,53,0.3)' },
    { name: 'Julia Moreira',  initials: 'JM', role: 'Back-end Python e API', tags: ['Python', 'REST', 'Moodle'],        gradient: 'linear-gradient(135deg,#4A90D9,#2ECC71)', glow: 'rgba(74,144,217,0.3)' },
    { name: 'Lara Moreira',   initials: 'LM', role: 'Front-end e UI/UX',    tags: ['Next.js', 'TypeScript', 'CSS'],     gradient: 'linear-gradient(135deg,#9B59B6,#FF4B4B)', glow: 'rgba(155,89,182,0.3)' },
    { name: 'Laura Vitoria',  initials: 'LV', role: 'Documentação e validação', tags: ['Pesquisa', 'CSV', 'Banca'],    gradient: 'linear-gradient(135deg,#2ECC71,#4A90D9)', glow: 'rgba(46,204,113,0.3)' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>

      {/* ════════════════ NAV ════════════════ */}
      <nav className={`nav-bar ${scrolled ? 'scrolled' : ''}`}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 1.5rem', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#FFD700,#FF6B35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', boxShadow: '0 4px 14px rgba(255,107,53,0.35)', flexShrink: 0 }}>
              ✨
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text)', letterSpacing: '-0.03em' }}>
              Life <span style={{ color: 'var(--text-lo)', fontWeight: 400, fontSize: '0.8rem' }}>· Totem HTO</span>
            </span>
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="badge badge-joy">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFD700', display: 'inline-block', animation: 'dot-blink 1.6s ease-in-out infinite', flexShrink: 0 }} />
              MVP ativo
            </span>
            <button id="nav-docente" onClick={() => setShowModal(true)} className="btn btn-secondary" style={{ padding: '0.5rem 1.1rem', fontSize: '0.82rem' }}>
              Portal docente
            </button>
            <a href="https://github.com/FelipeSavazii/TCC-Automacao" target="_blank" rel="noopener noreferrer" id="nav-github"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: 10, border: '1.5px solid var(--border-md)', color: 'var(--text-md)', transition: 'border-color 0.2s', textDecoration: 'none' }}>
              <IconGithub size={16} />
            </a>
          </div>
        </div>
      </nav>

      {/* ════════════════ HERO ════════════════ */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: '88vh', display: 'flex', alignItems: 'center' }}>
        <FloatingOrbs />
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 55% at 50% 0%, rgba(255,215,0,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1120, margin: '0 auto', padding: '6rem 1.5rem 5rem' }}>
          <div style={{ maxWidth: 760 }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.75rem', alignItems: 'center' }}>
              <span className="badge badge-joy">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFD700', display: 'inline-block', animation: 'dot-blink 1.6s ease-in-out infinite', flexShrink: 0 }} />
                Fase 01 — MVP em desenvolvimento
              </span>
              <span className="badge badge-blue">TCC · Automação Industrial · IFSP</span>
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, lineHeight: 1.07, fontSize: 'clamp(3rem, 7vw, 5.8rem)', letterSpacing: '-0.04em', marginBottom: '1.5rem' }}>
              Esqueça o celular.<br />
              <span className="text-grad-full">Você não precisa dele.</span>
            </h1>

            <p style={{ fontSize: '1.15rem', color: 'var(--text-md)', lineHeight: 1.75, maxWidth: 600, marginBottom: '2.5rem' }}>
              O <strong style={{ color: 'var(--text)' }}>Life</strong> é um totem físico com teclado que centraliza tudo que o estudante precisa — selecione a sala, veja o cronograma, sem smartphone, sem infração.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', marginBottom: '3.5rem', alignItems: 'center' }}>
              <button id="hero-cta-specs" className="btn btn-primary" onClick={() => document.getElementById('solucao')?.scrollIntoView({ behavior: 'smooth' })}>
                <IconZap size={14} color="#fff" />
                Ver o projeto
              </button>
              <button id="hero-cta-docente" className="btn btn-secondary" onClick={() => setShowModal(true)}>
                Portal docente
                <IconArrow size={12} />
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
              {[
                { emoji: '💰', label: 'R$ 225–340', sub: 'Custo total estimado' },
                { emoji: '⚡', label: '< 5 segundos', sub: 'Dados na tela' },
                { emoji: '⚖️', label: '100% legal', sub: 'Respeita a legislação' },
                { emoji: '📋', label: 'CSV automático', sub: 'Log de presença' },
              ].map(s => (
                <div key={s.label} className="stat-pill">
                  <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{s.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.87rem', color: 'var(--text)' }}>{s.label}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-lo)' }}>{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ ARQUITETURA — 3 painéis coloridos grandes, sem caixinhas brancas ════════════════ */}
      <section id="solucao" style={{ background: 'var(--bg)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '5rem 1.5rem 1rem' }}>
          <div data-fade style={{ opacity: 0 }}>
            <p className="section-eyebrow">Arquitetura da solução</p>
            <h2 className="section-title">Três pilares, uma solução.</h2>
          </div>
        </div>

        {/* Painéis coloridos full-width alternados */}
        <div>
          {/* Painel 1 — Amarelo */}
          <div style={{ background: '#FFF9D6', borderTop: '3px solid #FFD700' }}>
            <div style={{ maxWidth: 1120, margin: '0 auto', padding: '3rem 1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2.5rem' }}>
              <div style={{ fontSize: '4rem', lineHeight: 1, flexShrink: 0 }}>📵</div>
              <div style={{ flex: 1, minWidth: 260 }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Governança sem telas</p>
                <p style={{ color: 'var(--text-md)', fontSize: '1rem', lineHeight: 1.72 }}>Respeita a legislação de restrição de smartphones. Os alunos mantêm acesso a dados acadêmicos sem infringir as regras escolares.</p>
              </div>
              <span className="badge badge-joy" style={{ flexShrink: 0 }}>Lei aprovada ✓</span>
            </div>
          </div>

          {/* Painel 2 — Azul */}
          <div style={{ background: '#E3EEFA', borderTop: '3px solid #4A90D9' }}>
            <div style={{ maxWidth: 1120, margin: '0 auto', padding: '3rem 1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2.5rem', flexDirection: 'row-reverse' }}>
              <div style={{ fontSize: '4rem', lineHeight: 1, flexShrink: 0 }}>⚡</div>
              <div style={{ flex: 1, minWidth: 260 }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Informação em 5 segundos</p>
                <p style={{ color: 'var(--text-md)', fontSize: '1rem', lineHeight: 1.72 }}>Fim da desinformação sobre datas de provas e avisos. Interface projetada para leitura ultrarrápida nos corredores movimentados.</p>
              </div>
              <span className="badge badge-blue" style={{ flexShrink: 0 }}>UX otimizado</span>
            </div>
          </div>

          {/* Painel 3 — Verde */}
          <div style={{ background: '#E0FAF0', borderTop: '3px solid #2ECC71' }}>
            <div style={{ maxWidth: 1120, margin: '0 auto', padding: '3rem 1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2.5rem' }}>
              <div style={{ fontSize: '4rem', lineHeight: 1, flexShrink: 0 }}>🪪</div>
              <div style={{ flex: 1, minWidth: 260 }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Integração frugal</p>
                <p style={{ color: 'var(--text-md)', fontSize: '1rem', lineHeight: 1.72 }}>Sem cadastros, sem senha. O aluno só usa o teclado do totem para selecionar a sala e ver todas as informações instantaneamente.</p>
              </div>
              <span className="badge badge-green" style={{ flexShrink: 0 }}>Zero custo extra</span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ PERSONA ════════════════ */}
      <section style={{ background: '#F7F4FF', padding: '5.5rem 0', borderTop: '1.5px solid rgba(155,89,182,0.15)', borderBottom: '1.5px solid rgba(155,89,182,0.1)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 1.5rem' }}>

          {/* Cabeçalho da seção */}
          <div data-fade style={{ opacity: 0, marginBottom: '3rem' }}>
            <p className="section-eyebrow">A persona</p>
            <h2 className="section-title">Um dia real no IFSP.</h2>
            <p className="section-sub">Entender o problema é a metade da solução. Aqui está o dia que levou ao Life.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>

            {/* Coluna esquerda — impacto numérico + citação */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Bloco de número grande */}
              <div style={{ background: 'linear-gradient(135deg, #FFD700, #FF6B35)', borderRadius: 'var(--r-xl)', padding: '2.5rem 2rem', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                <div aria-hidden style={{ position: 'absolute', right: '-20px', bottom: '-30px', fontSize: '8rem', opacity: 0.15, lineHeight: 1 }}>?</div>
                <p style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.75, marginBottom: '0.6rem' }}>O problema em números</p>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '4.5rem', lineHeight: 1, letterSpacing: '-0.04em', marginBottom: '0.3rem' }}>3x</p>
                <p style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>vezes que um aluno precisa checar onde é sua aula num dia típico de remanejamento</p>
                <p style={{ fontSize: '0.8rem', opacity: 0.75 }}>Sem totem: mural desatualizado, grupo de WhatsApp ou perguntar ao colega. Com celular proibido, as três opções falham.</p>
              </div>

              {/* Citação */}
              <div style={{ background: '#fff', borderRadius: 'var(--r-lg)', border: '1.5px solid rgba(155,89,182,0.2)', padding: '1.75rem', position: 'relative' }}>
                <div style={{ fontSize: '3rem', lineHeight: 1, color: '#9B59B6', marginBottom: '0.5rem', fontFamily: 'Georgia, serif', opacity: 0.4 }}>&ldquo;</div>
                <p style={{ fontSize: '1rem', fontStyle: 'italic', color: 'var(--text)', lineHeight: 1.75, marginBottom: '1rem' }}>
                  Cheguei na sala errada porque o mural ainda estava com o horário da semana passada. Sem celular, não tinha como saber.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#FFD700,#FF6B35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.9rem', color: '#fff', flexShrink: 0 }}>F</div>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text)' }}>Felipe S.</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-lo)' }}>Estudante técnico · IFSP Hortolândia</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Coluna direita — cenário narrado em 4 momentos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-lo)', marginBottom: '1rem' }}>Uma manhã sem o Life</p>

              {[
                {
                  time: '07:45',
                  emoji: '🚶',
                  title: 'Chegou cedo — e perdido',
                  text: 'Felipe chega no campus. Sabe que tem aula de Automação, mas não sabe em qual sala. O mural na entrada não foi atualizado.',
                  color: '#9B59B6',
                  bg: '#F7F4FF',
                  border: '#9B59B6',
                },
                {
                  time: '07:52',
                  emoji: '👥',
                  title: 'Perguntando nos corredores',
                  text: 'Sem celular para checar o grupo da turma, ele precisa perguntar pessoalmente para colegas que também não sabem.',
                  color: '#FF6B35',
                  bg: '#FFF5F0',
                  border: '#FF6B35',
                },
                {
                  time: '08:04',
                  emoji: '🚫',
                  title: 'Sala errada, 4 minutos atrasado',
                  text: 'Entrou na sala 12. O professor já tinha começado. A aula era na sala 18. Perdeu a chamada e parte do conteúdo.',
                  color: '#FF4B4B',
                  bg: '#FFF0F0',
                  border: '#FF4B4B',
                },
                {
                  time: '08:05',
                  emoji: '✨',
                  title: 'Com o Life: 10 segundos',
                  text: 'No totem no corredor, seleciona sua turma no teclado. O display mostra: Sala 18, professor presente. Vai direto.',
                  color: '#2ECC71',
                  bg: '#F0FFF7',
                  border: '#2ECC71',
                },
              ].map((moment, i) => (
                <div key={moment.time} style={{ display: 'flex', gap: '0', alignItems: 'stretch' }}>
                  {/* Linha de tempo */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 48 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: moment.bg, border: `2px solid ${moment.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0, zIndex: 1 }}>{moment.emoji}</div>
                    {i < 3 && <div style={{ width: 2, flex: 1, background: `${moment.border}30`, minHeight: 20 }} />}
                  </div>
                  {/* Conteúdo */}
                  <div style={{ paddingLeft: '1rem', paddingBottom: i < 3 ? '1.25rem' : 0, flex: 1 }}>
                    <p style={{ fontSize: '0.68rem', fontWeight: 800, color: moment.color, letterSpacing: '0.06em', marginBottom: '0.2rem' }}>{moment.time}</p>
                    <p style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.25rem' }}>{moment.title}</p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-md)', lineHeight: 1.65 }}>{moment.text}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════ COMO FUNCIONA — fundo índigo suave ════════════════ */}
      <section style={{ background: 'linear-gradient(160deg, #EEF3FB 0%, #F0EBF8 100%)', padding: '5.5rem 0', borderTop: '1.5px solid rgba(74,144,217,0.15)', borderBottom: '1.5px solid rgba(155,89,182,0.15)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 1.5rem' }}>
          <div data-fade style={{ opacity: 0 }}>
            <p className="section-eyebrow">Como funciona</p>
            <h2 className="section-title">Três passos. Cinco segundos.</h2>
            <p className="section-sub">Do teclado do totem ao dado na tela — simples assim.</p>
          </div>

          {/* Passos conectados */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0', position: 'relative', marginBottom: '2.5rem' }}>
            {[
              { num: '01', emoji: '⌨️', label: 'Seleção', desc: 'Aluno usa o teclado do totem para selecionar sua turma ou sala desejada', color: '#FFD700', bg: '#FFF9D6', border: '#FFD700' },
              { num: '02', emoji: '🧠', label: 'Processamento', desc: 'Raspberry Pi processa a entrada e consulta o banco de dados local via Python', color: '#4A90D9', bg: '#EEF3FB', border: '#4A90D9' },
              { num: '03', emoji: '🖥️', label: 'Exibição e log', desc: 'Display TFT mostra o cronograma. Python registra a presença em CSV', color: '#2ECC71', bg: '#E0FAF0', border: '#2ECC71' },
            ].map((step, i, arr) => (
              <React.Fragment key={step.num}>
                <div style={{ flex: 1, minWidth: 200, padding: '2rem 1.5rem', background: step.bg, border: `1.5px solid ${step.border}40`, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2.2rem', color: step.color, lineHeight: 1 }}>{step.num}</span>
                  <div style={{ fontSize: '1.8rem', lineHeight: 1 }}>{step.emoji}</div>
                  <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)' }}>{step.label}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-md)', lineHeight: 1.65 }}>{step.desc}</p>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ alignSelf: 'center', color: 'var(--text-lo)', fontSize: '1.5rem', padding: '0 0.25rem', flexShrink: 0 }}>→</div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* 4 camadas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: '0.75rem' }}>
            {[
              { emoji: '⌨️', title: 'Entrada', desc: 'Teclado físico do totem', color: '#B8860B', bg: '#FFF9D6', border: '#FFD700' },
              { emoji: '🧠', title: 'Processamento', desc: 'Raspberry Pi + Python', color: '#c0002f', bg: '#FFEAEA', border: '#FF4B4B' },
              { emoji: '☁️', title: 'Dados', desc: 'Back-end Python + CSV', color: '#1a4fa0', bg: '#EEF3FB', border: '#4A90D9' },
              { emoji: '📺', title: 'Exibição', desc: 'TFT ILI9341 + Next.js', color: '#0f7a3c', bg: '#E0FAF0', border: '#2ECC71' },
            ].map(l => (
              <div key={l.title} style={{ background: l.bg, border: `1.5px solid ${l.border}50`, borderTop: `3px solid ${l.border}`, borderRadius: 16, padding: '1.25rem' }}>
                <div style={{ fontSize: '1.4rem', marginBottom: '0.5rem', lineHeight: 1 }}>{l.emoji}</div>
                <p style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.2rem', color: l.color }}>{l.title}</p>
                <p style={{ color: 'var(--text-md)', fontSize: '0.78rem' }}>{l.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ STACK — fundo suave com abas ════════════════ */}
      <section style={{ background: 'var(--bg-soft)', padding: '5.5rem 0' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 1.5rem' }}>
          <div data-fade style={{ opacity: 0 }}>
            <p className="section-eyebrow">Stack tecnológica</p>
            <h2 className="section-title">O motor por dentro.</h2>
            <p className="section-sub">Tecnologias escolhidas pela robustez e pelo custo acessível para um projeto de TCC real.</p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' }}>
            {/* Abas + lista */}
            <div style={{ flex: 1, minWidth: 280 }}>
              <div className="tab-nav" style={{ marginBottom: '1.25rem', maxWidth: 340 }}>
                <button id="tab-software" className={`tab-btn ${stackTab === 'software' ? 'active' : ''}`} onClick={() => setStackTab('software')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><IconCode size={13} />Software</span>
                </button>
                <button id="tab-hardware" className={`tab-btn ${stackTab === 'hardware' ? 'active' : ''}`} onClick={() => setStackTab('hardware')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><IconCpu size={13} />Hardware</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(stackTab === 'software' ? softwareStack : hardwareStack).map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', padding: '0.9rem 1.1rem', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 14, transition: 'border-color 0.2s' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)' }}>{item.label}</span>
                    <span className="tech-chip" style={{ color: item.color, borderColor: `${item.color}60`, background: item.accent }}>{item.tech}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Banner de custo */}
            <div style={{ flex: '0 0 auto', width: 'min(320px, 100%)', background: 'linear-gradient(135deg,#FFF9D6,#FFE8DF)', border: '1.5px solid #FFD70080', borderRadius: 'var(--r-xl)', padding: '2rem', boxShadow: '0 8px 32px rgba(255,215,0,0.12)' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8a6000', marginBottom: '0.4rem' }}>Custo total do hardware</p>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2.4rem', letterSpacing: '-0.04em', color: 'var(--text)', lineHeight: 1.1, marginBottom: '0.3rem' }}>R$ 225<span style={{ fontSize: '1.5rem', opacity: 0.5 }}>–</span>340</p>
              <p style={{ color: 'var(--text-md)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>BOM estimado com componentes modulares</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['Tela TFT ILI9341 (obrigatória)', 'Teclado físico (entrada do usuário)', 'Raspberry Pi (processamento central)'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#2ECC71', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <IconCheck size={10} color="#fff" />
                    </div>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-md)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ ROADMAP — timeline horizontal com linha ════════════════ */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '5.5rem 1.5rem' }}>
        <div data-fade style={{ opacity: 0 }}>
          <p className="section-eyebrow">Roadmap</p>
          <h2 className="section-title">Cronograma de execução.</h2>
          <p className="section-sub">Quatro fases — do MVP à defesa do TCC 2026.</p>
        </div>

        {/* Barra de progresso */}
        <div style={{ background: 'var(--bg-soft)', border: '1.5px solid var(--border)', borderRadius: 999, height: 8, marginBottom: '2.5rem', overflow: 'hidden' }}>
          <div style={{ width: '25%', height: '100%', background: 'linear-gradient(90deg,#FFD700,#FF6B35)', borderRadius: 999, boxShadow: '0 0 10px rgba(255,215,0,0.4)' }} />
        </div>

        {/* Timeline com linha conectando */}
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0' }}>
          {/* Linha horizontal */}
          <div aria-hidden="true" style={{ position: 'absolute', top: 28, left: '12.5%', right: '12.5%', height: 2, background: 'linear-gradient(90deg,#FFD700,#4A90D9,#9B59B6,#FF6B35)', borderRadius: 1, zIndex: 0 }} />

          {phases.map((f, i) => (
            <div key={f.phase} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 1rem' }}>
              {/* Círculo na linha */}
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: f.status === 'active' ? f.color : '#fff', border: `2.5px solid ${f.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1.25rem', boxShadow: f.status === 'active' ? `0 0 0 6px ${f.color}25, 0 4px 16px ${f.color}40` : '0 2px 8px rgba(0,0,0,0.06)', lineHeight: 1 }}>
                {f.emoji}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: f.status === 'active' ? f.color : 'var(--text-lo)' }}>FASE {f.phase}</span>
                {f.status === 'active' && (
                  <span style={{ fontSize: '0.58rem', background: f.color, color: f.textColor, borderRadius: 999, padding: '0.08rem 0.5rem', fontWeight: 900 }}>ATUAL</span>
                )}
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.4rem', color: f.status === 'active' ? 'var(--text)' : 'var(--text-md)' }}>{f.title}</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-lo)', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════ EQUIPE — fundo creme suave ════════════════ */}
      <section style={{ background: 'linear-gradient(160deg, #FFFDF5 0%, #FFF5E6 100%)', padding: '5.5rem 0 6rem', borderTop: '1.5px solid rgba(255,215,0,0.2)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 1.5rem' }}>
          <div data-fade style={{ opacity: 0 }}>
            <p className="section-eyebrow">A equipe</p>
            <h2 className="section-title">Quem faz o Life acontecer.</h2>
            <p className="section-sub">Estudantes de Automação Industrial — Turma TCC 2026, IFSP Hortolândia.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem' }}>
            {team.map(m => (
              <div key={m.name} className="card" onMouseMove={handleCardMove} style={{ textAlign: 'center', padding: '2.25rem 1.5rem', background: '#fff' }}>
                <div className="team-avatar" style={{ background: m.gradient, color: '#fff', boxShadow: `0 8px 28px ${m.glow}` }}>{m.initials}</div>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.97rem', marginBottom: '0.25rem', color: 'var(--text)' }}>{m.name}</p>
                <p style={{ color: 'var(--text-md)', fontSize: '0.82rem', marginBottom: '1rem' }}>{m.role}</p>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {m.tags.map(tag => (
                    <span key={tag} style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.6rem', background: 'var(--bg-soft)', border: '1.5px solid var(--border-md)', borderRadius: 999, color: 'var(--text-md)' }}>{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ FOOTER ════════════════ */}
      <footer style={{ borderTop: '1.5px solid var(--border-md)', background: 'var(--bg-soft)', padding: '2.5rem 1.5rem' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg,#FFD700,#FF6B35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', boxShadow: '0 3px 10px rgba(255,107,53,0.3)', flexShrink: 0 }}>✨</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem', color: 'var(--text)' }}>Life · Totem HTO</span>
          </div>
          <p style={{ color: 'var(--text-lo)', fontSize: '0.78rem', textAlign: 'center' }}>
            TCC · Automação Industrial · IFSP Hortolândia · {new Date().getFullYear()} ©{' '}
            <span style={{ color: 'var(--text-md)' }}>Felipe Savazi · Julia Moreira · Lara Moreira · Laura Vitoria</span>
          </p>
          <a href="https://github.com/FelipeSavazii/TCC-Automacao" target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-md)', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s' }}>
            <IconGithub size={14} />
            github.com/FelipeSavazii/TCC-Automacao
          </a>
        </div>
      </footer>

      {showModal && <DocenteModal onClose={() => setShowModal(false)} />}
    </div>
  );
}