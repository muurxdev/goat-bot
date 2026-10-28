/**
 * Comando .resumolivro / .sinopse / .resumo
 * Consulta inteligente de sinopses e resumos estruturados de obras literárias
 */

const { searchBooks } = require('../../services/bookService');
const { renderCard } = require('../../utils/uiEngine');
const logger = require('../../core/logger');
const F = require('../../utils/formato');

module.exports = {
    name: 'resumolivro',
    aliases: ['sinopse', 'sinopselivro', 'resumir'],
    category: 'livros',
    subcategory: 'Livros & Materiais',
    description: 'Mostra a sinopse e a ficha de um livro',
    usage: '<título ou autor>',
    examples: ['O Pequeno Príncipe — sinopse e ficha da obra', 'Dom Casmurro — clássico de Machado de Assis'],
    cooldownMs: 2000,
    execute: async ({ text, reply, prefix = '.', sender }) => {
        const query = (text || '').trim();
        if (!query) {
            return reply(`❌ Informe o nome do livro ou autor para ver o resumo (ex: \`${prefix}resumolivro O Pequeno Príncipe\` ou \`${prefix}resumolivro Clean Code\`).`);
        }

        await reply(`⏳ 🔍 *Pesquisando sinopse e resumo de:* _"${query}"_...`);

        try {
            const results = await searchBooks(query, 3);
            if (!results || results.length === 0) {
                return reply(`📖 *Nenhuma sinopse encontrada*\n\nNão achei _"${query}"_ no acervo.\n\n💡 _Tente o título original ou o nome do autor, como_ ${F.cmd(prefix, 'resumolivro', 'Dom Casmurro')}`);
            }

            const book = results[0];
            const card = renderCard({
                title: "RESUMO & SINOPSE DA OBRA",
                icon: "📖",
                subtitle: `📚 *${book.title}*`,
                sections: [
                    {
                        title: "FICHA TÉCNICA",
                        icon: "📋",
                        fields: [
                            { label: "Autor(es)", value: book.author, icon: "👤" },
                            { label: "Ano de Publicação", value: book.year, icon: "📅" },
                            { label: "Edição / Editora", value: book.edition || book.publisher, icon: "🏛️" },
                            { label: "Páginas", value: book.pages || 'N/A', icon: "📄" }
                        ]
                    },
                    {
                        title: "SINOPSE DA HISTÓRIA",
                        icon: "📝",
                        fields: [
                            book.description || 'Resumo e sinopse disponíveis nos acervos literários internacionais.'
                        ]
                    }
                ],
                tip: `Para baixar o PDF completo, digite: ${prefix}livro ${book.title}`,
                mentions: [sender]
            });

            return reply(card, [sender]);
        } catch (e) {
            logger.error(`[RESUMOLIVRO] busca por "${query}" falhou: ${e.message}`);
            return reply(`😕 *Não consegui consultar o acervo agora.*\n\nTente de novo em instantes.\n\n📌 *Exemplo:* ${F.cmd(prefix, 'resumolivro', query)}`);
        }
    }
};

