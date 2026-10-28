/**
 * Comando .dancaterra — Dança da terra (drole dance): ficha de cada nível (1 a 11).
 *
 * Junta os antigos .dancaterra1 … .dancaterra11, que eram 11 arquivos com o mesmo
 * cartão e só o número trocado (unificado em 2026-09-18). Os nomes antigos
 * continuam funcionando como atalhos: ".dancaterra5" abre o nível 5.
 */

const F = require('../../utils/formato')

const CARTAO = { emoji: "🗿", titulo: "DANÇA DA TERRA (Drole Dance)", frase: "Aumenta a afinidade com a mãe terra e eleva exponencialmente o nível de força (CP)." }
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

/** Nível pedido: pelo argumento (".dancaterra 5") ou pelo atalho digitado (".dancaterra5"). */
function nivelPedido(args, digitado) {
    const doArg = parseInt(args[0], 10)
    if (Number.isInteger(doArg)) return doArg
    const doAtalho = String(digitado || '').match(/(\d+)$/)
    return doAtalho ? parseInt(doAtalho[1], 10) : null
}

module.exports = {
    name: "dancaterra",
    aliases: ["danca-1","danca-2","danca-3","danca-4","danca-5","danca-6","danca-7","danca-8","danca-9","danca-10","danca-11","danca1","danca2","danca3","danca4","danca5","danca6","danca7","danca8","danca9","danca10","danca11","dancaterra1","dancaterra2","dancaterra3","dancaterra4","dancaterra5","dancaterra6","dancaterra7","dancaterra8","dancaterra9","dancaterra10","dancaterra11"],
    category: "rpg",
    subcategory: "Dança dos Gigantes",
    description: "Dança da terra (drole dance): lore e ficha de cada nível, do 1 ao 11",
    usage: '[nível]',
    examples: ["— lore e tabela dos 11 níveis", "5 — ficha do nível 5"],
    cooldownMs: 1500,
    execute: async ({ reply, args = [], commandName = '', prefix = '.' }) => {
        const n = nivelPedido(args, commandName)
        if (n === null) {
            return reply(F.tela({
                emoji: CARTAO.emoji, titulo: CARTAO.titulo, intro: CARTAO.frase, prefix,
                secoes: [{ emoji: '📊', titulo: 'Níveis', linhas: NIVEIS.map((x, i) => `• *Nível ${i + 1}:* ${x.cp} · ${x.raridade}`) }],
                proximos: [{ nome: "dancaterra", args: '5', oque: 'ver a ficha de um nível' }]
            }))
        }
        if (n < 1 || n > NIVEIS.length) {
            return reply(F.tela({
                emoji: '⚠️', titulo: 'Nível que não existe', prefix,
                intro: `${CARTAO.titulo} vai do nível 1 ao ${NIVEIS.length}.`,
                proximos: [{ nome: "dancaterra", oque: 'ver todos os níveis' }]
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
                n < NIVEIS.length ? { nome: "dancaterra", args: String(n + 1), oque: 'próximo nível' } : null,
                { nome: "dancaterra", oque: 'todos os níveis' }
            ].filter(Boolean)
        }))
    }
}
