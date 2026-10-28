/**
 * Comando .formatarcep — Formata e valida a estrutura de um CEP
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools6`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "formatarcep",
    aliases: ["cep","arrumarcep"],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Formata e valida a estrutura de um CEP",
    usage: "<cep>",
    examples: ["01310100 — formata como 01310-100"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    const cru = (args[0] || '').replace(/\D/g, '')
    if (!cru) return reply(comoUsar(prefix, ''))
    if (cru.length !== 8) return reply(`❌ CEP precisa ter *8 dígitos* — recebi ${cru.length}.`)
    const regiao = ['SP capital','SP interior','RJ / ES','MG','BA / SE','PE / AL / PB / RN','CE / PI / MA / PA / AM / AC / AP / RR','SC / PR','RS','GO / TO / MT / MS / DF'][Number(cru[0])]
    return reply(`📮 *CEP FORMATADO*\n\n✅ \`${cru.slice(0,5)}-${cru.slice(5)}\`\n🗺️ *Região:* ${regiao || 'desconhecida'}`)
        } catch (err) {
            logger.error(`[UTIL] .formatarcep falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}formatarcep\`.`)
        }
    }
};
