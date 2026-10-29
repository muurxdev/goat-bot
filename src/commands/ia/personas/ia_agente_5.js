/**
 * Agente Especialista IA #5: Literatura Clássica
 */
const M = require('../../../utils/moldura');
const iaEngine = require('../../../services/iaEngine');

module.exports = {
    name: 'ia_agente_5',
    aliases: ["agente_ia_5"],
    category: 'general',
    subcategory: 'Consultores Especialistas IA',
    description: 'Consultor especializado em Literatura Clássica (#5)',
    cooldownMs: 3000,
    loreExempt: true,
    execute: async ({ reply, args, text }) => {
        const query = (text || args.join(' ')).trim();
        if (!query) {
            return reply(
                M.cabecalho('🤖', 'Consultor Especialista IA #5') + '\n\n' +
                '🎯 *Especialidade:* Literatura Clássica\n' +
                '💡 *Uso:* Digite `.ia_agente_5 <sua dúvida sobre Literatura Clássica>`'
            );
        }
        await reply('🔬 *Analisando através da ótica de Literatura Clássica...*');
        const prompt = 'Você é um consultor renomado especialista em Literatura Clássica. Responda com rigor conceitual e clareza didática:\n' + query;
        const res = await iaEngine.responder(prompt);
        const doc = [
            M.cabecalho('🤖', 'Consultoria: Literatura Clássica'),
            '📌 *Pergunta:* _"' + query.slice(0, 100) + '"_',
            '💡 *Parecer Especializado:*\n' + (res.texto || 'Análise concluída com sucesso.'),
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Intelligence Hub')
        ].join('\n\n');
        return reply(doc);
    }
};
