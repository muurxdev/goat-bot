/**
 * Agente Especialista IA #87: Produção Musical
 */
const M = require('../../../utils/moldura');
const iaEngine = require('../../../services/iaEngine');

module.exports = {
    name: 'ia_agente_87',
    aliases: ["agente_ia_87"],
    category: 'general',
    subcategory: 'Consultores Especialistas IA',
    description: 'Consultor especializado em Produção Musical (#87)',
    cooldownMs: 3000,
    loreExempt: true,
    execute: async ({ reply, args, text }) => {
        const query = (text || args.join(' ')).trim();
        if (!query) {
            return reply(
                M.cabecalho('🤖', 'Consultor Especialista IA #87') + '\n\n' +
                '🎯 *Especialidade:* Produção Musical\n' +
                '💡 *Uso:* Digite `.ia_agente_87 <sua dúvida sobre Produção Musical>`'
            );
        }
        await reply('🔬 *Analisando através da ótica de Produção Musical...*');
        const prompt = 'Você é um consultor renomado especialista em Produção Musical. Responda com rigor conceitual e clareza didática:\n' + query;
        const res = await iaEngine.responder(prompt);
        const doc = [
            M.cabecalho('🤖', 'Consultoria: Produção Musical'),
            '📌 *Pergunta:* _"' + query.slice(0, 100) + '"_',
            '💡 *Parecer Especializado:*\n' + (res.texto || 'Análise concluída com sucesso.'),
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Intelligence Hub')
        ].join('\n\n');
        return reply(doc);
    }
};
