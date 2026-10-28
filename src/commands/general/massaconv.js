/**
 * Comando .massaconv — Converte peso e massa: quilo, grama, libra, onça e tonelada.
 */
const F = require('../../utils/formato')

const U = {kg:1000,g:1,mg:0.001,ton:1e6,lb:453.592,oz:28.3495}
const NOMES = {"kg":"quilos","g":"gramas","mg":"miligramas","ton":"toneladas","lb":"libras","oz":"onças"}

const fmt = (r) => Number.isInteger(r) ? r.toLocaleString('pt-BR') : Number(r.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 })
const listaUnidades = () => Object.keys(U).map(u => `• \`${u}\` — ${NOMES[u]}`)

module.exports = {
    name: "massaconv",
    aliases: ["pesoconv","massunit"],
    category: "general",
    subcategory: "Utilidades",
    description: "Converte peso e massa: quilo, grama, libra, onça e tonelada",
    usage: "<valor> <de> [para]",
    examples: ["70 kg lb — quilos em libras","12 oz g — onças em gramas","2 ton — toneladas em todas as unidades"],
    cooldownMs: 1500,
    execute: async ({ args = [], reply, prefix = '.' }) => {
        const exemplos = ["70 kg lb — quilos em libras","12 oz g — onças em gramas","2 ton — toneladas em todas as unidades"].map(e => { const [a, o] = e.split(' — '); return `• ${F.cmd(prefix, "massaconv", a)} — ${o}` })
        const v = parseFloat(String(args[0] || '').replace(',', '.'))
        if (isNaN(v)) {
            return reply(F.tela({
                emoji: "⚖️",
                titulo: "Conversor: massa",
                intro: 'Eu converto massa entre as unidades abaixo. Digite o valor, a unidade de origem e, se quiser, a de destino.',
                secoes: [
                    { emoji: '✍️', titulo: 'Digite assim', linhas: exemplos },
                    { emoji: '📐', titulo: 'Unidades', linhas: listaUnidades() }
                ],
                dica: "Uma libra tem cerca de 454 gramas.",
                prefix
            }))
        }
        const de = String(args[1] || '').toLowerCase()
        if (!(de in U)) {
            return reply(F.tela({
                emoji: '❌',
                titulo: de ? `Não conheço a unidade "${de}"` : 'Faltou a unidade',
                intro: `Diga em que unidade está o ${fmt(v)}. Use uma destas:`,
                secoes: [{ emoji: '📐', titulo: 'Unidades', linhas: listaUnidades() }],
                dica: `Exemplo pronto: ${exemplos[0].slice(2)}`,
                prefix
            }))
        }
        const base = v * U[de]
        const ate = String(args[2] || '').toLowerCase()
        if (ate && !(ate in U)) {
            return reply(`❌ *Não conheço a unidade "${ate}"*\n\nUnidades aceitas: ${Object.keys(U).join(', ')}.\n\n📌 *Exemplo:* ${F.cmd(prefix, "massaconv", "70 kg lb")}`)
        }
        if (ate) {
            const r = base / U[ate]
            return reply(F.tela({
                emoji: "⚖️",
                titulo: `${fmt(v)} ${de} = ${fmt(r)} ${ate}`,
                intro: `*${fmt(v)} ${NOMES[de]}* equivalem a *${fmt(r)} ${NOMES[ate]}*.`,
                dica: `Para ver em todas as unidades, digite só ${F.cmd(prefix, "massaconv", fmt(v).replace(/\./g, '') + ' ' + de)}`,
                prefix
            }))
        }
        const linhas = Object.keys(U).filter(k => k !== de).map(k => F.campo(NOMES[k], fmt(base / U[k])))
        return reply(F.tela({
            emoji: "⚖️",
            titulo: `${fmt(v)} ${de} em outras unidades`,
            intro: `Convertendo *${fmt(v)} ${NOMES[de]}*:`,
            secoes: [{ emoji: '📐', titulo: 'Equivale a', linhas }],
            dica: "Uma libra tem cerca de 454 gramas.",
            prefix
        }))
    }
};
