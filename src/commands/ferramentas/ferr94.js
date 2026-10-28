/**
 * Comando .ferr94 — Gramas em medida caseira.
 *
 * Arquivo GERADO por scripts/gen-ferramentas.js. Não edite à mão: rode o gerador.
 * A conta mora em src/services/converterService.js, na ferramenta
 * "coz_g_para_medida". Aqui só acontece a apresentação: sem rede e sem banco.
 */
const F = require('../../utils/formato')
const servico = require('../../services/converterService')
const logger = require('../../core/logger')

const FERRAMENTA = "coz_g_para_medida"
const NOME = "ferr94"

module.exports = {
    name: NOME,
    aliases: [],
    category: 'ferramentas',
    subcategory: "Conversões",
    description: "Diz quantas xícaras e colheres dão X gramas",
    usage: "<gramas> <ingrediente>",
    examples: ["250 farinha — 250 gramas de farinha em xícaras","100 acucar — cem gramas de açúcar"],
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
