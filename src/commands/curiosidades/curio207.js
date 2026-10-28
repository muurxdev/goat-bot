/**
 * .curio207 — As grandes migrações animais
 *
 * As grandes migrações animais: 6 fichas consultáveis (Gnu-azul, Andorinha-do-ártico, Baleia-jubarte, Salmão-vermelho, Caranguejo-vermelho da Ilha Christmas, Caribu).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "migracoes"

module.exports = {
    name: "curio207",
    aliases: ["cmd_curio207","alt_curio207","atalho_curio207","abrev_curio207","call_curio207","func_curio207"],
    category: "curiosidades",
    subcategory: "Bicho e Planta",
    description: "As grandes migrações animais",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["gnu — abre a ficha de gnu-azul","comparar gnu, andorinha — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio207" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
