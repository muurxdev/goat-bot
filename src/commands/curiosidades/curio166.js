/**
 * .curio166 — A Revolução Francesa
 *
 * A Revolução Francesa: 6 fichas consultáveis (A queda da Bastilha, A Declaração dos Direitos, A guilhotina, A execução do rei, O Terror, O calendário novo).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "revolucaofrancesa"

module.exports = {
    name: "curio166",
    aliases: ["cmd_curio166","alt_curio166","atalho_curio166","abrev_curio166","call_curio166","func_curio166"],
    category: "curiosidades",
    subcategory: "História",
    description: "A Revolução Francesa",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["bastilha — abre a ficha de a queda da bastilha","comparar bastilha, direitosdohomem — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio166" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
