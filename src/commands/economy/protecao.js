/**
 * Comando .protecao — compra escudo anti-roubo por 24h.
 *
 * Sem argumento mostra o status (e quanto falta). Com `comprar`, compra.
 * Pedir confirmação explícita evita que alguém gaste 1.000 sem querer só por
 * ter digitado o comando para consultar.
 */

const logger = require('../../core/logger')
const economy = require('../../services/economyService')
const shieldEngine = require('../../services/shieldEngine')
const dataService = require('../../services/dataService')

module.exports = {
    name: 'protecao',
    aliases: ["escudo","antirroubo","antiroubo","protecaoroubo","forjarescudo","cmd_protecao","alt_protecao","atalho_protecao","abrev_protecao","call_protecao","func_protecao"],
    category: 'economy',
    subcategory: 'Proteção',
    description: 'Forja e gerencia escudos com HP destrutível e proteção contra PvP e Roubo',
    cooldownMs: 3000,
    execute: async ({ sender, args, reply, prefix = '.' }) => {
        const user = economy.carregarUsuario(sender)
        const status = shieldEngine.getShieldStatus(user)
        const acao = (args[0] || '').toLowerCase()
        const durationParam = (args[1] || '24h').toLowerCase()

        if (!['comprar', 'buy', 'ativar', 'renovar', 'forjar'].includes(acao)) {
            let doc = `╔══════════════════════════════╗\n`
            doc += `║   🛡️ *SISTEMA DE ESCUDO & DEFESA* 🛡️  ║\n`
            doc += `╚══════════════════════════════╝\n\n`

            if (status.inCooldown) {
                const hours = (status.cooldownLeftMs / 3600000).toFixed(1)
                doc += `⚠️ *STATUS: ESCUDO ESTILHAÇADO EM COMBATE*\n`
                doc += `💥 Seu escudo foi destruído em confronto recente!\n`
                doc += `⏳ *Desprotegido por:* Mais ${hours} horas para reconstrução da defesa.\n\n`
            } else if (status.active) {
                const hpBar = shieldEngine.renderHpBar(status.hp, status.maxHp, 10)
                const hpPercent = Math.round((status.hp / status.maxHp) * 100)
                const hoursLeft = (status.timeLeftMs / 3600000).toFixed(1)

                doc += `✅ *STATUS: ATIVO E OPERANTE*\n`
                doc += `🛡️ *Escudo:* ${status.emoji} **${status.name}**\n`
                doc += `❤️ *Integridade:* [${hpBar}] ${status.hp.toLocaleString('pt-BR')} / ${status.maxHp.toLocaleString('pt-BR')} HP (${hpPercent}%)\n`
                doc += `🔰 *Absorção de Impacto:* ${status.absorcao}% de todo dano recebido em PvP e Roubos\n`
                doc += `⏳ *Tempo Restante:* ${hoursLeft} horas de proteção\n\n`
                doc += `💡 _Se o HP do escudo zerar em combate, ele estilhaça e você fica desprotegido!_\n`
            } else {
                const recommendedTier = shieldEngine.getBestTierForLevel(user.level || 1)
                const cost24h = shieldEngine.calculateShieldCost(user.coins || 0, recommendedTier, '24h')

                doc += `❌ *STATUS: DESPROTEGIDO*\n`
                doc += `⚠️ Você está vulnerável a ataques em PvP e tentativas de roubo!\n\n`
                doc += `╭━〔 🔨 ESCUDO RECOMENDADO P/ SEU NÍVEL 〕━⬣\n`
                doc += `┃ ${recommendedTier.emoji} *${recommendedTier.name}*\n`
                doc += `┃ ❤️ *HP Máximo:* ${recommendedTier.baseHp.toLocaleString('pt-BR')} HP\n`
                doc += `┃ 🔰 *Absorção:* ${recommendedTier.absorcao}% de redução de dano\n`
                doc += `┃ 💰 *Preço (24h):* ~${cost24h.toLocaleString('pt-BR')} Coins (30% do saldo)\n`
                doc += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━⬣\n\n`
                doc += `⏳ *Durações Disponíveis:*\n`
                doc += `• \`${prefix}protecao comprar 1h\`  — 1 Hora (10% coins)\n`
                doc += `• \`${prefix}protecao comprar 6h\`  — 6 Horas (20% coins)\n`
                doc += `• \`${prefix}protecao comprar 24h\` — 1 Dia (30% coins)\n`
                doc += `• \`${prefix}protecao comprar 7d\`  — 7 Dias (40% coins)\n`
                doc += `• \`${prefix}protecao comprar 30d\` — 1 Mês (50% coins)\n\n`
                doc += `👉 _Digite \`${prefix}protecao comprar\` para forjar seu escudo agora!_`
            }

            doc += `\n💰 *Seu Saldo:* ${(user.coins || 0).toLocaleString('pt-BR')} Coins | ⭐ *Nível:* ${user.level || 1}`
            return reply(doc.trim())
        }

        const durKey = ['1h', '6h', '24h', '1d', '7d', '30d', '1m'].includes(durationParam) ? durationParam : '24h'
        const result = shieldEngine.buyShield(user, null, durKey)

        if (!result.ok) {
            return reply(result.error)
        }

        try {
            dataService.saveUser(user)
        } catch (errIgnorado) { logger.warn(`[PROTECAO] Falha ignorada em src/commands/economy/protecao.js:81: ${errIgnorado.message}`) }

        const hpBar = shieldEngine.renderHpBar(result.shield.hp, result.shield.maxHp, 10)
        let res = `╔══════════════════════════════╗\n`
        res += `║   🛡️ *ESCUDO FORJADO COM SUCESSO!* 🛡️ ║\n`
        res += `╚══════════════════════════════╝\n\n`
        res += `${result.shield.emoji} *Equipamento:* **${result.shield.name}**\n`
        res += `❤️ *Integridade:* [${hpBar}] ${result.shield.hp.toLocaleString('pt-BR')} HP\n`
        res += `🔰 *Absorção:* ${result.shield.absorcao}% de dano absorvido\n`
        res += `⏳ *Duração da Forja:* ${result.durationLabel}\n`
        res += `💸 *Investimento:* ${result.cost.toLocaleString('pt-BR')} Coins\n`
        res += `🏦 *Saldo Restante:* ${result.remainingCoins.toLocaleString('pt-BR')} Coins\n\n`
        res += `🔒 _Seu escudo amortecerá impactos de PvP e repelirá ladrões até o término da durabilidade!_`

        return reply(res.trim())
    }
}
