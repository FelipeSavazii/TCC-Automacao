/*
 * =========================================================================
 * Life · Totem HTO — Firmware para ESP32 (USB Serial + Wi-Fi Opcional)
 * Botões Físicos das Salas + Sensor de Presença PIR (Desliga/Liga Tela PC)
 * =========================================================================
 * Como usar:
 *   1) Grave este arquivo no ESP32 (Arduino IDE: ESP32 Dev Module).
 *   2) Conecte via cabo USB no computador do Totem.
 *   3) Abra o /totem no Chrome/Edge e clique em "Conectar USB".
 *
 * Sensor de Presença (PIR HC-SR501):
 *   VCC -> VIN (5V)   |   GND -> GND   |   OUT -> GPIO 34
 *   - Envia "PIR_ON" / "PIR_OFF" quando o movimento mudar (LED verde/cinza)
 *   - Envia "SCREEN_OFF" após 15s sem movimento e "SCREEN_ON" ao detectar presença
 * =========================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>

#define USE_DIRECT_9_BUTTONS true

// ─── SENSOR DE PRESENÇA (PIR HC-SR501) ───
#define ENABLE_PRESENCE_SENSOR true
#define PIR_PIN                34
#define PIR_ACTIVE_HIGH        true
#define PIR_CONFIRM_MS         150UL     // Ignora micro-ruídos menores que 150ms
#define SCREEN_TIMEOUT_MS      15000UL   // 15s sem movimento -> desliga a tela do PC

// ─── WI-FI OPCIONAL (USB SERIAL FUNCIONA SEMPRE, INCLUSIVE NA VERCEL) ───
#define ENABLE_WIFI_POST       false
const char* WIFI_SSID     = "NOME_DA_REDE_WIFI";
const char* WIFI_PASSWORD = "SENHA_DO_WIFI";
const char* SERVER_URL    = "http://192.168.1.50:3000/api/totem/input";
const char* DEVICE_ID     = "esp32-totem-01";
const char* TOTEM_API_KEY = "";

struct ButtonConfig {
  uint8_t pin;
  const char* command;
  int lastReading;
  int stableState;
  unsigned long lastDebounceTime;
};

#if USE_DIRECT_9_BUTTONS
ButtonConfig buttons[] = {
  { 13, "1",      HIGH, HIGH, 0 }, // 1º Automação
  { 14, "2",      HIGH, HIGH, 0 }, // 2º Automação
  { 27, "3",      HIGH, HIGH, 0 }, // 3º Automação
  { 26, "4",      HIGH, HIGH, 0 }, // 1º Informática
  { 25, "5",      HIGH, HIGH, 0 }, // 2º Informática
  { 33, "6",      HIGH, HIGH, 0 }, // 3º Informática
  { 32, "7",      HIGH, HIGH, 0 }, // 1º Mecânica
  { 19, "8",      HIGH, HIGH, 0 }, // 2º Mecânica
  { 18, "9",      HIGH, HIGH, 0 }, // 3º Mecânica
  { 23, "VOLTAR", HIGH, HIGH, 0 }, // Botão Vermelho -> Voltar
};
#else
ButtonConfig buttons[] = {
  { 13, "AUTOMACAO",   HIGH, HIGH, 0 },
  { 14, "INFORMATICA", HIGH, HIGH, 0 },
  { 27, "MECANICA",    HIGH, HIGH, 0 },
  { 26, "ANO_1",       HIGH, HIGH, 0 },
  { 25, "ANO_2",       HIGH, HIGH, 0 },
  { 33, "ANO_3",       HIGH, HIGH, 0 },
  { 32, "VOLTAR",      HIGH, HIGH, 0 },
};
#endif

const size_t BUTTON_COUNT = sizeof(buttons) / sizeof(buttons[0]);
const unsigned long DEBOUNCE_MS = 45;
const unsigned long HEARTBEAT_MS = 30000;

unsigned long lastHeartbeat = 0;
unsigned long lastActivityMs = 0;
unsigned long pirHighSinceMs = 0;
bool screenIsOn = true;
int lastPirState = -1; // -1 força envio do estado inicial real (PIR_ON ou PIR_OFF)
// 0 = AUTO (Sensor PIR), 1 = FORCE_ON, -1 = FORCE_OFF
int remoteMode = 0;
String serialRxBuffer = "";

void sendHttpPost(const String& jsonPayload) {
  if (!ENABLE_WIFI_POST || WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(SERVER_URL);
  http.setTimeout(1500);
  http.addHeader("Content-Type", "application/json");
  if (strlen(TOTEM_API_KEY) > 0) {
    http.addHeader("x-totem-key", TOTEM_API_KEY);
  }
  http.POST(jsonPayload);
  http.end();
}

void setScreenPower(bool on) {
  if (screenIsOn == on) return;
  screenIsOn = on;

  Serial.println(on ? "SCREEN_ON" : "SCREEN_OFF");

  if (ENABLE_WIFI_POST) {
    String payload =
      String("{\"type\":\"presence\",\"present\":") + (on ? "true" : "false") +
      ",\"deviceId\":\"" + DEVICE_ID + "\"}";
    sendHttpPost(payload);
  }
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

void onButtonPressed(const char* cmd) {
  lastActivityMs = millis();
  if (remoteMode == 0 && !screenIsOn) {
    setScreenPower(true);
  }
  if (remoteMode == -1) return;

  Serial.println(cmd);

  if (ENABLE_WIFI_POST) {
    String payload =
      String("{\"button\":\"") + cmd +
      "\",\"deviceId\":\"" + DEVICE_ID +
      "\",\"source\":\"esp32\"}";
    sendHttpPost(payload);
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

  if (ENABLE_WIFI_POST) {
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    unsigned long start = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - start < 10000) {
      delay(250);
    }
    if (WiFi.status() == WL_CONNECTED) {
      String hb = String("{\"type\":\"heartbeat\",\"deviceId\":\"") + DEVICE_ID + "\"}";
      sendHttpPost(hb);
      lastHeartbeat = millis();
    }
  }
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
          onButtonPressed(buttons[i].command);
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

  // 4) Heartbeat Wi-Fi
  if (ENABLE_WIFI_POST && WiFi.status() == WL_CONNECTED && (now - lastHeartbeat > HEARTBEAT_MS)) {
    lastHeartbeat = now;
    String hb = String("{\"type\":\"heartbeat\",\"deviceId\":\"") + DEVICE_ID + "\"}";
    sendHttpPost(hb);
  }
}
