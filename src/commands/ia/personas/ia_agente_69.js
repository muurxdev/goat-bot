/**
 * Agente Especialista IA #69: Inteligência Artificial & LLMs
 */
const M = require('../../../utils/moldura');
const iaEngine = require('../../../services/iaEngine');

module.exports = {
    name: 'ia_agente_69',
    aliases: ["agente_ia_69"],
    category: 'general',
    subcategory: 'Consultores Especialistas IA',
    description: 'Consultor especializado em Inteligência Artificial & LLMs (#69)',
    cooldownMs: 3000,
    loreExempt: true,
    execute: async ({ reply, args, text }) => {
        const query = (text || args.join(' ')).trim();
        if (!query) {
            return reply(
                M.cabecalho('🤖', 'Consultor Especialista IA #69') + '\n\n' +
                '🎯 *Especialidade:* Inteligência Artificial & LLMs\n' +
                '💡 *Uso:* Digite `.ia_agente_69 <sua dúvida sobre Inteligência Artificial & LLMs>`'
            );
        }
        await reply('🔬 *Analisando através da ótica de Inteligência Artificial & LLMs...*');
        const prompt = 'Você é um consultor renomado especialista em Inteligência Artificial & LLMs. Responda com rigor conceitual e clareza didática:\n' + query;
        const res = await iaEngine.responder(prompt);
        const doc = [
            M.cabecalho('🤖', 'Consultoria: Inteligência Artificial & LLMs'),
            '📌 *Pergunta:* _"' + query.slice(0, 100) + '"_',
            '💡 *Parecer Especializado:*\n' + (res.texto || 'Análise concluída com sucesso.'),
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Intelligence Hub')
        ].join('\n\n');
        return reply(doc);
    }
};
