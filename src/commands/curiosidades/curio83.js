/**
 * .curio83 — Os feriados nacionais e a origem de cada um
 *
 * Os feriados nacionais e a origem de cada um: 6 fichas consultáveis (Confraternização Universal, Tiradentes, Dia do Trabalho, Independência, Dia da Consciência Negra, Carnaval).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "feriados"

module.exports = {
    name: "curio83",
    aliases: ["cmd_curio83","alt_curio83","atalho_curio83","abrev_curio83","call_curio83","func_curio83"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "Os feriados nacionais e a origem de cada um",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["confraternizacao — abre a ficha de confraternização universal","comparar confraternizacao, tiradentes — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio83" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
