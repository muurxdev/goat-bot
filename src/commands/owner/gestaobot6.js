/**
 * Comando .perfisbot — Qual perfil de atuação está aplicado em cada grupo
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
    name: 'perfisbot',
    aliases: ["perfisativos"],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Qual perfil de atuação está aplicado em cada grupo',
    examples: [' — mostra o perfil de cada grupo configurado'],
    cooldownMs: 3000,
    ownerOnly: true,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const p = G.perfisAtivos()
    if (!p.length) {
        return reply(F.tela({
            emoji: '🎭',
            titulo: 'Nenhum perfil aplicado',
            intro: 'Esta tela mostra qual perfil (RPG, Skycode, completo…) cada grupo usa. Ainda não há grupo com ajuste próprio.',
            secoes: [{ emoji: '🛠️', titulo: 'Para aplicar um perfil', linhas: [
                'Dentro do grupo, use:',
                '• ' + F.cmd(prefix, 'modulo') + ' — mostra os perfis disponíveis e o atual'
            ] }],
            prefix
        }))
    }
    const semPerfil = p.filter(x => !x.perfil).length
    const linhas = p.slice(0, 30).map(x => '• *' + apelidoDe(x.jid) + '* — ' + (x.perfil || '_sem perfil_'))
    return reply(F.tela({
        emoji: '🎭',
        titulo: 'Perfis por grupo',
        intro: semPerfil ? semPerfil + ' grupo(s) ainda sem perfil definido.' : 'Todo grupo configurado tem perfil.',
        secoes: [{ emoji: '📋', titulo: 'Grupos', linhas }],
        dica: 'Para trocar, entre no grupo e use ' + F.cmd(prefix, 'modulo') + '.',
        proximos: [{ nome: 'dominiosbot', oque: 'quantos Domínios cada grupo tem ligados' }],
        prefix
    }))
    }
}
