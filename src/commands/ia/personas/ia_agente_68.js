/**
 * Agente Especialista IA #68: Desenvolvimento Mobile
 */
const M = require('../../../utils/moldura');
const iaEngine = require('../../../services/iaEngine');

module.exports = {
    name: 'ia_agente_68',
    aliases: ["agente_ia_68"],
    category: 'general',
    subcategory: 'Consultores Especialistas IA',
    description: 'Consultor especializado em Desenvolvimento Mobile (#68)',
    cooldownMs: 3000,
    loreExempt: true,
    execute: async ({ reply, args, text }) => {
        const query = (text || args.join(' ')).trim();
        if (!query) {
            return reply(
                M.cabecalho('🤖', 'Consultor Especialista IA #68') + '\n\n' +
                '🎯 *Especialidade:* Desenvolvimento Mobile\n' +
                '💡 *Uso:* Digite `.ia_agente_68 <sua dúvida sobre Desenvolvimento Mobile>`'
            );
        }
        await reply('🔬 *Analisando através da ótica de Desenvolvimento Mobile...*');
        const prompt = 'Você é um consultor renomado especialista em Desenvolvimento Mobile. Responda com rigor conceitual e clareza didática:\n' + query;
        const res = await iaEngine.responder(prompt);
        const doc = [
            M.cabecalho('🤖', 'Consultoria: Desenvolvimento Mobile'),
            '📌 *Pergunta:* _"' + query.slice(0, 100) + '"_',
            '💡 *Parecer Especializado:*\n' + (res.texto || 'Análise concluída com sucesso.'),
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Intelligence Hub')
        ].join('\n\n');
        return reply(doc);
    }
};
