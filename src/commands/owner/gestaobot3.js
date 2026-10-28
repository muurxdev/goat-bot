/**
 * Comando .gruposbot — Só os grupos com configuração própria e quantos ajustes cada um tem
 *
 * Só leitura: consulta o botManagementService e apresenta com utils/formato.
 */

const G = require('../../services/botManagementService')
const F = require('../../utils/formato')

/** Nome legível de um ambiente, sem mostrar o identificador cru. */
function apelidoDe(jid, nome) {
    if (nome) return String(nome).slice(0, 24)
    const n = String(jid || '')
    if (n === 'global') return 'ajuste global'
    if (n.endsWith('@g.us')) return 'grupo final ' + n.split('@')[0].slice(-6)
    return 'privado ' + G.nomeCurto(n)
}

function plural(n, um, varios) { return n + ' ' + (n === 1 ? um : varios) }

module.exports = {
    name: 'gruposbot',
    aliases: ["gruposconfigurados"],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Só os grupos com configuração própria e quantos ajustes cada um tem',
    examples: [' — lista os grupos com ajustes salvos'],
    cooldownMs: 3000,
    ownerOnly: true,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const grupos = G.ambientes().filter(a => a.tipo === 'grupo')
    if (!grupos.length) {
        return reply(F.tela({
            emoji: '👥',
            titulo: 'Nenhum grupo com configuração própria',
            intro: 'Esta tela lista os grupos que têm ajustes diferentes do padrão. Por enquanto todos seguem o padrão.',
            secoes: [{ emoji: '🛠️', titulo: 'Para ajustar um grupo', linhas: [
                'Dentro do grupo, use:',
                '• ' + F.cmd(prefix, 'setting') + ' — mostra o que dá para ajustar ali'
            ] }],
            proximos: [{ nome: 'grupos', oque: 'todos os grupos em que estou' }],
            prefix
        }))
    }
    const linhas = grupos.slice(0, 30).map(g => '• *' + apelidoDe(g.jid) + '* — ' + plural(g.opcoes, 'ajuste', 'ajustes'))
    if (grupos.length > 30) linhas.push('_… e mais ' + (grupos.length - 30) + '_')
    return reply(F.tela({
        emoji: '👥',
        titulo: plural(grupos.length, 'grupo configurado', 'grupos configurados'),
        intro: 'Grupos com pelo menos um ajuste diferente do padrão.',
        secoes: [{ emoji: '📋', titulo: 'Grupos', linhas }],
        proximos: [
            { nome: 'grupos', oque: 'todos os grupos com nome, módulos e aluguel' },
            { nome: 'perfisbot', oque: 'qual perfil cada grupo usa' }
        ],
        prefix
    }))
    }
}
