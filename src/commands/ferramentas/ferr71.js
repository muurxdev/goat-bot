/**
 * Comando .ferr71 — Graus decimais em grau, minuto e segundo.
 *
 * Arquivo GERADO por scripts/gen-ferramentas.js. Não edite à mão: rode o gerador.
 * A conta mora em src/services/converterService.js, na ferramenta
 * "ang_dec_gms". Aqui só acontece a apresentação: sem rede e sem banco.
 */
const F = require('../../utils/formato')
const servico = require('../../services/converterService')
const logger = require('../../core/logger')

const FERRAMENTA = "ang_dec_gms"
const NOME = "ferr71"

module.exports = {
    name: NOME,
    aliases: [],
    category: 'ferramentas',
    subcategory: "Conversões",
    description: "Converte grau decimal em grau, minuto e segundo",
    usage: "<graus decimais, ex -23,5505>",
    examples: ["-23,5505 — latitude de São Paulo","45,75 — quarenta e cinco graus e três quartos"],
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
