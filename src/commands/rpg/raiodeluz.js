/**
 * Comando .raiodeluz — Feixe de luz celestial: ficha de cada nível (1 a 11).
 *
 * Junta os antigos .raiodeluz1 … .raiodeluz11, que eram 11 arquivos com o mesmo
 * cartão e só o número trocado (unificado em 2026-09-18). Os nomes antigos
 * continuam funcionando como atalhos: ".raiodeluz5" abre o nível 5.
 */

const F = require('../../utils/formato')

const CARTAO = { emoji: "⚡", titulo: "FEIXE DE LUZ CELESTIAL", frase: "Raio perfurante de energia divina contra oponentes corrompidos." }
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

/** Nível pedido: pelo argumento (".raiodeluz 5") ou pelo atalho digitado (".raiodeluz5"). */
function nivelPedido(args, digitado) {
    const doArg = parseInt(args[0], 10)
    if (Number.isInteger(doArg)) return doArg
    const doAtalho = String(digitado || '').match(/(\d+)$/)
    return doAtalho ? parseInt(doAtalho[1], 10) : null
}

module.exports = {
    name: "raiodeluz",
    aliases: ["raiodeluz1","raiodeluz2","raiodeluz3","raiodeluz4","raiodeluz5","raiodeluz6","raiodeluz7","raiodeluz8","raiodeluz9","raiodeluz10","raiodeluz11","raioluz-1","raioluz-2","raioluz-3","raioluz-4","raioluz-5","raioluz-6","raioluz-7","raioluz-8","raioluz-9","raioluz-10","raioluz-11","raioluz1","raioluz2","raioluz3","raioluz4","raioluz5","raioluz6","raioluz7","raioluz8","raioluz9","raioluz10","raioluz11"],
    category: "rpg",
    subcategory: "Magia das Deusas",
    description: "Feixe de luz celestial: lore e ficha de cada nível, do 1 ao 11",
    usage: '[nível]',
    examples: ["— lore e tabela dos 11 níveis", "5 — ficha do nível 5"],
    cooldownMs: 1500,
    execute: async ({ reply, args = [], commandName = '', prefix = '.' }) => {
        const n = nivelPedido(args, commandName)
        if (n === null) {
            return reply(F.tela({
                emoji: CARTAO.emoji, titulo: CARTAO.titulo, intro: CARTAO.frase, prefix,
                secoes: [{ emoji: '📊', titulo: 'Níveis', linhas: NIVEIS.map((x, i) => `• *Nível ${i + 1}:* ${x.cp} · ${x.raridade}`) }],
                proximos: [{ nome: "raiodeluz", args: '5', oque: 'ver a ficha de um nível' }]
            }))
        }
        if (n < 1 || n > NIVEIS.length) {
            return reply(F.tela({
                emoji: '⚠️', titulo: 'Nível que não existe', prefix,
                intro: `${CARTAO.titulo} vai do nível 1 ao ${NIVEIS.length}.`,
                proximos: [{ nome: "raiodeluz", oque: 'ver todos os níveis' }]
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
                n < NIVEIS.length ? { nome: "raiodeluz", args: String(n + 1), oque: 'próximo nível' } : null,
                { nome: "raiodeluz", oque: 'todos os níveis' }
            ].filter(Boolean)
        }))
    }
}
