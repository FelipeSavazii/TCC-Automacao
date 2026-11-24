# Pinagem e Conexão — Life · Totem HTO (100% USB, sem relé)

Todos os botões usam **`INPUT_PULLUP`** interno — **não precisa de resistores externos**. Basta ligar um terminal de cada botão no pino abaixo e o outro terminal no **`GND`** comum.

## 1. Botões das Salas + Botão Vermelho Voltar

| Botão Físico | Sala no `/totem` | Comando Serial | Pino ESP32 | Pino Arduino Uno/Nano |
|---|---|---|---|---|
| Sala | 1º Automação | `1` | `GPIO 13` | `D2` |
| Sala | 2º Automação | `2` | `GPIO 14` | `D3` |
| Sala | 3º Automação | `3` | `GPIO 27` | `D4` |
| Sala | 1º Informática | `4` | `GPIO 26` | `D5` |
| Sala | 2º Informática | `5` | `GPIO 25` | `D6` |
| Sala | 3º Informática | `6` | `GPIO 33` | `D7` |
| Sala | 1º Mecânica | `7` | `GPIO 32` | `D8` |
| Sala | 2º Mecânica | `8` | `GPIO 19` | `D9` |
| Sala | 3º Mecânica | `9` | `GPIO 18` | `D10` |
| **Vermelho** | **Voltar** | `VOLTAR` | `GPIO 23` | `D11` |

---

## 2. Sensor de Presença PIR (HC-SR501)

| Pino do Sensor PIR | ESP32 | Arduino Uno / Nano |
|---|---|---|
| **VCC** *(alimentação)* | `VIN` (5V) | `5V` |
| **OUT** *(pino do meio)* | `GPIO 34` | `D12` |
| **GND** *(terra)* | `GND` | `GND` |

---

## 3. Como desligar/ligar o monitor do PC pela USB (inclusive na Vercel)

1. Conecte o Arduino ou ESP32 no computador do Totem via cabo USB.
2. No computador do Totem (Windows), dê dois cliques em **`firmware/iniciar-agente-tela.bat`** (pode deixar minimizado — ele escuta em `http://127.0.0.1:4567`).
3. Abra `https://seu-projeto.vercel.app/totem` (ou `http://localhost:3000/totem`) no Chrome/Edge e clique em **Conectar USB**.
4. **Pronto!** Sem nenhum relé:
   - Quando o sensor PIR ficar 15s sem movimento → o Arduino envia `SCREEN_OFF` pela USB → o `/totem` escurece a tela e aciona o agente local que **desliga o monitor do Windows de verdade (DPMS)**!
   - Quando alguém se aproxima (ou aperta um botão) → o Arduino envia `PIR_ON`/`SCREEN_ON` → o agente local **acorda o monitor do Windows na hora**!
   - Você também pode desligar/ligar a tela remotamente pela **Dashboard na Vercel**!
