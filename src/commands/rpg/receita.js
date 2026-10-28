/**
 * Comando .receita — Culinária da taverna: ficha de cada nível (1 a 11).
 *
 * Junta os antigos .receita1 … .receita11, que eram 11 arquivos com o mesmo
 * cartão e só o número trocado (unificado em 2026-09-18). Os nomes antigos
 * continuam funcionando como atalhos: ".receita5" abre o nível 5.
 */

const F = require('../../utils/formato')

const CARTAO = { emoji: "🍖", titulo: "CULINÁRIA DA TAVERNA", frase: "Prato com visual impecável, mas sabor duvidoso preparado pelo Capitão." }
const NIVEIS = [
    { cp: "+150 pts", raridade: "Comum ⚪" },
    { cp: "+300 pts", raridade: "Rara 💠" },
    { cp: "+450 pts", raridade: "Comum ⚪" },
    { cp: "+600 pts", raridade: "Rara 💠" },
    { cp: "+750 pts", raridade: "Lendária 🌟" },
    { cp: "+900 pts", raridade: "Rara 💠" },
    { cp: "+1050 pts", raridade: "Comum ⚪" },
    { cp: "+1200 pts", raridade: "Rara 💠" },
    { cp: "+1350 pts", raridade: "Comum ⚪" },
    { cp: "+1500 pts", raridade: "Lendária 🌟" },
    { cp: "+1650 pts", raridade: "Comum ⚪" }
]

/** Nível pedido: pelo argumento (".receita 5") ou pelo atalho digitado (".receita5"). */
function nivelPedido(args, digitado) {
    const doArg = parseInt(args[0], 10)
    if (Number.isInteger(doArg)) return doArg
    const doAtalho = String(digitado || '').match(/(\d+)$/)
    return doAtalho ? parseInt(doAtalho[1], 10) : null
}

module.exports = {
    name: "receita",
    aliases: ["rec-1","rec-2","rec-3","rec-4","rec-5","rec-6","rec-7","rec-8","rec-9","rec-10","rec-11","rec1","rec2","rec3","rec4","rec5","rec6","rec7","rec8","rec9","rec10","rec11","receita1","receita2","receita3","receita4","receita5","receita6","receita7","receita8","receita9","receita10","receita11"],
    category: "rpg",
    subcategory: "Cozinha do Reino",
    description: "Culinária da taverna: lore e ficha de cada nível, do 1 ao 11",
    usage: '[nível]',
    examples: ["— lore e tabela dos 11 níveis", "5 — ficha do nível 5"],
    cooldownMs: 1500,
    execute: async ({ reply, args = [], commandName = '', prefix = '.' }) => {
        const n = nivelPedido(args, commandName)
        if (n === null) {
            return reply(F.tela({
                emoji: CARTAO.emoji, titulo: CARTAO.titulo, intro: CARTAO.frase, prefix,
                secoes: [{ emoji: '📊', titulo: 'Níveis', linhas: NIVEIS.map((x, i) => `• *Nível ${i + 1}:* ${x.cp} · ${x.raridade}`) }],
                proximos: [{ nome: "receita", args: '5', oque: 'ver a ficha de um nível' }]
            }))
        }
        if (n < 1 || n > NIVEIS.length) {
            return reply(F.tela({
                emoji: '⚠️', titulo: 'Nível que não existe', prefix,
                intro: `${CARTAO.titulo} vai do nível 1 ao ${NIVEIS.length}.`,
                proximos: [{ nome: "receita", oque: 'ver todos os níveis' }]
            }))
        }
        const x = NIVEIS[n - 1]
        return reply(F.tela({
            emoji: CARTAO.emoji, titulo: CARTAO.titulo, intro: CARTAO.frase, prefix,
            secoes: [{ emoji: '📊', titulo: `Nível ${n}`, linhas: [
                F.campo('Grau de maestria', `Nível ${n}`),
                F.campo('Poder de combate (CP)', x.cp),
                F.campo('Raridade', x.raridade)
            ] }],
            proximos: [
                n < NIVEIS.length ? { nome: "receita", args: String(n + 1), oque: 'próximo nível' } : null,
                { nome: "receita", oque: 'todos os níveis' }
            ].filter(Boolean)
        }))
    }
}
