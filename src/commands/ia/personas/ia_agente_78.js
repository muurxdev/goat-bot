/**
 * Agente Especialista IA #78: Química Orgânica
 */
const M = require('../../../utils/moldura');
const iaEngine = require('../../../services/iaEngine');

module.exports = {
    name: 'ia_agente_78',
    aliases: ["agente_ia_78"],
    category: 'general',
    subcategory: 'Consultores Especialistas IA',
    description: 'Consultor especializado em Química Orgânica (#78)',
    cooldownMs: 3000,
    loreExempt: true,
    execute: async ({ reply, args, text }) => {
        const query = (text || args.join(' ')).trim();
        if (!query) {
            return reply(
                M.cabecalho('🤖', 'Consultor Especialista IA #78') + '\n\n' +
                '🎯 *Especialidade:* Química Orgânica\n' +
                '💡 *Uso:* Digite `.ia_agente_78 <sua dúvida sobre Química Orgânica>`'
            );
        }
        await reply('🔬 *Analisando através da ótica de Química Orgânica...*');
        const prompt = 'Você é um consultor renomado especialista em Química Orgânica. Responda com rigor conceitual e clareza didática:\n' + query;
        const res = await iaEngine.responder(prompt);
        const doc = [
            M.cabecalho('🤖', 'Consultoria: Química Orgânica'),
            '📌 *Pergunta:* _"' + query.slice(0, 100) + '"_',
            '💡 *Parecer Especializado:*\n' + (res.texto || 'Análise concluída com sucesso.'),
            M.assinatura('GOAT Intelligence Hub')
        ].join('\n\n');
        return reply(doc);
    }
};
