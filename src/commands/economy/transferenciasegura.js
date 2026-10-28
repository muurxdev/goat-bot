/**
 * Comando .transferenciasegura — Envia moedas para alguém com taxa de 2%.
 *
 * Era um stub: escrevia "transferido" e o dinheiro não saía nem chegava.
 * Agora usa economy.transferir, que debita e credita de verdade e ESTORNA
 * ao remetente se o crédito falhar — sem isso o valor sumiria no meio.
 */

const economy = require('../../services/economyService')

const TAXA = 0.02

module.exports = {
    name: 'transferenciasegura',
    aliases: ["transfsegura","enviarseguro","cmd_transferenciasegura","alt_transferenciasegura","atalho_transferenciasegura","abrev_transferenciasegura","call_transferenciasegura","func_transferenciasegura"],
    category: 'economy',
    subcategory: 'Transferência',
    description: 'Envia moedas para alguém com taxa de 2%',
    cooldownMs: 5000,
    execute: async ({ sender, info, args, reply }) => {
        const mencionado = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        const respondido = info?.message?.extendedTextMessage?.contextInfo?.participant
        const destino = mencionado || respondido

        if (!destino || !args[0]) {
            return reply(
                '🔐 *TRANSFERÊNCIA SEGURA*\n\n' +
                '📌 *Uso:* `.transferenciasegura @pessoa <valor>`\n' +
                '_(ou responda a mensagem da pessoa)_\n\n' +
                '💡 Aceita `tudo`, `metade`, `50%`, `1k`, `2m`.\n\n' +
                '⚖️ _Taxa de 2% cobrada do remetente (segurança da transação)._'
            )
        }

        // O valor pode vir antes ou depois da menção, então pegamos o primeiro
        // argumento que não seja a própria marcação.
        const texto = args.find(a => !a.startsWith('@')) || args[0]

        const r = economy.transferir({ deJid: sender, paraJid: destino, texto })
        if (!r.ok) return reply(r.erro)

        const taxa = Math.floor(r.valor * TAXA)
        const liquido = r.valor - taxa

        // A taxa sai de quem recebeu (já creditado com o valor cheio).
        if (taxa > 0) {
            const recebedor = economy.carregarUsuario(destino)
            economy.aplicar(recebedor, -taxa)
        }

        let doc = `🔐 *TRANSFERÊNCIA SEGURA*\n\n`
        doc += `👤 *Para:* @${destino.split('@')[0]}\n`
        doc += `💰 *Valor:* ${economy.formatar(r.valor)} moedas\n`
        if (taxa > 0) {
            doc += `📉 *Taxa (2%):* -${economy.formatar(taxa)}\n`
            doc += `✅ *Recebido:* ${economy.formatar(liquido)} moedas\n`
        }
        doc += `\n🏦 *Seu saldo:* ${economy.formatar(r.saldoRemetente)} moedas`

        return reply(doc, [destino])
    }
}
