/**
 * Comando .equipar / .equip / .vestir
 * Equipa armas, capacetes, peitorais, perneiras, botas, escudos e amuletos nos slots do boneco
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { getItem, calculateCharacterStats } = require("../../services/rpgEquipmentService");
const { formatNumber, moedas, NOME_ESPACO } = require("../../utils/textoRpg");
const F = require("../../utils/formato");

/** Atributos que o item realmente dá. */
function atributos(item) {
    const bonus = [];
    if (item.atk) bonus.push(`ATK +${formatNumber(item.atk)}`);
    if (item.def) bonus.push(`DEF +${formatNumber(item.def)}`);
    if (item.hp) bonus.push(`HP +${formatNumber(item.hp)}`);
    if (item.crit) bonus.push(`crítico +${item.crit}%`);
    if (item.esq) bonus.push(`esquiva +${item.esq}%`);
    if (item.bloq) bonus.push(`bloqueio +${item.bloq}%`);
    return bonus.join(" · ");
}

/** Equipamentos do catálogo que estão na mochila, sem repetir. */
function equipamentosNaMochila(inventario) {
    const vistos = new Map();
    for (const i of inventario) {
        if (!i || typeof i !== "object" || !i.slot || !i.id) continue;
        if (!vistos.has(i.id)) vistos.set(i.id, i);
    }
    return [...vistos.values()];
}

/** Onde comprar o item: arsenal para arma, forja com a categoria para o resto. */
const lojaDoItem = item => item.slot === "arma"
    ? { nome: "shoparmas", args: item.id, oque: `comprar ${item.nome} por ${moedas(item.preco)}` }
    : { nome: "shoparmaduras", args: item.id, oque: `comprar ${item.nome} por ${moedas(item.preco)}` };

module.exports = {
    name: "equipar",
    aliases: ["vestir", "usaritem", "colocararmadura", "empunhar"],
    category: "rpg",
    subcategory: "Combate",
    description: "Equipe um item da sua mochila no espaço certo do personagem",
    usage: "<nome ou código do equipamento>",
    examples: [
        "espada_ferro — empunha a Espada de Ferro que está na mochila",
        "Escudo de Madeira — veste o escudo pelo nome",
        "sombria — empunha a Sombria"
    ],
    cooldownMs: 1500,
    execute: async ({ sender, text, reply, prefix = "." }) => {
        const itemName = (text || "").trim();

        if (!itemName) {
            const xpDataUso = dataService.getXpData();
            const userUso = initializeUser(sender, xpDataUso);
            const slotsUso = userUso.slots || {};
            const vestidos = new Set(Object.values(slotsUso).concat(userUso.arma).map(r => (r && typeof r === "object") ? r.id : r).filter(Boolean));
            const naMochila = equipamentosNaMochila(Array.isArray(userUso.inventario) ? userUso.inventario : [])
                .filter(i => !vestidos.has(i.id));
            const linhasMochila = naMochila.slice(0, 5).map(i => `• ${F.cmd(prefix, "equipar", i.id)} — ${i.nome} (${NOME_ESPACO[i.slot] || i.slot})`);
            return reply(F.tela({
                emoji: "⚔️",
                titulo: "Equipar um item",
                intro: "Veste uma arma ou armadura da sua mochila no espaço certo do personagem. O que estava ali volta para a mochila.",
                secoes: [
                    { emoji: "⌨️", titulo: "Digite assim", linhas: [F.cmd(prefix, "equipar", "<nome ou código>")] },
                    linhasMochila.length
                        ? { emoji: "🎒", titulo: "Prontos para vestir", linhas: linhasMochila }
                        : { emoji: "📌", titulo: "Exemplos", linhas: [
                            `• ${F.cmd(prefix, "equipar", "espada_ferro")} — pelo código`,
                            `• ${F.cmd(prefix, "equipar", "Escudo de Madeira")} — pelo nome`
                        ] }
                ],
                dica: linhasMochila.length ? "" : "Você não tem equipamento guardado na mochila. Compre no arsenal ou na forja, ou cace para achar um.",
                proximos: [
                    { nome: "inv", oque: "ver sua mochila e o que está equipado" },
                    { nome: "shoparmas", oque: "comprar armas" },
                    { nome: "shoparmaduras", oque: "comprar armaduras" }
                ],
                prefix
            }));
        }

        const item = getItem(itemName);
        if (!item) {
            return reply(F.tela({
                emoji: "❌",
                titulo: "Não achei esse equipamento",
                intro: `Nenhuma arma ou armadura se chama "${itemName}". Confira o nome ou use o código da peça.`,
                secoes: [{ emoji: "📌", titulo: "Exemplos", linhas: [
                    `• ${F.cmd(prefix, "equipar", "espada_ferro")}`,
                    `• ${F.cmd(prefix, "equipar", "Escudo de Madeira")}`
                ] }],
                dica: "Espólios de monstros não são equipamento: só armas e armaduras vão no personagem.",
                proximos: [
                    { nome: "inv", oque: "ver os nomes do que você carrega" },
                    { nome: "shoparmas", oque: "ver os códigos das armas" }
                ],
                prefix
            }));
        }

        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        if (!user.slots) {
            user.slots = { capacete: null, peitoral: null, calca: null, botas: null, arma: null, escudo: null, amuleto: null };
        }
        // Sem isto, um jogador sem inventário salvo derrubava o comando ao trocar de peça.
        if (!Array.isArray(user.inventario)) user.inventario = [];

        const targetSlot = item.slot;
        // A arma antiga pode estar só no campo legado user.arma (sem slot gravado).
        const previousItemId = user.slots[targetSlot] || (targetSlot === "arma" ? user.arma : null) || null;
        const mesmoItem = previousItemId && (typeof previousItemId === "object" ? previousItemId.id : previousItemId) === item.id;

        if (mesmoItem) {
            const statsIguais = calculateCharacterStats(user);
            return reply(F.tela({
                emoji: "⚔️",
                titulo: "Você já estava usando",
                intro: `*${item.nome}* já está no espaço ${NOME_ESPACO[targetSlot] || targetSlot}. Nada mudou.`,
                secoes: [{ emoji: "📜", titulo: "Equipamento", linhas: [
                    F.campo("Espaço", NOME_ESPACO[targetSlot] || targetSlot),
                    F.campo("Raridade", item.raridade),
                    atributos(item) ? F.campo("Bônus", atributos(item)) : null,
                    F.campo("Poder de combate", formatNumber(statsIguais.cp))
                ] }],
                dica: "Para trocar, equipe outra peça do mesmo espaço que esteja na mochila.",
                proximos: [
                    { nome: "boneco", oque: "ver a ficha completa" },
                    { nome: "inv", oque: "ver sua mochila" }
                ],
                prefix
            }));
        }

        // Só veste o que está na mochila, para todo mundo. Antes itens de até 500
        // moedas (e qualquer um, para o dono) eram vestidos sem estar na mochila,
        // e a peça antiga voltava para a mochila: equipar virava fábrica de itens.
        // Procura primeiro pelo código exato; nome solto só para itens antigos.
        const inventario = user.inventario;
        const nomeItem = item.nome.toLowerCase();
        let itemIdx = inventario.findIndex(i => i && typeof i === "object" && i.id === item.id);
        if (itemIdx === -1) {
            itemIdx = inventario.findIndex(i => {
                if (typeof i === "object" && i !== null) return Boolean(i.nome && i.nome.toLowerCase().includes(nomeItem));
                if (typeof i === "string") return i.toLowerCase().includes(nomeItem);
                return false;
            });
        }

        if (itemIdx === -1) {
            return reply(F.tela({
                emoji: "🎒",
                titulo: "Esse item não está na sua mochila",
                intro: `Para vestir *${item.nome}* você precisa ter a peça primeiro.`,
                secoes: [{ emoji: "🛡️", titulo: "O item", linhas: [
                    F.campo("Espaço", NOME_ESPACO[item.slot] || item.slot),
                    F.campo("Raridade", item.raridade),
                    F.campo("Atributos", atributos(item)),
                    F.campo("Preço na loja", moedas(item.preco))
                ] }],
                dica: "Se a peça estiver no baú, tire de lá antes de equipar.",
                proximos: [
                    lojaDoItem(item),
                    { nome: "inv", oque: "ver o que você carrega" },
                    { nome: "bau", oque: "ver o que está guardado no baú" }
                ],
                prefix
            }));
        }

        // Tira a peça da mochila e devolve a que estava vestida (troca 1 por 1,
        // então a mochila nunca estoura aqui).
        user.inventario.splice(itemIdx, 1);
        let nomeAnterior = null;
        if (previousItemId) {
            const oldItem = typeof previousItemId === "object" ? previousItemId : getItem(previousItemId);
            if (oldItem) {
                user.inventario.push({ ...oldItem });
                nomeAnterior = oldItem.nome || oldItem.name || null;
            } else {
                user.inventario.push(String(previousItemId));
                nomeAnterior = String(previousItemId);
            }
        }

        user.slots[targetSlot] = item.id;
        if (targetSlot === "arma") {
            user.arma = item.id;
        }

        // Mochila que ficou vazia só é gravada com force: o save normal preserva o
        // inventário antigo quando chega '[]', e a peça reapareceria na mochila.
        dataService.saveUser(user, user.inventario.length ? undefined : { force: true });
        const stats = calculateCharacterStats(user);
        const bonus = atributos(item);

        return reply(F.tela({
            emoji: "⚔️",
            titulo: mesmoItem ? "Você já estava usando" : "Equipamento vestido",
            intro: mesmoItem
                ? `*${item.nome}* já estava no espaço ${NOME_ESPACO[targetSlot] || targetSlot}. Nada mudou.`
                : `Você equipou *${item.nome}*${nomeAnterior ? ` no lugar de *${nomeAnterior}*` : ""}.`,
            secoes: [{ emoji: "📜", titulo: "Equipamento", linhas: [
                F.campo("Espaço", NOME_ESPACO[targetSlot] || targetSlot),
                F.campo("Raridade", item.raridade),
                bonus ? F.campo("Bônus", bonus) : null,
                F.campo("Poder de combate", formatNumber(stats.cp)),
                (nomeAnterior && !mesmoItem) ? F.campo("Voltou para a mochila", nomeAnterior) : null
            ] }],
            dica: targetSlot === "arma" ? "Forjar a arma aumenta o dano de todos os seus ataques." : "Preencha os sete espaços para somar o máximo de defesa e vida.",
            proximos: [
                { nome: "boneco", oque: "ver a ficha completa" },
                targetSlot === "arma" ? { nome: "forjar", oque: "fortalecer a arma" } : { nome: "inv", oque: "ver sua mochila" },
                { nome: "hunt", oque: "testar numa caçada" }
            ],
            prefix
        }));
    }
};
