/**
 * .curio186 — Os que sumiram na nossa frente
 *
 * Os que sumiram na nossa frente: 6 fichas consultáveis (Dodô, Tigre-da-tasmânia, Rolinha-passageira, Vaca-marinha-de-steller, Quagga, Ararinha-azul).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "extintosrecentes"

module.exports = {
    name: "curio186",
    aliases: ["cmd_curio186","alt_curio186","atalho_curio186","abrev_curio186","call_curio186","func_curio186"],
    category: "curiosidades",
    subcategory: "Bicho e Planta",
    description: "Os que sumiram na nossa frente",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["dodo — abre a ficha de dodô","comparar dodo, tilacino — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio186" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
