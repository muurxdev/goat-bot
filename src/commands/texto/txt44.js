/**
 * Comando .txt44 — Trocar uma palavra por outra.
 *
 * Arquivo GERADO por scripts/gen-texto.js. Não edite à mão: rode o gerador.
 * A lógica mora em src/services/textStudioService.js, na operação
 * "trocarpalavra". Aqui só acontece a apresentação. As operações de criar texto passam pelo
 * Claude em src/services/textStudioIA.js (as demais voltam direto para o serviço local).
 */
const F = require('../../utils/formato')
const estudio = require('../../services/textStudioService')
const estudioIA = require('../../services/textStudioIA')
const logger = require('../../core/logger')

const OPERACAO = "trocarpalavra"
const NOME = "txt44"

module.exports = {
    name: NOME,
    aliases: [],
    category: 'texto',
    subcategory: "Transformar",
    description: "Troca uma palavra por outra no texto inteiro",
    usage: "<velho>novo> <texto>",
    examples: ["sol>lua o sol nasceu — vira o lua nasceu"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.', info }) => {
        const entrada = estudio.entradaDe(args, info)
        if (!entrada) {
            return reply(F.tela(estudio.telaDeAjuda(OPERACAO, { prefix, nome: NOME })))
        }
        try {
            return reply(F.tela(await estudioIA.telaDeResultado(OPERACAO, entrada, { prefix, nome: NOME })))
        } catch (erro) {
            logger.error('[TEXTO] .' + NOME + ' (' + OPERACAO + ') falhou: ' + erro.message, erro)
            return reply('❌ Não consegui trabalhar esse texto agora. Tente de novo com um trecho menor.')
        }
    }
}
