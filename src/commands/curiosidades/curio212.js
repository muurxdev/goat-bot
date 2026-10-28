/**
 * .curio212 — As frutas nativas do Brasil
 *
 * As frutas nativas do Brasil: 6 fichas consultáveis (Açaí, Cupuaçu, Jabuticaba, Pitanga, Caju, Bacuri).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "frutasbr"

module.exports = {
    name: "curio212",
    aliases: ["cmd_curio212","alt_curio212","atalho_curio212","abrev_curio212","call_curio212","func_curio212"],
    category: "curiosidades",
    subcategory: "Bicho e Planta",
    description: "As frutas nativas do Brasil",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["acai — abre a ficha de açaí","comparar acai, cupuacu — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio212" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
