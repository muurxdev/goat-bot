/**
 * .curio133 — Os motores e o truque de cada um
 *
 * Os motores e o truque de cada um: 6 fichas consultáveis (Máquina a vapor, Motor de combustão interna, Motor elétrico, Motor a jato, Foguete, Diesel marítimo).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "motores"

module.exports = {
    name: "curio133",
    aliases: ["cmd_curio133","alt_curio133","atalho_curio133","abrev_curio133","call_curio133","func_curio133"],
    category: "curiosidades",
    subcategory: "Ciência",
    description: "Os motores e o truque de cada um",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["vapor — abre a ficha de máquina a vapor","comparar vapor, otto — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio133" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
