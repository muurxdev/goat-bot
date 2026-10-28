/**
 * Comando .ferr108 — Decimal para hexadecimal.
 *
 * Arquivo GERADO por scripts/gen-ferramentas.js. Não edite à mão: rode o gerador.
 * A conta mora em src/services/converterService.js, na ferramenta
 * "base_dec_hex". Aqui só acontece a apresentação: sem rede e sem banco.
 */
const F = require('../../utils/formato')
const servico = require('../../services/converterService')
const logger = require('../../core/logger')

const FERRAMENTA = "base_dec_hex"
const NOME = "ferr108"

module.exports = {
    name: NOME,
    aliases: [],
    category: 'ferramentas',
    subcategory: "Conversões",
    description: "Converte decimal em hexadecimal",
    usage: "<número em decimal>",
    examples: ["255 — 255 convertido","255 — o valor 255"],
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
