const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .evoluirpet
 * Sistema de Evolução de Pets com árvores de estágios e bônus massivos de dano real
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { getBotName } = require("../../config/botConfig");
const { calculateFullCharacterStats } = require("../../services/characterEngine");

const PET_EVOLUTIONS = {
    lobo: [
        { estagio: 1, nome: "🐺 Lobo Selvagem", bonus: "+80 ATK", custo: 0 },
        { estagio: 2, nome: "🐺🔥 Lobo do Purgatório", bonus: "+250 ATK & +15% Crítico", custo: 10000, reqNivel: 15 },
        { estagio: 3, nome: "🐺👑 Fenrir Ancestral", bonus: "+600 ATK & +30% Dano Crítico", custo: 35000, reqNivel: 35 }
    ],
    dragao: [
        { estagio: 1, nome: "🐉 Dragãozinho Filhote", bonus: "+120 ATK", custo: 0 },
        { estagio: 2, nome: "🐉🔥 Dragão de Chamas Negras", bonus: "+380 ATK & Queimadura", custo: 20000, reqNivel: 20 },
        { estagio: 3, nome: "🐉👑 Bahamut Soberano", bonus: "+950 ATK & +40% Dano de Área", custo: 60000, reqNivel: 50 }
    ],
    falcao: [
        { estagio: 1, nome: "🦅 Falcão Mensageiro", bonus: "+60 ATK", custo: 0 },
        { estagio: 2, nome: "🦅⚡ Falcão do Trovão", bonus: "+200 ATK & +20% Esquiva", custo: 8000, reqNivel: 12 },
        { estagio: 3, nome: "🦅✨ Garuda Celestial", bonus: "+500 ATK & +35% Velocidade", custo: 28000, reqNivel: 30 }
    ]
};

module.exports = {
    name: "evoluirpet",
    aliases: ["evolvepet", "upgradepet", "petup", "evoluir-pet"],
    category: "rpg",
    description: "Evolua seu pet de batalha para estágios lendários aumentando seu dano em combate",
    cooldownMs: 3000,
    execute: async ({ sender, args, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        const currentPet = user.pet || "";
        const sub = (args[0] || "").toLowerCase().trim();

        if (!currentPet) {
            return reply(`🐾 *Você ainda não possui um Pet ativo!*\n\n💡 _Dome um pet com \`.domar\` ou compre ovos na loja com \`.loja\` para começar a evoluir!_`);
        }

        // Identifica a espécie do pet
        let especie = "lobo";
        if (currentPet.toLowerCase().includes("drag") || currentPet.toLowerCase().includes("bahamut")) especie = "dragao";
        else if (currentPet.toLowerCase().includes("falc") || currentPet.toLowerCase().includes("garuda")) especie = "falcao";

        const tree = PET_EVOLUTIONS[especie] || PET_EVOLUTIONS.lobo;

        // Identifica o estágio atual
        let currentStageIdx = 0;
        for (let i = 0; i < tree.length; i++) {
            if (currentPet.toLowerCase().includes(tree[i].nome.toLowerCase().replace(/[^a-z]/g, ""))) {
                currentStageIdx = i;
            }
        }

        const isMaxStage = currentStageIdx >= tree.length - 1;
        const nextStage = tree[currentStageIdx + 1];

        // 1. EVOLUIR O PET
        if (sub === "evoluir" || sub === "up" || sub === "upar") {
            if (isMaxStage) {
                return reply(`👑 *Seu Pet já atingiu o Estágio Máximo (${tree[currentStageIdx].nome})!*`);
            }

            if ((user.level || 1) < nextStage.reqNivel) {
                return reply(`🔒 Nível de Guerreiro Insuficiente: Você precisa ser **Nível ${nextStage.reqNivel}** para evoluir seu pet para este estágio (Seu nível: ${user.level || 1}).`);
            }

            if ((user.coins || 0) < nextStage.custo) {
                return reply(`🪙 Moedas Insuficientes: O ritual de evolução custa **${nextStage.custo.toLocaleString("pt-BR")} Coins** (Seu saldo: ${(user.coins || 0).toLocaleString("pt-BR")} Coins).`);
            }

            user.coins -= nextStage.custo;
            user.pet = nextStage.nome;
            await dataService.saveXpData(xpData);

            let evoDoc = `╔══════════════════════════════╗\n`;
            evoDoc += `║   🐾 *EVOLUÇÃO DE PET CONCLUÍDA!* 🐾   \n`;
            evoDoc += `╚══════════════════════════════╝\n\n`;
            evoDoc += `✨ *Seu companheiro absorveu a energia primordial e ascendeu para uma nova forma!*\n\n`;
            evoDoc += `╭━〔 🌟 NOVO ESTÁGIO 〕━⬣\n`;
            evoDoc += `┃ 🐾 *Novo Nome:* ${nextStage.nome}\n`;
            evoDoc += `┃ 💥 *Bônus em Combate:* ${nextStage.bonus}\n`;
            evoDoc += `┃ 💸 *Custo Pago:* -${nextStage.custo.toLocaleString("pt-BR")} Coins\n`;
            evoDoc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            evoDoc += `💡 _Seu pet agora causará muito mais dano ao atacar bosses (\`.boss\`) e masmorras (\`.dungeon\`)!_\n`;
            evoDoc += `👑 *${botName}*`;

            return reply(evoDoc.trim(), [sender]);
        }

        // 2. EXIBIR ÁRVORE DE EVOLUÇÃO
        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🐾 *ÁRVORE DE EVOLUÇÃO DE PETS* 🐾   \n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `👤 *Mestre:* ${nomeDoMembro(sender)}\n`;
        doc += `🐾 *Pet Atual:* **${currentPet}**\n\n`;

        doc += `╭━〔 📜 ESTÁGIOS DA ESPÉCIE 〕━⬣\n`;
        tree.forEach((st, i) => {
            const isCurrent = i === currentStageIdx;
            const tag = isCurrent ? " 🟢 *(Atual)*" : (i < currentStageIdx ? " ✔️ *(Superado)*" : " 🔒 *(Próximo)*");
            doc += `┃ ${st.nome}${tag}\n`;
            doc += `┃    💥 *Bônus:* ${st.bonus}\n`;
            if (st.custo > 0) doc += `┃    💰 *Custo:* ${st.custo.toLocaleString("pt-BR")} Coins (Requer Nível ${st.reqNivel})\n`;
            doc += `┃\n`;
        });
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;

        if (!isMaxStage) {
            doc += `💡 _Para evoluir seu pet agora:_ \`.evoluirpet evoluir\`\n`;
        } else {
            doc += `🌟 _Parabéns! Seu pet atingiu a forma ancestral suprema!_\n`;
        }
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), [sender]);
    }
};
