/**
 * Comando .basquias — Lança espiritual basquias: ficha de cada nível (1 a 11).
 *
 * Junta os antigos .basquias1 … .basquias11, que eram 11 arquivos com o mesmo
 * cartão e só o número trocado (unificado em 2026-09-18). Os nomes antigos
 * continuam funcionando como atalhos: ".basquias5" abre o nível 5.
 */

const F = require('../../utils/formato')

const CARTAO = { emoji: "🌸", titulo: "LANÇA ESPIRITUAL BASQUIAS", frase: "Arma ancestral do primeiro Rei das Fadas, Gloxinia, dotada de cura e destruição." }
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

/** Nível pedido: pelo argumento (".basquias 5") ou pelo atalho digitado (".basquias5"). */
function nivelPedido(args, digitado) {
    const doArg = parseInt(args[0], 10)
    if (Number.isInteger(doArg)) return doArg
    const doAtalho = String(digitado || '').match(/(\d+)$/)
    return doAtalho ? parseInt(doAtalho[1], 10) : null
}

module.exports = {
    name: "basquias",
    aliases: ["basq-1","basq-2","basq-3","basq-4","basq-5","basq-6","basq-7","basq-8","basq-9","basq-10","basq-11","basq1","basq2","basq3","basq4","basq5","basq6","basq7","basq8","basq9","basq10","basq11","basquias1","basquias2","basquias3","basquias4","basquias5","basquias6","basquias7","basquias8","basquias9","basquias10","basquias11"],
    category: "rpg",
    subcategory: "Tesouros Sagrados",
    description: "Lança espiritual basquias: lore e ficha de cada nível, do 1 ao 11",
    usage: '[nível]',
    examples: ["— lore e tabela dos 11 níveis", "5 — ficha do nível 5"],
    cooldownMs: 1500,
    execute: async ({ reply, args = [], commandName = '', prefix = '.' }) => {
        const n = nivelPedido(args, commandName)
        if (n === null) {
            return reply(F.tela({
                emoji: CARTAO.emoji, titulo: CARTAO.titulo, intro: CARTAO.frase, prefix,
                secoes: [{ emoji: '📊', titulo: 'Níveis', linhas: NIVEIS.map((x, i) => `• *Nível ${i + 1}:* ${x.cp} · ${x.raridade}`) }],
                proximos: [{ nome: "basquias", args: '5', oque: 'ver a ficha de um nível' }]
            }))
        }
        if (n < 1 || n > NIVEIS.length) {
            return reply(F.tela({
                emoji: '⚠️', titulo: 'Nível que não existe', prefix,
                intro: `${CARTAO.titulo} vai do nível 1 ao ${NIVEIS.length}.`,
                proximos: [{ nome: "basquias", oque: 'ver todos os níveis' }]
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
                n < NIVEIS.length ? { nome: "basquias", args: String(n + 1), oque: 'próximo nível' } : null,
                { nome: "basquias", oque: 'todos os níveis' }
            ].filter(Boolean)
        }))
    }
}
