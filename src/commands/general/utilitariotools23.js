/**
 * Comando .removeracentos — Remove acentos e caracteres especiais do texto
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools23`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "removeracentos",
    aliases: ["semacento","normalizar"],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Remove acentos e caracteres especiais do texto",
    usage: "<texto>",
    examples: ["Coração de Britânnia — tira os acentos"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    const t=args.join(' ')
    if(!t) return reply(comoUsar(prefix, ''))
    const limpo=t.normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    return reply(`🔤 *SEM ACENTOS*\n\n📥 ${t}\n📤 ${limpo}`)
        } catch (err) {
            logger.error(`[UTIL] .removeracentos falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}removeracentos\`.`)
        }
    }
};
