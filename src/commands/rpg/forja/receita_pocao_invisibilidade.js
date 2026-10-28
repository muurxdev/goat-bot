module.exports = {
    name: 'receita_pocao_invisibilidade',
    aliases: [],
    category: 'rpg',
    subcategory: 'Catálogo de Forja',
    description: 'Instruções de forja e materiais necessários para Essência da Névoa Sombria',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚒️ *RECEITA: ESSÊNCIA DA NÉVOA SOMBRIA* ═══════╗\n\n'
        txt += '⭐ *Nível Requerido:* Nível 8\n'
        txt += '💰 *Custo de Execução:* 2.800 moedas\n'
        txt += '📦 *Materiais Necessários:* 2x Ectoplasma, 1x Flor da Noite Eterna\n'
        txt += '✨ *Item Gerado:* Névoa Sombria (+25% Esquiva por 1 hora)\n'
        txt += '📖 *Efeito:* Permite desviar de ataques letais e ataques surpresa de monstros.\n\n'
        txt += 'Para produzir agora: `.forjar pocao_invisibilidade`'
        return reply(txt.trim())
    }
}
