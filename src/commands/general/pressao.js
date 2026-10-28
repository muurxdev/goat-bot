/**
 * Comando .pressao — Converte pressão: psi, bar, atm, pascal e mmHg.
 */
const F = require('../../utils/formato')

const U = {pa:1,kpa:1000,bar:100000,atm:101325,psi:6894.76,mmhg:133.322}
const NOMES = {"pa":"pascais","kpa":"quilopascais","bar":"bar","atm":"atmosferas","psi":"psi (libras por polegada²)","mmhg":"milímetros de mercúrio"}

const fmt = (r) => Number.isInteger(r) ? r.toLocaleString('pt-BR') : Number(r.toFixed(4)).toLocaleString('pt-BR', { maximumFractionDigits: 4 })
const listaUnidades = () => Object.keys(U).map(u => `• \`${u}\` — ${NOMES[u]}`)

module.exports = {
    name: "pressao",
    aliases: ["pressureconv","pressaoconv"],
    category: "general",
    subcategory: "Utilidades",
    description: "Converte pressão: psi, bar, atm, pascal e mmHg",
    usage: "<valor> <de> [para]",
    examples: ["32 psi bar — calibragem de pneu em bar","1 atm mmhg — atmosfera em mmHg","2 bar — bar em todas as unidades"],
    cooldownMs: 1500,
    execute: async ({ args = [], reply, prefix = '.' }) => {
        const exemplos = ["32 psi bar — calibragem de pneu em bar","1 atm mmhg — atmosfera em mmHg","2 bar — bar em todas as unidades"].map(e => { const [a, o] = e.split(' — '); return `• ${F.cmd(prefix, "pressao", a)} — ${o}` })
        const v = parseFloat(String(args[0] || '').replace(',', '.'))
        if (isNaN(v)) {
            return reply(F.tela({
                emoji: "🌡️",
                titulo: "Conversor: pressão",
                intro: 'Eu converto pressão entre as unidades abaixo. Digite o valor, a unidade de origem e, se quiser, a de destino.',
                secoes: [
                    { emoji: '✍️', titulo: 'Digite assim', linhas: exemplos },
                    { emoji: '📐', titulo: 'Unidades', linhas: listaUnidades() }
                ],
                dica: "Pneu de carro costuma ficar entre 30 e 35 psi.",
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
            return reply(`❌ *Não conheço a unidade "${ate}"*\n\nUnidades aceitas: ${Object.keys(U).join(', ')}.\n\n📌 *Exemplo:* ${F.cmd(prefix, "pressao", "32 psi bar")}`)
        }
        if (ate) {
            const r = base / U[ate]
            return reply(F.tela({
                emoji: "🌡️",
                titulo: `${fmt(v)} ${de} = ${fmt(r)} ${ate}`,
                intro: `*${fmt(v)} ${NOMES[de]}* equivalem a *${fmt(r)} ${NOMES[ate]}*.`,
                dica: `Para ver em todas as unidades, digite só ${F.cmd(prefix, "pressao", fmt(v).replace(/\./g, '') + ' ' + de)}`,
                prefix
            }))
        }
        const linhas = Object.keys(U).filter(k => k !== de).map(k => F.campo(NOMES[k], fmt(base / U[k])))
        return reply(F.tela({
            emoji: "🌡️",
            titulo: `${fmt(v)} ${de} em outras unidades`,
            intro: `Convertendo *${fmt(v)} ${NOMES[de]}*:`,
            secoes: [{ emoji: '📐', titulo: 'Equivale a', linhas }],
            dica: "Pneu de carro costuma ficar entre 30 e 35 psi.",
            prefix
        }))
    }
};
