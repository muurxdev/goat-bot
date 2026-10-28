/**
 * Comando .ambientesbot — Lista numerada dos grupos, privados e do ajuste global com configuração
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
    name: 'ambientesbot',
    aliases: ["listarambientes"],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Lista numerada dos grupos, privados e do ajuste global com configuração',
    examples: [' — mostra todos os ambientes com ajustes salvos'],
    cooldownMs: 3000,
    ownerOnly: true,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const a = G.ambientes()
    if (!a.length) {
        return reply(F.tela({
            emoji: '🌐',
            titulo: 'Nenhum ambiente configurado',
            intro: 'Esta tela lista cada grupo, privado ou ajuste global que tem configuração própria, numerados. Por enquanto tudo usa o padrão.',
            secoes: [{ emoji: '🛠️', titulo: 'Como um ambiente aparece', linhas: [
                'Basta mudar algum ajuste num lugar. Por exemplo, dentro de um grupo:',
                '• ' + F.cmd(prefix, 'setting', 'prefix !') + ' — troca o prefixo só ali',
                '• ' + F.cmd(prefix, 'setting') + ' — mostra o que dá para ajustar'
            ] }],
            prefix
        }))
    }
    const TIPO = { grupo: 'grupo', privado: 'privado', global: 'global' }
    const linhas = a.slice(0, 25).map((x, i) => (i + 1) + '. *' + apelidoDe(x.jid) + '* — ' + plural(x.opcoes, 'ajuste', 'ajustes') + ' · ' + (TIPO[x.tipo] || x.tipo))
    if (a.length > 25) linhas.push('_… e mais ' + (a.length - 25) + '_')
    return reply(F.tela({
        emoji: '🌐',
        titulo: plural(a.length, 'ambiente configurado', 'ambientes configurados'),
        intro: 'Cada lugar abaixo tem pelo menos um ajuste diferente do padrão.',
        secoes: [{ emoji: '📋', titulo: 'Ambientes', linhas }],
        dica: 'Para ver os detalhes de qualquer um, use o número da lista: ' + F.cmd(prefix, 'ambiente', '3') + '.',
        proximos: [
            { nome: 'ambiente', args: '1', oque: 'detalhes do primeiro da lista' },
            { nome: 'dominiosbot', oque: 'quantos Domínios cada grupo tem ligados' }
        ],
        prefix
    }))
    }
}
