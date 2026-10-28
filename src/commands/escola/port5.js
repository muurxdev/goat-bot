/**
 * Comando .port5 — Modo subjuntivo.
 *
 * Arquivo GERADO por scripts/gen-portugues.js. Não edite à mão: rode o gerador.
 * A lógica mora em src/services/portugueseService.js, na operação
 * "conjsubjuntivo". Aqui só acontece a apresentação.
 */
const F = require('../../utils/formato')
const aula = require('../../services/portugueseService')
const logger = require('../../core/logger')

const OPERACAO = "conjsubjuntivo"
const NOME = "port5"

module.exports = {
    name: NOME,
    aliases: ["cmd_port5","alt_port5","atalho_port5"],
    category: 'escola',
    subcategory: "Português",
    description: "Conjuga o verbo nos três tempos do subjuntivo",
    usage: "<verbo>",
    examples: ["ter — que eu tenha, se eu tivesse, quando eu tiver"],
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
