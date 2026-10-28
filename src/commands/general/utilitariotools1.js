/**
 * Comando .converter — Converte unidades: km/mi, kg/lb, c/f, m/ft, l/gal
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools1`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "converter",
    aliases: ["conv","unidade"],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Converte unidades: km/mi, kg/lb, c/f, m/ft, l/gal",
    usage: "<valor> <de> <para>",
    examples: ["10 km mi — quilômetros em milhas","70 kg lb — quilos em libras","30 c f — Celsius em Fahrenheit"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    const [v, de, para] = args
    const n = Number(String(v).replace(',', '.'))
    if (!Number.isFinite(n) || !de || !para) return reply(comoUsar(prefix, "Aceito km, mi, m, ft, cm, in, kg, lb, g, oz, l, gal e temperatura em c, f, k."))
    const base = { km:1000, mi:1609.34, m:1, ft:0.3048, cm:0.01, in:0.0254, kg:1000, lb:453.592, g:1, oz:28.3495, l:1, gal:3.78541 }
    const d1 = String(de).toLowerCase(), d2 = String(para).toLowerCase()
    if (['c','f','k'].includes(d1) && ['c','f','k'].includes(d2)) {
      let cel = d1==='c'? n : d1==='f' ? (n-32)*5/9 : n-273.15
      const out = d2==='c'? cel : d2==='f' ? cel*9/5+32 : cel+273.15
      return reply(`🌡️ *${n} °${d1.toUpperCase()}* = *${out.toFixed(2)} °${d2.toUpperCase()}*`)
    }
    if (!base[d1] || !base[d2]) return reply(`❌ Unidade desconhecida. Use \`${prefix}converter\` para ver a lista.`)
    const r = (n * base[d1]) / base[d2]
    return reply(`📐 *${n} ${d1}* = *${r.toLocaleString('pt-BR',{maximumFractionDigits:4})} ${d2}*`)
        } catch (err) {
            logger.error(`[UTIL] .converter falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}converter\`.`)
        }
    }
};
