# Totem HTO

> Hub de governança física e inteligência distribuída para instituições de ensino restritas ao uso de smartphones.

## 📌 O Problema
Com a proibição legal do uso de celulares em ambiente escolar, os alunos perdem o canal principal de informações em tempo real (cronogramas, salas, avisos críticos). A comunicação volta a ser analógica e ineficiente.

## 🚀 A Solução
Um totem de baixo custo construído com princípios de Engenharia Frugal. O sistema utiliza a carteirinha estudantil física (código de barras 1D) como chave de acesso para um terminal que exibe, em até 5 segundos, a situação letiva do aluno e gera logs de presença em formato `.csv` para os docentes, dispensando integrações burocráticas com sistemas federais.

## ⚙️ Stack Tecnológica
* **Front-end & Landing Page:** Next.js + TailwindCSS
* **Back-end & Lógica de Negócio:** Python (FastAPI/Flask - *a definir*)
* **Hardware (IoT):** ESP32 + Display TFT SPI + Leitor Óptico GM65

## 💻 Como Rodar o Front-end (Ambiente de Desenvolvimento)

1. Clone o repositório:
`git clone https://github.com/FelipeSavazii/TCC-Automacao.git`

2. Instale as dependências:
`npm install`

3. Inicie o servidor de desenvolvimento:
`npm run dev`

4. Acesse `http://localhost:3000` no seu navegador.

## 👥 Equipe Técnica
* **Felipe Savazi** - Lógica de Software (Back-end/Front-end)
* **Julia Moreira** - Arquitetura Eletrônica
* **Lara Moreira** - Estrutura Física / CAD
* **Laura Vitória** - Integração de Hardware
