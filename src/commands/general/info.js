const env = require('../../config/env')

module.exports = {
    name: 'info',
    aliases: ['sobre', 'botinfo'],
    category: 'general',
    subcategory: 'Informação',
    description: 'Quem sou eu, há quanto tempo estou ligado e quanta memória uso',
    execute: async ({ reply, prefix = '.' }) => {
        const uptime = process.uptime()
        const horas = Math.floor(uptime / 3600)
        const minutos = Math.floor((uptime % 3600) / 60)
        const segundos = Math.floor(uptime % 60)

        const mem = process.memoryUsage()
        const ramMb = Math.round(mem.rss / 1024 / 1024)

        const uniqueIds = [...new Set(env.botOwnerIds)]
        const devPhone = env.formatPhoneFromJid(uniqueIds[0])
        const coDevPhone = env.formatPhoneFromJid(uniqueIds[1] || '')

        const { getBotName } = require('../../config/botConfig')
        const botName = getBotName()
        const F = require('../../utils/formato')
        const info = F.tela({
            emoji: '🍺',
            titulo: `Sobre mim, ${botName}`,
            intro: `Sou o atendente da taverna: cuido do grupo, do RPG, da economia e das mídias. Estou ligado há ${horas}h ${minutos}min ${segundos}s.`,
            secoes: [
                { emoji: '⚙️', titulo: 'Por dentro', linhas: [
                    F.campo('Versão', '2.0.0'),
                    F.campo('Memória em uso', `${ramMb} MB`)
                ] }
            ],
            dica: 'Ideias de comandos novos são bem-vindas: mande pelo .sugerir.',
            proximos: [
                { nome: 'menu', oque: 'ver tudo o que eu sei fazer' },
                { nome: 'dono', oque: 'falar com os meus donos' },
                { nome: 'health', oque: 'ver se estou funcionando bem' }
            ],
            prefix
        })
        await reply(info)
    }
}