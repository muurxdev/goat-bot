/**
 * Comando .jsonfmt — Valida e formata JSON, apontando o erro quando houver
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools4`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "jsonfmt",
    aliases: ["formatarjson","validarjson"],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Valida e formata JSON, apontando o erro quando houver",
    usage: "<json>",
    examples: ["{\"nome\":\"Ban\",\"nivel\":5} — confere e organiza o texto"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    const bruto = args.join(' ').trim()
    if (!bruto) return reply(comoUsar(prefix, ''))
    try {
      const obj = JSON.parse(bruto)
      const bonito = JSON.stringify(obj, null, 2)
      const chaves = typeof obj === 'object' && obj ? Object.keys(obj).length : 0
      if (bonito.length > 3000) return reply(`✅ *JSON VÁLIDO*\n\n📊 ${chaves} chave(s) no topo · ${bonito.length} caracteres\n\n_Grande demais para exibir formatado._`)
      return reply(`✅ *JSON VÁLIDO*\n\n📊 *Chaves no topo:* ${chaves}\n\n\`\`\`\n${bonito}\n\`\`\``)
    } catch (e) {
      // A mensagem do JSON.parse vem em inglês; só a posição interessa à pessoa.
      const pos = String(e.message || '').match(/position (\d+)/)
      const onde = pos ? `\n\n📍 *Onde:* perto do caractere ${Number(pos[1]) + 1}: \`${bruto.slice(Math.max(0, Number(pos[1]) - 10), Number(pos[1]) + 10)}\`` : ''
      return reply(`❌ *Formato inválido*\n\nO texto tem algum erro de escrita (vírgula sobrando, aspas faltando ou chave sem fechar).${onde}\n\n💡 _As chaves e os textos precisam estar entre aspas duplas, como em_ \`{"nome":"Ban"}\``)
    }
        } catch (err) {
            logger.error(`[UTIL] .jsonfmt falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}jsonfmt\`.`)
        }
    }
};
