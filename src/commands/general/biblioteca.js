/**
 * Comando .biblioteca / .acervo / .catalogo
 * Exploração de seções temáticas e recomendações de leitura com Live Wallpaper HD
 */

const { renderCard } = require('../../utils/uiEngine');
const { getBotName } = require('../../config/botConfig');
const { getMenuMedia } = require('../../utils/wallpapers');

module.exports = {
    name: 'biblioteca',
    aliases: ['acervo', 'catalogo', 'secoeslivros', 'estante'],
    category: 'general',
    description: 'Catálogo de seções literárias e recomendações de livros para leitura',
    cooldownMs: 2000,
    execute: async ({ reply, prefix = '.', sender, client, from, info }) => {
        const botName = getBotName();

        const card = renderCard({
            title: "BIBLIOTECA & SEÇÕES LITERÁRIAS",
            icon: "🏛️",
            subtitle: `📚 *Acervo Digital Oficial — ${botName}*`,
            sections: [
                {
                    title: "CATEGORIAS EM DESTAQUE",
                    icon: "📖",
                    fields: [
                        `• 💻 *Tecnologia & Dev:* \`${prefix}livro Clean Code\`, \`${prefix}livro Python\`, \`${prefix}livro JavaScript\``,
                        `• 📜 *Literatura Brasileira:* \`${prefix}livro Dom Casmurro\`, \`${prefix}livro O Cortiço\`, \`${prefix}livro Vidas Secas\``,
                        `• 🚀 *Ficção Científica:* \`${prefix}livro 1984 George Orwell\`, \`${prefix}livro Duna\`, \`${prefix}livro Neuromancer\``,
                        `• ⚔️ *Fantasia Épica:* \`${prefix}livro O Hobbit\`, \`${prefix}livro O Senhor dos Anéis\`, \`${prefix}livro Harry Potter\``,
                        `• 🧠 *Filosofia & Pensamento:* \`${prefix}livro A Arte da Guerra\`, \`${prefix}livro O Príncipe\`, \`${prefix}livro Meditações\``
                    ]
                },
                {
                    title: "COMANDOS DA ÁREA DE ARQUIVOS",
                    icon: "⚙️",
                    fields: [
                        `• \`${prefix}livro <título ou autor>\` ➔ Baixar livro em PDF`,
                        `• \`${prefix}resumo <título>\` ➔ Resumo e sinopse da obra`,
                        `• \`${prefix}autor <nome>\` ➔ Principais obras do autor`
                    ]
                }
            ],
            tip: `Digite ${prefix}livro <nome do livro> para baixar o PDF na hora!`,
            mentions: [sender]
        });

        if (process.env.NODE_ENV === 'test') {
            return reply(card, [sender]);
        }

        const { sendMenuMediaMessage } = require('../../utils/wallpapers');
        return await sendMenuMediaMessage(client, from, {
            category: 'arquivos',
            text: card,
            mentions: [sender],
            quoted: info
        });
    }
};
