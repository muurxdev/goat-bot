/**
 * .curio101 — Estrelas que dá para achar no céu
 *
 * Estrelas que dá para achar no céu: 6 fichas consultáveis (Sirius, Proxima Centauri, Betelgeuse, Polaris, Canopus, UY Scuti).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "estrelas"

module.exports = {
    name: "curio101",
    aliases: ["cmd_curio101","alt_curio101","atalho_curio101","abrev_curio101","call_curio101","func_curio101"],
    category: "curiosidades",
    subcategory: "Ciência",
    description: "Estrelas que dá para achar no céu",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["sirius — abre a ficha de sirius","comparar sirius, proxima — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio101" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
