# GOATBOT — Observability, Metrics & Health Monitoring

Documentação da camada de observabilidade, monitoramento de latência de comandos, métricas de host e integridade do banco de dados SQLite.

---

## 1. Arquitetura de Telemetria (`src/services/telemetryService.js`)

```text
Observability Engine
├── ⏱️ Command Latency Tracker (Avg, Min, Max por comando e global)
├── 📈 Throughput & Error Rate (% de sucesso, contadores de falha)
├── 🏆 Top Commands Ranked (Top 5 comandos mais executados)
├── 💾 SQLite Database Health (Integridade do arquivo e tamanho em KB)
├── 🧠 Host & Process Memory (RSS, Heap Used, Heap Total)
└── 🌐 Operational Diagnostics (.metrics e .health)
```

---

## 2. Comandos de Inspeção

### 2.1. `.health` / `.saude` / `.statusbot` (Acesso Geral)
Exibe a saúde dos componentes essenciais:

```text
🟢 HEALTHCHECK & INTEGRIDADE DO BOT

📌 Status Geral: `HEALTHY`
💾 SQLite Database: `OK` (48 KB)
🧠 Memória RSS: 65 MB / 512 MB (VPS)
📦 Heap Utilizado: 32 MB / 45 MB
⏱️ Uptime do Processo: 0h 15m 20s
⚡ Plataforma: Linux x64 (Node v26.7.0)
📊 Load Average: 0.12
```

---

### 2.2. `.metrics` / `.telemetria` (Acesso Admin/Owner)
Exibe estatísticas de latência e execução:

```text
📊 TELEMETRIA & MÉTRICAS OPERACIONAIS

⚡ Total de Execuções: 1420
✅ Sucessos: 1412
❌ Falhas: 8
📈 Taxa de Sucesso: 99.4%
⏱️ Latência Média Global: 24ms
🕒 Tempo de Rastreamento: 86400s
📂 Comandos Distintos Usados: 48

🏆 Top 5 Comandos Mais Populares:
1. `.play` — 320x (140ms méd, 2 erros)
2. `.perfil` — 210x (12ms méd, 0 erros)
3. `.daily` — 185x (10ms méd, 0 erros)
4. `.hunt` — 140x (18ms méd, 1 erros)
5. `.help` — 95x (8ms méd, 0 erros)
```

