# GOATBOT — Bot Lifecycle Scheduler

Documentação técnica e manual operacional do sistema de agendamento e gerenciamento do ciclo de vida do bot.

---

## 1. Visão Geral

O **Bot Lifecycle Scheduler** é o subsistema responsável por controlar os períodos de atividade, fechamento e reabertura do bot de forma 100% persistente no **SQLite**, garantindo que reinicializações da VPS, containers Docker ou processos gerenciados pelo PM2 não percam o estado programado.

### Estados Operacionais do Bot
```text
┌──────────────────┬────────────────────────────────────────────────────────┐
│ Estado           │ Significado                                            │
├──────────────────┼────────────────────────────────────────────────────────┤
│ ONLINE           │ Bot totalmente ativo e respondendo a todos os comandos │
│ SCHEDULED_CLOSE  │ Bot ativo, com encerramento programado para horário    │
│ CLOSING          │ Processo de finalização de conexões e gravação segura  │
│ OFFLINE          │ Bot fechado para comandos públicos (apenas ADMIN/DONO) │
│ SCHEDULED_OPEN   │ Bot fechado, aguardando horário de reabertura          │
│ STARTING         │ Inicializando sockets, migrations e carregando módulos │
│ MAINTENANCE      │ Modo de manutenção exclusivo do Dono                   │
└──────────────────┴────────────────────────────────────────────────────────┘
```

---

## 2. Persistência em Banco de Dados (`004_bot_lifecycle_schedules`)

Os agendamentos são gravados nas seguintes tabelas SQLite:

### `bot_schedules`
- `id`: Identificador único do agendamento (ex: `sched_1788124289477`).
- `action`: Ação principal (`CLOSE`, `OPEN`, `CYCLE`).
- `execute_at`: Timestamp UNIX em milissegundos para a execução da ação.
- `reopen_at`: Timestamp UNIX em milissegundos para reabertura automática (opcional).
- `mode`: Modo de operação (`DURATION`, `TIME`, `CYCLE`, `INDEFINITE`).
- `status`: Status do registro (`PENDING`, `EXECUTING`, `COMPLETED`, `CANCELLED`).
- `created_by`: JID do usuário que solicitou o agendamento.
- `created_at` / `updated_at`: Timestamps de auditoria.

### `bot_state`
- `key`: Chave de estado (ex: `operational_state`).
- `value`: Valor do estado atual (`ONLINE`, `OFFLINE`, etc).

---

## 3. Comandos Disponíveis (Exclusivos para `OWNER` e `BOT_ADMIN`)

| Comando | Descrição | Exemplo de Uso |
| :--- | :--- | :--- |
| `.botclose <duração>` | Fecha o bot e reabre após o período informado | `.botclose 30m` / `.botclose 2h` / `.botclose 1d` |
| `.botclose <HH:MM>` | Agenda o fechamento do bot para um horário específico | `.botclose 23:00` |
| `.botclose <HH:MM> <HH:MM>` | Agenda fechamento e reabertura | `.botclose 23:00 07:00` |
| `.botclose indefinite` | Fecha o bot sem previsão de retorno (até `.botopen`) | `.botclose indefinite` |
| `.botclose now` | Encerramento imediato do processo com confirmação | `.botclose now` → `.botclose confirm` |
| `.botopen` | Reabre o bot imediatamente e cancela fechamentos | `.botopen` |
| `.botopen <HH:MM>` | Agenda a reabertura para um horário específico | `.botopen 07:00` |
| `.botschedule` | Exibe o painel de status do agendamento e tempo restante | `.botschedule` |
| `.botcancel` | Cancela agendamentos futuros programados | `.botcancel` |

---

## 4. Recuperação de Falhas e Reinicialização da VPS (Crash Recovery)

Ao reiniciar o bot ou servidor VPS, o método `initScheduler()` em [`src/services/botScheduler.js`](file:///home/goatizx/Downloads/GOATbotxp/src/services/botScheduler.js):
1. Consulta a tabela `bot_schedules` em busca de registros com status `PENDING` ou `EXECUTING`.
2. Compara o timestamp atual `Date.now()` com `execute_at` e `reopen_at`.
3. Se a hora atual estiver dentro do intervalo `execute_at <= now < reopen_at`, o estado é restaurado para **`OFFLINE`** e o timer de reabertura é rearmado automaticamente para o tempo restante (`reopen_at - now`).
4. Se o horário de reabertura já tiver expirado (`now >= reopen_at`), o agendamento é finalizado como `COMPLETED` e o estado é normalizado para **`ONLINE`**.

---

## 5. Integração com Timezone e PM2

- **Fuso Horário:** Configurável via variável de ambiente `BOT_TIMEZONE` no `.env` (Padrão: `America/Sao_Paulo`).
- **PM2:** O comando `.botclose now` chama `gracefulShutdown()`, liberando locks e fechando conexões com SQLite e WhatsApp de forma limpa.

