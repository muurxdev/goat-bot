# GOAT — estabilização, segurança e mídia (Plano 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deixar o GOAT estável e obediente ao dono, sem risco para o banco do RPG, com a ficha das mídias de volta, sem o módulo Divulgação e com as bibliotecas atualizadas pelo que a auditoria de segurança pede.

**Architecture:** Nada de reescrita. Cada tarefa é uma mudança pequena e testada sobre o código existente (`src/handlers/messageHandler.js`, `src/database/connection.js`, `src/commands/media/*`, `src/config/modules.js`). O banco de **produção fica na VPS** (`/var/www/goat-bot/data`, volume Docker); por isso a primeira tarefa é um backup consistente dele e o deploy só acontece no fim, com a pessoa presente.

**Tech Stack:** Node.js ≥ 22.5 (`node:sqlite`), Baileys 7.0.0-rc11, SQLite (WAL), Docker na VPS de 1 núcleo, testes em `tests/*.test.js` (um arquivo = um `node tests/x.test.js`), PowerShell/SSH para deploy.

**Spec:** não há spec separado. A origem é o pedido do dono em 2026-10-15 (transcrito abaixo) mais o levantamento feito no código nesta data.

## Pedido do dono (spec)

1. Filtrar os comandos, atualizar tudo e deixar 100 % estável. → **Plano 1** (estabilidade) e **Plano 2** (filtro, depende de decisão).
2. Obedecer aos comandos de dono — hoje recusa todas as respostas. → **Tarefas 3 e 5**.
3. Melhorar bibliotecas, segurança e velocidade. → **Tarefa 8** (segurança e bibliotecas); velocidade no **Plano 2**.
4. Downloads de mídia estão "crus": voltar com as informações de antes. → **Tarefa 6**.
5. Comandos entenderem melhor e responderem rápido. → **Plano 2**.
6. RPG aprimorado, **sem perder o banco que já existe**. → **Tarefas 1, 2 e 4** (proteção) e **Plano 2** (melhorias).
7. Remover os perfis de comando global, tipo módulo Divulgação. → **Tarefa 7**.

## Global Constraints

- Node.js `>=22.5.0`; `node:sqlite` (sem `better-sqlite3`).
- **Todo teste começa com `process.env.NODE_ENV = 'test'`** (usa `data/database.test.sqlite`; sem isso grava no banco real).
- **Nunca `catch (_) {}` vazio:** sempre `logger.warn`/`logger.error` com contexto.
- SQL de caminho quente: `q(sql)` de `src/database/connection.js`, nunca `getDatabase().prepare()` dentro de função.
- Persistência de usuário: `saveUser` usa `ON CONFLICT DO UPDATE`; para reduzir level/xp/mochila use `saveUser(user, { force: true })`.
- Downloads: **uma mídia por pedido**; qualidade sempre o máximo existente; plataforma decidida pelo **host** (`media/plataformas.js`); nunca `redirect: 'follow'` com URL de usuário (`urlSeguro`/`buscarComSeguranca`).
- `.sh` em LF (`.gitattributes`); `.ps1` com BOM; **não recriar `capaAudio.js`**.
- Commits em português, no formato `tipo(escopo): resumo`; **não** dar `git push` (o `origin` foi apagado do GitHub) — o deploy envia o commit empacotado.
- Banco: **só migrations aditivas**; nenhuma tarefa deste plano apaga linha, coluna ou tabela.
- Decisão do dono em 2026-09-21 ("login obrigatório, inclusive donos") passa a valer **só para não-donos** a partir da Tarefa 5 (o dono pediu a mudança em 2026-10-15). Registrar em `CLAUDE.md`.

## Review Focus

1. **Dono sem número resolvível:** mensagem de dono vinda como `@lid` sem `senderReal` → hoje `isOwner` pode dar `false` e o dono seria barrado mesmo com o bypass. Esperado: reconhecido (Tarefa 5, teste 3).
2. **Banco corrompido sem backup válido:** o bot **não** pode subir com banco vazio nem apagar o `-wal`. Esperado: para com erro claro e a cópia preservada (Tarefa 4, teste 2).
3. **Falha que não é corrupção** (disco cheio, arquivo travado, erro de migration) **não** pode mover o banco de lugar. Esperado: o erro sobe e o arquivo fica onde está (Tarefa 4, teste 3).
4. **Legenda da mídia maior que o limite do WhatsApp:** ficha longa (título enorme, vários campos) não pode estourar nem cortar o link da fonte. Esperado: ≤ 1000 caracteres, campos menos importantes caem primeiro (Tarefa 6).
5. **Quem digitar um comando de Divulgação depois da remoção:** responde "comando não encontrado" como qualquer outro; dados antigos (`divulgacao_*` em `profile_data`) continuam no banco (Tarefa 7).
6. **Atualização do Baileys invalida a sessão do WhatsApp:** pode exigir novo QR com a pessoa longe do PC. Esperado: só sobe com a pessoa ciente e com backup da pasta `sessao/` (Tarefas 8 e 9).

---

## Pré-requisitos que dependem do dono (antes da Tarefa 2)

- **Host e usuário da VPS** (ou o `Host vps` do `~/.ssh/config` do outro PC). Neste PC existem as chaves `~/.ssh/vps_key` e `~/.ssh/tese_curta_vps`, mas **não** há o alias `vps`.
- **Qual das duas chaves é a da VPS do GOAT** (a outra parece ser de outro projeto).
- **Confirmação de que pode precisar escanear o QR do WhatsApp de novo** (só para a Tarefa 8, atualização do Baileys). Sem isso a Tarefa 8 pula o Baileys.

---

### Task 1: Backup do repositório local (única cópia dos 77 commits)

**Files:**
- Create (fora do repo): `C:\Users\mrodr\Documents\backup-goat-bot-2026-10-15.bundle`
- Create (fora do repo): `C:\Users\mrodr\Documents\backup-goat-bot-2026-10-15-arquivos.zip`

**Interfaces:**
- Produces: dois arquivos de backup verificados. Nenhuma outra tarefa depende deles; a Tarefa 9 cita o caminho no plano de retorno.

- [ ] **Step 1: Criar o bundle com todas as branches**

```bash
cd /c/Users/mrodr/Documents/Projetos/GOATBOT
git bundle create /c/Users/mrodr/Documents/backup-goat-bot-2026-10-15.bundle --all
```

- [ ] **Step 2: Verificar**

Run: `git bundle verify /c/Users/mrodr/Documents/backup-goat-bot-2026-10-15.bundle`
Expected: `... is okay` e as três branches (`feat/reino-lore-e-familias`, `main`, `master`) listadas.

- [ ] **Step 3: Guardar o que o git não tem (ignorado pelo `.gitignore`): `data/`, `configs.json`, `cookies.txt`, `.env`, `sessao/`**

```powershell
Compress-Archive -Path .\data,.\configs.json,.\cookies.txt,.\.env,.\sessao -DestinationPath C:\Users\mrodr\Documents\backup-goat-bot-2026-10-15-arquivos.zip -ErrorAction Continue
```

Expected: o `.zip` existe e tem tamanho > 0. **Esse arquivo contém segredos: nunca subir para nuvem nem para GitHub.**

- [ ] **Step 4: Registrar**

Anotar no final deste arquivo, na seção "Registro de execução", os dois caminhos e o tamanho.

---

### Task 2: Acesso à VPS e backup consistente do banco de produção

**Files:**
- Create: `scripts/db-resumo.js`
- Modify: `C:\Users\mrodr\.ssh\config` (fora do repo; só acrescentar o bloco `Host vps`)

**Interfaces:**
- Consumes: host/usuário da VPS e a chave certa (pré-requisitos).
- Produces: `C:\Users\mrodr\Documents\backups-goat-vps\producao-2026-10-15.sqlite` (cópia consistente + conferida) e `scripts/db-resumo.js <arquivo>` que imprime `integrity_check` e a contagem de linhas por tabela. As Tarefas 4 e 9 usam os dois.

- [ ] **Step 1: Escrever `scripts/db-resumo.js`**

```js
// Uso: node scripts/db-resumo.js <arquivo.sqlite>
// Abre uma CÓPIA do banco (nunca o arquivo em uso), confere a integridade e conta as linhas de cada tabela.
const { DatabaseSync } = require('node:sqlite')

const caminho = process.argv[2]
if (!caminho) {
    console.error('uso: node scripts/db-resumo.js <arquivo.sqlite>')
    process.exit(2)
}

const db = new DatabaseSync(caminho)
const integ = db.prepare('PRAGMA integrity_check;').get()
const veredito = String(Object.values(integ)[0])
console.log(`integrity_check: ${veredito}`)

const tabelas = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    .all()

let total = 0
for (const { name } of tabelas) {
    const { n } = db.prepare(`SELECT COUNT(*) AS n FROM "${String(name).replace(/"/g, '""')}"`).get()
    total += Number(n)
    console.log(`${String(name).padEnd(40)} ${n}`)
}
console.log(`TOTAL de linhas: ${total} em ${tabelas.length} tabelas`)
db.close()
process.exit(veredito === 'ok' ? 0 : 1)
```

- [ ] **Step 2: Testar o script no banco local de desenvolvimento**

Run: `node scripts/db-resumo.js data/database.sqlite`
Expected: `integrity_check: ok`, uma linha por tabela (inclui `users`) e `TOTAL de linhas: N`, saída 0.

- [ ] **Step 3: Configurar o alias** — acrescentar ao `~/.ssh/config` (valores de `<HOST>`, `<USUARIO>` e a chave vêm do dono):

```
Host vps
    HostName <HOST>
    User <USUARIO>
    IdentityFile ~/.ssh/vps_key
    IdentitiesOnly yes
    ServerAliveInterval 30
```

- [ ] **Step 4: Testar o acesso sem prompt**

Run: `ssh -o BatchMode=yes -o ConnectTimeout=8 vps "echo acesso ok && docker ps --format '{{.Names}} {{.Status}}'"`
Expected: `acesso ok` e uma linha com `goat_bot_xp ... (healthy)`. Se pedir senha ou falhar, **parar** e pedir ao dono a chave certa.

- [ ] **Step 5: Backup consistente DENTRO do container (nunca `cp` de um banco WAL em uso)**

```bash
ssh vps "docker exec goat_bot_xp node -e \"const {DatabaseSync}=require('node:sqlite');const d=new DatabaseSync('/app/data/database.sqlite');d.exec(\\\"VACUUM INTO '/app/backups/pre-estabilizacao-2026-10-15.sqlite'\\\");d.close();console.log('ok')\""
```

Expected: `ok`. O arquivo cai em `/var/www/goat-bot/backups/` (volume `./backups:/app/backups`).

- [ ] **Step 6: Trazer e conferir**

```bash
mkdir -p /c/Users/mrodr/Documents/backups-goat-vps
scp vps:/var/www/goat-bot/backups/pre-estabilizacao-2026-10-15.sqlite /c/Users/mrodr/Documents/backups-goat-vps/producao-2026-10-15.sqlite
node scripts/db-resumo.js /c/Users/mrodr/Documents/backups-goat-vps/producao-2026-10-15.sqlite
```

Expected: `integrity_check: ok` e a contagem por tabela. **Salvar a saída** em `C:\Users\mrodr\Documents\backups-goat-vps\producao-2026-10-15.contagem.txt` — é o número a comparar depois do deploy (Tarefa 9).

- [ ] **Step 7: Segunda cópia** — copiar o `.sqlite` e o `.contagem.txt` para um pendrive/HD externo ou outra nuvem pessoal (o dono escolhe). Um backup num lugar só não conta.

- [ ] **Step 8: Commit**

```bash
git add scripts/db-resumo.js
git commit -m "chore(banco): db-resumo.js — integridade e contagem por tabela de uma cópia do banco"
```

---

### Task 3: Linha de base e causa real do "recusa tudo"

**Files:**
- Create: `docs/superpowers/plans/2026-10-15-linha-de-base.md` (resultado, não código)

**Interfaces:**
- Consumes: acesso à VPS (Tarefa 2).
- Produces: lista do que **já falhava** antes de qualquer mudança, para as outras tarefas não levarem a culpa.

- [ ] **Step 1: Rodar a suíte inteira e guardar a saída**

```bash
cd /c/Users/mrodr/Documents/Projetos/GOATBOT
npm test > /c/Users/mrodr/Documents/backups-goat-vps/baseline-npm-test.txt 2>&1; echo "saida=$?"
```

Expected: `saida=0` se tudo passa. Se falhar, a **primeira** linha `❌ FAIL` identifica o teste; registrar quais.

- [ ] **Step 2: Auditoria de todos os comandos como dono**

Run: `npm run test:comandos 2>&1 | tail -30`
Expected: o relatório `relatorio-comandos-execute-dono-grupo-exemplos-imagem.md` atualizado, com "ok" próximo de 4592. Qualquer comando quebrado/mudo/oco aparece em "Problemas agrupados por causa".

- [ ] **Step 3: Ler o log da VPS procurando a recusa**

```bash
ssh vps "docker logs --since 24h goat_bot_xp 2>&1 | grep -iE 'precisa criar seu login|isOwner|owner|ERROR|Integrity|corrompid' | tail -60"
```

Expected: confirma qual mensagem o dono está recebendo. Se for "antes de usar qualquer comando você precisa criar seu login", a causa é o portão (`messageHandler.js:960`) e a **Tarefa 5** resolve. Se aparecer outra coisa (erro de conexão, `Integrity check failed`), **parar e reavaliar** — não aplicar a Tarefa 5 às cegas.

- [ ] **Step 4: Procurar corrupção no ambiente de produção**

```bash
ssh vps "ls -la /var/www/goat-bot/data | grep -c corrupted; ls /var/www/goat-bot/data | head"
```

Expected: número de `database_corrupted_*` em produção. Se > 0, a Tarefa 4 passa a ser **urgente** e o histórico mostra se já houve perda.

- [ ] **Step 5: Salvar o resumo** em `docs/superpowers/plans/2026-10-15-linha-de-base.md` (falhas anteriores, causa confirmada, nº de arquivos `corrupted` na VPS) e commitar.

```bash
git add docs/superpowers/plans/2026-10-15-linha-de-base.md
git commit -m "docs(estabilizacao): linha de base antes das mudanças"
```

---

### Task 4: Recuperação segura do SQLite (nunca jogar fora o WAL nem subir vazio)

**Files:**
- Modify: `src/database/connection.js:44-135` (`initDb` e o `catch` de `getDatabase`)
- Create: `tests/db-recuperacao.test.js`
- Modify: `package.json` (acrescentar `&& node tests/db-recuperacao.test.js` ao script `test`)

**Interfaces:**
- Produces: `getDatabase(dbPath)` continua com a mesma assinatura. Novo comportamento: só trata como corrupção `errcode` 11 (`SQLITE_CORRUPT`), 26 (`SQLITE_NOTADB`) ou o erro marcado `ehCorrupcao`; guarda uma **cópia** do banco, do `-wal` e do `-shm` em `<pasta do banco>/corrupted/<timestamp>/`; restaura o backup válido mais novo de `<pasta do banco>/../backups/*.sqlite`; **sem backup válido, lança erro e não cria banco novo**.

- [ ] **Step 1: Escrever o teste que falha** — `tests/db-recuperacao.test.js`

```js
process.env.NODE_ENV = 'test'

/**
 * Recuperação do SQLite: nunca descarta dados em silêncio.
 * - arquivo corrompido + backup válido  → restaura e guarda cópia do corrompido (com WAL)
 * - arquivo corrompido sem backup       → ERRO e o arquivo fica intacto (nada de banco vazio)
 * - falha que NÃO é corrupção           → o erro sobe e nada é movido
 */

const assert = require('assert')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { DatabaseSync } = require('node:sqlite')
const { getDatabase, closeDatabase } = require('../src/database/connection')

let ok = 0, falhou = 0
async function teste(nome, fn) {
    try { await fn(); ok++; console.log(`  ✅ PASS: ${nome}`) }
    catch (err) { falhou++; console.log(`  ❌ FAIL: ${nome}\n     ${err.message}`) }
}

function pastaTemporaria() {
    const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'goat-db-'))
    fs.mkdirSync(path.join(raiz, 'data'))
    fs.mkdirSync(path.join(raiz, 'backups'))
    return raiz
}

/** Cria um banco válido (com as migrations do bot) e uma linha-sentinela. */
function criarBancoValido(arquivo, sentinela) {
    const db = getDatabase(arquivo)
    db.exec('CREATE TABLE IF NOT EXISTS sentinela (v TEXT)')
    db.prepare('INSERT INTO sentinela (v) VALUES (?)').run(sentinela)
    closeDatabase()
}

async function main() {
    console.log('\n🧪 Recuperação segura do SQLite...\n')

    await teste('corrompido + backup válido: restaura, e a cópia do corrompido fica guardada', async () => {
        const raiz = pastaTemporaria()
        const alvo = path.join(raiz, 'data', 'database.sqlite')
        criarBancoValido(path.join(raiz, 'backups', 'meliodas_backup_1.sqlite'), 'do-backup')
        fs.writeFileSync(alvo, Buffer.from('isto não é um banco sqlite, é lixo'.repeat(40)))
        fs.writeFileSync(alvo + '-wal', Buffer.from('wal com transações que não podem sumir'))

        const db = getDatabase(alvo)
        const linha = db.prepare('SELECT v FROM sentinela').get()
        closeDatabase()

        assert.strictEqual(linha.v, 'do-backup', 'não restaurou o backup')
        const quarentena = path.join(raiz, 'data', 'corrupted')
        const copias = fs.readdirSync(quarentena)
        assert.ok(copias.length === 1, 'não guardou a cópia do banco corrompido')
        const arquivos = fs.readdirSync(path.join(quarentena, copias[0]))
        assert.ok(arquivos.some(a => a.endsWith('-wal')), 'o WAL não foi preservado')
    })

    await teste('corrompido SEM backup: dá erro e o arquivo continua intacto (não sobe vazio)', async () => {
        const raiz = pastaTemporaria()
        const alvo = path.join(raiz, 'data', 'database.sqlite')
        const lixo = Buffer.from('lixo sem backup para restaurar'.repeat(50))
        fs.writeFileSync(alvo, lixo)

        assert.throws(() => getDatabase(alvo), /backup válido|corrompid/i)
        closeDatabase()
        assert.ok(fs.existsSync(alvo), 'o arquivo sumiu')
        assert.ok(fs.readFileSync(alvo).equals(lixo), 'o arquivo foi alterado ou trocado por um banco novo')
    })

    await teste('falha que não é corrupção (caminho é uma pasta): o erro sobe e nada é movido', async () => {
        const raiz = pastaTemporaria()
        const comoPasta = path.join(raiz, 'data', 'banco-que-e-pasta')
        fs.mkdirSync(comoPasta)

        assert.throws(() => getDatabase(comoPasta))
        closeDatabase()
        assert.ok(fs.statSync(comoPasta).isDirectory(), 'a pasta foi movida')
        assert.ok(!fs.existsSync(path.join(raiz, 'data', 'corrupted')), 'tratou falha comum como corrupção')
    })

    console.log(`\n📊 Recuperação do SQLite: ✅ ${ok}  ❌ ${falhou}\n`)
    process.exit(falhou > 0 ? 1 : 0)
}

main().catch(err => { console.error(err); process.exit(1) })
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node tests/db-recuperacao.test.js`
Expected: FAIL nos três (o código atual renomeia, apaga o WAL e sobe vazio; no teste 3 move a pasta).

- [ ] **Step 3: Implementar em `src/database/connection.js`**

3a. Dentro de `initDb`, trocar o `quick_check` por um erro marcado (linhas 97-101):

```js
        // Quick integrity check
        const check = db.prepare('PRAGMA quick_check;').get()
        if (check && check.quick_check !== 'ok') {
            const erro = new Error('Integrity check failed: ' + JSON.stringify(check))
            erro.ehCorrupcao = true
            throw erro
        }
```

3b. Acrescentar, antes de `getDatabase`, os três ajudantes:

```js
/** Só isto é "banco corrompido". Disco cheio, arquivo travado ou erro de migration NÃO são. */
function ehCorrupcao(err) {
    return Boolean(err && (err.ehCorrupcao === true || err.errcode === 11 || err.errcode === 26))
}

/** Pasta de backups irmã da pasta do banco: <raiz>/data/x.sqlite → <raiz>/backups. */
function pastaBackupsDe(targetPath) {
    return path.join(path.dirname(targetPath), '..', 'backups')
}

/** Copia (sem apagar nada) o banco, o -wal e o -shm para <pasta do banco>/corrupted/<ts>/. */
function guardarCopiaDoBanco(targetPath) {
    const destino = path.join(path.dirname(targetPath), 'corrupted', String(Date.now()))
    fs.mkdirSync(destino, { recursive: true })
    for (const sufixo of ['', '-wal', '-shm']) {
        const origem = targetPath + sufixo
        if (fs.existsSync(origem)) fs.copyFileSync(origem, path.join(destino, path.basename(targetPath) + sufixo))
    }
    return destino
}

/** Backup mais novo que ABRE e passa no quick_check; null se nenhum serve. */
function acharBackupValido(targetPath) {
    const pasta = pastaBackupsDe(targetPath)
    if (!fs.existsSync(pasta)) return null
    const candidatos = fs.readdirSync(pasta)
        .filter(n => n.endsWith('.sqlite'))
        .map(n => ({ n, t: fs.statSync(path.join(pasta, n)).mtimeMs }))
        .sort((a, b) => b.t - a.t)
    for (const { n } of candidatos) {
        const arquivo = path.join(pasta, n)
        let db = null
        try {
            db = new DatabaseSync(arquivo)
            const r = db.prepare('PRAGMA quick_check;').get()
            if (r && r.quick_check === 'ok') return arquivo
        } catch (e) {
            logger.warn(`[CONNECTION] Backup ${n} descartado: ${e.message}`)
        } finally {
            try { if (db) db.close() } catch (e) { logger.warn(`[CONNECTION] Falha ao fechar ${n}: ${e.message}`) }
        }
    }
    return null
}
```

3c. Substituir o `catch (err)` de `getDatabase` (linhas 113-134) por:

```js
    } catch (err) {
        _stmtCache.clear()
        dbInstance = null
        if (!ehCorrupcao(err)) {
            // Disco cheio, arquivo travado, bug de migration: NÃO é motivo para trocar o banco.
            logger.error(`❌ SQLite falhou, mas não é corrupção (${err.message}). Nada foi movido.`)
            throw err
        }

        logger.error(`⚠️ SQLite corrompido (${err.message}). Guardando cópia e tentando restaurar backup válido...`)
        const guardado = guardarCopiaDoBanco(targetPath)
        logger.info(`📦 Cópia do banco corrompido (com WAL) guardada em ${guardado}`)

        const backup = acharBackupValido(targetPath)
        if (!backup) {
            const msg = `Banco corrompido e nenhum backup válido em ${pastaBackupsDe(targetPath)}. `
                + `A cópia está em ${guardado}. Não vou iniciar com banco vazio.`
            logger.error(`❌ ${msg}`)
            throw new Error(msg)
        }

        fs.copyFileSync(backup, targetPath)
        // O WAL antigo pertence ao arquivo corrompido (já guardado acima): aplicado ao backup, estragaria o banco restaurado.
        for (const sufixo of ['-wal', '-shm']) {
            try { fs.unlinkSync(targetPath + sufixo) } catch (e) { if (e.code !== 'ENOENT') logger.warn(`[CONNECTION] ${sufixo}: ${e.message}`) }
        }
        dbInstance = initDb(targetPath)
        dbPathAtual = targetPath
        logger.warn(`♻️ Banco restaurado do backup ${path.basename(backup)}. Dados posteriores ao backup estão na cópia guardada.`)
        return dbInstance
    }
```

- [ ] **Step 4: Rodar o teste e ver passar**

Run: `node tests/db-recuperacao.test.js`
Expected: `✅ 3  ❌ 0`, saída 0.

- [ ] **Step 5: Garantir que nada quebrou nos testes de banco e backup**

Run: `node tests/database.test.js && node tests/backup.test.js && node tests/user-persistence.test.js`
Expected: todos passam.

- [ ] **Step 6: Entrar na suíte e commitar**

```bash
node -e "const f='package.json';const p=JSON.parse(require('fs').readFileSync(f,'utf8'));p.scripts.test+=' && node tests/db-recuperacao.test.js';require('fs').writeFileSync(f,JSON.stringify(p,null,2)+'\n')"
git add src/database/connection.js tests/db-recuperacao.test.js package.json
git commit -m "fix(banco): recuperação segura do SQLite — guarda WAL, restaura backup válido, nunca sobe vazio"
```

---

### Task 5: Dono nunca é barrado pelo login

**Files:**
- Modify: `src/handlers/messageHandler.js:946-967`
- Modify: `tests/login-obrigatorio.test.js` (casos de dono)
- Modify: `CLAUDE.md` (seção "Login obrigatório")

**Interfaces:**
- Consumes: `isOwner` (já calculado na linha 222 de `messageHandler.js`, com `env.isOwnerJid` e `ownerService.isOwner`).
- Produces: a trava de login continua para todos, **exceto** donos.

- [ ] **Step 1: Escrever o teste que falha** — acrescentar a `tests/login-obrigatorio.test.js`, **antes** de `console.log(\`\n📊 Login obrigatório`:

```js
    await teste('DONO sem login responde (PV e grupo): a trava de login não vale para ele', async () => {
        const donoTelefone = '553597379643@s.whatsapp.net'
        for (const noGrupo of [false, true]) {
            const c = clienteFalso()
            await handler.handleIncomingMessage(c, { messages: [mensagem({ texto: '.ping', noGrupo, autor: donoTelefone })] })
            assert.ok(!pediuLogin(c), `o dono foi barrado ${noGrupo ? 'no grupo' : 'no PV'}:\n${textos(c) || '(nenhuma)'}`)
            assert.ok(c.enviadas.length > 0, 'o dono não recebeu resposta nenhuma')
        }
    })

    await teste('quem NÃO é dono continua barrado sem login', async () => {
        const c = clienteFalso()
        await handler.handleIncomingMessage(c, { messages: [mensagem({ texto: '.ping', noGrupo: false, autor: '5511988887777@s.whatsapp.net' })] })
        assert.ok(pediuLogin(c), 'não-dono passou sem login')
    })

    await teste('dono que chega como @lid, com o telefone em senderReal, também passa', async () => {
        const c = clienteFalso()
        const msg = mensagem({ texto: '.ping', noGrupo: true, autor: '88888888888888@lid' })
        msg.key.participantAlt = '553597379643@s.whatsapp.net'
        await handler.handleIncomingMessage(c, { messages: [msg] })
        assert.ok(!pediuLogin(c), `dono por LID foi barrado:\n${textos(c) || '(nenhuma)'}`)
    })
```

E, **no topo do arquivo, logo depois da linha `process.env.NODE_ENV = 'test'`**, definir o dono do teste (o `env.js` lê isto no `require`):

```js
process.env.BOT_OWNER_ID = '553597379643@s.whatsapp.net'
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node tests/login-obrigatorio.test.js`
Expected: o teste "DONO sem login responde" **FAIL** (hoje o dono é barrado). Se o teste do `@lid` falhar por motivo diferente (dono não reconhecido), **anotar** — é o item 1 do Review Focus e exige ajustar a leitura de `participantAlt`/`senderReal` em `messageHandler.js` antes de seguir.

- [ ] **Step 3: Implementar** — em `src/handlers/messageHandler.js`, trocar o bloco das linhas 946-967 por:

```js
    // Gate de registro: LOGIN OBRIGATÓRIO PARA TODO COMANDO, em grupo e no PV, para todo
    // mundo — EXCETO o dono. Decisão do dono (2026-09-21): o cadastro é a base do sistema de
    // dados global do bot, uma conta só que vale em qualquer grupo e no privado. Em
    // 2026-10-15 o próprio dono pediu que os donos nunca sejam barrados (o bot recusava
    // todos os comandos dele quando não tinha conta). Para os demais continua obrigatório.
    //
    // A checagem é pelo que a pessoa digitou, não só por comando existente: o dispatch
    // tem atalhos (seção direta como `.rpg`, link colado `.https://…`) que não são
    // comandos registrados e passariam por baixo da trava.
    const ehLogin = findCommand(commandName)?.name === 'login'

    if (!user.registered && !ehLogin && !isOwner) {
        let aviso = `📜 @${sender.split('@')[0]}, antes de usar qualquer comando você precisa criar seu login — ele vale em todos os grupos e no privado.\n\n`
        aviso += `Crie com: \`${prefix}login <seu nick>\`\n`
        aviso += `Exemplo: \`${prefix}login Dragão Slayer\``
        await reply(aviso, [sender])
        await dataService.saveXpData(xpData)
        return
    }
```

- [ ] **Step 4: Rodar e ver passar**

Run: `node tests/login-obrigatorio.test.js && node tests/owner-demote.test.js && node tests/identity.test.js`
Expected: todos `❌ 0`.

- [ ] **Step 5: Documentar a decisão** — em `CLAUDE.md`, na seção "Login obrigatório", acrescentar no fim do parágrafo:

```
**Exceção (decisão do dono, 2026-10-15):** donos (`isOwner`) nunca são barrados pela trava de login. Para todos os demais a regra continua igual.
```

- [ ] **Step 6: Commit**

```bash
git add src/handlers/messageHandler.js tests/login-obrigatorio.test.js CLAUDE.md
git commit -m "fix(login): dono nunca é barrado pela trava de login obrigatório"
```

---

### Task 6: Mídia — a ficha de volta, na legenda da própria mídia

**Files:**
- Modify: os arquivos que a remoção tocou — `git show --stat 017e089 06cfe82` lista (`src/commands/media/{media,play,insta,tiktok,pinterest,reddit,soundcloud,spotify,kwai}.js` e `src/services/...`).
- Test: `tests/midia-cartoes.test.js` e `tests/mediainfo.test.js` (já existem; estender).

**Interfaces:**
- Consumes: `formatResolver.probeMedia` (ffprobe — a ficha técnica) e os metadados que cada baixador já devolve.
- Produces: legenda com os campos, **na mesma mensagem da mídia** (regra "uma mídia por pedido" fica).

> **Importante — o que NÃO se faz:** não reescrever a ficha do zero. Ela já existia (`58ac32f`, `906b5f5`) e foi retirada por pedido do dono em `017e089`/`06cfe82`. A correção é **reverter só a parte da legenda** dessas duas mudanças e manter o resto (conversão H.264 sem arquivo corrompido, capa real no áudio, 4K no YouTube, cache com versão).

- [ ] **Step 1: Ver exatamente o que saiu**

```bash
git show 017e089 -- src/commands/media/ src/services/ | head -400
git show 06cfe82 -- src/commands/media/ src/services/ | head -400
git show 58ac32f --stat && git show 906b5f5 --stat
```

Expected: nos diffs, as linhas **removidas** (`-`) com o montador da legenda/ficha (campos: título, plataforma, autor, duração, resolução, fps, codec, taxa, canais, tamanho, data de publicação, link da fonte).

- [ ] **Step 2: Escrever o teste da legenda** — em `tests/midia-cartoes.test.js` (usar o helper de cliente falso que o arquivo já tem), um caso para **vídeo** e um para **áudio** que exige na legenda: título, plataforma, autor, duração, resolução (vídeo) ou taxa (áudio), tamanho, data e o link; e **uma única** mensagem de mídia enviada; e `legenda.length <= 1000`.

```js
await teste('legenda do vídeo traz a ficha completa e cabe no limite do WhatsApp', async () => {
    const envio = await executarDownloadFalso({ plataforma: 'tiktok', tipo: 'video' })
    assert.strictEqual(envio.midias.length, 1, 'mais de uma mídia por pedido')
    const l = envio.midias[0].caption
    for (const campo of ['Plataforma', 'Autor', 'Duração', 'Resolução', 'Tamanho', 'Publicado', 'Fonte']) {
        assert.ok(l.includes(campo), `faltou "${campo}" na legenda:\n${l}`)
    }
    assert.ok(l.length <= 1000, `legenda com ${l.length} caracteres`)
})
```

(`executarDownloadFalso` é o ajudante que o próprio arquivo de teste usa para simular um download; usar o nome real que o arquivo exporta — conferir com `grep -n "function" tests/midia-cartoes.test.js`.)

- [ ] **Step 3: Rodar e ver falhar**

Run: `node tests/midia-cartoes.test.js`
Expected: FAIL por falta dos campos (a legenda hoje é "só o nome").

- [ ] **Step 4: Restaurar o montador da legenda** — aplicar de volta **somente** as linhas `-` da legenda dos diffs do Step 1, na mesma função que as removeu, e **encurtar** para o limite: ordem de corte quando passar de 1000 caracteres — primeiro `Tamanho`, depois `Publicado`, depois `Autor`; **nunca** `Fonte` (o link) nem `Plataforma`.

- [ ] **Step 5: Rodar e ver passar, mais a regressão de mídia**

Run: `node tests/midia-cartoes.test.js && node tests/media.test.js && node tests/media-fix.test.js && node tests/midia-qualidade.test.js && node tests/mediainfo.test.js`
Expected: todos `❌ 0` (o teste de H.264 e o de "uma mídia por pedido" não podem regredir).

- [ ] **Step 6: Atualizar a decisão no `CLAUDE.md`** — na seção "Downloads", trocar o item "A legenda mostra a ficha…" para dizer que a ficha **voltou em 2026-10-15 por pedido do dono**, na legenda da própria mídia, com o limite de 1000 caracteres.

- [ ] **Step 7: Commit**

```bash
git add -A src tests CLAUDE.md
git commit -m "feat(midia): ficha completa de volta na legenda da própria mídia (limite 1000 caracteres)"
```

---

### Task 7: Remover o módulo Divulgação

**Files:**
- Delete: `src/commands/admin/divulga1.js` … `divulga25.js` (25 arquivos), `src/commands/owner/divulgacao.js`, `src/services/divulgacaoService.js`
- Modify: `src/config/modules.js` (chave `divulgacao`, `addNames('divulgacao', …)`, regra de subcategoria na linha ~141), `src/config/botProfiles.js` (`SECAO_DIVULGACAO` e o perfil que a usa), `src/services/menuService.js`, `src/services/groupMessageService.js`, `src/commands/owner/modulo.js` e `perfilbot.js` (referências)
- **Não** apagar: `src/commands/owner/broadcast.js` (ferramenta de transmissão do dono, não é o módulo) e qualquer linha de `profile_data` com chave `divulgacao_*`.

**Interfaces:**
- Produces: nenhum comando, serviço ou perfil de Divulgação. Os dados antigos ficam no banco, sem uso.

- [ ] **Step 1: Mapear as referências e os testes que citam**

```bash
cd /c/Users/mrodr/Documents/Projetos/GOATBOT
grep -rn -i "divulga" src tests scripts --include=*.js -l | sort
grep -rn -i "divulga" tests -l
```

Expected: a lista; anotar quais **testes** citam (contagem de comandos, perfis, menu).

- [ ] **Step 2: Escrever o teste que falha** — `tests/divulgacao-removida.test.js`:

```js
process.env.NODE_ENV = 'test'

const assert = require('assert')
const fs = require('fs')
const path = require('path')
const { MODULES } = require('../src/config/modules')

let ok = 0, falhou = 0
function teste(nome, fn) {
    try { fn(); ok++; console.log(`  ✅ PASS: ${nome}`) }
    catch (err) { falhou++; console.log(`  ❌ FAIL: ${nome}\n     ${err.message}`) }
}

console.log('\n🧪 Divulgação removida...\n')

teste('não há módulo "divulgacao"', () => {
    assert.ok(!MODULES.some(m => m.key === 'divulgacao'), 'o módulo ainda existe')
})
teste('não há arquivos divulga*.js nem o serviço', () => {
    const adm = fs.readdirSync(path.join(__dirname, '../src/commands/admin')).filter(n => /^divulga\d+\.js$/.test(n))
    assert.deepStrictEqual(adm, [], `sobraram: ${adm.join(', ')}`)
    assert.ok(!fs.existsSync(path.join(__dirname, '../src/services/divulgacaoService.js')))
    assert.ok(!fs.existsSync(path.join(__dirname, '../src/commands/owner/divulgacao.js')))
})
teste('nenhum perfil de atuação referencia a seção divulgação', () => {
    const perfis = require('../src/config/botProfiles')
    const texto = JSON.stringify(perfis)
    assert.ok(!/divulgacao/i.test(texto), 'ainda há "divulgacao" nos perfis')
})

console.log(`\n📊 Divulgação removida: ✅ ${ok}  ❌ ${falhou}\n`)
process.exit(falhou > 0 ? 1 : 0)
```

Run: `node tests/divulgacao-removida.test.js`
Expected: FAIL (3).

- [ ] **Step 3: Remover os arquivos**

```bash
git rm src/commands/admin/divulga{1..25}.js src/commands/owner/divulgacao.js src/services/divulgacaoService.js
```

- [ ] **Step 4: Tirar as referências restantes** — em cada arquivo do Step 1 que sobrou, remover a chave/menção de Divulgação (módulo em `modules.js`, `SECAO_DIVULGACAO` e o perfil em `botProfiles.js`, entradas de menu), **sem apagar nada de dado**. Cada edição é conferida com `grep -n -i divulga <arquivo>` até não sobrar nada.

- [ ] **Step 5: Rodar o teste novo e a integridade do despachante**

Run: `node tests/divulgacao-removida.test.js && node tests/dispatcher-integrity.test.js && node tests/menu.test.js && node tests/module-state.test.js`
Expected: todos `❌ 0`. Se algum teste tinha contagem fixa de comandos (ex.: `4594`), ajustá-lo para a nova contagem **e dizer isso no commit**.

- [ ] **Step 6: Entrar na suíte e commitar**

```bash
node -e "const f='package.json';const p=JSON.parse(require('fs').readFileSync(f,'utf8'));p.scripts.test+=' && node tests/divulgacao-removida.test.js';require('fs').writeFileSync(f,JSON.stringify(p,null,2)+'\n')"
git add -A src tests package.json
git commit -m "refactor(divulgacao): remove o módulo Divulgação (comandos, serviço, perfil e menu); dados preservados"
```

---

### Task 8: Bibliotecas e segurança (uma por commit, guiadas pela auditoria)

**Files:**
- Modify: `package.json`, `package-lock.json`

**Interfaces:**
- Produces: `npm audit --omit=dev` sem `critical`; cada atualização em um commit próprio, para voltar atrás uma de cada vez.

**Estado de partida (2026-10-15):** `audit --omit=dev` → 1 crítica (`@whiskeysockets/baileys`), 16 altas, 2 moderadas. Desatualizados: baileys rc11→rc14, dotenv 17→18, mathjs 12→15, pino 7→10, puppeteer-core 23→25, sharp 0.34→0.35, youtubei.js 18.0→18.1.

- [ ] **Step 1: Registrar o antes**

```bash
npm audit --omit=dev --json > /c/Users/mrodr/Documents/backups-goat-vps/audit-antes.json
npm audit --omit=dev | tail -5
```

- [ ] **Step 2: Correções sem quebra de versão**

```bash
npm audit fix --omit=dev
npm test
```

Expected: a suíte passa. Se algo falhar, `git checkout package.json package-lock.json` e investigar o pacote culpado em separado.

- [ ] **Step 3: `sharp` 0.34 → 0.35** (nativo; Windows aqui, Linux no Docker)

```bash
npm install sharp@^0.35.5
npm test
```

Expected: passa (`tests/tamanho.test.js`, figurinhas e cartões exercitam o `sharp`). Commit separado.

- [ ] **Step 4: `youtubei.js` 18.0 → 18.1 (patch) e `dotenv`**

```bash
npm install youtubei.js@^18.1.0
npm test
```

- [ ] **Step 5: `@whiskeysockets/baileys` rc11 → rc14 — SÓ com o dono ciente**

Pré-condição: o dono confirmou que pode escanear o QR de novo e a pasta `sessao/` da VPS foi copiada (Tarefa 9, Step 1). Então:

```bash
npm install @whiskeysockets/baileys@7.0.0-rc14
npm test
node scripts/testar-comandos.js --passe=execute --args=exemplos --citada=imagem
```

Expected: suíte e auditoria de comandos sem regressão. Se `tests/identity.test.js`, `tests/group-*.test.js` ou `tests/grupo-lid.test.js` falharem, **reverter** (`git checkout package.json package-lock.json && npm ci`): a API de LID mudou e isso vira trabalho separado.

- [ ] **Step 6: `pino`, `mathjs`, `puppeteer-core` — só se a auditoria ainda os apontar**

Majors (7→10, 12→15, 23→25). Atualizar **um por vez** e rodar `npm test` entre cada. Se a auditoria não apontar mais nada, **deixar como está** (YAGNI).

- [ ] **Step 7: Cadeia `yt-search → node-fzf → redstar → minimatch`** — conferir onde `yt-search` é usado (`grep -rn "yt-search" src`); se houver alternativa já presente (`youtubei.js` faz busca), trocar e remover a dependência; senão manter e anotar no plano.

- [ ] **Step 8: Registrar o depois**

```bash
npm audit --omit=dev --json > /c/Users/mrodr/Documents/backups-goat-vps/audit-depois.json
npm audit --omit=dev | tail -5
```

Expected: **0 críticas**; altas restantes listadas com o motivo de não terem sido tocadas.

---

### Task 9: Deploy controlado na VPS

**Files:** nenhum (usa `scripts/vps.ps1 deploy` e `scripts/remote/deploy-remote.sh`, que já existem).

**Interfaces:**
- Consumes: Tarefas 1–8 concluídas; backup da Tarefa 2 e sua contagem.
- Produces: bot novo no ar, banco com **contagens ≥ às de antes**, e um caminho de volta documentado.

> O `deploy-vps.ps1` empacota o **commit atual** (`git archive HEAD`), envia por `scp` e roda `deploy-remote.sh`, que **exclui** `data/`, `sessao/`, `backups/`, `logs/` do backup de código e extrai com `--no-overwrite-dir`. `data/` e `sessao/` **não** estão no commit (gitignored): o deploy não toca o banco. Mesmo assim, **backup novo antes**.

- [ ] **Step 0: O banco da VPS é o banco de verdade?** (acrescentado em 2026-10-15)

O código antigo trocava o banco por um vazio a cada falha de abertura, e os 30 `database_corrupted_*` locais mostram usuários indo de 100 a 352 e depois **236** — ou seja, houve troca de banco. Antes de subir qualquer coisa, listar o que a VPS tem e comparar:

```bash
ssh vps "ls -la /var/www/goat-bot/data | grep -E 'corrupted|database'; ls /var/www/goat-bot/backups | tail -5"
```

Para o banco vivo (`VACUUM INTO` num arquivo à parte) e para o `database_corrupted_*` mais novo e mais volumoso: `SELECT count(*) FROM users`, `sum(xp>0)`, `sum(registered)`. **Se o banco vivo tem bem menos usuários que um corrompido, parar:** o RPG pode estar nesse arquivo, e a decisão de qual vira o banco vivo é do dono. Limitação conhecida: `acharBackupValido` só confere `quick_check`, então um backup de banco vazio conta como "válido" — conferir a contagem antes de confiar na restauração automática.

- [ ] **Step 1: Backup fresco, na hora, de tudo que importa**

```bash
ssh vps "docker exec goat_bot_xp node -e \"const {DatabaseSync}=require('node:sqlite');const d=new DatabaseSync('/app/data/database.sqlite');d.exec(\\\"VACUUM INTO '/app/backups/pre-deploy-$(date +%Y%m%d-%H%M).sqlite'\\\");d.close();console.log('ok')\""
ssh vps "tar -czf /root/deploy-backups/sessao-$(date +%Y%m%d-%H%M).tar.gz -C /var/www/goat-bot sessao && ls -la /root/deploy-backups | tail -3"
scp "vps:/var/www/goat-bot/backups/pre-deploy-*.sqlite" /c/Users/mrodr/Documents/backups-goat-vps/
```

Expected: `ok`; o `.tar.gz` da sessão existe; o `.sqlite` chegou. `node scripts/db-resumo.js` nele → `integrity_check: ok`.

- [ ] **Step 2: Conferir o commit que vai subir**

```bash
git status --short      # tem que estar limpo: só o que está COMMITADO sobe
git log --oneline -12
npm test                # última prova
```

- [ ] **Step 3: Deploy**

```powershell
.\scripts\vps.ps1 deploy
```

Expected: `💚 Container healthy.` e `🎉 Deploy concluído. Backup anterior: /root/deploy-backups/codigo-…tar.gz`. Se terminar com erro, **não** repetir: seguir o "Plano de volta" abaixo.

- [ ] **Step 4: Provas depois do deploy**

```bash
ssh vps "docker exec goat_bot_xp node -e \"const {DatabaseSync}=require('node:sqlite');const d=new DatabaseSync('/app/data/database.sqlite');console.log(d.prepare('PRAGMA quick_check').get())\""
ssh vps "docker logs --tail 40 goat_bot_xp 2>&1 | grep -iE 'conectad|ERROR|Integrity|corrompid|QR' | tail -20"
```

Expected: `quick_check: ok`; bot **conectado** (sem pedido de QR; se pedir, é a atualização do Baileys: usar `.\scripts\vps.ps1 qr`). Depois, **na prática**: o dono manda `.ping` e um download de mídia; confere a ficha.

- [ ] **Step 5: Contagem não pode ter diminuído**

Gerar o resumo do banco de produção de novo (VACUUM INTO + `scp` + `node scripts/db-resumo.js`) e comparar com `producao-2026-10-15.contagem.txt`: **toda tabela com contagem ≥ à de antes** (o RPG continua crescendo; diminuir é sinal de perda → acionar o plano de volta).

- [ ] **Step 6: Registrar** em "Registro de execução" a versão (`.versao-deploy`), a hora e as contagens.

#### Plano de volta (se algo der errado)

1. **Código:** `ssh vps "tar -xzf /root/deploy-backups/codigo-<data>.tar.gz -C /var/www/goat-bot && cd /var/www/goat-bot && docker compose up -d --build goat-bot"`.
2. **Banco** (só se houver perda): parar o container, copiar o `pre-deploy-*.sqlite` por cima de `data/database.sqlite`, **apagar** `data/database.sqlite-wal` e `-shm`, subir o container. Antes disso, **copiar** o banco atual para o PC (nunca sobrescrever sem cópia).
3. **Sessão do WhatsApp:** `tar -xzf /root/deploy-backups/sessao-<data>.tar.gz -C /var/www/goat-bot`.

---

## Plano 2 — depende de decisões do dono (não escrever tarefas antes)

Cada item abaixo precisa de uma resposta antes de virar tarefa; inventar sem isso é construir o que ninguém pediu.

| Pedido | O que falta saber | Ponto de partida que já existe |
|---|---|---|
| **"Filtrar os comandos"** (4.594 arquivos) | Filtrar por quê? Tirar os que ninguém usa, os redundantes (várias famílias geradas: `general` tem 1.454), ou os que dão problema? | `relatorio-comandos-*.md` (auditoria 2026-09-20: 4.592 ok), `scripts/audit-commands.js`, telemetria de uso no banco (`command_stats`? conferir) — dá para listar o **menos usado** com dado real. |
| **"Aprimorar o RPG"** (727 comandos) | O que está ruim hoje? Equilíbrio (XP/moedas), bugs, falta de conteúdo, ou novos sistemas? | `tests/rpg.test.js`, `lore.test.js`, `reino.test.js`; qualquer melhoria é **migration aditiva** + backup (Tarefas 1–2 já cobrem). |
| **"Comandos que entendam e respondam rápido"** | "Entender" = tolerar erro de digitação/apelido? "Rápido" = quanto é lento hoje? | Falta **medir**: latência por comando nos logs da VPS (`commandDispatcher.js` já registra tempo?). Sem número, não há alvo. |
| **"Perfis de comando global"** | Remover só o módulo Divulgação (Tarefa 7, já cobre) **ou** o sistema inteiro de perfis (`botProfiles.js`)? Se for o sistema inteiro, o que acontece com os grupos que hoje usam um perfil? | `src/config/botProfiles.js` (presets de módulos) e a tabela de estado de módulos por grupo. |
| **"O que mais você achar viável"** | — | Candidatos já vistos: **NÃO apagar** os 30 `database_corrupted_*` locais — são cópias de bancos saudáveis (de 100 a 352 usuários, 232 com XP) e podem ser a fonte mais completa do RPG de setembro; comparar com o banco da VPS antes de qualquer limpeza; mover o projeto para fora do OneDrive (path antigo no OneDrive é provável causa das corrupções de 31/08–01/09); `.env`/`cookies.txt` fora de qualquer pasta sincronizada; teste automático de restauração de backup. |

---

## Registro de execução

### 2026-10-15 — parte local (sem a VPS)

**Backups (PC do dono, fora do repo):**
- `Documents\backup-goat-bot-2026-10-15.bundle` — `git bundle --all` verificado (574 MB; o repositório local tinha 77 commits que não estão em lugar nenhum).
- `Documents\backup-goat-bot-2026-10-15-arquivos-locais.zip` — `data/`, `configs.json`, `cookies.txt`, `.env` (44 entradas).

**Linha de base (antes de qualquer mudança):** `npm test` saiu 0; **4593 comandos respondem, 0 falhas**. Ou seja, o "recusa tudo" não é comando quebrado: é o portão de login (Tarefa 5) ou um dono não reconhecido na VPS — **causa em produção ainda não confirmada**, porque os logs da VPS não foram lidos (Tarefa 3, passos 3 e 4).

**Achado:** os 9 `data/database_corrupted_*.sqlite` locais passam no `quick_check` (43 tabelas cada). O `catch` antigo tratava qualquer falha de abertura como corrupção, movia o banco e subia um vazio — eram bancos saudáveis jogados fora.

| Tarefa | Commit | Resultado |
|---|---|---|
| 4 recuperação do SQLite | `36e9bb0` | 7 testes novos; só corrupção real move arquivo; WAL lido antes de abrir; sem backup válido = erro (nunca banco vazio); cópia não se multiplica em loop de restart |
| 5 dono não é barrado | `489f288` | 4 testes novos (PV, grupo, `@lid` por mapeamento, não-dono continua barrado) |
| 6 ficha da mídia | `6762ca7` | vídeo/foto/documento: legenda ≤ 1024; áudio: texto antes do áudio; uma mídia por pedido |
| 7 remover Divulgação | `8ee71ea` | −26 comandos (4593 → 4567), módulo e perfil removidos; `.broadcast` e `.afiliado` ficaram; dados intactos |
| 8 dependências | `6dbaef8`, `42ace4a`, `e82f589` | audit fix (undici, ws…), sharp 0.35.5, youtubei.js 18.1.0; 19 → 12 vulnerabilidades |

**Pendente — depende do dono:**
1. **Deploy (Tarefa 9) e Tarefas 2–3:** exigem SSH na VPS (host, usuário e qual chave). Não há alias `vps` neste PC.
2. **Baileys rc11 → rc14** é a única vulnerabilidade *crítica* restante; não foi tocado porque pode invalidar a sessão do WhatsApp e exigir novo pareamento.
3. **Reconexão por código:** `BOT_PAIRING_NUMBER` (DDI+DDD+número, só dígitos) no `.env` da VPS; o código de 8 caracteres aparece no log e vale poucos minutos, e a pessoa digita em WhatsApp → Aparelhos conectados → Conectar com número de telefone. Só é necessário se a sessão (`sessao/`) não sobreviver.
4. **Plano 2** (filtro de comandos, RPG, velocidade, o que fazer com o sistema de perfis).
