/**
 * GOATBOT — Interactive WhatsApp CLI Simulator
 * Permite testar comandos diretamente no terminal sem conectar ao WhatsApp
 */

const readline = require('readline')
const { getDatabase } = require('../src/database/connection')
const { runMigrations } = require('../src/database/migrator')
const { importLegacyJsonData } = require('../src/database/importer')
const { loadCommands, dispatch } = require('../src/handlers/commandDispatcher')
const { createMockSocket } = require('../src/dev/mockFactory')

let currentRole = 'user' // 'user' | 'admin' | 'owner'
let currentChat = 'group' // 'group' | 'private'
const mockClient = createMockSocket()

const senderMap = {
    user: '5511888888888@s.whatsapp.net',
    admin: '5511999999999@s.whatsapp.net',
    owner: '5511000000000@s.whatsapp.net'
}

async function startCli() {
    console.clear()
    console.log('====================================================')
    console.log('🤖 GOAT BOT XP — SIMULADOR CLI DE DESENVOLVIMENTO')
    console.log('====================================================')
    console.log('📌 Digite comandos com prefixo (ex: .menu, .xp, .hunt, .boss criar, .daily)')
    console.log('📌 Comandos especiais da CLI:')
    console.log('   /role [user|admin|owner] — Alternar papel do remetente')
    console.log('   /chat [group|private]   — Alternar tipo de chat')
    console.log('   /status                 — Ver papel e chat atuais')
    console.log('   /exit                   — Sair do simulador')
    console.log('====================================================\n')

    // Inicializa DB e Comandos
    const db = getDatabase()
    runMigrations(db)
    importLegacyJsonData(db)
    loadCommands()

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: `\x1b[36m[${currentRole.toUpperCase()}|${currentChat.toUpperCase()}] > \x1b[0m`
    })

    rl.prompt()

    rl.on('line', async (line) => {
        const input = line.trim()
        if (!input) {
            rl.prompt()
            return
        }

        // Comandos de Controle da CLI
        if (input.startsWith('/role')) {
            const role = input.split(' ')[1]?.toLowerCase()
            if (['user', 'admin', 'owner'].includes(role)) {
                currentRole = role
                console.log(`\x1b[32m✔ Papel alterado para: ${role.toUpperCase()}\x1b[0m`)
            } else {
                console.log('\x1b[31m✖ Uso: /role [user|admin|owner]\x1b[0m')
            }
            rl.setPrompt(`\x1b[36m[${currentRole.toUpperCase()}|${currentChat.toUpperCase()}] > \x1b[0m`)
            rl.prompt()
            return
        }

        if (input.startsWith('/chat')) {
            const chat = input.split(' ')[1]?.toLowerCase()
            if (['group', 'private'].includes(chat)) {
                currentChat = chat
                console.log(`\x1b[32m✔ Chat alterado para: ${chat.toUpperCase()}\x1b[0m`)
            } else {
                console.log('\x1b[31m✖ Uso: /chat [group|private]\x1b[0m')
            }
            rl.setPrompt(`\x1b[36m[${currentRole.toUpperCase()}|${currentChat.toUpperCase()}] > \x1b[0m`)
            rl.prompt()
            return
        }

        if (input === '/status') {
            console.log(`\x1b[33mℹ Papel: ${currentRole} | Chat: ${currentChat} | JID: ${senderMap[currentRole]}\x1b[0m`)
            rl.prompt()
            return
        }

        if (input === '/exit' || input === 'exit') {
            console.log('Encerrando simulador...')
            rl.close()
            process.exit(0)
        }

        // Disparo do comando WhatsApp simulado
        const sender = senderMap[currentRole]
        const isGroup = currentChat === 'group'
        const from = isGroup ? '120363000000000000@g.us' : sender
        const isAdmin = currentRole === 'admin' || currentRole === 'owner'
        const isOwner = currentRole === 'owner'
        const isBotAdmin = true

        const parts = input.split(/ +/)
        const commandName = parts[0].startsWith('.') ? parts[0].slice(1) : parts[0]
        const args = parts.slice(1)

        const reply = async (msg) => {
            console.log('\n\x1b[32m--- Resposta do Bot WhatsApp ---\x1b[0m')
            console.log(msg)
            console.log('\x1b[32m--------------------------------\x1b[0m\n')
        }

        const context = {
            commandName,
            args,
            text: args.join(' '),
            body: input,
            from,
            sender,
            isGroup,
            isAdmin,
            isBotAdmin,
            isOwner,
            client: mockClient,
            reply,
            info: {
                key: { remoteJid: from, fromMe: false, participant: isGroup ? sender : undefined },
                message: { conversation: input }
            }
        }

        try {
            const handled = await dispatch(context)
            if (!handled) {
                console.log(`\x1b[33m[Simulador] Comando não encontrado: .${commandName}\x1b[0m`)
            }
        } catch (err) {
            console.error('\x1b[31m[Simulador Erro]\x1b[0m', err)
        }

        rl.prompt()
    })
}

if (require.main === module) {
    startCli()
}

module.exports = { startCli }

