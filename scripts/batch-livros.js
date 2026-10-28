/**
 * Lote 2 — Módulo Livros & Materiais (keyless: Open Library).
 * node scripts/gen-commands.js scripts/batch-livros.js
 * execute serializada (sem closures; require/dados inline). Nascem OFF -> `.modulo on livros`.
 */
const CAT = 'general'
const SUB = 'Livros & Materiais'

module.exports = [
    {
        name: 'buscarlivro', aliases: ['acharlivro', 'procurarlivro'], category: CAT, subcategory: SUB, cooldownMs: 4000,
        description: 'Busca livros por título e lista autor e ano',
        execute: async ({ text, reply }) => {
            const q = String(text || '').trim()
            if (!q) return reply('📚 *Buscar livro*\n\nUso: `.buscarlivro <título>`')
            try {
                const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 12000)
                const r = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=6&fields=title,author_name,first_publish_year`, { signal: ctl.signal, headers: { 'User-Agent': 'Mozilla/5.0' } }); clearTimeout(to)
                const j = await r.json(); const docs = j.docs || []
                if (!docs.length) return reply('📚 Nenhum livro encontrado para: *' + q + '*')
                let doc = `📚 *Resultados para:* ${q}\n\n`
                docs.forEach((d, i) => { doc += `*${i + 1}.* ${d.title}\n✍️ ${(d.author_name || ['Autor desconhecido']).slice(0, 2).join(', ')}${d.first_publish_year ? ' • ' + d.first_publish_year : ''}\n\n` })
                return reply(doc.trim())
            } catch (e) { return reply('❌ Busca de livros indisponível agora.') }
        }
    },
    {
        name: 'livrosautor', aliases: ['livrosdoautor', 'obrasautor'], category: CAT, subcategory: SUB, cooldownMs: 4000,
        description: 'Lista livros de um autor',
        execute: async ({ text, reply }) => {
            const q = String(text || '').trim()
            if (!q) return reply('✍️ *Livros por autor*\n\nUso: `.livrosautor <nome do autor>`')
            try {
                const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 12000)
                const r = await fetch(`https://openlibrary.org/search.json?author=${encodeURIComponent(q)}&limit=8&fields=title,first_publish_year`, { signal: ctl.signal, headers: { 'User-Agent': 'Mozilla/5.0' } }); clearTimeout(to)
                const j = await r.json(); const docs = j.docs || []
                if (!docs.length) return reply('✍️ Nenhum livro encontrado para o autor: *' + q + '*')
                const seen = new Set(); let doc = `✍️ *Livros de:* ${q}\n\n`; let n = 0
                for (const d of docs) { if (seen.has(d.title)) continue; seen.add(d.title); n++; doc += `${n}. ${d.title}${d.first_publish_year ? ' (' + d.first_publish_year + ')' : ''}\n`; if (n >= 8) break }
                return reply(doc.trim())
            } catch (e) { return reply('❌ Serviço indisponível agora.') }
        }
    },
    {
        name: 'livrogenero', aliases: ['livrosgenero', 'generolivro'], category: CAT, subcategory: SUB, cooldownMs: 4000,
        description: 'Lista livros populares de um gênero/assunto (ex.: fantasy, romance, history)',
        execute: async ({ text, reply }) => {
            const q = String(text || '').trim().toLowerCase().replace(/\s+/g, '_')
            if (!q) return reply('🏷️ *Livros por gênero*\n\nUso: `.livrogenero <assunto>`\nEx.: `fantasy`, `romance`, `science_fiction`, `history`')
            try {
                const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 12000)
                const r = await fetch(`https://openlibrary.org/subjects/${encodeURIComponent(q)}.json?limit=8`, { signal: ctl.signal, headers: { 'User-Agent': 'Mozilla/5.0' } }); clearTimeout(to)
                const j = await r.json(); const works = j.works || []
                if (!works.length) return reply('🏷️ Nada encontrado para o gênero: *' + q.replace(/_/g, ' ') + '*\n💡 Tente em inglês (fantasy, romance, history...).')
                let doc = `🏷️ *Gênero:* ${(j.name || q.replace(/_/g, ' '))}\n\n`
                works.slice(0, 8).forEach((w, i) => { doc += `*${i + 1}.* ${w.title}\n✍️ ${(w.authors || []).map(a => a.name).slice(0, 2).join(', ') || '—'}\n\n` })
                return reply(doc.trim())
            } catch (e) { return reply('❌ Serviço indisponível agora.') }
        }
    },
    {
        name: 'capalivro', aliases: ['capa', 'coverlivro'], category: CAT, subcategory: SUB, cooldownMs: 5000,
        description: 'Envia a capa de um livro pelo título',
        execute: async ({ text, reply, client, from, info }) => {
            const q = String(text || '').trim()
            if (!q) return reply('🖼️ *Capa de livro*\n\nUso: `.capalivro <título>`')
            try {
                const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 12000)
                const r = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=1&fields=title,author_name,cover_i,isbn`, { signal: ctl.signal, headers: { 'User-Agent': 'Mozilla/5.0' } }); clearTimeout(to)
                const j = await r.json(); const d = (j.docs || [])[0]
                if (!d) return reply('🖼️ Livro não encontrado: *' + q + '*')
                let cover = d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg` : (d.isbn && d.isbn[0] ? `https://covers.openlibrary.org/b/isbn/${d.isbn[0]}-L.jpg` : null)
                const caption = `📖 *${d.title}*\n✍️ ${(d.author_name || ['—']).slice(0, 2).join(', ')}`
                if (!cover) return reply(caption + '\n\n(sem capa disponível)')
                try { return await client.sendMessage(from, { image: { url: cover }, caption }, { quoted: info }) }
                catch (e2) { return reply(caption + '\n🖼️ ' + cover) }
            } catch (e) { return reply('❌ Serviço indisponível agora.') }
        }
    },
    {
        name: 'isbn', aliases: ['buscarisbn', 'livroisbn'], category: CAT, subcategory: SUB, cooldownMs: 4000,
        description: 'Consulta um livro pelo código ISBN',
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
    },
    {
        name: 'recomendarlivro', aliases: ['indicarlivro', 'livrorecomendado'], category: CAT, subcategory: SUB, cooldownMs: 5000,
        description: 'Recomenda um livro aleatório de um gênero (ou geral)',
        execute: async ({ text, reply }) => {
            const g = String(text || '').trim().toLowerCase().replace(/\s+/g, '_') || ['fantasy', 'romance', 'history', 'science_fiction', 'mystery', 'poetry', 'philosophy'][Math.floor(Math.random() * 7)]
            try {
                const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 12000)
                const r = await fetch(`https://openlibrary.org/subjects/${encodeURIComponent(g)}.json?limit=50`, { signal: ctl.signal, headers: { 'User-Agent': 'Mozilla/5.0' } }); clearTimeout(to)
                const j = await r.json(); const works = j.works || []
                if (!works.length) return reply('📗 Não achei recomendação p/ *' + g.replace(/_/g, ' ') + '*. Tente um gênero em inglês.')
                const w = works[Math.floor(Math.random() * works.length)]
                return reply(`📗 *Recomendação de leitura* (${(j.name || g.replace(/_/g, ' '))})\n\n📖 *${w.title}*\n✍️ ${(w.authors || []).map(a => a.name).slice(0, 2).join(', ') || '—'}${w.first_publish_year ? '\n📅 ' + w.first_publish_year : ''}`)
            } catch (e) { return reply('❌ Serviço indisponível agora.') }
        }
    }
]
