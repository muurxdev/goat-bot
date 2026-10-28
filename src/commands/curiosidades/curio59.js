/**
 * .curio59 — Os pontos mais altos do Brasil
 *
 * Os pontos mais altos do Brasil: 6 fichas consultáveis (Pico da Neblina, Pico 31 de Março, Pico da Bandeira, Pico das Agulhas Negras, Monte Roraima, Pedra do Baú e Marins).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "montanhasbr"

module.exports = {
    name: "curio59",
    aliases: ["cmd_curio59","alt_curio59","atalho_curio59","abrev_curio59","call_curio59","func_curio59"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "Os pontos mais altos do Brasil",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["neblina — abre a ficha de pico da neblina","comparar neblina, trintaeum — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio59" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
