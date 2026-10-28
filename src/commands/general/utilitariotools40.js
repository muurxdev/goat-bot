/**
 * Comando .conversortempo — Converte tempo entre segundos, minutos, horas e dias
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools40`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "conversortempo",
    aliases: ["durar"],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Converte tempo entre segundos, minutos, horas e dias",
    usage: "<valor> <de> <para>",
    examples: ["7200 s h — segundos em horas","3 d h — dias em horas"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    const v=Number(String(args[0]||'NaN').replace(',','.')), de=(args[1]||'s').toLowerCase(), para=(args[2]||'h').toLowerCase()
    const seg={s:1,seg:1,min:60,m:60,h:3600,hora:3600,d:86400,dia:86400,sem:604800}
    if(!Number.isFinite(v)||!seg[de]||!seg[para]) return reply(comoUsar(prefix, "Aceito s, min, h, d e sem."))
    const r=(v*seg[de])/seg[para]
    const total=v*seg[de]
    return reply(`⏱️ *CONVERSÃO DE TEMPO*\n\n📥 ${v} ${de} = *${r.toLocaleString('pt-BR',{maximumFractionDigits:4})} ${para}*\n\n╭━〔 EQUIVALE A 〕━⬣\n┃ ${total.toLocaleString('pt-BR')} segundos\n┃ ${(total/60).toFixed(2)} minutos\n┃ ${(total/3600).toFixed(2)} horas\n┃ ${(total/86400).toFixed(2)} dias\n╰━━━━━━━━━━━━━━━━━━⬣`)
        } catch (err) {
            logger.error(`[UTIL] .conversortempo falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}conversortempo\`.`)
        }
    }
};
