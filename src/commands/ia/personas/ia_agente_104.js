/**
 * Agente Especialista IA #104: Oratória & Retórica
 */
const M = require('../../../utils/moldura');
const iaEngine = require('../../../services/iaEngine');

module.exports = {
    name: 'ia_agente_104',
    aliases: ["agente_ia_104"],
    category: 'general',
    subcategory: 'Consultores Especialistas IA',
    description: 'Consultor especializado em Oratória & Retórica (#104)',
    cooldownMs: 3000,
    loreExempt: true,
    execute: async ({ reply, args, text }) => {
        const query = (text || args.join(' ')).trim();
        if (!query) {
            return reply(
                M.cabecalho('🤖', 'Consultor Especialista IA #104') + '\n\n' +
                '🎯 *Especialidade:* Oratória & Retórica\n' +
                '💡 *Uso:* Digite `.ia_agente_104 <sua dúvida sobre Oratória & Retórica>`'
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
