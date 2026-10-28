/**
 * Guia Temático de Descoberta #25
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'guia_topico_25',
    aliases: ["mapa_cmd_25"],
    category: 'general',
    subcategory: 'Guias de Descoberta',
    description: 'Guia de navegação rápida para tópicos do catálogo #25',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        const doc = [
            M.cabecalho('🧭', 'Guia de Navegação #25'),
            '🗺️ *Trilha do Conhecimento:* GOATBOT 10.000 Comandos',
            '💡 Use `.buscar <termo>` para localizar comandos específicos instantaneamente.',
            M.assinatura('GOATBOT')
        ].join('\n\n');
        return reply(doc);
    }
};
