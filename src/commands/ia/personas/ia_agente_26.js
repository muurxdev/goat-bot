/**
 * Agente Especialista IA #26: Design de Games
 */
const M = require('../../../utils/moldura');
const iaEngine = require('../../../services/iaEngine');

module.exports = {
    name: 'ia_agente_26',
    aliases: ["agente_ia_26"],
    category: 'general',
    subcategory: 'Consultores Especialistas IA',
    description: 'Consultor especializado em Design de Games (#26)',
    cooldownMs: 3000,
    loreExempt: true,
    execute: async ({ reply, args, text }) => {
        const query = (text || args.join(' ')).trim();
        if (!query) {
            return reply(
                M.cabecalho('🤖', 'Consultor Especialista IA #26') + '\n\n' +
                '🎯 *Especialidade:* Design de Games\n' +
                '💡 *Uso:* Digite `.ia_agente_26 <sua dúvida sobre Design de Games>`'
            );
        }
        await reply('🔬 *Analisando através da ótica de Design de Games...*');
        const prompt = 'Você é um consultor renomado especialista em Design de Games. Responda com rigor conceitual e clareza didática:\n' + query;
        const res = await iaEngine.responder(prompt);
        const doc = [
            M.cabecalho('🤖', 'Consultoria: Design de Games'),
            '📌 *Pergunta:* _"' + query.slice(0, 100) + '"_',
            '💡 *Parecer Especializado:*\n' + (res.texto || 'Análise concluída com sucesso.'),
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Intelligence Hub')
        ].join('\n\n');
        return reply(doc);
    }
};
