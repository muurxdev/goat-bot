/**
 * .curio32 — Os prédios mais altos do mundo
 *
 * Os prédios mais altos do mundo: 6 fichas consultáveis (Burj Khalifa, Merdeka 118, Shanghai Tower, Abraj Al-Bait, Empire State Building, Torre de Pisa).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "predios"

module.exports = {
    name: "curio32",
    aliases: ["cmd_curio32","alt_curio32","atalho_curio32","abrev_curio32","call_curio32","func_curio32"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Os prédios mais altos do mundo",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["burj — abre a ficha de burj khalifa","comparar burj, merdeka — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio32" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
