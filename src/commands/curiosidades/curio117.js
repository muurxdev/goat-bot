/**
 * .curio117 — Os tipos de célula e quanto cada uma dura
 *
 * Os tipos de célula e quanto cada uma dura: 6 fichas consultáveis (Neurônio, Hemácia, Óvulo, Espermatozoide, Célula do osso, Célula da pele).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "celulas"

module.exports = {
    name: "curio117",
    aliases: ["cmd_curio117","alt_curio117","atalho_curio117","abrev_curio117","call_curio117","func_curio117"],
    category: "curiosidades",
    subcategory: "Ciência",
    description: "Os tipos de célula e quanto cada uma dura",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["neuronio — abre a ficha de neurônio","comparar neuronio, hemacia — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio117" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
