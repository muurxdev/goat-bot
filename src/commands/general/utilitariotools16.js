/**
 * Comando .mediaponderada — Calcula média ponderada: nota:peso
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools16`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "mediaponderada",
    aliases: ["mediapeso","ponderada"],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Calcula média ponderada: nota:peso",
    usage: "<nota:peso> ...",
    examples: ["8:2 6:3 9:1 — três notas com pesos diferentes"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    const pares=args.map(a=>a.split(':')).filter(p=>p.length===2)
    if(!pares.length) return reply(comoUsar(prefix, ''))
    let sn=0,sp=0,det=[]
    for(const [nn,pp] of pares){const n=Number(String(nn).replace(',','.')),p=Number(pp);if(!Number.isFinite(n)||!Number.isFinite(p))continue;sn+=n*p;sp+=p;det.push(`${n} × ${p}`)}
    if(!sp) return reply('❌ Nenhum par válido. Use o formato nota:peso.')
    return reply(`📊 *MÉDIA PONDERADA*\n\n${det.join('\n')}\n\n➗ Soma ${sn} ÷ pesos ${sp}\n\n🎯 *Média:* *${(sn/sp).toFixed(2)}*`)
        } catch (err) {
            logger.error(`[UTIL] .mediaponderada falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}mediaponderada\`.`)
        }
    }
};
