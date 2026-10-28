module.exports = {
    name: 'receita_forja_armadura_paladino',
    aliases: [],
    category: 'rpg',
    subcategory: 'Catálogo de Forja',
    description: 'Instruções de forja e materiais necessários para Placa Completa do Paladino Guardião',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚒️ *RECEITA: PLACA COMPLETA DO PALADINO GUARDIÃO* ═══════╗\n\n'
        txt += '⭐ *Nível Requerido:* Nível 15\n'
        txt += '💰 *Custo de Execução:* 16.000 moedas\n'
        txt += '📦 *Materiais Necessários:* 8x Placas de Titânio, 4x Selos de Proteção\n'
        txt += '✨ *Item Gerado:* Armadura do Paladino (DEF +180, HP +400)\n'
        txt += '📖 *Efeito:* Blindagem pesada impenetrável contra flechas e ataques de monstros comuns.\n\n'
        txt += 'Para produzir agora: `.forjar forja_armadura_paladino`'
        return reply(txt.trim())
    }
}
