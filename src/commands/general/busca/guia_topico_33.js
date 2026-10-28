/**
 * Guia Temático de Descoberta #33
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'guia_topico_33',
    aliases: ["mapa_cmd_33"],
    category: 'general',
    subcategory: 'Guias de Descoberta',
    description: 'Guia de navegação rápida para tópicos do catálogo #33',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        const doc = [
            M.cabecalho('🧭', 'Guia de Navegação #33'),
            '🗺️ *Trilha do Conhecimento:* GOATBOT 10.000 Comandos',
            '💡 Use `.buscar <termo>` para localizar comandos específicos instantaneamente.',
            M.assinatura('GOATBOT')
        ].join('\n\n');
        return reply(doc);
    }
};
