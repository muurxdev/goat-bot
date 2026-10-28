/**
 * Agente Especialista IA #102: Produção Musical
 */
const M = require('../../../utils/moldura');
const iaEngine = require('../../../services/iaEngine');

module.exports = {
    name: 'ia_agente_102',
    aliases: ["agente_ia_102"],
    category: 'general',
    subcategory: 'Consultores Especialistas IA',
    description: 'Consultor especializado em Produção Musical (#102)',
    cooldownMs: 3000,
    loreExempt: true,
    execute: async ({ reply, args, text }) => {
        const query = (text || args.join(' ')).trim();
        if (!query) {
            return reply(
                M.cabecalho('🤖', 'Consultor Especialista IA #102') + '\n\n' +
                '🎯 *Especialidade:* Produção Musical\n' +
                '💡 *Uso:* Digite `.ia_agente_102 <sua dúvida sobre Produção Musical>`'
            );
        }
        await reply('🔬 *Analisando através da ótica de Produção Musical...*');
        const prompt = 'Você é um consultor renomado especialista em Produção Musical. Responda com rigor conceitual e clareza didática:\n' + query;
        const res = await iaEngine.responder(prompt);
        const doc = [
            M.cabecalho('🤖', 'Consultoria: Produção Musical'),
            '📌 *Pergunta:* _"' + query.slice(0, 100) + '"_',
            '💡 *Parecer Especializado:*\n' + (res.texto || 'Análise concluída com sucesso.'),
            M.assinatura('GOAT Intelligence Hub')
        ].join('\n\n');
        return reply(doc);
    }
};
