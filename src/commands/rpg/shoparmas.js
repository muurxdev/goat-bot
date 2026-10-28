/**
 * Comando .shoparmas / .lojaarmas / .comprararma
 * Arsenal e loja de armas brancas, mágicas e tesouros sagrados
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { ITEMS_DB, getItem, calculateCharacterStats } = require("../../services/rpgEquipmentService");
const { formatNumber, moedas, plural } = require("../../utils/textoRpg");
const F = require("../../utils/formato");

/** Chave de raridade sem emoji nem acento: "🟠 Lendário" vira "lendario". */
const chaveTexto = t => String(t || "").normalize("NFD").replace(/[^\p{L}]/gu, "").toLowerCase();

/** Atributos que a arma realmente dá. */
function atributos(w, comPoder = true) {
    const partes = [`ATK +${formatNumber(w.atk)}`];
    if (w.crit) partes.push(`crítico +${w.crit}%`);
    if (w.def) partes.push(`DEF +${formatNumber(w.def)}`);
    if (w.hp) partes.push(`HP +${formatNumber(w.hp)}`);
    if (comPoder && w.cp) partes.push(`poder ${formatNumber(w.cp)}`);
    return partes.join(" · ");
}

/** Duas linhas por arma: nome e preço; atributos e comando de compra pronto. */
function linhasArma(w, prefix) {
    return [
        `• *${w.nome}* — ${moedas(w.preco)}`,
        `   ${atributos(w, false)} · ${F.cmd(prefix, "shoparmas", w.id)}`
    ];
}

module.exports = {
    name: "shoparmas",
    aliases: ["lojaarmas", "comprararma", "armas", "arsenal"],
    category: "rpg",
    subcategory: "Equipamento & Forja",
    description: "Loja de espadas, machados e tesouros sagrados do Reino",
    usage: "[raridade ou código da arma]",
    examples: [
        " — mostra todas as armas com preço e atributos",
        "lendario — mostra só as armas lendárias",
        "espada_madeira — compra a arma e já empunha"
    ],
    cooldownMs: 2000,
    execute: async ({ sender, text, reply, prefix = "." }) => {
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);
        const buyQuery = (text || "").trim();
        const saldo = user.coins || 0;

        const weapons = Object.values(ITEMS_DB).filter(i => i.slot === "arma");
        const ordenadas = [...weapons].sort((a, b) => a.preco - b.preco);
        const porTier = {};
        for (const w of ordenadas) (porTier[w.raridade] = porTier[w.raridade] || []).push(w);

        // Vitrine por raridade: .shoparmas lendario, .shoparmas transcendente...
        const chaveTier = chaveTexto(buyQuery);
        if (chaveTier) {
            const doTier = ordenadas.filter(w => chaveTexto(w.raridade) === chaveTier);
            if (doTier.length) {
                const cabem = doTier.filter(w => w.preco <= saldo).length;
                return reply(F.tela({
                    emoji: "🗡️",
                    titulo: `Armas ${doTier[0].raridade}`,
                    intro: `Seu saldo: *${moedas(saldo)}*. São ${plural(doTier.length, "arma", "armas")} desta raridade; ${cabem ? `${plural(cabem, "cabe", "cabem")} no seu saldo agora` : "nenhuma cabe no seu saldo ainda"}.`,
                    secoes: [{ emoji: "📜", titulo: "À venda", linhas: doTier.flatMap(w => linhasArma(w, prefix)) }],
                    dica: "Copie o comando ao lado da arma para comprar. Ela já sai empunhada.",
                    proximos: [
                        { nome: "shoparmas", oque: "ver o arsenal inteiro" },
                        { nome: "forjar", oque: "fortalecer a arma que você já usa" }
                    ],
                    prefix
                }));
            }
        }

        if (buyQuery) {
            const item = getItem(buyQuery);
            if (!item || item.slot !== "arma") {
                const ehArmadura = item && item.slot !== "arma";
                const tiers = Object.keys(porTier).map(t => `• ${F.cmd(prefix, "shoparmas", chaveTexto(t))} — ${t}`);
                return reply(F.tela({
                    emoji: "❌",
                    titulo: ehArmadura ? "Isso é uma armadura" : "Não achei essa arma",
                    intro: ehArmadura
                        ? `*${item.nome}* está à venda na forja de armaduras, não no arsenal.`
                        : `Procurei "${buyQuery}" no arsenal e nenhuma arma nem raridade tem esse nome.`,
                    secoes: [{ emoji: "📂", titulo: "Raridades do arsenal", linhas: tiers }],
                    dica: "Use o código que aparece ao lado de cada arma na vitrine, por exemplo espada_madeira.",
                    proximos: [
                        ehArmadura ? { nome: "shoparmaduras", args: item.id, oque: `comprar ${item.nome}` } : null,
                        { nome: "shoparmas", oque: "ver o arsenal inteiro" }
                    ].filter(Boolean),
                    prefix
                }));
            }

            if (saldo < item.preco) {
                return reply(F.tela({
                    emoji: "🪙",
                    titulo: "Moedas insuficientes",
                    intro: `*${item.nome}* custa *${moedas(item.preco)}* e você tem ${moedas(saldo)}. Faltam *${moedas(item.preco - saldo)}*.`,
                    secoes: [{ emoji: "🗡️", titulo: "A arma", linhas: [
                        F.campo("Raridade", item.raridade),
                        F.campo("Atributos", atributos(item))
                    ] }],
                    dica: "Caçadas e masmorras rendem moedas. Uma arma mais barata forjada algumas vezes também dá conta do recado.",
                    proximos: [
                        { nome: "hunt", oque: "caçar monstros por moedas" },
                        { nome: "dungeon", oque: "encarar uma masmorra" },
                        { nome: "shoparmas", args: chaveTexto(item.raridade), oque: "comparar com armas da mesma raridade" }
                    ],
                    prefix
                }));
            }

            if (!Array.isArray(user.inventario)) user.inventario = [];
            if (!user.slots) user.slots = {};

            // A arma que estava na mão volta para a mochila. Antes ela sumia e a
            // comprada ia para a mão E para a mochila (cópia de graça). Sem espaço
            // para devolver a antiga, a compra é recusada antes de cobrar.
            const refAnterior = user.slots.arma || user.arma || null;
            const anterior = refAnterior ? (typeof refAnterior === "object" ? refAnterior : getItem(refAnterior)) : null;
            const nomeAnterior = anterior ? (anterior.nome || anterior.name || String(anterior.id || refAnterior)) : (refAnterior ? String(refAnterior) : null);
            const limiteMochila = user.mochila || 20;
            if (refAnterior && user.inventario.length >= limiteMochila) {
                return reply(F.tela({
                    emoji: "🎒",
                    titulo: "Mochila cheia",
                    intro: `Para empunhar *${item.nome}*, *${nomeAnterior}* precisa voltar para a mochila, e ela está cheia. Não cobrei nada.`,
                    secoes: [{ emoji: "📊", titulo: "Sua mochila", linhas: [
                        F.campo("Ocupação", `${formatNumber(user.inventario.length)} de ${formatNumber(limiteMochila)}`),
                        F.campo("Arma na mão", nomeAnterior),
                        F.campo("Preço da nova", moedas(item.preco))
                    ] }],
                    dica: "Libere pelo menos um espaço e compre de novo: a arma antiga fica guardada na mochila.",
                    proximos: [
                        { nome: "vender", args: "loot", oque: "vender espólios para liberar espaço" },
                        { nome: "mochila", args: "up", oque: "aumentar a mochila" },
                        { nome: "shoparmas", args: item.id, oque: "tentar a compra de novo" }
                    ],
                    prefix
                }));
            }

            user.coins -= item.preco;
            if (refAnterior) user.inventario.push(anterior ? { ...anterior } : String(refAnterior));
            user.slots.arma = item.id;
            user.arma = item.id;

            await dataService.saveXpData(xpData);
            const stats = calculateCharacterStats(user);

            return reply(F.tela({
                emoji: "🗡️",
                titulo: "Arma comprada e empunhada",
                intro: `Você pagou *${moedas(item.preco)}* por *${item.nome}* e ela já está na sua mão.`,
                secoes: [{ emoji: "📜", titulo: "Compra", linhas: [
                    F.campo("Raridade", item.raridade),
                    F.campo("Bônus", atributos(item)),
                    F.campo("Poder de combate", formatNumber(stats.cp)),
                    F.campo("Saldo", moedas(user.coins || 0)),
                    nomeAnterior ? F.campo("Voltou para a mochila", nomeAnterior) : null
                ] }],
                dica: "Forjar a arma aumenta o dano de todos os seus ataques.",
                proximos: [
                    { nome: "forjar", oque: "deixar a lâmina mais forte" },
                    { nome: "boneco", oque: "ver a ficha do personagem" },
                    { nome: "hunt", oque: "testar a arma numa caçada" }
                ],
                prefix
            }));
        }

        // Enquanto o arsenal for pequeno mostramos tudo; passando de 18 armas a
        // mensagem começaria a arriscar o limite do WhatsApp, então aí a vitrine
        // passa a ser por raridade — mesma ideia da loja de armaduras.
        const LIMITE_VITRINE = 18;
        const secoes = ordenadas.length > LIMITE_VITRINE
            ? [{ emoji: "📂", titulo: "Raridades", linhas: Object.entries(porTier).map(([tier, lista]) => {
                const precos = lista.map(i => i.preco);
                return `• ${F.cmd(prefix, "shoparmas", chaveTexto(tier))} — ${tier}: ${plural(lista.length, "arma", "armas")}, de ${formatNumber(Math.min(...precos))} a ${moedas(Math.max(...precos))}`;
            }) }]
            : Object.entries(porTier).map(([tier, lista]) => ({ emoji: "", titulo: tier, linhas: lista.flatMap(w => linhasArma(w, prefix)) }));

        const melhor = ordenadas.filter(w => w.preco <= saldo).sort((a, b) => b.cp - a.cp)[0];

        return reply(F.tela({
            emoji: "🗡️",
            titulo: "Arsenal do Reino",
            intro: `Seu saldo: *${moedas(saldo)}*. ${melhor ? `A melhor arma que cabe no seu bolso é *${melhor.nome}*.` : `A mais barata custa ${moedas(ordenadas[0].preco)}.`}`,
            secoes,
            dica: "Copie o comando ao lado da arma para comprar. Ela já sai empunhada.",
            proximos: [
                melhor ? { nome: "shoparmas", args: melhor.id, oque: `comprar ${melhor.nome}` } : { nome: "hunt", oque: "caçar para juntar moedas" },
                { nome: "shoparmaduras", oque: "ver a forja de armaduras" },
                { nome: "forjar", oque: "fortalecer a arma que você já usa" }
            ],
            prefix
        }));
    }
};
