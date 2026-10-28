/**
 * Comando .tempoconv — Converte tempo: segundos, minutos, horas, dias, semanas, meses e anos.
 */
const F = require('../../utils/formato')

const U = {s:1,min:60,h:3600,dia:86400,semana:604800,mes:2592000,ano:31536000}
const NOMES = {"s":"segundos","min":"minutos","h":"horas","dia":"dias","semana":"semanas","mes":"meses","ano":"anos"}

const fmt = (r) => Number.isInteger(r) ? r.toLocaleString('pt-BR') : Number(r.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 })
const listaUnidades = () => Object.keys(U).map(u => `• \`${u}\` — ${NOMES[u]}`)

module.exports = {
    name: "tempoconv",
    aliases: ["tempounit","timeconv"],
    category: "general",
    subcategory: "Utilidades",
    description: "Converte tempo: segundos, minutos, horas, dias, semanas, meses e anos",
    usage: "<valor> <de> [para]",
    examples: ["90 min h — minutos em horas","2 ano dia — anos em dias","1 semana — semana em todas as unidades"],
    cooldownMs: 1500,
    execute: async ({ args = [], reply, prefix = '.' }) => {
        const exemplos = ["90 min h — minutos em horas","2 ano dia — anos em dias","1 semana — semana em todas as unidades"].map(e => { const [a, o] = e.split(' — '); return `• ${F.cmd(prefix, "tempoconv", a)} — ${o}` })
        const v = parseFloat(String(args[0] || '').replace(',', '.'))
        if (isNaN(v)) {
            return reply(F.tela({
                emoji: "⏱️",
                titulo: "Conversor: tempo",
                intro: 'Eu converto tempo entre as unidades abaixo. Digite o valor, a unidade de origem e, se quiser, a de destino.',
                secoes: [
                    { emoji: '✍️', titulo: 'Digite assim', linhas: exemplos },
                    { emoji: '📐', titulo: 'Unidades', linhas: listaUnidades() }
                ],
                dica: "Conto o mês como 30 dias e o ano como 365.",
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
            return reply(`❌ *Não conheço a unidade "${ate}"*\n\nUnidades aceitas: ${Object.keys(U).join(', ')}.\n\n📌 *Exemplo:* ${F.cmd(prefix, "tempoconv", "90 min h")}`)
        }
        if (ate) {
            const r = base / U[ate]
            return reply(F.tela({
                emoji: "⏱️",
                titulo: `${fmt(v)} ${de} = ${fmt(r)} ${ate}`,
                intro: `*${fmt(v)} ${NOMES[de]}* equivalem a *${fmt(r)} ${NOMES[ate]}*.`,
                dica: `Para ver em todas as unidades, digite só ${F.cmd(prefix, "tempoconv", fmt(v).replace(/\./g, '') + ' ' + de)}`,
                prefix
            }))
        }
        const linhas = Object.keys(U).filter(k => k !== de).map(k => F.campo(NOMES[k], fmt(base / U[k])))
        return reply(F.tela({
            emoji: "⏱️",
            titulo: `${fmt(v)} ${de} em outras unidades`,
            intro: `Convertendo *${fmt(v)} ${NOMES[de]}*:`,
            secoes: [{ emoji: '📐', titulo: 'Equivale a', linhas }],
            dica: "Conto o mês como 30 dias e o ano como 365.",
            prefix
        }))
    }
};
