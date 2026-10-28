/**
 * .curio121 — Marcos da cirurgia
 *
 * Marcos da cirurgia: 6 fichas consultáveis (Antissepsia, Transplante de coração, Cirurgia de catarata, Cesárea, Laparoscopia, Mão biônica).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "cirurgias"

module.exports = {
    name: "curio121",
    aliases: ["cmd_curio121","alt_curio121","atalho_curio121","abrev_curio121","call_curio121","func_curio121"],
    category: "curiosidades",
    subcategory: "Ciência",
    description: "Marcos da cirurgia",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["antissepsia — abre a ficha de antissepsia","comparar antissepsia, coracao — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio121" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
