/**
 * Comando .gruposmudos — Grupos com todos os Domínios desligados, onde eu não respondo nada
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
    name: 'gruposmudos',
    aliases: ["gruposemdominio"],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Grupos com todos os Domínios desligados, onde eu não respondo nada',
    examples: [' — lista os grupos em que estou mudo'],
    cooldownMs: 3000,
    ownerOnly: true,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const d = G.dominiosPorAmbiente().filter(g => g.ligados === 0)
    if (!d.length) {
        return reply(F.tela({
            emoji: '🟢',
            titulo: 'Nenhum grupo mudo',
            intro: 'Esta tela lista os grupos em que todos os Domínios estão desligados, onde eu leio e não respondo. Todo grupo configurado tem ao menos um ligado.',
            proximos: [{ nome: 'dominiosbot', oque: 'quantos Domínios cada grupo tem ligados' }],
            prefix
        }))
    }
    return reply(F.tela({
        emoji: '🔇',
        titulo: plural(d.length, 'grupo mudo', 'grupos mudos'),
        intro: 'Nesses grupos eu leio as mensagens e não respondo a nenhum comando.',
        secoes: [{ emoji: '🔴', titulo: 'Grupos', linhas: d.slice(0, 30).map(g => '• ' + apelidoDe(g.jid)) }],
        dica: 'Para religar, entre no grupo e use ' + F.cmd(prefix, 'modulo', 'on all') + ' ou escolha um perfil com ' + F.cmd(prefix, 'modulo') + '.',
        proximos: [{ nome: 'dominiosbot', oque: 'o quadro completo de Domínios' }],
        prefix
    }))
    }
}
