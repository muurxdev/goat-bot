/**
 * Comando .cozinha — Converte medidas de receita: xícara, colher, ml e litro.
 */
const F = require('../../utils/formato')

const U = {ml:1,l:1000,xicara:240,colhersopa:15,colhercha:5}
const NOMES = {"ml":"mililitros","l":"litros","xicara":"xícaras","colhersopa":"colheres de sopa","colhercha":"colheres de chá"}

const fmt = (r) => Number.isInteger(r) ? r.toLocaleString('pt-BR') : Number(r.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 })
const listaUnidades = () => Object.keys(U).map(u => `• \`${u}\` — ${NOMES[u]}`)

module.exports = {
    name: "cozinha",
    aliases: ["medidacozinha","receitaconv"],
    category: "general",
    subcategory: "Utilidades",
    description: "Converte medidas de receita: xícara, colher, ml e litro",
    usage: "<valor> <de> [para]",
    examples: ["2 xicara ml — xícaras em mililitros","500 ml xicara — mililitros em xícaras","3 colhersopa — colheres em todas as medidas"],
    cooldownMs: 1500,
    execute: async ({ args = [], reply, prefix = '.' }) => {
        const exemplos = ["2 xicara ml — xícaras em mililitros","500 ml xicara — mililitros em xícaras","3 colhersopa — colheres em todas as medidas"].map(e => { const [a, o] = e.split(' — '); return `• ${F.cmd(prefix, "cozinha", a)} — ${o}` })
        const v = parseFloat(String(args[0] || '').replace(',', '.'))
        if (isNaN(v)) {
            return reply(F.tela({
                emoji: "🍳",
                titulo: "Conversor: medidas de cozinha",
                intro: 'Eu converto medida de cozinha entre as unidades abaixo. Digite o valor, a unidade de origem e, se quiser, a de destino.',
                secoes: [
                    { emoji: '✍️', titulo: 'Digite assim', linhas: exemplos },
                    { emoji: '📐', titulo: 'Unidades', linhas: listaUnidades() }
                ],
                dica: "Uso a xícara padrão de 240 ml e a colher de sopa de 15 ml.",
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
            return reply(`❌ *Não conheço a unidade "${ate}"*\n\nUnidades aceitas: ${Object.keys(U).join(', ')}.\n\n📌 *Exemplo:* ${F.cmd(prefix, "cozinha", "2 xicara ml")}`)
        }
        if (ate) {
            const r = base / U[ate]
            return reply(F.tela({
                emoji: "🍳",
                titulo: `${fmt(v)} ${de} = ${fmt(r)} ${ate}`,
                intro: `*${fmt(v)} ${NOMES[de]}* equivalem a *${fmt(r)} ${NOMES[ate]}*.`,
                dica: `Para ver em todas as unidades, digite só ${F.cmd(prefix, "cozinha", fmt(v).replace(/\./g, '') + ' ' + de)}`,
                prefix
            }))
        }
        const linhas = Object.keys(U).filter(k => k !== de).map(k => F.campo(NOMES[k], fmt(base / U[k])))
        return reply(F.tela({
            emoji: "🍳",
            titulo: `${fmt(v)} ${de} em outras unidades`,
            intro: `Convertendo *${fmt(v)} ${NOMES[de]}*:`,
            secoes: [{ emoji: '📐', titulo: 'Equivale a', linhas }],
            dica: "Uso a xícara padrão de 240 ml e a colher de sopa de 15 ml.",
            prefix
        }))
    }
};
