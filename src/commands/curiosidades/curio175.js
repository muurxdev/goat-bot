/**
 * .curio175 — As lutas por direitos civis no mundo
 *
 * As lutas por direitos civis no mundo: 6 fichas consultáveis (O voto das mulheres, O boicote aos ônibus, A marcha sobre Washington, A marcha do sal, O fim do apartheid, Stonewall).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "direitoscivis"

module.exports = {
    name: "curio175",
    aliases: ["cmd_curio175","alt_curio175","atalho_curio175","abrev_curio175","call_curio175","func_curio175"],
    category: "curiosidades",
    subcategory: "História",
    description: "As lutas por direitos civis no mundo",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["votofeminino — abre a ficha de o voto das mulheres","comparar votofeminino, boicoteonibus — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio175" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
