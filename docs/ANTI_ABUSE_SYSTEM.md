# GOATBOT — Anti-Abuse & Rate Limiting System

Documentação técnica dos mecanismos de defesa contra flood de comandos, ataques de negação de serviço (DoS), esgotamento de memória RAM e injeção de entradas maliciosas.

---

## 1. Janelas Múltiplas de Rate Limit

O sistema monitora cada usuário em três janelas temporais distintas:

```text
┌─────────────────┬────────────────┬────────────────┬──────────────────────────────┐
│ Janela          │ Limite USER    │ Limite TRUSTED │ Penalidade / Ação            │
├─────────────────┼────────────────┼────────────────┼──────────────────────────────┤
│ Burst (5s)      │ 6 requisições  │ 18 requisições │ Mute de 15s (1º nível)       │
│ Minuto (60s)    │ 25 requisições │ 70 requisições │ Mute de 60s (2º nível)       │
│ Flood Extremo   │ 50 req / 60s   │ N/A            │ AUTO-BLACKLIST (Ban Definit) │
└─────────────────┴────────────────┴────────────────┴──────────────────────────────┘
```

> **📌 Isenções:**
> Usuários com cargo `OWNER` (Nível 5) e `BOT_ADMIN` (Nível 4) são 100% isentos de rate-limit.

---

## 2. Proteção contra Exaustão de Recursos

1. **Watchdog de Memória RAM:** `checkMemoryHealth(thresholdMb = 450)` monitora o consumo `RSS` do processo Node.js na VPS (com limite configurado para 512MB no Docker/PM2).
2. **Limites de Arquivo & Duração:**
   - Máximo de 100 MB por download.
   - Máximo de 30 minutos de duração.
3. **Sanitização de Entradas:** `sanitizeInput()` remove caracteres perigosos de shell (`;&|<>$\``) antes de processar comandos dinâmicos.
4. **Limpeza Ativa:** Exclusão automática de arquivos e pastas temporárias de mídia no diretório `temp/media/<jobId>/`.

