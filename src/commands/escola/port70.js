/**
 * Comando .port70 — Obrigado ou obrigada.
 *
 * Arquivo GERADO por scripts/gen-portugues.js. Não edite à mão: rode o gerador.
 * A lógica mora em src/services/portugueseService.js, na operação
 * "par_obrigado". Aqui só acontece a apresentação.
 */
const F = require('../../utils/formato')
const aula = require('../../services/portugueseService')
const logger = require('../../core/logger')

const OPERACAO = "par_obrigado"
const NOME = "port70"

module.exports = {
    name: NOME,
    aliases: ["cmd_port70","alt_port70","atalho_port70"],
    category: 'escola',
    subcategory: "Português",
    description: "Quando usar obrigado ou obrigada",
    usage: "<frase>",
    examples: ["obrigado ... — mande a frase inteira que eu analiso"],
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
