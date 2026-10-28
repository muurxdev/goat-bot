/**
 * Desafio de Raciocínio Rápido #225
 */
const { recordGameResult } = require('../../../services/triviaService');
const { adicionarXp, initializeUser } = require('../../../services/xpService');
const dataService = require('../../../services/dataService');
const M = require('../../../utils/moldura');

module.exports = {
    name: 'desafio_logica_225',
    aliases: ["dl_225"],
    category: 'fun',
    subcategory: 'Desafios de Raciocínio',
    description: 'Enigma e cálculo de agilidade mental #225',
    cooldownMs: 2000,
    execute: async ({ reply, sender, args }) => {
        const resposta = args[0] ? parseInt(args[0], 10) : null;
        if (resposta === null || isNaN(resposta)) {
            const doc = [
                M.cabecalho('🧩', 'Desafio de Raciocínio #225'),
                'Quanto é a soma: *26 + 26*?',
                '👉 Envie sua resposta com: `.desafio_logica_225 <resultado>`',
                M.assinatura('GOAT Mental Lab')
            ].join('\n\n');
            return reply(doc);
        }

        if (resposta === 52) {
            recordGameResult(sender, 'desafio_logica', 'win', 10);
            const u = initializeUser(sender, {});
            const { xpGanho } = adicionarXp(u, 80, { source: 'rpg' });
            u.coins = (u.coins || 0) + 60;
            dataService.saveUser(u);

            return reply('🎉 *EXCELENTE!* Resposta correta: *52*!\n🎁 Ganhou + ' + xpGanho + ' XP e + 60 moedas!');
        } else {
            recordGameResult(sender, 'desafio_logica', 'loss', 0);
            return reply('❌ *Incorreto!* A soma correta é *52*.');
        }
    }
};
