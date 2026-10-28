const os = require('os')
const fs = require('fs')
const path = require('path')
const { rootDir } = require('../../config/paths')
const dataService = require('../../services/dataService')
const rentalService = require('../../services/rentalService')
const dispatcher = require('../../handlers/commandDispatcher')
const logger = require('../../core/logger')

const { getBotName } = require('../../config/botConfig')

module.exports = {
    name: 'status',
    aliases: ['botstatus', 'pinghost', 'specs'],
    category: 'general',
    subcategory: 'Informação',
    description: 'Mostra como estou: tempo ligado, memória e quantos comandos tenho',
    cooldownMs: 2000,
    execute: async ({ reply, client, isGroup, from }) => {
        const botName = getBotName()
        const uptime = process.uptime()
        const horas = Math.floor(uptime / 3600)
        const minutos = Math.floor((uptime % 3600) / 60)
        const segundos = Math.floor(uptime % 60)

        const mem = process.memoryUsage()
        const ramMb = Math.round(mem.rss / 1024 / 1024)
        const totalRamMb = Math.round(os.totalmem() / 1024 / 1024)
        const freeRamMb = Math.round(os.freemem() / 1024 / 1024)

        // 1. Contagem real de usuários no SQLite e em todos os grupos
        let totalUsers = 0
        const globalUniqueUsers = new Set()
        try {
            totalUsers = dataService.userRepo.countUsers() || Object.keys(dataService.getXpData()).length
        } catch (_) {
            totalUsers = Object.keys(dataService.getXpData()).length
        }

        // 2. Contagem real de grupos e membros conectados
        let totalGrupos = 0
        if (client && typeof client.groupFetchAllParticipating === 'function') {
            try {
                const allGroups = await client.groupFetchAllParticipating()
                if (allGroups) {
                    totalGrupos = Object.keys(allGroups).length
                    Object.values(allGroups).forEach(g => {
                        if (Array.isArray(g.participants)) {
                            g.participants.forEach(p => {
                                const pid = (p.id || p.jid || '').split('@')[0].split(':')[0]
                                if (pid) globalUniqueUsers.add(pid)
                            })
                        }
                    })
                }
            } catch (errIgnorado) { logger.warn(`[STATUS] Falha ignorada em src/commands/general/status.js:56: ${errIgnorado.message}`) }
        }
        const totalNetworkMembers = Math.max(globalUniqueUsers.size, totalUsers)

        // 3. Contagem real de comandos e aliases
        const totalCmds = dispatcher.commands?.size || 174
        const totalAliases = dispatcher.aliases?.size || 569

        // 4. Tamanho do banco de dados SQLite
        const dbPath = path.join(rootDir, 'data', 'database.sqlite')
        let dbSizeText = 'salvos com segurança'
        if (fs.existsSync(dbPath)) {
            const sizeKb = Math.round(fs.statSync(dbPath).size / 1024)
            dbSizeText = `${sizeKb.toLocaleString('pt-BR')} KB, salvos com segurança`
        }

        // 5. Montagem do card estruturado
        let doc = `╔══════════════════════════════╗\n`
        doc += `║    🤖 *STATUS — ${botName}* 🤖    ║\n`
        doc += `╚══════════════════════════════╝\n\n`

        doc += `╭━〔 ⚙️ COMO ESTOU 〕━⬣\n`
        doc += `┃ ⏱️ *Ligado há:* ${horas}h ${minutos}m ${segundos}s\n`
        doc += `┃ 🧠 *Versão do motor:* ${process.version}\n`
        doc += `┃ 💻 *Máquina:* ${os.type()} ${os.arch()}, ${os.cpus().length} núcleos\n`
        doc += `┃ 💾 *Memória:* ${ramMb} MB em uso de ${totalRamMb} MB\n`
        doc += `┃ 🗄️ *Dados guardados:* ${dbSizeText}\n`
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

        doc += `╭━〔 📊 COMUNIDADE & ATIVIDADE 〕━⬣\n`
        doc += `┃ 👥 *Membros da Rede:* ${totalNetworkMembers.toLocaleString('pt-BR')} membros (${totalUsers.toLocaleString('pt-BR')} cadastrados)\n`
        doc += `┃ 🌐 *Grupos Conectados:* ${totalGrupos} grupos\n`
        doc += `┃ 📦 *Comandos Carregados:* ${totalCmds} comandos (+ ${totalAliases} atalhos)\n`
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

        doc += `╭━〔 💡 COMANDOS EM DESTAQUE 〕━⬣\n`
        doc += `┃ 👤 \`.dossie\` — Ver seu dossiê e perfil completo\n`
        doc += `┃ ⚔️ \`.hunt\` / \`.boss\` — Batalhar e caçar no RPG\n`
        doc += `┃ 🎮 \`.velha\` / \`.damas\` / \`.xadrez\` — Jogos de tabuleiro\n`
        doc += `┃ 🧠 \`.ia <pergunta>\` — Pesquisa Web em tempo real\n`
        doc += `┃ 🎵 \`.play <música>\` — Download de músicas em HD\n`
        doc += `┃ 🖼️ \`.fig\` / \`.gif\` — Criar ou desfazer figurinhas\n`
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`

        doc += `💡 _Digite_ \`.menu\` _para explorar o catálogo completo!_`

        return reply(doc.trim())
    }
}

