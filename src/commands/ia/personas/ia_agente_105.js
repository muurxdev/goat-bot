/**
 * Agente Especialista IA #105: Gestão de Projetos Ágeis
 */
const M = require('../../../utils/moldura');
const iaEngine = require('../../../services/iaEngine');

module.exports = {
    name: 'ia_agente_105',
    aliases: ["agente_ia_105"],
    category: 'general',
    subcategory: 'Consultores Especialistas IA',
    description: 'Consultor especializado em Gestão de Projetos Ágeis (#105)',
    cooldownMs: 3000,
    loreExempt: true,
    execute: async ({ reply, args, text }) => {
        const query = (text || args.join(' ')).trim();
        if (!query) {
            return reply(
                M.cabecalho('🤖', 'Consultor Especialista IA #105') + '\n\n' +
                '🎯 *Especialidade:* Gestão de Projetos Ágeis\n' +
                '💡 *Uso:* Digite `.ia_agente_105 <sua dúvida sobre Gestão de Projetos Ágeis>`'
            );
        }
        await reply('🔬 *Analisando através da ótica de Gestão de Projetos Ágeis...*');
        const prompt = 'Você é um consultor renomado especialista em Gestão de Projetos Ágeis. Responda com rigor conceitual e clareza didática:\n' + query;
        const res = await iaEngine.responder(prompt);
        const doc = [
            M.cabecalho('🤖', 'Consultoria: Gestão de Projetos Ágeis'),
            '📌 *Pergunta:* _"' + query.slice(0, 100) + '"_',
            '💡 *Parecer Especializado:*\n' + (res.texto || 'Análise concluída com sucesso.'),
            M.assinatura('GOAT Intelligence Hub')
        ].join('\n\n');
        return reply(doc);
    }
};
