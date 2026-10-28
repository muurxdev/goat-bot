/**
 * IA Persona: Arquiteto de Software Sênior
 */
const { talkToPersona, getPersona } = require('../../../services/aiPersonaService');
const M = require('../../../utils/moldura');

module.exports = {
    name: 'ia_dev_senior',
    aliases: ["falar_dev"],
    category: 'general',
    subcategory: 'Personas de IA',
    description: 'Converse com a personalidade interativa de Arquiteto de Software Sênior',
    cooldownMs: 3000,
    loreExempt: true,
    execute: async ({ reply, args, text }) => {
        const query = (text || args.join(' ')).trim();
        const persona = getPersona('dev');
        if (!query) {
            return reply(
                M.cabecalho(persona.emoji, persona.name) + '\n\n' +
                '👑 *Título:* ' + persona.title + '\n' +
                '💬 *Frase:* _"' + persona.quote + '"_\n\n' +
                '💡 *Como conversar:* Digite `.ia_dev_senior <sua mensagem ou pergunta>` para bater papo!'
            );
        }
        await reply('🧠 *' + persona.name + ' está pensando...*');
        const resp = await talkToPersona('dev', query);
        const doc = [
            M.cabecalho(persona.emoji, persona.name),
            '💬 *Resposta:*\n' + resp,
            M.assinatura(persona.title)
        ].join('\n\n');
        return reply(doc);
    }
};
