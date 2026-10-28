/**
 * .curio43 — As placas tectônicas
 *
 * As placas tectônicas: 6 fichas consultáveis (Placa do Pacífico, Placa de Nazca, Placa Indo-Australiana, Placa Africana, Placa Sul-Americana, Cinturão de Fogo do Pacífico).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "placas"

module.exports = {
    name: "curio43",
    aliases: ["cmd_curio43","alt_curio43","atalho_curio43","abrev_curio43","call_curio43","func_curio43"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "As placas tectônicas",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["pacifica — abre a ficha de placa do pacífico","comparar pacifica, nazca — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio43" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
