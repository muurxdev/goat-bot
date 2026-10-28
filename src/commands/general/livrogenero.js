/**
 * Comando .livrogenero — Lista livros populares de um gênero/assunto (ex.: romance, fantasia, terror, ficção, história)
 */
const GENRE_MAP = {
    'fantasia': 'fantasy',
    'romance': 'romance',
    'terror': 'horror',
    'horror': 'horror',
    'ficcao': 'science_fiction',
    'ficcao_cientifica': 'science_fiction',
    'programacao': 'programming',
    'desenvolvimento': 'programming',
    'computacao': 'computer_science',
    'historia': 'history',
    'filosofia': 'philosophy',
    'negocios': 'business',
    'administracao': 'business',
    'psicologia': 'psychology',
    'autoajuda': 'self_help',
    'misterio': 'mystery',
    'suspense': 'thriller',
    'aventura': 'adventure',
    'poesia': 'poetry',
    'biografia': 'biography',
    'economia': 'economics'
};

module.exports = {
    name: "livrogenero",
    aliases: ["livrosgenero", "generolivro"],
    category: "livros",
    subcategory: "Livros & Materiais",
    description: "Lista livros populares de um gênero/assunto (ex.: romance, fantasia, terror, ficção, história)",
    cooldownMs: 4000,
    execute: async ({ text, reply, prefix = '.' }) => {
        const raw = String(text || '').trim().toLowerCase();
        if (!raw) {
            return reply(`🏷️ *Livros por Gênero*\n\n📌 *Uso:* \`${prefix}livrogenero <gênero>\`\n💡 *Exemplos:* \`${prefix}livrogenero fantasia\`, \`${prefix}livrogenero romance\`, \`${prefix}livrogenero terror\`, \`${prefix}livrogenero historia\`, \`${prefix}livrogenero programacao\``);
        }

        const normalized = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_');
        const subject = GENRE_MAP[normalized] || normalized;

        try {
            const ctl = new AbortController();
            const to = setTimeout(() => ctl.abort(), 12000);
            const r = await fetch(`https://openlibrary.org/subjects/${encodeURIComponent(subject)}.json?limit=8`, {
                signal: ctl.signal,
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            clearTimeout(to);

            const j = await r.json();
            const works = j.works || [];
            if (!works.length) {
                return reply(`🏷️ Nenhum livro encontrado para o gênero: *${raw}*\n💡 Tente: fantasia, romance, terror, historia, filosofia, programacao...`);
            }

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🏷️ *LIVROS POR GÊNERO* 🏷️   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `📚 *Gênero / Tema:* ${j.name || raw}\n\n`;

            works.slice(0, 8).forEach((w, i) => {
                const authors = (w.authors || []).map(a => a.name).slice(0, 2).join(', ') || 'Autor Clássico';
                doc += `*${i + 1}.* 📖 *${w.title}*\n   └ ✍️ ${authors}\n`;
            });

            doc += `\n💡 *Dica:* Para baixar qualquer obra, digite: \`${prefix}livro <título>\``;
            return reply(doc.trim());
        } catch (e) {
            return reply('❌ Serviço de gêneros indisponível no momento. Tente novamente mais tarde.');
        }
    }
};
