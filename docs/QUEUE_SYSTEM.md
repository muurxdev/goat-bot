# GOATBOT — Prioritized Job Queue System

Documentação do sistema de fila de downloads com concorrência controlada, prioridades por nível de usuário, watchdogs de timeout e prevenção de sobrecarga.

---

## 1. Níveis de Prioridade na Fila

A fila organiza e ordena os downloads pendentes antes da execução com base no cargo do remetente:

```text
┌─────────────────┬──────────┬────────────────────────────────────────────────────────┐
│ Nível           │ Peso     │ Cargos Elegíveis                                       │
├─────────────────┼──────────┼────────────────────────────────────────────────────────┤
│ PRIORITY_HIGH   │ 3 (Max)  │ OWNER (5), BOT_ADMIN (4)                               │
│ PRIORITY_MEDIUM │ 2 (Med)  │ GROUP_ADMIN (3), TRUSTED (2)                           │
│ PRIORITY_LOW    │ 1 (Norm) │ USER (1)                                               │
└─────────────────┴──────────┴────────────────────────────────────────────────────────┘
```

> **📌 Regra de Fila:**
> Jobs com prioridade maior sempre ultrapassam jobs de prioridade menor que estejam aguardando na fila.

---

## 2. Limites e Controle Anti-Gargalo

- **Concorrência Máxima Global:** 2 downloads simultâneos (configurável).
- **Limite por Usuário Comum (`USER`):** Máximo de 2 downloads ativos/enfileirados simultaneamente. Solicitações extras recebem erro `RATE_LIMITED`.
- **Watchdog de Timeout:** Cancela automaticamente jobs travados após 180 segundos (3 minutos).
- **Retentativas:** 1 retentativa automática em falhas transitórias de conexão de rede.

---

## 3. Comandos de Inspeção e Controle

- **`.queue`** (ou `.fila`): Exibe os slots em uso, jobs em execução com tempo ativo e lista de espera ordenada.
- **`.cancel <jobId>`**: Remove o job da fila ou encerra sua execução ativa e libera espaço imediatamente.

