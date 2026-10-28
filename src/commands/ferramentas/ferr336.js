/**
 * Comando .ferr336 — Dias úteis entre duas datas.
 *
 * Arquivo GERADO por scripts/gen-ferramentas.js. Não edite à mão: rode o gerador.
 * A conta mora em src/services/toolboxService.js, na ferramenta
 * "dh_dias_uteis". Aqui só acontece a apresentação: sem rede e sem banco.
 */
const F = require('../../utils/formato')
const servico = require('../../services/toolboxService')
const logger = require('../../core/logger')

const FERRAMENTA = "dh_dias_uteis"
const NOME = "ferr336"

module.exports = {
    name: NOME,
    aliases: [],
    category: 'ferramentas',
    subcategory: "Data e Hora",
    description: "Conta dias úteis descontando feriados nacionais",
    usage: "<data inicial> <data final>",
    examples: ["01/09/2026 30/09/2026 — dias úteis de setembro","hoje 31/12/2026 — até o fim do ano"],
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
