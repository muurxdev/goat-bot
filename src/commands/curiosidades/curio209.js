/**
 * .curio209 — As árvores mais notáveis do mundo
 *
 * As árvores mais notáveis do mundo: 6 fichas consultáveis (Sequoia-vermelha, Pinheiro-bristlecone, Pando, Baobá, Dragoeiro, Figueira-de-bengala).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "arvores"

module.exports = {
    name: "curio209",
    aliases: ["cmd_curio209","alt_curio209","atalho_curio209","abrev_curio209","call_curio209","func_curio209"],
    category: "curiosidades",
    subcategory: "Bicho e Planta",
    description: "As árvores mais notáveis do mundo",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["sequoia — abre a ficha de sequoia-vermelha","comparar sequoia, bristlecone — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio209" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
