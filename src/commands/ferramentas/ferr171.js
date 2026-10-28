/**
 * Comando .ferr171 — Tinta para pintar uma parede.
 *
 * Arquivo GERADO por scripts/gen-ferramentas.js. Não edite à mão: rode o gerador.
 * A conta mora em src/services/toolboxService.js, na ferramenta
 * "tinta_parede". Aqui só acontece a apresentação: sem rede e sem banco.
 */
const F = require('../../utils/formato')
const servico = require('../../services/toolboxService')
const logger = require('../../core/logger')

const FERRAMENTA = "tinta_parede"
const NOME = "ferr171"

module.exports = {
    name: NOME,
    aliases: [],
    category: 'ferramentas',
    subcategory: "Calculadoras",
    description: "Calcula litros de tinta para pintar uma área",
    usage: "<área em m²> [demãos]",
    examples: ["45 — quarenta e cinco metros quadrados, duas demãos","80 3 — três demãos"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        try {
            const tela = servico.responder(FERRAMENTA, args, { nome: NOME, prefix })
            return reply(F.tela(tela))
        } catch (erro) {
            logger.error('[FERRAMENTAS] .' + NOME + ' (' + FERRAMENTA + ') falhou: ' + erro.message, erro)
            return reply('❌ Não consegui fazer essa conta agora. Confira os valores e tente de novo em instantes.')
        }
    }
}
