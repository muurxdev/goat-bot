/**
 * Agente Especialista IA #88: Fotografia Profissional
 */
const M = require('../../../utils/moldura');
const iaEngine = require('../../../services/iaEngine');

module.exports = {
    name: 'ia_agente_88',
    aliases: ["agente_ia_88"],
    category: 'general',
    subcategory: 'Consultores Especialistas IA',
    description: 'Consultor especializado em Fotografia Profissional (#88)',
    cooldownMs: 3000,
    loreExempt: true,
    execute: async ({ reply, args, text }) => {
        const query = (text || args.join(' ')).trim();
        if (!query) {
            return reply(
                M.cabecalho('🤖', 'Consultor Especialista IA #88') + '\n\n' +
                '🎯 *Especialidade:* Fotografia Profissional\n' +
                '💡 *Uso:* Digite `.ia_agente_88 <sua dúvida sobre Fotografia Profissional>`'
            );
        }
        await reply('🔬 *Analisando através da ótica de Fotografia Profissional...*');
        const prompt = 'Você é um consultor renomado especialista em Fotografia Profissional. Responda com rigor conceitual e clareza didática:\n' + query;
        const res = await iaEngine.responder(prompt);
        const doc = [
            M.cabecalho('🤖', 'Consultoria: Fotografia Profissional'),
            '📌 *Pergunta:* _"' + query.slice(0, 100) + '"_',
            '💡 *Parecer Especializado:*\n' + (res.texto || 'Análise concluída com sucesso.'),
            M.assinatura('GOAT Intelligence Hub')
        ].join('\n\n');
        return reply(doc);
    }
};
