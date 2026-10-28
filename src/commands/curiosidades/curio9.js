/**
 * .curio9 — Os pontos extremos do planeta
 *
 * Os pontos extremos do planeta: 7 fichas consultáveis (Ponto mais alto acima do mar, Ponto mais distante do centro da Terra, Montanha mais alta do pé ao topo, Ponto mais fundo do mar, Lugar mais frio já medido, Lugar mais quente já medido, Lugar mais chuvoso habitado).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "extremos"

module.exports = {
    name: "curio9",
    aliases: ["cmd_curio9","alt_curio9","atalho_curio9","abrev_curio9","call_curio9","func_curio9"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Os pontos extremos do planeta",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["everest — abre a ficha de ponto mais alto acima do mar","comparar everest, chimborazo — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio9" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
