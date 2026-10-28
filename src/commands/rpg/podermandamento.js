/**
 * Comando .podermandamento — Poder do mandamento: ficha de cada nível (1 a 12).
 *
 * Junta os antigos .mandamento1 … .mandamento12, que eram 12 arquivos com o mesmo
 * cartão e só o número trocado (unificado em 2026-09-18). Os nomes antigos
 * continuam funcionando como atalhos: ".mandamento5" abre o nível 5.
 */

const F = require('../../utils/formato')

const CARTAO = { emoji: "📜", titulo: "PODER DO MANDAMENTO", frase: "Concede autoridade sobre uma das 10 leis demoníacas forjadas pelo Rei Demônio." }
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
    { cp: "+1650 pts", raridade: "Comum ⚪" },
    { cp: "+1800 pts", raridade: "Rara 💠" }
]

/** Nível pedido: pelo argumento (".podermandamento 5") ou pelo atalho digitado (".mandamento5"). */
function nivelPedido(args, digitado) {
    const doArg = parseInt(args[0], 10)
    if (Number.isInteger(doArg)) return doArg
    const doAtalho = String(digitado || '').match(/(\d+)$/)
    return doAtalho ? parseInt(doAtalho[1], 10) : null
}

module.exports = {
    name: "podermandamento",
    aliases: ["mand-1","mand-2","mand-3","mand-4","mand-5","mand-6","mand-7","mand-8","mand-9","mand-10","mand-11","mand-12","mand1","mand2","mand3","mand4","mand5","mand6","mand7","mand8","mand9","mand10","mand11","mand12","mandamento1","mandamento2","mandamento3","mandamento4","mandamento5","mandamento6","mandamento7","mandamento8","mandamento9","mandamento10","mandamento11","mandamento12"],
    category: "rpg",
    subcategory: "Mandamentos",
    description: "Poder do mandamento: lore e ficha de cada nível, do 1 ao 12",
    usage: '[nível]',
    examples: ["— lore e tabela dos 12 níveis", "5 — ficha do nível 5"],
    cooldownMs: 1500,
    execute: async ({ reply, args = [], commandName = '', prefix = '.' }) => {
        const n = nivelPedido(args, commandName)
        if (n === null) {
            return reply(F.tela({
                emoji: CARTAO.emoji, titulo: CARTAO.titulo, intro: CARTAO.frase, prefix,
                secoes: [{ emoji: '📊', titulo: 'Níveis', linhas: NIVEIS.map((x, i) => `• *Nível ${i + 1}:* ${x.cp} · ${x.raridade}`) }],
                proximos: [{ nome: "podermandamento", args: '5', oque: 'ver a ficha de um nível' }]
            }))
        }
        if (n < 1 || n > NIVEIS.length) {
            return reply(F.tela({
                emoji: '⚠️', titulo: 'Nível que não existe', prefix,
                intro: `${CARTAO.titulo} vai do nível 1 ao ${NIVEIS.length}.`,
                proximos: [{ nome: "podermandamento", oque: 'ver todos os níveis' }]
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
                n < NIVEIS.length ? { nome: "podermandamento", args: String(n + 1), oque: 'próximo nível' } : null,
                { nome: "podermandamento", oque: 'todos os níveis' }
            ].filter(Boolean)
        }))
    }
}
