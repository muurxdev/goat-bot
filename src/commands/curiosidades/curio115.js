/**
 * .curio115 — As fases do sono e o que acontece em cada uma
 *
 * As fases do sono e o que acontece em cada uma: 6 fichas consultáveis (Fase 1, o cochilo, Fase 2, o sono leve, Fase 3, o sono profundo, Sono REM, O ciclo completo, A hora de acordar).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "sono"

module.exports = {
    name: "curio115",
    aliases: ["cmd_curio115","alt_curio115","atalho_curio115","abrev_curio115","call_curio115","func_curio115"],
    category: "curiosidades",
    subcategory: "Ciência",
    description: "As fases do sono e o que acontece em cada uma",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["fase1 — abre a ficha de fase 1, o cochilo","comparar fase1, fase2 — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio115" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
