/**
 * Comando .milestone1000 — comemora a marca de mil comandos do bot.
 */
const { getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')
const F = require('../../utils/formato')

module.exports = {
    name: "milestone1000",
    aliases: ["mile1000","mile-1000"],
    category: "general",
    subcategory: "Celebração",
    description: "Comemora a marca de mil comandos da taverna",
    cooldownMs: 2000,
    execute: async ({ reply, prefix = '.' }) => {
        const nome = getBotName()
        // Conta de verdade o que está carregado, em vez de repetir um número fixo.
        let comandos = 0, atalhos = 0
        try {
            const dispatcher = require('../../handlers/commandDispatcher')
            comandos = dispatcher.commands.size
            atalhos = dispatcher.aliases.size
        } catch (err) {
            logger.warn(`[MILESTONE1000] não consegui contar os comandos: ${err.message}`)
        }
        const total = comandos + atalhos
        return reply(F.tela({
            emoji: '🎉',
            titulo: 'Marca histórica: mil comandos!',
            intro: `Eu, ${nome}, passei da marca lendária de *mil jeitos de me chamar*. O Dragão da Ira reina no Reino!`,
            secoes: [
                comandos ? { emoji: '📜', titulo: 'Hoje na taverna', linhas: [
                    F.campo('Comandos', comandos.toLocaleString('pt-BR')),
                    F.campo('Atalhos', atalhos.toLocaleString('pt-BR')),
                    F.campo('Jeitos de me chamar', total.toLocaleString('pt-BR'))
                ] } : null,
                { emoji: '⚔️', titulo: 'O que tem por aqui', linhas: [
                    '• RPG com caçadas, torre e chefes',
                    '• Economia, lojas e apostas',
                    '• Proteção e organização do grupo',
                    '• Músicas, vídeos, figurinhas e muito mais'
                ] }
            ],
            dica: 'Tem ideia para o próximo comando? Mande que eu entrego aos meus donos.',
            proximos: [
                { nome: 'menu', oque: 'ver tudo o que eu sei fazer' },
                { nome: 'sugerir', args: '<sua ideia>', oque: 'sugerir um comando novo' }
            ],
            prefix
        }))
    }
};
