/**
 * Comando .sagrado — Martelo de guerra sagrado: ficha de cada nível (1 a 11).
 *
 * Junta os antigos .gideon1 … .gideon11, que eram 11 arquivos com o mesmo
 * cartão e só o número trocado (unificado em 2026-09-18). Os nomes antigos
 * continuam funcionando como atalhos: ".gideon5" abre o nível 5.
 */

const F = require('../../utils/formato')

const CARTAO = { emoji: "🔨", titulo: "MARTELO DE GUERRA SAGRADO", frase: "Pesa uma tonelada e atrai o poder sísmico da terra com cada golpe." }
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

/** Nível pedido: pelo argumento (".sagrado 5") ou pelo atalho digitado (".gideon5"). */
function nivelPedido(args, digitado) {
    const doArg = parseInt(args[0], 10)
    if (Number.isInteger(doArg)) return doArg
    const doAtalho = String(digitado || '').match(/(\d+)$/)
    return doAtalho ? parseInt(doAtalho[1], 10) : null
}

module.exports = {
    name: "sagrado",
    aliases: ["gid-1","gid-2","gid-3","gid-4","gid-5","gid-6","gid-7","gid-8","gid-9","gid-10","gid-11","gid1","gid2","gid3","gid4","gid5","gid6","gid7","gid8","gid9","gid10","gid11","gideon1","gideon2","gideon3","gideon4","gideon5","gideon6","gideon7","gideon8","gideon9","gideon10","gideon11"],
    category: "rpg",
    subcategory: "Tesouros Sagrados",
    description: "Martelo de guerra sagrado: lore e ficha de cada nível, do 1 ao 11",
    usage: '[nível]',
    examples: ["— lore e tabela dos 11 níveis", "5 — ficha do nível 5"],
    cooldownMs: 1500,
    execute: async ({ reply, args = [], commandName = '', prefix = '.' }) => {
        const n = nivelPedido(args, commandName)
        if (n === null) {
            return reply(F.tela({
                emoji: CARTAO.emoji, titulo: CARTAO.titulo, intro: CARTAO.frase, prefix,
                secoes: [{ emoji: '📊', titulo: 'Níveis', linhas: NIVEIS.map((x, i) => `• *Nível ${i + 1}:* ${x.cp} · ${x.raridade}`) }],
                proximos: [{ nome: "sagrado", args: '5', oque: 'ver a ficha de um nível' }]
            }))
        }
        if (n < 1 || n > NIVEIS.length) {
            return reply(F.tela({
                emoji: '⚠️', titulo: 'Nível que não existe', prefix,
                intro: `${CARTAO.titulo} vai do nível 1 ao ${NIVEIS.length}.`,
                proximos: [{ nome: "sagrado", oque: 'ver todos os níveis' }]
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
                n < NIVEIS.length ? { nome: "sagrado", args: String(n + 1), oque: 'próximo nível' } : null,
                { nome: "sagrado", oque: 'todos os níveis' }
            ].filter(Boolean)
        }))
    }
}
