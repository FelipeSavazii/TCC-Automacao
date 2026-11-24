# Life · Totem HTO

> Mural físico interativo de avisos escolares em tempo real para instituições de ensino com restrição ao uso de smartphones — desenvolvido como TCC de **Automação Industrial** no **IFSP Hortolândia**.

---

## 📌 O Problema

Com a proibição legal do uso de celulares em ambiente escolar, os alunos perdem o principal canal de consulta rápida a avisos urgentes, trocas de sala, datas de provas, horários e comunicados institucionais.

## 🚀 A Solução

O **Life · Totem HTO** integra uma **Dashboard Web** (com controle de acesso por prontuário **HT**) a uma **tela de quiosque (`/totem`)** instalada no corredor da escola e controlada por **botões físicos dedicados para cada turma**, um **botão vermelho Voltar** e um **sensor de presença PIR (HC-SR501)** conectado via USB para economia automática de energia.

---

## ✨ Principais Funcionalidades

### 🔐 Autenticação por HT & Primeiro Acesso (`/login`)
- Fluxo de login em **2 etapas** que aceita prontuário **HT** (ou e-mail do administrador).
- Detecção automática de **primeiro acesso** para usuários pré-cadastrados sem senha, permitindo que cada pessoa crie sua própria senha no primeiro login.
- Senhas protegidas com hash `scrypt` e sessões em cookies `HttpOnly` assinados com HMAC-SHA256, protegidas via `src/proxy.ts` (Next.js 16).

### 📋 Gestão de Usuários & Importação de Planilhas (`/dashboard`)
- **Importação inteligente (`.xlsx`, `.csv` e `.tsv`):** parser nativo sem dependências externas que identifica automaticamente as colunas de **Nome**, **HT**, **Cargo** e **Turma**, exibindo uma tela de confirmação antes de cadastrar os usuários em lote para primeiro acesso.
- **Cadastro manual:** formulário individual ao lado do importador de planilhas.
- **Hierarquia de permissões (RBAC):**
  - **Administrador:** superusuário total da equipe do projeto.
  - **Professor / Técnico Administrativo (Superusuário):** publica avisos para qualquer turma ou geral, cadastra usuários, redefine senhas, remove professores/técnicos/representantes e pode promover outros superusuários.
  - **Professor / Técnico Administrativo:** publica e gerencia avisos para qualquer turma (ou `Geral / Campus`), cadastra novos usuários e gerencia representantes de classe.
  - **Representante de Classe:** vinculado a uma turma específica; publica, edita e remove avisos exclusivamente da sua própria turma.

### 🖥️ Tela do Totem / Quiosque (`/totem`)
- **Acesso discreto:** atalho de teclado `Ctrl + Shift + L` ou `Ctrl + Alt + T` a partir de qualquer página (ou acesso direto por `/totem`).
- **3 cursos × 3 anos:** **Automação**, **Informática** e **Mecânica** (`1º`, `2º` e `3º Ano`) + **botão vermelho Voltar**.
- **Atualização em tempo real:** sincronização automática a cada 10s diretamente do **MongoDB Atlas** (compatível com deploy serverless na Vercel) + suporte a **Server-Sent Events (SSE)**.
- **Conexão USB bidirecional (Web Serial API):** conecta Arduino Uno/Nano ou ESP32 diretamente pelo navegador Chrome/Edge, inclusive rodando em produção via HTTPS (`*.vercel.app`).

### 🌿 Economia de Energia com Sensor de Presença (Sem Relé)
- **Sensor PIR HC-SR501** conectado ao Arduino/ESP32 envia eventos `PIR_ON`, `PIR_OFF`, `SCREEN_ON` e `SCREEN_OFF` pela USB.
- **Indicador visual no `/totem`:** LED verde piscando quando há presença detectada e LED cinza com contagem regressiva de **15 segundos** antes de entrar em stand-by.
- **Controle de tela flexível:**
  - **100% navegador (zero programas extras):** escurece automaticamente a tela para `#000000` e acorda ao detectar presença ou pressionar qualquer botão.
  - **Desligamento real do monitor Windows (DPMS):** opcionalmente, rodando [`firmware/iniciar-agente-tela.bat`](firmware/iniciar-agente-tela.bat) no PC do totem, o `/totem` desliga e religa o sinal de vídeo do monitor físico de verdade via API do Windows.
- **Controle remoto pela Dashboard:** permite alternar o totem entre **Automático (Sensor PIR)**, **Forçar Ligado** e **Forçar Desligado** a partir de qualquer dispositivo.

---

## ⚙️ Stack Tecnológica

| Camada | Tecnologias |
|---|---|
| **Front-end & Back-end** | Next.js 16 (App Router) · React 19 · TypeScript · TailwindCSS v4 |
| **Banco de Dados** | MongoDB Atlas (driver oficial `mongodb`) |
| **Comunicação Hardware ↔ Web** | Web Serial API (USB) · HTTP POST + Server-Sent Events (SSE) |
| **Hardware (IoT)** | Arduino Uno/Nano ou ESP32 · Botões físicos (`INPUT_PULLUP`) · Sensor PIR HC-SR501 |
| **Automação de Monitor (Opcional)** | Node.js nativo + Windows DPMS (`firmware/totem-screen-agent.mjs`) |

---

## 🗂️ Estrutura do Projeto

```text
├── firmware/
│   ├── firmware_arduino.ino      # Firmware para Arduino Uno/Nano (botões + PIR via USB)
│   ├── firmware_esp32.ino        # Firmware para ESP32 (USB Serial + Wi-Fi HTTP opcional)
│   ├── totem-screen-agent.mjs    # Mini-agente Windows (DPMS) para desligar/ligar o monitor
│   ├── iniciar-agente-tela.bat   # Atalho de 1 clique para iniciar o agente no Windows
│   └── PINAGEM.md                # Tabela completa de pinos e ligações eletrônicas
├── src/
│   ├── app/
│   │   ├── page.tsx              # Página inicial institucional
│   │   ├── login/                # Login em 2 etapas (HT + 1º Acesso)
│   │   ├── dashboard/            # Painel de avisos, usuários, planilhas e controle do totem
│   │   ├── totem/                # Interface quiosque com Web Serial e modo stand-by
│   │   └── api/                  # Rotas REST (auth, users, import, avisos, totem)
│   ├── components/               # Atalho global para /totem
│   ├── lib/                      # MongoDB, RBAC, sessão, parser de planilhas, SSE
│   └── proxy.ts                  # Proteção de rotas Next.js 16
└── .env.example                  # Modelo de variáveis de ambiente
```

---

## 🔌 Hardware e Pinagem

Todos os botões físicos utilizam resistor interno **`INPUT_PULLUP`** (sem necessidade de resistores externos — basta ligar cada botão entre o pino correspondente e o `GND`).

Consulte o guia completo em **[`firmware/PINAGEM.md`](firmware/PINAGEM.md)** para a tabela de pinos do **Arduino Uno/Nano** e do **ESP32** (botões das 9 salas, botão vermelho Voltar e sensor PIR HC-SR501).

---

## 💻 Como Rodar Localmente

### Pré-requisitos
- **Node.js 20+**
- Uma instância do **MongoDB** (MongoDB Atlas ou local)

### Passo a passo

1. Clone o repositório e instale as dependências:
```bash
git clone https://github.com/FelipeSavazii/TCC-Automacao.git
cd TCC-Automacao
npm install
```

2. Crie o arquivo `.env.local` a partir do `.env.example`:
```bash
cp .env.example .env.local
```

Configure as variáveis obrigatórias:
```env
MONGODB_URI=mongodb+srv://<usuario>:<senha>@<cluster>.mongodb.net/life?retryWrites=true&w=majority
MONGODB_DB=life
SESSION_SECRET=sua-chave-secreta-longa-e-aleatoria
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse no navegador:
- **Página Inicial:** `http://localhost:3000`
- **Login / Dashboard:** `http://localhost:3000/login` e `http://localhost:3000/dashboard`
- **Tela do Totem (Quiosque):** `http://localhost:3000/totem` *(ou use `Ctrl + Shift + L` / `Ctrl + Alt + T`)*

> **Acesso administrativo inicial:** quando o banco `life` estiver vazio, o sistema cria automaticamente a conta raiz para o primeiro acesso à Dashboard (`admin@admin.com` / `123456`). Recomenda-se alterar a senha após o primeiro login.

---

## ☁️ Deploy na Vercel & Uso no Totem

1. Importe o repositório na **Vercel** e adicione as variáveis `MONGODB_URI`, `MONGODB_DB` e `SESSION_SECRET` em **Settings → Environment Variables**.
2. No computador do totem, abra `https://seu-projeto.vercel.app/totem` no **Google Chrome** ou **Microsoft Edge**, conecte o Arduino/ESP32 na porta USB e clique em **Conectar USB**.
3. *(Opcional — para apagar o monitor fisicamente via DPMS)*: execute `firmware/iniciar-agente-tela.bat` no Windows do totem. Para que inicie sozinho ao ligar o PC, coloque um atalho dele em `Win + R` → `shell:startup` e desative a suspensão automática do Windows nas opções de energia.

---

## 👥 Equipe

- **Felipe Savazi**
- **Julia Moreira**
- **Lara Moreira**
- **Laura Vitória**

*Curso Técnico em Automação Industrial Integrado ao Ensino Médio · IFSP Campus Hortolândia*
