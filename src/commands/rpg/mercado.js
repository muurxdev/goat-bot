const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .mercado / .market
 * Mercado Central do Reino: compra e venda de equipamentos, minérios, poções e pergaminhos
 */

const dataService = require("../../services/dataService");
const { initializeUser, adicionarXp } = require("../../services/xpService");
const { getBotName } = require("../../config/botConfig");
const { ITEMS_DB, getItem } = require("../../services/rpgEquipmentService");

const MARKET_STOCK = [
    { id: "pocao_suprema", nome: "🧪 Elixir de Vida Suprema", tipo: "Consumível", preco: 1500, desc: "Restaura 100% do HP em combate" },
    { id: "minerios_pack", nome: "⛏️ Pacote de Minérios Sagrados", tipo: "Material", preco: 3500, desc: "+10 Minérios para forjar armas" },
    { id: "pergaminho_xp", nome: "📜 Pergaminho de XP Antigo", tipo: "Consumível", preco: 5000, desc: "Concede +5.000 XP instantaneamente" },
    { id: "lamina_aco", nome: "🗡️ Lâmina de Aço Real", tipo: "Arma", preco: 2500, desc: "Arma Épica com +140 ATK" },
    { id: "armadura_dourada", nome: "🛡️ Armadura do Leão Dourado", tipo: "Peitoral", preco: 4500, desc: "Peitoral Épico com +220 DEF" }
];

function itemDisplayName(item) {
    if (!item) return '';
    if (typeof item === 'object' && item !== null) {
        return item.nome || item.name || item.id || '';
    }
    return String(item);
}

function itemMatchesSearch(item, searchTerm) {
    const term = searchTerm.toLowerCase();
    if (typeof item === 'object' && item !== null) {
        return (item.id && item.id.toLowerCase().includes(term)) ||
               (item.nome && item.nome.toLowerCase().includes(term)) ||
               (item.name && item.name.toLowerCase().includes(term));
    }
    return typeof item === 'string' && item.toLowerCase().includes(term);
}

module.exports = {
    name: "mercado",
    aliases: ["market", "lojarpg", "bazar", "mercantil"],
    category: "rpg",
    description: "Mercado central do Reino: compre consumíveis e venda itens do inventário",
    cooldownMs: 2500,
    execute: async ({ sender, args, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        const sub = (args[0] || "").toLowerCase().trim();
        const itemId = (args[1] || "").toLowerCase().trim();

        // 1. COMPRAR ITEM
        if (sub === "comprar" || sub === "buy") {
            if (!itemId) {
                return reply("📌 *Uso:* `.mercado comprar <id_do_item>`\n👉 *Exemplo:* `.mercado comprar pocao_suprema`");
            }

            const item = MARKET_STOCK.find(i => i.id === itemId || i.nome.toLowerCase().includes(itemId));
            if (!item) {
                return reply(`❌ Item não encontrado no mercado. Digite \`.mercado\` para ver as ofertas.`);
            }

            if ((user.coins || 0) < item.preco) {
                return reply(`🪙 Saldo insuficiente: Você precisa de **${item.preco.toLocaleString("pt-BR")} Coins** (Seu saldo: ${(user.coins || 0).toLocaleString("pt-BR")} Coins).`);
            }

            user.coins -= item.preco;
            let lvlRes = null;
            if (!Array.isArray(user.inventario)) user.inventario = [];

            if (item.id === "minerios_pack") {
                user.rpg = user.rpg || {};
                user.rpg.minerais = (user.rpg.minerais || 0) + 10;
            } else if (item.id === "pergaminho_xp") {
                lvlRes = adicionarXp(user, 5000, { source: "rpg" }).lvlRes;
            } else if (item.id === "pocao_suprema") {
                user.hp = user.hpMax || 100;
            } else {
                // Guarda como objeto para consistência com as lojas
                const itemData = getItem(item.id);
                if (itemData) {
                    user.inventario.push({ ...itemData });
                } else {
                    user.inventario.push(item.nome);
                }
            }

            await dataService.saveXpData(xpData);

            return reply(`🎉 *COMPRA REALIZADA COM SUCESSO!*\n\n📦 *Item Adquirido:* ${item.nome}\n📜 *Efeito:* ${item.desc}\n💰 *Valor Pago:* -${item.preco.toLocaleString("pt-BR")} Coins\n🪙 *Saldo Restante:* ${(user.coins || 0).toLocaleString("pt-BR")} Coins${lvlRes && lvlRes.subiu ? `\n🆙 *Subiu de nível!* Agora nível ${user.level}` : ""}`);
        }

        // 2. VENDER ITEM DO INVENTÁRIO
        if (sub === "vender" || sub === "sell") {
            if (!itemId) {
                return reply("📌 *Uso:* `.mercado vender <nome_do_item>`\n👉 *Exemplo:* `.mercado vender Escama`");
            }

            if (!Array.isArray(user.inventario) || user.inventario.length === 0) {
                return reply("📦 Seu inventário está vazio. Não há nada para vender.");
            }

            // Suporta AMBOS os formatos (string e objeto)
            const itemIdx = user.inventario.findIndex(i => itemMatchesSearch(i, itemId));
            if (itemIdx === -1) {
                return reply(`❌ Você não possui o item *"${itemId}"* no seu inventário.`);
            }

            const itemRemovido = user.inventario.splice(itemIdx, 1)[0];
            const nomeItem = itemDisplayName(itemRemovido);
            const valorVenda = Math.floor(Math.random() * 800) + 400;

            user.coins = (user.coins || 0) + valorVenda;
            await dataService.saveXpData(xpData);

            return reply(`💰 *ITEM VENDIDO NO MERCADO!*\n\n📦 *Item:* ${nomeItem}\n💵 *Moedas Recebidas:* +${valorVenda.toLocaleString("pt-BR")} Coins\n🪙 *Novo Saldo:* ${(user.coins || 0).toLocaleString("pt-BR")} Coins`);
        }

        // 3. CATÁLOGO GERAL
        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🏪 *MERCADO CENTRAL DE REINO* 🏪   \n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `👤 *Comprador:* ${nomeDoMembro(sender)}  |  🪙 *Saldo:* ${(user.coins || 0).toLocaleString("pt-BR")} Coins\n\n`;

        doc += `╭━〔 🛒 ITENS & EQUIPAMENTOS À VENDA 〕━⬣\n`;
        MARKET_STOCK.forEach(it => {
            doc += `┃ ${it.nome} [${it.tipo}]\n`;
            doc += `┃    📜 *Descrição:* ${it.desc}\n`;
            doc += `┃    💰 *Preço:* ${it.preco.toLocaleString("pt-BR")} Coins  (ID: \`${it.id}\`)\n`;
            doc += `┃    👉 *Comprar:* \`.mercado comprar ${it.id}\`\n┃\n`;
        });
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;

        doc += `💡 _Para vender itens de caça ou mobs:_ \`.mercado vender <item>\`\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), [sender]);
    }
};
