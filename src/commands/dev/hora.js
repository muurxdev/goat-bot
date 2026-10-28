const F = require('../../utils/formato')

module.exports = {
    name: 'hora',
    aliases: ["time","cmd_hora","alt_hora","atalho_hora","abrev_hora","call_hora","func_hora"],
    category: 'dev',
    subcategory: 'Data',
    description: 'Mostra a hora atual no horário de Brasília e em UTC',
    examples: [' — mostra a hora de agora'],
    execute: async ({ reply, prefix = '.' }) => {
        const agora = new Date()
        const brasilia = agora.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' })
        const utc = agora.toLocaleTimeString('pt-BR', { timeZone: 'UTC' })
        const dataBr = agora.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })

        await reply(F.tela({
            emoji: '🕒',
            titulo: 'Hora atual',
            intro: `Agora são *${brasilia}* em Brasília.`,
            secoes: [{
                emoji: '🌐', titulo: 'Fusos',
                linhas: [
                    F.campo('Brasília', `${brasilia} (${dataBr})`),
                    F.campo('UTC', utc),
                    F.campo('Timestamp Unix', '`' + Math.floor(agora.getTime() / 1000) + '`')
                ]
            }],
            dica: 'O timestamp Unix é o mesmo no mundo inteiro; só a hora exibida muda com o fuso.',
            proximos: [
                { nome: 'data', oque: 'data de hoje' },
                { nome: 'timestamp', oque: 'converter timestamp e datas' }
            ],
            prefix
        }))
    }
}
