/**
 * Comando .buscarlivro — busca livros na Open Library (sem API key).
 *
 * Antes listava só título/autor/ano. Agora o primeiro resultado vem detalhado:
 * sinopse real (endpoint /works), assuntos, capa e link de leitura quando a obra
 * está liberada no Internet Archive.
 */

module.exports = {
    name: "buscarlivro",
    aliases: ["acharlivro", "procurarlivro"],
    category: "livros",
    subcategory: "Livros & Materiais",
    description: "Busca livros por título e mostra sinopse, capa e onde ler",
    cooldownMs: 4000,
    execute: async ({ text, reply, client, from, info }) => {
        const q = String(text || "").trim();
        if (!q) return reply("📚 *Buscar livro*\n\nUso: `.buscarlivro <título>`\nEx.: `.buscarlivro 1984 Orwell`");

        const buscar = async (url) => {
            const ctl = new AbortController();
            const t = setTimeout(() => ctl.abort(), 12000);
            try {
                const r = await fetch(url, { signal: ctl.signal, headers: { "User-Agent": "Mozilla/5.0" } });
                return r.ok ? await r.json() : null;
            } finally { clearTimeout(t); }
        };

        try {
            const campos = "title,author_name,first_publish_year,key,cover_i,ia,ebook_access,number_of_pages_median,language";
            const j = await buscar(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=5&fields=${campos}`);
            const docs = (j && j.docs) || [];
            if (!docs.length) return reply(`📚 Nenhum livro encontrado para: *${q}*`);

            const d = docs[0];

            // Sinopse e assuntos vêm do registro da OBRA, não da busca.
            let sinopse = null, assuntos = [];
            if (d.key) {
                const w = await buscar(`https://openlibrary.org${d.key}.json`).catch(() => null);
                if (w) {
                    sinopse = typeof w.description === "string" ? w.description : (w.description && w.description.value) || null;
                    assuntos = Array.isArray(w.subjects) ? w.subjects.slice(0, 5) : [];
                }
            }

            let doc = "╔══════════════════════════════╗\n";
            doc += "║      📚 *BUSCA DE LIVRO* 📚      ║\n";
            doc += "╚══════════════════════════════╝\n\n";
            doc += `📖 *${d.title}*\n`;
            doc += `✍️ ${(d.author_name || ["Autor desconhecido"]).slice(0, 2).join(", ")}\n`;
            if (d.first_publish_year) doc += `📅 Publicado em ${d.first_publish_year}\n`;
            if (d.number_of_pages_median) doc += `📄 ~${d.number_of_pages_median} páginas\n`;
            if (assuntos.length) doc += `🏷️ ${assuntos.join(" · ")}\n`;

            if (sinopse) {
                const limpa = sinopse.replace(/\r/g, "").split("\n")[0].trim();
                doc += `\n╭━〔 📝 SINOPSE 〕━⬣\n${limpa.slice(0, 600)}${limpa.length > 600 ? "…" : ""}\n╰━━━━━━━━━━━━━━━━━━⬣\n`;
            }

            // Leitura gratuita quando a obra está no Internet Archive.
            const iaId = Array.isArray(d.ia) ? d.ia[0] : null;
            if (iaId && d.ebook_access && d.ebook_access !== "no_ebook") {
                const rotulo = d.ebook_access === "public" ? "Ler grátis" : "Ler (empréstimo)";
                doc += `\n📗 *${rotulo}:* https://archive.org/details/${iaId}\n`;
            }
            if (d.key) doc += `🔗 *Ficha:* https://openlibrary.org${d.key}\n`;

            if (docs.length > 1) {
                doc += `\n╭━〔 📋 OUTROS RESULTADOS 〕━⬣\n`;
                docs.slice(1, 5).forEach((o, i) => {
                    doc += `┃ ${i + 2}. ${o.title}${o.first_publish_year ? ` (${o.first_publish_year})` : ""}\n`;
                });
                doc += `╰━━━━━━━━━━━━━━━━━━⬣\n`;
            }
            doc += `\n💡 _Capa:_ \`.capalivro ${q}\` · _Mais do autor:_ \`.livrosautor <nome>\``;

            // Envia com a capa quando existir; se falhar, manda só o texto.
            const capa = d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg` : null;
            if (capa && client && from) {
                try {
                    return await client.sendMessage(from, { image: { url: capa }, caption: doc.trim() }, { quoted: info });
                } catch (e) { /* cai para texto */ }
            }
            return reply(doc.trim());
        } catch (e) {
            return reply("❌ Busca de livros indisponível agora. Tente novamente em instantes.");
        }
    }
};
