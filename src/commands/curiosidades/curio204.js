/**
 * .curio204 — Aranhas e escorpiões
 *
 * Aranhas e escorpiões: 6 fichas consultáveis (Caranguejeira-golias, Armadeira, Viúva-negra, Aranha-de-teia-dourada, Escorpião-amarelo, Escorpião-imperador).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "aranhas"

module.exports = {
    name: "curio204",
    aliases: ["cmd_curio204","alt_curio204","atalho_curio204","abrev_curio204","call_curio204","func_curio204"],
    category: "curiosidades",
    subcategory: "Bicho e Planta",
    description: "Aranhas e escorpiões",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["golias — abre a ficha de caranguejeira-golias","comparar golias, armadeira — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio204" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
