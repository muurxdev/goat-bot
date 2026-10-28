/**
 * Comando .voteban
 * Abre uma votação no grupo para BANIR um participante (remove do grupo e bloqueia
 * o uso do bot). Coleta SIM/NAO por um prazo e executa se aprovado por maioria.
 */

const { iniciarVotacao } = require('../../services/voteService')

module.exports = {
    name: 'voteban',
    aliases: ["votacaoban","votarban","pollban","cmd_voteban","alt_voteban","atalho_voteban","abrev_voteban","call_voteban","func_voteban"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Inicia uma votação democrática no grupo para banir um participante',
    groupOnly: true,
    cooldownMs: 5000,
    execute: async ({ from, info, args, reply, client, sender, isBotAdmin, prefix = '.' }) => {
        const mencionado = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        const respondido = info?.message?.extendedTextMessage?.contextInfo?.participant
        const digitos = (args[0] || '').replace(/\D/g, '')
        const alvo = mencionado || respondido || (digitos.length >= 10 ? `${digitos}@s.whatsapp.net` : null)

        if (!alvo) {
            return reply(`🗳️ *Votação de Banimento*\n\nUso: \`${prefix}voteban @pessoa\` (ou responda a mensagem dela).`)
        }
        if (alvo === sender) return reply('❌ Você não pode abrir uma votação contra si mesmo.')

        return iniciarVotacao({
            client, from, reply, alvo, acao: 'ban',
            iniciador: sender, isBotAdmin, duracaoMs: 60000, minVotos: 4
        })
    }
}
