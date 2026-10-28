/**
 * Comando .contarambientes — Quantos grupos, privados e ajustes globais têm configuração própria
 *
 * Só leitura: consulta o botManagementService e apresenta com utils/formato.
 */

const G = require('../../services/botManagementService')
const F = require('../../utils/formato')

function plural(n, um, varios) { return n + ' ' + (n === 1 ? um : varios) }

module.exports = {
    name: 'contarambientes',
    aliases: ["quantosambientes"],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Quantos grupos, privados e ajustes globais têm configuração própria',
    examples: [' — conta os ambientes configurados'],
    cooldownMs: 3000,
    ownerOnly: true,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const lista = G.ambientes()
    const n = lista.length
    if (!n) {
        return reply(F.tela({
            emoji: '🌐',
            titulo: "Nenhum ambiente configurado",
            intro: "Ambiente é um grupo, um privado ou o ajuste global com configuração própria.",
            secoes: [{ emoji: '🛠️', titulo: "Como um ambiente aparece", linhas: ['Basta mudar um ajuste num lugar. Dentro de um grupo:', '• ' + F.cmd(prefix, 'setting', 'prefix !') + ' — troca o prefixo só ali'] }],
            prefix
        }))
    }
    return reply(F.tela({
        emoji: '🌐',
        titulo: plural(n, "ambiente configurado", "ambientes configurados"),
        intro: "Ambiente é um grupo, um privado ou o ajuste global com configuração própria.",
        secoes: [{ emoji: '📊', titulo: 'Por tipo', linhas: ((campo) => { const m = new Map(); for (const x of lista) m.set(x[campo], (m.get(x[campo]) || 0) + 1); return [...m].map(([k, v]) => F.campo(String(k), v)) })('tipo') }],
        proximos: [{ nome: 'ambientesbot', oque: 'a lista numerada' }],
        prefix
    }))
    }
}
