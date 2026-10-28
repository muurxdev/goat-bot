/**
 * .curio152 — Os incas e o império dos caminhos
 *
 * Os incas e o império dos caminhos: 6 fichas consultáveis (Cusco, O Qhapaq Nan, O quipu, Os chasquis, Machu Picchu, A pedra sem argamassa).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "incas"

module.exports = {
    name: "curio152",
    aliases: ["cmd_curio152","alt_curio152","atalho_curio152","abrev_curio152","call_curio152","func_curio152"],
    category: "curiosidades",
    subcategory: "História",
    description: "Os incas e o império dos caminhos",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["cusco — abre a ficha de cusco","comparar cusco, qhapaqnan — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio152" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
