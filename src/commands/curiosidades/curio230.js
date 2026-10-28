/**
 * .curio230 — A história dos quadrinhos
 *
 * A história dos quadrinhos: 6 fichas consultáveis (O Menino Amarelo, Superman, O código de censura, A virada da Marvel, Watchmen, Turma da Mônica).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "quadrinhos"

module.exports = {
    name: "curio230",
    aliases: ["cmd_curio230","alt_curio230","atalho_curio230","abrev_curio230","call_curio230","func_curio230"],
    category: "curiosidades",
    subcategory: "Cultura",
    description: "A história dos quadrinhos",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["yellowkid — abre a ficha de o menino amarelo","comparar yellowkid, superman — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio230" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
