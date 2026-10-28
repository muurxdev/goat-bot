/**
 * Comando .despertar / .awakening / .modoassalto
 * Desperte seu poder oculto para multiplicar temporariamente seu Combat Power
 */

const { renderCard } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

module.exports = {
    name: "despertar",
    aliases: ["awakening", "modoassalto", "despertarpoder", "the-one"],
    category: "rpg",
    description: "Desperte sua forma máxima para multiplicar seu Combat Power e status",
    cooldownMs: 5000,
    execute: async ({ sender, reply }) => {
        const xpData = dataService.getXpData();
        const user = xpData[sender] || dataService.initializeUser(sender);
        user.rpg = user.rpg || {};

        const formas = [
            { nome: "Modo de Assalto Demoníaco (Assault Mode)", bonus: "CP x2.5 / Dano Crítico +50%", icone: "🐉" },
            { nome: "The One Ultimate (O Ápice do Sol)", bonus: "CP x3.0 / Dano de Fogo Sagrado", icone: "☀️" },
            { nome: "Verdadeiro Rei Fada (Asas Sagradas)", bonus: "CP x2.2 / Velocidade +40%", icone: "🧚" }
        ];

        const forma = formas[Math.floor(Math.random() * formas.length)];
        user.rpg.cp = (user.rpg.cp || 1000) + 500;
        await dataService.saveXpData(xpData);

        const card = renderCard({
            title: "DESPERTAR DO PODER SUPREMO!",
            icon: forma.icone,
            subtitle: `💥 *Guerreiro:* @${sender.split("@")[0]}`,
            sections: [
                {
                    title: "FORMA MÁXIMA DESPERTADA",
                    icon: "🔥",
                    fields: [
                        { label: "Estado Ativado", value: forma.nome, icon: "👑" },
                        { label: "Efeito do Despertar", value: forma.bonus, icon: "⚡" },
                        { label: "Poder de Combate (CP)", value: `+500 CP Permanente`, icon: "📈" }
                    ]
                }
            ],
            tip: "Desperte seu poder antes de enfrentar chefes e masmorras lendárias!",
            mentions: [sender]
        });

        return reply(card, [sender]);
    }
};

