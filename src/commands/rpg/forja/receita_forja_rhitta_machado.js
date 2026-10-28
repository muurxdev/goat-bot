module.exports = {
    name: 'receita_forja_rhitta_machado',
    aliases: [],
    category: 'rpg',
    subcategory: 'Catálogo de Forja',
    description: 'Instruções de forja e materiais necessários para Machado Divino Rhitta - Forja Imperial',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚒️ *RECEITA: MACHADO DIVINO RHITTA - FORJA IMPERIAL* ═══════╗\n\n'
        txt += '⭐ *Nível Requerido:* Nível 30\n'
        txt += '💰 *Custo de Execução:* 50.000 moedas\n'
        txt += '📦 *Materiais Necessários:* 15x Ouro Solar, 8x Minérios do Meio-Dia, 3x Brasas do Sol\n'
        txt += '✨ *Item Gerado:* Machado Rhitta (ATK +500, Explosão Solar)\n'
        txt += '📖 *Efeito:* Absorve energia ao longo da manhã e desfere golpes devastadores de fogo puro.\n\n'
        txt += 'Para produzir agora: `.forjar forja_rhitta_machado`'
        return reply(txt.trim())
    }
}
