/**
 * Comando .port27 — Quando a crase é obrigatória.
 *
 * Arquivo GERADO por scripts/gen-portugues.js. Não edite à mão: rode o gerador.
 * A lógica mora em src/services/portugueseService.js, na operação
 * "crasesim". Aqui só acontece a apresentação.
 */
const F = require('../../utils/formato')
const aula = require('../../services/portugueseService')
const logger = require('../../core/logger')

const OPERACAO = "crasesim"
const NOME = "port27"

module.exports = {
    name: NOME,
    aliases: ["cmd_port27","alt_port27","atalho_port27"],
    category: 'escola',
    subcategory: "Português",
    description: "Lista os casos em que a crase é obrigatória",
    usage: "[palavra para procurar]",
    examples: ["sem nada — mostra a lista","hora — procura o caso das horas"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.', info }) => {
        const entrada = aula.entradaDe(args, info)
        if (!entrada) {
            return reply(F.tela(aula.telaDeAjuda(OPERACAO, { prefix, nome: NOME })))
        }
        try {
            return reply(F.tela(aula.telaDeResultado(OPERACAO, entrada, { prefix, nome: NOME })))
        } catch (erro) {
            logger.error('[ESCOLA] .' + NOME + ' (' + OPERACAO + ') falhou: ' + erro.message, erro)
            return reply('❌ Não consegui analisar isso agora. Tente de novo com um trecho menor.')
        }
    }
}
