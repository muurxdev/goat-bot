/**
 * Comando .reencarnar / .rebirth
 * Renascimento Supremo em duas modalidades:
 * 1. Normal: Exige Nível 100+, gratuito, reseta inventário, equipamentos e moedas por +25% DMG/XP perpétuo.
 * 2. Premium (.reencarnar premium): Exige Nível 500+ e 1 Bilhão de Coins (1.000.000.000).
 *    PRESERVA moedas restantes, inventário completo, todos os equipamentos/slots e nível de forja.
 *    Reseta apenas o Nível para 1 e Mundo para Floresta, concedendo o Grau de Rebirth (+25% perpétuo).
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { getRebirthInfo, calculateFullCharacterStats } = require("../../services/characterEngine");
const { mundos } = require("../../utils/constants");
const { formatNumber, moedas, plural, marcar, ordinalA } = require("../../utils/textoRpg");
const F = require("../../utils/formato");

const confirmacoesRebirth = new Map(); // sender -> { expiraEm: number, tipo: 'normal'|'premium' }

const CUSTO_PREMIUM_COINS = 1_000_000_000;
const NIVEL_MIN_PREMIUM = 500;
const NIVEL_MIN_NORMAL = 100;

/** Nome do mundo inicial, para onde toda reencarnação leva. */
const nomeMundoInicial = () => mundos.floresta?.nome || "o primeiro mundo";

/** Tela de confirmação vencida ou nunca pedida. */
function confirmacaoExpirada(p, premium) {
    return F.tela({
        emoji: "⏳",
        titulo: "Confirmação expirada",
        intro: "Essa confirmação passou do prazo de 60 segundos ou não foi pedida antes. Nada mudou no seu personagem.",
        dica: "Primeiro leia as condições; depois confirme em até 60 segundos.",
        prefix: p,
        proximos: [
            { nome: "reencarnar", args: premium ? "premium" : "", oque: "rever as condições" },
            { nome: "reencarnar", args: premium ? "premium confirmar" : "confirmar", oque: "confirmar logo em seguida" }
        ]
    });
}

module.exports = {
    name: "reencarnar",
    aliases: ["renascer", "rebirth", "reborn", "transcender", "ascensao-divina"],
    category: "rpg",
    subcategory: "Progressão",
    description: "Reencarne para ganhar +25% de dano e XP para sempre: comum (nível 100) ou premium (nível 500 e 1 bilhão, mantém o arsenal)",
    usage: "[premium] [confirmar]",
    examples: [
        " — mostra o que muda na reencarnação comum",
        "confirmar — faz a reencarnação comum (depois de ler o aviso)",
        "premium — mostra a reencarnação que mantém o arsenal",
        "premium confirmar — faz a reencarnação premium"
    ],
    cooldownMs: 4000,
    execute: async ({ sender, args, reply, prefix }) => {
        const p = prefix || ".";
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        const info = getRebirthInfo(user);
        const argsStr = args.map(a => a.toLowerCase().trim());
        const isPremium = argsStr.includes("premium") || argsStr.includes("vip") || argsStr.includes("ouro");
        const isConfirmar = argsStr.includes("confirmar") || argsStr.includes("sim") || argsStr.includes("confirm");

        // -------------------------------------------------------------
        // FLUXO DO REBIRTH PREMIUM
        // -------------------------------------------------------------
        if (isPremium) {
            // Validações do Rebirth Premium
            const nivelAtual = Number(user.level || 1);
            const saldoCoins = Number(user.coins || 0);

            if (nivelAtual < NIVEL_MIN_PREMIUM) {
                return reply(F.tela({
                    emoji: "🔒",
                    titulo: "Reencarnação premium trancada",
                    intro: `A premium pede *nível ${NIVEL_MIN_PREMIUM}*, e você está no nível *${formatNumber(nivelAtual)}*.`,
                    secoes: [
                        { emoji: "📜", titulo: "Requisitos", linhas: [
                            F.campo("Nível", `${formatNumber(nivelAtual)} de ${NIVEL_MIN_PREMIUM}`),
                            F.barra(nivelAtual / NIVEL_MIN_PREMIUM),
                            F.campo("Moedas", `${moedas(saldoCoins)} de ${moedas(CUSTO_PREMIUM_COINS)}`),
                            F.campo("Reencarnações", `${formatNumber(info.rebirths)} (bônus atual de +${info.bonusDmgPercent}%)`)
                        ] },
                        { emoji: "💎", titulo: "O que a premium mantém", linhas: [
                            "• Mochila inteira",
                            "• Todos os equipamentos vestidos",
                            `• Forja +${user.forgeLevel || 0}`,
                            "• As moedas que sobrarem depois de pagar"
                        ] }
                    ],
                    dica: info.canRebirth
                        ? "Você já pode fazer a reencarnação comum: ela é grátis, mas zera o arsenal."
                        : "Masmorra, chefes e missões são os caminhos mais rápidos para subir de nível.",
                    prefix: p,
                    proximos: [
                        info.canRebirth ? { nome: "reencarnar", oque: "ver a reencarnação comum" } : null,
                        { nome: "dungeon", oque: "subir de nível na masmorra" },
                        { nome: "boss", oque: "enfrentar chefes" },
                        { nome: "missao", oque: "fazer missões" }
                    ].filter(Boolean)
                }), [sender]);
            }

            if (saldoCoins < CUSTO_PREMIUM_COINS) {
                const faltam = CUSTO_PREMIUM_COINS - saldoCoins;
                return reply(F.tela({
                    emoji: "🪙",
                    titulo: "Moedas insuficientes para a premium",
                    intro: `Você já tem o nível, mas faltam *${moedas(faltam)}* para pagar a reencarnação premium.`,
                    secoes: [{ emoji: "💰", titulo: "Contas", linhas: [
                        F.campo("Custo", moedas(CUSTO_PREMIUM_COINS)),
                        F.campo("Seu saldo", moedas(saldoCoins)),
                        F.barra(saldoCoins / CUSTO_PREMIUM_COINS),
                        F.campo("Faltam", moedas(faltam))
                    ] }],
                    dica: "A reencarnação comum é grátis e dá o mesmo bônus, mas zera moedas, mochila e equipamentos.",
                    prefix: p,
                    proximos: [
                        { nome: "dungeon", oque: "juntar moedas na masmorra" },
                        { nome: "boss", oque: "enfrentar chefes" },
                        { nome: "reencarnar", oque: "ver a reencarnação comum" }
                    ]
                }), [sender]);
            }

            // Confirmação do Rebirth Premium
            if (!isConfirmar) {
                confirmacoesRebirth.set(sender, { expiraEm: Date.now() + 60000, tipo: "premium" });

                return reply(F.tela({
                    emoji: "👑",
                    titulo: "Reencarnação premium",
                    intro: `${marcar(sender)}, você vai para a *${ordinalA(info.rebirths + 1)} reencarnação* e passa a ter *+${(info.rebirths + 1) * 25}% de dano e XP* para sempre, mantendo o arsenal.`,
                    secoes: [
                        { emoji: "💎", titulo: "Você mantém", linhas: [
                            F.campo("Mochila", plural((user.inventario || []).length, "item", "itens")),
                            F.campo("Equipamentos", "todos continuam vestidos"),
                            F.campo("Forja", `+${user.forgeLevel || 0}`),
                            F.campo("Moedas", `${moedas(saldoCoins - CUSTO_PREMIUM_COINS)} depois de pagar ${moedas(CUSTO_PREMIUM_COINS)}`)
                        ] },
                        { emoji: "🔄", titulo: "Volta ao começo", linhas: [
                            F.campo("Nível", `${formatNumber(user.level || 1)} → 1`),
                            F.campo("Mundo", nomeMundoInicial()),
                            F.campo("Masmorra e torre", "andar 1")
                        ] }
                    ],
                    dica: "Esta confirmação vale por 60 segundos. Se não quiser, é só não confirmar.",
                    prefix: p,
                    proximos: [
                        { nome: "reencarnar", args: "premium confirmar", oque: "reencarnar agora" }
                    ]
                }), [sender]);
            }

            // Executa Confirmação Premium
            const pendente = confirmacoesRebirth.get(sender);
            if (!pendente || pendente.tipo !== "premium" || Date.now() > pendente.expiraEm) {
                confirmacoesRebirth.delete(sender);
                return reply(confirmacaoExpirada(p, true));
            }
            confirmacoesRebirth.delete(sender);

            // Debita 1 bilhão e aplica a transição Premium
            user.coins = Math.max(0, saldoCoins - CUSTO_PREMIUM_COINS);
            const nextRebirth = info.rebirths + 1;
            user.rebirthCount = nextRebirth;
            user.rebirth_count = nextRebirth;
            user.level = 1;
            user.xp = 0;
            user.mundo = 'floresta';
            user.dungeonFloor = 1;
            user.towerFloor = 1;
            user.hp = Math.max(120, user.hp || 120);

            // MANTÉM: inventario, inventory, slots, equipado, arma, forgeLevel, pets, skills, conquistas!
            await dataService.saveUser(user, { force: true });

            const newStats = calculateFullCharacterStats(user);

            return reply(F.tela({
                emoji: "🌟",
                titulo: `${ordinalA(nextRebirth)} reencarnação concluída`,
                intro: `${marcar(sender)} renasceu com *+${nextRebirth * 25}% de dano e XP* para sempre, e todo o arsenal continua com você.`,
                secoes: [
                    { emoji: "🌀", titulo: "Novo ciclo", linhas: [
                        F.campo("Reencarnações", formatNumber(nextRebirth)),
                        F.campo("Bônus permanente", `+${nextRebirth * 25}% de dano e XP`),
                        F.campo("Nível", `1, em ${nomeMundoInicial()}`)
                    ] },
                    { emoji: "💎", titulo: "O que ficou", linhas: [
                        F.campo("Moedas", moedas(user.coins || 0)),
                        F.campo("Mochila", plural((user.inventario || []).length, "item guardado", "itens guardados")),
                        F.campo("Forja", `+${user.forgeLevel || 0}`)
                    ] },
                    { emoji: "⚔️", titulo: "Seu poder agora", linhas: [
                        F.campo("Poder de combate", formatNumber(newStats.cp)),
                        `${F.campo("Ataque", formatNumber(newStats.atk))} · ${F.campo("Defesa", formatNumber(newStats.def))}`
                    ] }
                ],
                dica: "Com o arsenal intacto, os primeiros mundos passam rápido. Aproveite o bônus de XP para subir logo.",
                prefix: p,
                proximos: [
                    { nome: "hunt", oque: "recomeçar a subida" },
                    { nome: "dungeon", oque: "descer a masmorra de novo" }
                ]
            }), [sender]);
        }

        // -------------------------------------------------------------
        // FLUXO DO REBIRTH NORMAL (GRÁTIS, NÍVEL 100+)
        // -------------------------------------------------------------
        if (!info.canRebirth) {
            return reply(F.tela({
                emoji: "🔒",
                titulo: "Reencarnação ainda trancada",
                intro: `A reencarnação abre no *nível ${NIVEL_MIN_NORMAL}*, e você está no nível *${formatNumber(info.currentLevel)}*.`,
                secoes: [
                    { emoji: "📊", titulo: "Seu caminho", linhas: [
                        F.campo("Nível", `${formatNumber(info.currentLevel)} de ${NIVEL_MIN_NORMAL}`),
                        F.barra(info.currentLevel / NIVEL_MIN_NORMAL),
                        F.campo("Reencarnações", `${formatNumber(info.rebirths)} (bônus atual de +${info.bonusDmgPercent}% de dano e XP)`),
                        F.campo("Na próxima", `+${info.nextBonusDmgPercent}% de dano e XP`)
                    ] },
                    { emoji: "📜", titulo: "Duas formas de reencarnar", linhas: [
                        `• *Comum* (nível ${NIVEL_MIN_NORMAL}, grátis): zera moedas, mochila e equipamentos`,
                        `• *Premium* (nível ${NIVEL_MIN_PREMIUM} e ${moedas(CUSTO_PREMIUM_COINS)}): mantém o arsenal`
                    ] }
                ],
                dica: "Cada reencarnação soma +25% de dano e XP para sempre, então subir de novo fica cada vez mais rápido.",
                prefix: p,
                proximos: [
                    { nome: "hunt", oque: "caçar e ganhar XP" },
                    { nome: "dungeon", oque: "descer a masmorra" },
                    { nome: "reencarnar", args: "premium", oque: "conhecer a premium" }
                ]
            }), [sender]);
        }

        // 1. ETAPA DE CONFIRMAÇÃO DE SEGURANÇA NORMAL
        if (!isConfirmar) {
            confirmacoesRebirth.set(sender, { expiraEm: Date.now() + 60000, tipo: "normal" });

            return reply(F.tela({
                emoji: "⚠️",
                titulo: "Reencarnação comum",
                intro: `${marcar(sender)}, você vai para a *${ordinalA(info.rebirths + 1)} reencarnação* e ganha *+${(info.rebirths + 1) * 25}% de dano e XP* para sempre. Em troca, quase tudo recomeça.`,
                secoes: [
                    { emoji: "💀", titulo: "Zera", linhas: [
                        F.campo("Nível e XP", `${formatNumber(info.currentLevel)} → 1`),
                        F.campo("Moedas da carteira", `${moedas(user.coins || 0)} → 0`),
                        F.campo("Mochila", `${plural((user.inventario || []).length, "item", "itens")} → vazia`),
                        F.campo("Equipamentos e forja", `forja +${user.forgeLevel || 0} → +0`),
                        F.campo("Placar", "vitórias, derrotas e pontos de arena"),
                        F.campo("Progresso", `mundo ${nomeMundoInicial()}, masmorra e torre no andar 1`)
                    ] },
                    { emoji: "✨", titulo: "Ganha", linhas: [
                        F.campo("Reencarnações", `${formatNumber(info.rebirths)} → ${formatNumber(info.rebirths + 1)}`),
                        F.campo("Bônus permanente", `+${(info.rebirths + 1) * 25}% de dano e XP`),
                        `Uma aura nova no ${F.cmd(p, "boneco")}`
                    ] }
                ],
                dica: `Quer manter mochila, equipamentos, forja e moedas? A premium pede nível ${NIVEL_MIN_PREMIUM} e ${moedas(CUSTO_PREMIUM_COINS)}. Esta confirmação vale por 60 segundos.`,
                prefix: p,
                proximos: [
                    { nome: "reencarnar", args: "confirmar", oque: "reencarnar agora" },
                    { nome: "reencarnar", args: "premium", oque: "ver a premium" }
                ]
            }), [sender]);
        }

        // 2. VERIFICA SE A CONFIRMAÇÃO NORMAL ESTÁ VÁLIDA
        const expiraPendente = confirmacoesRebirth.get(sender);
        if (!expiraPendente || expiraPendente.tipo !== "normal" || Date.now() > expiraPendente.expiraEm) {
            confirmacoesRebirth.delete(sender);
            return reply(confirmacaoExpirada(p, false));
        }
        confirmacoesRebirth.delete(sender);

        // 3. EXECUÇÃO DO RESET TOTAL COM INCREMENTO DO REBIRTH COMUM
        const nextRebirth = info.rebirths + 1;
        user.rebirthCount = nextRebirth;
        user.rebirth_count = nextRebirth;
        user.level = 1;
        user.xp = 0;
        user.coins = 0;
        user.inventario = [];
        user.inventory = [];
        user.slots = {
            capacete: null,
            peitoral: null,
            calca: null,
            botas: null,
            arma: null,
            escudo: null,
            amuleto: null
        };
        user.equipado = null;
        user.arma = null;
        user.forgeLevel = 0;
        user.forge_level = 0;
        user.wins = 0;
        user.losses = 0;
        user.arenaPontos = 0;
        user.arenaAtual = 1;
        user.mundo = 'floresta';
        user.dungeonFloor = 1;
        user.dungeonRecorde = 0;
        user.towerFloor = 1;
        user.towerRecorde = 0;
        user.hp = 120;
        user.hpMax = 120;

        await dataService.saveUser(user, { force: true });

        const newStats = calculateFullCharacterStats(user);

        return reply(F.tela({
            emoji: "🌌",
            titulo: `${ordinalA(nextRebirth)} reencarnação concluída`,
            intro: `${marcar(sender)} renasceu com *+${nextRebirth * 25}% de dano e XP* para sempre. A jornada recomeça do zero, mas bem mais rápida.`,
            secoes: [
                { emoji: "🌀", titulo: "Novo ciclo", linhas: [
                    F.campo("Reencarnações", formatNumber(nextRebirth)),
                    F.campo("Bônus permanente", `+${nextRebirth * 25}% de dano e XP`),
                    F.campo("Nível", `1, em ${nomeMundoInicial()}`),
                    F.campo("Carteira", "vazia")
                ] },
                { emoji: "⚔️", titulo: "Seu poder agora", linhas: [
                    F.campo("Poder de combate", formatNumber(newStats.cp)),
                    `${F.campo("Ataque", formatNumber(newStats.atk))} · ${F.campo("Defesa", formatNumber(newStats.def))}`,
                    F.campo("Vida", `${formatNumber(newStats.hpMax)} HP`)
                ] }
            ],
            dica: "Sem equipamento, caçar é o jeito mais seguro de juntar as primeiras moedas e comprar uma arma.",
            prefix: p,
            proximos: [
                { nome: "hunt", oque: "recomeçar a jornada" },
                { nome: "shoparmas", oque: "comprar a primeira arma" },
                { nome: "boneco", oque: "ver sua aura nova" }
            ]
        }), [sender]);
    }
};
