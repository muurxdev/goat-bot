/**
 * .curio206 — Corais e recifes
 *
 * Corais e recifes: 6 fichas consultáveis (Grande Barreira de Coral, Banco dos Abrolhos, Atol, Coral-cérebro, Coral de água fria, Coral-sol).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "corais"

module.exports = {
    name: "curio206",
    aliases: ["cmd_curio206","alt_curio206","atalho_curio206","abrev_curio206","call_curio206","func_curio206"],
    category: "curiosidades",
    subcategory: "Bicho e Planta",
    description: "Corais e recifes",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["barreira — abre a ficha de grande barreira de coral","comparar barreira, abrolhos — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio206" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
