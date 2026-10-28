/**
 * .curio47 — Mares fechados e mares estranhos
 *
 * Mares fechados e mares estranhos: 6 fichas consultáveis (Mar dos Sargaços, Mar de Aral, Mar Vermelho, Mar Báltico, Mar Negro, Mar do Caribe).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "mares"

module.exports = {
    name: "curio47",
    aliases: ["cmd_curio47","alt_curio47","atalho_curio47","abrev_curio47","call_curio47","func_curio47"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "Mares fechados e mares estranhos",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["sargacos — abre a ficha de mar dos sargaços","comparar sargacos, aral — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio47" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
