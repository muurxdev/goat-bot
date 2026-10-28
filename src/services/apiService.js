/**
 * Resilient Multi-Provider API Service
 * Central de integrações externas com fallbacks (Cotações, Clima, Tradução, Dicionário, QR Code)
 */

const logger = require('../core/logger');

/**
 * 1. COTAÇÕES DE MOEDAS & CRIPTO EM TEMPO REAL
 */
async function getCotacoes() {
    try {
        const res = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL,ETH-BRL', {
            signal: AbortSignal.timeout(6000)
        });
        if (res.ok) {
            const data = await res.json();
            return {
                usd: {
                    nome: 'Dólar Americano',
                    valor: parseFloat(data.USDBRL?.bid || 0),
                    variacao: parseFloat(data.USDBRL?.pctChange || 0),
                    max: parseFloat(data.USDBRL?.high || 0),
                    min: parseFloat(data.USDBRL?.low || 0)
                },
                eur: {
                    nome: 'Euro',
                    valor: parseFloat(data.EURBRL?.bid || 0),
                    variacao: parseFloat(data.EURBRL?.pctChange || 0),
                    max: parseFloat(data.EURBRL?.high || 0),
                    min: parseFloat(data.EURBRL?.low || 0)
                },
                btc: {
                    nome: 'Bitcoin',
                    valor: parseFloat(data.BTCBRL?.bid || 0),
                    variacao: parseFloat(data.BTCBRL?.pctChange || 0),
                    max: parseFloat(data.BTCBRL?.high || 0),
                    min: parseFloat(data.BTCBRL?.low || 0)
                },
                eth: {
                    nome: 'Ethereum',
                    valor: parseFloat(data.ETHBRL?.bid || 0),
                    variacao: parseFloat(data.ETHBRL?.pctChange || 0),
                    max: parseFloat(data.ETHBRL?.high || 0),
                    min: parseFloat(data.ETHBRL?.low || 0)
                },
                atualizadoEm: new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' })
            };
        }
    } catch (err) {
        logger.warn(`[API COTACOES WARN] ${err.message}`);
    }

    return null;
}

/**
 * 2. CLIMA & PREVISÃO DO TEMPO EM TEMPO REAL (Open-Meteo)
 */
async function getClima(cidade) {
    if (!cidade || typeof cidade !== 'string') return null;

    try {
        // Geocoding
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&format=json`;
        const geoRes = await fetch(geoUrl, { signal: AbortSignal.timeout(5000) });
        if (!geoRes.ok) return null;
        const geoData = await geoRes.json();
        if (!geoData.results || geoData.results.length === 0) return null;

        const loc = geoData.results[0];
        const lat = loc.latitude;
        const lon = loc.longitude;
        const localNome = `${loc.name}, ${loc.admin1 || loc.country || ''}`.trim();

        // Dados meteorológicos
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=auto`;
        const wRes = await fetch(weatherUrl, { signal: AbortSignal.timeout(6000) });
        if (!wRes.ok) return null;
        const wData = await wRes.json();
        const cur = wData.current || {};

        const weatherCodes = {
            0: { desc: 'Céu limpo ☀️', icon: '☀️' },
            1: { desc: 'Principalmente limpo 🌤️', icon: '🌤️' },
            2: { desc: 'Parcialmente nublado ⛅', icon: '⛅' },
            3: { desc: 'Nublado ☁️', icon: '☁️' },
            45: { desc: 'Nevoeiro 🌫️', icon: '🌫️' },
            48: { desc: 'Nevoeiro com geada 🌫️', icon: '🌫️' },
            51: { desc: 'Garoa leve 🌦️', icon: '🌦️' },
            61: { desc: 'Chuva leve 🌧️', icon: '🌧️' },
            63: { desc: 'Chuva moderada 🌧️', icon: '🌧️' },
            65: { desc: 'Chuva forte ⛈️', icon: '⛈️' },
            80: { desc: 'Pancadas de chuva 🌦️', icon: '🌦️' },
            95: { desc: 'Tempestade com trovões ⚡', icon: '⚡' }
        };

        const codeInfo = weatherCodes[cur.weather_code] || { desc: 'Condições normais ⛅', icon: '⛅' };

        return {
            local: localNome,
            pais: loc.country || 'Brasil',
            temperatura: cur.temperature_2m,
            sensacao: cur.apparent_temperature,
            umidade: cur.relative_humidity_2m,
            vento: cur.wind_speed_10m,
            condicao: codeInfo.desc,
            icone: codeInfo.icon
        };
    } catch (err) {
        logger.warn(`[API CLIMA WARN] ${err.message}`);
        return null;
    }
}

/**
 * 3. TRADUÇÃO UNIVERSAL MULTILÍNGUE
 */
async function traduzirTexto(texto, targetLang = 'pt') {
    if (!texto || typeof texto !== 'string') return null;

    // Fallback 1: MyMemory Translation API
    try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto.slice(0, 500))}&langpair=autodetect|${targetLang}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
        if (res.ok) {
            const data = await res.json();
            if (data.responseData?.translatedText) {
                return {
                    traducao: data.responseData.translatedText,
                    origem: data.responseData.detectedLanguage || 'auto',
                    destino: targetLang
                };
            }
        }
    } catch (errIgnorado) { logger.warn(`[APISERVICE] Falha ignorada em src/services/apiService.js:136: ${errIgnorado.message}`) }

    return null;
}

/**
 * 4. DICIONÁRIO EM PORTUGUÊS (Dicio / Wiktionary)
 */
async function getDefinicaoDicionario(palavra) {
    if (!palavra || typeof palavra !== 'string') return null;
    const cleanWord = palavra.trim().toLowerCase();

    try {
        const url = `https://significados.herokuapp.com/${encodeURIComponent(cleanWord)}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0 && data[0].significados) {
                return {
                    palavra: cleanWord,
                    classe: data[0].classe || 'Substantivo',
                    significados: data[0].significados.slice(0, 4),
                    etimologia: data[0].etimologia || null
                };
            }
        }
    } catch (errIgnorado) { logger.warn(`[APISERVICE] Falha ignorada em src/services/apiService.js:162: ${errIgnorado.message}`) }

    // Fallback Wikcionário
    try {
        const wikiUrl = `https://pt.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(cleanWord)}`;
        const wikiRes = await fetch(wikiUrl, { signal: AbortSignal.timeout(5000) });
        if (wikiRes.ok) {
            const wikiData = await wikiRes.json();
            const ptDefs = wikiData.pt || [];
            if (ptDefs.length > 0) {
                const defs = ptDefs[0].definitions?.map(d => d.definition.replace(/<[^>]+>/g, '')).slice(0, 3);
                return {
                    palavra: cleanWord,
                    classe: ptDefs[0].partOfSpeech || 'Gramática',
                    significados: defs || [],
                    etimologia: null
                };
            }
        }
    } catch (errIgnorado) { logger.warn(`[APISERVICE] Falha ignorada em src/services/apiService.js:181: ${errIgnorado.message}`) }

    return null;
}

/**
 * 5. GERADOR DE QR CODE EM IMAGEM HD
 */
function gerarQrCodeUrl(conteudo, size = 500) {
    if (!conteudo) return null;
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(conteudo)}&margin=10`;
}

module.exports = {
    getCotacoes,
    getClima,
    traduzirTexto,
    getDefinicaoDicionario,
    gerarQrCodeUrl
};

