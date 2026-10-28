const dataService = require('../../services/dataService')
const { initializeUser } = require('../../services/xpService')
const { gerarMissao } = require('../../services/missionService')
const { hojeId } = require('../../utils/helpers')
const logger = require('../../core/logger')

module.exports = {
    name: 'missao',
    aliases: ['missoes', 'quest'],
    category: 'rpg',
    description: 'Consulta ou conclui sua missão diária (.missao / .missao concluir)',
    execute: async ({ text, sender, reply }) => {
        const missoesData = dataService.getMissoesData()
        const hoje = hojeId()

        if (!missoesData[sender] || missoesData[sender].dia !== hoje) {
            missoesData[sender] = {
                dia: hoje,
                missao: gerarMissao(),
                progresso: 0,
                concluida: false
            }
            await dataService.saveMissoesData(missoesData)
        }

        const m = missoesData[sender]
        const missao = m.missao

        if (text && text.toLowerCase().trim() === 'concluir') {
            if (m.concluida) return reply('✅ Você já concluiu sua missão de hoje.')
            if (m.progresso < missao.meta) {
                return reply('❌ *Missão ainda não concluída!*\n\n📌 *' + missao.titulo + '*\n📝 ' + missao.descricao + '\n📊 Progresso: ' + m.progresso + '/' + missao.meta)
            }

            m.concluida = true
            await dataService.saveMissoesData(missoesData)

            const xpData = dataService.getXpData()
            const user = initializeUser(sender, xpData)
            const { adicionarXp } = require('../../services/xpService')
            const { xpGanho, lvlRes } = adicionarXp(user, missao.xp, { source: 'rpg' })
            user.coins = (user.coins || 0) + missao.coins

            await dataService.saveXpData(xpData)
            logger.info('[MISSAO CONCLUIDA] User ' + sender + ' concluiu ' + missao.titulo)

            let lvlUpNotice = ''
            if (lvlRes && lvlRes.subiu) {
                lvlUpNotice = `\n\n🎉 *LEVEL UP!* Você subiu para o *Nível ${user.level}*!\n❤️ *HP Máximo:* ${user.hpMax} (+${lvlRes.ganhoHp}) | 💰 +${lvlRes.ganhoCoins} Coins!`
            }

            return reply('🎉 *MISSÃO CONCLUÍDA COM SUCESSO!*\n\n📌 *' + missao.titulo + '*\n⭐ *+' + xpGanho.toLocaleString('pt-BR') + ' XP*\n💰 *+' + missao.coins.toLocaleString('pt-BR') + ' Coins*' + lvlUpNotice)
        }

        const status = m.concluida ? '✅ Concluída' : ('⏳ Em andamento (' + m.progresso + '/' + missao.meta + ')')

        return reply('📜 *MISSÃO DIÁRIA DO DEV*\n\n📌 *' + missao.titulo + '*\n📝 ' + missao.descricao + '\n\n📊 *Progresso:* ' + status + '\n🎁 *Recompensas:*\n⭐ ' + missao.xp + ' XP | 💰 ' + missao.coins + ' Coins\n\nPara resgatar após atingir a meta, use:\n*.missao concluir*')
    }
}