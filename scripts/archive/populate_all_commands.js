const fs = require('fs')
const path = require('path')

const baseDir = path.join(__dirname, '..', 'src', 'commands')

const commands = {}

// ADMIN
commands['admin/antilink.js'] = `const dataService = require('../../services/dataService')
const logger = require('../../core/logger')

module.exports = {
    name: 'antilink',
    aliases: ['antlink'],
    category: 'admin',
    description: 'Ativa ou desativa a proteção anti-link no grupo (.antilink on/off)',
    groupOnly: true,
    adminOnly: true,
    execute: async ({ text, from, sender, reply }) => {
        const configs = dataService.getConfigsData()
        if (!configs[from]) configs[from] = {}

        const opt = text ? text.toLowerCase().trim() : ''
        if (opt === 'on') {
            configs[from].antilink = true
        } else if (opt === 'off') {
            configs[from].antilink = false
        } else {
            return reply('❌ Use: .antilink on ou .antilink off')
        }

        await dataService.saveConfigsData(configs)
        logger.info('[ANTILINK] Admin configurou antilink como ' + opt + ' em ' + from)
        await reply('✅ *Anti-link:* ' + opt.toUpperCase())
    }
}`

commands['admin/clear.js'] = `const logger = require('../../core/logger')

module.exports = {
    name: 'clear',
    aliases: ['apagar', 'delete', 'del'],
    category: 'admin',
    description: 'Apaga a mensagem citada',
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    execute: async ({ info, from, client }) => {
        const quotedKey = info.message?.extendedTextMessage?.contextInfo?.stanzaId
        const quotedParticipant = info.message?.extendedTextMessage?.contextInfo?.participant

        if (quotedKey) {
            await client.sendMessage(from, {
                delete: {
                    remoteJid: from,
                    fromMe: false,
                    id: quotedKey,
                    participant: quotedParticipant
                }
            })
        } else {
            await client.sendMessage(from, { delete: info.key })
        }
    }
}`

commands['admin/kick.js'] = `const logger = require('../../core/logger')

module.exports = {
    name: 'kick',
    aliases: ['ban', 'remover', 'expulsar'],
    category: 'admin',
    description: 'Remove um membro do grupo',
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    execute: async ({ info, from, sender, client, reply }) => {
        const userKick = info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        if (!userKick) {
            return reply('❌ Marque o membro que deseja remover. Exemplo: .kick @usuario')
        }

        await client.groupParticipantsUpdate(from, [userKick], 'remove')
        logger.info('[KICK] Admin removeu ' + userKick + ' de ' + from)
        await reply('✅ Membro removido com sucesso.')
    }
}`

commands['admin/warn.js'] = `const dataService = require('../../services/dataService')
const logger = require('../../core/logger')

module.exports = {
    name: 'warn',
    aliases: ['advertir', 'aviso'],
    category: 'admin',
    description: 'Aplica uma advertência a um membro (3 advertências = expulsão)',
    groupOnly: true,
    adminOnly: true,
    execute: async ({ info, from, sender, isBotAdmin, client, reply }) => {
        const warned = info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        if (!warned) {
            return reply('❌ Marque o usuário para aplicar advertência. Exemplo: .warn @usuario')
        }

        const warns = dataService.getWarnsData()
        warns[warned] = (warns[warned] || 0) + 1
        await dataService.saveWarnsData(warns)

        logger.info('[WARN] Admin advertiu ' + warned + ' (' + warns[warned] + '/3)')
        await reply('⚠️ *Aviso aplicado!*\\n\\nTotal de advertências: *' + warns[warned] + '/3*')

        if (warns[warned] >= 3) {
            if (isBotAdmin) {
                await client.groupParticipantsUpdate(from, [warned], 'remove')
                warns[warned] = 0
                await dataService.saveWarnsData(warns)
                await reply('🚫 Usuário removido automaticamente por atingir o limite de 3 advertências.')
            } else {
                await reply('⚠️ O usuário atingiu 3 advertências, mas o bot precisa de permissão de administrador para removê-lo.')
            }
        }
    }
}`

commands['admin/warnings.js'] = `const dataService = require('../../services/dataService')

module.exports = {
    name: 'warnings',
    aliases: ['avisos', 'warns'],
    category: 'admin',
    description: 'Consulta a quantidade de advertências de um usuário',
    groupOnly: true,
    execute: async ({ info, sender, reply }) => {
        const warnedUser = info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || sender
        const warns = dataService.getWarnsData()
        const total = warns[warnedUser] || 0

        await reply('⚠️ *Advertências de @' + warnedUser.split('@')[0] + ':*\\n\\n' + total + ' / 3', [warnedUser])
    }
}`

// DEV
commands['dev/api.js'] = `module.exports = {
    name: 'api',
    aliases: ['apis'],
    category: 'dev',
    description: 'Lista de APIs públicas e gratuitas para desenvolvedores',
    execute: async ({ reply }) => {
        const apiList = \`🌐 *APIs PÚBLICAS E GRATUITAS PARA PROJETOS:*

• *PokeAPI:* https://pokeapi.co/
• *JSONPlaceholder:* https://jsonplaceholder.typicode.com/
• *Rick and Morty:* https://rickandmortyapi.com/
• *OpenWeather:* https://openweathermap.org/api
• *GitHub API:* https://docs.github.com/rest\`
        await reply(apiList)
    }
}`

commands['dev/backend.js'] = `module.exports = {
    name: 'backend',
    aliases: ['back'],
    category: 'dev',
    description: 'Roadmap e conceitos de desenvolvimento Backend',
    execute: async ({ reply }) => {
        const back = \`🟢 *ROADMAP BACKEND:*

Node.js / TypeScript → Express ou NestJS
→ Bancos de Dados (SQL & NoSQL)
→ Autenticação (JWT, OAuth2)
→ Docker & Microsserviços
→ Deploy & CI/CD

🌐 *Guia Completo:* https://roadmap.sh/backend\`
        await reply(back)
    }
}`

commands['dev/color.js'] = `module.exports = {
    name: 'color',
    aliases: ['hex', 'cor'],
    category: 'dev',
    description: 'Exibe informações sobre uma cor hexadecimal',
    execute: async ({ text, reply }) => {
        if (!text) return reply('❌ Digite uma cor hexadecimal. Exemplo: .color #3498db')
        const hex = text.replace(/#/g, '').trim()
        await reply('🎨 https://www.colorhexa.com/' + hex)
    }
}`

commands['dev/data.js'] = `module.exports = {
    name: 'data',
    aliases: ['date', 'hoje'],
    category: 'dev',
    description: 'Exibe a data atual do servidor',
    execute: async ({ reply }) => {
        const data = new Date().toLocaleDateString('pt-BR')
        await reply('📅 *Data atual:* ' + data)
    }
}`

commands['dev/deploy.js'] = `module.exports = {
    name: 'deploy',
    aliases: ['hospedar'],
    category: 'dev',
    description: 'Plataformas recomendadas para deploy de aplicações',
    execute: async ({ reply }) => {
        const deployInfo = \`🚀 *PLATAFORMAS DE DEPLOY RECOMENDADAS:*

⚡ *Vercel* → Frontend & Next.js
🌐 *Netlify* → Sites estáticos e SPAs
🟢 *Render* → APIs Node.js & Docker
🐳 *Railway* → Aplicações completas & Bancos de dados
☁️ *Heroku* → Hospedagem gerenciada\`
        await reply(deployInfo)
    }
}`

commands['dev/desafio.js'] = `const { desafios } = require('../../utils/constants')

module.exports = {
    name: 'desafio',
    aliases: ['quiz', 'pergunta'],
    category: 'dev',
    description: 'Envia um desafio ou pergunta rápida de programação',
    execute: async ({ reply }) => {
        const desafio = desafios[Math.floor(Math.random() * desafios.length)]
        await reply('🎯 *DESAFIO DO DEV*\\n\\n' + desafio)
    }
}`

commands['dev/docs.js'] = `module.exports = {
    name: 'docs',
    aliases: ['documentacao'],
    category: 'dev',
    description: 'Documentações úteis de programação',
    execute: async ({ text, reply }) => {
        const lang = text ? text.toLowerCase().trim() : ''
        if (lang === 'js' || lang === 'javascript') {
            return reply('📘 https://developer.mozilla.org/pt-BR/docs/Web/JavaScript')
        }
        if (lang === 'node' || lang === 'nodejs') {
            return reply('🟢 https://nodejs.org/docs/latest/api/')
        }
        if (lang === 'react') {
            return reply('⚛️ https://react.dev/')
        }
        if (lang === 'python') {
            return reply('🐍 https://docs.python.org/3/')
        }
        return reply('❌ Digite: .docs js, .docs node, .docs react ou .docs python')
    }
}`

commands['dev/roadmap.js'] = `module.exports = {
    name: 'roadmap',
    aliases: ['trilha'],
    category: 'dev',
    description: 'Trilhas de aprendizado para carreiras em desenvolvimento',
    execute: async ({ text, reply }) => {
        const t = text ? text.toLowerCase().trim() : ''
        if (t === 'frontend') return reply('🧭 *Roadmap Frontend:* https://roadmap.sh/frontend')
        if (t === 'backend') return reply('🧭 *Roadmap Backend:* https://roadmap.sh/backend')
        if (t === 'mobile' || t === 'android') return reply('🧭 *Roadmap Mobile:* https://roadmap.sh/android')
        return reply('❌ Digite: .roadmap frontend, .roadmap backend ou .roadmap mobile')
    }
}`

commands['dev/search.js'] = `module.exports = {
    name: 'search',
    aliases: ['stackoverflow', 'so', 'pesquisa'],
    category: 'dev',
    description: 'Pesquisa dúvidas e soluções no Stack Overflow',
    execute: async ({ text, reply }) => {
        if (!text) return reply('❌ Digite algo para pesquisar. Exemplo: .search javascript array filter')
        await reply('🔎 https://stackoverflow.com/search?q=' + encodeURIComponent(text.trim()))
    }
}`

commands['dev/setup.js'] = `module.exports = {
    name: 'setup',
    category: 'dev',
    description: 'Setup e ferramentas recomendadas para desenvolvedores',
    execute: async ({ reply }) => {
        const setup = \`💻 *SETUP RECOMENDADO PARA DEVS:*

🖥 *Editor:* VS Code
🌐 *Navegador:* Chrome DevTools
📦 *Ambiente:* Node.js LTS + Git
⚡ *Terminal:* Zsh / Linux / Termux

🔌 *Extensões essenciais do VS Code:*
• Prettier (Formatador de código)
• Error Lens (Exibe erros inline no editor)
• ES7 Snippets (Snippets rápidos de React/JS)
• GitLens (Controle e histórico do Git)\`
        await reply(setup)
    }
}`

commands['dev/stack.js'] = `module.exports = {
    name: 'stack',
    aliases: ['techstack'],
    category: 'dev',
    description: 'Sugestão de stack moderna para desenvolvimento web',
    execute: async ({ reply }) => {
        const stackInfo = \`💻 *STACK MODERNA RECOMENDADA:*

🎨 *Frontend:* React + Next.js + TailwindCSS
⚙️ *Backend:* Node.js / TypeScript + Express / Fastify
🗄 *Banco de Dados:* PostgreSQL / MongoDB + Prisma ORM
🚀 *Deploy:* Vercel + Render / Railway\`
        await reply(stackInfo)
    }
}`

commands['dev/vagas.js'] = `module.exports = {
    name: 'vagas',
    aliases: ['jobs', 'trampo'],
    category: 'dev',
    description: 'Principais plataformas de vagas de tecnologia',
    execute: async ({ reply }) => {
        const vagas = \`💼 *PLATAFORMAS DE VAGAS DEV:*

🌐 *LinkedIn Jobs:* https://linkedin.com/jobs
🌐 *GitHub Careers:* https://github.careers
🌐 *We Work Remotely:* https://weworkremotely.com
🌐 *Remote OK:* https://remoteok.com
🌐 *ProgramaThor:* https://programathor.com.br/jobs\`
        await reply(vagas)
    }
}`

// GENERAL
commands['general/calc.js'] = `const math = require('mathjs')
const { validateMathExpression } = require('../../utils/validators')

module.exports = {
    name: 'calc',
    aliases: ['calcular', 'math'],
    category: 'general',
    description: 'Calcula expressões matemáticas com segurança',
    execute: async ({ text, reply }) => {
        if (!text) {
            return reply('❌ Informe a expressão matemática. Exemplo: .calc 2 + 2 * 3')
        }

        const validExpr = validateMathExpression(text)
        if (!validExpr) {
            return reply('❌ Expressão inválida. Apenas números e operadores matemáticos (+, -, *, /, ^, %, parênteses) são permitidos.')
        }

        try {
            const resultado = math.evaluate(validExpr)
            if (!isFinite(resultado)) {
                return reply('❌ O resultado do cálculo é infinito ou indefinido.')
            }
            await reply('🔢 *Cálculo:* ' + validExpr + '\\n🟰 *Resultado:* ' + resultado)
        } catch (err) {
            await reply('❌ Erro na sintaxe do cálculo. Verifique os parênteses e operadores.')
        }
    }
}`

commands['general/dono.js'] = `const env = require('../../config/env')

module.exports = {
    name: 'dono',
    aliases: ['owner', 'criador'],
    category: 'general',
    description: 'Exibe informações do dono/desenvolvedor do bot',
    execute: async ({ reply }) => {
        const donoInfo = '👑 *DONO DO BOT*\\n\\n👨‍💻 *Desenvolvedor:* Marty no Money 寂 (+55 49 9149-8061)\\n👨‍🔧 *Co-Desenvolvedor:* Mumu (+55 16 99711-0418)\\n🏷️ *Marca:* SkyCode Bots\\n📱 *Contato:* ' + (env.botOwnerId || 'Configurado via .env')
        await reply(donoInfo)
    }
}`

commands['general/escrever.js'] = `module.exports = {
    name: 'escrever',
    aliases: ['say', 'falar', 'echo'],
    category: 'general',
    description: 'Envia o texto digitado pelo usuário',
    execute: async ({ text, reply }) => {
        if (!text) return reply('❌ Digite o texto para ser enviado.')
        await reply(text)
    }
}`

commands['general/id.js'] = `module.exports = {
    name: 'id',
    aliases: ['chatid'],
    category: 'general',
    description: 'Exibe o ID do chat ou usuário atual',
    execute: async ({ from, reply }) => {
        await reply('🆔 *ID do Chat:*\\n' + from)
    }
}`

commands['general/info.js'] = `module.exports = {
    name: 'info',
    aliases: ['sobre', 'botinfo'],
    category: 'general',
    description: 'Informações sobre a arquitetura e tecnologias do bot',
    execute: async ({ reply }) => {
        const uptime = process.uptime()
        const horas = Math.floor(uptime / 3600)
        const minutos = Math.floor((uptime % 3600) / 60)
        const segundos = Math.floor(uptime % 60)

        const mem = process.memoryUsage()
        const ramMb = Math.round(mem.rss / 1024 / 1024)

        const info = '🤖 *GOAT BOT XP — INFORMAÇÕES*\\n\\n⚡ *Versão:* 2.0.0 (Modular Engine + SQLite)\\n🧠 *Linguagem:* Node.js (' + process.version + ')\\n📦 *Biblioteca:* @whiskeysockets/baileys\\n⏱️ *Uptime:* ' + horas + 'h ' + minutos + 'm ' + segundos + 's\\n💾 *Memória RAM:* ' + ramMb + ' MB\\n👨‍💻 *Criador:* Marty no Money 寂 (+55 49 9149-8061)\\n👨‍🔧 *Co-Desenvolvedor:* Mumu (+55 16 99711-0418)'
        await reply(info)
    }
}`

commands['general/menu.js'] = `const env = require('../../config/env')

module.exports = {
    name: 'menu',
    aliases: ['help', 'comandos', 'ajuda'],
    category: 'general',
    description: 'Exibe o menu principal de comandos do bot',
    execute: async ({ reply }) => {
        const p = env.prefix || '.'
        const menu = \`╔══════════════════════════════╗
║        🤖 GOAT BOT 🤖
╚══════════════════════════════╝

╭━〔 📚 INFORMAÇÕES 〕━⬣
┃ ➤ \${p}menu
┃ ➤ \${p}ping
┃ ➤ \${p}info
┃ ➤ \${p}dono
┃ ➤ \${p}id
╰━━━━━━━━━━━━━━━━━━⬣

╭━〔 🏆 PERFIL & RANK 〕━⬣
┃ ➤ \${p}xp
┃ ➤ \${p}me
┃ ➤ \${p}rank
┃ ➤ \${p}rankcoins
┃ ➤ \${p}ranksemana
┃ ➤ \${p}stats
┃ ➤ \${p}daily
┃ ➤ \${p}rep @pessoa
╰━━━━━━━━━━━━━━━━━━⬣

╭━〔 ⚔️ DUELOS 〕━⬣
┃ ➤ \${p}duelo @pessoa
╰━━━━━━━━━━━━━━━━━━⬣

╭━〔 🧪 POÇÕES 〕━⬣
┃ ➤ \${p}pocao
┃ ➤ \${p}criarpocao nome
┃ ➤ \${p}usarpocao nome
┃ ➤ \${p}pocaoativa
╰━━━━━━━━━━━━━━━━━━⬣

╭━〔 🏟️ ARENAS 〕━⬣
┃ ➤ \${p}arena
┃ ➤ \${p}batalhar
┃ ➤ \${p}cartas
┃ ➤ \${p}arenainfo
┃ ➤ \${p}arenarank
╰━━━━━━━━━━━━━━━━━━⬣

╭━〔 📜 MISSÕES 〕━⬣
┃ ➤ \${p}missao
┃ ➤ \${p}missao concluir
╰━━━━━━━━━━━━━━━━━━⬣

╭━〔 ⚔️ RPG DEV 〕━⬣
┃ ➤ \${p}hunt
┃ ➤ \${p}mundo
┃ ➤ \${p}viajar mundo
╰━━━━━━━━━━━━━━━━━━⬣

╭━〔 🐉 BOSSES 〕━⬣
┃ ➤ \${p}boss criar nome
┃ ➤ \${p}boss atk
┃ ➤ \${p}atk
┃ ➤ \${p}boss ajudar @pessoa
┃ ➤ \${p}boss lista
┃ ➤ \${p}boss loot
╰━━━━━━━━━━━━━━━━━━⬣

╭━〔 👾 MOBS 〕━⬣
┃ ➤ \${p}mob lista
┃ ➤ \${p}mob loot
┃ ➤ \${p}hunt
╰━━━━━━━━━━━━━━━━━━⬣

╭━〔 ⚔️ CLASSES 〕━⬣
┃ ➤ \${p}classe lista
┃ ➤ \${p}classe info nome
┃ ➤ \${p}classe escolher nome
┃ ➤ \${p}classeshop
┃ ➤ \${p}comprarclasse nome
╰━━━━━━━━━━━━━━━━━━⬣

╭━〔 🔮 LENDÁRIAS 〕━⬣
┃ ➤ \${p}lendaria lista
┃ ➤ \${p}lendaria info nome
┃ ➤ \${p}lendaria desbloquear nome
╰━━━━━━━━━━━━━━━━━━⬣

╭━〔 🐾 PETS 〕━⬣
┃ ➤ \${p}pet loja
┃ ➤ \${p}pet meus
┃ ➤ \${p}pet comprar nome
┃ ➤ \${p}pet equipar nome
╰━━━━━━━━━━━━━━━━━━⬣

╭━〔 🏰 GUILDAS 〕━⬣
┃ ➤ \${p}guilda criar nome
┃ ➤ \${p}guilda entrar nome
┃ ➤ \${p}guilda sair
┃ ➤ \${p}guilda info
╰━━━━━━━━━━━━━━━━━━⬣

╭━〔 🎒 INVENTÁRIO 〕━⬣
┃ ➤ \${p}inv
┃ ➤ \${p}mochila
┃ ➤ \${p}mochila up
┃ ➤ \${p}vender loot
╰━━━━━━━━━━━━━━━━━━⬣

╭━〔 ⚒️ CRAFT & EQUIPS 〕━⬣
┃ ➤ \${p}lootshop
┃ ➤ \${p}equipshop
┃ ➤ \${p}craft lista
┃ ➤ \${p}craft fazer nome
┃ ➤ \${p}craft meus
┃ ➤ \${p}equip item
╰━━━━━━━━━━━━━━━━━━⬣

╭━〔 🛒 ECONOMIA DEV 〕━⬣
┃ ➤ \${p}shop
┃ ➤ \${p}buy nome
┃ ➤ \${p}daily
╰━━━━━━━━━━━━━━━━━━⬣

╭━〔 🛡️ ADMINISTRAÇÃO 〕━⬣
┃ ➤ \${p}kick @pessoa
┃ ➤ \${p}warn @pessoa
┃ ➤ \${p}warnings @pessoa
┃ ➤ \${p}antilink on/off
┃ ➤ \${p}clear
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━━━━━━━━━━━━━━━━⬣
┃ 👨‍💻 Criador: Marty no Money 寂 (+55 49 9149-8061)
┃ 👨‍🔧 Co-Desenvolvedor: Mumu (+55 16 99711-0418)
┃ ⚡ Versão: 2.0.0 (Modular + SQLite)
┃ 📌 Prefixo: \${p}
╰━━━━━━━━━━━━━━━━━━⬣\`
        await reply(menu)
    }
}`

commands['general/meuid.js'] = `module.exports = {
    name: 'meuid',
    aliases: ['myid', 'jid'],
    category: 'general',
    description: 'Exibe o seu ID ou o ID do usuário mencionado',
    execute: async ({ info, sender, reply }) => {
        const alvoId = info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || sender
        await reply('🆔 *ID:*\\n' + alvoId)
    }
}`

commands['general/ping.js'] = `module.exports = {
    name: 'ping',
    aliases: ['p', 'latencia'],
    category: 'general',
    description: 'Verifica a latência e tempo de resposta do bot',
    execute: async ({ reply }) => {
        const start = Date.now()
        await reply('🏓 Pong!')
        const latencia = Date.now() - start
        await reply('⚡ Latência: ' + latencia + 'ms')
    }
}`

// MEDIA
commands['media/fig.js'] = `const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const { downloadContentFromMessage } = require('@whiskeysockets/baileys')
const { tempDir } = require('../../config/paths')
const logger = require('../../core/logger')

module.exports = {
    name: 'fig',
    aliases: ['s', 'sticker', 'figurinha'],
    category: 'media',
    description: 'Converte imagens em figurinhas do WhatsApp',
    execute: async ({ info, type, from, client, reply }) => {
        const quoted = info.message?.extendedTextMessage?.contextInfo?.quotedMessage
        const isImage = type === 'imageMessage'
        const isQuotedImage = quoted?.imageMessage

        if (!isImage && !isQuotedImage) {
            return reply('❌ Envie uma imagem com legenda .fig ou responda a uma imagem com .fig')
        }

        const imageMessage = isImage ? info.message.imageMessage : quoted.imageMessage
        const media = await downloadContentFromMessage(imageMessage, 'image')
        let buffer = Buffer.from([])

        for await (const chunk of media) {
            buffer = Buffer.concat([buffer, chunk])
        }

        const id = Date.now()
        const input = path.join(tempDir, 'fig-in-' + id + '.jpg')
        const output = path.join(tempDir, 'fig-out-' + id + '.webp')

        fs.writeFileSync(input, buffer)

        exec('ffmpeg -y -i "' + input + '" -vf "scale=512:-1" -vcodec libwebp -lossless 0 -q:v 75 -preset picture -an -vsync 0 "' + output + '"', async (err) => {
            try {
                if (err) {
                    logger.error('[FIG ERROR] Falha no FFmpeg:', err)
                    return reply('❌ Erro ao converter figurinha. Verifique se o FFmpeg está instalado.')
                }

                if (fs.existsSync(output)) {
                    const sticker = fs.readFileSync(output)
                    await client.sendMessage(from, { sticker }, { quoted: info })
                }
            } catch (errSend) {
                logger.error('[FIG SEND ERROR]', errSend)
                reply('❌ Erro ao enviar a figurinha.')
            } finally {
                try { if (fs.existsSync(input)) fs.unlinkSync(input) } catch (_) {}
                try { if (fs.existsSync(output)) fs.unlinkSync(output) } catch (_) {}
            }
        })
    }
}`

commands['media/play.js'] = `const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const { rootDir, tempDir } = require('../../config/paths')
const logger = require('../../core/logger')

module.exports = {
    name: 'play',
    aliases: ['musica', 'tocar', 'yt'],
    category: 'media',
    description: 'Pesquisa e baixa músicas do YouTube ou reproduz músicas locais',
    execute: async ({ text, from, info, client, reply }) => {
        if (!text) {
            return reply('❌ Use: .play nome da música ou .play local nome')
        }

        if (text.startsWith('local ')) {
            const nome = text.replace('local ', '').trim().replace(/[^a-zA-Z0-9_-]/g, '')
            const musica = path.join(rootDir, 'musicas', nome + '.mp3')

            if (!fs.existsSync(musica)) {
                return reply('❌ Música local não encontrada.')
            }

            return client.sendMessage(from, {
                audio: fs.readFileSync(musica),
                mimetype: 'audio/mpeg',
                ptt: false
            }, { quoted: info })
        }

        const queryLimpa = text.replace(/[\`$\\\";&|<>]/g, '').trim()
        if (!queryLimpa) {
            return reply('❌ Termo de pesquisa inválido.')
        }

        await reply('🔍 Procurando música no YouTube...')

        const id = Date.now()
        const audioFile = path.join(tempDir, 'yt-' + id + '.mp3')

        exec('yt-dlp "ytsearch1:' + queryLimpa.replace(/"/g, '') + '" --print "%(title)s|%(webpage_url)s|%(thumbnail)s" --skip-download', (errInfo, stdout) => {
            if (errInfo) {
                logger.error('[PLAY INFO ERROR]', errInfo)
                return reply('❌ Erro ao buscar informações da música. Verifique se o yt-dlp está instalado.')
            }

            const [titulo, link, thumb] = (stdout || '').trim().split('|')

            exec('yt-dlp "ytsearch1:' + queryLimpa.replace(/"/g, '') + '" -x --audio-format mp3 -o "' + audioFile + '"', async (err) => {
                try {
                    if (err) {
                        logger.error('[PLAY DOWNLOAD ERROR]', err)
                        return reply('❌ Erro ao baixar áudio. Verifique se yt-dlp e ffmpeg estão disponíveis.')
                    }

                    if (thumb && link) {
                        try {
                            await client.sendMessage(from, {
                                image: { url: thumb },
                                caption: '🎵 *' + (titulo || queryLimpa) + '*\\n\\n🔗 ' + link
                            }, { quoted: info })
                        } catch (_) {}
                    }

                    if (fs.existsSync(audioFile)) {
                        await client.sendMessage(from, {
                            audio: fs.readFileSync(audioFile),
                            mimetype: 'audio/mpeg',
                            ptt: false
                        }, { quoted: info })
                    }
                } catch (e) {
                    logger.error('[PLAY SEND ERROR]', e)
                    reply('❌ Erro ao enviar a música.')
                } finally {
                    try { if (fs.existsSync(audioFile)) fs.unlinkSync(audioFile) } catch (_) {}
                }
            })
        })
    }
}`

for (const [relPath, content] of Object.entries(commands)) {
    const fullPath = path.join(baseDir, relPath)
    fs.mkdirSync(path.dirname(fullPath), { recursive: true })
    fs.writeFileSync(fullPath, content, 'utf8')
}

console.log('✅ Arquivos de comandos gerais/admin/dev/media populados!')

