const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .ascensao
 * Árvore de Ascensão Espiritual e Graus Cósmicos do Guerreiro
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { getRebirthInfo, calculateFullCharacterStats } = require("../../services/characterEngine");
const { getBotName } = require("../../config/botConfig");

function getAscensionTiers(currentRebirths) {
    const tiers = [
        { nivel: 1, nome: "🌟 Mortal Desperto", bonus: "+25% Dano & XP Global", req: "1x Rebirth" },
        { nivel: 2, nome: "⚡ Cavaleiro Espiritual", bonus: "+50% Dano & XP Global", req: "2x Rebirth" },
        { nivel: 3, nome: "🔥 Soberano dos Elementos", bonus: "+75% Dano & XP Global", req: "3x Rebirth" },
        { nivel: 5, nome: "🪽 Semideus Primordial", bonus: "+125% Dano & XP + Asas Elétricas", req: "5x Rebirth" },
        { nivel: 10, nome: "👑 Divindade Suprema", bonus: "+250% Dano & XP + Coroa de Fogo", req: "10x Rebirth" },
        { nivel: 20, nome: "🪐 Senhor das Constelações", bonus: "+500% Dano & XP + Aura Planetária", req: "20x Rebirth" },
        { nivel: 50, nome: "🌌 Entidade do Infinito", bonus: "+1.250% Dano & XP + Vórtice Cósmico", req: "50x Rebirth" },
        { nivel: 100, nome: "♾️ Criador Onipotente", bonus: "+2.500% Dano & XP + Poder Absoluto", req: "100x Rebirth" }
    ];

    if (currentRebirths >= 100) {
        const nextMilestone = Math.ceil((currentRebirths + 1) / 50) * 50;
        tiers.push({
            nivel: nextMilestone,
            nome: `🌌 Transcendência Infinita (Tier ${Math.floor(nextMilestone / 50)})`,
            bonus: `+${(nextMilestone * 25).toLocaleString("pt-BR")}% Dano & XP Totais`,
            req: `${nextMilestone}x Rebirth`
        });
    }

    return tiers;
}

module.exports = {
    name: "ascensao",
    aliases: ["ascender", "arvoreascensao", "grausascensao"],
    category: "rpg",
    description: "Exibe a árvore de ascensão cósmica e os bônus permanentes de Rebirth",
    cooldownMs: 3000,
    execute: async ({ sender, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);
        const info = getRebirthInfo(user);
        const stats = calculateFullCharacterStats(user);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🌌 *ÁRVORE DE ASCENSÃO CÓSMICA* 🌌   \n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `👤 *Guerreiro:* ${nomeDoMembro(sender)}\n`;
        doc += `🌀 *Rebirths Concluídos:* *${info.rebirths} Graus (Progressão Infinita)*\n`;
        doc += `💥 *Bônus Permanente Atual:* *+${info.bonusDmgPercent.toLocaleString("pt-BR")}% Dano & XP Totais*\n\n`;

        doc += `╭━〔 📜 GRAUS DE TRANSCENDÊNCIA 〕━⬣\n`;
        const tiers = getAscensionTiers(info.rebirths);
        tiers.forEach(t => {
            const alcancado = info.rebirths >= t.nivel;
            const icon = alcancado ? "🟢 [ATINGIDO]" : "🔒 [BLOQUEADO]";
            doc += `┃ ${icon} *Grau ${t.nivel}:* ${t.nome}\n`;
            doc += `┃    📜 *Bônus:* ${t.bonus}\n`;
            doc += `┃    📌 *Requisito:* ${t.req}\n┃\n`;
        });
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;

        doc += `💡 _Para avançar na árvore de ascensão, atinja o nível 100 e use \`.reencarnar\`!_\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), [sender]);
    }
};
