/**
 * .curio14 — As bandeiras mais fora do padrão
 *
 * As bandeiras mais fora do padrão: 6 fichas consultáveis (Nepal, Paraguai, Chipre, Butão, Moçambique, Líbia entre 1977 e 2011).
 *
 * Arquivo gerado por scripts/gen-curiosidades.js. A ficha mora em
 * src/services/curiosityData.js e a consulta em src/services/curiosityService.js;
 * aqui só há a chave do assunto e a apresentação.
 * Mexer à mão é perda de tempo: o próximo `node scripts/gen-curiosidades.js` apaga.
 */

const F = require('../../utils/formato')
const C = require('../../services/curiosityService')

const TEMA = "bandeirasestranhas"

module.exports = {
    name: "curio14",
    aliases: ["cmd_curio14","alt_curio14","atalho_curio14","abrev_curio14","call_curio14","func_curio14"],
    category: "curiosidades",
    subcategory: "Mundo",
    description: "As bandeiras mais fora do padrão",
    usage: "[nome do item | lista | buscar termo | comparar a, b]",
    examples: ["nepal — abre a ficha de nepal","comparar nepal, paraguai — põe as duas lado a lado","lista — mostra tudo que dá para consultar aqui"],
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const tela = C.responder(TEMA, { args, prefix, nome: "curio14" })
        return reply(F.tela({ ...tela, prefix }))
    }
}
