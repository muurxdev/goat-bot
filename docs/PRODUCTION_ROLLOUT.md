# GOATBOT — Production Rollout & Go-Live Checklist

Documentação de lançamento em produção do GOATBOT v2.0 na VPS Hostinger.

---

## 1. Checklist Pré-Voo de Produção

- [x] **Banco de Dados SQLite:** WAL mode ativo, foreign keys habilitadas, migrations 001 a 004 aplicadas com sucesso.
- [x] **Baileys v7 Connection:** Autenticação multi-file em `sessao/`, auto-reconexão com backoff exponencial e reconexão silenciosa.
- [x] **Segurança & Permissões:** Hierarquia RBAC em 5 níveis (`OWNER: 5 > BOT_ADMIN: 4 > GROUP_ADMIN: 3 > TRUSTED: 2 > USER: 1`), proteção SSRF, sanitização de comandos, rate limit multi-janela e auto-blacklist.
- [x] **Media Engine & Queue:** 7 provedores multiplataforma, fila com 3 níveis de prioridade e Live Progress Dashboard.
- [x] **Bot Scheduler:** Agendamento persistente em banco, sobrevivendo a restarts e reinicializações de máquina.
- [x] **Dev Hub:** Ferramentas ativas de software (.json, .hash, .base64, .jwt, .uuid, .regex, .timestamp, .dns, .headers).
- [x] **Observabilidade:** Monitor de latência por comando, métricas operacionais e healthcheck.
- [x] **Backup & Recovery:** Hot snapshots via `VACUUM INTO` com metadados JSON e retenção configurada.
- [x] **Infraestrutura Docker & PM2:** Volumes mapeados, limites de memória em 512MB e non-root user.
- [x] **Qualidade:** 108 testes automatizados em 12 suítes com 100% de aprovação.

---

## 2. Instruções de Inicialização na VPS Hostinger

### Passo 1: Acesso SSH na Hostinger
Adicione a chave SSH pública gerada no painel da Hostinger:
```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKwxKk+cubEIN3ACN2V9XqVLWGUMa8lZpCwcPHMwpOoC goat-bot@hostinger
```

### Passo 2: Clonar ou Atualizar Repositório
```bash
git pull origin main
```

### Passo 3: Executar Deploy Automatizado
```bash
./scripts/deploy.sh
```

### Passo 4: Escanear o QR Code
```bash
pm2 logs goat-bot
# ou
docker compose logs -f goat-bot
```
Escaneie o QR code no seu aplicativo do WhatsApp (Aparelhos Conectados).

