/**
 * Comando .isbn — Consulta um livro pelo código ISBN
 */
module.exports = {
    name: "isbn",
    aliases: ["buscarisbn","livroisbn"],
    category: "general",
    subcategory: "Livros & Materiais",
    description: "Consulta um livro pelo código ISBN",
    cooldownMs: 4000,
    execute: async ({ text, reply }) => {
            const code = String(text || '').replace(/[^0-9Xx]/g, '')
            if (!code || code.length < 10) return reply('🔢 *ISBN*\n\nUso: `.isbn <código ISBN>` (10 ou 13 dígitos)')
            try {
                const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 12000)
                const r = await fetch(`https://openlibrary.org/isbn/${code}.json`, { signal: ctl.signal, headers: { 'User-Agent': 'Mozilla/5.0' } }); clearTimeout(to)
                if (!r.ok) return reply('🔢 ISBN não encontrado: *' + code + '*')
                const b = await r.json()
                let doc = `📘 *${b.title || 'Livro'}*\n\n`
                if (b.subtitle) doc += `_${b.subtitle}_\n`
                if (b.publish_date) doc += `📅 Publicação: ${b.publish_date}\n`
                if (b.number_of_pages) doc += `📄 Páginas: ${b.number_of_pages}\n`
                if (Array.isArray(b.publishers)) doc += `🏢 Editora: ${b.publishers.slice(0, 2).join(', ')}\n`
                doc += `🔢 ISBN: ${code}`
                return reply(doc.trim())
            } catch (e) { return reply('❌ Serviço indisponível agora.') }
        }
};
