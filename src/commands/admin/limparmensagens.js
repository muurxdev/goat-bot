/**
 * Comando .limparmensagens
 * Apaga as últimas mensagens que o BOT enviou neste chat.
 *
 * Diferença para o `.limparbot`: aquele é exclusivo de grupo e só para ADMs.
 * Este funciona também no PRIVADO (útil para o dono limpar a conversa com o bot)
 * e, em grupo, exige ser ADM.
 *
 * Só é possível apagar mensagens do próprio bot registradas desde a última
 * reinicialização (o Baileys 7 não tem store embutido — usamos o botMessageStore).
 */

const botMessageStore = require('../../services/botMessageStore')
const { getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')

module.exports = {
    name: 'limparmensagens',
    aliases: ["limparchat","purgebot","apagarultimas","cmd_limparmensagens","alt_limparmensagens","atalho_limparmensagens","abrev_limparmensagens","call_limparmensagens","func_limparmensagens"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Apaga as minhas últimas mensagens, no grupo ou no privado',
    cooldownMs: 10000,
    execute: async ({ from, args, reply, sender, client, isGroup, isAdmin, isOwner, prefix = '.' }) => {
        const botName = getBotName()

        // Em grupo, exige ADM (ou Dono). No privado, qualquer um limpa a própria conversa.
        if (isGroup && !isAdmin && !isOwner) {
            return reply('🛡️ No grupo, só administradores podem apagar as minhas mensagens.\n💡 _No privado comigo, você pode usar à vontade._')
        }

        const pedido = String(args[0] || '').toLowerCase()
        let quantidade = parseInt(pedido, 10)
        if (pedido === 'tudo' || pedido === 'all') quantidade = botMessageStore.MAX_POR_CHAT
        if (!quantidade || quantidade < 1) quantidade = 10
        if (quantidade > botMessageStore.MAX_POR_CHAT) quantidade = botMessageStore.MAX_POR_CHAT

        const disponiveis = botMessageStore.count(from)
        if (disponiveis === 0) {
            return reply(
                '🧹 *Nada para limpar.*\n\n' +
                'Não há mensagens minhas registradas neste chat.\n' +
                '💡 _Só consigo apagar o que mandei desde a última vez que fui reiniciado._'
            )
        }

        const alvos = botMessageStore.recent(from, quantidade)
        let apagadas = 0
        const apagadasKeys = []

        for (const key of alvos) {
            try {
                await client.sendMessage(from, { delete: key })
                apagadas++
                apagadasKeys.push(key)
            } catch (e) {
                logger.warn(`[LIMPARMENSAGENS] Falha ao apagar: ${e.message}`)
            }
        }

        // Tira do registro o que já foi apagado, para não tentar de novo depois.
        try { botMessageStore.forget(from, apagadasKeys) } catch (e) {
            logger.warn(`[LIMPARMENSAGENS] Falha ao limpar registro: ${e.message}`)
        }

        logger.info(`[LIMPARMENSAGENS] ${apagadas} mensagens apagadas em ${from} por ${sender}`)

        let doc = '╔══════════════════════════════╗\n'
        doc += '║   🧹 *LIMPEZA DE MENSAGENS* 🧹   ║\n'
        doc += '╚══════════════════════════════╝\n\n'
        doc += '╭━〔 ⚙️ RESULTADO 〕━⬣\n'
        doc += `┃ 🧹 *Apagadas:* ${apagadas} de ${alvos.length}\n`
        doc += `┃ 📊 *Ainda registradas:* ${botMessageStore.count(from)}\n`
        doc += `┃ 📍 *Local:* ${isGroup ? 'Grupo' : 'Privado'}\n`
        doc += '╰━━━━━━━━━━━━━━━━━━⬣\n\n'
        doc += `💡 _Use_ \`${prefix}limparmensagens 30\` _ou_ \`${prefix}limparmensagens tudo\`\n`
        doc += `👑 *${botName}*`

        return reply(doc.trim())
    }
}
