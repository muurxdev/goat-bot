/**
 * Comando .ferr34 — Metros quadrados para pés quadrados.
 *
 * Arquivo GERADO por scripts/gen-ferramentas.js. Não edite à mão: rode o gerador.
 * A conta mora em src/services/converterService.js, na ferramenta
 * "area_m2_pe2". Aqui só acontece a apresentação: sem rede e sem banco.
 */
const F = require('../../utils/formato')
const servico = require('../../services/converterService')
const logger = require('../../core/logger')

const FERRAMENTA = "area_m2_pe2"
const NOME = "ferr34"

module.exports = {
    name: NOME,
    aliases: [],
    category: 'ferramentas',
    subcategory: "Conversões",
    description: "Converte metro quadrado em pé quadrado",
    usage: "<valor em m²>",
    examples: ["65 — 65 m² convertido","1 — quanto vale 1 m²"],
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
