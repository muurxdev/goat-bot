/**
 * .mat141 — Tudo sobre um elemento: símbolo, massa, família
 *
 * ⚗️ Ficha de um elemento químico. Matéria: Química.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "elemento" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "elemento"

module.exports = {
    name: "mat141",
    aliases: ["cmd_mat141","alt_mat141","atalho_mat141"],
    category: "escola",
    subcategory: "Química",
    description: "Tudo sobre um elemento: símbolo, massa, família",
    usage: "<símbolo, nome ou número atômico>",
    examples: ["Fe — o ferro","oxigenio — pelo nome","79 — pelo número atômico"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat141", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
