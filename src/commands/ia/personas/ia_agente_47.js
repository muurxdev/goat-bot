/**
 * Agente Especialista IA #47: História Medieval
 */
const M = require('../../../utils/moldura');
const iaEngine = require('../../../services/iaEngine');

module.exports = {
    name: 'ia_agente_47',
    aliases: ["agente_ia_47"],
    category: 'general',
    subcategory: 'Consultores Especialistas IA',
    description: 'Consultor especializado em História Medieval (#47)',
    cooldownMs: 3000,
    loreExempt: true,
    execute: async ({ reply, args, text }) => {
        const query = (text || args.join(' ')).trim();
        if (!query) {
            return reply(
                M.cabecalho('🤖', 'Consultor Especialista IA #47') + '\n\n' +
                '🎯 *Especialidade:* História Medieval\n' +
                '💡 *Uso:* Digite `.ia_agente_47 <sua dúvida sobre História Medieval>`'
            );
        }
        await reply('🔬 *Analisando através da ótica de História Medieval...*');
        const prompt = 'Você é um consultor renomado especialista em História Medieval. Responda com rigor conceitual e clareza didática:\n' + query;
        const res = await iaEngine.responder(prompt);
        const doc = [
            M.cabecalho('🤖', 'Consultoria: História Medieval'),
            '📌 *Pergunta:* _"' + query.slice(0, 100) + '"_',
            '💡 *Parecer Especializado:*\n' + (res.texto || 'Análise concluída com sucesso.'),
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Intelligence Hub')
        ].join('\n\n');
        return reply(doc);
    }
};
