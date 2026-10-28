/**
 * .curio82 — A bandeira do Brasil, elemento por elemento
 *
 * A bandeira do Brasil, elemento por elemento: 6 fichas consultáveis (Campo verde, Losango amarelo, Círculo azul estrelado, As 27 estrelas, A estrela acima da faixa, Ordem e Progresso).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "bandeirabr"

module.exports = {
    name: "curio82",
    aliases: ["cmd_curio82","alt_curio82","atalho_curio82","abrev_curio82","call_curio82","func_curio82"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "A bandeira do Brasil, elemento por elemento",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["verde — abre a ficha de campo verde","comparar verde, amarelo — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio82" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
