/**
 * .curio62 — Cavernas e grutas do Brasil
 *
 * Cavernas e grutas do Brasil: 6 fichas consultáveis (Toca da Boa Vista, Gruta do Lago Azul, Gruta do Janelão, Caverna Santana, Abismo Anhumas, Gruta de Maquiné).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "grutas"

module.exports = {
    name: "curio62",
    aliases: ["cmd_curio62","alt_curio62","atalho_curio62","abrev_curio62","call_curio62","func_curio62"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "Cavernas e grutas do Brasil",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["tocadaboavista — abre a ficha de toca da boa vista","comparar tocadaboavista, lagoazul — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio62" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
