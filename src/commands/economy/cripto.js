const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .cripto / .trade / .criptomoedas
 * Simulador de bolsa cripto e trading virtual de moedas mágicas
 */

const { renderCard, formatCoins } = require("../../utils/uiEngine");
const dataService = require("../../services/dataService");

const CRIPTO_MARKET = {
    "BTC": { nome: "Reino Coin (BTC)", preco: 2500, variacao: "+4.8%", emoji: "🪙" },
    "ETH": { nome: "Token (ETH)", preco: 850, variacao: "-2.1%", emoji: "💎" },
    "MEL": { nome: "GOAT Wrath (MEL)", preco: 120, variacao: "+15.2%", emoji: "🐉" },
    "ESC": { nome: "Sun Pride (ESC)", preco: 340, variacao: "+8.4%", emoji: "☀️" }
};

module.exports = {
    name: "cripto",
    aliases: ["trade","criptomoedas","bolsacripto","comprarcripto","cmd_cripto","alt_cripto","atalho_cripto","abrev_cripto","call_cripto","func_cripto"],
    category: "economy",
    description: "Simulador de mercado e trading de criptomoedas de Reino",
    cooldownMs: 3000,
    execute: async ({ sender, reply, args }) => {
        const xpData = dataService.getXpData();
        const user = xpData[sender] || dataService.initializeUser(sender);
        user.criptoCarteira = user.criptoCarteira || {};

        const sub = (args[0] || "").toUpperCase().trim();

        if (!sub || sub === "MERCADO" || sub === "LISTA") {
            const fields = Object.entries(CRIPTO_MARKET).map(([symbol, info]) => {
                const holding = user.criptoCarteira[symbol] || 0;
                return `${info.emoji} *${symbol}* — ${info.nome}\n   ├ 💰 *Preço:* ${formatCoins(info.preco)} | 📈 *24h:* ${info.variacao}\n   └ 💼 *Na Carteira:* ${holding} ${symbol} (\`.cripto comprar ${symbol} <qtd>\`)`;
            });

            const card = renderCard({
                title: "MERCADO CRIPTO DE REINO",
                icon: "📊",
                subtitle: `💼 *Trader:* ${nomeDoMembro(sender)}`,
                sections: [
                    {
                        title: "COTAÇÕES AO VIVO",
                        icon: "💹",
                        fields: fields
                    },
                    {
                        title: "COMANDOS DE TRADING",
                        icon: "⚡",
                        fields: [
                            "• `.cripto comprar <moeda> <qtd>` ➔ Comprar tokens",
                            "• `.cripto vender <moeda> <qtd>` ➔ Vender tokens por Coins"
                        ]
                    }
                ],
                tip: "Compre na baixa e venda na alta para multiplicar seus Coins!",
                mentions: [sender]
            });

            return reply(card, [sender]);
        }

        if (sub === "COMPRAR") {
            const symbol = (args[1] || "").toUpperCase().trim();
            const qtd = parseInt(args[2], 10);
            const token = CRIPTO_MARKET[symbol];

            if (!token || isNaN(qtd) || qtd <= 0) {
                return reply("❌ Formato inválido! Use: `.cripto comprar <BTC|ETH|MEL|ESC> <quantidade>`.");
            }

            const custoTotal = token.preco * qtd;
            if ((user.coins || 0) < custoTotal) {
                return reply(`❌ *Saldo insuficiente!* Você precisa de *${formatCoins(custoTotal)}* para comprar ${qtd} ${symbol}.`);
            }

            user.coins -= custoTotal;
            user.criptoCarteira[symbol] = (user.criptoCarteira[symbol] || 0) + qtd;
            await dataService.saveXpData(xpData);

            return reply(`🎉 *ORDEM DE COMPRA EXECUTADA!*\n\n${token.emoji} Você adquiriu *${qtd} ${symbol}* por *${formatCoins(custoTotal)}*!\n💼 *Total em Carteira:* ${user.criptoCarteira[symbol]} ${symbol}`);
        }

        if (sub === "VENDER") {
            const symbol = (args[1] || "").toUpperCase().trim();
            const qtd = parseInt(args[2], 10);
            const token = CRIPTO_MARKET[symbol];

            if (!token || isNaN(qtd) || qtd <= 0) {
                return reply("❌ Formato inválido! Use: `.cripto vender <BTC|ETH|MEL|ESC> <quantidade>`.");
            }

            const holding = user.criptoCarteira[symbol] || 0;
            if (holding < qtd) {
                return reply(`❌ *Tokens insuficientes!* Você possui apenas *${holding} ${symbol}* na carteira.`);
            }

            const ganhoTotal = token.preco * qtd;
            user.criptoCarteira[symbol] -= qtd;
            user.coins = (user.coins || 0) + ganhoTotal;
            await dataService.saveXpData(xpData);

            return reply(`💰 *ORDEM DE VENDA EXECUTADA!*\n\n${token.emoji} Você vendeu *${qtd} ${symbol}* e recebeu *${formatCoins(ganhoTotal)}* na carteira!`);
        }
    }
};

