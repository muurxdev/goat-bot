/**
 * Comando .tempoleitura — Estima o tempo de leitura de um texto
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools28`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "tempoleitura",
    aliases: ["leitura","tempotexto"],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Estima o tempo de leitura de um texto",
    usage: "<texto>",
    examples: ["cole aqui o texto — mostra quanto tempo leva para ler"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    const t=args.join(' ')
    if(!t) return reply(comoUsar(prefix, ''))
    const pal=t.split(/\s+/).filter(Boolean).length
    const min=pal/200, seg=Math.round(min*60)
    return reply(`📖 *TEMPO DE LEITURA*\n\n📝 *Palavras:* ${pal}\n🔤 *Caracteres:* ${t.length}\n\n⏱️ *Leitura:* ${seg<60?seg+' segundos':Math.round(min)+' minuto(s)'}\n🗣️ *Em voz alta:* ${Math.round(pal/130)} minuto(s)\n\n_Base: 200 palavras/min lendo, 130 falando._`)
        } catch (err) {
            logger.error(`[UTIL] .tempoleitura falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}tempoleitura\`.`)
        }
    }
};
