/**
 * Comando .contardias — Conta quantos dias faltam para uma data
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools39`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "contardias",
    aliases: [],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Conta quantos dias faltam para uma data",
    usage: "<dd/mm/aaaa>",
    examples: ["25/12/2026 — quantos dias faltam para o Natal"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    const m=(args[0]||'').match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
    if(!m) return reply(comoUsar(prefix, ''))
    const alvo=new Date(+m[3],+m[2]-1,+m[1]), hoje=new Date(); hoje.setHours(0,0,0,0)
    const dias=Math.round((alvo-hoje)/86400000)
    const passou=dias<0
    return reply(`📅 *CONTAGEM*\n\n🎯 *Data:* ${alvo.toLocaleDateString('pt-BR')}\n\n${passou?`⏮️ Passou há *${Math.abs(dias)}* dia(s)`:dias===0?'🎉 *É hoje!*':`⏳ Faltam *${dias}* dia(s)`}\n\n📊 ${Math.abs(Math.floor(dias/7))} semana(s) · ${Math.abs((dias/30.44).toFixed(1))} mês(es)`)
        } catch (err) {
            logger.error(`[UTIL] .contardias falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}contardias\`.`)
        }
    }
};
