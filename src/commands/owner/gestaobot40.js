/**
 * Comando .contarbloqueados — Quantas pessoas estão bloqueadas em todos os lugares
 *
 * Só leitura: consulta o botManagementService e apresenta com utils/formato.
 */

const G = require('../../services/botManagementService')
const F = require('../../utils/formato')

function plural(n, um, varios) { return n + ' ' + (n === 1 ? um : varios) }

module.exports = {
    name: 'contarbloqueados',
    aliases: ["quantosbloqueados"],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Quantas pessoas estão bloqueadas em todos os lugares',
    examples: [' — conta os bloqueados'],
    cooldownMs: 3000,
    ownerOnly: true,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const lista = G.listaNegra()
    const n = lista.length
    if (!n) {
        return reply(F.tela({
            emoji: '🚫',
            titulo: "Ninguém bloqueado",
            intro: "Bloqueados não conseguem usar meus comandos em lugar nenhum.",
            secoes: [{ emoji: '🛠️', titulo: "Para bloquear alguém", linhas: ['• ' + F.cmd(prefix, 'banglobal', '@pessoa motivo') + ' — bloqueia em todos os lugares'] }],
            prefix
        }))
    }
    return reply(F.tela({
        emoji: '🚫',
        titulo: plural(n, "pessoa bloqueada", "pessoas bloqueadas"),
        intro: "Bloqueados não conseguem usar meus comandos em lugar nenhum.",
        secoes: [null],
        proximos: [{ nome: 'bloqueadosbot', oque: 'quem são e o motivo' }],
        prefix
    }))
    }
}
