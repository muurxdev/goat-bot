/**
 * Comando .figurinhasgrupo on/off
 * Liga ou desliga, neste grupo, as figurinhas que acompanham banimento,
 * promoção, boas-vindas e outros eventos. Ligadas por padrão.
 */

const dataService = require('../../services/dataService');
const F = require('../../utils/formato');
const figurinhaEventoService = require('../../services/figurinhaEventoService');

module.exports = {
    name: 'figurinhasgrupo',
    aliases: ["figsgrupo","stickersgrupo","cmd_figurinhasgrupo","alt_figurinhasgrupo","atalho_figurinhasgrupo","abrev_figurinhasgrupo","call_figurinhasgrupo","func_figurinhasgrupo"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Liga ou desliga as figurinhas dos eventos (banimento, promoção, boas-vindas) neste grupo',
    usage: '[on|off]',
    examples: [' — mostra se as figurinhas estão ligadas', 'on — liga as figurinhas dos eventos', 'off — desliga as figurinhas dos eventos'],
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, args = [], reply, prefix = '.' }) => {
        const opcao = (args[0] || '').toLowerCase();
        const ligar = ['on', 'ligar', 'ativar', '1'].includes(opcao);
        const desligar = ['off', 'desligar', 'desativar', '0'].includes(opcao);

        if (!ligar && !desligar) {
            const ligado = figurinhaEventoService.ligadoNoGrupo(from);
            return reply(F.tela({
                emoji: '🎴', titulo: 'Figurinhas dos eventos', prefix,
                intro: ligado
                    ? 'Estão *ligadas* neste grupo: quando alguém entra, sai, é promovido ou removido, eu mando uma figurinha junto do aviso.'
                    : 'Estão *desligadas* neste grupo: nos eventos (entrada, saída, promoção, remoção) só sai o aviso em texto.',
                proximos: [
                    ligado ? { nome: 'figurinhasgrupo', args: 'off', oque: 'desliga as figurinhas' } : { nome: 'figurinhasgrupo', args: 'on', oque: 'liga as figurinhas' },
                    { nome: 'audiosgrupo', oque: 'vê se as notas de voz dos eventos estão ligadas' }
                ]
            }));
        }

        const configs = dataService.getConfigsData();
        if (!configs[from]) configs[from] = {};
        configs[from].figurinhasEventos = ligar;
        await dataService.saveConfigsData(configs);

        return reply(ligar
            ? '✅ Liguei as figurinhas dos eventos neste grupo.'
            : '✅ Desliguei as figurinhas dos eventos neste grupo. Os avisos continuam saindo em texto.');
    }
};
