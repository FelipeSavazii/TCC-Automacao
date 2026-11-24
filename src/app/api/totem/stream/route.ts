import { subscribeTotem, getTotemStatus } from '@/lib/totem-bus';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (eventName: string, data: unknown) => {
        const chunk = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(chunk));
      };

      // Initial connection event
      send('connected', {
        timestamp: new Date().toISOString(),
        status: getTotemStatus(),
      });

      const unsubscribe = subscribeTotem((eventName, payload) => {
        send(eventName, payload);
      });

      // Keep-alive heartbeat every 20 seconds so proxies/browsers keep stream open
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: keepalive ${Date.now()}\n\n`));
        } catch {
          clearInterval(keepAlive);
          unsubscribe();
        }
      }, 20_000);

      request.signal.addEventListener('abort', () => {
        clearInterval(keepAlive);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
