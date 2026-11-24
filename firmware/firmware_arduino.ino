/*
 * =========================================================================
 * Life · Totem HTO — Firmware para Arduino Uno / Nano / Mega (100% USB)
 * Botões Físicos das Salas + Sensor de Presença PIR (Desliga/Liga Tela PC)
 * =========================================================================
 * Como usar:
 *   1) Grave este arquivo no Arduino Uno ou Nano pela Arduino IDE.
 *   2) Conecte o Arduino no computador do Totem via cabo USB.
 *   3) Abra o /totem no Google Chrome ou Microsoft Edge e clique em
 *      "Conectar USB" no rodapé da tela.
 *
 * Sensor de Presença (PIR HC-SR501):
 *   VCC -> 5V   |   GND -> GND   |   OUT -> D12
 *   - Envia "PIR_ON" / "PIR_OFF" quando o movimento mudar (LED verde/cinza)
 *   - Envia "SCREEN_OFF" após 15s sem movimento e "SCREEN_ON" ao detectar presença
 *
 * Ligação dos botões (sem resistor externo — usa INPUT_PULLUP):
 *   Um terminal do botão -> Pino digital (D2 a D11)   |   Outro terminal -> GND
 * =========================================================================
 */

#define USE_DIRECT_9_BUTTONS true

// ─── SENSOR DE PRESENÇA (PIR HC-SR501) ───
#define ENABLE_PRESENCE_SENSOR true
#define PIR_PIN                12
#define PIR_ACTIVE_HIGH        true
#define PIR_CONFIRM_MS         150UL     // Ignora micro-ruídos menores que 150ms
#define SCREEN_TIMEOUT_MS      15000UL   // 15s sem movimento -> desliga a tela do PC

struct ButtonConfig {
  uint8_t pin;
  const char* command;
  int lastReading;
  int stableState;
  unsigned long lastDebounceTime;
};

#if USE_DIRECT_9_BUTTONS
ButtonConfig buttons[] = {
  { 2,  "1",      HIGH, HIGH, 0 }, // D2  -> 1º Automação
  { 3,  "2",      HIGH, HIGH, 0 }, // D3  -> 2º Automação
  { 4,  "3",      HIGH, HIGH, 0 }, // D4  -> 3º Automação
  { 5,  "4",      HIGH, HIGH, 0 }, // D5  -> 1º Informática
  { 6,  "5",      HIGH, HIGH, 0 }, // D6  -> 2º Informática
  { 7,  "6",      HIGH, HIGH, 0 }, // D7  -> 3º Informática
  { 8,  "7",      HIGH, HIGH, 0 }, // D8  -> 1º Mecânica
  { 9,  "8",      HIGH, HIGH, 0 }, // D9  -> 2º Mecânica
  { 10, "9",      HIGH, HIGH, 0 }, // D10 -> 3º Mecânica
  { 11, "VOLTAR", HIGH, HIGH, 0 }, // D11 -> Botão Vermelho (Voltar)
};
#else
ButtonConfig buttons[] = {
  { 2, "AUTOMACAO",   HIGH, HIGH, 0 },
  { 3, "INFORMATICA", HIGH, HIGH, 0 },
  { 4, "MECANICA",    HIGH, HIGH, 0 },
  { 5, "ANO_1",       HIGH, HIGH, 0 },
  { 6, "ANO_2",       HIGH, HIGH, 0 },
  { 7, "ANO_3",       HIGH, HIGH, 0 },
  { 8, "VOLTAR",      HIGH, HIGH, 0 },
};
#endif

const size_t BUTTON_COUNT = sizeof(buttons) / sizeof(buttons[0]);
const unsigned long DEBOUNCE_MS = 45;

unsigned long lastActivityMs = 0;
unsigned long pirHighSinceMs = 0;
bool screenIsOn = true;
int lastPirState = -1; // -1 força envio do estado inicial real (PIR_ON ou PIR_OFF)
// 0 = AUTO (Sensor PIR), 1 = FORCE_ON, -1 = FORCE_OFF (vindo da Dashboard via USB)
int remoteMode = 0;
String serialRxBuffer = "";

void setScreenPower(bool on) {
  if (screenIsOn == on) return;
  screenIsOn = on;
  Serial.println(on ? "SCREEN_ON" : "SCREEN_OFF");
}

void handleSerialCommands() {
  while (Serial.available() > 0) {
    char c = (char)Serial.read();
    if (c == '\n' || c == '\r') {
      serialRxBuffer.trim();
      if (serialRxBuffer.length() > 0) {
        if (serialRxBuffer == "SCREEN_FORCE_OFF") {
          remoteMode = -1;
          setScreenPower(false);
        } else if (serialRxBuffer == "SCREEN_FORCE_ON") {
          remoteMode = 1;
          lastActivityMs = millis();
          setScreenPower(true);
        } else if (serialRxBuffer == "MODE_AUTO") {
          remoteMode = 0;
          lastActivityMs = millis();
          setScreenPower(true);
        }
      }
      serialRxBuffer = "";
    } else if (serialRxBuffer.length() < 32) {
      serialRxBuffer += c;
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(200);

  for (size_t i = 0; i < BUTTON_COUNT; i++) {
    pinMode(buttons[i].pin, INPUT_PULLUP);
  }

  if (ENABLE_PRESENCE_SENSOR) {
    pinMode(PIR_PIN, INPUT);
  }

  lastActivityMs = millis();
  Serial.println("SCREEN_ON");
}

void loop() {
  unsigned long now = millis();

  // 1) Escuta comandos vindos do /totem (Dashboard) via cabo USB
  handleSerialCommands();

  // 2) Leitura dos botões físicos com debounce
  for (size_t i = 0; i < BUTTON_COUNT; i++) {
    int reading = digitalRead(buttons[i].pin);
    if (reading != buttons[i].lastReading) {
      buttons[i].lastDebounceTime = now;
      buttons[i].lastReading = reading;
    }

    if ((now - buttons[i].lastDebounceTime) > DEBOUNCE_MS) {
      if (reading != buttons[i].stableState) {
        buttons[i].stableState = reading;
        if (buttons[i].stableState == LOW) {
          lastActivityMs = now;
          if (remoteMode == 0 && !screenIsOn) {
            setScreenPower(true);
          }
          if (remoteMode != -1) {
            Serial.println(buttons[i].command);
          }
        }
      }
    }
  }

  // 3) Sensor de presença PIR com filtro anti-ruído (envia PIR_ON/PIR_OFF só quando mudar)
  if (ENABLE_PRESENCE_SENSOR) {
    int pirVal = digitalRead(PIR_PIN);
    bool rawMotion = PIR_ACTIVE_HIGH ? (pirVal == HIGH) : (pirVal == LOW);

    bool motionDetected = false;
    if (rawMotion) {
      if (pirHighSinceMs == 0) pirHighSinceMs = now;
      if ((now - pirHighSinceMs) >= PIR_CONFIRM_MS) {
        motionDetected = true;
      }
    } else {
      pirHighSinceMs = 0;
    }

    int pirStateInt = motionDetected ? 1 : 0;
    if (pirStateInt != lastPirState) {
      lastPirState = pirStateInt;
      Serial.println(motionDetected ? "PIR_ON" : "PIR_OFF");
    }

    if (remoteMode == 0) {
      if (motionDetected) {
        lastActivityMs = now;
        if (!screenIsOn) {
          setScreenPower(true);
        }
      } else if (screenIsOn && (now - lastActivityMs >= SCREEN_TIMEOUT_MS)) {
        setScreenPower(false);
      }
    }
  }
}