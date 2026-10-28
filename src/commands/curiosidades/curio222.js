/**
 * .curio222 — Séries que marcaram a televisão
 *
 * Séries que marcaram a televisão: 6 fichas consultáveis (I Love Lucy, Jornada nas Estrelas, Chaves, Twin Peaks, Família Soprano, Breaking Bad).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "series"

module.exports = {
    name: "curio222",
    aliases: ["cmd_curio222","alt_curio222","atalho_curio222","abrev_curio222","call_curio222","func_curio222"],
    category: "curiosidades",
    subcategory: "Cultura",
    description: "Séries que marcaram a televisão",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["ilovelucy — abre a ficha de i love lucy","comparar ilovelucy, jornada — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio222" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
