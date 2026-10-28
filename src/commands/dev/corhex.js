/**
 * Comando .corhex — Gera uma cor hexadecimal aleatória
 */
const F = require('../../utils/formato')

/** RGB (0-255) para HSL arredondado. */
function rgbParaHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h = 0, s = 0
    const l = (max + min) / 2
    if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
        else if (max === g) h = (b - r) / d + 2
        else h = (r - g) / d + 4
        h *= 60
    }
    return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
}

module.exports = {
    name: "corhex",
    aliases: ["corrandom","randomcolor","hexcor","cmd_corhex","alt_corhex","atalho_corhex","abrev_corhex","call_corhex","func_corhex"],
    category: "dev",
    subcategory: "Ferramentas",
    description: "Sorteia uma cor e mostra os códigos HEX, RGB e HSL",
    examples: [' — sorteia uma cor aleatória'],
    cooldownMs: 1500,
    execute: async ({ reply, prefix = '.' }) => {
        const hex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase()
        const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16)
        const luz = (0.299 * r + 0.587 * g + 0.114 * b) / 255
        return reply(F.tela({
            emoji: '🎨',
            titulo: 'Cor aleatória',
            intro: `Sorteei a cor *${hex}*.`,
            secoes: [{
                emoji: '📋', titulo: 'Códigos',
                linhas: [
                    F.campo('HEX', '`' + hex + '`'),
                    F.campo('RGB', '`rgb(' + r + ', ' + g + ', ' + b + ')`'),
                    F.campo('HSL', '`' + rgbParaHsl(r, g, b) + '`'),
                    F.campo('Tom', luz > 0.5 ? 'claro (combina com texto preto)' : 'escuro (combina com texto branco)')
                ]
            }],
            dica: 'Copie o código entre crases e cole direto no CSS ou no editor de imagem.',
            proximos: [
                { nome: 'rgbpreview', args: `${r} ${g} ${b}`, oque: 'ver a cor' },
                { nome: 'colorpalette', oque: 'gerar uma paleta' },
                { nome: 'corhex', oque: 'sortear outra cor' }
            ],
            prefix
        }))
    }
};
