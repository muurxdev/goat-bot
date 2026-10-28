/**
 * .curio184 — Peçonhentos e venenosos: quem é quem
 *
 * Peçonhentos e venenosos: quem é quem: 6 fichas consultáveis (Vespa-do-mar, Taipan-do-interior, Polvo-de-anéis-azuis, Rã-dourada-venenosa, Baiacu, Escorpião-amarelo).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "peconhentos"

module.exports = {
    name: "curio184",
    aliases: ["cmd_curio184","alt_curio184","atalho_curio184","abrev_curio184","call_curio184","func_curio184"],
    category: "curiosidades",
    subcategory: "Bicho e Planta",
    description: "Peçonhentos e venenosos: quem é quem",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["vespadomar — abre a ficha de vespa-do-mar","comparar vespadomar, taipan — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio184" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
