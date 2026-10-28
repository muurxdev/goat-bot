/**
 * Comando .comprimento — Converte medidas de comprimento: metro, quilômetro, milha, pé e mais.
 */
const F = require('../../utils/formato')

const U = {m:1,km:1000,cm:0.01,mm:0.001,mi:1609.34,ft:0.3048,in:0.0254,yd:0.9144}
const NOMES = {"m":"metros","km":"quilômetros","cm":"centímetros","mm":"milímetros","mi":"milhas","ft":"pés","in":"polegadas","yd":"jardas"}

const fmt = (r) => Number.isInteger(r) ? r.toLocaleString('pt-BR') : Number(r.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 })
const listaUnidades = () => Object.keys(U).map(u => `• \`${u}\` — ${NOMES[u]}`)

module.exports = {
    name: "comprimento",
    aliases: ["distanciaconv","lengthconv"],
    category: "general",
    subcategory: "Utilidades",
    description: "Converte medidas de comprimento: metro, quilômetro, milha, pé e mais",
    usage: "<valor> <de> [para]",
    examples: ["5 km mi — quilômetros em milhas","180 cm ft — centímetros em pés","10 m — metros em todas as unidades"],
    cooldownMs: 1500,
    execute: async ({ args = [], reply, prefix = '.' }) => {
        const exemplos = ["5 km mi — quilômetros em milhas","180 cm ft — centímetros em pés","10 m — metros em todas as unidades"].map(e => { const [a, o] = e.split(' — '); return `• ${F.cmd(prefix, "comprimento", a)} — ${o}` })
        const v = parseFloat(String(args[0] || '').replace(',', '.'))
        if (isNaN(v)) {
            return reply(F.tela({
                emoji: "📏",
                titulo: "Conversor: comprimento",
                intro: 'Eu converto comprimento entre as unidades abaixo. Digite o valor, a unidade de origem e, se quiser, a de destino.',
                secoes: [
                    { emoji: '✍️', titulo: 'Digite assim', linhas: exemplos },
                    { emoji: '📐', titulo: 'Unidades', linhas: listaUnidades() }
                ],
                dica: "Sem a unidade de destino eu mostro a conversão para todas.",
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
            return reply(`❌ *Não conheço a unidade "${ate}"*\n\nUnidades aceitas: ${Object.keys(U).join(', ')}.\n\n📌 *Exemplo:* ${F.cmd(prefix, "comprimento", "5 km mi")}`)
        }
        if (ate) {
            const r = base / U[ate]
            return reply(F.tela({
                emoji: "📏",
                titulo: `${fmt(v)} ${de} = ${fmt(r)} ${ate}`,
                intro: `*${fmt(v)} ${NOMES[de]}* equivalem a *${fmt(r)} ${NOMES[ate]}*.`,
                dica: `Para ver em todas as unidades, digite só ${F.cmd(prefix, "comprimento", fmt(v).replace(/\./g, '') + ' ' + de)}`,
                prefix
            }))
        }
        const linhas = Object.keys(U).filter(k => k !== de).map(k => F.campo(NOMES[k], fmt(base / U[k])))
        return reply(F.tela({
            emoji: "📏",
            titulo: `${fmt(v)} ${de} em outras unidades`,
            intro: `Convertendo *${fmt(v)} ${NOMES[de]}*:`,
            secoes: [{ emoji: '📐', titulo: 'Equivale a', linhas }],
            dica: "Sem a unidade de destino eu mostro a conversão para todas.",
            prefix
        }))
    }
};
