/**
 * .curio63 — Comidas típicas do Norte
 *
 * Comidas típicas do Norte: 6 fichas consultáveis (Tacacá, Pato no tucupi, Maniçoba, Tambaqui na brasa, Jambu e tucupi preto, Açaí na tigela salgado).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "comidanorte"

module.exports = {
    name: "curio63",
    aliases: ["cmd_curio63","alt_curio63","atalho_curio63","abrev_curio63","call_curio63","func_curio63"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "Comidas típicas do Norte",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["tacaca — abre a ficha de tacacá","comparar tacaca, patonotucupi — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio63" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
