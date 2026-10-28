/**
 * .curio103 — Buracos negros, sem mistificação
 *
 * Buracos negros, sem mistificação: 6 fichas consultáveis (Horizonte de eventos, Sagitário A estrela, M87 estrela, Buraco negro estelar, Ondas gravitacionais, Radiação Hawking).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "buracosnegros"

module.exports = {
    name: "curio103",
    aliases: ["cmd_curio103","alt_curio103","atalho_curio103","abrev_curio103","call_curio103","func_curio103"],
    category: "curiosidades",
    subcategory: "Ciência",
    description: "Buracos negros, sem mistificação",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["horizonte — abre a ficha de horizonte de eventos","comparar horizonte, sagitarioa — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio103" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
