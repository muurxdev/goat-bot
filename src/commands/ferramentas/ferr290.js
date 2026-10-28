/**
 * Comando .ferr290 — Descobrir que documento é esse número.
 *
 * Arquivo GERADO por scripts/gen-ferramentas.js. Não edite à mão: rode o gerador.
 * A conta mora em src/services/toolboxService.js, na ferramenta
 * "doc_detectar". Aqui só acontece a apresentação: sem rede e sem banco.
 */
const F = require('../../utils/formato')
const servico = require('../../services/toolboxService')
const logger = require('../../core/logger')

const FERRAMENTA = "doc_detectar"
const NOME = "ferr290"

module.exports = {
    name: NOME,
    aliases: [],
    category: 'ferramentas',
    subcategory: "Documentos",
    description: "Descobre que tipo de documento é o número dado",
    usage: "<número qualquer>",
    examples: ["12345678909 — onze dígitos, testa CPF e outros","01310100 — oito dígitos, parece CEP"],
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
