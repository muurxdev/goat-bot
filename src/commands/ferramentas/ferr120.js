/**
 * Comando .ferr120 — Horário entre duas cidades.
 *
 * Arquivo GERADO por scripts/gen-ferramentas.js. Não edite à mão: rode o gerador.
 * A conta mora em src/services/converterService.js, na ferramenta
 * "fuso_entre_capitais". Aqui só acontece a apresentação: sem rede e sem banco.
 */
const F = require('../../utils/formato')
const servico = require('../../services/converterService')
const logger = require('../../core/logger')

const FERRAMENTA = "fuso_entre_capitais"
const NOME = "ferr120"

module.exports = {
    name: NOME,
    aliases: [],
    category: 'ferramentas',
    subcategory: "Conversões",
    description: "Converte um horário entre duas cidades da lista",
    usage: "<cidade de origem> <cidade de destino> [hora]",
    examples: ["brasilia toquio 09:00 — nove da manhã daqui em Tóquio","lisboa novayork — agora nas duas cidades"],
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
