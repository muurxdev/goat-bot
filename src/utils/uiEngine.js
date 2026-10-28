/**
 * Central UI & Card Rendering Engine
 * Cartões padronizados para WhatsApp, nas caixas de utils/moldura.js (de volta
 * por decisão do dono em 2026-09-18), com dados em "*Rótulo:* valor".
 */

const M = require('./moldura');

/**
 * Renderiza uma barra de progresso gráfica
 */
function renderProgressBar(current, max, length = 10, style = 'green') {
    const safeMax = Math.max(1, max);
    const safeCurrent = Math.min(safeMax, Math.max(0, current));
    const percent = Math.min(100, Math.floor((safeCurrent / safeMax) * 100));
    const filledCount = Math.min(length, Math.floor((percent / 100) * length));
    const emptyCount = length - filledCount;

    let fillChar = '🟩';
    let emptyChar = '⬛';

    if (style === 'purple') fillChar = '🟪';
    else if (style === 'blue') fillChar = '🟦';
    else if (style === 'fire') fillChar = '🟧';

    return `${fillChar.repeat(filledCount)}${emptyChar.repeat(emptyCount)} ${percent}%`;
}

/**
 * Formata números com separador de milhar brasileiro
 */
function formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return Number(num).toLocaleString('pt-BR');
}

function formatCoins(amount) {
    return `${formatNumber(amount)} ${Math.abs(Number(amount) || 0) === 1 ? 'moeda' : 'moedas'}`;
}

function formatXP(amount) {
    return `${formatNumber(amount)} XP`;
}

function formatCompact(num) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    const n = Number(num);
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'k';
    return n.toString();
}

/**
 * Largura aproximada do título. Mantida por compatibilidade com quem ainda chama.
 */
function computeCardWidth(title, icon = '') {
    const visible = `   ${icon} ${String(title).toUpperCase()} ${icon}`.length;
    return Math.max(24, Math.min(38, visible));
}

/**
 * Renderiza um cartão em moldura: cabeçalho, subtítulo, seções e dica.
 */
function renderCard({
    title = 'Central do bot',
    icon = '✨',
    subtitle = null,
    sections = [],
    footer = null,
    tip = null,
    hideBranding = false
}) {
    const blocos = [M.cabecalho(icon, String(title).replace(/\*/g, ''))];

    if (subtitle) blocos.push(String(subtitle).trim());

    for (const section of sections) {
        const linhas = [];
        if (Array.isArray(section.fields)) {
            for (const field of section.fields) {
                if (typeof field === 'string') {
                    linhas.push(`• ${field.replace(/^[•\s*-]+/, '')}`);
                } else if (typeof field === 'object' && field !== null) {
                    const fLabel = field.label ? `*${field.label}:* ` : '';
                    linhas.push(`${fLabel}${field.value}`);
                }
            }
        }
        if (section.title) blocos.push(M.secao(section.icon || '', section.title, linhas));
        else if (linhas.length) blocos.push(linhas.map(M.linhaDeSecao).join('\n'));
    }

    if (footer) blocos.push(String(footer).trim());
    if (tip) blocos.push(`💡 _${tip}_`);
    if (!hideBranding) blocos.push(M.assinatura());

    return blocos.filter(b => b && String(b).trim()).join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
}

function renderTable(headers = [], rows = []) {
    let out = '';
    const colWidths = headers.map((h, i) => {
        let max = h.length;
        for (const row of rows) {
            const cell = String(row[i] || '');
            if (cell.length > max) max = cell.length;
        }
        return Math.min(25, max);
    });

    const headerLine = headers.map((h, i) => h.padEnd(colWidths[i])).join(' | ');
    const sepLine = colWidths.map(w => '-'.repeat(w)).join('-|-');

    out += headerLine + '\n';
    out += sepLine + '\n';

    for (const row of rows) {
        const rowLine = row.map((c, i) => String(c || '').padEnd(colWidths[i])).join(' | ');
        out += rowLine + '\n';
    }

    return out;
}

module.exports = {
    renderCard,
    computeCardWidth,
    renderProgressBar,
    formatNumber,
    formatCoins,
    formatXP,
    formatCompact,
    renderTable
};
