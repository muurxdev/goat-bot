/**
 * Comando .dominiosbot — Quantos Domínios de comandos cada grupo tem ligados
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

module.exports = {
    name: 'dominiosbot',
    aliases: ["dominiosporgrupo"],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Quantos Domínios de comandos cada grupo tem ligados',
    examples: [' — mostra os Domínios ligados em cada grupo'],
    cooldownMs: 3000,
    ownerOnly: true,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const d = G.dominiosPorAmbiente()
    if (!d.length) {
        return reply(F.tela({
            emoji: '🎛️',
            titulo: 'Nenhum grupo com Domínios configurados',
            intro: 'Esta tela mostra, grupo a grupo, quantos Domínios (conjuntos de comandos) estão ligados. Ainda não há grupo com ajuste próprio.',
            secoes: [{ emoji: '🛠️', titulo: 'Para ligar Domínios', linhas: [
                'Dentro do grupo, use:',
                '• ' + F.cmd(prefix, 'modulo') + ' — mostra os perfis e o que está ligado ali',
                '• ' + F.cmd(prefix, 'modulo', 'on cassino') + ' — liga o cassino naquele grupo'
            ] }],
            prefix
        }))
    }
    const linhas = d.slice(0, 25).map(g => (g.ligados === 0 ? '🔴 ' : '• ') + '*' + apelidoDe(g.jid) + '* — ' + g.ligados + ' de ' + g.total + ' · ' + F.barra(g.total ? g.ligados / g.total : 0, 5))
    if (d.length > 25) linhas.push('_… e mais ' + (d.length - 25) + '_')
    const mudos = d.filter(g => g.ligados === 0).length
    return reply(F.tela({
        emoji: '🎛️',
        titulo: 'Domínios por grupo',
        intro: mudos ? mudos + ' grupo(s) estão com tudo desligado: ali eu leio e não respondo.' : 'Todo grupo listado tem ao menos um Domínio ligado.',
        secoes: [{ emoji: '📊', titulo: 'Ligados em cada grupo', linhas }],
        dica: 'Para mudar um grupo, entre nele e use ' + F.cmd(prefix, 'modulo') + '.',
        proximos: [
            mudos ? { nome: 'gruposmudos', oque: 'só os grupos com tudo desligado' } : null,
            { nome: 'perfisbot', oque: 'qual perfil cada grupo usa' }
        ].filter(Boolean),
        prefix
    }))
    }
}
