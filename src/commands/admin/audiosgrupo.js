/**
 * Comando .audiosgrupo on/off
 * Liga ou desliga, neste grupo, as notas de voz que acompanham banimento,
 * promoção, boas-vindas e outros eventos. Desligadas por padrão.
 */

const dataService = require('../../services/dataService');
const F = require('../../utils/formato');
const audioEventoService = require('../../services/audioEventoService');

module.exports = {
    name: 'audiosgrupo',
    aliases: ["audsgrupo","vozgrupo","cmd_audiosgrupo","alt_audiosgrupo","atalho_audiosgrupo","abrev_audiosgrupo","call_audiosgrupo","func_audiosgrupo"],
    category: 'admin',
    subcategory: 'Moderação',
    description: 'Liga ou desliga as notas de voz dos eventos (banimento, promoção, boas-vindas) neste grupo',
    usage: '[on|off]',
    examples: [' — mostra se as notas de voz estão ligadas', 'on — liga as notas de voz dos eventos', 'off — desliga as notas de voz dos eventos'],
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, args = [], reply, prefix = '.' }) => {
        const opcao = (args[0] || '').toLowerCase();
        const ligar = ['on', 'ligar', 'ativar', '1'].includes(opcao);
        const desligar = ['off', 'desligar', 'desativar', '0'].includes(opcao);

        if (!ligar && !desligar) {
            const ligado = audioEventoService.ligadoNoGrupo(from);
            return reply(F.tela({
                emoji: ligado ? '🔊' : '🔇', titulo: 'Notas de voz dos eventos', prefix,
                intro: ligado
                    ? 'Estão *ligadas* neste grupo: quando alguém entra, sai, é promovido ou removido, eu mando uma nota de voz curta junto do aviso.'
                    : 'Estão *desligadas* neste grupo: nos eventos (entrada, saída, promoção, remoção) só sai o texto e a figurinha.',
                dica: 'Mando no máximo uma nota de voz por minuto, para não encher o grupo.',
                proximos: [
                    ligado ? { nome: 'audiosgrupo', args: 'off', oque: 'desliga as notas de voz' } : { nome: 'audiosgrupo', args: 'on', oque: 'liga as notas de voz' },
                    { nome: 'figurinhasgrupo', oque: 'vê se as figurinhas dos eventos estão ligadas' }
                ]
            }));
        }

        const configs = dataService.getConfigsData();
        if (!configs[from]) configs[from] = {};
        configs[from].audiosEventos = ligar;
        await dataService.saveConfigsData(configs);

        return reply(ligar
            ? '✅ Liguei as notas de voz dos eventos aqui. Sai no máximo uma por minuto.'
            : '✅ Desliguei as notas de voz dos eventos aqui.');
    }
};
