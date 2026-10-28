/**
 * Agente Especialista IA #67: Criptoeconomia
 */
const M = require('../../../utils/moldura');
const iaEngine = require('../../../services/iaEngine');

module.exports = {
    name: 'ia_agente_67',
    aliases: ["agente_ia_67"],
    category: 'general',
    subcategory: 'Consultores Especialistas IA',
    description: 'Consultor especializado em Criptoeconomia (#67)',
    cooldownMs: 3000,
    loreExempt: true,
    execute: async ({ reply, args, text }) => {
        const query = (text || args.join(' ')).trim();
        if (!query) {
            return reply(
                M.cabecalho('🤖', 'Consultor Especialista IA #67') + '\n\n' +
                '🎯 *Especialidade:* Criptoeconomia\n' +
                '💡 *Uso:* Digite `.ia_agente_67 <sua dúvida sobre Criptoeconomia>`'
            );
        }
        await reply('🔬 *Analisando através da ótica de Criptoeconomia...*');
        const prompt = 'Você é um consultor renomado especialista em Criptoeconomia. Responda com rigor conceitual e clareza didática:\n' + query;
        const res = await iaEngine.responder(prompt);
        const doc = [
            M.cabecalho('🤖', 'Consultoria: Criptoeconomia'),
            '📌 *Pergunta:* _"' + query.slice(0, 100) + '"_',
            '💡 *Parecer Especializado:*\n' + (res.texto || 'Análise concluída com sucesso.'),
            M.assinatura('GOAT Intelligence Hub')
        ].join('\n\n');
        return reply(doc);
    }
};
