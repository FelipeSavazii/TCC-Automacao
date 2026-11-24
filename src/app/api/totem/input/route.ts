import { NextRequest, NextResponse } from 'next/server';
import {
  broadcastScreenState,
  broadcastTotemButton,
  getTotemStatus,
  recordEsp32Heartbeat,
} from '@/lib/totem-bus';
import { normalizeTotemButton, VALID_TOTEM_BUTTONS } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(getTotemStatus());
}

export async function POST(req: NextRequest) {
  const expectedKey = process.env.TOTEM_API_KEY;
  if (expectedKey) {
    const provided = req.headers.get('x-totem-key');
    if (provided !== expectedKey) {
      return NextResponse.json({ error: 'Chave do totem inválida.' }, { status: 401 });
    }
  }

  try {
    const body = (await req.json()) as {
      type?: 'button' | 'heartbeat' | 'presence';
      button?: string | number;
      present?: boolean;
      deviceId?: string;
      source?: 'esp32' | 'dashboard' | 'simulator';
    };

    const deviceId = (body.deviceId ?? 'esp32-totem-01').trim();

    if (body.type === 'heartbeat') {
      recordEsp32Heartbeat(deviceId);
      return NextResponse.json({ ok: true, status: getTotemStatus() });
    }

    if (body.type === 'presence') {
      const present = Boolean(body.present);
      const info = broadcastScreenState(present, deviceId);
      return NextResponse.json({ ok: true, screenOn: info.screenOn });
    }

    const rawBtn = String(body.button ?? '').trim().toUpperCase();
    if (rawBtn === 'SCREEN_ON' || rawBtn === 'SCREEN_OFF') {
      const info = broadcastScreenState(rawBtn === 'SCREEN_ON', deviceId);
      return NextResponse.json({ ok: true, screenOn: info.screenOn });
    }

    const normalizedButton = normalizeTotemButton(rawBtn);
    if (!normalizedButton) {
      return NextResponse.json(
        {
          error: `Botão inválido. Use 1-9, VOLTAR, SCREEN_ON/SCREEN_OFF ou um de: ${VALID_TOTEM_BUTTONS.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const source =
      body.source === 'dashboard' || body.source === 'simulator' ? body.source : 'esp32';
    const event = broadcastTotemButton(normalizedButton, source, deviceId);

    return NextResponse.json({
      ok: true,
      event,
      connectedScreens: getTotemStatus().connectedScreens,
    });
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }
}
