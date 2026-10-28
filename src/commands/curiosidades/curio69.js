/**
 * .curio69 — Bebidas que nasceram no Brasil
 *
 * Bebidas que nasceram no Brasil: 6 fichas consultáveis (Cachaça, Caipirinha, Guaraná, Cajuína, Tereré, Café brasileiro).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "bebidas"

module.exports = {
    name: "curio69",
    aliases: ["cmd_curio69","alt_curio69","atalho_curio69","abrev_curio69","call_curio69","func_curio69"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "Bebidas que nasceram no Brasil",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["cachaca — abre a ficha de cachaça","comparar cachaca, caipirinha — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio69" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
