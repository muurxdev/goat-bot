const { pocoes } = require('../../utils/constants')

module.exports = {
    name: 'pocao',
    aliases: ['pocoes', 'pot'],
    category: 'rpg',
    description: 'Exibe o guia completo de criação e uso de poções alquímicas',
    execute: async ({ reply }) => {
        const texto = `🧪 *SISTEMA DE POÇÕES ALQUÍMICAS*

🧪 *forca*
⚔️ +25% de dano

🧪 *experiencia*
⭐ +50% de XP

🧪 *fortuna*
💰 +50% de coins

🧪 *lendaria*
🔥 +50% de dano | ⭐ +50% de XP | 💰 +50% de coins

⏳ *Duração:* 30 minutos

━━━━━━━━━━━━━━━━━━
⚗️ *COMO CRIAR:*
• .criarpocao forca
• .criarpocao experiencia
• .criarpocao fortuna
• .criarpocao lendaria

━━━━━━━━━━━━━━━━━━
🧪 *COMO USAR:*
• .usarpocao forca
• .usarpocao experiencia
• .usarpocao fortuna
• .usarpocao lendaria`
        await reply(texto)
    }
}