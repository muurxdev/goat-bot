/**
 * Comando .noticias / .news / .noticia
 * Notícias e Artigos de Tecnologia em Tempo Real (TabNews & G1)
 */

const logger = require('../../core/logger');

let cacheNoticias = {
    tech: { data: null, at: 0 },
    geral: { data: null, at: 0 }
};

const CACHE_TTL = 10 * 60 * 1000; // 10 minutos

async function getTabNews() {
    if (cacheNoticias.tech.data && (Date.now() - cacheNoticias.tech.at < CACHE_TTL)) {
        return cacheNoticias.tech.data;
    }
    try {
        const res = await fetch('https://www.tabnews.com.br/api/v1/contents?strategy=relevant&page=1&per_page=5', {
            signal: AbortSignal.timeout(6000),
            headers: { 'User-Agent': '➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤/2.0' }
        });
        if (res.ok) {
            const items = await res.json();
            const formatadas = items.map(item => ({
                emoji: '💻',
                categoria: 'Tecnologia / Dev',
                titulo: item.title,
                autor: item.owner_username,
                pontos: item.tabcoins,
                comentarios: item.children_deep_count,
                link: `https://www.tabnews.com.br/${item.owner_username}/${item.slug}`
            }));
            cacheNoticias.tech = { data: formatadas, at: Date.now() };
            return formatadas;
        }
    } catch (e) {
        logger.warn(`[NOTICIAS] TabNews falhou: ${e.message}`);
    }
    return cacheNoticias.tech.data || [];
}

async function getG1News() {
    if (cacheNoticias.geral.data && (Date.now() - cacheNoticias.geral.at < CACHE_TTL)) {
        return cacheNoticias.geral.data;
    }
    try {
        const res = await fetch('https://g1.globo.com/rss/g1/tecnologia/', {
            signal: AbortSignal.timeout(6000),
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        if (res.ok) {
            const xml = await res.text();
            const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 5);
            const formatadas = [];
            for (const item of items) {
                const titleMatch = item[1].match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || item[1].match(/<title>([\s\S]*?)<\/title>/);
                const linkMatch = item[1].match(/<link>([\s\S]*?)<\/link>/);
                if (titleMatch) {
                    formatadas.push({
                        emoji: '🌐',
                        categoria: 'G1 Tech',
                        titulo: titleMatch[1].replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim(),
                        link: linkMatch ? linkMatch[1].trim() : ''
                    });
                }
            }
            if (formatadas.length > 0) {
                cacheNoticias.geral = { data: formatadas, at: Date.now() };
                return formatadas;
            }
        }
    } catch (e) {
        logger.warn(`[NOTICIAS] G1 RSS falhou: ${e.message}`);
    }
    return cacheNoticias.geral.data || [];
}

module.exports = {
    name: 'noticias',
    aliases: ['news', 'noticia', 'noticiasdehoje'],
    category: 'general',
    subcategory: 'Informação',
    description: 'Exibe as últimas notícias em tempo real de Tecnologia e Geral',
    cooldownMs: 15000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const sub = (args[0] || '').toLowerCase().trim();

        if (sub === 'g1' || sub === 'geral') {
            const lista = await getG1News();
            if (!lista.length) {
                return reply('❌ Não foi possível carregar as notícias do G1 no momento. Tente novamente em instantes.');
            }
            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🌐 *ÚLTIMAS DO G1 TECH* 🌐   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            lista.forEach((n, idx) => {
                doc += `${idx + 1}. *${n.titulo}*\n`;
                if (n.link) doc += `   🔗 ${n.link}\n`;
                doc += `\n`;
            });
            doc += `💡 _Atualizado em tempo real via G1 Tecnologia._`;
            return reply(doc.trim());
        }

        // Padrão: TabNews (Tech, Programação, Comunidade de Devs)
        const lista = await getTabNews();
        if (!lista.length) {
            // Se TabNews falhar, fallback para G1
            const fallbackG1 = await getG1News();
            if (fallbackG1.length) {
                let doc = `╔══════════════════════════════╗\n`;
                doc += `║  📰 *NOTÍCIAS DE TECNOLOGIA*  ║\n`;
                doc += `╚══════════════════════════════╝\n\n`;
                fallbackG1.forEach((n, idx) => {
                    doc += `• *${n.titulo}*\n  🔗 ${n.link}\n\n`;
                });
                return reply(doc.trim());
            }
            return reply('❌ Servidores de notícias indisponíveis no momento. Tente em instantes!');
        }

        let doc = `╔══════════════════════════════════╗\n`;
        doc += `║  💻 *DESTAQUES TECH // SKYCODE*  ║\n`;
        doc += `╚══════════════════════════════════╝\n\n`;
        lista.forEach((n, idx) => {
            doc += `*${idx + 1}.* 🚀 *${n.titulo}*\n`;
            doc += `   👤 *Autor:* ${n.autor} | ⭐ *${n.pontos}* tabcoins | 💬 *${n.comentarios}* respostas\n`;
            doc += `   🔗 ${n.link}\n\n`;
        });
        doc += `💡 _Dica: Use \`${prefix}noticias g1\` para notícias da grande mídia._`;
        return reply(doc.trim());
    }
};
