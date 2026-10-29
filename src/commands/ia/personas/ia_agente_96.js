/**
 * Agente Especialista IA #96: Gramática Avançada
 */
const M = require('../../../utils/moldura');
const iaEngine = require('../../../services/iaEngine');

module.exports = {
    name: 'ia_agente_96',
    aliases: ["agente_ia_96"],
    category: 'general',
    subcategory: 'Consultores Especialistas IA',
    description: 'Consultor especializado em Gramática Avançada (#96)',
    cooldownMs: 3000,
    loreExempt: true,
    execute: async ({ reply, args, text }) => {
        const query = (text || args.join(' ')).trim();
        if (!query) {
            return reply(
                M.cabecalho('🤖', 'Consultor Especialista IA #96') + '\n\n' +
                '🎯 *Especialidade:* Gramática Avançada\n' +
                '💡 *Uso:* Digite `.ia_agente_96 <sua dúvida sobre Gramática Avançada>`'
            );
        }
        await reply('🔬 *Analisando através da ótica de Gramática Avançada...*');
        const prompt = 'Você é um consultor renomado especialista em Gramática Avançada. Responda com rigor conceitual e clareza didática:\n' + query;
        const res = await iaEngine.responder(prompt);
        const doc = [
            M.cabecalho('🤖', 'Consultoria: Gramática Avançada'),
            '📌 *Pergunta:* _"' + query.slice(0, 100) + '"_',
            '💡 *Parecer Especializado:*\n' + (res.texto || 'Análise concluída com sucesso.'),
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Intelligence Hub')
        ].join('\n\n');
        return reply(doc);
    }
};
