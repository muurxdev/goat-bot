/**
 * Agente Especialista IA #55: Robótica Industrial
 */
const M = require('../../../utils/moldura');
const iaEngine = require('../../../services/iaEngine');

module.exports = {
    name: 'ia_agente_55',
    aliases: ["agente_ia_55"],
    category: 'general',
    subcategory: 'Consultores Especialistas IA',
    description: 'Consultor especializado em Robótica Industrial (#55)',
    cooldownMs: 3000,
    loreExempt: true,
    execute: async ({ reply, args, text }) => {
        const query = (text || args.join(' ')).trim();
        if (!query) {
            return reply(
                M.cabecalho('🤖', 'Consultor Especialista IA #55') + '\n\n' +
                '🎯 *Especialidade:* Robótica Industrial\n' +
                '💡 *Uso:* Digite `.ia_agente_55 <sua dúvida sobre Robótica Industrial>`'
            );
        }
        await reply('🔬 *Analisando através da ótica de Robótica Industrial...*');
        const prompt = 'Você é um consultor renomado especialista em Robótica Industrial. Responda com rigor conceitual e clareza didática:\n' + query;
        const res = await iaEngine.responder(prompt);
        const doc = [
            M.cabecalho('🤖', 'Consultoria: Robótica Industrial'),
            '📌 *Pergunta:* _"' + query.slice(0, 100) + '"_',
            '💡 *Parecer Especializado:*\n' + (res.texto || 'Análise concluída com sucesso.'),
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Intelligence Hub')
        ].join('\n\n');
        return reply(doc);
    }
};
