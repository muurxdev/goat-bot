/**
 * Comando .port127 — Modernismo, terceira fase.
 *
 * Arquivo GERADO por scripts/gen-portugues.js. Não edite à mão: rode o gerador.
 * A lógica mora em src/services/portugueseService.js, na operação
 * "esc_modernismo3". Aqui só acontece a apresentação.
 */
const F = require('../../utils/formato')
const aula = require('../../services/portugueseService')
const logger = require('../../core/logger')

const OPERACAO = "esc_modernismo3"
const NOME = "port127"

module.exports = {
    name: NOME,
    aliases: ["cmd_port127","alt_port127","atalho_port127"],
    category: 'escola',
    subcategory: "Literatura",
    description: "Escola literária: Modernismo, terceira fase",
    usage: "[autor ou obra]",
    examples: ["sem nada — ficha da escola","autores — só a lista de autores"],
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
