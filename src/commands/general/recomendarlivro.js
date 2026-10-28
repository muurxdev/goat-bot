/**
 * Comando .recomendarlivro — Recomenda um livro aleatório de um gênero (ou geral)
 */
const REC_GENRE_MAP = {
    'fantasia': 'fantasy',
    'romance': 'romance',
    'terror': 'horror',
    'horror': 'horror',
    'ficcao': 'science_fiction',
    'historia': 'history',
    'filosofia': 'philosophy',
    'programacao': 'programming',
    'misterio': 'mystery',
    'poesia': 'poetry',
    'psicologia': 'psychology',
    'aventura': 'adventure'
};

module.exports = {
    name: "recomendarlivro",
    aliases: ["indicarlivro", "livrorecomendado"],
    category: "livros",
    subcategory: "Livros & Materiais",
    description: "Recomenda um livro aleatório de um gênero (ou geral)",
    usage: "[gênero]",
    examples: [" — indicação de qualquer gênero", "fantasia — só livros de fantasia", "misterio — só livros de mistério"],
    cooldownMs: 4000,
    execute: async ({ text, reply, prefix = '.' }) => {
        const raw = String(text || '').trim().toLowerCase();
        const normalized = raw ? raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_') : '';
        const mapped = REC_GENRE_MAP[normalized] || normalized;
        const fallbackList = ['fantasy', 'romance', 'history', 'science_fiction', 'mystery', 'poetry', 'philosophy'];
        const g = mapped || fallbackList[Math.floor(Math.random() * fallbackList.length)];

        try {
            const ctl = new AbortController();
            const to = setTimeout(() => ctl.abort(), 12000);
            const r = await fetch(`https://openlibrary.org/subjects/${encodeURIComponent(g)}.json?limit=50`, {
                signal: ctl.signal,
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            clearTimeout(to);

            const j = await r.json();
            const works = j.works || [];
            if (!works.length) return reply(`📗 *Nenhuma indicação para ${raw || g}*\n\nNão conheço esse gênero ou ele está vazio no acervo.\n\n🏷️ *Tente um destes:* ${Object.keys(REC_GENRE_MAP).join(', ')}\n\n📌 *Exemplo:* \`${prefix}recomendarlivro fantasia\``);

            const w = works[Math.floor(Math.random() * works.length)];
            const authors = (w.authors || []).map(a => a.name).slice(0, 2).join(', ') || 'Autor Desconhecido';

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   📗 *INDICAÇÃO DE LEITURA* 📗  ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `🏷️ *Gênero:* ${j.name || g}\n`;
            doc += `📖 *Título:* ${w.title}\n`;
            doc += `✍️ *Autor:* ${authors}\n`;
            if (w.first_publish_year) doc += `📅 *Lançamento:* ${w.first_publish_year}\n`;
            doc += `\n💡 *Dica:* Para baixar o livro, digite: \`${prefix}livro ${w.title}\``;

            return reply(doc.trim());
        } catch (e) {
            require('../../core/logger').error(`[RECOMENDARLIVRO] consulta do gênero "${g}" falhou: ${e.message}`);
            let doc = '😕 *Não consegui buscar uma indicação agora*\n\n';
            doc += 'O acervo de livros não respondeu. Tente de novo em instantes.\n\n';
            doc += '🏷️ *Gêneros que eu conheço*\n' + Object.keys(REC_GENRE_MAP).join(', ') + '\n\n';
            doc += '👉 *Próximos passos*\n';
            doc += `• \`${prefix}recomendarlivro fantasia\` — tentar de novo com um gênero\n`;
            doc += `• \`${prefix}livro <título>\` — buscar um livro que você já conhece`;
            return reply(doc);
        }
    }
};
