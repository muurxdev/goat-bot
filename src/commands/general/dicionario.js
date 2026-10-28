/**
 * Comando .dicionario / .significado / .definicao
 * Consulta definições completas e significados de palavras em Português
 */

const { getDefinicaoDicionario } = require('../../services/apiService');
const { renderCard } = require('../../utils/uiEngine');

module.exports = {
    name: "dicionario",
    aliases: [ "definicao", "dicio", "verbete", "oquesignifica"],
    category: "general",
    description: "Consulta o significado e classe gramatical de qualquer palavra no Dicionário",
    cooldownMs: 2000,
    execute: async ({ text, args, reply, sender }) => {
        const query = (text && text.trim()) || (args && args.join(" ").trim());

        if (!query) {
            return reply("📖 *Uso:* `.dicionario <palavra>`\n👉 *Exemplo:* `.dicionario resiliência` ou `.significado honra`");
        }

        const data = await getDefinicaoDicionario(query);

        if (!data || !data.significados || data.significados.length === 0) {
            return reply(`❌ Não foi possível encontrar a definição para *"${query}"* no dicionário. Verifique a grafia da palavra.`);
        }

        const defFields = data.significados.map((s, i) => `${i + 1}. ${s}`);

        const doc = renderCard({
            title: `DICIONÁRIO: ${data.palavra.toUpperCase()}`,
            icon: "📖",
            subtitle: `📚 *Classe Gramatical:* _${data.classe}_`,
            sections: [
                {
                    title: "SIGNIFICADOS & DEFINIÇÕES",
                    icon: "📝",
                    fields: defFields
                }
            ],
            tip: "Consulte termos, verbos e substantivos para enriquecer seu vocabulário!",
            mentions: [sender]
        });

        return reply(doc, [sender]);
    }
};

