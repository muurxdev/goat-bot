/**
 * Comando .sorteiogrupo — sorteia um número da sorte para o grupo.
 */
const F = require('../../utils/formato')

module.exports = {
    name: "sorteiogrupo",
    aliases: ["sorteiogrupo-cmd","cmd-sorteiogrupo"],
    category: "general",
    subcategory: "Sorteio",
    description: "Sorteia um número da sorte de 1 até o máximo que você escolher",
    usage: "[máximo]",
    examples: [" — sorteia de 1 a 100", "30 — sorteia de 1 a 30 (ex.: número da rifa)"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const digitado = parseInt(args[0], 10)
        const max = Math.max(2, digitado || 100)
        const sorteado = Math.floor(Math.random() * max) + 1
        return reply(F.tela({
            emoji: '🎉',
            titulo: `Número da sorte: ${sorteado}`,
            intro: `Girei a roda da taverna e saiu o *${sorteado}*! Parabéns a quem estava com ele.`,
            secoes: [{ emoji: '🎲', titulo: 'Sorteio', linhas: [
                F.campo('Faixa', `1 a ${max}`),
                F.campo('Número sorteado', `*${sorteado}*`)
            ] }],
            dica: digitado ? 'Combine os números antes de sortear, assim ninguém reclama depois.' : `Sem número eu uso 1 a 100. Para uma rifa de 30, digite ${F.cmd(prefix, 'sorteiogrupo', '30')}.`,
            proximos: [
                { nome: 'numeroaleatorio', args: '10 50', oque: 'sortear com mínimo e máximo' },
                { nome: 'escolher', args: 'Ana | Bia | Caio', oque: 'sortear entre nomes' }
            ],
            prefix
        }))
    }
};
