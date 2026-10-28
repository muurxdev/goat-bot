/**
 * Comando .boneco / .personagem / .avatar / .statusrpg
 * Renderização dinâmica do Boneco de Emoji com níveis de armadura e customização de atributos
 */

const dataService = require("../../services/dataService");
const { initializeUser, barraXP, getCargo } = require("../../services/xpService");
const { getItem } = require("../../services/rpgEquipmentService");
const { calculateFullCharacterStats, renderCharacterAvatar, RACES, ELEMENTS, getRebirthInfo, resolveHp } = require("../../services/characterEngine");
const { formatNumber, marcar, NOME_ESPACO } = require("../../utils/textoRpg");
const F = require("../../utils/formato");
const cartao = require("../../services/cartaoService");

module.exports = {
    name: "boneco",
    aliases: ["personagem", "avatar", "meuboneco", "meuheroi", "criarboneco"],
    category: "rpg",
    subcategory: "Personagem",
    description: "Mostra a ficha do seu personagem: visual, equipamento e atributos",
    usage: "[nome <nome> | raca <raça> | elemento <elemento>]",
    examples: [
        " — mostra a ficha completa do personagem",
        "nome Arthur Pendragon — muda o nome do personagem",
        "raca demonio — escolhe a raça",
        "elemento fogo — escolhe o elemento de combate"
    ],
    cooldownMs: 2000,
    execute: async ({ sender, args, reply, client, from, info, prefix = "." }) => {
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);
        const stats = calculateFullCharacterStats(user);
        const rebirthInfo = getRebirthInfo(user);

        const sub = (args[0] || "").toLowerCase().trim();
        const param = args.slice(1).join(" ").trim();

        // 1. ALTERAR NOME DO PERSONAGEM
        if (sub === "nome" || sub === "nick" || sub === "setnome") {
            const nomeAtual = user.nicknameRpg || user.name || "";
            if (!param) {
                return reply(F.tela({
                    emoji: "👑",
                    titulo: "Nome do personagem",
                    intro: nomeAtual
                        ? `Hoje seu personagem se chama *${nomeAtual}*. Escolha como quer ser chamado nas batalhas.`
                        : "Seu personagem ainda não tem nome. Escolha como quer ser chamado nas batalhas.",
                    secoes: [
                        { emoji: "⌨️", titulo: "Digite assim", linhas: [F.cmd(prefix, "boneco", "nome <nome>")] },
                        { emoji: "📌", titulo: "Exemplos", linhas: [
                            `• ${F.cmd(prefix, "boneco", "nome Arthur Pendragon")}`,
                            `• ${F.cmd(prefix, "boneco", "nome Capitão Sombrio")}`
                        ] }
                    ],
                    proximos: [{ nome: "boneco", oque: "ver a ficha" }],
                    prefix
                }));
            }
            user.nicknameRpg = param;
            user.name = param;
            await dataService.saveXpData(xpData);
            return reply(F.tela({
                emoji: "👑",
                titulo: "Nome trocado",
                intro: `Pronto, seu personagem agora se chama *${param}*.`,
                secoes: [{ emoji: "📜", titulo: "Mudança", linhas: [
                    F.campo("Antes", nomeAtual || "sem nome"),
                    F.campo("Agora", param)
                ] }],
                proximos: [
                    { nome: "boneco", oque: "ver a ficha com o nome novo" },
                    { nome: "boneco", args: "raca", oque: "escolher a raça" }
                ],
                prefix
            }));
        }

        const racaAtualKey = (user.characterRace || user.character_race || "humano").toLowerCase();
        const elemAtualKey = (user.characterElement || user.character_element || "").toLowerCase();

        // 2. ALTERAR RAÇA
        if (sub === "raca" || sub === "raça" || sub === "classe-raca") {
            const rKey = param.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
            if (!RACES[rKey]) {
                const linhas = Object.keys(RACES).map(k => {
                    const r = RACES[k];
                    const atual = k === racaAtualKey ? " · _a sua_" : "";
                    return `• ${F.cmd(prefix, "boneco", "raca " + k)} — ${r.emoji} ${r.nome}: +${formatNumber(r.bonusAtk)} ATK, +${formatNumber(r.bonusHp)} HP${atual}`;
                });
                return reply(F.tela({
                    emoji: "🧬",
                    titulo: param ? "Não conheço essa raça" : "Escolha uma raça",
                    intro: param
                        ? `"${param}" não é uma das raças do Reino. Escolha uma da lista abaixo.`
                        : "A raça dá um bônus fixo de ataque e vida ao seu personagem.",
                    secoes: [{ emoji: "📜", titulo: "Raças", linhas }],
                    dica: "Dá para trocar de raça quando quiser.",
                    proximos: [(() => {
                        const sugestao = Object.keys(RACES).find(k => k !== racaAtualKey);
                        return { nome: "boneco", args: "raca " + sugestao, oque: "entrar para " + RACES[sugestao].nome };
                    })()],
                    prefix
                }));
            }
            user.characterRace = rKey;
            user.character_race = rKey;
            await dataService.saveXpData(xpData);
            const r = RACES[rKey];
            return reply(F.tela({
                emoji: "✨",
                titulo: "Raça escolhida",
                intro: `Sua raça agora é *${r.nome}* ${r.emoji}.`,
                secoes: [{ emoji: "📜", titulo: "Bônus da raça", linhas: [
                    F.campo("Ataque", `+${formatNumber(r.bonusAtk)}`),
                    F.campo("Vida", `+${formatNumber(r.bonusHp)} HP`),
                    r.desc ? F.campo("Traço", r.desc) : null
                ] }],
                proximos: [
                    { nome: "boneco", oque: "ver a ficha atualizada" },
                    { nome: "boneco", args: "elemento", oque: "escolher o elemento" }
                ],
                prefix
            }));
        }

        // 3. ALTERAR ELEMENTO
        if (sub === "elemento" || sub === "elem") {
            const eKey = param.toLowerCase();
            if (!ELEMENTS[eKey]) {
                const linhas = Object.keys(ELEMENTS).map(k => {
                    const e = ELEMENTS[k];
                    const atual = k === elemAtualKey ? " · _o seu_" : "";
                    return `• ${F.cmd(prefix, "boneco", "elemento " + k)} — ${e.emoji} ${e.nome}${e.desc ? `: ${e.desc}` : ""}${atual}`;
                });
                return reply(F.tela({
                    emoji: "🔥",
                    titulo: param ? "Não conheço esse elemento" : "Escolha um elemento",
                    intro: param
                        ? `"${param}" não é um elemento de combate. Escolha um da lista abaixo.`
                        : "O elemento define o efeito extra dos seus golpes.",
                    secoes: [{ emoji: "📜", titulo: "Elementos", linhas }],
                    proximos: [(() => {
                        const sugestao = Object.keys(ELEMENTS).find(k => k !== elemAtualKey);
                        return { nome: "boneco", args: "elemento " + sugestao, oque: "lutar com " + ELEMENTS[sugestao].nome };
                    })()],
                    prefix
                }));
            }
            user.characterElement = eKey;
            user.character_element = eKey;
            await dataService.saveXpData(xpData);
            const e = ELEMENTS[eKey];
            return reply(F.tela({
                emoji: "🔥",
                titulo: "Elemento escolhido",
                intro: `Seu elemento de combate agora é *${e.nome}* ${e.emoji}.`,
                secoes: [{ emoji: "📜", titulo: "Efeito", linhas: [e.desc ? F.campo("Nos golpes", e.desc) : null] }],
                proximos: [
                    { nome: "boneco", oque: "ver a ficha atualizada" },
                    { nome: "hunt", oque: "testar numa caçada" }
                ],
                prefix
            }));
        }

        // 4. RENDERIZAÇÃO VISUAL COMPLETA
        const avatarVisual = renderCharacterAvatar(user, stats);
        const slots = user.slots || {};
        const codinome = user.nicknameRpg || user.name || "Cavaleiro Sagrado do Reino";

        function getSlotDisplay(slotKey) {
            const itemRef = slotKey === "arma" ? (slots.arma || user.arma) : slots[slotKey];
            if (!itemRef) return "_vazio_";
            const item = typeof itemRef === "object" ? itemRef : getItem(itemRef);
            if (!item) return "_vazio_";
            const forja = slotKey === "arma" ? ` · forja +${user.forgeLevel || 0}` : "";
            return `${item.nome} (${item.raridade || "⚪ Comum"})${forja}`;
        }

        const barra = barraXP(user.xp || 0, user.level || 1);
        const cargo = getCargo(user.level || 1);
        const _hp = resolveHp(user);
        const ESPACOS = ["capacete", "peitoral", "calca", "botas", "arma", "escudo", "amuleto"];
        const vazios = ESPACOS.filter(s => getSlotDisplay(s) === "_vazio_");

        const doc = F.tela({
            emoji: "🛡️",
            titulo: `Ficha de ${codinome}`,
            intro: `${marcar(sender)} · nível *${formatNumber(user.level || 1)}* · *${formatNumber(stats.cp)}* de poder de combate · ${formatNumber(_hp.atual)} de ${formatNumber(_hp.max)} HP.`,
            secoes: [
                avatarVisual,
                { emoji: "🧬", titulo: "Identidade", linhas: [
                    F.campo("Raça", RACES[racaAtualKey] ? `${RACES[racaAtualKey].emoji} ${RACES[racaAtualKey].nome}` : stats.race),
                    F.campo("Elemento", ELEMENTS[elemAtualKey] ? `${ELEMENTS[elemAtualKey].emoji} ${ELEMENTS[elemAtualKey].nome}` : (stats.element || "nenhum")),
                    F.campo("Patente", `${cargo}${user.classe ? ` (${user.classe})` : ""}`),
                    F.campo("Nível", `${formatNumber(user.level || 1)} ${barra}`),
                    F.campo("Reencarnações", `${formatNumber(rebirthInfo.rebirths)} (+${rebirthInfo.bonusDmgPercent}% de dano e XP)`)
                ] },
                { emoji: "⚔️", titulo: "Equipado", linhas: ESPACOS.map(s => F.campo(NOME_ESPACO[s], getSlotDisplay(s))) },
                { emoji: "📊", titulo: "Atributos", linhas: [
                    F.campo("Vida", `${formatNumber(_hp.atual)} / ${formatNumber(_hp.max)} HP (${_hp.percent}%)`),
                    _hp.barra,
                    F.campo("Ataque", formatNumber(stats.atk)),
                    F.campo("Defesa", formatNumber(stats.def)),
                    F.campo("Crítico", `${stats.crit}% · *Esquiva:* ${stats.esq}% · *Bloqueio:* ${stats.bloq}%`),
                    stats.hasFogueira ? F.campo("Fogueira acesa", "+20% de dano de queimadura") : null
                ] }
            ],
            dica: vazios.length
                ? `${vazios.length === 1 ? "Um espaço está vazio" : `${vazios.length} espaços estão vazios`} (${vazios.map(s => NOME_ESPACO[s]).join(", ")}). Cada peça vestida soma poder.`
                : "Todos os espaços preenchidos. Forjar a arma é o próximo passo para ficar mais forte.",
            proximos: [
                vazios.length ? { nome: vazios.includes("arma") ? "shoparmas" : "shoparmaduras", oque: "comprar o que falta" } : { nome: "forjar", oque: "fortalecer a arma" },
                { nome: "boneco", args: "nome <nome>", oque: "mudar o nome do personagem" },
                { nome: "boneco", args: "raca", oque: "ver e escolher a raça" },
                { nome: "boneco", args: "elemento", oque: "ver e escolher o elemento" }
            ],
            prefix
        });

        return cartao.enviarComCartao({
            ctx: { client, from, info, reply },
            texto: doc,
            mentions: [sender],
            gerar: async () => cartao.cartaoRpg({
                nome: codinome,
                classe: RACES[racaAtualKey]?.nome || user.classe || stats.race,
                raridade: cargo,
                nivel: user.level || 1,
                cp: stats.cp,
                atk: stats.atk,
                def: stats.def,
                hp: _hp.atual,
                hpMax: _hp.max,
                foto: await cartao.fotoDePerfil(client, sender),
                equipamentos: ["arma", "capacete", "peitoral", "calca", "botas", "amuleto"].map(slot => {
                    const t = getSlotDisplay(slot);
                    return [NOME_ESPACO[slot], t === "_vazio_" ? "" : t.replace(/ \(.*$/, "") + (slot === "arma" && user.forgeLevel ? ` +${user.forgeLevel}` : "")];
                })
            })
        });
    }
};
