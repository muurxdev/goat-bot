/**
 * Comando .gitskills
 * Busca skills oficiais de agentes e inteligência artificial no GitHub, trazendo prévia do que a skill faz e o link oficial do repositório
 */

const https = require('https')
const { getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')

async function fetchGitHubSkills(query) {
    const searchQuery = encodeURIComponent(`${query} skill in:name,description,topics`)
    const url = `https://api.github.com/search/repositories?q=${searchQuery}&sort=stars&order=desc&per_page=6`

    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: {
                'User-Agent': getBotName() + '-SkillSearch/2.0',
                'Accept': 'application/vnd.github.v3+json'
            }
        }, res => {
            let data = ''
            res.on('data', chunk => data += chunk)
            res.on('end', () => {
                try {
                    const json = JSON.parse(data)
                    resolve(json.items || [])
                } catch (err) {
                    reject(err)
                }
            })
        }).on('error', reject)
    })
}

module.exports = {
    name: 'gitskills',
    aliases: ['githubskills', 'agentskills', 'agyskill', 'findskills'],
    category: 'general',
    subcategory: 'IA & Pesquisa',
    description: 'Procura skills oficiais no GitHub com prévia de funcionalidade e link do repositório',
    cooldownMs: 3000,
    execute: async ({ text, args = [], reply, quotedText }) => {
        const query = (text || quotedText || args.join(' ')).trim()

        if (!query) {
            return reply('📦 *BUSCADOR DE SKILLS OFICIAIS NO GITHUB*\n\nInforme o termo ou tipo de skill que você procura.\n\n📌 *Exemplos:*\n• `.gitskills python`\n• `.gitskills antigravity`\n• `.gitskills web scraper`\n• `.gitskills automation`')
        }

        await reply(`🔍 *Buscando skills oficiais no GitHub para:* _"${query}"_... Aguarde.`)

        try {
            const items = await fetchGitHubSkills(query)

            if (!items || items.length === 0) {
                return reply(`ℹ️ Nenhuma skill encontrada no GitHub para o termo _"${query}"_. Tente buscar por palavras em inglês ou termos genéricos como \`bot\`, \`automation\`, \`tool\`.`)
            }

            let doc = `╔══════════════════════════════╗\n`
            doc += `║   📦 *SKILLS OFICIAIS NO GITHUB* 📦  ║\n`
            doc += `╚══════════════════════════════╝\n\n`
            doc += `🔎 *Termo:* _${query}_\n`
            doc += `📊 *Resultados Encontrados:* ${items.length}\n\n`

            items.slice(0, 5).forEach((item, index) => {
                const desc = item.description || 'Sem descrição informada no repositório.'
                const lang = item.language || 'Geral'
                const stars = item.stargazers_count || 0
                const forks = item.forks_count || 0
                const license = item.license?.spdx_id || item.license?.name || 'Open Source'

                doc += `╭━〔 #${index + 1} — *${item.name}* 〕━⬣\n`
                doc += `┃ 👤 *Autor:* ${item.owner?.login || 'Desconhecido'}\n`
                doc += `┃ 📝 *Prévia:* ${desc}\n`
                doc += `┃ 💻 *Linguagem:* ${lang} | ⚖️ *Licença:* ${license}\n`
                doc += `┃ ⭐ *Estrelas:* ${stars} | 🍴 *Forks:* ${forks}\n`
                doc += `┃ 🔗 *Repositório:* ${item.html_url}\n`
                doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
            })

            doc += `💡 _Utilize o link do repositório para clonar ou instalar a skill._`

            return reply(doc.trim())
        } catch (err) {
            logger.error('[GITSKILLS ERROR]', err)
            return reply('😕 *Não consegui buscar no GitHub agora.*\n\nTente de novo em instantes ou use outro termo de busca.')
        }
    }
}

