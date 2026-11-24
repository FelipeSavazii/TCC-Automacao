import crypto from 'node:crypto';
import type { TotemButton, TotemEventLog } from './types';

type SseListener = (eventName: string, payload: unknown) => void;

interface TotemBusState {
  listeners: Set<SseListener>;
  recentEvents: TotemEventLog[];
  lastEsp32SeenAt: string | null;
  lastDeviceId: string | null;
  screenOn: boolean;
}

const globalForBus = globalThis as unknown as { __lifeTotemBus?: TotemBusState };

function getBus(): TotemBusState {
  if (!globalForBus.__lifeTotemBus) {
    globalForBus.__lifeTotemBus = {
      listeners: new Set(),
      recentEvents: [],
      lastEsp32SeenAt: null,
      lastDeviceId: null,
      screenOn: true,
    };
  }
  return globalForBus.__lifeTotemBus;
}

export function subscribeTotem(listener: SseListener): () => void {
  const bus = getBus();
  bus.listeners.add(listener);
  return () => {
    bus.listeners.delete(listener);
  };
}

export function broadcastTotemButton(
  button: TotemButton,
  source: 'esp32' | 'dashboard' | 'simulator' = 'esp32',
  deviceId = 'esp32-totem-01'
): TotemEventLog {
  const bus = getBus();
  const event: TotemEventLog = {
    id: crypto.randomUUID().slice(0, 8),
    button,
    source,
    deviceId,
    timestamp: new Date().toISOString(),
  };

  bus.screenOn = true;

  if (source === 'esp32') {
    bus.lastEsp32SeenAt = event.timestamp;
    bus.lastDeviceId = deviceId;
  }

  bus.recentEvents.unshift(event);
  if (bus.recentEvents.length > 25) {
    bus.recentEvents.length = 25;
  }

  for (const listener of bus.listeners) {
    try {
      listener('input', event);
    } catch {
      bus.listeners.delete(listener);
    }
  }

  return event;
}

export function broadcastScreenState(
  on: boolean,
  deviceId = 'esp32-totem-01'
): { screenOn: boolean; timestamp: string } {
  const bus = getBus();
  bus.screenOn = on;
  const timestamp = new Date().toISOString();
  bus.lastEsp32SeenAt = timestamp;
  bus.lastDeviceId = deviceId;

  const payload = { screenOn: on, deviceId, timestamp };
  for (const listener of bus.listeners) {
    try {
      listener('screen', payload);
    } catch {
      bus.listeners.delete(listener);
    }
  }

  return { screenOn: on, timestamp };
}

export function recordEsp32Heartbeat(deviceId = 'esp32-totem-01'): void {
  const bus = getBus();
  bus.lastEsp32SeenAt = new Date().toISOString();
  bus.lastDeviceId = deviceId;

  for (const listener of bus.listeners) {
    try {
      listener('heartbeat', { deviceId, timestamp: bus.lastEsp32SeenAt });
    } catch {
      bus.listeners.delete(listener);
    }
  }
}

export function broadcastDataUpdate(reason: string): void {
  const bus = getBus();
  const payload = { reason, timestamp: new Date().toISOString() };
  for (const listener of bus.listeners) {
    try {
      listener('data-updated', payload);
    } catch {
      bus.listeners.delete(listener);
    }
  }
}

export function getTotemStatus() {
  const bus = getBus();
  const esp32Online =
    bus.lastEsp32SeenAt !== null &&
    Date.now() - new Date(bus.lastEsp32SeenAt).getTime() < 60_000;

  return {
    connectedScreens: bus.listeners.size,
    esp32Online,
    screenOn: bus.screenOn,
    lastEsp32SeenAt: bus.lastEsp32SeenAt,
    lastDeviceId: bus.lastDeviceId,
    recentEvents: bus.recentEvents,
  };
}
