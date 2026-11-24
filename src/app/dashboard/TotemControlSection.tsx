'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BUTTON_LABELS,
  CURSOS,
  ROOMS,
  type CursoId,
  type SerieId,
  type TotemButton,
  type TotemEventLog,
  type TotemPowerMode,
  type TotemPowerState,
} from '@/lib/types';

export interface TotemStatusInfo {
  connectedScreens: number;
  esp32Online: boolean;
  lastEsp32SeenAt: string | null;
  lastDeviceId: string | null;
  recentEvents: TotemEventLog[];
}

export function TotemControlSection({
  status,
  powerState,
  onPowerStateChange,
  onRefresh,
  onToast,
}: {
  status: TotemStatusInfo;
  powerState: TotemPowerState;
  onPowerStateChange: (next: TotemPowerState) => void;
  onRefresh: () => Promise<void>;
  onToast: (msg: string, type?: 'ok' | 'err') => void;
}) {
  const [sending, setSending] = useState<TotemButton | null>(null);
  const [savingPower, setSavingPower] = useState(false);
  const [mode, setMode] = useState<'direct' | 'combo'>('direct');

  async function handlePowerMode(nextMode: TotemPowerMode) {
    setSavingPower(true);
    try {
      const res = await fetch('/api/totem/power', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: nextMode }),
      });
      const data = await res.json();
      if (res.ok && data.powerState) {
        onPowerStateChange(data.powerState);
        const label =
          nextMode === 'AUTO'
            ? 'Modo Automático (Sensor PIR) ativado.'
            : nextMode === 'FORCE_ON'
              ? 'Tela configurada para ficar sempre ligada.'
              : 'Comando enviado — tela do totem desligada remotamente.';
        onToast(label);
      } else {
        onToast(data.error || 'Erro ao alterar modo de energia.', 'err');
      }
    } catch {
      onToast('Erro de conexão.', 'err');
    } finally {
      setSavingPower(false);
    }
  }

  async function sendRemoteButton(button: TotemButton) {
    setSending(button);
    try {
      const res = await fetch('/api/totem/input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          button,
          source: 'dashboard',
          deviceId: 'dashboard-remote',
        }),
      });
      if (res.ok) {
        await onRefresh();
      } else {
        onToast('Erro ao enviar comando ao totem.', 'err');
      }
    } catch {
      onToast('Erro de conexão.', 'err');
    } finally {
      setSending(null);
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="apple-card rounded-[24px] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b]">
            Telas /totem conectadas
          </p>
          <p className="font-display text-4xl font-bold text-[#1d1d1f] mt-2">
            {status.connectedScreens}
          </p>
          <p className="text-xs text-[#6e6e73] mt-1">Conexão ao vivo via SSE</p>
        </div>

        <div className="apple-card rounded-[24px] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b]">
            Hardware ESP32
          </p>
          <div className="flex items-center gap-2.5 mt-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                status.esp32Online ? 'bg-[#30d158] animate-pulse' : 'bg-[#d2d2d7]'
              }`}
            />
            <span className="font-display text-2xl font-bold text-[#1d1d1f]">
              {status.esp32Online ? 'Online' : 'Em espera'}
            </span>
          </div>
          <p className="text-xs text-[#6e6e73] mt-2">
            {status.lastEsp32SeenAt
              ? `Último sinal às ${new Date(status.lastEsp32SeenAt).toLocaleTimeString('pt-BR')}`
              : 'Aguardando POST /api/totem/input'}
          </p>
        </div>

        <div className="rounded-[24px] bg-[#1d1d1f] text-white p-5 flex flex-col justify-between shadow-lg">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Tela do Quiosque
            </p>
            <p className="text-sm text-zinc-300 mt-1.5 leading-relaxed">
              Abra <code className="font-mono text-white font-semibold">/totem</code> em tela cheia
              (F11) no computador do totem.
            </p>
          </div>
          <Link
            href="/totem"
            target="_blank"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-white hover:bg-zinc-100 text-[#1d1d1f] font-semibold text-xs py-2.5 px-4 transition"
          >
            Abrir /totem em nova aba ↗
          </Link>
        </div>
      </div>

      {/* Remote Power Control Card (Works on Vercel via MongoDB -> /totem -> USB + Local Monitor Agent) */}
      <div className="apple-card rounded-[28px] p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#0071e3] mb-1">
            Controle da Tela · USB + Sensor de Presença
          </p>
          <h3 className="font-display text-lg font-bold text-[#1d1d1f]">
            Tela e Sensor de Presença do Totem
          </h3>
          <p className="text-xs text-[#6e6e73] mt-1 max-w-xl leading-relaxed">
            Salvo no MongoDB Atlas e sincronizado automaticamente em até 10s com o{' '}
            <code className="font-mono text-[#1d1d1f]">/totem</code>, controlando a tela do
            computador pela USB e pelo sensor PIR sem precisar de relé.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {(
            [
              { id: 'AUTO', label: 'Automático (Sensor PIR)', activeCls: 'bg-[#0071e3] text-white' },
              { id: 'FORCE_ON', label: 'Sempre Ligado', activeCls: 'bg-[#30d158] text-white' },
              { id: 'FORCE_OFF', label: 'Desligar Tela', activeCls: 'bg-[#ff3b30] text-white' },
            ] as Array<{ id: TotemPowerMode; label: string; activeCls: string }>
          ).map((opt) => {
            const active = powerState.mode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                disabled={savingPower}
                onClick={() => void handlePowerMode(opt.id)}
                className={`px-4 py-2.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  active
                    ? `${opt.activeCls} shadow-sm`
                    : 'bg-[#f5f5f7] hover:bg-black/[0.08] text-[#1d1d1f]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Simulator + Protocol */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Physical Keypad Simulator */}
        <div className="lg:col-span-6 apple-card rounded-[28px] p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-display text-lg font-bold text-[#1d1d1f]">
                Painel Remoto das Salas
              </h3>
              <p className="text-xs text-[#6e6e73]">
                Testa o mesmo endpoint <code className="font-mono">POST /api/totem/input</code> do hardware.
              </p>
            </div>

            <div className="flex bg-[#f5f5f7] p-1 rounded-full text-[11px] font-semibold border border-black/[0.06]">
              <button
                type="button"
                onClick={() => setMode('direct')}
                className={`px-3 py-1 rounded-full transition cursor-pointer ${
                  mode === 'direct' ? 'bg-white text-[#1d1d1f] shadow-xs' : 'text-[#6e6e73]'
                }`}
              >
                Salas (Direto)
              </button>
              <button
                type="button"
                onClick={() => setMode('combo')}
                className={`px-3 py-1 rounded-full transition cursor-pointer ${
                  mode === 'combo' ? 'bg-white text-[#1d1d1f] shadow-xs' : 'text-[#6e6e73]'
                }`}
              >
                Curso + Ano
              </button>
            </div>
          </div>

          {mode === 'direct' ? (
            <div className="space-y-3.5 mt-4">
              {CURSOS.map((curso) => {
                const courseRooms = ROOMS.filter((r) => r.curso === curso.id);
                return (
                  <div key={curso.id} className="space-y-1.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#86868b]">
                      {curso.label}
                    </p>
                    <div className="grid grid-cols-3 gap-2.5">
                      {courseRooms.map((room) => (
                        <button
                          key={room.button}
                          type="button"
                          disabled={sending !== null}
                          onClick={() => void sendRemoteButton(room.button)}
                          className="py-3 px-3 rounded-2xl bg-[#f5f5f7] hover:bg-[#1d1d1f] hover:text-white border border-black/[0.05] text-xs font-semibold transition cursor-pointer text-center"
                        >
                          {room.turma}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#86868b] mb-2">
                  Botões de Curso (3)
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['AUTOMACAO', 'INFORMATICA', 'MECANICA'] as CursoId[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      disabled={sending !== null}
                      onClick={() => void sendRemoteButton(c)}
                      className="py-3 rounded-2xl bg-[#f5f5f7] hover:bg-[#0071e3] hover:text-white border border-black/[0.06] text-xs font-semibold transition cursor-pointer"
                    >
                      {BUTTON_LABELS[c]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#86868b] mb-2">
                  Botões de Série / Ano (3)
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['ANO_1', 'ANO_2', 'ANO_3'] as SerieId[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={sending !== null}
                      onClick={() => void sendRemoteButton(s)}
                      className="py-3 rounded-2xl bg-[#f5f5f7] hover:bg-[#1d1d1f] hover:text-white border border-black/[0.06] text-xs font-semibold transition cursor-pointer"
                    >
                      {BUTTON_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Dedicated Red Voltar Button */}
          <button
            type="button"
            disabled={sending !== null}
            onClick={() => void sendRemoteButton('VOLTAR')}
            className="kiosk-red-button mt-5 w-full py-3.5 rounded-2xl text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white/90" />
            VOLTAR (Botão Vermelho)
          </button>
        </div>

        {/* Protocol & Event Feed */}
        <div className="lg:col-span-6 apple-card rounded-[28px] p-6 flex flex-col justify-between gap-5">
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-lg font-bold text-[#1d1d1f]">
                Integração ESP32 (Wi-Fi ou USB)
              </h3>
              <p className="text-xs text-[#6e6e73] mt-1 leading-relaxed">
                Os firmwares em <code className="font-mono text-[#1d1d1f]">firmware/firmware_esp32.ino</code>{' '}
                (ESP32) e <code className="font-mono text-[#1d1d1f]">firmware/firmware_arduino.ino</code>{' '}
                (Arduino) enviam os botões numerados de <strong>1 a 9</strong> e o botão vermelho{' '}
                <strong>VOLTAR</strong> por cabo USB (Web Serial) ou Wi-Fi (HTTP POST no ESP32).
              </p>
            </div>

            <div className="rounded-2xl bg-[#111216] text-zinc-100 p-4 text-xs font-mono overflow-x-auto leading-relaxed">
              <div className="text-zinc-500 mb-1"># POST /api/totem/input</div>
              <div className="text-zinc-300">
                {`{ "button": "1" .. "9" | "AUTO_1".."MEC_3" | "VOLTAR" }`}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#86868b]">
                Últimos comandos recebidos
              </p>
              <button
                type="button"
                onClick={() => void onRefresh()}
                className="text-xs font-semibold text-[#0071e3] hover:underline cursor-pointer"
              >
                Atualizar
              </button>
            </div>

            {status.recentEvents.length === 0 ? (
              <div className="rounded-2xl bg-[#f5f5f7] border border-black/[0.04] px-4 py-6 text-center text-xs text-[#86868b]">
                Nenhum comando recebido ainda.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {status.recentEvents.slice(0, 8).map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center justify-between text-xs px-3.5 py-2.5 rounded-2xl bg-[#f5f5f7] border border-black/[0.04]"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`font-mono font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
                          ev.button === 'VOLTAR'
                            ? 'bg-[#ff3b30] text-white'
                            : 'bg-[#1d1d1f] text-white'
                        }`}
                      >
                        {ev.button}
                      </span>
                      <span className="font-semibold text-[#1d1d1f]">
                        {BUTTON_LABELS[ev.button]}
                      </span>
                    </div>
                    <span className="text-[#86868b] font-mono text-[11px]">
                      {new Date(ev.timestamp).toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
