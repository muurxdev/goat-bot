/**
 * .curio244 — O teatro através dos séculos
 *
 * O teatro através dos séculos: 6 fichas consultáveis (Teatro grego antigo, Teatro nô, Commedia dellarte, O Globe de Shakespeare, Kabuki, O musical da Broadway).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "teatromundial"

module.exports = {
    name: "curio244",
    aliases: ["cmd_curio244","alt_curio244","atalho_curio244","abrev_curio244","call_curio244","func_curio244"],
    category: "curiosidades",
    subcategory: "Cultura",
    description: "O teatro através dos séculos",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["gregoantigo — abre a ficha de teatro grego antigo","comparar gregoantigo, teatrono — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio244" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
