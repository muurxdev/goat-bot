/**
 * Comando .espiritual — Lança espiritual espiritual: ficha de cada nível (1 a 11).
 *
 * Junta os antigos .chastiefol1 … .chastiefol11, que eram 11 arquivos com o mesmo
 * cartão e só o número trocado (unificado em 2026-09-18). Os nomes antigos
 * continuam funcionando como atalhos: ".chastiefol5" abre o nível 5.
 */

const F = require('../../utils/formato')

const CARTAO = { emoji: "🌿", titulo: "LANÇA ESPIRITUAL ESPIRITUAL", frase: "Forjada da Árvore Sagrada no Reino das Fadas, assume diversas formas místicas." }
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

/** Nível pedido: pelo argumento (".espiritual 5") ou pelo atalho digitado (".chastiefol5"). */
function nivelPedido(args, digitado) {
    const doArg = parseInt(args[0], 10)
    if (Number.isInteger(doArg)) return doArg
    const doAtalho = String(digitado || '').match(/(\d+)$/)
    return doAtalho ? parseInt(doAtalho[1], 10) : null
}

module.exports = {
    name: "espiritual",
    aliases: ["chasti-1","chasti-2","chasti-3","chasti-4","chasti-5","chasti-6","chasti-7","chasti-8","chasti-9","chasti-10","chasti-11","chasti1","chasti2","chasti3","chasti4","chasti5","chasti6","chasti7","chasti8","chasti9","chasti10","chasti11","chastiefol1","chastiefol2","chastiefol3","chastiefol4","chastiefol5","chastiefol6","chastiefol7","chastiefol8","chastiefol9","chastiefol10","chastiefol11"],
    category: "rpg",
    subcategory: "Tesouros Sagrados",
    description: "Lança espiritual espiritual: lore e ficha de cada nível, do 1 ao 11",
    usage: '[nível]',
    examples: ["— lore e tabela dos 11 níveis", "5 — ficha do nível 5"],
    cooldownMs: 1500,
    execute: async ({ reply, args = [], commandName = '', prefix = '.' }) => {
        const n = nivelPedido(args, commandName)
        if (n === null) {
            return reply(F.tela({
                emoji: CARTAO.emoji, titulo: CARTAO.titulo, intro: CARTAO.frase, prefix,
                secoes: [{ emoji: '📊', titulo: 'Níveis', linhas: NIVEIS.map((x, i) => `• *Nível ${i + 1}:* ${x.cp} · ${x.raridade}`) }],
                proximos: [{ nome: "espiritual", args: '5', oque: 'ver a ficha de um nível' }]
            }))
        }
        if (n < 1 || n > NIVEIS.length) {
            return reply(F.tela({
                emoji: '⚠️', titulo: 'Nível que não existe', prefix,
                intro: `${CARTAO.titulo} vai do nível 1 ao ${NIVEIS.length}.`,
                proximos: [{ nome: "espiritual", oque: 'ver todos os níveis' }]
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
                n < NIVEIS.length ? { nome: "espiritual", args: String(n + 1), oque: 'próximo nível' } : null,
                { nome: "espiritual", oque: 'todos os níveis' }
            ].filter(Boolean)
        }))
    }
}
