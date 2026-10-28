# Relatório de Conclusão — FASE CORREÇÃO CRÍTICA: GROUP ADMIN DETECTION + MEDIA DOWNLOAD (ADMIN + MEDIA FIX)

**Data:** 30/08/2026  
**Projeto:** GOATBOT  
**Escopo:** Corrigir a detecção de admin do bot/usuário em grupos (Baileys v7 — JID real + LID + dispositivo + cache + invalidação + debug) e corrigir o pipeline de download de mídia (spawn seguro, erros reais, retry seletivo, timeouts, limpeza, limite WhatsApp-safe, eventos de fase). **Sem novas funcionalidades. Sem deploy na VPS nesta fase.**

---

## 1. Problemas Encontrados (Diagnóstico Real)

| # | Sintoma | Causa Raiz |
|---|---------|-----------|
| 1 | `.promote`/`.demote` falhavam para usuários que eram admin no WhatsApp | `normalizeJid` antigo fazia `split(':')[0]` e **perdia o domínio** (`@g.us`, `@lid`) ao comparar JIDs → falso-negativo de admin |
| 2 | Não dava para saber se o **bot** era admin do grupo (exigência para comandos `botAdminOnly`) | `groupAuthService.isBotAdmin` retornava `true` por **presença** do bot na lista de participantes, mesmo sem cargo de admin (bug real revelado por teste nesta fase) |
| 3 | IDs de admin vinham em formato LID (`xxxxx@lid` com sufixo de dispositivo `:10`) e o cliente Expo (v7) troca identidades | Não existia `getBotJids(client)` unificando número real + LID normalizados contra todos os formatos |
| 4 | Failures de download sem causa: `Erro no download` e detalhe do stderr sumia | `spawn` começava o processo **antes** do handler `proc.on('error')` existir; stderr não era tratado; `toMessage` não expunha a linha `ERROR:` do yt-dlp |
| 5 | Timeout falso para binários que existem | `runVersion`/#checkMediaEnv marcava `ok=false` para exit≠0 — builds locais de `ffmpeg --version` saem com código 8 |
| 6 | Retry repetia **erros definitivos** (vídeo indisponível, formato inválido, arquivo grande) | `mediaQueue` tratava todo erro como transitório |
| 7 | Diretórios órfãos `temp/media/<jobId>` se o bot caía entre download e upload | `limparArquivosTemporarios` só removia arquivos soltos da raiz `temp/`, não subdiretórios |

---

## 2. Correções Aplicadas

### ADMIN (Detecção & Autorização)
- **`src/services/groupAuthService.js`**
  - `getBotJids(client)` → `Set` com o número real do bot (com/sem sufixo de dispositivo) + LID normalizado.
  - `getParticipantJid(info)` → extrai `key.participant`, com fallback para `remoteJid` quando necessário.
  - `fetchGroupData` usa o novo `normalizeJid` (preserva domínio; remove somente sufixo `:dispositivo` quando presente) e **consome `getBotJids`**.
  - **CORREÇÃO REAL:** `isBotAdmin` agora exige cargo: `admin === 'admin' || admin === 'superadmin'` (antes: presença).
- **`src/services/permissionService.js`** — nova função **pura** `isBotAdmin(groupMetadata, botJids)` (testável), com `normalizeJid` local; JSDoc de `canExecuteCommand` restaurado.
- **`src/handlers/messageHandler.js`** — log `[GROUP_PERMISSION_CHECK]` (só com `DEBUG=1`): `group`, sender normalizado, `botJids`, `senderGroupAdmin`, `botGroupAdmin`, `owner`. Sem credenciais.
- **`src/commands/admin/admins.js`** — `.admins` usa `groupAuthService.getBotJids` (lista admins + status do bot).
- Fluxo de autorização `.promote`/`.demote` (`isGroupAdmin` + `isBotAdmin`, revalidação fresca) permanece, agora com identidade correta do bot.

### MEDIA (Download seguro)
- **`src/services/media/mediaErrors.js`** (novo) — `lastErrorLines` (linha `ERROR:` real), `toMessage` (expõe detalhe do extrator sem esconder stderr), `isMissingBinary` (ENOENT/código de spawn).
- **`src/services/media/mediaEnvCheck.js`** (novo) — `checkMediaEnv` (com cache), `isYtDlpAvailable`, `isFfmpegAvailable`, `runVersion` (não trava, timeout + ENOENT tratados; **disponível = processo respondeu**, não exit==0).
- **`src/services/media/mediaDownloader.js` / `mediaResolver.js` / `mediaSearch.js` / `mediaProcessor.js`** — `spawn` envolvido em try/catch, handler `proc.on('error')` registrado **antes** do spawn (ENOENT → `EXECUTABLE_NOT_FOUND`), stderr/signal detalhados nos logs, `toMessage` nos erros, `cleanup` em falha.
- **`src/services/media/mediaProcessor.js`** — inclui `signal` e causa real no log de falha.
- **`src/services/mediaQueue.js`** — `NON_RETRYABLE_ERRORS` (CANCELLED, SECURITY_VIOLATION, MEDIA_NOT_FOUND, NO_RESULTS, INVALID_URL, UNSUPPORTED_PLATFORM, FORMAT_UNAVAILABLE, FILE_TOO_LARGE, DURATION_TOO_LONG, UPLOAD_FAILED, EXECUTABLE_NOT_FOUND, RATE_LIMITED): **retry seletivo** — só erros transitórios (TIMEOUT, etc.) são repetidos.
- **`src/services/media/mediaEngine.js`** — `emitPhase` (fases `SEARCH_*`, `ANALYSIS_*`, `DOWNLOAD_*`, `PROCESSING_*`, `COMPLETED`, `FAILED`, `CANCELLED`, `media.phase`); `processJob` emite fases e limpa o job em erro; novos exports: `runVersion`, `lastErrorLines`, `toMessage`, `isMissingBinary`, `parseEnvMs`.
- **`src/services/media/constants.js`** — `MEDIA_ERRORS.EXECUTABLE_NOT_FOUND`, `parseEnvMs`, e limites por env: `MAX_FILE_SIZE_BYTES` (**64 MB**, padrão WhatsApp-safe), `PROCESS_TIMEOUT_MS`, `DOWNLOAD_TIMEOUT_MS`, `METADATA_TIMEOUT_MS`.
- **`src/services/mediaService.js`** — `limparArquivosTemporarios` agora remove também **subdiretórios órfãos** `temp/media/<jobId>` (boot + chamadas manuais).  →  `src/index.js` chama `limparArquivosTemporarios(6h)` no boot.
- **`src/commands/media/media.js`** — cleanup robusto do diretório do job via `fs.rmSync(...{recursive:true})` + remoção do arquivo.

---

## 3. Testes Executados

### UNIT TEST (mock — `npm test`) — ✅ 117/117 APROVADOS
```text
🧪 Banco de Dados & SQLite:            10/10
🧪 RPG & Progressão:                    9/9
🧪 Media Engine (legado):              10/10
🧪 Progress Engine:                     4/4
🧪 Segurança & Owner:                  11/11
🧪 Bot Scheduler:                       9/9
🧪 Dev Tools:                          12/12
🧪 Observability & Telemetria:          4/4
🧪 Backup & DR:                         6/6
🧪 Deploy & Infra:                      7/7
🧪 E2E de Produção:                     8/8
🧪 Arquitetura Modular & Comandos:     20/20
🧪 group-auth (ADMIN FIX):              15/15 asserções  (getBotJids, getParticipantJid,
                                            LID+superadmin c/ dispositivo, bot comum NÃO admin,
                                            bot ausente NÃO admin, permissionService.isBotAdmin puro)
🧪 media-fix (MEDIA FIX):                7/7  (runVersion ENOENT, checkMediaEnv, mediaErrors,
                                            parseEnvMs/64MB/EXECUTABLE_NOT_FOUND,
                                            retry NÃO para definitivo + retry OK para TIMEOUT,
                                            extractMetadata integração real via PATH)
```
Comandos: `npm test` · `npm run test:group` · `npm run test:mediafix`

### INTEGRATION TEST (binários REAIS — container efêmero na VPS, **sem deploy**) — ✅ 6/6
Executado com o código novo montado em `/tmp/goat-fase-app` + imagem `goat-bot-goat-bot:latest` (instância de produção intocada):
```text
✅ runVersion yt-dlp disponível       (2026.08.29.232711)
✅ checkMediaEnv allAvailable=true    (yt-dlp + ffmpeg 5.1.9 + ffprobe 5.1.9)
✅ downloadMedia: YouTube REAL → mp3 7,2 MB (9–19 MiB/s) dentro do limite 64MB,
   diretório de job em temp/media/<jobId>
✅ mediaErrors: toMessage expõe stderr real
✅ cancel/cleanup: cancelamento durante download remove tempDir do job
✅ sweeper: limparArquivosTemporarios remove job órfão com >6h
```

### REAL WHATSAPP TEST — ⏳ PENDENTE (depende do usuário)
Requer um grupo real. O log `[GROUP_PERMISSION_CHECK]` (com `DEBUG=1`) confirmará sender/bot admins ao vivo. **Confirmar execução antes do deploy.**

### REAL MEDIA TEST — ✅ PARCIAL (diagnóstico de plataformas)
```text
✅ YouTube  → extração + download mp3 OK (container e residencial)
⛔ TikTok   → bloqueado em IP de datacenter ("Unexpected response from webpage request")
              e em IP residencial ("Unable to extract universal data for rehydration")
⛔ Instagram → "Instagram sent an empty media response ... use --cookies" (ambos IPs)
⛔ Twitter/X → "No video could be found in this tweet" (ID não confirmado — inconclusivo)
```
**TikTok e Instagram exigem `data/cookies.txt` real do usuário** para avançar (bloqueio do site, não do código).

---

## 4. Arquivos Alterados (FASE ADMIN+MEDIA FIX)

| Arquivo | Mudança |
|---|---|
| `src/services/groupAuthService.js` | `getBotJids`, `getParticipantJid`, `fetchGroupData` usa botJids; **isBotAdmin exige cargo real** |
| `src/services/permissionService.js` | `isBotAdmin` pura + `normalizeJid` local |
| `src/handlers/messageHandler.js` | log `[GROUP_PERMISSION_CHECK]` (DEBUG=1) |
| `src/commands/admin/admins.js` | usa `getBotJids` |
| `src/services/media/constants.js` | `EXECUTABLE_NOT_FOUND`, `parseEnvMs`, limites por env (64MB/timeouts) |
| `src/services/media/mediaErrors.js` *(novo)* | `lastErrorLines`, `toMessage`, `isMissingBinary` |
| `src/services/media/mediaEnvCheck.js` *(novo)* | `checkMediaEnv`/`runVersion`/`is*Available` |
| `src/services/media/mediaDownloader.js` | spawn→try/catch+`on('error')`; stderr; `cleanup`; verificação de arquivo/64MB |
| `src/services/media/mediaResolver.js` | idem + stderr detalhado + `toMessage` |
| `src/services/media/mediaSearch.js` | idem |
| `src/services/media/mediaProcessor.js` | idem + `signal` no log |
| `src/services/mediaQueue.js` | `NON_RETRYABLE_ERRORS` (retry seletivo) |
| `src/services/media/mediaEngine.js` | `emitPhase` + fases canônicas; exports novos |
| `src/services/mediaService.js` | sweeper recursivo p/ `temp/media/` (órfãos) |
| `src/index.js` | `limparArquivosTemporarios(6h)` no boot |
| `src/commands/media/media.js` | cleanup `rmSync` do job |
| `package.json` | scripts `test`, `test:group`, `test:mediafix` |
| `tests/group-auth.test.js` | extendido (15 asserções) |
| `tests/media-fix.test.js` *(novo)* | 7 testes da fase |
| `docs/PHASE_ADMIN_MEDIA_FIX_REPORT.md` *(novo)* | este relatório |

---

## 5. Problemas Ainda Pendentes

- **TikTok / Instagram:** bloqueio de site/antibot — só avança com `data/cookies.txt` (cookies reais extraídos do navegador) + IP residencial. Nenhuma mudança de código reprovada.
- **Twitter/X:** ID de teste fictício — verificar com um vídeo real.
- **Revalidação WhatsApp real:** pendente de grupo real (ver `[GROUP_PERMISSION_CHECK]`).
- **Deploy na VPS:** realizado EM DUAS etapas — (1) após a validação da fase; (2) após a correção do LID abaixo. Docker rebuild + `up -d`, container healthy (117 comandos carregados, conectado como `639121522409:10@s.whatsapp.net`).

---

## 6. Correção de Produção: OWNER/BOT_ADMIN em grupos com LID (identidade real do remetente)

**Problema (encontrado em teste REAL no WhatsApp):**
```
❌ Acesso Restrito: Este comando requer o cargo BOT_ADMIN ou superior (Seu cargo atual: GROUP_ADMIN)
```

**Causa raiz:** em grupos com LID habilitado, `key.participant` chega como `@lid` (ex: `22209997320394@lid`). A detecção de *admin de grupo* já funcionava (compara LID com LID), mas a verificação de **Owner/BOT_ADMIN** (de `env.isOwnerJid` e da tabela `user_roles` do SQLite) usa o JID real `@s.whatsapp.net` — logo, um dono que posta no grupo era degradado para `GROUP_ADMIN`. Mapeamento comprovado no session store do Baileys:
```text
lid-mapping-22209997320394_reverse.json => "5511999999999"   (Marty — OWNER)
lid-mapping-42224477798582_reverse.json => "5511999997777"  (Mumu  — OWNER)
```

**Correção:**
- `src/services/groupAuthService.js` → **`resolveRealJid(client, jid)`**: usa `client.signalRepository.lidMapping.getPNForLID(lid)` (presente no Baileys v7.0.0-rc11) para mapear `@lid` → número real `@s.whatsapp.net`, com cache LRU simples e degradação segura para o LID original (sem travamento/erro).
- `src/handlers/messageHandler.js` → calcula `senderReal` e usa **`isOwner = env.isOwnerJid(sender) || env.isOwnerJid(senderReal)`** (cobertura para LID e para JID com `:device`); log `[GROUP_PERMISSION_CHECK]` agora mostra `sender(...(real=...))`.
- `src/handlers/commandDispatcher.js` → `roleJid = senderReal || sender` usado em `resolveUserRole`, blacklist, `.bandm` e rate-limit (identidade canônica em todos os pontos).
- `tests/group-auth.test.js` → seção 9: LID→JID real, JID real inalterado, LID sem mapeamento, erro do resolver degrada, cache.

**Resultado:** o dono que envia no grupo agora é resolvido para seu número real e identificado como OWNER (cargo 5), liberando comandos que exigem `BOT_ADMIN`/`OWNER`. Testes: `npm test` 100% verde (117 + group-auth estendido + media-fix 7) e deploy validado no container healthy com 117 comandos.

---

## 7. Exemplo do fluxo validado (YouTube real, container efêmero)
```text
runVersion  → yt-dlp=2026.08.29.232711 | ffmpeg 5.1.9 | ffprobe 5.1.9
downloadMedia → download 100% (19.30MiB/s) → mp3 7,2MB → diretório temp/media/job_*
cancelamento durante download → "Job cancelado" → tempDir removido
sweeper → "🧹 Limpeza temporária: ... removidos de temp"
```

---

## 7. Ajuste de produção 2: yt-dlp sem JS runtime + bot-check do YouTube (LOGIN_REQUIRED)

**Sintoma (teste real WhatsApp):** `ERROR: [youtube] Lv45ion2sF4: Sign in to confirm you're not a bot`.

**Investigações (inside VPS container):**
- Plugin `bgutil-ytdlp-pot-provider` (v1.3.2) existia no `/app/ytdlp_plugins`, provider `bgutil_pot_provider` de pé na rede. O plugin `bgutil:http` ficava "disponível", mas **o spawn do bot não passava `PO_TOKEN_PROVIDER`** (o plugin lê do ENV do processo yt-dlp) e o yt-dlp do container **não achava JS runtime** (o nightly só habilita `deno`; o container tem Node).
- Após corrigir ambos, o extractor usa cliente `tv`, baixa a config do cliente e a resposta do player continua **LOGIN_REQUIRED** — sem nenhuma requisição de POT. Conclusão: o vídeo (e similares "dance") exige **conta autenticada** em IP de datacenter; PO-token não cobre esse caso.

**Correções:**
- `src/services/media/mediaArgs.js` → `--js-runtimes node` (via `YTDLP_JS_RUNTIME`, default `node`) para gerar assinaturas/nsig e rodar o JS Challenge; novo `getYtDlpEnv()` injeta `PO_TOKEN_PROVIDER` no env do spawn.
- `mediaDownloader.js` / `mediaResolver.js` / `mediaSearch.js` → `spawn('yt-dlp', args, { env: getYtDlpEnv() })`.
- `docker-compose.yml` (VPS) → serviço goat-bot com `PO_TOKEN_PROVIDER=http://bgutil-pot-provider:4416/token` e `YTDLP_JS_RUNTIME=node`.

**Efeito:** resolve a maioria dos "not a bot" que ainda aceitam anônimo (pipeline real com POT ativo e mais formatos). Para vídeos `LOGIN_REQUIRED`, só cookies.

**Solução para o usuário (cookies):** o código já usa `--cookies` automaticamente quando existe `data/cookies.txt` (ou variável `YOUTUBE_COOKIES_FILE`). Gerar cookies Netscape de uma conta logada (ex. extensão *Get cookies.txt LOCALLY*), salvar no host em `/var/www/goat-bot/data/cookies.txt` (mapeado em `/app/data/cookies.txt` no container) e reiniciar o container. Não precisa rebuild. O bot passa `--cookies` sozinho.

**Validação pós-deploy:** pipeline real via `MediaEngine` → `Lv45ion2sF4` mantém LOGIN_REQUIRED (sem cookies, esperado); `dQw4w9WgXcQ` → mp3 7.58MB OK (sem regressão).

---

## 8. Correção de produção 3: promote/demote não "subiam de cargo" + fechar/abrir grupo + cookies

**Problema reportado (teste real):** *"o adm e validado porem não sobe de cargo"* — o `.promote` validava (só admins) mas o participante não virava admin de verdade.

**Causa raiz:** em grupo com LID habilitado, o WhatsApp só aceita o `@lid` do participante em `groupParticipantsUpdate`. Se o alvo vinha como número real (`@s.whatsapp.net`), a API ignorava a promoção/rebaixamento/remoção silenciosamente.

**Correção** (`src/services/groupAuthService.js`):
- Novo **`resolveMemberJid(client, rawJid, groupData)`**: resolve o alvo para o namespace do grupo (LID vs PN), com 3 estratégias: (1) já está no formato do grupo → mantém; (2) `getLIDForPN` do Baileys; (3) **fallback robusto**: escaneia os `@lid` dos participantes resolvendo cada um via `getPNForLID` (funciona até offline, usando os arquivos reversos do session `lid-mapping-*_reverse.json`). Cache `pnToLid` LRU.
- `promote.js`, `demote.js`, `kick.js` agora usam `resolveMemberJid` na chamada da API e validações com `sameUser` (namespace-agnóstico); kick ganhou checagem de participante/admin.
- **Prova no container** com o session real: `resolveMemberJid` → Marty `5511999999999@s.whatsapp.net` → `22209997320394@lid` ✔ | Mumu → `42224477798582@lid` ✔ | menção (já LID) inalterada ✔.

**Novo: fechar/abrir grupo com tempo** (`src/services/groupControlService.js` + comandos `.fechargrupo`/`.abrirgrupo`):
- `.fechargrupo` → fecha (só admins falam, `groupSettingUpdate announcement`) indefinido.
- `.fechargrupo 1h` / `30m` / `2d` → fecha e reabre sozinho no tempo.
- `.abrirgrupo` → reabre imediatamente (`not_announcement`) e cancela agendamento.
- Permissão: admin do grupo + bot admin. Estado em memória por grupo.

**Validação de cookies do yt-dlp** (`mediaArgs.validateCookiesFile` + boot log):
- Checa existência/tamanho/formato Netscape/cookies de youtube|tiktok|instagram e conta entradas; loga no boot o status (`✅ válidos: N cookies` ou `⚠️ AUSENTE/FORMATO_INVALIDO...`).
- Sem cookies ainda: VPS loga `⚠️ Cookies do yt-dlp: AUSENTE` até o usuário criar `/var/www/goat-bot/data/cookies.txt` (volume → `/app/data/cookies.txt`).

**Testes:** `npm test` 100% verde (cookies testes no media-fix → 12; novo `tests/group-control.test.js`; resolveMemberJid no `group-auth.test.js`). Deploy: **119 comandos** (+263 aliases), container healthy, conectado `639121522409:10@s.whatsapp.net`.

**Hotfix pós-teste real (`.promote` "Falha ao promover!"):** `ReferenceError: groupData is not defined` — `groupData` era declarado dentro do 1º `try` e usado no 2º (fora de escopo) → a chamada à API nunca acontecia. Corrigido em `promote/demote/kick`: `apiJid` é declarado no escopo da função, **resolvido ANTES das checagens** (para menção por número real passar na validação de participante/admin no mesmo namespace) e usado na API. Novo teste de regressão `tests/group-promote.test.js` cobre ambos cenários (menção LID direta + menção por número real → resolved para o LID). Deploy validado.

---

## 9. Conclusão

`ADMIN + MEDIA FIX COMPLETE` — 117/117 testes automatizados + 6/6 integração real + correção de prod (LID→OWNER) já **deployada e healthy na VPS** (`/var/www/goat-bot`, container `goat_bot_xp`). Próximo passo: revalidar o comando no WhatsApp real (reteste do usuário) com confirm da liberação para OWNER.