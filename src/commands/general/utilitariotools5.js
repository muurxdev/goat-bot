/**
 * Comando .datas — Diferença entre duas datas em dias, meses e anos
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools5`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "datas",
    aliases: ["difdatas","entredatas"],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Diferença entre duas datas em dias, meses e anos",
    usage: "<dd/mm/aaaa> [dd/mm/aaaa]",
    examples: ["01/01/2000 — diferença até hoje","10/02/2024 25/12/2024 — entre duas datas"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    const parse = s => { const m = String(s||'').match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/); return m ? new Date(+m[3], +m[2]-1, +m[1]) : null }
    const d1 = parse(args[0]); const d2 = args[1] ? parse(args[1]) : new Date()
    if (!d1 || !d2) return reply(comoUsar(prefix, "Sem a segunda data, eu comparo com a data de hoje."))
    const ms = Math.abs(d2 - d1)
    const dias = Math.floor(ms / 86400000)
    const anos = Math.floor(dias / 365.25)
    const meses = Math.floor((dias % 365.25) / 30.44)
    const fmt = d => d.toLocaleDateString('pt-BR')
    return reply(`📅 *DIFERENÇA ENTRE DATAS*\n\n🅰️ ${fmt(d1)}\n🅱️ ${fmt(d2)}\n\n╭━〔 ⏳ INTERVALO 〕━⬣\n┃ *${dias.toLocaleString('pt-BR')}* dias\n┃ *${anos}* ano(s) e *${meses}* mês(es)\n┃ *${Math.floor(dias/7)}* semanas\n┃ *${(dias*24).toLocaleString('pt-BR')}* horas\n╰━━━━━━━━━━━━━━━━━━⬣`)
        } catch (err) {
            logger.error(`[UTIL] .datas falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}datas\`.`)
        }
    }
};
