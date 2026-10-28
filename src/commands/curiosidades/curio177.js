/**
 * .curio177 — De onde vêm as datas comemorativas
 *
 * De onde vêm as datas comemorativas: 6 fichas consultáveis (O Natal, O Dia das Mães, O Dia do Trabalho, O Halloween, O Ano-Novo, O Dia da Mulher).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "datascomemorativas"

module.exports = {
    name: "curio177",
    aliases: ["cmd_curio177","alt_curio177","atalho_curio177","abrev_curio177","call_curio177","func_curio177"],
    category: "curiosidades",
    subcategory: "História",
    description: "De onde vêm as datas comemorativas",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["natal — abre a ficha de o natal","comparar natal, diadasmaes — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio177" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
