/**
 * Comando .heavymetalsupremo — Heavy metal supremo: ficha de cada nível (1 a 11).
 *
 * Junta os antigos .heavymetal1 … .heavymetal11, que eram 11 arquivos com o mesmo
 * cartão e só o número trocado (unificado em 2026-09-18). Os nomes antigos
 * continuam funcionando como atalhos: ".heavymetal5" abre o nível 5.
 */

const F = require('../../utils/formato')

const CARTAO = { emoji: "🛡️", titulo: "HEAVY METAL SUPREMO", frase: "Transforma o corpo em ferro puro, tornando o usuário imune a cortes físicos." }
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

/** Nível pedido: pelo argumento (".heavymetalsupremo 5") ou pelo atalho digitado (".heavymetal5"). */
function nivelPedido(args, digitado) {
    const doArg = parseInt(args[0], 10)
    if (Number.isInteger(doArg)) return doArg
    const doAtalho = String(digitado || '').match(/(\d+)$/)
    return doAtalho ? parseInt(doAtalho[1], 10) : null
}

module.exports = {
    name: "heavymetalsupremo",
    aliases: ["heavymetal1","heavymetal2","heavymetal3","heavymetal4","heavymetal5","heavymetal6","heavymetal7","heavymetal8","heavymetal9","heavymetal10","heavymetal11","hmetal-1","hmetal-2","hmetal-3","hmetal-4","hmetal-5","hmetal-6","hmetal-7","hmetal-8","hmetal-9","hmetal-10","hmetal-11","hmetal1","hmetal2","hmetal3","hmetal4","hmetal5","hmetal6","hmetal7","hmetal8","hmetal9","hmetal10","hmetal11"],
    category: "rpg",
    subcategory: "Habilidade Física",
    description: "Heavy metal supremo: lore e ficha de cada nível, do 1 ao 11",
    usage: '[nível]',
    examples: ["— lore e tabela dos 11 níveis", "5 — ficha do nível 5"],
    cooldownMs: 1500,
    execute: async ({ reply, args = [], commandName = '', prefix = '.' }) => {
        const n = nivelPedido(args, commandName)
        if (n === null) {
            return reply(F.tela({
                emoji: CARTAO.emoji, titulo: CARTAO.titulo, intro: CARTAO.frase, prefix,
                secoes: [{ emoji: '📊', titulo: 'Níveis', linhas: NIVEIS.map((x, i) => `• *Nível ${i + 1}:* ${x.cp} · ${x.raridade}`) }],
                proximos: [{ nome: "heavymetalsupremo", args: '5', oque: 'ver a ficha de um nível' }]
            }))
        }
        if (n < 1 || n > NIVEIS.length) {
            return reply(F.tela({
                emoji: '⚠️', titulo: 'Nível que não existe', prefix,
                intro: `${CARTAO.titulo} vai do nível 1 ao ${NIVEIS.length}.`,
                proximos: [{ nome: "heavymetalsupremo", oque: 'ver todos os níveis' }]
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
                n < NIVEIS.length ? { nome: "heavymetalsupremo", args: String(n + 1), oque: 'próximo nível' } : null,
                { nome: "heavymetalsupremo", oque: 'todos os níveis' }
            ].filter(Boolean)
        }))
    }
}
