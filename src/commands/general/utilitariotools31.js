/**
 * Comando .validaremail — Valida a estrutura de um e-mail
 * Categoria: general | Subcategoria: Utilidades & Telefonia
 *
 * Substitui o antigo esboço `utilitariotools31`, que só imprimia um texto
 * descrevendo a si mesmo e não executava nada.
 */

const logger = require('../../core/logger')

/** Tela de uso completa, montada a partir de usage/examples deste arquivo. */
const comoUsar = (prefix, dica) => require('../../services/usoService').enriquecerPedidoDeUso(module.exports, dica, { prefix })

module.exports = {
    name: "validaremail",
    aliases: ["checaremail","emailvalido"],
    category: "general",
    subcategory: "Utilidades & Telefonia",
    description: "Valida a estrutura de um e-mail",
    usage: "<e-mail>",
    examples: ["fulano@exemplo.com — confere se está bem escrito"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
    const e=(args[0]||'').trim()
    if(!e) return reply(comoUsar(prefix, ''))
    const ok=/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(e)
    if(!ok) return reply(`❌ *${e}* não tem estrutura de e-mail válida.`)
    const [u2,d2]=e.split('@')
    return reply(`📧 *E-MAIL VÁLIDO*\n\n✅ \`${e}\`\n👤 *Usuário:* ${u2}\n🌐 *Domínio:* ${d2}\n\n_Estrutura correta. Não verifica se a caixa existe._`)
        } catch (err) {
            logger.error(`[UTIL] .validaremail falhou: ${err.message}`)
            return reply(`😕 Não consegui concluir o pedido agora.\n\nConfira o que você digitou e tente de novo. Para ver como usar, digite \`${prefix}validaremail\`.`)
        }
    }
};
