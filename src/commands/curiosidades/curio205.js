/**
 * .curio205 — Peixes de água doce e de mar
 *
 * Peixes de água doce e de mar: 6 fichas consultáveis (Tubarão-baleia, Pirarucu, Celacanto, Peixe-arqueiro, Peixe-pescador abissal, Dourado).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "peixes"

module.exports = {
    name: "curio205",
    aliases: ["cmd_curio205","alt_curio205","atalho_curio205","abrev_curio205","call_curio205","func_curio205"],
    category: "curiosidades",
    subcategory: "Bicho e Planta",
    description: "Peixes de água doce e de mar",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["tubaraobaleia — abre a ficha de tubarão-baleia","comparar tubaraobaleia, pirarucu — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio205" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
