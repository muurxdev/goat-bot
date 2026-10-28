/**
 * .curio190 — Polvos, lulas e sépias
 *
 * Polvos, lulas e sépias: 6 fichas consultáveis (Polvo-comum, Lula-gigante, Lula-colossal, Sépia-comum, Náutilo, Polvo-de-anéis-azuis).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "cefalopodes"

module.exports = {
    name: "curio190",
    aliases: ["cmd_curio190","alt_curio190","atalho_curio190","abrev_curio190","call_curio190","func_curio190"],
    category: "curiosidades",
    subcategory: "Bicho e Planta",
    description: "Polvos, lulas e sépias",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["polvocomum — abre a ficha de polvo-comum","comparar polvocomum, lulagigante — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio190" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
