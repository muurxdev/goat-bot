/**
 * Comando .votekick
 * Abre uma votação no grupo para expulsar um participante. Coleta SIM/NAO das
 * mensagens comuns por um prazo e executa se aprovado por maioria.
 */

const { iniciarVotacao } = require('../../services/voteService')

module.exports = {
    name: 'votekick',
    aliases: ["votarexpulsao","kickvote","votoexpulsar","cmd_votekick","alt_votekick","atalho_votekick","abrev_votekick","call_votekick","func_votekick"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Inicia uma votação de expulsão democrática para um participante',
    groupOnly: true,
    cooldownMs: 5000,
    execute: async ({ from, info, args, reply, client, sender, isBotAdmin, prefix = '.' }) => {
        const mencionado = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        const respondido = info?.message?.extendedTextMessage?.contextInfo?.participant
        const digitos = (args[0] || '').replace(/\D/g, '')
        const alvo = mencionado || respondido || (digitos.length >= 10 ? `${digitos}@s.whatsapp.net` : null)

        if (!alvo) {
            return reply(`🗳️ *Votação de Expulsão*\n\nUso: \`${prefix}votekick @pessoa\` (ou responda a mensagem dela).`)
        }
        if (alvo === sender) return reply('❌ Você não pode abrir uma votação contra si mesmo.')

        return iniciarVotacao({
            client, from, reply, alvo, acao: 'kick',
            iniciador: sender, isBotAdmin, duracaoMs: 60000, minVotos: 3
        })
    }
}
