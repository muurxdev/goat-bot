/**
 * .curio237 — Quadros que todo mundo conhece
 *
 * Quadros que todo mundo conhece: 6 fichas consultáveis (Mona Lisa, A Última Ceia, A Criação de Adão, A Noite Estrelada, O Grito, Guernica).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "pintura"

module.exports = {
    name: "curio237",
    aliases: ["cmd_curio237","alt_curio237","atalho_curio237","abrev_curio237","call_curio237","func_curio237"],
    category: "curiosidades",
    subcategory: "Cultura",
    description: "Quadros que todo mundo conhece",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["monalisa — abre a ficha de mona lisa","comparar monalisa, ultimaceia — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio237" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
