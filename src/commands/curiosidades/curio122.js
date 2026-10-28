/**
 * .curio122 — A evolução da vida em degraus
 *
 * A evolução da vida em degraus: 6 fichas consultáveis (As primeiras células, O ar virou respirável, Vida com muitas células, A saída para a terra firme, O tempo dos dinossauros, Gente moderna).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "evolucao"

module.exports = {
    name: "curio122",
    aliases: ["cmd_curio122","alt_curio122","atalho_curio122","abrev_curio122","call_curio122","func_curio122"],
    category: "curiosidades",
    subcategory: "Ciência",
    description: "A evolução da vida em degraus",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["primeirascelulas — abre a ficha de as primeiras células","comparar primeirascelulas, oxigenio — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio122" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
