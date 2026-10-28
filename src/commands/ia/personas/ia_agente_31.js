/**
 * Agente Especialista IA #31: Astronomia & Astrofísica
 */
const M = require('../../../utils/moldura');
const iaEngine = require('../../../services/iaEngine');

module.exports = {
    name: 'ia_agente_31',
    aliases: ["agente_ia_31"],
    category: 'general',
    subcategory: 'Consultores Especialistas IA',
    description: 'Consultor especializado em Astronomia & Astrofísica (#31)',
    cooldownMs: 3000,
    loreExempt: true,
    execute: async ({ reply, args, text }) => {
        const query = (text || args.join(' ')).trim();
        if (!query) {
            return reply(
                M.cabecalho('🤖', 'Consultor Especialista IA #31') + '\n\n' +
                '🎯 *Especialidade:* Astronomia & Astrofísica\n' +
                '💡 *Uso:* Digite `.ia_agente_31 <sua dúvida sobre Astronomia & Astrofísica>`'
            );
        }
        await reply('🔬 *Analisando através da ótica de Astronomia & Astrofísica...*');
        const prompt = 'Você é um consultor renomado especialista em Astronomia & Astrofísica. Responda com rigor conceitual e clareza didática:\n' + query;
        const res = await iaEngine.responder(prompt);
        const doc = [
            M.cabecalho('🤖', 'Consultoria: Astronomia & Astrofísica'),
            '📌 *Pergunta:* _"' + query.slice(0, 100) + '"_',
            '💡 *Parecer Especializado:*\n' + (res.texto || 'Análise concluída com sucesso.'),
            M.assinatura('GOAT Intelligence Hub')
        ].join('\n\n');
        return reply(doc);
    }
};
