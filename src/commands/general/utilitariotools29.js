/**
 * Comando .densidadetexto — Estatísticas de um texto: palavras, letras, frases
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools29`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "densidadetexto",
    aliases: ["estatisticatexto"],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Estatísticas de um texto: palavras, letras, frases",
    usage: "<texto>",
    examples: ["cole aqui o texto — conta palavras, letras e frases"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    const t=args.join(' ')
    if(!t) return reply(comoUsar(prefix, ''))
    const pal=t.split(/\s+/).filter(Boolean)
    const frases=t.split(/[.!?]+/).filter(s=>s.trim()).length
    const letras=(t.match(/[a-zA-ZÀ-ÿ]/g)||[]).length
    const num=(t.match(/[0-9]/g)||[]).length
    const media=pal.length?(pal.reduce((a,p)=>a+p.length,0)/pal.length):0
    return reply(`📊 *ANÁLISE DO TEXTO*\n\n╭━〔 CONTAGEM 〕━⬣\n┃ Caracteres: ${t.length}\n┃ Palavras: ${pal.length}\n┃ Frases: ${frases}\n┃ Letras: ${letras}\n┃ Números: ${num}\n╰━━━━━━━━━━━━━━━━━━⬣\n\n📏 *Palavra média:* ${media.toFixed(1)} letras\n📐 *Frase média:* ${frases?(pal.length/frases).toFixed(1):0} palavras`)
        } catch (err) {
            logger.error(`[UTIL] .densidadetexto falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}densidadetexto\`.`)
        }
    }
};
