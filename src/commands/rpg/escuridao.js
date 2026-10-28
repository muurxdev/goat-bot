/**
 * Comando .escuridao — Matéria escura pura: ficha de cada nível (1 a 11).
 *
 * Junta os antigos .escuridao1 … .escuridao11, que eram 11 arquivos com o mesmo
 * cartão e só o número trocado (unificado em 2026-09-18). Os nomes antigos
 * continuam funcionando como atalhos: ".escuridao5" abre o nível 5.
 */

const F = require('../../utils/formato')

const CARTAO = { emoji: "🌑", titulo: "MATÉRIA ESCURA PURA", frase: "Moldagem da escuridão em asas, punhos de impacto ou armaduras protetoras." }
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

/** Nível pedido: pelo argumento (".escuridao 5") ou pelo atalho digitado (".escuridao5"). */
function nivelPedido(args, digitado) {
    const doArg = parseInt(args[0], 10)
    if (Number.isInteger(doArg)) return doArg
    const doAtalho = String(digitado || '').match(/(\d+)$/)
    return doAtalho ? parseInt(doAtalho[1], 10) : null
}

module.exports = {
    name: "escuridao",
    aliases: ["escur-1","escur-2","escur-3","escur-4","escur-5","escur-6","escur-7","escur-8","escur-9","escur-10","escur-11","escur1","escur2","escur3","escur4","escur5","escur6","escur7","escur8","escur9","escur10","escur11","escuridao1","escuridao2","escuridao3","escuridao4","escuridao5","escuridao6","escuridao7","escuridao8","escuridao9","escuridao10","escuridao11"],
    category: "rpg",
    subcategory: "Magia Demoníaca",
    description: "Matéria escura pura: lore e ficha de cada nível, do 1 ao 11",
    usage: '[nível]',
    examples: ["— lore e tabela dos 11 níveis", "5 — ficha do nível 5"],
    cooldownMs: 1500,
    execute: async ({ reply, args = [], commandName = '', prefix = '.' }) => {
        const n = nivelPedido(args, commandName)
        if (n === null) {
            return reply(F.tela({
                emoji: CARTAO.emoji, titulo: CARTAO.titulo, intro: CARTAO.frase, prefix,
                secoes: [{ emoji: '📊', titulo: 'Níveis', linhas: NIVEIS.map((x, i) => `• *Nível ${i + 1}:* ${x.cp} · ${x.raridade}`) }],
                proximos: [{ nome: "escuridao", args: '5', oque: 'ver a ficha de um nível' }]
            }))
        }
        if (n < 1 || n > NIVEIS.length) {
            return reply(F.tela({
                emoji: '⚠️', titulo: 'Nível que não existe', prefix,
                intro: `${CARTAO.titulo} vai do nível 1 ao ${NIVEIS.length}.`,
                proximos: [{ nome: "escuridao", oque: 'ver todos os níveis' }]
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
                n < NIVEIS.length ? { nome: "escuridao", args: String(n + 1), oque: 'próximo nível' } : null,
                { nome: "escuridao", oque: 'todos os níveis' }
            ].filter(Boolean)
        }))
    }
}
