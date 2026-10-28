/**
 * Auditoria automática dos comandos: executa cada um com um contexto mockado
 * e um banco de teste isolado, capturando erros estruturais (ReferenceError,
 * require quebrado, função indefinida, acesso a undefined).
 *
 * Não valida rede/WhatsApp — mocka o client. Um comando que LANÇA de imediato
 * com esse mock quase sempre tem bug real. Um que responde/retorna está OK.
 *
 * Uso: node scripts/audit-commands.js [categoria]
 */
process.env.NODE_ENV = 'test'
const fs = require('fs')
const path = require('path')

const dispatcher = require('../src/handlers/commandDispatcher')
dispatcher.loadCommands()
const commands = dispatcher.getCommands()

const onlyCat = process.argv[2] || null

// Mock de client Baileys — todos os métodos retornam valores seguros
const mockClient = new Proxy({
    user: { id: '000000000000:1@s.whatsapp.net' },
    sendMessage: async () => ({ key: { id: 'x' } }),
    groupMetadata: async () => ({ subject: 'Grupo Teste', desc: 'desc', participants: [{ id: '111@s.whatsapp.net', admin: 'admin' }, { id: '222@s.whatsapp.net' }], owner: '111@s.whatsapp.net' }),
    groupParticipantsUpdate: async () => [{ status: '200' }],
    groupSettingUpdate: async () => true,
    profilePictureUrl: async () => 'https://x/y.jpg',
    sendPresenceUpdate: async () => true,
    readMessages: async () => true,
    onWhatsApp: async () => [{ exists: true, jid: '111@s.whatsapp.net' }],
    updateProfilePicture: async () => true
}, { get: (t, p) => p in t ? t[p] : (async () => undefined) })

function makeCtx(cmd) {
    const replies = []
    const sender = '5511999990001@s.whatsapp.net'
    return {
        ctx: {
            reply: async (t) => { replies.push(t); return { key: { id: 'r' } } },
            react: async () => true,
            sender, senderReal: sender, roleJid: sender,
            from: '120000000000000@g.us',
            isGroup: true, isAdmin: true, isBotAdmin: true, isOwner: true,
            userRole: { level: 5, name: 'OWNER' },
            args: [], text: '', prefix: '.',
            commandName: cmd.name,
            client: mockClient,
            info: { key: { id: 'm', remoteJid: '120000000000000@g.us', participant: sender }, message: { conversation: '' } },
            quotedSender: null, quotedMsg: null, isQuoted: false,
            body: '.' + cmd.name
        },
        replies
    }
}

async function withTimeout(promise, ms) {
    let timer
    const t = new Promise((_, rej) => { timer = setTimeout(() => rej(new Error('TIMEOUT')), ms) })
    try { return await Promise.race([promise, t]) } finally { clearTimeout(timer) }
}

async function run() {
    const results = { ok: [], threw: [], timeout: [] }
    const seen = new Set()
    for (const [name, cmd] of commands) {
        if (seen.has(cmd)) continue
        seen.add(cmd)
        if (onlyCat && cmd.category !== onlyCat) continue
        const { ctx } = makeCtx(cmd)
        try {
            await withTimeout(Promise.resolve().then(() => cmd.execute(ctx)), 4000)
            results.ok.push(name)
        } catch (e) {
            const msg = (e && e.message) || String(e)
            if (msg === 'TIMEOUT') results.timeout.push(name)
            else results.threw.push({ name, cat: cmd.category, msg: msg.slice(0, 140) })
        }
    }

    console.log(`\n═══ AUDITORIA DE COMANDOS ═══`)
    console.log(`OK (executou sem lançar): ${results.ok.length}`)
    console.log(`TIMEOUT (aguardando rede/mock): ${results.timeout.length}`)
    console.log(`LANÇARAM ERRO (possível bug): ${results.threw.length}\n`)

    // agrupa erros por mensagem para achar padrões
    const byMsg = {}
    for (const t of results.threw) {
        const key = t.msg.replace(/['"`][^'"`]*['"`]/g, '…').slice(0, 80)
        ;(byMsg[key] = byMsg[key] || []).push(t)
    }
    console.log('── ERROS AGRUPADOS ──')
    for (const [msg, list] of Object.entries(byMsg).sort((a, b) => b[1].length - a[1].length)) {
        console.log(`\n[${list.length}] ${msg}`)
        console.log('   ' + list.slice(0, 12).map(t => `${t.name}(${t.cat})`).join(', ') + (list.length > 12 ? ` +${list.length - 12}` : ''))
    }

    fs.writeFileSync(path.join(__dirname, '..', 'audit-report.json'), JSON.stringify(results, null, 2))
    console.log(`\n📄 relatório salvo em audit-report.json`)
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
