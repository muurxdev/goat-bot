/**
 * Comando .logaritmo — calcula o logaritmo de um número em qualquer base.
 */
const F = require('../../utils/formato')

module.exports = {
    name: "logaritmo",
    aliases: ["logaritmo-cmd","cmd-logaritmo"],
    category: "general",
    subcategory: "Matemática",
    description: "Calcula o logaritmo de um número (base 10 se não disser outra)",
    usage: "<número> [base]",
    examples: ["100 — logaritmo de 100 na base 10", "8 2 — logaritmo de 8 na base 2", "20 e — logaritmo natural de 20"],
    cooldownMs: 1500,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const lerNumero = (v) => String(v).toLowerCase() === 'e' ? Math.E : parseFloat(String(v).replace(',', '.'))
        const x = args[0] === undefined ? NaN : lerNumero(args[0])
        const base = args[1] === undefined ? 10 : lerNumero(args[1])
        if (args[0] === undefined) {
            return reply(F.tela({
                emoji: '🔢',
                titulo: 'Logaritmo',
                intro: 'Eu descubro a que potência a base precisa ser elevada para chegar ao número.',
                secoes: [{ emoji: '✍️', titulo: 'Digite assim', linhas: [
                    `• ${F.cmd(prefix, 'logaritmo', '100')} — base 10 (resultado 2)`,
                    `• ${F.cmd(prefix, 'logaritmo', '8 2')} — base 2 (resultado 3)`,
                    `• ${F.cmd(prefix, 'logaritmo', '20 e')} — logaritmo natural`
                ] }],
                proximos: [
                    { nome: 'potencia', args: '2 10', oque: 'a conta inversa: elevar à potência' },
                    { nome: 'raiz', args: '144', oque: 'tirar a raiz de um número' }
                ],
                prefix
            }))
        }
        if (isNaN(x) || x <= 0 || isNaN(base) || base <= 0 || base === 1) {
            return reply(`❌ *Não dá para calcular esse logaritmo*\n\nO número e a base precisam ser maiores que zero, e a base não pode ser 1.\n\n📌 *Exemplo:* ${F.cmd(prefix, 'logaritmo', '100 10')}`)
        }
        const res = Math.log(x) / Math.log(base)
        const nomeBase = base === Math.E ? 'e' : String(base)
        const fmt = (v) => Number(v.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 })
        return reply(F.tela({
            emoji: '🔢',
            titulo: `log de ${x} na base ${nomeBase} = ${fmt(res)}`,
            intro: `Elevando ${nomeBase} a *${fmt(res)}*, chego a ${x}.`,
            secoes: [{ emoji: '📋', titulo: 'Conta', linhas: [
                F.campo('Número', x),
                F.campo('Base', nomeBase),
                F.campo('Resultado', `*${fmt(res)}*`)
            ] }],
            dica: 'Sem a base eu uso 10; digite e para o logaritmo natural.',
            proximos: [{ nome: 'potencia', args: `${nomeBase === 'e' ? '2.7183' : nomeBase} ${fmt(res).replace(',', '.')}`, oque: 'conferir fazendo a conta inversa' }],
            prefix
        }))
    }
};
