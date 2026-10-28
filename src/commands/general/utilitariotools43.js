/**
 * Comando .custohora — Calcula seu valor por hora a partir do salário
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools43`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "custohora",
    aliases: ["quantoganho"],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Calcula seu valor por hora a partir do salário",
    usage: "<salário> [horas por mês]",
    examples: ["3000 — jornada padrão de 220 h","3000 160 — jornada de 160 h"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    const sal=Number(String(args[0]||'NaN').replace(',','.')), h=Number(args[1])||220
    if(!Number.isFinite(sal)) return reply(comoUsar(prefix, ''))
    const vh=sal/h
    return reply(`💼 *SEU VALOR POR HORA*\n\n💰 *Salário:* R$ ${sal.toFixed(2)}\n🕐 *Jornada:* ${h}h/mês\n\n╭━〔 VALOR 〕━⬣\n┃ *Por hora:* R$ ${vh.toFixed(2)}\n┃ Por minuto: R$ ${(vh/60).toFixed(3)}\n┃ Por dia (8h): R$ ${(vh*8).toFixed(2)}\n╰━━━━━━━━━━━━━━━━━━⬣`)
        } catch (err) {
            logger.error(`[UTIL] .custohora falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}custohora\`.`)
        }
    }
};
