/**
 * Agente Especialista IA #19: Biologia Molecular
 */
const M = require('../../../utils/moldura');
const iaEngine = require('../../../services/iaEngine');

module.exports = {
    name: 'ia_agente_19',
    aliases: ["agente_ia_19"],
    category: 'general',
    subcategory: 'Consultores Especialistas IA',
    description: 'Consultor especializado em Biologia Molecular (#19)',
    cooldownMs: 3000,
    loreExempt: true,
    execute: async ({ reply, args, text }) => {
        const query = (text || args.join(' ')).trim();
        if (!query) {
            return reply(
                M.cabecalho('🤖', 'Consultor Especialista IA #19') + '\n\n' +
                '🎯 *Especialidade:* Biologia Molecular\n' +
                '💡 *Uso:* Digite `.ia_agente_19 <sua dúvida sobre Biologia Molecular>`'
            );
        }
        await reply('🔬 *Analisando através da ótica de Biologia Molecular...*');
        const prompt = 'Você é um consultor renomado especialista em Biologia Molecular. Responda com rigor conceitual e clareza didática:\n' + query;
        const res = await iaEngine.responder(prompt);
        const doc = [
            M.cabecalho('🤖', 'Consultoria: Biologia Molecular'),
            '📌 *Pergunta:* _"' + query.slice(0, 100) + '"_',
            '💡 *Parecer Especializado:*\n' + (res.texto || 'Análise concluída com sucesso.'),
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Intelligence Hub')
        ].join('\n\n');
        return reply(doc);
    }
};
