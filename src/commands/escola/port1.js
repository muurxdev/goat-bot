/**
 * Comando .port1 — Conjugar um verbo.
 *
 * Arquivo GERADO por scripts/gen-portugues.js. Não edite à mão: rode o gerador.
 * A lógica mora em src/services/portugueseService.js, na operação
 * "conjugar". Aqui só acontece a apresentação.
 */
const F = require('../../utils/formato')
const aula = require('../../services/portugueseService')
const logger = require('../../core/logger')

const OPERACAO = "conjugar"
const NOME = "port1"

module.exports = {
    name: NOME,
    aliases: ["cmd_port1","alt_port1","atalho_port1"],
    category: 'escola',
    subcategory: "Português",
    description: "Conjuga o verbo nos tempos que mais caem",
    usage: "<verbo no infinitivo>",
    examples: ["correr — mostra os tempos do indicativo","ser — sai da tabela dos irregulares"],
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
