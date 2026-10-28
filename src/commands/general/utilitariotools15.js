/**
 * Comando .escalanota — Converte nota numérica em conceito e situação
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools15`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "escalanota",
    aliases: ["conceito","nota"],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Converte nota numérica em conceito e situação",
    usage: "<nota> [nota máxima]",
    examples: ["7.5 — nota de 0 a 10","42 50 — nota de 0 a 50"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    const n=Number(String(args[0]||'NaN').replace(',','.')), max=Number(args[1])||10
    if(!Number.isFinite(n)) return reply(comoUsar(prefix, ''))
    const p=(n/max)*100
    const c=p>=90?'A — Excelente':p>=80?'B — Ótimo':p>=70?'C — Bom':p>=60?'D — Suficiente':'F — Insuficiente'
    const s=p>=60?'✅ Aprovado':p>=40?'⚠️ Recuperação':'❌ Reprovado'
    return reply(`🎓 *AVALIAÇÃO*\n\n📊 *Nota:* ${n} de ${max} (${p.toFixed(1)}%)\n🏷️ *Conceito:* ${c}\n📌 *Situação:* ${s}`)
        } catch (err) {
            logger.error(`[UTIL] .escalanota falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}escalanota\`.`)
        }
    }
};
