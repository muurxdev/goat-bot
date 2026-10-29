/**
 * Comando .esportefutebol — FUTEBOL & TABELAS AO VIVO
 *
 * Regras, curiosidades, tabelas em tempo real e jogos do dia (➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ / Clube dos Campeões).
 */

const L = require('../../services/lifestyleService')
const futebolService = require('../../services/futebolService')
const F = require('../../utils/formato')

function cab(titulo, emoji) {
    return '╔══════════════════════════════╗\n║   ' + emoji + ' *' + titulo + '*\n╚══════════════════════════════╝\n\n'
}
function linha(rotulo, valor) { return '┃ *' + rotulo + ':* ' + valor + '\n' }
function sep() { return '┣━━━━━━━━━━━━━━━━━━━━━━━━┫\n' }

module.exports = {
    name: 'esportefutebol',
    aliases: ["regrasfutebol"],
    category: 'general',
    subcategory: 'Cozinha e Treino',
    description: 'Regras, tabelas ao vivo e jogos do futebol mundial (Clube dos Campeões)',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const sub = (args[0] || '').toLowerCase().trim()
        const param = (args[1] || '').toLowerCase().trim()

        // 1. Tabela ao vivo (.esportefutebol tabela [brasileirao | serieb | champions | premier | laliga])
        if (sub === 'tabela' || sub === 'classificacao' || sub === 'standings') {
            const league = param || 'brasileirao'
            const data = await futebolService.getStandings(league)
            return reply(futebolService.formatarTabela(data, 12))
        }

        // 2. Jogos e placar ao vivo (.esportefutebol jogos [hoje])
        if (sub === 'jogos' || sub === 'rodada' || sub === 'placar' || sub === 'hoje') {
            const league = param || 'brasileirao'
            const data = await futebolService.getScoreboard(league)
            return reply(futebolService.formatarJogos(data))
        }

        // 3. Regras clássicas (.esportefutebol regras)
        if (sub === 'regras' || sub === 'como' || sub === 'manual') {
            const e = L.ESPORTES['futebol']
            let doc = cab('FUTEBOL — REGRAS', '🏅')
            doc += linha('Jogadores', e.jogadores)
            doc += linha('Duração', e.duracao)
            doc += linha('Origem', e.origem)
            doc += sep()
            doc += '📋 *Como se ganha*\n' + e.regra + '\n\n'
            doc += '🔎 *Curiosidade*\n' + e.curiosidade
            doc += '\n\n🏟️ _Outros esportes:_ `' + prefix + 'listaesportes`'
            return reply(doc)
        }

        // 4. Menu Central Interativo do ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ / Clube dos Campeões
        const e = L.ESPORTES['futebol']
        return reply(F.tela({
            emoji: '⚽',
            titulo: 'Futebol // Clube dos Campeões (➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤)',
            intro: 'Central esportiva com tabelas em tempo real, jogos da rodada e regras oficiais.',
            secoes: [
                { emoji: '🏆', titulo: 'Tabelas em Tempo Real', linhas: [
                    `• \`${prefix}esportefutebol tabela brasileirao\` — Série A`,
                    `• \`${prefix}esportefutebol tabela serieb\` — Série B`,
                    `• \`${prefix}esportefutebol tabela champions\` — Champions League`,
                    `• \`${prefix}esportefutebol tabela premier\` — Premier League`,
                    `• \`${prefix}esportefutebol tabela laliga\` — La Liga`
                ] },
                { emoji: '🏟️', titulo: 'Jogos e Placares', linhas: [
                    `• \`${prefix}esportefutebol jogos\` — Jogos de hoje e placares ao vivo`,
                    `• \`${prefix}esportefutebol regras\` — Regras e curiosidades do futebol`
                ] }
            ],
            dica: `Origem: ${e.origem} · Duração: ${e.duracao}`,
            prefix
        }))
    }
}
