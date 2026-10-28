# GOATBOT — Backup & Disaster Recovery System

Documentação técnica do mecanismo de hot snapshots atômicos do SQLite com metadados operacionais, rotação e restauração de desastres.

---

## 1. Arquitetura do Backup Service (`src/services/backupService.js`)

```text
Backup & Recovery Engine
├── 📦 Hot Snapshot Atômico (VACUUM INTO 'backups/meliodas_backup_<ts>.sqlite')
├── 📄 Metadados JSON (.meta.json com contagem de usuários, agendamentos e timestamp)
├── 🔄 Rotação Automática (mantém os últimos 7 snapshots, excluindo os mais antigos)
├── 🛡️ Restauração Segura com Snapshot Pré-Restore Automático
└── 👑 Comandos de Gestão pelo Dono:
    • .backup — Cria e envia snapshot consistente via WhatsApp
    • .backuplist — Lista snapshots disponíveis com tamanho e data
    • .backuprestore <arquivo> — Restaura a base com proteção pré-restore
```

---

## 2. Exemplos de Comandos

| Comando | Descrição | Permissão |
| :--- | :--- | :--- |
| `.backup` | Gera snapshot atômico e envia o `.sqlite` para o Dono | `OWNER` |
| `.backuplist` | Lista os últimos backups no servidor com tamanho e usuários | `OWNER` |
| `.backuprestore meliodas_backup_1788125785193.sqlite` | Restaura a base para o snapshot especificado | `OWNER` |

