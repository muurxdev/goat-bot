/**
 * Comando .uppercaseall — Converte todo o texto para letras maiúsculas: .uppercaseall <texto>
 */
const F = require('../../utils/formato')

module.exports = {
    name: "uppercaseall",
    aliases: ["uppercaseall-cmd","cmd-uppercaseall","cmd_uppercaseall","alt_uppercaseall","atalho_uppercaseall","abrev_uppercaseall","call_uppercaseall","func_uppercaseall"],
    category: "dev",
    subcategory: "String",
    description: "Passa todo o texto para letras maiúsculas",
    usage: '<texto>',
    examples: ['olá mundo — vira OLÁ MUNDO', 'atenção ao aviso — funciona com acentos'],
    cooldownMs: 1500,
    execute: async ({ reply, args, prefix = '.' }) => {
            const t = args.join(" ");
            if (!t) return reply(F.tela({
                emoji: '🔠',
                titulo: 'Texto em maiúsculas',
                intro: 'Passa todas as letras do texto para maiúsculas, mantendo os acentos.',
                secoes: [
                    { emoji: '⌨️', titulo: 'Digite assim', linhas: [F.cmd(prefix, 'uppercaseall', '<texto>')] },
                    { emoji: '📝', titulo: 'Exemplos', linhas: F.lista([F.cmd(prefix, 'uppercaseall', 'olá mundo'), F.cmd(prefix, 'uppercaseall', 'atenção ao aviso')]) }
                ],
                proximos: [{ nome: 'lowercaseall', args: 'TEXTO', oque: 'tudo minúsculo' }, { nome: 'invertcase', args: 'Texto', oque: 'inverter maiúsculas e minúsculas' }],
                prefix
            }));
            return reply(F.tela({
                emoji: '🔠',
                titulo: 'Texto em maiúsculas',
                intro: t.toUpperCase(),
                secoes: [{ emoji: '📋', titulo: 'Detalhes', linhas: [F.campo('Caracteres', String(t.length))] }],
                proximos: [{ nome: 'lowercaseall', args: t.slice(0, 30), oque: 'tudo minúsculo' }, { nome: 'camelcase', args: t.slice(0, 30), oque: 'formato camelCase' }],
                prefix
            }));
        }
};
