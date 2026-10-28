/**
 * Comando .barreira — Muralha intransponível: ficha de cada nível (1 a 11).
 *
 * Junta os antigos .barreira1 … .barreira11, que eram 11 arquivos com o mesmo
 * cartão e só o número trocado (unificado em 2026-09-18). Os nomes antigos
 * continuam funcionando como atalhos: ".barreira5" abre o nível 5.
 */

const F = require('../../utils/formato')

const CARTAO = { emoji: "🏰", titulo: "MURALHA INTRANSPONÍVEL", frase: "Escudo esférico impenetrável erguido pela determinação do cavaleiro." }
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

/** Nível pedido: pelo argumento (".barreira 5") ou pelo atalho digitado (".barreira5"). */
function nivelPedido(args, digitado) {
    const doArg = parseInt(args[0], 10)
    if (Number.isInteger(doArg)) return doArg
    const doAtalho = String(digitado || '').match(/(\d+)$/)
    return doAtalho ? parseInt(doAtalho[1], 10) : null
}

module.exports = {
    name: "barreira",
    aliases: ["barr-1","barr-2","barr-3","barr-4","barr-5","barr-6","barr-7","barr-8","barr-9","barr-10","barr-11","barr1","barr2","barr3","barr4","barr5","barr6","barr7","barr8","barr9","barr10","barr11","barreira1","barreira2","barreira3","barreira4","barreira5","barreira6","barreira7","barreira8","barreira9","barreira10","barreira11"],
    category: "rpg",
    subcategory: "Cavaleiros Sagrados",
    description: "Muralha intransponível: lore e ficha de cada nível, do 1 ao 11",
    usage: '[nível]',
    examples: ["— lore e tabela dos 11 níveis", "5 — ficha do nível 5"],
    cooldownMs: 1500,
    execute: async ({ reply, args = [], commandName = '', prefix = '.' }) => {
        const n = nivelPedido(args, commandName)
        if (n === null) {
            return reply(F.tela({
                emoji: CARTAO.emoji, titulo: CARTAO.titulo, intro: CARTAO.frase, prefix,
                secoes: [{ emoji: '📊', titulo: 'Níveis', linhas: NIVEIS.map((x, i) => `• *Nível ${i + 1}:* ${x.cp} · ${x.raridade}`) }],
                proximos: [{ nome: "barreira", args: '5', oque: 'ver a ficha de um nível' }]
            }))
        }
        if (n < 1 || n > NIVEIS.length) {
            return reply(F.tela({
                emoji: '⚠️', titulo: 'Nível que não existe', prefix,
                intro: `${CARTAO.titulo} vai do nível 1 ao ${NIVEIS.length}.`,
                proximos: [{ nome: "barreira", oque: 'ver todos os níveis' }]
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
                n < NIVEIS.length ? { nome: "barreira", args: String(n + 1), oque: 'próximo nível' } : null,
                { nome: "barreira", oque: 'todos os níveis' }
            ].filter(Boolean)
        }))
    }
}
