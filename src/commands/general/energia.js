/**
 * Comando .energia — Converte energia: joule, caloria, quilocaloria e kWh.
 */
const F = require('../../utils/formato')

const U = {j:1,kj:1000,cal:4.184,kcal:4184,wh:3600,kwh:3.6e6}
const NOMES = {"j":"joules","kj":"quilojoules","cal":"calorias","kcal":"quilocalorias","wh":"watts-hora","kwh":"quilowatts-hora"}

const fmt = (r) => Number.isInteger(r) ? r.toLocaleString('pt-BR') : Number(r.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 })
const listaUnidades = () => Object.keys(U).map(u => `• \`${u}\` — ${NOMES[u]}`)

module.exports = {
    name: "energia",
    aliases: ["energyconv","energiaconv"],
    category: "general",
    subcategory: "Utilidades",
    description: "Converte energia: joule, caloria, quilocaloria e kWh",
    usage: "<valor> <de> [para]",
    examples: ["500 kcal kj — calorias da comida em quilojoules","1 kwh kcal — energia elétrica em calorias","100 j — joules em todas as unidades"],
    cooldownMs: 1500,
    execute: async ({ args = [], reply, prefix = '.' }) => {
        const exemplos = ["500 kcal kj — calorias da comida em quilojoules","1 kwh kcal — energia elétrica em calorias","100 j — joules em todas as unidades"].map(e => { const [a, o] = e.split(' — '); return `• ${F.cmd(prefix, "energia", a)} — ${o}` })
        const v = parseFloat(String(args[0] || '').replace(',', '.'))
        if (isNaN(v)) {
            return reply(F.tela({
                emoji: "⚡",
                titulo: "Conversor: energia",
                intro: 'Eu converto energia entre as unidades abaixo. Digite o valor, a unidade de origem e, se quiser, a de destino.',
                secoes: [
                    { emoji: '✍️', titulo: 'Digite assim', linhas: exemplos },
                    { emoji: '📐', titulo: 'Unidades', linhas: listaUnidades() }
                ],
                dica: "As \"calorias\" dos rótulos de comida são quilocalorias (kcal).",
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
            return reply(`❌ *Não conheço a unidade "${ate}"*\n\nUnidades aceitas: ${Object.keys(U).join(', ')}.\n\n📌 *Exemplo:* ${F.cmd(prefix, "energia", "500 kcal kj")}`)
        }
        if (ate) {
            const r = base / U[ate]
            return reply(F.tela({
                emoji: "⚡",
                titulo: `${fmt(v)} ${de} = ${fmt(r)} ${ate}`,
                intro: `*${fmt(v)} ${NOMES[de]}* equivalem a *${fmt(r)} ${NOMES[ate]}*.`,
                dica: `Para ver em todas as unidades, digite só ${F.cmd(prefix, "energia", fmt(v).replace(/\./g, '') + ' ' + de)}`,
                prefix
            }))
        }
        const linhas = Object.keys(U).filter(k => k !== de).map(k => F.campo(NOMES[k], fmt(base / U[k])))
        return reply(F.tela({
            emoji: "⚡",
            titulo: `${fmt(v)} ${de} em outras unidades`,
            intro: `Convertendo *${fmt(v)} ${NOMES[de]}*:`,
            secoes: [{ emoji: '📐', titulo: 'Equivale a', linhas }],
            dica: "As \"calorias\" dos rótulos de comida são quilocalorias (kcal).",
            prefix
        }))
    }
};
