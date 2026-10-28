/**
 * Agente Especialista IA #111: Gramática Avançada
 */
const M = require('../../../utils/moldura');
const iaEngine = require('../../../services/iaEngine');

module.exports = {
    name: 'ia_agente_111',
    aliases: ["agente_ia_111"],
    category: 'general',
    subcategory: 'Consultores Especialistas IA',
    description: 'Consultor especializado em Gramática Avançada (#111)',
    cooldownMs: 3000,
    loreExempt: true,
    execute: async ({ reply, args, text }) => {
        const query = (text || args.join(' ')).trim();
        if (!query) {
            return reply(
                M.cabecalho('🤖', 'Consultor Especialista IA #111') + '\n\n' +
                '🎯 *Especialidade:* Gramática Avançada\n' +
                '💡 *Uso:* Digite `.ia_agente_111 <sua dúvida sobre Gramática Avançada>`'
            );
        }
        await reply('🔬 *Analisando através da ótica de Gramática Avançada...*');
        const prompt = 'Você é um consultor renomado especialista em Gramática Avançada. Responda com rigor conceitual e clareza didática:\n' + query;
        const res = await iaEngine.responder(prompt);
        const doc = [
            M.cabecalho('🤖', 'Consultoria: Gramática Avançada'),
            '📌 *Pergunta:* _"' + query.slice(0, 100) + '"_',
            '💡 *Parecer Especializado:*\n' + (res.texto || 'Análise concluída com sucesso.'),
            M.assinatura('GOAT Intelligence Hub')
        ].join('\n\n');
        return reply(doc);
    }
};
