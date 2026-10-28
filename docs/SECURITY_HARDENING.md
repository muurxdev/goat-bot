# GOATBOT — Security Hardening & Hygiene Guide

Documentação das políticas de isolamento, segurança de credenciais, auditoria de repositório e proteção em produção.

---

## 1. Regras de Isolamento & Exclusão

### 1.1. Arquivos Confidenciais Protegidos (.gitignore e .dockerignore)
- **Credenciais do WhatsApp:** `sessao/`, `auth_info_baileys/`, `*.json.bak`
- **Variáveis de Ambiente:** `.env`, `.env.local`
- **Banco de Dados SQLite & WAL:** `data/*.sqlite`, `data/*.sqlite-wal`, `data/*.sqlite-shm`, `tests/test_db.sqlite`
- **Snapshots de Backup:** `backups/`
- **Arquivos Temporários:** `temp/`, `logs/`, `*.log`

---

## 2. Permissões de Scripts Operacionais

Todos os scripts em `scripts/` possuem bit de execução (`chmod +x`):
- `scripts/deploy.sh` (Script de automação de build, migração e restart)
- `scripts/healthcheck.js` (Healthcheck para Docker e VPS)
- `scripts/seed.js` (Seeder para testes sintéticos)
- `scripts/dev-cli.js` (Interface de terminal para diagnósticos)

---

## 3. Limpeza de Código Morto e Arquivos Órfãos

- Remoção de arquivos legados, lixo e snapshots antigos do repositório.
- Isolamento de erros com try/catch em todos os handlers e serviços centrais.

