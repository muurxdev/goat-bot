/**
 * Comando .reacaorapida — anuncia um desafio de reação no chat.
 * É só o anúncio: quem manda o emoji primeiro é conferido pelo próprio grupo.
 */
const F = require('../../utils/formato')

module.exports = {
    name: "reacaorapida",
    aliases: ["reacaorapida-cmd","cmd-reacaorapida"],
    category: "general",
    subcategory: "Jogos",
    description: "Anuncia um desafio de reflexo: quem mandar um emoji primeiro vence",
    examples: [" — lança o desafio para o grupo"],
    cooldownMs: 2000,
    execute: async ({ reply, prefix = '.' }) => {
        return reply(F.tela({
            emoji: '⚡',
            titulo: 'Teste de reação relâmpago!',
            intro: 'Quem mandar qualquer emoji primeiro ganha o troféu de guerreiro mais veloz da taverna!',
            secoes: [{ emoji: '📜', titulo: 'Regras', linhas: [
                '• Vale qualquer emoji, mandado depois deste aviso',
                '• A primeira mensagem que aparecer no grupo vence'
            ] }],
            dica: 'O grupo confere quem chegou primeiro pela ordem das mensagens.',
            proximos: [
                { nome: 'reacaorapida', oque: 'lançar uma nova rodada' },
                { nome: 'sorteiogrupo', oque: 'sortear um número da sorte' }
            ],
            prefix
        }))
    }
};
