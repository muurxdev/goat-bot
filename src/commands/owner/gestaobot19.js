/**
 * Comando .ajustesglobais — Ajustes que valem para todos os lugares ao mesmo tempo
 *
 * Só leitura: consulta o botManagementService e apresenta com utils/formato.
 */

const G = require('../../services/botManagementService')
const F = require('../../utils/formato')

function plural(n, um, varios) { return n + ' ' + (n === 1 ? um : varios) }

module.exports = {
    name: 'ajustesglobais',
    aliases: ["configglobal"],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Ajustes que valem para todos os lugares ao mesmo tempo',
    examples: [' — mostra os ajustes globais (senhas e chaves aparecem só como definidas)'],
    cooldownMs: 3000,
    ownerOnly: true,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const a = G.ajustesGlobais()
    const chaves = Object.keys(a)
    if (!chaves.length) {
        return reply(F.tela({
            emoji: '⚙️',
            titulo: 'Nenhum ajuste global',
            intro: 'Esta tela mostra os ajustes que valem para todos os lugares ao mesmo tempo. Tudo está no padrão.',
            secoes: [{ emoji: '🛠️', titulo: 'Para definir um', linhas: [
                '• ' + F.cmd(prefix, 'setting', 'prefix ! global') + ' — troca o prefixo em todo lugar',
                '• ' + F.cmd(prefix, 'setting') + ' — mostra o que dá para ajustar'
            ] }],
            prefix
        }))
    }
    const mostrar = (v) => {
        if (typeof v === 'boolean') return v ? '🟢 ligado' : '🔴 desligado'
        if (v && typeof v === 'object') return Array.isArray(v) ? plural(v.length, 'item', 'itens') : 'lista de opções'
        return String(v).slice(0, 40)
    }
    const linhas = chaves.slice(0, 30).map(k => F.campo(k, mostrar(a[k])))
    return reply(F.tela({
        emoji: '⚙️',
        titulo: plural(chaves.length, 'ajuste global', 'ajustes globais'),
        intro: 'Valem em todo lugar que não tenha ajuste próprio.',
        secoes: [{ emoji: '📋', titulo: 'Ajustes', linhas }],
        dica: 'Senhas, chaves e cookies aparecem só como definidos ou vazios, nunca o valor.',
        proximos: [{ nome: 'setting', oque: 'ver e mudar ajustes onde você estiver' }],
        prefix
    }))
    }
}
