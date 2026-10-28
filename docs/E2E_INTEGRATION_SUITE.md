# GOATBOT — End-to-End (E2E) Integration Test Suite

Documentação da suíte de validação integrada e cenários de estresse de ponta a ponta (`tests/e2e.test.js`).

---

## 1. Cobertura dos Fluxos Integrados

```text
E2E Test Suite (8 Fluxos Integrados de Ponta a Ponta)
├── 🏆 Fluxo 1: Economia & RPG (Menu -> Daily -> Perfil -> Hunt -> Ranking -> Curar)
├── 👑 Fluxo 2: Permissões & Owner (.up -> .down -> .trust -> .bandm -> .banstatus -> .sysinfo)
├── 👨‍💻 Fluxo 3: Dev Hub (.json -> .hash -> .b64 -> .jwt -> .uuid -> .regex -> .calc -> .timestamp)
├── 📥 Fluxo 4: Media Engine & Progress (SEARCH -> ANALYZE -> QUEUE -> DOWNLOAD -> PROCESS -> UPLOAD -> COMPLETE)
├── ⏰ Fluxo 5: Bot Lifecycle Scheduler (.botclose -> OFFLINE -> Intercepção -> .botschedule -> .botopen -> ONLINE)
├── 🛡️ Fluxo 6: Moderação & Anti-Link (.antilink on -> .warnings -> .antilink off)
├── 📚 Fluxo 7: Discovery & Dynamic Help (.help geral -> .help dev -> .help .json)
└── 🚫 Fluxo 8: Rate Limiting & Anti-Abuse (Burst Stress -> Suspensão Temporária -> Desbloqueio)
```

---

## 2. Execução Automatizada

```bash
# Executar todos os testes
npm test

# Executar apenas a suíte E2E
node tests/e2e.test.js
```

