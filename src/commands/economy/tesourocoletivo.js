const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .tesourocoletivo / .baucoletivo / .pote
 * Baú coletivo do grupo que acumula moedas com a atividade e é sorteado entre os membros
 */

const { renderCard, renderProgressBar, formatCoins } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");
const groupProtectionService = require("../../services/groupProtectionService");

module.exports = {
    name: "tesourocoletivo",
    aliases: ["baucoletivo","pote","tesouro-grupo","vaquinha-tesouro","cmd_tesourocoletivo","alt_tesourocoletivo","atalho_tesourocoletivo","abrev_tesourocoletivo","call_tesourocoletivo","func_tesourocoletivo"],
    category: "economy",
    description: "Consulte ou resgate o baú coletivo de moedas acumuladas do grupo",
    groupOnly: true,
    cooldownMs: 3000,
    execute: async ({ from, sender, reply, args, prefix }) => {
        const p = prefix || ".";
        // Grava antes as moedas somadas pelas mensagens do grupo (o serviço
        // agrupa a gravação), para o saldo mostrado estar em dia.
        await groupProtectionService.gravarTesouro(from);

        const configs = dataService.getConfigsData();
        configs[from] = configs[from] || {};
        // O pote começa vazio: antes nascia com 5000 moedas criadas do nada.
        // Gravado já na primeira consulta, senão as mensagens não teriam onde somar.
        if (!configs[from].tesouro) {
            configs[from].tesouro = { saldo: 0, meta: 50000, contribuintes: {} };
            await dataService.saveConfigsData({ [from]: configs[from] });
        }

        const t = configs[from].tesouro;
        const sub = (args[0] || "").toLowerCase().trim();

        if (!sub || sub === "status" || sub === "ver") {
            const pct = Math.min(100, Math.floor((t.saldo / t.meta) * 100));
            const barra = renderProgressBar(t.saldo, t.meta, 12, "gold");

            const card = renderCard({
                title: "BAÚ DO TESOURO COLETIVO",
                icon: "🪙",
                subtitle: `🏰 *Reino / Grupo:* Reino Guild`,
                sections: [
                    {
                        title: "META COLETIVA DO BAÚ",
                        icon: "📊",
                        fields: [
                            { label: "Saldo Acumulado", value: formatCoins(t.saldo), icon: "💰" },
                            { label: "Meta de Liberação", value: formatCoins(t.meta), icon: "🎯" },
                            { label: "Progresso", value: `${barra} ${pct}%`, icon: "📈" }
                        ]
                    },
                    {
                        title: "COMO PARTICIPAR",
                        icon: "🤝",
                        fields: [
                            `• \`${p}pote doar <valor>\` ➔ Contribua com moedas para encher o baú`,
                            `• \`${p}pote abrir\` ➔ Abra o baú quando atingir 100%`,
                            `• Quem conversa no grupo soma ${groupProtectionService.TESOURO_MOEDAS_POR_MENSAGEM} moedas ao pote, no máximo uma vez por minuto`
                        ]
                    }
                ],
                tip: "Quando a meta for batida, qualquer membro ativo poderá disputar o tesouro!",
                mentions: [sender]
            });

            return reply(card, [sender]);
        }

        if (sub === "doar" || sub === "contribuir") {
            const valor = parseInt(args[1], 10);
            if (isNaN(valor) || valor <= 0) {
                return reply(`❌ Informe uma quantidade válida de moedas para doar (ex: \`${p}pote doar 500\`).`);
            }

            // Leitura pontual: getXpData() carregava a tabela inteira.
            const user = dataService.initializeUser(sender, {});

            if ((user.coins || 0) < valor) {
                return reply(`❌ *Saldo insuficiente!* Você possui apenas *${formatCoins(user.coins || 0)}*.`);
            }

            user.coins -= valor;
            t.saldo += valor;
            t.contribuintes[sender] = (t.contribuintes[sender] || 0) + valor;

            dataService.saveUser(user);
            await dataService.saveConfigsData(configs);

            return reply(`🎉 *DOAÇÃO RECEBIDA!*\n\n💰 Você doou *${formatCoins(valor)}* para o Baú Coletivo!\n📊 *Novo Saldo do Baú:* ${formatCoins(t.saldo)} / ${formatCoins(t.meta)}`);
        }

        if (sub === "abrir" || sub === "resgatar") {
            if (t.saldo < t.meta) {
                return reply(`⚠️ *Baú ainda Trancado!* O saldo atual é de *${formatCoins(t.saldo)}*, a meta de abertura é de *${formatCoins(t.meta)}*.`);
            }

            const user = dataService.initializeUser(sender, {});
            const premio = t.saldo;

            user.coins = (user.coins || 0) + premio;
            t.saldo = 0; // nova rodada começa vazia

            dataService.saveUser(user);
            await dataService.saveConfigsData(configs);

            return reply(`👑 *TESOURO LIBERADO E SAQUEADO!*\n\n🎉 Parabéns ${nomeDoMembro(sender)}! Você abriu o Baú Coletivo e faturou a bolada de *${formatCoins(premio)}*!\n🔄 O baú foi reiniciado para uma nova rodada.`, [sender]);
        }

        // Subcomando desconhecido: antes o comando terminava sem responder nada.
        return reply(
            `❓ Não conheço \`${sub}\` no baú coletivo.\n\n` +
            "📌 *Opções:*\n" +
            `• \`${p}pote\` ➔ Ver o saldo e a meta\n` +
            `• \`${p}pote doar <valor>\` ➔ Contribuir com moedas\n` +
            `• \`${p}pote abrir\` ➔ Abrir o baú quando atingir a meta`
        );
    }
};

