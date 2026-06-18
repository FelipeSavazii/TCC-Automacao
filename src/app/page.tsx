import React from 'react';

// --- Ícones SVG Minimalistas para a Interface ---
const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400 mb-4">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
    <line x1="2" y1="2" x2="22" y2="22"></line>
  </svg>
);

const ZapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400 mb-4">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);

const ScanBarcodeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400 mb-4">
    <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
    <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
    <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
    <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
    <path d="M8 7v10"></path>
    <path d="M12 7v10"></path>
    <path d="M16 7v10"></path>
  </svg>
);

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      
      {/* HEADER */}
      <header className="border-b border-white/5 bg-zinc-950/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-bold tracking-tighter flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span>
              <span className="text-blue-500">#</span> TOTEM_HTO
            </span>
          </div>
          <a 
            href="#" 
            className="text-sm font-mono text-zinc-400 hover:text-blue-400 transition-colors flex items-center gap-2"
          >
            <span className="hidden sm:inline">[ Repositório GitHub ]</span>
            <span className="sm:hidden">[ GitHub ]</span>
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6">
        
        {/* DOBRA 1: HERO SECTION */}
        <section className="py-24 md:py-32 flex flex-col items-start border-b border-white/5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-mono tracking-widest rounded-full uppercase shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
            Sistema de Governança Estudantil
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-[1.1] mb-6">
            Esqueça o celular.<br />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              Você não precisa dele.
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl leading-relaxed mb-10">
            O totem físico com todos os dados que você precisa para substituir o smartphone na escola. Presença automatizada e cronogramas em tempo real via leitura óptica da carteirinha.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button className="bg-blue-600 text-white font-bold px-8 py-4 rounded-lg hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all duration-300 transform hover:-translate-y-0.5 w-full sm:w-auto">
              Ver Especificações
            </button>
            <button className="border border-zinc-700 bg-zinc-900/50 text-zinc-100 font-medium px-8 py-4 rounded-lg hover:bg-zinc-800 hover:border-zinc-600 transition-all duration-300 w-full sm:w-auto">
              Acesso Docente
            </button>
          </div>
        </section>

        {/* DOBRA 2: TRÍADE DE VALOR */}
        <section className="py-20 md:py-24 border-b border-white/5">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Arquitetura da Solução</h2>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-zinc-800 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="group p-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <EyeOffIcon />
              <h3 className="text-lg font-bold mb-3 text-zinc-100 group-hover:text-blue-400 transition-colors">Governança sem Telas</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Respeito total à legislação de restrição de smartphones. Acesso a dados acadêmicos vitais mantendo o foco absoluto no ambiente físico escolar.
              </p>
            </div>
            {/* Card 2 */}
            <div className="group p-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <ZapIcon />
              <h3 className="text-lg font-bold mb-3 text-zinc-100 group-hover:text-blue-400 transition-colors">Informação em 5s</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Fim da desinformação sobre datas de provas e avisos. Interface minimalista projetada para leitura rápida em corredores movimentados.
              </p>
            </div>
            {/* Card 3 */}
            <div className="group p-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <ScanBarcodeIcon />
              <h3 className="text-lg font-bold mb-3 text-zinc-100 group-hover:text-blue-400 transition-colors">Integração Frugal</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Nenhum crachá novo necessário. O sistema utiliza o código de barras 1D já existente na carteirinha estudantil padrão como chave de acesso.
              </p>
            </div>
          </div>
        </section>

        {/* DOBRA 3: O MOTOR (STACK) */}
        <section className="py-20 md:py-24 border-b border-white/5">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Stack Tecnológica</h2>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-zinc-800 to-transparent"></div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Software Box */}
            <div className="flex-1 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                </div>
                <h4 className="font-mono text-zinc-300 tracking-wider">SOFTWARE</h4>
              </div>
              <ul className="space-y-5">
                <li className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="font-medium text-zinc-200">Front-end Web</span> 
                  <span className="text-blue-400 font-mono text-sm bg-blue-500/10 px-2 py-1 rounded">Next.js + Tailwind</span>
                </li>
                <li className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="font-medium text-zinc-200">Lógica e Back-end</span> 
                  <span className="text-blue-400 font-mono text-sm bg-blue-500/10 px-2 py-1 rounded">Python / API REST</span>
                </li>
                <li className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="font-medium text-zinc-200">Firmware</span> 
                  <span className="text-blue-400 font-mono text-sm bg-blue-500/10 px-2 py-1 rounded">C/C++</span>
                </li>
              </ul>
            </div>

            {/* Hardware Box */}
            <div className="flex-1 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
                </div>
                <h4 className="font-mono text-zinc-300 tracking-wider">HARDWARE</h4>
              </div>
              <ul className="space-y-5">
                <li className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="font-medium text-zinc-200">Processamento</span> 
                  <span className="text-indigo-400 font-mono text-sm bg-indigo-500/10 px-2 py-1 rounded">ESP32 (Wi-Fi)</span>
                </li>
                <li className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="font-medium text-zinc-200">Captura de Dados</span> 
                  <span className="text-indigo-400 font-mono text-sm bg-indigo-500/10 px-2 py-1 rounded">Leitor Óptico 1D</span>
                </li>
                <li className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="font-medium text-zinc-200">Interface Visual</span> 
                  <span className="text-indigo-400 font-mono text-sm bg-indigo-500/10 px-2 py-1 rounded">Display TFT SPI</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* DOBRA 4: ROADMAP */}
        <section className="py-20 md:py-24">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Cronograma de Execução</h2>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 font-mono text-sm relative">
            {/* Linha conectora invisível no mobile, visível no desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-zinc-800 -z-10 -translate-y-1/2"></div>

            {/* Fases */}
            <div className="p-5 border-l-2 md:border-l-0 md:border-t-2 border-blue-500 bg-blue-500/5 md:bg-zinc-900/60 w-full rounded-r-lg md:rounded-b-lg md:rounded-tr-none shadow-[inset_0_0_20px_rgba(59,130,246,0.05)] backdrop-blur-sm">
              <span className="text-blue-400 font-bold block mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                FASE 01
              </span>
              <span className="text-zinc-200">Validação de Viabilidade e Landing Page</span>
            </div>

            <div className="p-5 border-l-2 md:border-l-0 md:border-t-2 border-zinc-800 bg-zinc-900/30 w-full rounded-r-lg md:rounded-b-lg md:rounded-tr-none">
              <span className="text-zinc-500 font-bold block mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-zinc-700"></span>
                FASE 02
              </span>
              <span className="text-zinc-400">Integração Leitor 1D + ESP32</span>
            </div>

            <div className="p-5 border-l-2 md:border-l-0 md:border-t-2 border-zinc-800 bg-zinc-900/30 w-full rounded-r-lg md:rounded-b-lg md:rounded-tr-none">
              <span className="text-zinc-500 font-bold block mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-zinc-700"></span>
                FASE 03
              </span>
              <span className="text-zinc-400">Back-end e Geração de CSV</span>
            </div>

            <div className="p-5 border-l-2 md:border-l-0 md:border-t-2 border-zinc-800 bg-zinc-900/30 w-full rounded-r-lg md:rounded-b-lg md:rounded-tr-none">
              <span className="text-zinc-500 font-bold block mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-zinc-700"></span>
                FASE 04
              </span>
              <span className="text-zinc-400">Modelagem 3D e Defesa TCC</span>
            </div>
          </div>
        </section>

      </main>
      
      <footer className="border-t border-white/5 bg-zinc-950/50 py-10 text-center text-zinc-500 font-mono text-xs">
        <p>Desenvolvido para fins de Trabalho de Conclusão de Curso em Automação Industrial.</p>
        <p className="mt-2 text-zinc-600">{new Date().getFullYear()} © Sistema de Governança Estudantil</p>
      </footer>
    </div>
  );
}