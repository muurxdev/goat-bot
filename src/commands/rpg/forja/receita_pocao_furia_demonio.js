module.exports = {
    name: 'receita_pocao_furia_demonio',
    aliases: [],
    category: 'rpg',
    subcategory: 'Catálogo de Forja',
    description: 'Instruções de forja e materiais necessários para Extrato de Fogo do Purgatório',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚒️ *RECEITA: EXTRATO DE FOGO DO PURGATÓRIO* ═══════╗\n\n'
        txt += '⭐ *Nível Requerido:* Nível 10\n'
        txt += '💰 *Custo de Execução:* 3.500 moedas\n'
        txt += '📦 *Materiais Necessários:* 3x Cinzas Demoníacas, 1x Chifre de Demônio Vermelho\n'
        txt += '✨ *Item Gerado:* Fogo do Purgatório (+35% Dano por 2 horas)\n'
        txt += '📖 *Efeito:* Aumenta temporariamente todo o dano físico e mágico em combate contra chefes.\n\n'
        txt += 'Para produzir agora: `.forjar pocao_furia_demonio`'
        return reply(txt.trim())
    }
}
