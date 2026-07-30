'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════════════
   SVG ICONS
   ═══════════════════════════════════════════════════════════════ */
const IconGithub = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);
const IconX = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconCheck = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconZap = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconChevronRight = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const IconCpu = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" />
    <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" />
  </svg>
);
const IconCode = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
  </svg>
);
const IconQr = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="5" height="5" /><rect x="16" y="3" width="5" height="5" />
    <rect x="3" y="16" width="5" height="5" /><path d="M21 16h-3a2 2 0 0 0-2 2v3" />
    <line x1="21" y1="21" x2="21" y2="21" /><line x1="12" y1="7" x2="12" y2="3" />
    <line x1="12" y1="12" x2="12" y2="7" /><line x1="7" y1="12" x2="12" y2="12" />
    <line x1="7" y1="12" x2="3" y2="12" />
  </svg>
);
const IconScan = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <line x1="7" y1="12" x2="17" y2="12" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════════
   TOTEM SIMULATOR DATA
   ═══════════════════════════════════════════════════════════════ */
type Student = {
  id: string;
  name: string;
  prontuario: string;
  course: string;
  scheduleLines: string[];
  alert?: string;
};
const STUDENTS: Student[] = [
  {
    id: 'felipe',
    name: 'Felipe Savazi',
    prontuario: 'HT12345',
    course: 'Automação Industrial',
    scheduleLines: [
      '08:00  Matemática   Lab-02',
      '10:00  Elétrica     Sala-04',
      '13:30  TCC          Oficina-A',
      '15:00  Física Aplic Sala-07',
    ],
    alert: '⚠  Prova: Matemática — 03/08',
  },
  {
    id: 'julia',
    name: 'Julia Moreira',
    prontuario: 'HT12346',
    course: 'Automação Industrial',
    scheduleLines: [
      '08:00  Português    Sala-01',
      '10:00  Back-end Dev Lab-TI',
      '13:30  Integração   Lab-03',
      '15:00  TCC Orient.  Oficina-A',
    ],
    alert: '📋  Entrega Lab: 05/08',
  },
  {
    id: 'lara',
    name: 'Lara Moreira',
    prontuario: 'HT12347',
    course: 'Automação Industrial',
    scheduleLines: [
      '09:00  UI/UX Design Lab-TI',
      '11:00  Next.js Dev  Lab-TI',
      '14:00  TCC Revisão  Sala-12',
      '16:00  Livre        —',
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   TOTEM SIMULATOR COMPONENT
   ═══════════════════════════════════════════════════════════════ */
function TotemSimulator() {
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [csvLog, setCsvLog] = useState<string[]>([]);
  const [screenLines, setScreenLines] = useState<string[]>(['> AGUARDANDO CARTEIRINHA...', '> Aproxime para bipar']);
  const [scanTarget, setScanTarget] = useState<Student | null>(null);

  const doScan = useCallback((student: Student) => {
    if (isScanning) return;
    setIsScanning(true);
    setScanTarget(student);
    setScreenLines(['> LENDO CÓDIGO...', `> GM65 1D ATIVO`]);

    setTimeout(() => {
      const now = new Date();
      const ts = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setActiveStudent(student);
      setScreenLines([
        `> PRONTUÁRIO: ${student.prontuario}`,
        `> ${student.name.split(' ')[0].toUpperCase()}`,
        `> ${student.course.toUpperCase().slice(0, 18)}`,
        '─────────────────',
        ...student.scheduleLines,
        ...(student.alert ? ['─────────────────', student.alert] : []),
      ]);
      setCsvLog(prev => [
        `${ts},${student.prontuario},"${student.name}",Entrada`,
        ...prev.slice(0, 4),
      ]);
      setIsScanning(false);
      setScanTarget(null);
    }, 1600);
  }, [isScanning]);

  const reset = () => {
    setActiveStudent(null);
    setScreenLines(['> AGUARDANDO CARTEIRINHA...', '> Aproxime para bipar']);
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2.5rem', alignItems: 'flex-start', justifyContent: 'center' }}>
      {/* Totem Device */}
      <div className="totem-device">
        <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', marginTop: 14, textTransform: 'uppercase', fontWeight: 700 }}>Totem HTO</div>
        <div className="totem-screen">
          <div className="screen-scanline" />
          <div className="totem-screen-content">
            {screenLines.map((line, i) => (
              <div key={i} style={{
                marginBottom: 3,
                color: i === 0 ? 'var(--cyan)' : i >= 4 ? 'var(--text-hi)' : 'rgba(255,255,255,0.75)',
                fontWeight: i === 0 ? 700 : 400,
                fontSize: line.startsWith('─') ? 8 : 10,
                opacity: i < 2 && activeStudent ? 0.5 : 1,
              }}>
                {line}
              </div>
            ))}
          </div>
        </div>
        <div className="totem-reader">
          <div className="reader-laser" style={{ animationPlayState: isScanning ? 'running' : 'paused', opacity: isScanning ? 1 : 0.3 }} />
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', fontWeight: 700, zIndex: 1 }}>GM65 1D</span>
        </div>
        <div className="totem-led" />
        <div className="totem-label">ONLINE · ESP32</div>
        <div style={{ flex: 1 }} />
      </div>

      {/* Controls + Log */}
      <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Student buttons */}
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-lo)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Bipar Carteirinha</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {STUDENTS.map(s => (
              <button
                key={s.id}
                id={`btn-scan-${s.id}`}
                onClick={() => doScan(s)}
                disabled={isScanning}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  background: activeStudent?.id === s.id ? 'rgba(29,185,84,0.1)' : 'var(--bg-3)',
                  border: `1px solid ${activeStudent?.id === s.id ? 'rgba(29,185,84,0.4)' : 'var(--border)'}`,
                  borderRadius: 12, color: 'var(--text-hi)', cursor: isScanning ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: '0.88rem', fontWeight: 600,
                  transition: 'all 0.2s', opacity: isScanning && scanTarget?.id !== s.id ? 0.5 : 1,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <IconScan size={16} color={activeStudent?.id === s.id ? 'var(--green)' : 'var(--text-lo)'} />
                  <span>{s.name}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-lo)' }}>{s.prontuario}</span>
                </span>
                {isScanning && scanTarget?.id === s.id ? (
                  <span style={{ fontSize: '0.7rem', color: 'var(--cyan)', fontWeight: 700, letterSpacing: '0.08em' }}>BIPANDO…</span>
                ) : activeStudent?.id === s.id ? (
                  <span style={{ color: 'var(--green)' }}><IconCheck size={14} /></span>
                ) : (
                  <IconChevronRight size={12} color="var(--text-lo)" />
                )}
              </button>
            ))}
          </div>
          {activeStudent && (
            <button onClick={reset} style={{ marginTop: '0.6rem', background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-lo)', fontSize: '0.75rem', padding: '0.4rem 0.8rem', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              ↺ Resetar
            </button>
          )}
        </div>

        {/* CSV Log */}
        <div style={{ background: 'var(--bg-0)', border: '1px solid var(--border)', borderRadius: 14, padding: '1rem', fontFamily: "'Space Grotesk', monospace", fontSize: '0.72rem' }}>
          <div style={{ color: 'var(--text-lo)', marginBottom: '0.5rem', letterSpacing: '0.1em', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem' }}>
            📋 presenca.csv — auto-log
          </div>
          <div style={{ color: 'var(--text-lo)', marginBottom: '0.35rem' }}>timestamp,prontuario,nome,evento</div>
          {csvLog.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.18)', fontStyle: 'italic' }}>aguardando leitura...</div>
          ) : (
            csvLog.map((row, i) => (
              <div key={i} style={{ color: i === 0 ? 'var(--green)' : 'var(--text-lo)', marginBottom: 2, transition: 'color 0.3s' }}>
                {row}
              </div>
            ))
          )}
        </div>

        {/* Status badge */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="badge badge-green"><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse-glow 1.8s infinite' }} /> ONLINE</span>
          <span className="badge badge-cyan">Wi-Fi · ESP32</span>
          <span className="badge badge-violet">GM65 1D · UART</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DOCENTE MODAL
   ═══════════════════════════════════════════════════════════════ */
function DocenteModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<'aviso' | 'export'>('aviso');
  const [form, setForm] = useState({ disciplina: '', data: '', descricao: '' });
  const [sent, setSent] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };
  const handleExport = () => {
    setExporting(true);
    setTimeout(() => { setExporting(false); setExported(true); }, 1800);
  };

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--violet-hi)', marginBottom: '0.2rem' }}>Portal Docente</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-hi)' }}>Administração do Totem</h2>
          </div>
          <button onClick={onClose} id="modal-close" style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.4rem', cursor: 'pointer', color: 'var(--text-md)' }}>
            <IconX size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="tab-nav" style={{ marginBottom: '1.5rem' }}>
          <button className={`tab-btn ${tab === 'aviso' ? 'active' : ''}`} onClick={() => setTab('aviso')}>📢 Aviso de Prova</button>
          <button className={`tab-btn ${tab === 'export' ? 'active' : ''}`} onClick={() => setTab('export')}>📥 Exportar Presença</button>
        </div>

        {tab === 'aviso' && (
          !sent ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-md)', display: 'block', marginBottom: '0.4rem' }}>Disciplina</label>
                <input id="modal-disciplina" className="modal-input" required placeholder="Ex: Matemática Aplicada" value={form.disciplina} onChange={e => setForm(f => ({ ...f, disciplina: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-md)', display: 'block', marginBottom: '0.4rem' }}>Data da Prova</label>
                <input id="modal-data" className="modal-input" required type="date" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-md)', display: 'block', marginBottom: '0.4rem' }}>Descrição / Conteúdo</label>
                <textarea id="modal-descricao" className="modal-input" rows={3} placeholder="Ex: Capítulos 3 a 7, derivadas..." value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} style={{ resize: 'vertical' }} />
              </div>
              <button id="modal-submit" type="submit" className="btn btn-primary" style={{ marginTop: '0.25rem' }}>
                <IconZap size={14} color="#000" /> Publicar no Totem
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(29,185,84,0.15)', border: '1.5px solid rgba(29,185,84,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <IconCheck size={24} color="var(--green)" />
              </div>
              <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-hi)', marginBottom: '0.35rem' }}>Aviso publicado!</p>
              <p style={{ color: 'var(--text-md)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>Os alunos verão o alerta ao bipar a carteirinha.</p>
              <button className="btn btn-secondary" style={{ fontSize: '0.82rem' }} onClick={() => setSent(false)}>Publicar outro aviso</button>
            </div>
          )
        )}

        {tab === 'export' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ color: 'var(--text-md)', fontSize: '0.88rem', lineHeight: 1.65 }}>
              Exporte o relatório de presença de qualquer período. O arquivo <strong style={{ color: 'var(--text-hi)' }}>CSV</strong> é gerado automaticamente pelo Back-end Python a cada leitura de carteirinha.
            </p>
            <div style={{ background: 'var(--bg-0)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem', fontFamily: "'Space Grotesk', monospace", fontSize: '0.72rem', color: 'var(--text-lo)' }}>
              <div style={{ color: 'var(--cyan)', marginBottom: 4 }}>timestamp,prontuario,nome,evento</div>
              <div>16:22:01,HT12345,&quot;Felipe Savazi&quot;,Entrada</div>
              <div>16:24:15,HT12346,&quot;Julia Moreira&quot;,Entrada</div>
              <div>16:30:42,HT12347,&quot;Lara Moreira&quot;,Entrada</div>
            </div>
            {!exported ? (
              <button id="modal-export" className="btn btn-violet" onClick={handleExport} disabled={exporting} style={{ fontSize: '0.88rem' }}>
                {exporting ? '⏳ Gerando CSV...' : '⬇  Exportar presenca.csv'}
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1rem', background: 'rgba(29,185,84,0.08)', border: '1px solid rgba(29,185,84,0.3)', borderRadius: 12 }}>
                <IconCheck size={16} color="var(--green)" />
                <span style={{ color: 'var(--green)', fontWeight: 600, fontSize: '0.88rem' }}>presenca_2026-07-30.csv baixado!</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [stackTab, setStackTab] = useState<'software' | 'hardware'>('software');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Prevent body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = showModal ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showModal]);

  /* ── Ambient card mouse tracking ── */
  const handleCardMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty('--mx', `${x}%`);
    el.style.setProperty('--my', `${y}%`);
  }, []);

  /* ── Intersection Observer for fade-up ── */
  const fadeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('anim-fade-up'); }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('[data-fade]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const softwareStack = [
    { label: 'Front-end Web', tech: 'Next.js 16', color: 'var(--cyan)', accent: 'rgba(6,182,212,0.12)' },
    { label: 'Lógica & Back-end', tech: 'Python / API REST', color: 'var(--green)', accent: 'rgba(29,185,84,0.1)' },
    { label: 'Firmware', tech: 'C / C++', color: 'var(--violet-hi)', accent: 'rgba(124,58,237,0.1)' },
    { label: 'Integração LMS', tech: 'API Moodle', color: 'var(--amber)', accent: 'rgba(245,158,11,0.1)' },
    { label: 'Log de Presença', tech: 'CSV Automático', color: 'var(--pink)', accent: 'rgba(236,72,153,0.1)' },
  ];
  const hardwareStack = [
    { label: 'Processamento Central', tech: 'Raspberry Pi', color: 'var(--pink)', accent: 'rgba(236,72,153,0.1)' },
    { label: 'Conectividade Wi-Fi', tech: 'ESP32', color: 'var(--amber)', accent: 'rgba(245,158,11,0.1)' },
    { label: 'Leitura Óptica 1D', tech: 'Módulo GM65', color: 'var(--cyan)', accent: 'rgba(6,182,212,0.1)' },
    { label: 'Interface Visual', tech: 'Display TFT ILI9341', color: 'var(--violet-hi)', accent: 'rgba(124,58,237,0.1)' },
    { label: 'Custo Total', tech: 'R$ 225 – R$ 340', color: 'var(--green)', accent: 'rgba(29,185,84,0.1)' },
  ];

  const phases = [
    { phase: '01', status: 'active', title: 'MVP Local', desc: 'Raspberry Pi + Next.js + dados mockados. Landing page e validação de viabilidade.', emoji: '🚀', color: 'var(--green)' },
    { phase: '02', status: 'upcoming', title: 'Integração', desc: 'Banco de dados, Back-end Python e integração com o Leitor 1D e ESP32.', emoji: '🔌', color: 'var(--cyan)' },
    { phase: '03', status: 'upcoming', title: 'Validação de Campo', desc: 'Testes práticos no campus com alunos reais e geração automática de CSVs.', emoji: '🧪', color: 'var(--violet-hi)' },
    { phase: '04', status: 'upcoming', title: 'Defesa TCC', desc: 'Modelagem 3D do totem, documentação final e apresentação à banca.', emoji: '🎓', color: 'var(--amber)' },
  ];

  const team = [
    { name: 'Felipe Savazi', initials: 'FS', role: 'Hardware & Firmware', tags: ['ESP32', 'GM65', 'C++'], gradient: 'linear-gradient(135deg,#06b6d4,#6366f1)' },
    { name: 'Julia Moreira', initials: 'JM', role: 'Back-end Python & API', tags: ['Python', 'REST', 'Moodle'], gradient: 'linear-gradient(135deg,#1db954,#06b6d4)' },
    { name: 'Lara Moreira', initials: 'LM', role: 'Front-end & UI/UX', tags: ['Next.js', 'TypeScript', 'CSS'], gradient: 'linear-gradient(135deg,#a78bfa,#ec4899)' },
    { name: 'Laura Vitoria', initials: 'LV', role: 'Documentação & Validação', tags: ['Pesquisa', 'CSV', 'Banca'], gradient: 'linear-gradient(135deg,#f59e0b,#ec4899)' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-1)', color: 'var(--text-hi)' }} ref={fadeRef}>

      {/* ══════════════════════════════ AMBIENT ══════════════════════════════ */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
        <div className="ambient-orb orb-green" style={{ width: 600, height: 600, top: '-200px', left: '-100px' }} />
        <div className="ambient-orb orb-violet" style={{ width: 500, height: 500, top: '40%', right: '-150px' }} />
        <div className="ambient-orb orb-amber" style={{ width: 400, height: 400, bottom: '10%', left: '20%' }} />
        <div className="ambient-orb orb-cyan" style={{ width: 350, height: 350, top: '25%', left: '40%' }} />
      </div>

      {/* ══════════════════════════════ NAV ══════════════════════════════ */}
      <nav className={`nav-bar ${scrolled ? 'scrolled' : ''}`} style={{ position: 'sticky', top: 0, zIndex: 100, transition: 'all 0.35s' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 1.5rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', textDecoration: 'none' }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, var(--green), var(--cyan))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', boxShadow: '0 0 16px var(--green-glow)',
            }}>
              <IconScan size={16} color="#000" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-hi)', letterSpacing: '-0.03em' }}>
              Life <span style={{ color: 'var(--text-lo)', fontWeight: 400, fontSize: '0.8rem' }}>· Totem HTO</span>
            </span>
          </a>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="badge badge-green" style={{ display: 'none' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
              MVP Ativo
            </span>
            <button id="nav-docente" onClick={() => setShowModal(true)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}>
              Portal Docente
            </button>
            <a href="https://github.com/FelipeSavazii/TCC-Automacao" target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-md)', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', padding: '0.5rem 0.75rem', borderRadius: 10, border: '1px solid var(--border)', transition: 'border-color 0.2s' }}>
              <IconGithub size={15} color="currentColor" />
            </a>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════ HERO ══════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1120, margin: '0 auto', padding: '7rem 1.5rem 6rem' }}>
        <div style={{ maxWidth: 760 }}>
          {/* Eyebrow */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
            <span className="badge badge-green"><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse-glow 1.8s infinite' }} /> Fase 01 · MVP em Desenvolvimento</span>
            <span className="badge badge-cyan">TCC · Automação Industrial · IFSP</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, lineHeight: 1.08, fontSize: 'clamp(2.8rem, 6.5vw, 5.5rem)', letterSpacing: '-0.04em', marginBottom: '1.5rem' }}>
            Esqueça o celular.<br />
            <span className="text-gradient-green">Você não precisa dele.</span>
          </h1>

          <p style={{ fontSize: '1.15rem', color: 'var(--text-md)', lineHeight: 1.75, maxWidth: 600, marginBottom: '2.5rem' }}>
            O <strong style={{ color: 'var(--text-hi)' }}>Life</strong> é um totem físico que centraliza tudo que o estudante precisa — sem smartphone, sem infração. Presença automatizada e cronograma em tempo real via leitura óptica da <em>carteirinha estudantil</em>.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '3.5rem' }}>
            <button id="hero-cta-simulator" className="btn btn-primary" onClick={() => document.getElementById('simulator')?.scrollIntoView({ behavior: 'smooth' })}>
              <IconZap size={14} color="#000" /> Testar Simulador
            </button>
            <button id="hero-cta-docente" className="btn btn-secondary" onClick={() => setShowModal(true)}>
              Portal Docente
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {[
              { icon: '💰', label: 'R$ 225–340', sub: 'Custo total estimado' },
              { icon: '⚡', label: '< 5 segundos', sub: 'Dados na tela' },
              { icon: '⚖️', label: '100% legal', sub: 'Respeita a legislação' },
              { icon: '📋', label: 'CSV automático', sub: 'Log de presença' },
            ].map(s => (
              <div key={s.label} className="stat-pill">
                <span style={{ fontSize: '1.1rem' }}>{s.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-hi)' }}>{s.label}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-lo)' }}>{s.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" style={{ maxWidth: 1120, margin: '0 auto' }} />

      {/* ══════════════════════════════ SIMULATOR ══════════════════════════════ */}
      <section id="simulator" style={{ position: 'relative', zIndex: 1, maxWidth: 1120, margin: '0 auto', padding: '5rem 1.5rem' }}>
        <div data-fade style={{ opacity: 0 }}>
          <div className="section-eyebrow">
            <IconQr size={14} color="var(--cyan)" />
            <span style={{ color: 'var(--cyan)' }}>Simulador Interativo</span>
          </div>
          <h2 className="section-title">Toque e experimente o Totem.</h2>
          <p className="section-sub">Simule a bipagem de uma carteirinha estudantil e veja o Totem HTO em ação — exibição do cronograma e log de presença em tempo real.</p>
        </div>

        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border-md)', borderRadius: 'var(--r-xl)', padding: '2.5rem' }}>
          <TotemSimulator />
        </div>
      </section>

      <div className="divider" style={{ maxWidth: 1120, margin: '0 auto' }} />

      {/* ══════════════════════════════ ARQUITETURA ══════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1120, margin: '0 auto', padding: '5rem 1.5rem' }}>
        <div data-fade style={{ opacity: 0 }}>
          <div className="section-eyebrow">🏗️ <span>Arquitetura da Solução</span></div>
          <h2 className="section-title">Três pilares, uma solução.</h2>
          <p className="section-sub">O Life resolve os três maiores gargalos criados pelo banimento do celular nas escolas.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {[
            { icon: '🚫📱', title: 'Governança sem Telas', desc: 'Respeita a legislação de restrição de smartphones. Os alunos mantêm acesso a dados acadêmicos sem infringir as regras escolares.', accent: 'var(--green)', glow: 'var(--green-glow)' },
            { icon: '⚡', title: 'Informação em 5 Segundos', desc: 'Fim da desinformação sobre datas de provas e avisos. Interface projetada para leitura ultrarrápida nos corredores movimentados.', accent: 'var(--cyan)', glow: 'var(--cyan-glow)' },
            { icon: '🪪', title: 'Integração Frugal', desc: 'Nenhum crachá novo necessário. O sistema usa o código de barras já existente na carteirinha padrão como chave de acesso única.', accent: 'var(--violet-hi)', glow: 'var(--violet-glow)' },
          ].map(c => (
            <div key={c.title} className="card" onMouseMove={handleCardMove} style={{ borderTop: `2px solid ${c.accent}` }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '1.25rem' }}>{c.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.6rem', color: 'var(--text-hi)' }}>{c.title}</h3>
              <p style={{ color: 'var(--text-md)', fontSize: '0.88rem', lineHeight: 1.7 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" style={{ maxWidth: 1120, margin: '0 auto' }} />

      {/* ══════════════════════════════ PERSONA ══════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1120, margin: '0 auto', padding: '5rem 1.5rem' }}>
        <div data-fade style={{ opacity: 0 }}>
          <div className="section-eyebrow">👤 <span>A Persona</span></div>
          <h2 className="section-title">Por que isso importa?</h2>
          <p className="section-sub">Desenvolvido com base em uma persona real: Felipe, estudante técnico de 16 anos do IFSP.</p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'stretch' }}>
          {/* Character card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(29,185,84,0.15), rgba(6,182,212,0.1))',
            border: '1px solid rgba(29,185,84,0.25)',
            borderRadius: 'var(--r-xl)', padding: '2rem', color: 'var(--text-hi)',
            minWidth: 220, flex: '0 0 220px', textAlign: 'center',
          }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 1rem', background: 'rgba(29,185,84,0.12)', border: '2px solid rgba(29,185,84,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem' }}>🎒</div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.2rem' }}>Felipe</p>
            <p style={{ color: 'var(--text-md)', fontSize: '0.85rem', marginBottom: '1rem' }}>Estudante Técnico · 16 anos</p>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {['Automação', 'TCC', 'IFSP', 'Sem celular'].map(t => (
                <span key={t} className="badge badge-green" style={{ fontSize: '0.62rem' }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Pain / Need / Solution */}
          <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { emoji: '😟', label: 'A Dor Diária', color: 'var(--pink)', border: 'rgba(236,72,153,0.25)', bg: 'rgba(236,72,153,0.05)', text: 'Felipe depende de informações descentralizadas e murais estáticos para gerenciar provas e ensalamento. Sem o celular, navega às cegas.' },
              { emoji: '💡', label: 'A Necessidade', color: 'var(--amber)', border: 'rgba(245,158,11,0.25)', bg: 'rgba(245,158,11,0.05)', text: 'Acesso a informações táticas, personalizadas e em tempo real de forma que respeite integralmente a legislação vigente da escola.' },
              { emoji: '✅', label: 'A Solução — Life', color: 'var(--green)', border: 'rgba(29,185,84,0.35)', bg: 'rgba(29,185,84,0.06)', text: 'Bipa a carteirinha no Totem HTO e em menos de 5 segundos vê alertas de prova, cronograma do dia e mudanças de sala — sem smartphone.' },
            ].map(item => (
              <div key={item.label} style={{ background: item.bg, border: `1px solid ${item.border}`, borderRadius: 'var(--r-md)', padding: '1.25rem', flex: 1 }}>
                <p style={{ fontWeight: 700, color: item.color, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem' }}>
                  <span>{item.emoji}</span> {item.label}
                </p>
                <p style={{ color: 'var(--text-md)', fontSize: '0.88rem', lineHeight: 1.65 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" style={{ maxWidth: 1120, margin: '0 auto' }} />

      {/* ══════════════════════════════ COMO FUNCIONA ══════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1120, margin: '0 auto', padding: '5rem 1.5rem' }}>
        <div data-fade style={{ opacity: 0 }}>
          <div className="section-eyebrow">⚙️ <span>Como Funciona</span></div>
          <h2 className="section-title">Três passos. Cinco segundos.</h2>
          <p className="section-sub">Do &quot;bip&quot; da carteirinha ao dado na tela — simples assim.</p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginBottom: '2rem' }}>
          {[
            { emoji: '🪪', label: 'Entrada', desc: 'Aluno aproxima a carteirinha do leitor óptico GM65 (UART)', color: 'rgba(6,182,212,0.12)' },
            { emoji: '📡', label: 'Sincronização', desc: 'ESP32 envia o prontuário ao Back-end Python via Wi-Fi/HTTP', color: 'rgba(124,58,237,0.12)' },
            { emoji: '🖥️', label: 'Exibição & Log', desc: 'Display TFT mostra cronograma. Back-end registra presença em CSV', color: 'rgba(29,185,84,0.12)', noArrow: true },
          ].map((step, i) => (
            <React.Fragment key={step.label}>
              <div className="flow-step" style={{ background: step.color, borderColor: step.color.replace('0.12', '0.35') }}>
                <div className="flow-icon" style={{ background: 'rgba(0,0,0,0.3)' }}>{step.emoji}</div>
                <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-hi)' }}>{step.label}</span>
                <span style={{ color: 'var(--text-md)', fontSize: '0.75rem', lineHeight: 1.5 }}>{step.desc}</span>
              </div>
              {!step.noArrow && <div className="flow-arrow">→</div>}
            </React.Fragment>
          ))}
        </div>

        {/* 4 layers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.75rem' }}>
          {[
            { emoji: '📥', title: 'Entrada', desc: 'Carteirinha + GM65 1D', color: 'var(--cyan)' },
            { emoji: '🧠', title: 'Processamento', desc: 'Raspberry Pi + ESP32', color: 'var(--pink)' },
            { emoji: '☁️', title: 'Dados', desc: 'Back-end Python + CSV', color: 'var(--violet-hi)' },
            { emoji: '📺', title: 'Exibição', desc: 'TFT ILI9341 + Next.js', color: 'var(--green)' },
          ].map(l => (
            <div key={l.title} className="card" onMouseMove={handleCardMove} style={{ padding: '1.25rem', borderTop: `2px solid ${l.color}` }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{l.emoji}</div>
              <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.2rem', color: 'var(--text-hi)' }}>{l.title}</p>
              <p style={{ color: 'var(--text-md)', fontSize: '0.78rem' }}>{l.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" style={{ maxWidth: 1120, margin: '0 auto' }} />

      {/* ══════════════════════════════ STACK ══════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1120, margin: '0 auto', padding: '5rem 1.5rem' }}>
        <div data-fade style={{ opacity: 0 }}>
          <div className="section-eyebrow"><IconCode size={14} color="var(--violet-hi)" /> <span style={{ color: 'var(--violet-hi)' }}>Stack Tecnológica</span></div>
          <h2 className="section-title">O motor por dentro.</h2>
          <p className="section-sub">Tecnologias escolhidas pela robustez e pelo custo acessível.</p>
        </div>

        <div className="tab-nav" style={{ marginBottom: '1.75rem', maxWidth: 380 }}>
          <button id="tab-software" className={`tab-btn ${stackTab === 'software' ? 'active' : ''}`} onClick={() => setStackTab('software')}><IconCode size={13} color="currentColor" /> Software</button>
          <button id="tab-hardware" className={`tab-btn ${stackTab === 'hardware' ? 'active' : ''}`} onClick={() => setStackTab('hardware')}><IconCpu size={13} color="currentColor" /> Hardware</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
          {(stackTab === 'software' ? softwareStack : hardwareStack).map(item => (
            <div key={item.label} className="card" onMouseMove={handleCardMove} style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-hi)', fontSize: '0.88rem' }}>{item.label}</span>
              <span className="tech-chip" style={{ color: item.color, borderColor: item.color.replace(')', ',0.35)').replace('var(', 'rgba(').replace(')', ''), background: item.accent, flexShrink: 0, whiteSpace: 'nowrap' }}>
                {item.tech}
              </span>
            </div>
          ))}
        </div>

        {/* Cost banner */}
        <div style={{ marginTop: '1.25rem', background: 'linear-gradient(135deg, rgba(29,185,84,0.08), rgba(6,182,212,0.08))', border: '1px solid rgba(29,185,84,0.3)', borderRadius: 'var(--r-lg)', padding: '1.75rem 2rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: '0.3rem' }}>Custo Total do Hardware</p>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem', color: 'var(--text-hi)' }}>R$ 225 – R$ 340</p>
            <p style={{ color: 'var(--text-md)', fontSize: '0.85rem' }}>BOM estimado com componentes modulares</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {['Tela TFT ILI9341 (obrigatória)', 'Leitor Óptico GM65 (obrigatório)', 'Raspberry Pi + ESP32 (modular)'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconCheck size={10} color="#000" />
                </div>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-md)' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" style={{ maxWidth: 1120, margin: '0 auto' }} />

      {/* ══════════════════════════════ ROADMAP ══════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1120, margin: '0 auto', padding: '5rem 1.5rem' }}>
        <div data-fade style={{ opacity: 0 }}>
          <div className="section-eyebrow">🗺️ <span>Roadmap</span></div>
          <h2 className="section-title">Cronograma de Execução.</h2>
          <p className="section-sub">Quatro fases do MVP até a defesa do TCC 2026.</p>
        </div>

        {/* Progress bar */}
        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 999, height: 6, marginBottom: '2rem', overflow: 'hidden' }}>
          <div style={{ width: '25%', height: '100%', background: 'linear-gradient(90deg, var(--green), var(--cyan))', borderRadius: 999, boxShadow: '0 0 12px var(--green-glow)' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {phases.map(f => (
            <div key={f.phase} className={`phase-card ${f.status === 'active' ? 'active' : ''}`} onMouseMove={handleCardMove}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{f.emoji}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', color: f.status === 'active' ? f.color : 'var(--text-lo)', textTransform: 'uppercase' }}>FASE {f.phase}</span>
                {f.status === 'active' && (
                  <span style={{ fontSize: '0.6rem', background: 'var(--green)', color: '#000', borderRadius: 999, padding: '0.1rem 0.5rem', fontWeight: 800, letterSpacing: '0.05em' }}>ATUAL</span>
                )}
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem', color: f.status === 'active' ? 'var(--text-hi)' : 'var(--text-md)' }}>{f.title}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-lo)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" style={{ maxWidth: 1120, margin: '0 auto' }} />

      {/* ══════════════════════════════ EQUIPE ══════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1120, margin: '0 auto', padding: '5rem 1.5rem 6rem' }}>
        <div data-fade style={{ opacity: 0 }}>
          <div className="section-eyebrow">👥 <span>A Equipe</span></div>
          <h2 className="section-title">Quem faz o Life acontecer.</h2>
          <p className="section-sub">Estudantes de Automação Industrial — Turma TCC 2026, IFSP Hortolândia.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {team.map(m => (
            <div key={m.name} className="card" onMouseMove={handleCardMove} style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div className="team-avatar" style={{ background: m.gradient, color: '#fff', marginBottom: '1rem' }}>{m.initials}</div>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-hi)', marginBottom: '0.25rem' }}>{m.name}</p>
              <p style={{ color: 'var(--text-md)', fontSize: '0.8rem', marginBottom: '1rem' }}>{m.role}</p>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {m.tags.map(tag => (
                  <span key={tag} style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.18rem 0.55rem', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 999, color: 'var(--text-md)' }}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════ FOOTER ══════════════════════════════ */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid var(--border)', background: 'var(--bg-0)', padding: '2.5rem 1.5rem' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, var(--green), var(--cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconScan size={13} color="#000" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-hi)', fontSize: '0.95rem' }}>Life · Totem HTO</span>
          </div>
          <p style={{ color: 'var(--text-lo)', fontSize: '0.8rem' }}>
            TCC · Automação Industrial · IFSP Hortolândia · {new Date().getFullYear()} ©{' '}
            <span style={{ color: 'var(--text-md)' }}>Felipe Savazi · Julia Moreira · Lara Moreira · Laura Vitoria</span>
          </p>
          <a href="https://github.com/FelipeSavazii/TCC-Automacao" target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-md)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s' }}>
            <IconGithub size={15} />
            github.com/FelipeSavazii/TCC-Automacao
          </a>
        </div>
      </footer>

      {/* ══════════════════════════════ MODAL ══════════════════════════════ */}
      {showModal && <DocenteModal onClose={() => setShowModal(false)} />}
    </div>
  );
}