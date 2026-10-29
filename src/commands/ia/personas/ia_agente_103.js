/**
 * Agente Especialista IA #103: Fotografia Profissional
 */
const M = require('../../../utils/moldura');
const iaEngine = require('../../../services/iaEngine');

module.exports = {
    name: 'ia_agente_103',
    aliases: ["agente_ia_103"],
    category: 'general',
    subcategory: 'Consultores Especialistas IA',
    description: 'Consultor especializado em Fotografia Profissional (#103)',
    cooldownMs: 3000,
    loreExempt: true,
    execute: async ({ reply, args, text }) => {
        const query = (text || args.join(' ')).trim();
        if (!query) {
            return reply(
                M.cabecalho('🤖', 'Consultor Especialista IA #103') + '\n\n' +
                '🎯 *Especialidade:* Fotografia Profissional\n' +
                '💡 *Uso:* Digite `.ia_agente_103 <sua dúvida sobre Fotografia Profissional>`'
            );
        }
        await reply('🔬 *Analisando através da ótica de Fotografia Profissional...*');
        const prompt = 'Você é um consultor renomado especialista em Fotografia Profissional. Responda com rigor conceitual e clareza didática:\n' + query;
        const res = await iaEngine.responder(prompt);
        const doc = [
            M.cabecalho('🤖', 'Consultoria: Fotografia Profissional'),
            '📌 *Pergunta:* _"' + query.slice(0, 100) + '"_',
            '💡 *Parecer Especializado:*\n' + (res.texto || 'Análise concluída com sucesso.'),
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Intelligence Hub')
        ].join('\n\n');
        return reply(doc);
    }
};
