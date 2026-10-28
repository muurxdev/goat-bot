/**
 * .curio179 — Os recordistas do reino animal
 *
 * Os recordistas do reino animal: 6 fichas consultáveis (Girafa, Baleia-azul, Zifio-de-cuvier, Grifo-de-rüppell, Camarão-de-estalo, Coala).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "recordistas"

module.exports = {
    name: "curio179",
    aliases: ["cmd_curio179","alt_curio179","atalho_curio179","abrev_curio179","call_curio179","func_curio179"],
    category: "curiosidades",
    subcategory: "Bicho e Planta",
    description: "Os recordistas do reino animal",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["girafa — abre a ficha de girafa","comparar girafa, baleiaazul — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio179" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
