/**
 * .mat22 — Parcela fixa de um financiamento e o total pago
 *
 * 🧾 Valor da parcela (tabela Price). Matéria: Matemática.
 *
 * Arquivo gerado por scripts/gen-matematica.js a partir da tabela declarativa.
 * A conta e a explicação moram no tópico "parcela" de
 * src/services/exactSciencesService.js; aqui só há apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-matematica.js` apaga.
 */

const F = require('../../utils/formato')
const E = require('../../services/exactSciencesService')

const CHAVE = "parcela"

module.exports = {
    name: "mat22",
    aliases: ["cmd_mat22","alt_mat22","atalho_mat22"],
    category: "escola",
    subcategory: "Matemática",
    description: "Parcela fixa de um financiamento e o total pago",
    usage: "<valor financiado> <taxa % ao mês> <nº de parcelas>",
    examples: ["12000 1,99 48 — carro em 48 meses","3000 3,5 10 — parcelamento de loja","250000 0,85 360 — financiamento longo"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = E.responder(CHAVE, args, { comando: "mat22", prefix })
        return reply(F.tela({ ...tela, prefix }))
    }
}
