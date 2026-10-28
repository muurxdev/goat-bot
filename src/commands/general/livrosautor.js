/**
 * Comando .livrosautor — Lista livros de um autor
 */
module.exports = {
    name: "livrosautor",
    aliases: ["livrosdoautor"],
    category: "livros",
    subcategory: "Livros & Materiais",
    description: "Lista livros catalogados de um autor",
    cooldownMs: 4000,
    execute: async ({ text, reply, prefix = '.' }) => {
        const q = String(text || '').trim();
        if (!q) return reply(`✍️ *Livros por Autor*\n\n📌 *Uso:* \`${prefix}livrosautor <nome do autor>\`\n💡 *Exemplo:* \`${prefix}livrosautor Machado de Assis\``);
        try {
            const ctl = new AbortController();
            const to = setTimeout(() => ctl.abort(), 12000);
            const r = await fetch(`https://openlibrary.org/search.json?author=${encodeURIComponent(q)}&limit=10&fields=title,first_publish_year`, {
                signal: ctl.signal,
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            clearTimeout(to);
            const j = await r.json();
            const docs = j.docs || [];
            if (!docs.length) return reply(`✍️ Nenhum livro encontrado para o autor: *${q}*`);

            const seen = new Set();
            let doc = `╔══════════════════════════════╗\n`;
            doc += `║    ✍️ *OBRAS DO AUTOR* ✍️    ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `👤 *Autor:* ${q}\n\n`;

            let n = 0;
            for (const d of docs) {
                if (!d.title || seen.has(d.title.toLowerCase())) continue;
                seen.add(d.title.toLowerCase());
                n++;
                doc += `*${n}.* 📖 *${d.title}*${d.first_publish_year ? ` (${d.first_publish_year})` : ''}\n`;
                if (n >= 8) break;
            }

            doc += `\n💡 *Dica:* Para baixar qualquer obra, digite: \`${prefix}livro <título>\``;
            return reply(doc.trim());
        } catch (e) {
            return reply('❌ Serviço de autores indisponível agora. Tente novamente mais tarde.');
        }
    }
};
