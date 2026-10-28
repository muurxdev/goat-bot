/**
 * .curio161 — As Grandes Navegações
 *
 * As Grandes Navegações: 6 fichas consultáveis (A tomada de Ceuta, Bartolomeu Dias, Vasco da Gama, Cristóvão Colombo, A primeira volta ao mundo, A caravela).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "grandesnavegacoes"

module.exports = {
    name: "curio161",
    aliases: ["cmd_curio161","alt_curio161","atalho_curio161","abrev_curio161","call_curio161","func_curio161"],
    category: "curiosidades",
    subcategory: "História",
    description: "As Grandes Navegações",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["ceuta — abre a ficha de a tomada de ceuta","comparar ceuta, bartolomeudias — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio161" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
