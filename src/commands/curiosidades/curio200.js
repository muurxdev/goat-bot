/**
 * .curio200 — Tartarugas, jabutis e cágados
 *
 * Tartarugas, jabutis e cágados: 6 fichas consultáveis (Tartaruga-de-couro, Tartaruga-verde, Jabuti-piranga, Tartaruga-da-amazônia, Tartaruga-gigante-de-galápagos, Cágado-de-pescoço-de-cobra).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "tartarugas"

module.exports = {
    name: "curio200",
    aliases: ["cmd_curio200","alt_curio200","atalho_curio200","abrev_curio200","call_curio200","func_curio200"],
    category: "curiosidades",
    subcategory: "Bicho e Planta",
    description: "Tartarugas, jabutis e cágados",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["couro — abre a ficha de tartaruga-de-couro","comparar couro, verde — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio200" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
