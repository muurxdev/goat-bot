/**
 * Comando .loremwords — Gera N palavras de texto de preenchimento: .loremwords [qtd=10]
 */
const F = require('../../utils/formato')

module.exports = {
    name: "loremwords",
    aliases: ["loremwords-cmd","cmd-loremwords","cmd_loremwords","alt_loremwords","atalho_loremwords","abrev_loremwords","call_loremwords","func_loremwords"],
    category: "dev",
    subcategory: "Dev",
    description: "Gera de 1 a 100 palavras de texto de preenchimento (lorem ipsum)",
    usage: '[quantidade]',
    examples: [' — 10 palavras', '50 — 50 palavras'],
    cooldownMs: 1500,
    execute: async ({ reply, args, prefix = '.' }) => {
            const count = Math.min(100, Math.max(1, parseInt(args[0]) || 10));
            const dict = ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua"];
            const words = [];
            for (let i = 0; i < count; i++) words.push(dict[i % dict.length]);
            const texto = words.join(" ") + '.';
            return reply(F.tela({
                emoji: '📝',
                titulo: `${count} palavras de preenchimento`,
                intro: texto.charAt(0).toUpperCase() + texto.slice(1),
                secoes: [{ emoji: '📋', titulo: 'Detalhes', linhas: [F.campo('Palavras', `${count} (aceito de 1 a 100)`), F.campo('Caracteres', String(texto.length))] }],
                dica: 'Lorem ipsum serve para ocupar espaço em layouts antes de o texto real chegar.',
                proximos: [
                    { nome: 'loremwords', args: '50', oque: 'mais palavras' },
                    { nome: 'loremparas', oque: 'parágrafos inteiros' }
                ],
                prefix
            }));
        }
};
