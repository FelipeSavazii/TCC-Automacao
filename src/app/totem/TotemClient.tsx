'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AVISO_CATEGORIA_LABELS,
  BUTTON_LABELS,
  CURSOS,
  DIRECT_BUTTON_TO_TURMA,
  ROLE_LABELS,
  ROOMS,
  TURMA_TO_ROOM,
  getTurmaName,
  normalizeTotemButton,
  type Aviso,
  type CursoId,
  type DirectTurmaButton,
  type SerieId,
  type TotemButton,
  type TotemPowerMode,
  type TotemPowerState,
} from '@/lib/types';

interface TurmaSummary {
  number: number;
  nome: string;
  avisosCount: number;
  urgentesCount: number;
}

interface TotemPayload {
  avisos: Aviso[];
  turmas: TurmaSummary[];
  powerState: TotemPowerState;
  status: {
    connectedScreens: number;
    esp32Online: boolean;
    lastEsp32SeenAt: string | null;
  };
}

interface SerialPortLike {
  open: (opts: { baudRate: number }) => Promise<void>;
  readable: ReadableStream<Uint8Array> | null;
  writable: WritableStream<Uint8Array> | null;
  close: () => Promise<void>;
}

const AVISOS_PER_PAGE = 4;
const IDLE_RESET_SECONDS = 60;
const STANDBY_TIMEOUT_SECONDS = 15;

const ACCENT_STYLES: Record<
  'amber' | 'blue' | 'emerald',
  {
    ambient: string;
    ring: string;
    badgeBg: string;
    badgeText: string;
    keycapActive: string;
    dot: string;
  }
> = {
  amber: {
    ambient: 'radial-gradient(circle, rgba(255,159,10,0.22) 0%, rgba(255,159,10,0.03) 65%, transparent 100%)',
    ring: 'border-[#ff9f0a]/65 shadow-[0_0_40px_rgba(255,159,10,0.18)]',
    badgeBg: 'bg-[#ff9f0a]/15 border-[#ff9f0a]/30',
    badgeText: 'text-[#ffd60a]',
    keycapActive: 'bg-[#ff9f0a] text-[#111216]',
    dot: 'bg-[#ff9f0a]',
  },
  blue: {
    ambient: 'radial-gradient(circle, rgba(10,132,255,0.24) 0%, rgba(10,132,255,0.03) 65%, transparent 100%)',
    ring: 'border-[#0a84ff]/65 shadow-[0_0_40px_rgba(10,132,255,0.20)]',
    badgeBg: 'bg-[#0a84ff]/15 border-[#0a84ff]/30',
    badgeText: 'text-[#64d2ff]',
    keycapActive: 'bg-[#0a84ff] text-white',
    dot: 'bg-[#0a84ff]',
  },
  emerald: {
    ambient: 'radial-gradient(circle, rgba(48,209,88,0.22) 0%, rgba(48,209,88,0.03) 65%, transparent 100%)',
    ring: 'border-[#30d158]/65 shadow-[0_0_40px_rgba(48,209,88,0.18)]',
    badgeBg: 'bg-[#30d158]/15 border-[#30d158]/30',
    badgeText: 'text-[#63e6be]',
    keycapActive: 'bg-[#30d158] text-[#0b160e]',
    dot: 'bg-[#30d158]',
  },
};

function isDirectButton(btn: TotemButton): btn is DirectTurmaButton {
  return btn in DIRECT_BUTTON_TO_TURMA;
}

function isCursoButton(btn: TotemButton): btn is CursoId {
  return btn === 'AUTOMACAO' || btn === 'INFORMATICA' || btn === 'MECANICA';
}

function isSerieButton(btn: TotemButton): btn is SerieId {
  return btn === 'ANO_1' || btn === 'ANO_2' || btn === 'ANO_3';
}

export function TotemClient({ initialData }: { initialData: TotemPayload }) {
  const [data, setData] = useState<TotemPayload>(initialData);

  const [selectedTurma, setSelectedTurma] = useState<string | null>(null);
  const [pendingCurso, setPendingCurso] = useState<CursoId | null>(null);
  const [pendingSerie, setPendingSerie] = useState<SerieId | null>(null);
  const [page, setPage] = useState(0);

  const [sseConnected, setSseConnected] = useState(false);
  const [esp32Online, setEsp32Online] = useState(initialData.status.esp32Online);
  const [serialConnected, setSerialConnected] = useState(false);
  const [usbError, setUsbError] = useState<string | null>(null);
  const [screenOff, setScreenOff] = useState(initialData.powerState.mode === 'FORCE_OFF');
  const [pirDetected, setPirDetected] = useState(false);
  const [pirPopupVisible, setPirPopupVisible] = useState(false);
  const [powerMode, setPowerMode] = useState<TotemPowerMode>(initialData.powerState.mode);
  const [lastPressed, setLastPressed] = useState<TotemButton | null>(null);
  const [showSimulator, setShowSimulator] = useState(false);
  const [simMode, setSimMode] = useState<'direct' | 'combo'>('direct');
  const [clockHm, setClockHm] = useState('--:--');
  const [clockSec, setClockSec] = useState('--');
  const [dateStr, setDateStr] = useState('');
  const [idleSeconds, setIdleSeconds] = useState(0);
  const [standbyCountdown, setStandbyCountdown] = useState<number | null>(null);

  const pressFlashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pirPopupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const serialWriterRef = useRef<WritableStreamDefaultWriter<Uint8Array> | null>(null);

  const showPirPopup = useCallback(() => {
    setPirPopupVisible(true);
    if (pirPopupTimer.current) clearTimeout(pirPopupTimer.current);
    pirPopupTimer.current = setTimeout(() => setPirPopupVisible(false), 3000);
  }, []);
  const lastPowerModeRef = useRef<TotemPowerMode>(initialData.powerState.mode);

  const sendSerialCommand = useCallback(async (cmd: string) => {
    const writer = serialWriterRef.current;
    if (!writer) return;
    try {
      await writer.write(new TextEncoder().encode(`${cmd}\n`));
    } catch {
      // ignore closed serial port
    }
  }, []);

  const triggerLocalMonitorAgent = useCallback(async (turnOn: boolean) => {
    try {
      await fetch('http://127.0.0.1:4567/power', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: turnOn ? 'ON' : 'OFF' }),
      });
    } catch {
      // Agente local opcional não está aberto — segue com modo blackout #000000
    }
  }, []);

  const syncPowerModeToHardware = useCallback(
    (mode: TotemPowerMode) => {
      setPowerMode(mode);
      if (mode === 'FORCE_OFF') {
        setScreenOff(true);
        setSelectedTurma(null);
        setPendingCurso(null);
        setPendingSerie(null);
        setPage(0);
        void sendSerialCommand('SCREEN_FORCE_OFF');
        void triggerLocalMonitorAgent(false);
      } else if (mode === 'FORCE_ON') {
        setScreenOff(false);
        void sendSerialCommand('SCREEN_FORCE_ON');
        void triggerLocalMonitorAgent(true);
      } else {
        setScreenOff(false);
        void sendSerialCommand('MODE_AUTO');
        void triggerLocalMonitorAgent(true);
      }
    },
    [sendSerialCommand, triggerLocalMonitorAgent]
  );

  const fetchTotemData = useCallback(async () => {
    try {
      const res = await fetch('/api/totem/data', { cache: 'no-store' });
      if (res.ok) {
        const json = (await res.json()) as TotemPayload;
        setData(json);
        setEsp32Online(json.status.esp32Online);
        if (json.powerState && json.powerState.mode !== lastPowerModeRef.current) {
          lastPowerModeRef.current = json.powerState.mode;
          syncPowerModeToHardware(json.powerState.mode);
        }
      }
    } catch {
      // ignore offline transient
    }
  }, [syncPowerModeToHardware]);

  // Auto-sync a cada 10s (garante atualização de avisos e modo de energia mesmo na Vercel!)
  useEffect(() => {
    const id = setInterval(() => {
      void fetchTotemData();
    }, 10_000);
    return () => clearInterval(id);
  }, [fetchTotemData]);

  // Crisp Apple-style clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setClockHm(
        now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      );
      setClockSec(String(now.getSeconds()).padStart(2, '0'));
      setDateStr(
        now.toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
        })
      );
    };
    updateClock();
    const id = setInterval(updateClock, 1000);
    return () => clearInterval(id);
  }, []);

  const turmaMap = useMemo(() => {
    const map = new Map<string, TurmaSummary>();
    for (const t of data.turmas) map.set(t.nome, t);
    return map;
  }, [data.turmas]);

  const urgentAvisos = useMemo(() => data.avisos.filter((a) => a.urgente), [data.avisos]);

  const selectedRoom = selectedTurma ? TURMA_TO_ROOM[selectedTurma] : undefined;

  const turmaAvisos = useMemo(() => {
    if (!selectedTurma) return [];
    return data.avisos.filter(
      (a) => a.turma === selectedTurma || a.turma === 'Geral / Campus'
    );
  }, [data.avisos, selectedTurma]);

  const totalPages = Math.max(1, Math.ceil(turmaAvisos.length / AVISOS_PER_PAGE));
  const safePage = Math.min(page, totalPages - 1);
  const visibleAvisos = turmaAvisos.slice(
    safePage * AVISOS_PER_PAGE,
    (safePage + 1) * AVISOS_PER_PAGE
  );

  const openTurma = useCallback(
    (turmaName: string) => {
      if (selectedTurma === turmaName) {
        if (totalPages > 1) {
          setPage((p) => (p + 1) % totalPages);
        }
        return;
      }
      setSelectedTurma(turmaName);
      setPendingCurso(null);
      setPendingSerie(null);
      setPage(0);
    },
    [selectedTurma, totalPages]
  );

  const applyScreenPower = useCallback(
    async (turnOn: boolean, notifyHost = true) => {
      setScreenOff(!turnOn);
      if (!turnOn) {
        setPirDetected(false);
        setSelectedTurma(null);
        setPendingCurso(null);
        setPendingSerie(null);
        setPage(0);
      }
      if (notifyHost) {
        void triggerLocalMonitorAgent(turnOn);
        try {
          await fetch('/api/totem/power', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ state: turnOn ? 'ON' : 'OFF' }),
          });
        } catch {
          // ignore offline errors
        }
      }
    },
    [triggerLocalMonitorAgent]
  );

  const applyScreenPowerRef = useRef(applyScreenPower);
  useEffect(() => {
    applyScreenPowerRef.current = applyScreenPower;
  }, [applyScreenPower]);

  const handleButton = useCallback(
    (btn: TotemButton) => {
      setIdleSeconds(0);
      if (screenOff) {
        void applyScreenPower(true, true);
      }
      setLastPressed(btn);
      if (pressFlashTimer.current) clearTimeout(pressFlashTimer.current);
      pressFlashTimer.current = setTimeout(() => setLastPressed(null), 550);

      if (btn === 'VOLTAR') {
        if (selectedTurma && safePage > 0) {
          setPage((p) => Math.max(0, p - 1));
          return;
        }
        setSelectedTurma(null);
        setPendingCurso(null);
        setPendingSerie(null);
        setPage(0);
        return;
      }

      if (isDirectButton(btn)) {
        openTurma(DIRECT_BUTTON_TO_TURMA[btn]);
        return;
      }

      if (isCursoButton(btn)) {
        if (selectedRoom) {
          openTurma(getTurmaName(btn, selectedRoom.serie));
          return;
        }
        if (pendingSerie) {
          openTurma(getTurmaName(btn, pendingSerie));
        } else {
          setPendingCurso(btn);
        }
        return;
      }

      if (isSerieButton(btn)) {
        if (selectedRoom) {
          openTurma(getTurmaName(selectedRoom.curso, btn));
          return;
        }
        if (pendingCurso) {
          openTurma(getTurmaName(pendingCurso, btn));
        } else {
          setPendingSerie(btn);
        }
      }
    },
    [screenOff, applyScreenPower, selectedTurma, safePage, selectedRoom, pendingCurso, pendingSerie, openTurma]
  );

  const handleButtonRef = useRef(handleButton);
  useEffect(() => {
    handleButtonRef.current = handleButton;
  }, [handleButton]);

  // Contagem regressiva visível do Stand-by (quando USB conectado e PIR sem presença no modo AUTO)
  useEffect(() => {
    if (!serialConnected || powerMode !== 'AUTO' || pirDetected || screenOff) {
      return;
    }
    const startedAt = Date.now();
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, STANDBY_TIMEOUT_SECONDS - elapsed);
      setStandbyCountdown(remaining);
      if (remaining === 0) {
        clearInterval(timer);
        void applyScreenPowerRef.current(false, true);
      }
    }, 500);
    return () => {
      clearInterval(timer);
      setStandbyCountdown(null);
    };
  }, [serialConnected, powerMode, pirDetected, screenOff]);

  // Idle auto-return to home screen after 60s
  useEffect(() => {
    if (!selectedTurma && !pendingCurso && !pendingSerie) return;
    const timer = setInterval(() => {
      setIdleSeconds((s) => {
        if (s + 1 >= IDLE_RESET_SECONDS) {
          setSelectedTurma(null);
          setPendingCurso(null);
          setPendingSerie(null);
          setPage(0);
          return 0;
        }
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedTurma, pendingCurso, pendingSerie]);

  // 1) SSE Connection (ESP32 Wi-Fi HTTP POST + Dashboard real-time sync)
  useEffect(() => {
    const es = new EventSource('/api/totem/stream');
    es.onopen = () => setSseConnected(true);
    es.onerror = () => setSseConnected(false);

    es.addEventListener('connected', (ev) => {
      setSseConnected(true);
      try {
        const parsed = JSON.parse((ev as MessageEvent).data);
        if (parsed?.status?.esp32Online) setEsp32Online(true);
      } catch {
        // ignore
      }
    });

    es.addEventListener('input', (ev) => {
      try {
        const parsed = JSON.parse((ev as MessageEvent).data) as {
          button: string;
          source: string;
        };
        if (parsed.source === 'esp32') setEsp32Online(true);
        const normalized = normalizeTotemButton(parsed.button);
        if (normalized) handleButtonRef.current(normalized);
      } catch {
        // ignore
      }
    });

    es.addEventListener('screen', (ev) => {
      try {
        const parsed = JSON.parse((ev as MessageEvent).data) as { screenOn: boolean };
        setPirDetected(Boolean(parsed.screenOn));
        void applyScreenPowerRef.current(Boolean(parsed.screenOn), false);
      } catch {
        // ignore
      }
    });

    es.addEventListener('heartbeat', () => setEsp32Online(true));
    es.addEventListener('data-updated', () => void fetchTotemData());

    return () => es.close();
  }, [fetchTotemData]);

  // 2) Keyboard Shortcuts (1-9 + Backspace/Esc/0 = Voltar + M = Simulator + F = Fullscreen)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'm' || e.key === 'M') {
        setShowSimulator((v) => !v);
        return;
      }
      if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement) {
          void document.documentElement.requestFullscreen().catch(() => {});
        } else {
          void document.exitFullscreen().catch(() => {});
        }
        return;
      }

      if (e.key === 'Backspace' || e.key === 'Escape' || e.key === '0') {
        e.preventDefault();
        handleButtonRef.current('VOLTAR');
        return;
      }

      const normalized = normalizeTotemButton(e.key);
      if (normalized) {
        e.preventDefault();
        handleButtonRef.current(normalized);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // 3) Optional Web Serial API (Direct USB cable to ESP32)
  async function connectUsbSerial() {
    const nav = navigator as Navigator & {
      serial?: { requestPort: () => Promise<SerialPortLike> };
    };
    if (!nav.serial) {
      alert('Web Serial API disponível apenas no Google Chrome ou Microsoft Edge.');
      return;
    }

    try {
      setUsbError(null);
      const port = await nav.serial.requestPort();
      await port.open({ baudRate: 115200 });
      setSerialConnected(true);
      setEsp32Online(true);

      // Canal de escrita (Vercel/Dashboard -> /totem -> USB -> Arduino/ESP32 Relé)
      // Aguarda 1.8s pois Arduino Uno/Nano reinicia ao abrir a porta COM
      if (port.writable) {
        serialWriterRef.current = port.writable.getWriter();
        setTimeout(() => {
          const initialCmd =
            lastPowerModeRef.current === 'FORCE_OFF'
              ? 'SCREEN_FORCE_OFF'
              : lastPowerModeRef.current === 'FORCE_ON'
                ? 'SCREEN_FORCE_ON'
                : 'MODE_AUTO';
          void sendSerialCommand(initialCmd);
        }, 1800);
      }

      const decoder = new TextDecoder();
      let buffer = '';
      const reader = port.readable?.getReader();
      if (!reader) return;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() ?? '';
          for (const line of lines) {
            const rawLine = line.trim().toUpperCase();
            if (rawLine === 'PIR_ON') {
              setPirDetected(true);
              showPirPopup();
              if (lastPowerModeRef.current === 'AUTO') {
                void applyScreenPowerRef.current(true, true);
              }
              continue;
            }
            if (rawLine === 'PIR_OFF') {
              setPirDetected(false);
              continue;
            }
            if (rawLine === 'SCREEN_OFF') {
              setPirDetected(false);
              void applyScreenPowerRef.current(false, true);
              continue;
            }
            if (rawLine === 'SCREEN_ON') {
              void applyScreenPowerRef.current(true, true);
              continue;
            }
            const cmd = normalizeTotemButton(rawLine);
            if (cmd) handleButtonRef.current(cmd);
          }
        }
      }
    } catch (err) {
      serialWriterRef.current = null;
      setSerialConnected(false);
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.toLowerCase().includes('no port selected')) {
        setUsbError('Porta USB ocupada ou desconectada. Feche o Monitor Serial da Arduino IDE.');
        setTimeout(() => setUsbError(null), 6000);
      }
    }
  }

  const activeAmbient = selectedRoom
    ? ACCENT_STYLES[selectedRoom.accent].ambient
    : 'radial-gradient(circle, rgba(10,132,255,0.16) 0%, rgba(94,92,230,0.06) 55%, transparent 100%)';

  return (
    <div className="relative min-h-screen h-screen w-screen bg-[#050507] text-[#f5f5f7] flex flex-col overflow-hidden select-none">
      {/* ════ STANDBY BLACKOUT OVERLAY (SENSOR DE PRESENÇA: SCREEN_OFF) ════ */}
      {screenOff && (
        <div
          onClick={() => void applyScreenPower(true, true)}
          className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center cursor-pointer transition-opacity duration-500"
        >
          <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-800 font-semibold">
            {powerMode === 'FORCE_OFF'
              ? 'Totem desligado remotamente pela Dashboard'
              : 'Modo economia · Aproxime-se para ativar'}
          </p>
        </div>
      )}
      {/* ════ POP-UP TEMPORÁRIO DE PRESENÇA DETECTADA (TESTE PIR) ════ */}
      {pirPopupVisible && !screenOff && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[90] animate-fade-up pointer-events-none">
          <div className="flex items-center gap-3 px-6 py-3.5 rounded-full bg-[#111915]/95 backdrop-blur-2xl border border-[#30d158]/50 shadow-[0_16px_48px_rgba(48,209,88,0.28)]">
            <span className="relative flex h-3 w-3 items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#30d158] opacity-75 animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-[#30d158] shadow-[0_0_10px_#30d158]" />
            </span>
            <div>
              <p className="font-display text-sm font-bold text-white leading-none">
                Presença detectada!
              </p>
              <p className="text-[11px] text-[#63e6be] mt-0.5">
                Sensor PIR ativo · Tela mantida ligada
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ════ ARCHITECTURAL AMBIENT LIGHT ════ */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
        <div
          className="ambient-blob ambient-blob-a transition-all duration-700"
          style={{
            width: '55vw',
            height: '55vw',
            top: '-22%',
            right: '-10%',
            background: activeAmbient,
          }}
        />
        <div
          className="ambient-blob ambient-blob-b"
          style={{
            width: '42vw',
            height: '42vw',
            bottom: '-20%',
            left: '-10%',
            background:
              'radial-gradient(circle, rgba(255,255,255,0.06) 0%, rgba(94,92,230,0.05) 50%, transparent 100%)',
          }}
        />
      </div>

      {/* ════ TOP KIOSK HEADER ════ */}
      <header className="relative z-10 px-8 py-5 bg-white/[0.03] backdrop-blur-2xl border-b border-white/[0.08] flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-[14px] bg-white text-[#050507] flex items-center justify-center shadow-[0_0_25px_rgba(255,255,255,0.18)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
              <path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-display text-2xl font-bold tracking-[-0.03em] text-white">
                Life
              </h1>
              <span className="h-4 w-px bg-white/15" />
              <span className="text-sm font-medium text-zinc-400">
                Totem HTO · IFSP Hortolândia
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5 tracking-wide">
              Mural digital de avisos em tempo real
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Telemetry Pills */}
          <div className="hidden md:flex items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${
                sseConnected
                  ? 'bg-[#30d158]/10 text-[#63e6be] border-[#30d158]/25'
                  : 'bg-[#ff3b30]/10 text-[#ff6961] border-[#ff3b30]/30'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  sseConnected ? 'bg-[#30d158] animate-pulse' : 'bg-[#ff3b30]'
                }`}
              />
              {sseConnected ? 'Ao vivo' : 'Reconectando'}
            </span>

            {/* LED do Sensor de Presença (verde piscando = presença ativa | cinza apagado = limiar para desligar) */}
            <span
              title={
                !serialConnected && !esp32Online
                  ? 'Conecte o Arduino/ESP32 via USB para ativar o sensor'
                  : pirDetected
                    ? 'Sensor de presença detectando movimento'
                    : 'Sem presença detectada — contando para desligar a tela'
              }
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300 ${
                pirDetected && !screenOff
                  ? 'bg-[#30d158]/12 text-[#63e6be] border-[#30d158]/35'
                  : 'bg-white/[0.04] text-zinc-500 border-white/[0.08]'
              }`}
            >
              <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                {pirDetected && !screenOff && (
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#30d158] opacity-75 animate-ping" />
                )}
                <span
                  className={`relative inline-flex h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                    pirDetected && !screenOff
                      ? 'bg-[#30d158] shadow-[0_0_10px_#30d158]'
                      : 'bg-zinc-600 border border-white/10'
                  }`}
                />
              </span>
              {!serialConnected && !esp32Online
                ? 'Sensor offline'
                : pirDetected && !screenOff
                  ? 'Presença'
                  : standbyCountdown !== null
                    ? `Stand-by · ${standbyCountdown}s`
                    : 'Stand-by'}
            </span>

            <span
              className={`hidden xl:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${
                esp32Online || serialConnected
                  ? 'bg-white/10 text-white border-white/20'
                  : 'bg-white/[0.04] text-zinc-400 border-white/10'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  esp32Online || serialConnected ? 'bg-[#0a84ff]' : 'bg-zinc-600'
                }`}
              />
              {serialConnected
                ? 'USB Conectado'
                : esp32Online
                  ? 'ESP32 Conectado'
                  : 'Hardware Pronto'}
            </span>
          </div>

          {/* Apple Watch-inspired Clock */}
          <div className="text-right">
            <div className="font-display flex items-baseline justify-end gap-0.5 leading-none">
              <span className="text-3xl font-bold tracking-[-0.04em] tabular-nums text-white">
                {clockHm}
              </span>
              <span className="text-sm font-semibold tabular-nums text-zinc-500">
                :{clockSec}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 capitalize mt-1">{dateStr}</p>
          </div>
        </div>
      </header>

      {/* ════ URGENT ALERT STRIP ════ */}
      {urgentAvisos.length > 0 && !selectedTurma && (
        <div className="relative z-10 px-8 py-2.5 bg-[#ff3b30]/14 border-b border-[#ff453a]/30 backdrop-blur-xl flex items-center gap-3.5 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#ff3b30] text-white text-[11px] font-bold uppercase tracking-wider shrink-0 shadow-sm shadow-[#ff3b30]/40">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Urgente
          </span>
          <p className="text-sm font-medium text-white truncate">
            {urgentAvisos.map((a) => `[${a.turma}] ${a.titulo}`).join('    ·    ')}
          </p>
        </div>
      )}

      {/* ════ MAIN KIOSK VIEWPORT ════ */}
      <main className="relative z-10 flex-1 overflow-hidden px-8 py-6 flex flex-col min-h-0">
        {/* HOME VIEW: 1 TO 9 NUMBERED ROOMS MATRIX */}
        {!selectedTurma && (
          <div className="flex-1 flex flex-col min-h-0 gap-5 animate-fade-up">
            <div className="flex flex-wrap items-end justify-between gap-4 shrink-0">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400 mb-1">
                  Painel físico do totem
                </p>
                <h2 className="font-display text-3xl lg:text-[42px] font-bold tracking-[-0.035em] leading-none text-white">
                  Selecione sua sala
                </h2>
              </div>

              {(pendingCurso || pendingSerie) ? (
                <div className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold animate-pulse">
                  {pendingCurso
                    ? `${BUTTON_LABELS[pendingCurso]} selecionado — aperte 1º, 2º ou 3º Ano`
                    : `${BUTTON_LABELS[pendingSerie!]} selecionado — aperte o curso`}
                </div>
              ) : (
                <p className="text-sm text-zinc-400">
                  {data.avisos.length === 0
                    ? 'Nenhum aviso publicado no momento'
                    : `${data.avisos.length} aviso(s) ativo(s) no campus`}
                </p>
              )}
            </div>

            {/* 3 Courses × 3 Numbered Rooms (1..9) */}
            <div className="flex-1 grid grid-rows-3 gap-4 min-h-0">
              {CURSOS.map((curso) => {
                const style = ACCENT_STYLES[curso.accent];
                const courseRooms = ROOMS.filter((r) => r.curso === curso.id);
                const isCourseSelected = pendingCurso === curso.id;

                return (
                  <div
                    key={curso.id}
                    className={`kiosk-surface rounded-[28px] p-4 grid grid-cols-12 gap-4 items-stretch transition-all duration-300 ${
                      isCourseSelected ? style.ring : ''
                    }`}
                  >
                    {/* Course Identity */}
                    <div
                      onClick={() => handleButton(curso.id)}
                      className="col-span-3 flex flex-col justify-center px-4 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400">
                          Curso Técnico
                        </span>
                      </div>
                      <h3 className="font-display text-2xl lg:text-3xl font-bold tracking-[-0.03em] text-white">
                        {curso.label}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">1º, 2º e 3º Ano</p>
                    </div>

                    {/* 3 Room Tiles */}
                    <div className="col-span-9 grid grid-cols-3 gap-3.5">
                      {courseRooms.map((room) => {
                        const summary = turmaMap.get(room.turma) ?? {
                          number: room.number,
                          nome: room.turma,
                          avisosCount: 0,
                          urgentesCount: 0,
                        };
                        const isHighlighted =
                          isCourseSelected ||
                          pendingSerie === room.serie ||
                          lastPressed === room.button;

                        return (
                          <button
                            key={room.turma}
                            type="button"
                            onClick={() => openTurma(room.turma)}
                            className={`group relative rounded-[22px] p-5 text-left flex flex-col justify-between border transition-all duration-200 cursor-pointer ${
                              isHighlighted
                                ? `bg-white/[0.10] ${style.ring} scale-[1.015]`
                                : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] hover:border-white/[0.18]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold border ${style.badgeBg} ${style.badgeText}`}
                              >
                                {room.serieLabel}
                              </span>

                              {summary.urgentesCount > 0 && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ff3b30] text-white text-[11px] font-bold shadow-sm shadow-[#ff3b30]/40">
                                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                  {summary.urgentesCount} urgente
                                </span>
                              )}
                            </div>

                            <div className="mt-4">
                              <p className="font-display text-2xl lg:text-[26px] font-bold tracking-[-0.025em] text-white">
                                {room.turma}
                              </p>
                              <p className="text-xs text-zinc-400 mt-1.5">
                                {summary.avisosCount === 0
                                  ? 'Sem avisos ativos'
                                  : summary.avisosCount === 1
                                    ? '1 aviso ativo'
                                    : `${summary.avisosCount} avisos ativos`}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ROOM VIEW: EDITORIAL FULL-SCREEN AVISOS GALLERY */}
        {selectedTurma && selectedRoom && (
          <div className="flex-1 flex flex-col min-h-0 gap-5 animate-fade-up">
            {/* Room Header with Prominent Red Voltar Button */}
            <div className="flex flex-wrap items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => handleButton('VOLTAR')}
                  className="kiosk-red-button px-5 py-3 rounded-2xl text-white font-bold text-sm tracking-wide flex items-center gap-2.5 transition active:scale-95 cursor-pointer"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-white/95" />
                  VOLTAR
                </button>

                <div className="h-10 w-px bg-white/10" />

                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${ACCENT_STYLES[selectedRoom.accent].dot}`}
                    />
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
                      Curso Técnico · {selectedRoom.cursoLabel}
                    </p>
                  </div>
                  <h2 className="font-display text-3xl lg:text-4xl font-bold tracking-[-0.03em] text-white leading-tight mt-0.5">
                    {selectedTurma}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {totalPages > 1 && (
                  <button
                    type="button"
                    onClick={() => setPage((p) => (p + 1) % totalPages)}
                    className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white transition cursor-pointer"
                  >
                    Página {safePage + 1} de {totalPages} · Aperte novamente para avançar
                  </button>
                )}
                <span className="px-4 py-2 rounded-full bg-white/[0.06] border border-white/10 text-xs font-semibold text-zinc-300">
                  {turmaAvisos.length === 1
                    ? '1 aviso'
                    : `${turmaAvisos.length} avisos`}
                </span>
              </div>
            </div>

            {/* Horizontal Editorial Avisos List */}
            <div className="flex-1 min-h-0 flex flex-col">
              {visibleAvisos.length === 0 ? (
                <div className="kiosk-surface flex-1 rounded-[32px] flex flex-col items-center justify-center text-center p-10">
                  <div className="w-16 h-16 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-400 mb-5">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <h3 className="font-display text-3xl font-bold tracking-tight text-white">
                    Tudo tranquilo em {selectedTurma}
                  </h3>
                  <p className="text-base text-zinc-400 mt-2 max-w-md">
                    Não há nenhum aviso ativo para esta sala no momento.
                  </p>
                  <p className="mt-6 text-xs font-semibold text-[#ff6961] uppercase tracking-[0.14em]">
                    Aperte o botão vermelho VOLTAR para retornar às salas
                  </p>
                </div>
              ) : (
                <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-y-auto pr-1">
                  {visibleAvisos.map((a) => (
                    <article
                      key={a.id}
                      className={`relative rounded-[26px] px-7 py-6 border transition overflow-hidden shrink-0 ${
                        a.urgente
                          ? 'bg-gradient-to-r from-[#ff3b30]/22 via-[#1b1214]/92 to-[#141418]/95 border-[#ff453a]/50 shadow-[0_0_40px_rgba(255,59,48,0.15)]'
                          : 'kiosk-surface'
                      }`}
                    >
                      {/* Left Accent Bar */}
                      <div
                        className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${
                          a.urgente ? 'bg-[#ff3b30]' : ACCENT_STYLES[selectedRoom.accent].dot
                        }`}
                      />

                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pl-3">
                        {/* Main Horizontal Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2.5">
                            {a.urgente && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#ff3b30] text-white text-[11px] font-bold uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                Urgente
                              </span>
                            )}
                            <span className="px-3 py-0.5 rounded-full bg-white/10 text-zinc-200 text-[11px] font-semibold">
                              {AVISO_CATEGORIA_LABELS[a.categoria]}
                            </span>
                            {a.turma === 'Geral / Campus' && (
                              <span className="px-3 py-0.5 rounded-full bg-[#0a84ff]/20 border border-[#0a84ff]/30 text-[#64d2ff] text-[11px] font-semibold">
                                Geral do Campus
                              </span>
                            )}
                          </div>

                          <h3 className="font-display text-2xl lg:text-[28px] font-bold tracking-[-0.025em] text-white leading-snug">
                            {a.titulo}
                          </h3>

                          <p className="mt-2 text-base lg:text-lg text-zinc-200 leading-relaxed whitespace-pre-line">
                            {a.conteudo}
                          </p>
                        </div>

                        {/* Right Horizontal Metadata */}
                        <div className="md:w-56 md:pl-6 md:border-l border-white/10 flex md:flex-col items-center md:items-end justify-between md:justify-center gap-1.5 shrink-0 text-right">
                          <span className="text-sm font-semibold text-zinc-100">
                            {a.autorNome}
                          </span>
                          <span className="text-xs text-zinc-400">
                            {ROLE_LABELS[a.autorRole]}
                          </span>
                          <span className="text-xs font-mono text-zinc-500 md:mt-2">
                            {new Date(a.createdAt).toLocaleString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ════ OPTIONAL FLOATING SIMULATOR (PRESS M) ════ */}
      {showSimulator && (
        <div className="fixed bottom-20 right-7 z-40 rounded-[28px] bg-[#16161a]/95 backdrop-blur-2xl border border-white/15 p-4 shadow-2xl w-80 animate-fade-up">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400">
              Simulador ESP32
            </span>
            <button
              type="button"
              onClick={() => setShowSimulator(false)}
              className="text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="flex gap-1 mb-3 bg-white/[0.06] p-1 rounded-full">
            <button
              type="button"
              onClick={() => setSimMode('direct')}
              className={`flex-1 py-1.5 rounded-full text-[11px] font-semibold cursor-pointer ${
                simMode === 'direct' ? 'bg-white text-[#050507]' : 'text-zinc-400'
              }`}
            >
              Salas (Direto)
            </button>
            <button
              type="button"
              onClick={() => setSimMode('combo')}
              className={`flex-1 py-1.5 rounded-full text-[11px] font-semibold cursor-pointer ${
                simMode === 'combo' ? 'bg-white text-[#050507]' : 'text-zinc-400'
              }`}
            >
              Curso + Ano
            </button>
          </div>

          {simMode === 'direct' ? (
            <div className="grid grid-cols-3 gap-2">
              {ROOMS.map((room) => (
                <button
                  key={room.turma}
                  type="button"
                  onClick={() => handleButton(room.button)}
                  className="py-2.5 px-2 rounded-2xl bg-white/[0.08] hover:bg-white hover:text-[#050507] text-[11px] font-semibold transition cursor-pointer text-center"
                >
                  {room.turma}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-1.5">
                {(['AUTOMACAO', 'INFORMATICA', 'MECANICA'] as CursoId[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleButton(c)}
                    className={`py-2.5 rounded-xl text-[11px] font-semibold transition cursor-pointer ${
                      pendingCurso === c
                        ? 'bg-[#0a84ff] text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {BUTTON_LABELS[c]}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(['ANO_1', 'ANO_2', 'ANO_3'] as SerieId[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleButton(s)}
                    className={`py-2.5 rounded-xl text-[11px] font-semibold transition cursor-pointer ${
                      pendingSerie === s
                        ? 'bg-[#30d158] text-[#050507]'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {BUTTON_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => handleButton('VOLTAR')}
            className="kiosk-red-button mt-3 w-full py-2.5 rounded-2xl text-white text-xs font-bold tracking-wide transition cursor-pointer"
          >
            ● VOLTAR (Botão Vermelho)
          </button>

          <button
            type="button"
            onClick={() => void applyScreenPower(false, true)}
            className="mt-2 w-full py-2 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-zinc-300 text-[11px] font-semibold transition cursor-pointer"
          >
            Simular ausência (Desligar tela)
          </button>
        </div>
      )}

      {/* ════ BOTTOM PHYSICAL HUD ════ */}
      <footer className="relative z-10 px-8 py-3.5 bg-white/[0.03] backdrop-blur-2xl border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => handleButton('VOLTAR')}
            className={`px-3.5 h-8 rounded-xl text-xs font-bold tracking-wide flex items-center gap-1.5 transition cursor-pointer ${
              lastPressed === 'VOLTAR'
                ? 'bg-[#ff3b30] text-white scale-105 shadow-lg shadow-[#ff3b30]/50'
                : 'bg-[#ff3b30]/20 hover:bg-[#ff3b30] text-[#ff6961] hover:text-white border border-[#ff3b30]/45'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current" />
            VOLTAR
          </button>

          <span className="text-xs text-zinc-400">
            Use os botões físicos do totem para selecionar sua turma
          </span>

          {usbError && (
            <span className="px-3 py-1 rounded-full bg-[#ff3b30]/20 border border-[#ff3b30]/40 text-[#ff6961] text-xs font-semibold">
              {usbError}
            </span>
          )}
          {lastPressed && lastPressed !== 'VOLTAR' && (
            <span className="px-3 py-1 rounded-full bg-white text-[#050507] text-xs font-bold">
              {BUTTON_LABELS[lastPressed]}
            </span>
          )}
        </div>

        {/* Subtle Utility Controls */}
        <div className="flex items-center gap-2.5 text-xs">
          {(selectedTurma || pendingCurso || pendingSerie) &&
            idleSeconds >= IDLE_RESET_SECONDS - 15 && (
              <span className="px-3 py-1 rounded-full bg-[#ff9f0a]/20 text-[#ffd60a] font-semibold">
                Início em {IDLE_RESET_SECONDS - idleSeconds}s
              </span>
            )}
          <button
            type="button"
            onClick={() => void connectUsbSerial()}
            className="px-3.5 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white font-medium transition cursor-pointer"
          >
            {serialConnected ? 'USB Conectado' : 'Conectar USB'}
          </button>
          <button
            type="button"
            onClick={() => setShowSimulator((v) => !v)}
            className="px-3.5 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white font-medium transition cursor-pointer"
          >
            {showSimulator ? 'Ocultar painel' : 'Simulador (M)'}
          </button>
        </div>
      </footer>
    </div>
  );
}
