# GOATBOT — Live Progress Engine

Documentação da máquina de estados e do sistema de renderização visual de progresso em tempo real para downloads e processamento de mídia no WhatsApp.

---

## 1. Máquina de Estados Operacional

```text
  CREATED
     │
     ▼
 🔎 SEARCHING    (0% ──► 100%)
     │
     ▼
 🔍 ANALYZING    (0% ──► 100%)
     │
     ▼
 📋 QUEUED       (Fila de Concorrência #Posição)
     │
     ▼
 📥 DOWNLOADING  (0% ──► 100% | Velocidade | Tamanho | ETA)
     │
     ▼
 ⚙️ PROCESSING   (0% ──► 100% | Transcodificação FFmpeg)
     │
     ▼
 📤 UPLOADING    (0% ──► 100% | Buffer Baileys)
     │
     ▼
 ✅ COMPLETED    (Envio Concluído / Limpeza de Temp)
```

---

## 2. Layout Visual do Dashboard no WhatsApp

```text
╭━━━〔 🎵 PROCESSANDO MÍDIA 〕━━━┈⊷
┃ 🌐 Origem: YouTube
┃ 📌 Título: Linkin Park - Numb
┣━━━━━━━━━━━━━━━━━━━━━━━━━
┃ 🔎 Pesquisa       ██████████ 100%
┃ 🔍 Análise        ██████████ 100%
┃ 📋 Preparação     ██████████ 100%
┃ 📥 Download       ███████░░░  72%
┃   📦 38.2 MB / 52.8 MB | ⚡ 8.4 MB/s
┃ ⚙️ Processamento  ████░░░░░░  40%
┃ 📤 Upload         ████████░░  80%
╰━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
⏱️ ETA: 00:02 | ⌛ Decorrido: 00:05
_Para cancelar:_ `.cancel job_1788124827371_abc`
```

---

## 3. Controle de Taxa de Atualização (Anti-Flood Throttle)

Para evitar rate-limits e bloqueios temporários de edição de mensagem pelo WhatsApp Baileys:
- **Intervalo Mínimo:** `1800ms` (1.8s) entre mensagens `edit`.
- **Forced Updates:** Transições de estado crítico (`QUEUED`, `PROCESSING`, `UPLOADING`, `COMPLETED`, `CANCELLED`) forçam o envio imediato via `pushUpdate(true)`.

---

## 4. Cancelamento Ativo (`.cancel`)

Qualquer download em andamento pode ser interrompido a qualquer momento:
```text
.cancel <jobId>
```
Isso invoca `proc.kill('SIGTERM')` no `yt-dlp` ou `ffmpeg`, remove o subdiretório temporário `temp/media/<jobId>/` e transita a sessão visual para `CANCELLED`.

