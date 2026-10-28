/**
 * .curio157 — A era de ouro islâmica, de Bagdá a Córdoba
 *
 * A era de ouro islâmica, de Bagdá a Córdoba: 6 fichas consultáveis (Al-Khwarizmi, Ibn al-Haytham, Ibn Sina, o Avicena, Al-Razi, o Rasis, Ibn Battuta, Ibn Khaldun).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "islamicomedieval"

module.exports = {
    name: "curio157",
    aliases: ["cmd_curio157","alt_curio157","atalho_curio157","abrev_curio157","call_curio157","func_curio157"],
    category: "curiosidades",
    subcategory: "História",
    description: "A era de ouro islâmica, de Bagdá a Córdoba",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["alkhwarizmi — abre a ficha de al-khwarizmi","comparar alkhwarizmi, ibnalhaytham — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio157" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
