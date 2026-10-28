/**
 * Comando .ferr351 — Somar horários e durações.
 *
 * Arquivo GERADO por scripts/gen-ferramentas.js. Não edite à mão: rode o gerador.
 * A conta mora em src/services/toolboxService.js, na ferramenta
 * "dh_soma_horas". Aqui só acontece a apresentação: sem rede e sem banco.
 */
const F = require('../../utils/formato')
const servico = require('../../services/toolboxService')
const logger = require('../../core/logger')

const FERRAMENTA = "dh_soma_horas"
const NOME = "ferr351"

module.exports = {
    name: NOME,
    aliases: [],
    category: 'ferramentas',
    subcategory: "Data e Hora",
    description: "Soma vários tempos no formato horas e minutos",
    usage: "<1h30> <45min> <2:15> ...",
    examples: ["1:30 2:45 0:50 — três durações","8:00 7:30 — dois dias de trabalho"],
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
