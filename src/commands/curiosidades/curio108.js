/**
 * .curio108 — A velocidade das coisas
 *
 * A velocidade das coisas: 6 fichas consultáveis (Pessoa caminhando, Corredor mais rápido, Guepardo, Som no ar, Estação Espacial, Luz no vácuo).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "velocidades"

module.exports = {
    name: "curio108",
    aliases: ["cmd_curio108","alt_curio108","atalho_curio108","abrev_curio108","call_curio108","func_curio108"],
    category: "curiosidades",
    subcategory: "Ciência",
    description: "A velocidade das coisas",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["caminhada — abre a ficha de pessoa caminhando","comparar caminhada, bolt — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio108" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
