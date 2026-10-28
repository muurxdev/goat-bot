/**
 * Comando .autorlivro / .autor / .obras
 * Consulta as principais obras, bibliografia e lançamentos de um autor
 */

const { searchBooks } = require('../../services/bookService');
const { renderCard } = require('../../utils/uiEngine');
const logger = require('../../core/logger');
const F = require('../../utils/formato');

module.exports = {
    name: 'autorlivro',
    aliases: ['autor', 'obras', 'obrasautor', 'bibliografia'],
    category: 'livros',
    subcategory: 'Livros & Materiais',
    description: 'Lista as principais obras de um autor',
    usage: '<nome do autor>',
    examples: ['Machado de Assis — obras do autor brasileiro', 'Tolkien — obras de fantasia do autor'],
    cooldownMs: 2000,
    execute: async ({ text, reply, prefix = '.', sender }) => {
        const authorName = (text || '').trim();
        if (!authorName) {
            return reply(`❌ Informe o nome do autor que deseja pesquisar (ex: \`${prefix}autor Machado de Assis\` ou \`${prefix}autor Robert C. Martin\`).`);
        }

        await reply(`⏳ 👤 *Consultando bibliografia de:* _"${authorName}"_...`);

        try {
            const results = await searchBooks(authorName, 6);
            if (!results || results.length === 0) {
                return reply(`📚 *Nenhuma obra encontrada*\n\nNão achei livros de _"${authorName}"_ no acervo.\n\n💡 _Confira a grafia ou tente só o sobrenome, como_ ${F.cmd(prefix, 'autor', 'Assis')}`);
            }

            const fields = results.map((r, idx) => {
                return `*${idx + 1}.* 📖 *${r.title}* (${r.year})\n   └ 🏛️ ${r.edition || r.publisher} | 👤 ${r.author}`;
            });

            const card = renderCard({
                title: "BIBLIOGRAFIA DO AUTOR",
                icon: "👤",
                subtitle: `✒️ *Autor:* ${authorName} (${results.length} obras localizadas)`,
                sections: [
                    {
                        title: "PRINCIPAIS OBRAS CATALOGADAS",
                        icon: "📚",
                        fields
                    }
                ],
                tip: `Para baixar qualquer uma dessas obras, digite: ${prefix}livro <título>`,
                mentions: [sender]
            });

            return reply(card, [sender]);
        } catch (e) {
            logger.error(`[AUTORLIVRO] busca por "${authorName}" falhou: ${e.message}`);
            return reply(`😕 *Não consegui consultar o acervo agora.*\n\nTente de novo em instantes.\n\n📌 *Exemplo:* ${F.cmd(prefix, 'autor', authorName)}`);
        }
    }
};

