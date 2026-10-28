/**
 * Comando .shoparmaduras / .lojaarmaduras / .comprararmadura
 * Forja e loja de armaduras (Capacetes, Peitorais, Calças, Botas, Escudos e Amuletos)
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { ITEMS_DB, getItem, calculateCharacterStats } = require("../../services/rpgEquipmentService");
const { formatNumber, moedas, plural, NOME_ESPACO } = require("../../utils/textoRpg");
const F = require("../../utils/formato");

/** Título de cada vitrine por espaço. */
const TITULO_SLOT = { capacete: "Capacetes", peitoral: "Peitorais", calca: "Calças", botas: "Botas", escudo: "Escudos", amuleto: "Amuletos" };
const SLOTS = ["capacete", "peitoral", "calca", "botas", "escudo", "amuleto"];

/** Aceita "calça", "Botas", "ESCUDO"... e devolve a chave do espaço. */
const chaveSlot = t => String(t || "").normalize("NFD").replace(/[^\p{L}]/gu, "").toLowerCase();

/** Atributos que a peça realmente dá, na ordem em que o jogador lê. */
function atributos(a) {
    const partes = [];
    if (a.def) partes.push(`DEF +${formatNumber(a.def)}`);
    if (a.hp) partes.push(`HP +${formatNumber(a.hp)}`);
    if (a.atk) partes.push(`ATK +${formatNumber(a.atk)}`);
    if (a.crit) partes.push(`crítico +${a.crit}%`);
    if (a.esq) partes.push(`esquiva +${a.esq}%`);
    if (a.bloq) partes.push(`bloqueio +${a.bloq}%`);
    if (a.cp) partes.push(`poder ${formatNumber(a.cp)}`);
    return partes.join(" · ");
}

/** Duas linhas por peça: nome e preço; atributos e comando de compra pronto. */
function linhasPeca(a, prefix) {
    return [
        `• ${a.raridade} *${a.nome}* — ${moedas(a.preco)}`,
        `   ${atributos(a)} · ${F.cmd(prefix, "shoparmaduras", a.id)}`
    ];
}

module.exports = {
    name: "shoparmaduras",
    aliases: ["lojaarmaduras", "comprararmadura", "armaduras", "forjaequipamentos"],
    category: "rpg",
    subcategory: "Equipamento & Forja",
    description: "Loja de capacetes, peitorais, calças, botas, escudos e amuletos",
    usage: "[categoria ou código da peça]",
    examples: [
        " — mostra as categorias e a melhor peça que cabe no seu saldo",
        "escudo — lista todos os escudos com preço e atributos",
        "capacete_ferro — compra a peça e já veste"
    ],
    cooldownMs: 2000,
    execute: async ({ sender, text, reply, prefix = "." }) => {
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);
        const buyQuery = (text || "").trim();
        const saldo = user.coins || 0;

        const armors = Object.values(ITEMS_DB).filter(i => i.slot !== "arma");

        // Vitrine por SLOT. Antes a loja fazia slice(0, 12) numa lista de 51 itens:
        // tudo que foi adicionado depois (inclusive os tiers Lendário/Transcendente)
        // ficava invisível — comprável só por id, mas impossível de descobrir.
        const alvoSlot = SLOTS.find(s => s === chaveSlot(buyQuery));
        if (alvoSlot) {
            const doSlot = armors.filter(i => i.slot === alvoSlot)
                .sort((a, b) => a.preco - b.preco);
            const cabem = doSlot.filter(i => i.preco <= saldo).length;
            const outras = SLOTS.filter(s => s !== alvoSlot).slice(0, 2);
            return reply(F.tela({
                emoji: "🛡️",
                titulo: `${TITULO_SLOT[alvoSlot]} da forja`,
                intro: `Seu saldo: *${moedas(saldo)}*. São ${plural(doSlot.length, "peça", "peças")} para ${NOME_ESPACO[alvoSlot] || alvoSlot}, e ${cabem ? `${plural(cabem, "cabe", "cabem")} no seu saldo agora` : "nenhuma cabe no seu saldo ainda"}.`,
                secoes: [{ emoji: "📜", titulo: "Peças à venda", linhas: doSlot.flatMap(a => linhasPeca(a, prefix)) }],
                dica: "Copie o comando ao lado da peça para comprar. Ela já sai vestida.",
                proximos: [
                    ...outras.map(s => ({ nome: "shoparmaduras", args: s, oque: `ver ${TITULO_SLOT[s].toLowerCase()}` })),
                    { nome: "boneco", oque: "ver o que você está vestindo" }
                ],
                prefix
            }));
        }

        if (buyQuery) {
            const item = getItem(buyQuery);
            if (!item || item.slot === "arma") {
                const ehArma = item && item.slot === "arma";
                return reply(F.tela({
                    emoji: "❌",
                    titulo: ehArma ? "Isso é uma arma" : "Não achei essa armadura",
                    intro: ehArma
                        ? `*${item.nome}* está à venda no arsenal, não aqui na forja de armaduras.`
                        : `Procurei "${buyQuery}" na forja e nenhuma peça tem esse nome ou código.`,
                    secoes: [{ emoji: "📂", titulo: "Categorias da forja", linhas: SLOTS.map(s => `• ${F.cmd(prefix, "shoparmaduras", s)} — ${TITULO_SLOT[s]}`) }],
                    dica: "Use o código que aparece ao lado de cada peça na vitrine, por exemplo escudo_madeira.",
                    proximos: [
                        ehArma ? { nome: "shoparmas", args: item.id, oque: `comprar ${item.nome}` } : null,
                        { nome: "shoparmaduras", oque: "ver a forja inteira" }
                    ].filter(Boolean),
                    prefix
                }));
            }

            if (saldo < item.preco) {
                return reply(F.tela({
                    emoji: "🪙",
                    titulo: "Moedas insuficientes",
                    intro: `*${item.nome}* custa *${moedas(item.preco)}* e você tem ${moedas(saldo)}. Faltam *${moedas(item.preco - saldo)}*.`,
                    secoes: [{ emoji: "🛡️", titulo: "A peça", linhas: [
                        F.campo("Espaço", NOME_ESPACO[item.slot] || item.slot),
                        F.campo("Raridade", item.raridade),
                        F.campo("Atributos", atributos(item))
                    ] }],
                    dica: `Caçadas e masmorras rendem moedas. Enquanto isso, veja peças mais baratas de ${TITULO_SLOT[item.slot] ? TITULO_SLOT[item.slot].toLowerCase() : "armadura"}.`,
                    proximos: [
                        { nome: "hunt", oque: "caçar monstros por moedas" },
                        { nome: "dungeon", oque: "encarar uma masmorra" },
                        { nome: "shoparmaduras", args: item.slot, oque: "comparar com outras peças" }
                    ],
                    prefix
                }));
            }

            if (!Array.isArray(user.inventario)) user.inventario = [];
            if (!user.slots) user.slots = {};

            // A peça que estava vestida volta para a mochila. Antes ela sumia e a
            // comprada ia para o corpo E para a mochila (cópia de graça). Sem espaço
            // para devolver a antiga, a compra é recusada antes de cobrar.
            const refAnterior = user.slots[item.slot] || null;
            const anterior = refAnterior ? (typeof refAnterior === "object" ? refAnterior : getItem(refAnterior)) : null;
            const nomeAnterior = anterior ? (anterior.nome || anterior.name || String(anterior.id || refAnterior)) : (refAnterior ? String(refAnterior) : null);
            const limiteMochila = user.mochila || 20;
            if (refAnterior && user.inventario.length >= limiteMochila) {
                return reply(F.tela({
                    emoji: "🎒",
                    titulo: "Mochila cheia",
                    intro: `Para vestir *${item.nome}*, *${nomeAnterior}* precisa voltar para a mochila, e ela está cheia. Não cobrei nada.`,
                    secoes: [{ emoji: "📊", titulo: "Sua mochila", linhas: [
                        F.campo("Ocupação", `${formatNumber(user.inventario.length)} de ${formatNumber(limiteMochila)}`),
                        F.campo(`Vestido em ${NOME_ESPACO[item.slot] || item.slot}`, nomeAnterior),
                        F.campo("Preço da nova", moedas(item.preco))
                    ] }],
                    dica: "Libere pelo menos um espaço e compre de novo: a peça antiga fica guardada na mochila.",
                    proximos: [
                        { nome: "vender", args: "loot", oque: "vender espólios para liberar espaço" },
                        { nome: "mochila", args: "up", oque: "aumentar a mochila" },
                        { nome: "shoparmaduras", args: item.id, oque: "tentar a compra de novo" }
                    ],
                    prefix
                }));
            }

            user.coins -= item.preco;
            if (refAnterior) user.inventario.push(anterior ? { ...anterior } : String(refAnterior));
            user.slots[item.slot] = item.id;

            await dataService.saveXpData(xpData);
            const stats = calculateCharacterStats(user);

            return reply(F.tela({
                emoji: "🛡️",
                titulo: "Armadura comprada e vestida",
                intro: `Você pagou *${moedas(item.preco)}* por *${item.nome}* e já está usando.`,
                secoes: [{ emoji: "📜", titulo: "Compra", linhas: [
                    F.campo("Espaço", NOME_ESPACO[item.slot] || item.slot),
                    F.campo("Raridade", item.raridade),
                    F.campo("Bônus", atributos(item)),
                    F.campo("Poder de combate", formatNumber(stats.cp)),
                    F.campo("Saldo", moedas(user.coins || 0)),
                    nomeAnterior ? F.campo("Voltou para a mochila", nomeAnterior) : null
                ] }],
                dica: "Armadura completa em todos os espaços soma muita defesa e vida.",
                proximos: [
                    { nome: "boneco", oque: "ver a ficha com tudo o que está vestindo" },
                    { nome: "inv", oque: "ver sua mochila" },
                    { nome: "shoparmaduras", oque: "voltar para a forja" }
                ],
                prefix
            }));
        }

        const linhasCategorias = SLOTS.map(s => {
            const doSlot = armors.filter(i => i.slot === s);
            if (!doSlot.length) return null;
            const precos = doSlot.map(i => i.preco);
            return `• ${F.cmd(prefix, "shoparmaduras", s)} — ${TITULO_SLOT[s]}: ${plural(doSlot.length, "peça", "peças")}, de ${formatNumber(Math.min(...precos))} a ${moedas(Math.max(...precos))}`;
        });

        // Destaque: o melhor item que o jogador JÁ consegue pagar agora.
        const acessiveis = armors.filter(i => i.preco <= saldo).sort((a, b) => b.cp - a.cp);
        const maisBarata = [...armors].sort((a, b) => a.preco - b.preco)[0];
        const linhasDestaque = acessiveis.length
            ? linhasPeca(acessiveis[0], prefix)
            : [`Nenhuma ainda. A mais barata é *${maisBarata.nome}*, por ${moedas(maisBarata.preco)}.`];

        return reply(F.tela({
            emoji: "🛡️",
            titulo: "Forja de armaduras",
            intro: `Seu saldo: *${moedas(saldo)}*. Tenho ${plural(armors.length, "peça", "peças")} em ${plural(SLOTS.length, "categoria", "categorias")}; abra uma para ver preços e atributos.`,
            secoes: [
                { emoji: "📂", titulo: "Categorias", linhas: linhasCategorias },
                { emoji: "⭐", titulo: "A melhor que você pode pagar", linhas: linhasDestaque }
            ],
            dica: "Toda peça comprada já sai vestida no espaço dela.",
            proximos: [
                { nome: "shoparmaduras", args: "escudo", oque: "ver os escudos" },
                { nome: "shoparmas", oque: "ver o arsenal de armas" },
                { nome: "boneco", oque: "ver o que você está vestindo" }
            ],
            prefix
        }));
    }
};
