/**
 * .curio236 — Personagens que saíram dos livros e viraram gente
 *
 * Personagens que saíram dos livros e viraram gente: 6 fichas consultáveis (Sherlock Holmes, A criatura de Frankenstein, Alice, Drácula, Pinóquio, Robinson Crusoé).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "personagensliterarios"

module.exports = {
    name: "curio236",
    aliases: ["cmd_curio236","alt_curio236","atalho_curio236","abrev_curio236","call_curio236","func_curio236"],
    category: "curiosidades",
    subcategory: "Cultura",
    description: "Personagens que saíram dos livros e viraram gente",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["sherlock — abre a ficha de sherlock holmes","comparar sherlock, frankenstein — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio236" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
