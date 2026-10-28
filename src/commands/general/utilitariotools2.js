/**
 * Comando .cifra — Cifra de César: desloca as letras do texto
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools2`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "cifra",
    aliases: ["cesar","cifracesar"],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Cifra de César: desloca as letras do texto",
    usage: "<deslocamento> <texto>",
    examples: ["3 ataque ao amanhecer — cifra deslocando 3 letras","-3 dwdtxh — decifra a mensagem"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    const desloc = parseInt(args[0], 10)
    const texto = args.slice(1).join(' ')
    if (!Number.isFinite(desloc) || !texto) return reply(comoUsar(prefix, "Para decifrar, use o mesmo número com sinal de menos."))
    const cifrar = (t, k) => t.replace(/[a-zA-Z]/g, ch => {
      const b = ch <= 'Z' ? 65 : 97
      return String.fromCharCode(((ch.charCodeAt(0) - b + (k % 26) + 26) % 26) + b)
    })
    return reply(`🔐 *CIFRA DE CÉSAR*\n\n📥 *Original:* ${texto}\n📤 *Resultado:* ${cifrar(texto, desloc)}\n🔢 *Deslocamento:* ${desloc}\n\n_Decifre com_ \`${prefix}cifra ${-desloc} <resultado>\``)
        } catch (err) {
            logger.error(`[UTIL] .cifra falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}cifra\`.`)
        }
    }
};
