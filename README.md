<p align="center">
  <img src="assets/brand/goat-banner.svg" alt="GOAT — seu bot de WhatsApp" width="100%">
</p>

# GOAT

Bot de WhatsApp modular, com comandos de economia, RPG, mídia, utilidades, IA e administração de grupos. Roda em Node.js sobre a biblioteca Baileys, com banco SQLite local.

> Versão do pacote: `2.0.0` · Node.js **22.5 ou superior** (o banco usa o módulo `node:sqlite`).

---

## Sumário

1. [O que o bot faz](#o-que-o-bot-faz)
2. [Requisitos](#requisitos)
3. [Configuração (`.env`)](#configuração-env)
4. [Instalação e execução](#instalação-e-execução)
   - [a) Windows (PC)](#a-windows-pc)
   - [b) Linux e macOS](#b-linux-e-macos)
   - [c) Android com Termux](#c-android-com-termux)
   - [d) Desenvolvimento local](#d-desenvolvimento-local)
   - [e) VPS com Docker](#e-vps-com-docker)
5. [Login no WhatsApp](#login-no-whatsapp)
6. [Testes](#testes)
7. [Estrutura do projeto](#estrutura-do-projeto)
8. [Status de verificação](#status-de-verificação)

---

## O que o bot faz

- **Comandos por categoria** (`src/commands/<categoria>/`): administração de grupos, economia, RPG, mídia (download e conversão), texto, utilidades, IA, curiosidades e jogos.
- **Login obrigatório**: sem cadastro com `.login`, o bot não responde a comandos. Cada pessoa tem uma conta, válida em grupos e no privado.
- **Modo aluguel** (ligado por padrão): grupos sem plano ativo recebem um aviso no lugar dos comandos. Pode ser desligado no painel do dono.
- **Módulos ativáveis** por grupo, com comandos `.modulo` e `.cmd`.
- **Figurinhas e mídia**: vídeos, áudios e fotos são enviados com a ficha do arquivo (codec, resolução, origem).
- **Transcrição de áudio** com faster-whisper (serviço separado, opcional).
- **Cartões em imagem** gerados pelo serviço de cartões.

Os nomes exatos dos comandos ficam no menu do próprio bot (`.menu`).

## Requisitos

| Item | Versão / observação |
|------|---------------------|
| Node.js | **22.5 ou superior** (`node -v`) |
| npm | Vem com o Node.js |
| FFmpeg | Conversão e ficha de mídia (`ffmpeg -version`) |
| yt-dlp | Downloads de vídeo e áudio (`yt-dlp --version`) |
| Docker e Docker Compose | Só para a instalação em VPS |

As dependências do Node são instaladas com `npm install` (Baileys, sharp, sqlite e outras, listadas em `package.json`).

## Configuração (`.env`)

Copie o modelo e preencha apenas o que for usar:

```bash
cp .env.example .env        # Linux/macOS
copy .env.example .env      # Windows (cmd)
```

Variáveis principais (todas comentadas em `.env.example`):

| Variável | Para que serve |
|----------|----------------|
| `NODE_ENV` | `production` na VPS, `development` no PC |
| `BOT_PREFIX` | Prefixo dos comandos (padrão `.`) |
| `BOT_OWNER_ID` / `BOT_OWNER_IDS` | Número(s) do dono, no formato internacional sem `+` |
| `SESSION_NAME` | Nome da pasta de sessão do WhatsApp |
| `BOT_PAIRING_NUMBER` | Se preenchido, o login usa código de pareamento em vez de QR |
| `GDRIVE_*` | Integração opcional com o Google Drive |
| `MERCADO_PAGO_*` | Pagamentos opcionais |

**Nunca** envie o `.env`, a pasta `sessao/` ou a pasta `data/` para o repositório ou para terceiros. Eles contêm chaves e a sessão do WhatsApp.

## Instalação e execução

### a) Windows (PC)

Pelo PowerShell, na pasta do projeto:

```powershell
.\scripts\setup-windows.ps1
```

O script confere o Node (22.5 ou superior), instala as dependências, instala ffmpeg e yt-dlp pelo `winget` quando faltarem, cria o `.env` a partir do exemplo e roda a suíte de testes. Para só preparar o ambiente sem testes: `.\scripts\setup-windows.ps1 -SemTestes`.

Depois:

```powershell
npm start
```

Se o PowerShell bloquear scripts, rode uma vez `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

### b) Linux e macOS

```bash
# Node 22.5+ (exemplo com nvm)
nvm install 22 && nvm use 22

# Ferramentas externas
# Debian/Ubuntu:  sudo apt-get install -y ffmpeg python3-pip && pip install -U yt-dlp
# macOS (Homebrew): brew install ffmpeg yt-dlp

git clone <URL-DO-REPOSITORIO> goat && cd goat
npm install
cp .env.example .env        # e edite o necessário
npm start
```

Na primeira execução aparece o QR code no terminal (veja [Login no WhatsApp](#login-no-whatsapp)).

> Status: **não verificado** neste repositório. O caminho foi escrito a partir do `package.json` e do `Dockerfile`; teste antes de depender dele.

### c) Android com Termux

Use Termux apenas para teste ou uso pessoal leve. Pontos conhecidos:

- Node.js 22.5 ou superior precisa estar disponível no pacote do Termux (`pkg install nodejs`). Confira a versão com `node -v`; se for mais antiga, o bot não inicia.
- `sharp` (processamento de imagem) e `node:sqlite` dependem da arquitetura e da versão do Node. Podem falhar na instalação.
- ffmpeg e yt-dlp existem como pacotes (`pkg install ffmpeg`; `pip install yt-dlp`), mas a conversão de vídeo é pesada para celular.
- Manter o bot ativo depende de o Android não encerrar o Termux em segundo plano.

Passos (não verificados nesta versão):

```bash
pkg update && pkg install nodejs git ffmpeg python
pip install -U yt-dlp
git clone <URL-DO-REPOSITORIO> goat && cd goat
npm install
cp .env.example .env
npm start
```

Não há garantia de que todos os comandos de mídia funcionem no Termux. Prefira PC ou VPS para uso contínuo.

### d) Desenvolvimento local

```bash
npm install
cp .env.example .env         # ajuste NODE_ENV=development e o que precisar
npm start                    # sobe o bot e mostra o QR code
```

Comandos úteis:

| Comando | O que faz |
|---------|-----------|
| `npm start` | Inicia o bot (`src/index.js`) |
| `npm test` | Verificação de templates e suíte completa |
| `npm run cli` | Console de desenvolvimento |
| `npm run healthcheck` | Checagem de saúde do processo |

Os testes usam um banco separado (`data/database.test.sqlite`). Cada arquivo de teste precisa definir `NODE_ENV=test` na primeira linha; a suíte roda em `scripts/run-tests.js`.

### e) VPS com Docker

Os arquivos `docker-compose.yml` (produção), `docker-compose.lite.yml` (VPS de 1 núcleo) e `docker-compose.override.yml` (desenvolvimento) ficam na raiz. O serviço do bot se chama `goat-bot` e o container `goat_bot_xp`.

```bash
cp .env.example .env         # preencha com os valores reais, só na VPS
docker compose -f docker-compose.lite.yml up -d --build
docker compose -f docker-compose.lite.yml logs -f goat-bot
```

Pontos de atenção:

- O painel do QR (porta 3000) fica preso em `127.0.0.1`. Para ver o QR, use o acesso via SSH e o script `scripts/vps-qr.sh`, nunca abra a porta para a internet.
- **Primeira troca de nome de container**: se a VPS já roda com o nome antigo (nome de container da versão anterior), faça uma vez `docker compose down` antes de subir com o novo nome. Sem isso, o container antigo continua rodando com as mesmas credenciais e pode haver dois processos conectados.
- Os volumes são pastas montadas (`./data`, `./sessao`, `./backups`, `./logs`, `./temp`). Não os apague: são o estado do bot.
- Scripts de deploy e a pasta remota da VPS (caminho em `/var/www`, ainda com o nome original do projeto) foi mantida de propósito. Trocar esse caminho exige migrar a pasta na VPS.

> Status: **não verificado** neste repositório. Não subi os containers para validar estes passos.

## Login no WhatsApp

- Por padrão o bot imprime um **QR code** no terminal. No WhatsApp: *Aparelhos conectados → Conectar um aparelho*.
- Se `BOT_PAIRING_NUMBER` estiver preenchido (só dígitos, com DDI), o bot pede um **código de pareamento** para esse número.
- Depois do pareamento, a sessão fica em `sessao/` e não é pedida de novo, enquanto a pasta existir.
- Quem quer usar o bot precisa do cadastro: envie `.login` no grupo ou no privado.

## Testes

```bash
npm test
```

A suíte roda com banco de testes limpo. Para repetir do zero, apague `data/database.test.sqlite*` antes. Falhas que já existiam antes da rebranding estão listadas no relatório de auditoria, não no README.

## Estrutura do projeto

```
src/
  index.js             ponto de entrada
  commands/            comandos, uma pasta por categoria
  config/              configuração, menus e índice de comandos (commandIndex.json)
  core/                conexão com o WhatsApp, logger
  database/            SQLite (node:sqlite) e repositórios
  handlers/            despacho de mensagens e comandos
  services/            regras de negócio (economia, RPG, mídia, IA...)
  utils/               utilidades, incluindo a moldura das mensagens
assets/
  brand/               logo e banner do GOAT
  figurinhas/          figurinhas de eventos do grupo
scripts/               utilidades, geradores e scripts de VPS
tests/                 testes automatizados
```

O índice de comandos é gerado com `node scripts/generate_command_index.js`.

## Status de verificação

| Item | Situação |
|------|----------|
| Suíte de testes (`scripts/run-tests.js`) | Ver o relatório da última rodada |
| Instalação no Windows (`setup-windows.ps1`) | Não verificado nesta rodada |
| Linux e macOS | Não verificado |
| Termux (Android) | Não verificado |
| VPS com Docker | Não verificado nesta rodada |

---

Dúvidas sobre comandos: envie `.menu` no bot. Dúvidas sobre a instalação: abra uma issue no repositório.
