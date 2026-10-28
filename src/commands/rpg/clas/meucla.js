const clanService = require('../../../services/clanService')

module.exports = {
    name: 'meucla',
    aliases: [],
    category: 'rpg',
    subcategory: 'Clãs & Guildas',
    description: 'Exibe os dados, membros e cofre do seu clã',
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const clan = clanService.getUserClan(sender)
        if (!clan) return reply('Você não pertence a nenhum clã. Crie um com `.criarcla <nome>`!')

        const buff = clanService.getClanTerritoryBuff(sender)
        let txt = `╔═══════ 🛡️ *CLÃ: \${clan.nome.toUpperCase()}* ═══════╗\n\n`
        txt += `👑 *Líder:* \${clan.isOwner ? 'Você' : 'Cavaleiro Sagrado'}\n`
        txt += `⭐ *Nível do Clã:* Nível \${clan.level}\n`
        txt += `👥 *Membros Alistados:* \${clan.membros.length} guerreiros\n`
        txt += `💰 *Cofre do Clã:* \${(clan.coins || 0).toLocaleString('pt-BR')} moedas\n`
        txt += `📈 *XP do Clã:* \${(clan.xp || 0).toLocaleString('pt-BR')} XP\n\n`
        txt += '╭━〔 🏰 BÔNUS DE TERRITÓRIOS CONQUISTADOS 〕━⬣\n'
        txt += `┃ 🌍 Territórios Ocupados: \${buff.territoriesCount}\n`
        txt += `┃ ⚡ Bônus de XP: +\${Math.round(buff.bonusXp * 100)}% em batalhas\n`
        txt += `┃ 🪙 Bônus de Moedas: +\${Math.round(buff.bonusCoins * 100)}% em drops\n`
        txt += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
        txt += '💡 Doe moedas para subir o nível do clã: `.doarcla <valor>`.'
        return reply(txt.trim())
    }
}
