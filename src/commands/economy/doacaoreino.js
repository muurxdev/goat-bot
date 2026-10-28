/**
 * Comando .doacaoreino — Doa moedas para outro membro, sem taxa.
 *
 * Era um stub: escrevia "transferido" e o dinheiro não saía nem chegava.
 * Agora usa economy.transferir, que debita e credita de verdade e ESTORNA
 * ao remetente se o crédito falhar — sem isso o valor sumiria no meio.
 */

const economy = require('../../services/economyService')

const TAXA = 0

module.exports = {
    name: 'doacaoreino',
    aliases: ["doarreino","doacaoreal","cmd_doacaoreino","alt_doacaoreino","atalho_doacaoreino","abrev_doacaoreino","call_doacaoreino","func_doacaoreino"],
    category: 'economy',
    subcategory: 'Transferência',
    description: 'Doa moedas para outro membro, sem taxa',
    cooldownMs: 5000,
    execute: async ({ sender, info, args, reply }) => {
        const mencionado = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        const respondido = info?.message?.extendedTextMessage?.contextInfo?.participant
        const destino = mencionado || respondido

        if (!destino || !args[0]) {
            return reply(
                '👑 *DOAÇÃO AO REINO*\n\n' +
                '📌 *Uso:* `.doacaoreino @pessoa <valor>`\n' +
                '_(ou responda a mensagem da pessoa)_\n\n' +
                '💡 Aceita `tudo`, `metade`, `50%`, `1k`, `2m`.\n\n' +
                '⚖️ _Sem taxa — doação integral._'
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

        let doc = `👑 *DOAÇÃO AO REINO*\n\n`
        doc += `👤 *Para:* @${destino.split('@')[0]}\n`
        doc += `💰 *Valor:* ${economy.formatar(r.valor)} moedas\n`
        if (taxa > 0) {
            doc += `📉 *Taxa (0%):* -${economy.formatar(taxa)}\n`
            doc += `✅ *Recebido:* ${economy.formatar(liquido)} moedas\n`
        }
        doc += `\n🏦 *Seu saldo:* ${economy.formatar(r.saldoRemetente)} moedas`

        return reply(doc, [destino])
    }
}
