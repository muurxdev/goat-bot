/**
 * Serviço de Raspagem de Números SMS Públicos Gratuitos (Free Scraper)
 * 
 * Coleta números públicos ativos e monitora caixas de entrada para recepção de SMS
 * do WhatsApp/Meta em tempo real sem necessidade de API Key ou pagamento.
 */

const axios = require('axios');
const logger = require('../core/logger');

let cacheNumbers = [];
let lastCacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos de cache

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

/**
 * Busca números públicos ativos disponíveis
 * @param {boolean} [forceRefresh=false]
 * @returns {Promise<Array<{raw: string, formatted: string, country: string, ddi: string, flag: string, name: string, url: string}>>}
 */
async function getPublicNumbers(forceRefresh = false) {
    const now = Date.now();
    if (!forceRefresh && cacheNumbers.length > 0 && (now - lastCacheTime) < CACHE_TTL_MS) {
        return cacheNumbers;
    }

    const pages = [
        { url: 'https://anonymsms.com/', country: 'ALL' },
        { url: 'https://anonymsms.com/united-states/', country: 'US' },
        { url: 'https://anonymsms.com/united-kingdom/', country: 'GB' },
        { url: 'https://anonymsms.com/georgia/', country: 'GE' },
        { url: 'https://anonymsms.com/ukraine/', country: 'UA' }
    ];

    const results = [];

    for (const p of pages) {
        try {
            const res = await axios.get(p.url, {
                headers: { 'User-Agent': USER_AGENT },
                timeout: 8000
            });
            const html = String(res.data || '');
            const matches = [...html.matchAll(/href=["'](?:https?:\/\/anonymsms\.com)?\/number\/(\d{8,15})\/?["']/gi)];

            for (const m of matches) {
                const raw = m[1];
                if (results.some(n => n.raw === raw)) continue;

                let country = 'US';
                let ddi = '1';
                let flag = '🇺🇸';
                let name = 'Estados Unidos';

                if (raw.startsWith('44')) {
                    country = 'GB';
                    ddi = '44';
                    flag = '🇬🇧';
                    name = 'Reino Unido';
                } else if (raw.startsWith('46')) {
                    country = 'SE';
                    ddi = '46';
                    flag = '🇸🇪';
                    name = 'Suécia';
                } else if (raw.startsWith('61')) {
                    country = 'AU';
                    ddi = '61';
                    flag = '🇦🇺';
                    name = 'Austrália';
                } else if (raw.startsWith('995')) {
                    country = 'GE';
                    ddi = '995';
                    flag = '🇬🇪';
                    name = 'Geórgia';
                } else if (raw.startsWith('380')) {
                    country = 'UA';
                    ddi = '380';
                    flag = '🇺🇦';
                    name = 'Ucrânia';
                } else if (raw.startsWith('33')) {
                    country = 'FR';
                    ddi = '33';
                    flag = '🇫🇷';
                    name = 'França';
                }

                results.push({
                    raw,
                    formatted: `+${raw}`,
                    country,
                    ddi,
                    flag,
                    name,
                    url: `https://anonymsms.com/number/${raw}/`
                });
            }
        } catch (err) {
            logger.warn(`[FREE SMS] Falha ao raspar ${p.url}: ${err.message}`);
        }
    }

    if (results.length > 0) {
        cacheNumbers = results;
        lastCacheTime = now;
        logger.info(`[FREE SMS] ${results.length} números públicos gratuitos carregados no catálogo.`);
    }

    return results.length > 0 ? results : cacheNumbers;
}

/**
 * Raspa a caixa de entrada de um número público específico em tempo real
 * @param {string} numberUrl URL do número na web
 * @returns {Promise<{success: boolean, messages: Array<object>, latestCode: string|null, isWhatsApp: boolean}>}
 */
async function scrapeNumberInbox(numberUrl) {
    if (!numberUrl) {
        return { success: false, messages: [], latestCode: null, isWhatsApp: false };
    }

    try {
        const res = await axios.get(numberUrl, {
            headers: { 'User-Agent': USER_AGENT },
            timeout: 10000
        });
        const html = String(res.data || '');
        const messages = [];

        // Linhas da tabela de mensagens: <tr data-message="..."> ... <td>Sender</td> <td class="table-panel__message">Texto</td> <td>Data</td>
        const rows = [...html.matchAll(/<tr[^>]*data-message=["'](\d+)["'][^>]*>([\s\S]*?)<\/tr>/gi)];

        let latestCode = null;
        let isWhatsApp = false;

        for (const r of rows) {
            const rowContent = r[2];
            const senderMatch = rowContent.match(/<td>([^<]+)<\/td>/i);
            const msgMatch = rowContent.match(/<td[^>]*class="[^"]*message[^"]*"[^>]*>([\s\S]*?)<\/td>/i);
            const timeMatch = rowContent.match(/<td>([^<]+ago)<\/td>/i);

            if (msgMatch) {
                const text = msgMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
                const sender = senderMatch ? senderMatch[1].trim() : 'Desconhecido';
                const time = timeMatch ? timeMatch[1].trim() : '';

                const waCheck = /whatsapp|meta/i.test(text) || /whatsapp|meta/i.test(sender);
                let code = null;

                // Extração de código de 6 dígitos (ex: 123-456 ou 123456 ou =123456)
                const codeMatch = text.match(/\b\d{3}[-\s]?\d{3}\b/) || text.match(/=(\d{6})/);
                if (codeMatch) {
                    code = codeMatch[1] || codeMatch[0];
                }

                if (waCheck && code && !latestCode) {
                    latestCode = code;
                    isWhatsApp = true;
                }

                messages.push({
                    id: r[1],
                    sender,
                    text,
                    time,
                    isWhatsApp: waCheck,
                    code
                });
            }
        }

        return {
            success: true,
            messages,
            latestCode,
            isWhatsApp
        };
    } catch (err) {
        logger.error(`[FREE SMS] Falha ao raspar inbox (${numberUrl}): ${err.message}`);
        return { success: false, messages: [], latestCode: null, isWhatsApp: false, error: err.message };
    }
}

module.exports = {
    getPublicNumbers,
    scrapeNumberInbox
};
