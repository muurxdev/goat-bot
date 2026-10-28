/**
 * Comando .corrigir — Ajusta espaçamento e capitalização de um texto
 */
module.exports = {
    name: "corrigir",
    aliases: ["revisar","corrigirtexto"],
    category: "general",
    subcategory: "IA & Pesquisa",
    description: "Ajusta espaçamento e capitalização de um texto",
    cooldownMs: 2500,
    execute: async ({ text, reply }) => {
            const t = String(text || '').trim()
            if (!t) return reply('✍️ *Corrigir*\n\nUso: `.corrigir <texto>` — ajusta espaços e maiúsculas de início de frase.')
            let out = t.replace(/[ \t]+/g, ' ').replace(/\s+([,.!?;:])/g, '$1').replace(/([,.!?;:])(?=[^\s])/g, '$1 ').replace(/[ \t]+\n/g, '\n').trim()
            out = out.replace(/(^|[.!?]\s+)([a-zà-ú])/g, (mm, p, c) => p + c.toUpperCase())
            return reply('✍️ *Texto corrigido:*\n\n' + out)
        }
};
