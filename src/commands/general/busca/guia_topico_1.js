/**
 * Guia Temático de Descoberta #1
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'guia_topico_1',
    aliases: ["mapa_cmd_1"],
    category: 'general',
    subcategory: 'Guias de Descoberta',
    description: 'Guia de navegação rápida para tópicos do catálogo #1',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        const doc = [
            M.cabecalho('🧭', 'Guia de Navegação #1'),
            '🗺️ *Trilha do Conhecimento:* GOATBOT 10.000 Comandos',
            '💡 Use `.buscar <termo>` para localizar comandos específicos instantaneamente.',
            M.assinatura('GOATBOT')
        ].join('\n\n');
        return reply(doc);
    }
};
