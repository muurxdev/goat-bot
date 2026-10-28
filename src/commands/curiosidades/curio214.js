/**
 * .curio214 — Fungos e cogumelos
 *
 * Fungos e cogumelos: 6 fichas consultáveis (Amanita-faloide, Champignon, Shiitake, Armilária gigante, Bolor do penicílio, Trufa-negra).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "cogumelos"

module.exports = {
    name: "curio214",
    aliases: ["cmd_curio214","alt_curio214","atalho_curio214","abrev_curio214","call_curio214","func_curio214"],
    category: "curiosidades",
    subcategory: "Bicho e Planta",
    description: "Fungos e cogumelos",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["falohide — abre a ficha de amanita-faloide","comparar falohide, champignon — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio214" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
