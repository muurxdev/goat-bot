/**
 * Comando .chamaescura — Chamas do purgatório: ficha de cada nível (1 a 11).
 *
 * Junta os antigos .chamaescura1 … .chamaescura11, que eram 11 arquivos com o mesmo
 * cartão e só o número trocado (unificado em 2026-09-18). Os nomes antigos
 * continuam funcionando como atalhos: ".chamaescura5" abre o nível 5.
 */

const F = require('../../utils/formato')

const CARTAO = { emoji: "🔥", titulo: "CHAMAS DO PURGATÓRIO", frase: "Chamas negras inextinguíveis que queimam a alma e anulam a regeneração." }
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

/** Nível pedido: pelo argumento (".chamaescura 5") ou pelo atalho digitado (".chamaescura5"). */
function nivelPedido(args, digitado) {
    const doArg = parseInt(args[0], 10)
    if (Number.isInteger(doArg)) return doArg
    const doAtalho = String(digitado || '').match(/(\d+)$/)
    return doAtalho ? parseInt(doAtalho[1], 10) : null
}

module.exports = {
    name: "chamaescura",
    aliases: ["chama-1","chama-2","chama-3","chama-4","chama-5","chama-6","chama-7","chama-8","chama-9","chama-10","chama-11","chama1","chama2","chama3","chama4","chama5","chama6","chama7","chama8","chama9","chama10","chama11","chamaescura1","chamaescura2","chamaescura3","chamaescura4","chamaescura5","chamaescura6","chamaescura7","chamaescura8","chamaescura9","chamaescura10","chamaescura11"],
    category: "rpg",
    subcategory: "Magia Demoníaca",
    description: "Chamas do purgatório: lore e ficha de cada nível, do 1 ao 11",
    usage: '[nível]',
    examples: ["— lore e tabela dos 11 níveis", "5 — ficha do nível 5"],
    cooldownMs: 1500,
    execute: async ({ reply, args = [], commandName = '', prefix = '.' }) => {
        const n = nivelPedido(args, commandName)
        if (n === null) {
            return reply(F.tela({
                emoji: CARTAO.emoji, titulo: CARTAO.titulo, intro: CARTAO.frase, prefix,
                secoes: [{ emoji: '📊', titulo: 'Níveis', linhas: NIVEIS.map((x, i) => `• *Nível ${i + 1}:* ${x.cp} · ${x.raridade}`) }],
                proximos: [{ nome: "chamaescura", args: '5', oque: 'ver a ficha de um nível' }]
            }))
        }
        if (n < 1 || n > NIVEIS.length) {
            return reply(F.tela({
                emoji: '⚠️', titulo: 'Nível que não existe', prefix,
                intro: `${CARTAO.titulo} vai do nível 1 ao ${NIVEIS.length}.`,
                proximos: [{ nome: "chamaescura", oque: 'ver todos os níveis' }]
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
                n < NIVEIS.length ? { nome: "chamaescura", args: String(n + 1), oque: 'próximo nível' } : null,
                { nome: "chamaescura", oque: 'todos os níveis' }
            ].filter(Boolean)
        }))
    }
}
