const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .patrocinar / .patrocinio / .dropevento
 * Crie um evento patrocinado no grupo com premiação automática para o próximo que falar
 */

const { renderCard, formatCoins } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");
const { dropPendenteAtivo } = require("../../services/economyService");

module.exports = {
    name: "patrocinar",
    aliases: ["patrocinio","dropevento","patrocinargrupo","doarevento","cmd_patrocinar","alt_patrocinar","atalho_patrocinar","abrev_patrocinar","call_patrocinar","func_patrocinar"],
    category: "economy",
    description: "Patrocine um evento instantâneo no grupo com moedas para os membros",
    groupOnly: true,
    cooldownMs: 5000,
    execute: async ({ from, sender, reply, args }) => {
        const valor = parseInt(args[0], 10);
        if (isNaN(valor) || valor < 500) {
            return reply("❌ Informe o valor do patrocínio (mínimo: 500 Coins).\n\n👉 *Exemplo:* `.patrocinar 1500`");
        }

        // Só cabe um drop por grupo: sobrescrever o pendente apagaria as moedas de quem doou antes.
        const pendente = await dropPendenteAtivo(from);
        if (pendente) {
            return reply(`⏳ Já tem um drop de *${formatCoins(pendente.amount)}* de ${nomeDoMembro(pendente.sponsor)} esperando alguém falar no grupo. Ele expira em ${Math.ceil(pendente.expiraEmMs / 60000)} min; depois disso você pode patrocinar o seu. Nada foi cobrado.`, [pendente.sponsor]);
        }

        const xpData = dataService.getXpData();
        const user = xpData[sender] || dataService.initializeUser(sender);

        if ((user.coins || 0) < valor) {
            return reply(`❌ *Saldo insuficiente!* Você possui *${formatCoins(user.coins || 0)}*.`);
        }

        user.coins -= valor;
        await dataService.saveXpData(xpData);

        // Armazenar drop pendente no grupo (recompensa para o próximo que falar)
        const configs = dataService.getConfigsData();
        configs[from] = configs[from] || {};
        configs[from].pendingDrop = {
            amount: valor,
            sponsor: sender,
            createdAt: Date.now()
        };
        await dataService.saveConfigsData(configs);

        const card = renderCard({
            title: "EVENTO PATROCINADO NO GRUPO!",
            icon: "🎁",
            subtitle: `👑 *Patrocinador Oficial:* ${nomeDoMembro(sender)}`,
            sections: [
                {
                    title: "DETALHES DO PATROCÍNIO",
                    icon: "💰",
                    fields: [
                        { label: "Prêmio em Moedas", value: formatCoins(valor), icon: "🪙" },
                        { label: "Status do Evento", value: "🟢 *ATIVO (Aberto)*", icon: "📢" },
                        { label: "Como Ganhar", value: "O próximo membro que interagir no grupo leva o prêmio!", icon: "⚡" }
                    ]
                }
            ],
            tip: "Envie qualquer mensagem agora para resgatar o drop!",
            mentions: [sender]
        });

        return reply(card, [sender]);
    }
};

