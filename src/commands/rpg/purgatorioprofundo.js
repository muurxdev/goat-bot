/**
 * Comando .purgatorioprofundo — Profundezas do purgatório: ficha de cada nível (1 a 11).
 *
 * Junta os antigos .purgatorio1 … .purgatorio11, que eram 11 arquivos com o mesmo
 * cartão e só o número trocado (unificado em 2026-09-18). Os nomes antigos
 * continuam funcionando como atalhos: ".purgatorio5" abre o nível 5.
 */

const F = require('../../utils/formato')

const CARTAO = { emoji: "🌋", titulo: "PROFUNDEZAS DO PURGATÓRIO", frase: "Ambiente onde um minuto equivale a um ano e a atmosfera corrói corpos frágeis." }
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

/** Nível pedido: pelo argumento (".purgatorioprofundo 5") ou pelo atalho digitado (".purgatorio5"). */
function nivelPedido(args, digitado) {
    const doArg = parseInt(args[0], 10)
    if (Number.isInteger(doArg)) return doArg
    const doAtalho = String(digitado || '').match(/(\d+)$/)
    return doAtalho ? parseInt(doAtalho[1], 10) : null
}

module.exports = {
    name: "purgatorioprofundo",
    aliases: ["purg-1","purg-2","purg-3","purg-4","purg-5","purg-6","purg-7","purg-8","purg-9","purg-10","purg-11","purg1","purg2","purg3","purg4","purg5","purg6","purg7","purg8","purg9","purg10","purg11","purgatorio1","purgatorio2","purgatorio3","purgatorio4","purgatorio5","purgatorio6","purgatorio7","purgatorio8","purgatorio9","purgatorio10","purgatorio11"],
    category: "rpg",
    subcategory: "Purgatório",
    description: "Profundezas do purgatório: lore e ficha de cada nível, do 1 ao 11",
    usage: '[nível]',
    examples: ["— lore e tabela dos 11 níveis", "5 — ficha do nível 5"],
    cooldownMs: 1500,
    execute: async ({ reply, args = [], commandName = '', prefix = '.' }) => {
        const n = nivelPedido(args, commandName)
        if (n === null) {
            return reply(F.tela({
                emoji: CARTAO.emoji, titulo: CARTAO.titulo, intro: CARTAO.frase, prefix,
                secoes: [{ emoji: '📊', titulo: 'Níveis', linhas: NIVEIS.map((x, i) => `• *Nível ${i + 1}:* ${x.cp} · ${x.raridade}`) }],
                proximos: [{ nome: "purgatorioprofundo", args: '5', oque: 'ver a ficha de um nível' }]
            }))
        }
        if (n < 1 || n > NIVEIS.length) {
            return reply(F.tela({
                emoji: '⚠️', titulo: 'Nível que não existe', prefix,
                intro: `${CARTAO.titulo} vai do nível 1 ao ${NIVEIS.length}.`,
                proximos: [{ nome: "purgatorioprofundo", oque: 'ver todos os níveis' }]
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
                n < NIVEIS.length ? { nome: "purgatorioprofundo", args: String(n + 1), oque: 'próximo nível' } : null,
                { nome: "purgatorioprofundo", oque: 'todos os níveis' }
            ].filter(Boolean)
        }))
    }
}
