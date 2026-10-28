/**
 * Comando .port29 — Porque, por que, porquê e por quê.
 *
 * Arquivo GERADO por scripts/gen-portugues.js. Não edite à mão: rode o gerador.
 * A lógica mora em src/services/portugueseService.js, na operação
 * "porque". Aqui só acontece a apresentação.
 */
const F = require('../../utils/formato')
const aula = require('../../services/portugueseService')
const logger = require('../../core/logger')

const OPERACAO = "porque"
const NOME = "port29"

module.exports = {
    name: NOME,
    aliases: ["cmd_port29","alt_port29","atalho_port29"],
    category: 'escola',
    subcategory: "Português",
    description: "Analisa qual das quatro formas cabe na frase",
    usage: "<frase>",
    examples: ["Por que você saiu? — confere a forma","Você saiu por que?"],
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
