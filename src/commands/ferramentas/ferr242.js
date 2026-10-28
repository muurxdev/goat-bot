/**
 * Comando .ferr242 — Formatar CPF com pontos.
 *
 * Arquivo GERADO por scripts/gen-ferramentas.js. Não edite à mão: rode o gerador.
 * A conta mora em src/services/toolboxService.js, na ferramenta
 * "doc_cpf_formatar". Aqui só acontece a apresentação: sem rede e sem banco.
 */
const F = require('../../utils/formato')
const servico = require('../../services/toolboxService')
const logger = require('../../core/logger')

const FERRAMENTA = "doc_cpf_formatar"
const NOME = "ferr242"

module.exports = {
    name: NOME,
    aliases: [],
    category: 'ferramentas',
    subcategory: "Documentos",
    description: "Põe pontos e traço em um CPF digitado solto",
    usage: "<11 dígitos do CPF>",
    examples: ["12345678909 — onze dígitos sem pontuação","123 456 789 09 — com espaços no meio"],
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
