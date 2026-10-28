/**
 * Comando .usuariosparados — Quem se cadastrou e nunca mandou nenhum comando
 *
 * Só leitura: consulta o botManagementService e apresenta com utils/formato.
 */

const G = require('../../services/botManagementService')
const F = require('../../utils/formato')

function plural(n, um, varios) { return n + ' ' + (n === 1 ? um : varios) }

function nomePessoa(u) {
    return String(u.display_nick || u.name || G.nomeCurto(u.jid)).slice(0, 22)
}

module.exports = {
    name: 'usuariosparados',
    aliases: ["cadastrosinativos"],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Quem se cadastrou e nunca mandou nenhum comando',
    examples: [' — lista cadastros sem nenhum uso'],
    cooldownMs: 3000,
    ownerOnly: true,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const LIMITE = 15
    const p = G.usuariosParados(LIMITE)
    if (!p.length) {
        return reply(F.tela({
            emoji: '🟢',
            titulo: 'Nenhum cadastro parado',
            intro: 'Esta tela lista quem fez cadastro e nunca usou nada. Todo cadastrado já me usou ao menos uma vez.',
            proximos: [{ nome: 'usuariosbot', oque: 'os números da base inteira' }],
            prefix
        }))
    }
    return reply(F.tela({
        emoji: '💤',
        titulo: plural(p.length, 'cadastro parado', 'cadastros parados') + (p.length >= LIMITE ? ' ou mais' : ''),
        intro: 'Estas pessoas se cadastraram e nunca usaram nada.',
        secoes: [{ emoji: '👤', titulo: 'Quem são', linhas: p.map(u => '• ' + nomePessoa(u)) }],
        dica: 'Um aviso no grupo com ' + F.cmd(prefix, 'menu') + ' costuma ajudar quem não sabe por onde começar.',
        proximos: [{ nome: 'novosusuarios', oque: 'quem chegou nos últimos dias' }],
        prefix
    }))
    }
}
