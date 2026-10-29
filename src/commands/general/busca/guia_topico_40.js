/**
 * Guia Temático de Descoberta #40
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: 'guia_topico_40',
    aliases: ["mapa_cmd_40"],
    category: 'general',
    subcategory: 'Guias de Descoberta',
    description: 'Guia de navegação rápida para tópicos do catálogo #40',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        const doc = [
            M.cabecalho('🧭', 'Guia de Navegação #40'),
            '🗺️ *Trilha do Conhecimento:* ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ 10.000 Comandos',
            '💡 Use `.buscar <termo>` para localizar comandos específicos instantaneamente.',
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤')
        ].join('\n\n');
        return reply(doc);
    }
};
