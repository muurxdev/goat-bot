/**
 * Agente Especialista IA #74: Oratória & Retórica
 */
const M = require('../../../utils/moldura');
const iaEngine = require('../../../services/iaEngine');

module.exports = {
    name: 'ia_agente_74',
    aliases: ["agente_ia_74"],
    category: 'general',
    subcategory: 'Consultores Especialistas IA',
    description: 'Consultor especializado em Oratória & Retórica (#74)',
    cooldownMs: 3000,
    loreExempt: true,
    execute: async ({ reply, args, text }) => {
        const query = (text || args.join(' ')).trim();
        if (!query) {
            return reply(
                M.cabecalho('🤖', 'Consultor Especialista IA #74') + '\n\n' +
                '🎯 *Especialidade:* Oratória & Retórica\n' +
                '💡 *Uso:* Digite `.ia_agente_74 <sua dúvida sobre Oratória & Retórica>`'
            );
        }
        await reply('🔬 *Analisando através da ótica de Oratória & Retórica...*');
        const prompt = 'Você é um consultor renomado especialista em Oratória & Retórica. Responda com rigor conceitual e clareza didática:\n' + query;
        const res = await iaEngine.responder(prompt);
        const doc = [
            M.cabecalho('🤖', 'Consultoria: Oratória & Retórica'),
            '📌 *Pergunta:* _"' + query.slice(0, 100) + '"_',
            '💡 *Parecer Especializado:*\n' + (res.texto || 'Análise concluída com sucesso.'),
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Intelligence Hub')
        ].join('\n\n');
        return reply(doc);
    }
};
