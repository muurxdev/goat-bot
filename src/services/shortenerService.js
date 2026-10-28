/**
 * Serviço Resiliente de Encurtamento de URLs
 * 
 * Suporta múltiplos provedores com fallback automático:
 * 1. TinyURL (api-create.php)
 * 2. CleanURI (api/v1/shorten)
 * 3. is.gd (create.php)
 * 4. ulvis.net (api.php)
 * 5. v.gd (create.php)
 */

const axios = require('axios');
const logger = require('../core/logger');
const { buscarComSeguranca } = require('./media/urlSeguro');

/**
 * Encurta uma URL usando múltiplos provedores em cascata com fallback resiliente.
 * @param {string} targetUrl URL a ser encurtada
 * @returns {Promise<{shortUrl: string, provider: string, originalUrl: string}>}
 */
async function shortenUrl(targetUrl) {
    let cleanUrl = String(targetUrl || '').trim();
    // Remove aspas, crases, parênteses ou pontuação residual grudada no final
    cleanUrl = cleanUrl.replace(/^["'`(<[]+|[>"'`)\].,;!?*]+$/g, '').trim();
    if (!cleanUrl) {
        throw new Error('URL vazia ou inválida.');
    }

    // Se o usuário digitou sem protocolo (ex: google.com), adiciona https://
    if (!/^https?:\/\//i.test(cleanUrl)) {
        cleanUrl = 'https://' + cleanUrl;
    }

    // 1. Provedor TinyURL (extremamente estável, rápido e aceita Spotify/Drive/YT)
    try {
        const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(cleanUrl)}`, {
            timeout: 8000
        });
        const short = String(res.data || '').trim();
        if (short.startsWith('http://') || short.startsWith('https://')) {
            logger.info(`[SHORTENER] Encurtado com sucesso via TinyURL: ${cleanUrl} -> ${short}`);
            return { shortUrl: short, provider: 'TinyURL', originalUrl: cleanUrl };
        }
    } catch (e) {
        logger.warn(`[SHORTENER] TinyURL falhou (${e.message}), tentando CleanURI...`);
    }

    // 2. Provedor CleanURI
    try {
        const res = await axios.post('https://cleanuri.com/api/v1/shorten', 
            `url=${encodeURIComponent(cleanUrl)}`, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 8000
        });
        if (res.data && res.data.result_url) {
            logger.info(`[SHORTENER] Encurtado com sucesso via CleanURI: ${cleanUrl} -> ${res.data.result_url}`);
            return { shortUrl: res.data.result_url, provider: 'CleanURI', originalUrl: cleanUrl };
        }
    } catch (e) {
        logger.warn(`[SHORTENER] CleanURI falhou (${e.message}), tentando is.gd...`);
    }

    // 3. Provedor is.gd (com validação segura de formato)
    try {
        const res = await axios.get(`https://is.gd/create.php?format=json&url=${encodeURIComponent(cleanUrl)}`, {
            timeout: 8000,
            responseType: 'text'
        });
        const text = String(res.data || '').trim();
        if (text.startsWith('{')) {
            const data = JSON.parse(text);
            if (data.shorturl) {
                logger.info(`[SHORTENER] Encurtado com sucesso via is.gd: ${cleanUrl} -> ${data.shorturl}`);
                return { shortUrl: data.shorturl, provider: 'is.gd', originalUrl: cleanUrl };
            }
        }
    } catch (e) {
        logger.warn(`[SHORTENER] is.gd falhou (${e.message}), tentando ulvis.net...`);
    }

    // 3b. Provedor da.gd (resposta direta rápida e limpa)
    try {
        const res = await axios.get(`https://da.gd/s?url=${encodeURIComponent(cleanUrl)}`, {
            timeout: 6000
        });
        const short = String(res.data || '').trim();
        if (short.startsWith('http://') || short.startsWith('https://')) {
            logger.info(`[SHORTENER] Encurtado com sucesso via da.gd: ${cleanUrl} -> ${short}`);
            return { shortUrl: short, provider: 'da.gd', originalUrl: cleanUrl };
        }
    } catch (e) {
        logger.warn(`[SHORTENER] da.gd falhou (${e.message}), tentando ulvis.net...`);
    }

    // 4. Provedor ulvis.net
    try {
        const res = await axios.get(`https://ulvis.net/api.php?url=${encodeURIComponent(cleanUrl)}&adv=0`, {
            timeout: 8000
        });
        const short = String(res.data || '').trim();
        if (short.startsWith('http://') || short.startsWith('https://')) {
            logger.info(`[SHORTENER] Encurtado com sucesso via ulvis.net: ${cleanUrl} -> ${short}`);
            return { shortUrl: short, provider: 'ulvis.net', originalUrl: cleanUrl };
        }
    } catch (e) {
        logger.warn(`[SHORTENER] ulvis.net falhou (${e.message}), tentando v.gd...`);
    }

    // 5. Provedor v.gd
    try {
        const res = await axios.get(`https://v.gd/create.php?format=json&url=${encodeURIComponent(cleanUrl)}`, {
            timeout: 8000,
            responseType: 'text'
        });
        const text = String(res.data || '').trim();
        if (text.startsWith('{')) {
            const data = JSON.parse(text);
            if (data.shorturl) {
                logger.info(`[SHORTENER] Encurtado com sucesso via v.gd: ${cleanUrl} -> ${data.shorturl}`);
                return { shortUrl: data.shorturl, provider: 'v.gd', originalUrl: cleanUrl };
            }
        }
    } catch (e) {
        logger.error(`[SHORTENER] Todos os 5 provedores falharam: ${e.message}`);
    }

    throw new Error('Não foi possível encurtar esta URL no momento.');
}

/**
 * Expande uma URL encurtada descobrindo seu destino real.
 * @param {string} shortUrl
 * @returns {Promise<{destinationUrl: string, redirected: boolean, status: number}>}
 */
async function expandUrl(shortUrl) {
    let clean = String(shortUrl || '').trim();
    clean = clean.replace(/^["'`(<[]+|[>"'`)\].,;!?*]+$/g, '').trim();
    if (!/^https?:\/\//i.test(clean)) clean = 'https://' + clean;

    // buscarComSeguranca confere cada salto: sem isso um encurtador público podia levar o bot a um IP interno
    const { resposta, destino } = await buscarComSeguranca(clean, {
        method: 'HEAD',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
        },
        signal: AbortSignal.timeout(8000)
    });

    const destinationUrl = destino || clean;
    return {
        destinationUrl,
        redirected: destinationUrl !== clean,
        status: resposta.status
    };
}

module.exports = {
    shortenUrl,
    expandUrl
};

