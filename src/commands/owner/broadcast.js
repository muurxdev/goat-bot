const { esperar } = require('../../utils/helpers')
const dataService = require('../../services/dataService')
const { getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')
const F = require('../../utils/formato')

module.exports = {
    name: 'broadcast',
    aliases: ['bc', 'transmissao', 'aviso-global'],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Envia um comunicado para todos os grupos em que estou ativo',
    usage: '<mensagem>',
    examples: [
        'Voltei da manutenção, tudo funcionando! — avisa todos os grupos'
    ],
    ownerOnly: true,
    execute: async ({ text, client, reply, prefix = '.' }) => {
        if (!text) {
            return reply(F.tela({
                emoji: '📢',
                titulo: 'Comunicado para os grupos',
                intro: 'Escreva a mensagem depois do comando e eu mando para todos os grupos que tenho registrados, um de cada vez.',
                secoes: [{
                    emoji: '✍️',
                    titulo: 'Digite assim',
                    linhas: [`• ${F.cmd(prefix, 'broadcast', 'Voltei da manutenção, tudo funcionando!')}`]
                }],
                dica: 'Espero 1,5 s entre um grupo e outro para o WhatsApp não bloquear o número.',
                prefix
            }))
        }

        const configs = dataService.getConfigsData()
        const grupos = Object.keys(configs)

        if (grupos.length === 0) {
            return reply(F.tela({
                emoji: '📭',
                titulo: 'Nenhum grupo registrado',
                intro: 'Ainda não tenho nenhum grupo salvo para mandar o comunicado. Os grupos entram na lista quando alguém usa um comando neles.',
                prefix
            }))
        }

        await reply(`📢 *Enviando o comunicado para ${grupos.length} grupos…*\nAviso aqui quando terminar.`)
        let enviados = 0

        for (const grupo of grupos) {
            try {
                await client.sendMessage(grupo, {
                    text: `📢 *Comunicado de ${getBotName()}*\n\n${text}`
                })
                enviados++
                await esperar(1500) // Delay anti-ban entre envios
            } catch (err) {
                logger.warn(`Falha ao enviar broadcast para ${grupo}:`, err.message)
            }
        }

        const falhas = grupos.length - enviados
        await reply(F.tela({
            emoji: enviados ? '✅' : '⚠️',
            titulo: 'Comunicado enviado',
            intro: `Entreguei em ${enviados} de ${grupos.length} grupos.`,
            secoes: [falhas ? {
                emoji: '📋',
                titulo: 'Não chegou',
                linhas: [`${falhas} grupo(s) não receberam — normalmente são grupos de onde já saí ou onde não posso mais enviar mensagem.`]
            } : null],
            prefix
        }))
    }
}
