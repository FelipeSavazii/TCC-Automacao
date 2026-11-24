/**
 * Life · Totem HTO — Mini-Agente de Controle do Monitor do Windows (Zero dependências)
 * ------------------------------------------------------------------------------------
 * Para que serve:
 *   Permite que a página /totem (mesmo hospedada na vercel.app!) desligue e ligue
 *   o monitor físico do computador Windows de verdade (DPMS / economia de energia)
 *   quando o sensor PIR no Arduino/ESP32 enviar SCREEN_OFF ou SCREEN_ON pela USB.
 *
 * Como rodar no computador do Totem:
 *   Dê dois cliques em "iniciar-agente-tela.bat" ou rode:
 *     node firmware/totem-screen-agent.mjs
 */

import http from 'node:http';
import { execFile } from 'node:child_process';

const PORT = 4567;
const HOST = '127.0.0.1';

function setWindowsMonitor(turnOn) {
  if (process.platform !== 'win32') {
    console.log(`[Agente] Simulação (${process.platform}): tela ${turnOn ? 'LIGADA' : 'DESLIGADA'}`);
    return Promise.resolve(true);
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
        if (err) {
          console.error('[Agente] Erro ao acionar monitor:', err.message);
          resolve(false);
        } else {
          console.log(`[Agente] Monitor Windows -> ${turnOn ? 'LIGADO' : 'DESLIGADO'}`);
          resolve(true);
        }
      }
    );
  });
}

function setCorsHeaders(req, res) {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
}

const server = http.createServer((req, res) => {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, service: 'life-totem-screen-agent' }));
    return;
  }

  if (req.method === 'POST' && req.url === '/power') {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', async () => {
      try {
        const body = JSON.parse(raw || '{}');
        const state = String(body.state || '').toUpperCase();
        if (state !== 'ON' && state !== 'OFF') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Use state: ON ou OFF' }));
          return;
        }
        const ok = await setWindowsMonitor(state === 'ON');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok, state }));
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'JSON inválido' }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(PORT, HOST, () => {
  console.log(`=========================================================`);
  console.log(` Life · Totem HTO — Agente de Monitor Windows ATIVO`);
  console.log(` Ouvindo em http://${HOST}:${PORT}/power`);
  console.log(` Pode deixar esta janela minimizada enquanto /totem roda.`);
  console.log(`=========================================================`);
});
