/**
 * .curio187 — Dinossauros, ficha por ficha
 *
 * Dinossauros, ficha por ficha: 6 fichas consultáveis (Tiranossauro-rex, Argentinossauro, Velociraptor, Triceratops, Estegossauro, Espinossauro).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "dinossauros"

module.exports = {
    name: "curio187",
    aliases: ["cmd_curio187","alt_curio187","atalho_curio187","abrev_curio187","call_curio187","func_curio187"],
    category: "curiosidades",
    subcategory: "Bicho e Planta",
    description: "Dinossauros, ficha por ficha",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["tiranossauro — abre a ficha de tiranossauro-rex","comparar tiranossauro, argentinossauro — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio187" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
