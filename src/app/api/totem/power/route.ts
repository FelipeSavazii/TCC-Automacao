import { execFile } from 'node:child_process';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getTotemPowerState, setTotemPowerState } from '@/lib/db';
import { broadcastScreenState } from '@/lib/totem-bus';
import type { TotemPowerMode } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const VALID_MODES: TotemPowerMode[] = ['AUTO', 'FORCE_ON', 'FORCE_OFF'];

function triggerWindowsMonitorPower(turnOn: boolean): Promise<boolean> {
  if (process.platform !== 'win32' || process.env.ENABLE_HOST_SCREEN_CONTROL !== 'true') {
    return Promise.resolve(false);
  }

  const psScript = turnOn
    ? `
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class MonitorCtl {
  [DllImport("user32.dll")] public static extern int SendMessage(int hWnd, int hMsg, int wParam, int lParam);
  [DllImport("user32.dll")] public static extern void mouse_event(uint dwFlags, int dx, int dy, uint dwData, int dwExtraInfo);
}
"@
[MonitorCtl]::SendMessage(0xFFFF, 0x0112, 0xF170, -1) | Out-Null
[MonitorCtl]::mouse_event(0x0001, 1, 0, 0, 0)
[MonitorCtl]::mouse_event(0x0001, -1, 0, 0, 0)
`
    : `
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class MonitorCtl {
  [DllImport("user32.dll")] public static extern int SendMessage(int hWnd, int hMsg, int wParam, int lParam);
}
"@
[MonitorCtl]::SendMessage(0xFFFF, 0x0112, 0xF170, 2) | Out-Null
`;

  return new Promise((resolve) => {
    execFile(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-Command', psScript],
      { timeout: 4000 },
      (err) => {
        resolve(!err);
      }
    );
  });
}

export async function GET() {
  const powerState = await getTotemPowerState();
  return NextResponse.json({ powerState });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      mode?: TotemPowerMode;
      state?: 'ON' | 'OFF';
      deviceId?: string;
    };

    // 1) Remote control mode from Dashboard (persisted in MongoDB so it works on Vercel!)
    if (body.mode) {
      const session = await getSession();
      if (!session) {
        return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
      }
      const mode = body.mode.toUpperCase() as TotemPowerMode;
      if (!VALID_MODES.includes(mode)) {
        return NextResponse.json(
          { error: 'Modo inválido. Use AUTO, FORCE_ON ou FORCE_OFF.' },
          { status: 400 }
        );
      }

      const powerState = await setTotemPowerState(mode);
      const turnOn = mode !== 'FORCE_OFF';
      broadcastScreenState(turnOn, `dashboard-${session.ht}`);
      const hostTriggered = await triggerWindowsMonitorPower(turnOn);

      return NextResponse.json({
        ok: true,
        powerState,
        hostTriggered,
      });
    }

    // 2) Local screen state signal from /totem (PIR sensor via USB)
    const state = (body.state ?? '').toUpperCase();
    if (state !== 'ON' && state !== 'OFF') {
      return NextResponse.json(
        { error: 'Informe mode ("AUTO"|"FORCE_ON"|"FORCE_OFF") ou state ("ON"|"OFF").' },
        { status: 400 }
      );
    }

    const turnOn = state === 'ON';
    const info = broadcastScreenState(turnOn, body.deviceId ?? 'totem-sensor');
    const hostTriggered = await triggerWindowsMonitorPower(turnOn);

    return NextResponse.json({
      ok: true,
      screenOn: info.screenOn,
      hostScreenControlEnabled: process.env.ENABLE_HOST_SCREEN_CONTROL === 'true',
      hostTriggered,
    });
  } catch {
    return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 });
  }
}
