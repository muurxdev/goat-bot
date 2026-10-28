/**
 * Comando .curar / .curar-max / .heal
 * Restaura 100% da vida máxima total calculada com armaduras, classes e níveis
 */

const dataService = require('../../services/dataService');
const { initializeUser } = require('../../services/xpService');
const { calculateFullCharacterStats } = require('../../services/characterEngine');
const { formatNumber, moedas } = require('../../utils/textoRpg');
const F = require('../../utils/formato');

module.exports = {
    name: 'curar',
    aliases: ['heal', 'recuperar'],
    category: 'rpg',
    subcategory: 'Sobrevivência',
    description: 'Recupere toda a sua vida pagando moedas à curandeira',
    examples: [' — recupera toda a vida (custa 15% da vida que falta, em moedas)'],
    cooldownMs: 2000,
    execute: async ({ sender, reply, args, prefix }) => {
        const p = prefix || '.';
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);
        const stats = calculateFullCharacterStats(user);

        const realMaxHp = stats.hpMax;
        const currentHp = Number(user.hp || realMaxHp);

        if (currentHp >= realMaxHp) {
            return reply(F.tela({
                emoji: '❤️',
                titulo: 'Sua vida já está cheia',
                intro: `Não precisei cobrar nada: você está com *${formatNumber(currentHp)} / ${formatNumber(realMaxHp)} HP*.`,
                secoes: [{ emoji: '🩺', titulo: 'Seu estado', linhas: [
                    F.campo('Vida', `${formatNumber(currentHp)} / ${formatNumber(realMaxHp)} HP`),
                    F.barra(1),
                    F.campo('Saldo', moedas(user.coins || 0))
                ] }],
                dica: 'A cura custa 15% da vida que falta, em moedas. Curar logo depois de cada derrota sai mais barato do que parece.',
                prefix: p,
                proximos: [
                    { nome: 'dungeon', oque: 'voltar à masmorra' },
                    { nome: 'hunt', oque: 'caçar monstros' }
                ]
            }));
        }

        const missingHp = realMaxHp - currentHp;
        const custo = Math.max(10, Math.floor(missingHp * 0.15));

        if ((user.coins || 0) < custo) {
            const faltam = custo - (user.coins || 0);
            return reply(F.tela({
                emoji: '🪙',
                titulo: 'Moedas insuficientes para a cura',
                intro: `Faltam *${moedas(faltam)}* para a cura completa, que custa ${moedas(custo)}.`,
                secoes: [{ emoji: '🩺', titulo: 'Seu estado', linhas: [
                    F.campo('Vida', `${formatNumber(currentHp)} / ${formatNumber(realMaxHp)} HP`),
                    F.barra(currentHp / realMaxHp),
                    F.campo('Custo da cura', moedas(custo)),
                    F.campo('Seu saldo', moedas(user.coins || 0))
                ] }],
                dica: 'Trabalhar não gasta vida: é o jeito seguro de juntar moedas quando você está ferido.',
                prefix: p,
                proximos: [
                    { nome: 'trabalhar', oque: 'ganhar moedas sem lutar' },
                    { nome: 'hunt', oque: 'caçar por moedas' }
                ]
            }));
        }

        user.coins -= custo;
        user.hp = realMaxHp;
        user.hpMax = realMaxHp;
        user.hp_max = realMaxHp;

        await dataService.saveXpData(xpData);

        return reply(F.tela({
            emoji: '💖',
            titulo: 'Vida restaurada',
            intro: `A curandeira da taverna fechou suas feridas: *+${formatNumber(missingHp)} HP* por *${moedas(custo)}*.`,
            secoes: [{ emoji: '🩺', titulo: 'Seu estado', linhas: [
                F.campo('Vida', `${formatNumber(realMaxHp)} / ${formatNumber(realMaxHp)} HP`),
                F.barra(1),
                F.campo('Vida recuperada', `+${formatNumber(missingHp)} HP`),
                F.campo('Custo', moedas(custo)),
                F.campo('Saldo', moedas(user.coins || 0))
            ] }],
            dica: 'Vida máxima maior vem de armaduras, forja e níveis. A cura sempre enche até o topo.',
            prefix: p,
            proximos: [
                { nome: 'dungeon', oque: 'voltar à masmorra' },
                { nome: 'hunt', oque: 'caçar monstros' },
                { nome: 'raid', args: 'atk', oque: 'voltar à raid do grupo' }
            ]
        }), [sender]);
    }
};
