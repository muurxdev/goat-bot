/**
 * Desafio de Raciocínio Rápido #319
 */
const { recordGameResult } = require('../../../services/triviaService');
const { adicionarXp, initializeUser } = require('../../../services/xpService');
const dataService = require('../../../services/dataService');
const M = require('../../../utils/moldura');

module.exports = {
    name: 'desafio_logica_319',
    aliases: ["dl_319"],
    category: 'fun',
    subcategory: 'Desafios de Raciocínio',
    description: 'Enigma e cálculo de agilidade mental #319',
    cooldownMs: 2000,
    execute: async ({ reply, sender, args }) => {
        const resposta = args[0] ? parseInt(args[0], 10) : null;
        if (resposta === null || isNaN(resposta)) {
            const doc = [
                M.cabecalho('🧩', 'Desafio de Raciocínio #319'),
                'Quanto é a soma: *34 + 48*?',
                '👉 Envie sua resposta com: `.desafio_logica_319 <resultado>`',
                M.assinatura('GOAT Mental Lab')
            ].join('\n\n');
            return reply(doc);
        }

        if (resposta === 82) {
            recordGameResult(sender, 'desafio_logica', 'win', 10);
            const u = initializeUser(sender, {});
            const { xpGanho } = adicionarXp(u, 80, { source: 'rpg' });
            u.coins = (u.coins || 0) + 60;
            dataService.saveUser(u);

            return reply('🎉 *EXCELENTE!* Resposta correta: *82*!\n🎁 Ganhou + ' + xpGanho + ' XP e + 60 moedas!');
        } else {
            recordGameResult(sender, 'desafio_logica', 'loss', 0);
            return reply('❌ *Incorreto!* A soma correta é *82*.');
        }
    }
};
