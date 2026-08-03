'use client';
import React, { useEffect, useState } from 'react';

/* ─── ICONS ─── */
const IconGithub = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);
const IconCheck = ({ size = 13, color = '#10b981' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconZap = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="#ffffff">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

/* ─── FLOATING ORBS ─── */
function FloatingOrbs() {
  return (
    <div className="hero-orbs" aria-hidden="true">
      <div className="orb orb-joy"     style={{ width: '46vw', height: '46vw', top: '-12%',   right: '0%'  }} />
      <div className="orb orb-sadness" style={{ width: '36vw', height: '36vw', top: '25%',    left: '-10%' }} />
      <div className="orb orb-angry"   style={{ width: '28vw', height: '28vw', bottom: '-10%', right: '10%' }} />
      <div className="orb orb-fear"    style={{ width: '22vw', height: '22vw', top: '15%',    left: '35%'  }} />
      <div className="orb orb-disgust" style={{ width: '20vw', height: '20vw', bottom: '20%', left: '5%'   }} />
      <div className="orb orb-envy"    style={{ width: '16vw', height: '16vw', top: '30%',    right: '32%' }} />
    </div>
  );
}

/* ─── DATA ─── */
const softwareStack = [
  { label: 'Front-end web',     tech: 'Next.js 16',        color: '#0070F3', bg: '#E6F0FD' },
  { label: 'Lógica e back-end', tech: 'Python / API REST', color: '#3572A5', bg: '#EAF1F6' },
  { label: 'Firmware',          tech: 'C / C++',           color: '#555555', bg: '#EEEEEE' },
  { label: 'Integração LMS',    tech: 'API Moodle',        color: '#FF7A59', bg: '#FFF2EE' },
  { label: 'Log de presença',   tech: 'CSV automático',    color: '#34A853', bg: '#EAF6EC' },
];
const hardwareStack = [
  { label: 'Processamento',    tech: 'Raspberry Pi',        color: '#C51A4A', bg: '#F9E8EC' },
  { label: 'Conectividade',    tech: 'Wi-Fi Onboard',       color: '#0070F3', bg: '#E6F0FD' },
  { label: 'Entrada',          tech: 'Teclado físico',      color: '#333333', bg: '#EBEBEB' },
  { label: 'Interface visual', tech: 'Display TFT ILI9341', color: '#9B59B6', bg: '#F5EEF8' },
  { label: 'Custo total',      tech: 'R$ 225 – 340',        color: '#2ECC71', bg: '#EAFBF1' },
];
const team = [
  { name: 'Felipe Savazi',  initials: 'FS', role: 'Hardware e firmware',      tags: ['Raspberry Pi','Python','C++'],  grad: 'linear-gradient(135deg,#fbbf24,#f97316)' },
  { name: 'Julia Moreira',  initials: 'JM', role: 'Back-end Python e API',    tags: ['Python','REST','Moodle'],       grad: 'linear-gradient(135deg,#60a5fa,#34d399)' },
  { name: 'Lara Moreira',   initials: 'LM', role: 'Front-end e UI/UX',        tags: ['Next.js','TypeScript','CSS'],   grad: 'linear-gradient(135deg,#d946ef,#f43f5e)' },
  { name: 'Laura Vitoria',  initials: 'LV', role: 'Documentação e validação', tags: ['Pesquisa','CSV','Banca'],       grad: 'linear-gradient(135deg,#34d399,#22d3ee)' },
];

export default function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="page-wrap">

      {/* ════ NAV (Fully Responsive) ════ */}
      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="container">
          <div className="nav-inner">
            <a href="#" className="nav-logo">
              <div className="nav-logo-icon">✨</div>
              <span className="nav-logo-text">
                Life<span className="nav-logo-sub">· Totem HTO</span>
              </span>
            </a>
            <div className="nav-actions">
              <span className="badge-mvp">
                <span className="badge-mvp-dot" />MVP ativo
              </span>
              <button className="btn-nav">Acessar Dashboard</button>
              <a href="https://github.com/FelipeSavazii/TCC-Automacao" target="_blank" rel="noopener noreferrer" className="btn-icon">
                <IconGithub size={18} />
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* ════ HERO ════ */}
      <section className="hero">
        <FloatingOrbs />
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-dot" />
            TCC · Automação Industrial · IFSP
          </div>

          <h1 className="hero-h1">
            Esqueça o celular.{' '}
            <span style={{ color: '#6e6e73' }}>Você não precisa dele.</span>
          </h1>

          <p className="hero-subtitle">
            O <strong>Life</strong> é um totem físico que centraliza tudo que o estudante precisa — sem smartphone, sem infração. O hub definitivo para governança escolar.
          </p>

          <div className="hero-ctas">
            <button className="btn-primary" onClick={() => document.getElementById('solucao')?.scrollIntoView({ behavior: 'smooth' })}>
              <IconZap />
              Ver o projeto
            </button>
            <button className="btn-secondary">
              Acessar Dashboard
              <IconArrow />
            </button>
          </div>

          {/* Apple Bento Spec Grid */}
          <div className="apple-spec-grid">
            {[
              { icon: '💰', val: 'R$ 225–340', sub: 'Custo do hardware', bg: 'rgba(251,191,36,0.12)' },
              { icon: '⚡', val: '< 5 seg',    sub: 'Dados na tela',    bg: 'rgba(59,130,246,0.12)' },
              { icon: '⚖️', val: '100% legal', sub: 'Sem infração',     bg: 'rgba(34,197,94,0.12)'  },
              { icon: '📋', val: 'CSV auto',   sub: 'Log de presença',  bg: 'rgba(168,85,247,0.12)' },
            ].map(s => (
              <div className="apple-spec-card" key={s.val}>
                <div className="apple-spec-icon" style={{ background: s.bg }}>{s.icon}</div>
                <span className="apple-spec-val">{s.val}</span>
                <span className="apple-spec-sub">{s.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ PILARES ════ */}
      <section className="section section-bg-soft section-border-top" id="solucao">
        <div className="container">
          <div className="section-header">
            <p className="section-eyebrow">Arquitetura da solução</p>
            <h2 className="section-title">Três pilares,<br />uma solução.</h2>
            <p className="section-subtitle">Do hardware frugal ao software premium — tudo pensado para o contexto escolar real.</p>
          </div>
          <div className="pillar-grid">
            {[
              { emoji: '📵', title: 'Governança sem telas',  desc: 'Respeita a legislação de restrição de smartphones. Os alunos mantêm acesso a dados acadêmicos sem infringir regras.', decoColor: 'rgba(251,191,36,0.15)' },
              { emoji: '⚡', title: 'Info em 5 segundos',    desc: 'Fim da desinformação sobre provas e avisos. Interface projetada para leitura ultrarrápida nos corredores.',           decoColor: 'rgba(59,130,246,0.12)'  },
              { emoji: '🪪', title: 'Integração frugal',     desc: 'Sem cadastros, sem senha. O aluno usa o teclado para selecionar a sala e ver as informações instantaneamente.',        decoColor: 'rgba(34,197,94,0.12)'   },
            ].map(p => (
              <div className="pillar-card glass-panel" key={p.title}>
                <div className="pillar-card-deco" style={{ background: p.decoColor }} />
                <div className="pillar-card-emoji">{p.emoji}</div>
                <h3 className="pillar-card-title">{p.title}</h3>
                <p className="pillar-card-desc">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ PROBLEMA & PERSONA (Apple Bento Story) ════ */}
      <section className="section section-bg-white section-border-top">
        <div className="container">
          <div className="section-header-center">
            <p className="section-eyebrow">A História Real</p>
            <h2 className="section-title">Um dia de aula. Três fricções.</h2>
            <p className="section-subtitle">Sem o celular no bolso, a busca por informações acadêmicas virou uma corrida contra o tempo nos corredores do IFSP.</p>
          </div>

          <div className="problem-bento">
            {/* Card 1: Persona Quote */}
            <div className="persona-profile-card">
              <span className="persona-badge">RELATO DO ESTUDANTE</span>
              <p className="persona-quote">
                "Cheguei na sala errada porque o mural da entrada estava desatualizado há dias. Sem celular para checar no grupo, perdi chamada e fiquei totalmente perdido."
              </p>
              <div className="persona-user">
                <div className="persona-avatar">F</div>
                <div>
                  <p className="persona-name">Felipe Savazi</p>
                  <p className="persona-role">Técnico em Automação Industrial · IFSP Hortolândia</p>
                </div>
              </div>
            </div>

            {/* Card 2: Pain Metric */}
            <div className="problem-metric-card">
              <div className="problem-metric-bg">3x</div>
              <p className="problem-metric-eyebrow">A Dor em Números</p>
              <p className="problem-metric-val">3x por dia</p>
              <p className="problem-metric-label">Vezes que um aluno precisa confirmar a sala de aula</p>
              <p className="problem-metric-desc">Com a restrição legal de smartphones, estudantes enfrentam murais desatualizados e desinformação frequente.</p>
            </div>

            {/* Card 3: Timeline Horizontal Bento (Apple Spec) */}
            <div className="timeline-card">
              <div className="timeline-title-row">
                <div>
                  <span className="timeline-tag">⚡ A JORNADA DO ESTUDANTE</span>
                  <h3 style={{ fontFamily: 'var(--font-space), sans-serif', fontWeight: 800, fontSize: 22, letterSpacing: '-0.03em', color: '#1d1d1f', marginTop: 4 }}>
                    O contraste entre o caos e a autonomia.
                  </h3>
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#86868b' }}>Da desinformação à velocidade de <strong style={{ color: '#10b981' }}>&lt; 5s</strong></span>
              </div>

              <div className="timeline-progress-bar" />

              <div className="timeline-steps">
                <div className="timeline-step">
                  <div className="timeline-step-header">
                    <span className="timeline-pill amber">🚶 07:45</span>
                    <span style={{ fontSize: 16 }}>📋</span>
                  </div>
                  <p className="timeline-step-title">Mural Impresso</p>
                  <p className="timeline-step-desc">Chega ao campus. O mural impresso de papel na entrada tem o horário da semana passada.</p>
                  <span className="timeline-badge-status">⚠️ Informação Retrógrada</span>
                </div>

                <div className="timeline-step">
                  <div className="timeline-step-header">
                    <span className="timeline-pill blue">👥 07:52</span>
                    <span style={{ fontSize: 16 }}>🏃</span>
                  </div>
                  <p className="timeline-step-title">Busca nos Corredores</p>
                  <p className="timeline-step-desc">Sem celular liberado, precisa andar entre blocos perguntando pessoalmente para colegas.</p>
                  <span className="timeline-badge-status">⌛ Perda de Tempo</span>
                </div>

                <div className="timeline-step">
                  <div className="timeline-step-header">
                    <span className="timeline-pill red">🚫 08:04</span>
                    <span style={{ fontSize: 16 }}>❌</span>
                  </div>
                  <p className="timeline-step-title">Sala Errada & Atraso</p>
                  <p className="timeline-step-desc">Entra no bloco errado. A aula era no laboratório 18. Perde a chamada e o conteúdo.</p>
                  <span className="timeline-badge-status">🚨 Prejuízo Acadêmico</span>
                </div>

                <div className="timeline-step active-life">
                  <div className="timeline-step-header">
                    <span className="timeline-pill emerald">✨ COM O LIFE</span>
                    <span style={{ fontSize: 16 }}>⚡</span>
                  </div>
                  <p className="timeline-step-title">5 Segundos no Totem</p>
                  <p className="timeline-step-desc">Digita a turma no teclado físico. Display TFT mostra a sala exata instantaneamente.</p>
                  <span className="timeline-badge-status">✅ Eficiência Absoluta</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ COMO FUNCIONA ════ */}
      <section className="section section-bg-soft section-border-top">
        <div className="container">
          <div className="section-header-center">
            <p className="section-eyebrow">Como funciona</p>
            <h2 className="section-title">Três passos. Cinco segundos.</h2>
            <p className="section-subtitle">Do teclado do totem ao dado na tela — sem fricção.</p>
          </div>
          
          <div className="apple-steps-grid">
            {[
              { num: 'PASSO 01', icon: '⌨️', title: 'Seleção Rápida',     desc: 'O aluno digita a sala ou turma no teclado físico do totem sem precisar de login.', iconBg: '#fef3c7' },
              { num: 'PASSO 02', icon: '🧠', title: 'Processamento Pi',  desc: 'O Raspberry Pi processa o código localmente e consulta o banco de dados em milissegundos.', iconBg: '#e0f2fe' },
              { num: 'PASSO 03', icon: '🖥️', title: 'Exibição & Presença', desc: 'Display TFT ilumina o cronograma e o Python salva a presença em CSV automaticamente.', iconBg: '#dcfce7' },
            ].map(s => (
              <div className="apple-step-card" key={s.num}>
                <div className="apple-step-top">
                  <span className="apple-step-num">{s.num}</span>
                  <div className="apple-step-icon" style={{ background: s.iconBg }}>{s.icon}</div>
                </div>
                <h3 className="apple-step-title">{s.title}</h3>
                <p className="apple-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ STACK ════ */}
      <section className="section section-bg-white section-border-top">
        <div className="container">
          <div className="section-header">
            <p className="section-eyebrow">Stack tecnológica</p>
            <h2 className="section-title">O motor por dentro.</h2>
            <p className="section-subtitle">Tecnologias escolhidas pela robustez e custo acessível para um projeto de TCC real.</p>
          </div>
          
          <div className="stack-layout">

            {/* Software column */}
            <div className="stack-col">
              <div className="stack-col-header">
                <div className="stack-col-icon" style={{ background: '#eef2ff' }}>💻</div>
                <div>
                  <p className="stack-col-title">Software</p>
                  <p className="stack-col-sub">Stack de desenvolvimento</p>
                </div>
              </div>
              <div className="stack-list">
                {softwareStack.map((item) => (
                  <div className="stack-item" key={item.label}>
                    <span className="stack-item-label">{item.label}</span>
                    <span className="stack-item-badge" style={{ color: item.color, background: item.bg, borderColor: item.color + '30' }}>
                      {item.tech}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hardware column */}
            <div className="stack-col">
              <div className="stack-col-header">
                <div className="stack-col-icon" style={{ background: '#fff1f2' }}>🔧</div>
                <div>
                  <p className="stack-col-title">Hardware</p>
                  <p className="stack-col-sub">Componentes físicos (BOM)</p>
                </div>
              </div>
              <div className="stack-list">
                {hardwareStack.map((item) => (
                  <div className="stack-item" key={item.label}>
                    <span className="stack-item-label">{item.label}</span>
                    <span className="stack-item-badge" style={{ color: item.color, background: item.bg, borderColor: item.color + '30' }}>
                      {item.tech}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA dark */}
            <div className="stack-cta">
              <div className="stack-cta-bg" />
              <div className="stack-cta-inner">
                <p className="stack-cta-eyebrow">Custo total do hardware</p>
                <p className="stack-cta-price">
                  R$ 225<span className="stack-cta-price-sep"> – </span>340
                </p>
                <p className="stack-cta-desc">BOM estimado com componentes modulares e acessíveis, focado em frugalidade.</p>
                <div className="stack-cta-items">
                  {['Tela TFT ILI9341', 'Teclado físico', 'Raspberry Pi'].map(item => (
                    <div className="stack-cta-item" key={item}>
                      <div className="stack-cta-check"><IconCheck size={14} /></div>
                      <span className="stack-cta-item-text">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ════ EQUIPE ════ */}
      <section className="section section-bg-soft section-border-top">
        <div className="container">
          <div className="section-header-center">
            <p className="section-eyebrow">A Equipe</p>
            <h2 className="section-title">Quem faz o Life acontecer.</h2>
            <p className="section-subtitle">Estudantes de Automação Industrial — Turma TCC 2026, IFSP.</p>
          </div>
          <div className="team-grid">
            {team.map((m) => (
              <div className="team-card glass-panel" key={m.name}>
                <div className="team-avatar" style={{ background: m.grad }}>{m.initials}</div>
                <h3 className="team-name">{m.name}</h3>
                <p className="team-role">{m.role}</p>
                <div className="team-tags">
                  {m.tags.map(t => <span className="team-tag" key={t}>{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ FOOTER ════ */}
      <footer className="footer">
        <div className="container">
          <div className="footer-inner">
            <div className="footer-brand">
              <a href="#" className="footer-logo">
                <div className="footer-logo-icon">✨</div>
                <span className="footer-logo-text">Life <span style={{ color: '#a1a1aa', fontWeight: 400, fontSize: 14 }}>· Totem HTO</span></span>
              </a>
              <p className="footer-brand-desc">Redefinindo a governança acadêmica e a comunicação escolar sem a dependência de smartphones.</p>
              <div className="footer-social">
                <a href="https://github.com/FelipeSavazii/TCC-Automacao" target="_blank" rel="noopener noreferrer" className="footer-social-btn">
                  <IconGithub size={18} />
                </a>
              </div>
            </div>
            <div className="footer-links">
              <div className="footer-links-col">
                <h4>Projeto</h4>
                <ul>
                  <li><a href="#solucao">A Solução</a></li>
                  <li><a href="#">Tecnologia</a></li>
                  <li><a href="#">Roadmap</a></li>
                </ul>
              </div>
              <div className="footer-links-col">
                <h4>Acesso</h4>
                <ul>
                  <li><a href="#">Dashboard (Admin)</a></li>
                  <li><a href="https://github.com/FelipeSavazii/TCC-Automacao" target="_blank" rel="noopener noreferrer">Github Repo</a></li>
                  <li><a href="#">Documentação</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Life Totem HTO. Todos os direitos reservados.</span>
            <span>Criado para o IFSP Hortolândia.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}