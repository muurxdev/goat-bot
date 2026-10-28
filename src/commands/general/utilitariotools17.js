/**
 * Comando .parcelas — Divide um valor em parcelas, com juros opcional
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools17`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "parcelas",
    aliases: ["parcelar","dividirvalor"],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Divide um valor em parcelas, com juros opcional",
    usage: "<valor> <parcelas> [juros % ao mês]",
    examples: ["1200 12 — sem juros","1200 12 1.99 — com 1,99% ao mês"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    const v=Number(String(args[0]||'NaN').replace(',','.')), n=parseInt(args[1],10), j=Number(String(args[2]||'0').replace(',','.'))
    if(!Number.isFinite(v)||!Number.isFinite(n)||n<1) return reply(comoUsar(prefix, ''))
    let doc=`💳 *PARCELAMENTO*\n\n💰 *Valor:* R$ ${v.toFixed(2)}\n🔢 *Parcelas:* ${n}x\n`
    if(j>0){const i=j/100;const p=v*(i*Math.pow(1+i,n))/(Math.pow(1+i,n)-1);const t=p*n
      doc+=`📈 *Juros:* ${j}% a.m.\n\n╭━〔 RESULTADO 〕━⬣\n┃ *Parcela:* R$ ${p.toFixed(2)}\n┃ *Total:* R$ ${t.toFixed(2)}\n┃ *Juros pagos:* R$ ${(t-v).toFixed(2)}\n╰━━━━━━━━━━━━━━━━━━⬣`}
    else doc+=`\n╭━〔 RESULTADO 〕━⬣\n┃ *Parcela:* R$ ${(v/n).toFixed(2)}\n┃ *Total:* R$ ${v.toFixed(2)} _(sem juros)_\n╰━━━━━━━━━━━━━━━━━━⬣`
    return reply(doc)
        } catch (err) {
            logger.error(`[UTIL] .parcelas falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}parcelas\`.`)
        }
    }
};
