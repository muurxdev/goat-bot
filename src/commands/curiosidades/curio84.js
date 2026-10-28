/**
 * .curio84 — As cidades históricas brasileiras
 *
 * As cidades históricas brasileiras: 6 fichas consultáveis (Ouro Preto, Paraty, Olinda, São Luís, Diamantina, Cidade de Goiás).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "cidadeshistoricas"

module.exports = {
    name: "curio84",
    aliases: ["cmd_curio84","alt_curio84","atalho_curio84","abrev_curio84","call_curio84","func_curio84"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "As cidades históricas brasileiras",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["ouropreto — abre a ficha de ouro preto","comparar ouropreto, paraty — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio84" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
