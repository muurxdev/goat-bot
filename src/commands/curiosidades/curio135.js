/**
 * .curio135 — A internet por dentro
 *
 * A internet por dentro: 6 fichas consultáveis (Cabo submarino, Endereço de rede, Servidor de nomes, Roteador, Satélite, Provedor).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "internet"

module.exports = {
    name: "curio135",
    aliases: ["cmd_curio135","alt_curio135","atalho_curio135","abrev_curio135","call_curio135","func_curio135"],
    category: "curiosidades",
    subcategory: "Ciência",
    description: "A internet por dentro",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["cabosubmarino — abre a ficha de cabo submarino","comparar cabosubmarino, endereco — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio135" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
