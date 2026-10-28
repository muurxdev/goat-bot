/**
 * .curio85 — Patrimônios da Humanidade no Brasil
 *
 * Patrimônios da Humanidade no Brasil: 6 fichas consultáveis (Brasília, Santuário do Bom Jesus de Matosinhos, Missões Jesuíticas Guaranis, Complexo de Conservação do Pantanal, Cais do Valongo, Conjunto Moderno da Pampulha).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "patrimonios"

module.exports = {
    name: "curio85",
    aliases: ["cmd_curio85","alt_curio85","atalho_curio85","abrev_curio85","call_curio85","func_curio85"],
    category: "curiosidades",
    subcategory: "Brasil",
    description: "Patrimônios da Humanidade no Brasil",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["brasilia — abre a ficha de brasília","comparar brasilia, congonhas — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio85" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
