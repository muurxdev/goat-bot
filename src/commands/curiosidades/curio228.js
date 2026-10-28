/**
 * .curio228 — O hip-hop
 *
 * O hip-hop: 6 fichas consultáveis (A festa do Kool Herc, O scratch, Rapper's Delight, The Message, Public Enemy, Sobrevivendo no Inferno).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "hiphop"

module.exports = {
    name: "curio228",
    aliases: ["cmd_curio228","alt_curio228","atalho_curio228","abrev_curio228","call_curio228","func_curio228"],
    category: "curiosidades",
    subcategory: "Cultura",
    description: "O hip-hop",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["festabronx — abre a ficha de a festa do kool herc","comparar festabronx, scratch — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio228" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
