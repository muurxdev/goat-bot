/**
 * .curio31 — Estreitos que o mundo inteiro vigia
 *
 * Estreitos que o mundo inteiro vigia: 6 fichas consultáveis (Estreito de Ormuz, Estreito de Malaca, Estreito de Bósforo, Estreito de Gibraltar, Estreito de Bering, Estreito de Magalhães).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "estreitos"

module.exports = {
    name: "curio31",
    aliases: ["cmd_curio31","alt_curio31","atalho_curio31","abrev_curio31","call_curio31","func_curio31"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Estreitos que o mundo inteiro vigia",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["ormuz — abre a ficha de estreito de ormuz","comparar ormuz, malaca — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio31" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
