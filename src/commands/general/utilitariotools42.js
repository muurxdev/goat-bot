/**
 * Comando .divisores — Lista todos os divisores de um número
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools42`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "divisores",
    aliases: ["fatores","divisoresde"],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Lista todos os divisores de um número",
    usage: "<número>",
    examples: ["36 — todos os divisores de 36"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    const n=parseInt(String(args[0]||'').replace(/\D/g,''),10)
    if(!Number.isFinite(n)||n<1) return reply(comoUsar(prefix, ''))
    if(n>1000000) return reply('❌ Máximo 1.000.000.')
    const d=[]; for(let i=1;i*i<=n;i++){ if(n%i===0){ d.push(i); if(i!==n/i) d.push(n/i) } }
    d.sort((a,b)=>a-b)
    const primo=d.length===2
    return reply(`➗ *DIVISORES DE ${n}*\n\n${d.join(', ')}\n\n📊 *Total:* ${d.length}\n${primo?'✨ *É um número PRIMO*':'🔢 Número composto'}\n➕ *Soma:* ${d.reduce((a,b)=>a+b,0)}`)
        } catch (err) {
            logger.error(`[UTIL] .divisores falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}divisores\`.`)
        }
    }
};
