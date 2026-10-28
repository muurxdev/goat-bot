/**
 * Comando .dungeon / .masmorra
 * Desafio de Masmorra em andares progressivos (1 a 10) com hordas de monstros, bosses e drops raros
 */

const dataService = require("../../services/dataService");
const { initializeUser } = require("../../services/xpService");
const { calculateFullCharacterStats } = require("../../services/characterEngine");
const { formatNumber, moedas, marcar } = require("../../utils/textoRpg");
const logger = require("../../core/logger");
const F = require("../../utils/formato");

const BASE_DUNGEON_FLOORS = [
    { andar: 1, nome: "Cripta dos Mortos-Vivos", minLevel: 1, reqCp: 80, xp: 450, coins: 350, drop: "🦴 Crânio Amaldiçoado" },
    { andar: 2, nome: "Caverna dos Goblins Vorazes", minLevel: 5, reqCp: 250, xp: 950, coins: 700, drop: "🗡️ Adaga de Ferro Goblin" },
    { andar: 3, nome: "Labirinto das Sombras Antigas", minLevel: 12, reqCp: 600, xp: 1800, coins: 1400, drop: "🌑 Fragmento de Sombra" },
    { andar: 4, nome: "Torre dos Cavaleiros Sagrados", minLevel: 20, reqCp: 1200, xp: 3500, coins: 2800, drop: "🛡️ Brasão de Ferro Real" },
    { andar: 5, nome: "Caverna do Dragão Carmesim", minLevel: 30, reqCp: 2500, xp: 7000, coins: 5500, drop: "🔥 Escama de Dragão Ancestral" },
    { andar: 6, nome: "Abismo do Purgatório Demoníaco", minLevel: 45, reqCp: 5000, xp: 14000, coins: 10000, drop: "🩸 Sangue Demoníaco Puro" },
    { andar: 7, nome: "Santuário dos Arcanjos Decaídos", minLevel: 60, reqCp: 9000, xp: 25000, coins: 18000, drop: "🪽 Pluma Celestial Sagrada" },
    { andar: 8, nome: "Templo do Rei Demônio", minLevel: 75, reqCp: 15000, xp: 45000, coins: 35000, drop: "👑 Coroa do Soberano Sombrio" },
    { andar: 9, nome: "Palácio da Divindade Suprema", minLevel: 90, reqCp: 25000, xp: 80000, coins: 65000, drop: "✨ Orbe da Graça Imortal" },
    { andar: 10, nome: "Vórtice do Caos Primordial", minLevel: 100, reqCp: 40000, xp: 150000, coins: 120000, drop: "🌌 Centelha do Caos Infinito" }
];

const PROCEDURAL_TITLES = [
    "Dimensão dos Deuses Esquecidos",
    "Fenda do Vazio Cósmico",
    "Torre da Ascensão Astral",
    "Reino das Trevas Eternas",
    "Trono do Infinito",
    "Fronteira da Realidade",
    "Câmara do Tempo Perdido",
    "Abismo dos Titãs Primordiais"
];

function getFloorData(floorNum) {
    if (floorNum <= 10) {
        return BASE_DUNGEON_FLOORS[Math.max(0, floorNum - 1)];
    }
    const diff = floorNum - 10;
    const minLevel = 100 + (diff * 10);
    // Curva em dois estagios. O expoente unico de 1.18 era exponencial puro e
    // estourava: andar 50 pedia 30 MILHOES de CP e o andar 60, 157 milhoes —
    // varias vezes o CP do jogador mais forte, tornando os andares profundos
    // inalcancaveis. Os 10 primeiros andares procedurais mantem o ritmo antigo
    // (progressao ja calibrada); dali em diante desacelera para 10% por andar.
    const RAMPA = 10;
    const escala = (base, taxaInicial, taxaTardia) => base
        * Math.pow(taxaInicial, Math.min(diff, RAMPA))
        * Math.pow(taxaTardia, Math.max(0, diff - RAMPA));
    const reqCp = Math.floor(escala(40000, 1.18, 1.10));
    // Recompensas seguem a MESMA desaceleracao: sem isso, andares mais faceis
    // pagariam premios exponenciais (o andar 60 dava 471 milhoes de coins por
    // corrida) e a economia quebraria.
    const xp = Math.floor(escala(150000, 1.20, 1.11));
    const coins = Math.floor(escala(120000, 1.18, 1.10));
    const title = PROCEDURAL_TITLES[(diff - 1) % PROCEDURAL_TITLES.length] + ` (Setor ${Math.ceil(diff / PROCEDURAL_TITLES.length)})`;
    return {
        andar: floorNum,
        nome: title,
        minLevel,
        reqCp,
        xp,
        coins,
        drop: `💎 Cristal Astral (Andar ${floorNum})`
    };
}

/** Uma linha por andar na lista: situação, nome e o que ele paga. */
function linhaAndar(f, liberado) {
    const chefe = f.andar % 5 === 0 ? " · 👑 chefe" : "";
    const situacao = liberado ? "🟢" : "🔒";
    return `${situacao} *Andar ${f.andar}* · ${f.nome}${chefe}\n` +
        `   Nível ${f.minLevel} ou ${formatNumber(f.reqCp)} de poder · +${moedas(f.coins)} · +${formatNumber(f.xp)} XP`;
}

module.exports = {
    name: "dungeon",
    aliases: ["masmorra", "torredesafio", "catacumbas", "andares", "explorarmasmorra"],
    category: "rpg",
    subcategory: "Combate",
    description: "Desça os andares sem fim da Masmorra do Reino, com um chefe a cada 5 andares",
    usage: "[andar | lista]",
    examples: [
        " — entra no andar mais alto que você já liberou",
        "5 — repete o andar 5 (bom para enfrentar o chefe de novo)",
        "lista — mostra os andares, o que pedem e o que pagam"
    ],
    cooldownMs: 8000,
    execute: async ({ sender, args, reply, prefix }) => {
        const p = prefix || ".";
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);
        const stats = calculateFullCharacterStats(user);
        const userLevel = Number(user.level || 1);

        // Inicializa andar da masmorra do usuário
        const defaultUnlockedFloor = userLevel <= 100
            ? (BASE_DUNGEON_FLOORS.filter(f => userLevel >= f.minLevel).pop()?.andar || 1)
            : (10 + Math.floor((userLevel - 100) / 10));
        // initializeUser já preenche dungeonFloor = 1 para quem nunca entrou, então
        // "user.dungeonFloor || padrão" nunca usava o padrão pelo nível: um nível 80
        // novato ficava com "Andar liberado: 1". O maior dos dois vale; reencarnar
        // zera o nível e o andar juntos, então isso não devolve andares perdidos.
        user.dungeonFloor = Math.max(1, Number(user.dungeonFloor) || 1, defaultUnlockedFloor);

        const sub = (args[0] || "").toLowerCase().trim();

        // 1. LISTA DE ANDARES / INFO
        if (sub === "lista" || sub === "andares" || sub === "info") {
            const linhas = [];
            BASE_DUNGEON_FLOORS.forEach(f => {
                const canEnter = f.andar <= user.dungeonFloor || userLevel >= f.minLevel;
                linhas.push(linhaAndar(f, canEnter));
            });

            // Se o usuário já passou do nível 100 ou andar 10, exibe os andares procedurais liberados
            const profundos = [];
            const maxProcedural = Math.max(user.dungeonFloor, 10 + Math.floor((Math.max(100, userLevel) - 100) / 10));
            if (maxProcedural > 10) {
                for (let fl = 11; fl <= Math.min(maxProcedural + 2, 11 + 6); fl++) {
                    const f = getFloorData(fl);
                    const canEnter = f.andar <= user.dungeonFloor || userLevel >= f.minLevel;
                    profundos.push(linhaAndar(f, canEnter));
                }
            }

            return reply(F.tela({
                emoji: "🏰",
                titulo: "Masmorra do Reino",
                intro: `${marcar(sender)}, você já liberou até o *andar ${user.dungeonFloor}*, com *${formatNumber(stats.cp)}* de poder.`,
                secoes: [
                    { emoji: "🗺️", titulo: "Primeiros andares", linhas },
                    { emoji: "🌌", titulo: "Andares profundos", linhas: profundos }
                ],
                dica: "A masmorra não tem fim: vencer um andar libera o próximo, e a cada 5 andares há um chefe que pode ser enfrentado de novo.",
                prefix: p,
                proximos: [
                    { nome: "dungeon", oque: `entrar no andar ${user.dungeonFloor}` },
                    { nome: "dungeon", args: "5", oque: "repetir um andar já liberado" },
                    { nome: "forjar", oque: "ganhar poder antes de descer" }
                ]
            }), [sender]);
        }

        // 2. ENTRAR NO ANDAR ESCOLHIDO OU NO ANDAR ATUAL LIBERADO
        let currentFloor;
        const requestedFloorNum = parseInt(sub, 10);

        if (!isNaN(requestedFloorNum) && requestedFloorNum >= 1) {
            const targetData = getFloorData(requestedFloorNum);
            const canEnter = requestedFloorNum <= user.dungeonFloor || userLevel >= targetData.minLevel || stats.cp >= (targetData.reqCp * 0.8);
            if (!canEnter) {
                return reply(F.tela({
                    emoji: "🔒",
                    titulo: `Andar ${targetData.andar} ainda trancado`,
                    intro: `*${targetData.nome}* não abre para você por enquanto. Basta cumprir *uma* das condições abaixo.`,
                    secoes: [
                        { emoji: "🗝️", titulo: "Como abrir", linhas: [
                            `• Vencer o andar ${targetData.andar - 1} com ${F.cmd(p, "dungeon", String(targetData.andar - 1))}`,
                            `• Chegar ao nível ${formatNumber(targetData.minLevel)}`,
                            `• Chegar a ${formatNumber(Math.ceil(targetData.reqCp * 0.8))} de poder`
                        ] },
                        { emoji: "📊", titulo: "Você hoje", linhas: [
                            F.campo("Nível", formatNumber(userLevel)),
                            F.campo("Poder", formatNumber(stats.cp)),
                            F.campo("Andar liberado", user.dungeonFloor)
                        ] }
                    ],
                    dica: "Forjar o equipamento é o jeito mais rápido de ganhar poder.",
                    prefix: p,
                    proximos: [
                        { nome: "dungeon", oque: `entrar no andar ${user.dungeonFloor}` },
                        { nome: "dungeon", args: "lista", oque: "ver todos os andares" },
                        { nome: "forjar", oque: "ganhar poder" }
                    ]
                }), [sender]);
            }
            currentFloor = targetData;
        } else {
            currentFloor = getFloorData(user.dungeonFloor || 1);
        }

        const isBossFloor = (currentFloor.andar % 5 === 0);

        // Cálculo balanceado de vitória
        const winProbability = Math.min(95, Math.max(30, Math.floor((stats.cp / currentFloor.reqCp) * 65)));
        const roll = Math.floor(Math.random() * 100) + 1;
        const won = roll <= winProbability;

        if (!won) {
            const hpLoss = Math.floor(stats.hpMax * (isBossFloor ? 0.45 : 0.35));
            user.hp = Math.max(1, (user.hp || stats.hpMax) - hpLoss);
            await dataService.saveXpData(xpData);

            const intro = isBossFloor
                ? `O chefe do andar ${currentFloor.andar} levou a melhor e tirou *${formatNumber(hpLoss)} de vida* de ${marcar(sender)}.`
                : `Os monstros do andar ${currentFloor.andar} cercaram ${marcar(sender)} e tiraram *${formatNumber(hpLoss)} de vida*.`;

            return reply(F.tela({
                emoji: "☠️",
                titulo: isBossFloor ? "O chefe venceu desta vez" : "Derrota na masmorra",
                intro,
                secoes: [{ emoji: "📜", titulo: "Relatório", linhas: [
                    F.campo("Andar", `${currentFloor.andar} · ${currentFloor.nome}`),
                    F.campo("Sua vida", `${formatNumber(user.hp)} / ${formatNumber(stats.hpMax)} HP`),
                    F.campo("Sua chance era", `${winProbability}%`),
                    F.campo("Poder recomendado", formatNumber(currentFloor.reqCp)),
                    F.campo("Seu poder", formatNumber(stats.cp))
                ] }],
                dica: stats.cp < currentFloor.reqCp
                    ? `Seu poder está abaixo do recomendado. Chegando a ${formatNumber(currentFloor.reqCp)}, a chance sobe para perto de 65%.`
                    : "Você tem poder de sobra: foi azar. Cure-se e tente de novo.",
                prefix: p,
                proximos: [
                    { nome: "curar", oque: "recuperar a vida" },
                    { nome: "forjar", oque: "ganhar ataque, defesa e poder" },
                    { nome: "dungeon", args: String(currentFloor.andar), oque: "tentar este andar de novo" }
                ]
            }), [sender]);
        }

        // VITÓRIA NO ANDAR: Avança a progressão do jogador se venceu o andar atual
        if (currentFloor.andar >= user.dungeonFloor) {
            user.dungeonFloor = currentFloor.andar + 1;
        }
        user.dungeonRecorde = Math.max(user.dungeonRecorde || 0, currentFloor.andar);

        // Concede XP e avalia Level Up imediato na vitória da masmorra
        const { adicionarXp } = require("../../services/xpService");
        const { xpGanho, lvlRes } = adicionarXp(user, currentFloor.xp, { source: 'rpg' });
        user.coins = (user.coins || 0) + currentFloor.coins;

        if (!Array.isArray(user.inventario)) user.inventario = [];
        const limiteMochila = user.mochila || 20;
        let dropGanho = false;
        if (user.inventario.length < limiteMochila) {
            user.inventario.push(currentFloor.drop);
            dropGanho = true;
        }

        // Equipamento REAL do catálogo (20% na masmorra, 40% em andar de Boss)
        let equipDrop = null;
        try {
            const { sortearEquipamentoDrop } = require('../../services/rpgEquipmentService');
            const equipChance = isBossFloor ? 0.40 : 0.20;
            if (user.inventario.length < limiteMochila && Math.random() < equipChance) {
                equipDrop = sortearEquipamentoDrop((user.level || 1) + (isBossFloor ? 10 : 5));
                if (equipDrop) user.inventario.push({ ...equipDrop });
            }
        } catch (equipErr) {
            logger.warn('[DUNGEON] Falha no drop de equipamento: ' + equipErr.message);
        }

        await dataService.saveXpData(xpData);

        const vitoria = isBossFloor ? `derrubou o chefe do *andar ${currentFloor.andar}*` : `venceu o *andar ${currentFloor.andar}*`;
        const rebBadge = stats.rebirths > 0 ? ` (inclui +${stats.rebirths * 25}% da reencarnação)` : '';

        const linhasEquip = equipDrop
            ? [
                `${equipDrop.raridade} *${equipDrop.nome}*`,
                `ATK +${formatNumber(equipDrop.atk)} · DEF +${formatNumber(equipDrop.def)} · ${formatNumber(equipDrop.cp)} de poder`,
                `Vista com ${F.cmd(p, "equipar", equipDrop.id)}`
            ]
            : [];
        const linhasNivel = (lvlRes && lvlRes.subiu)
            ? [`Agora você está no *nível ${formatNumber(user.level)}*`, `+${formatNumber(lvlRes.ganhoHp)} HP de vida máxima · +${moedas(lvlRes.ganhoCoins)}`]
            : [];

        return reply(F.tela({
            emoji: isBossFloor ? "👑" : "🏆",
            titulo: isBossFloor ? `Chefe do andar ${currentFloor.andar} derrotado` : `Andar ${currentFloor.andar} vencido`,
            intro: `${marcar(sender)}, você ${vitoria} e levou *${moedas(currentFloor.coins)}* e *+${formatNumber(xpGanho)} XP*.`,
            secoes: [
                { emoji: "🎁", titulo: "Recompensas", linhas: [
                    F.campo("Andar", `${currentFloor.andar} · ${currentFloor.nome}`),
                    F.campo("XP", `+${formatNumber(xpGanho)}${rebBadge}`),
                    F.campo("Moedas", `+${moedas(currentFloor.coins)} (total ${moedas(user.coins)})`),
                    F.campo("Espólio", dropGanho ? currentFloor.drop : "ficou para trás, sua mochila está cheia"),
                    F.campo("Chance de vitória", `${winProbability}%`)
                ] },
                { emoji: "✨", titulo: "Equipamento encontrado", linhas: linhasEquip },
                { emoji: "🆙", titulo: "Subiu de nível", linhas: linhasNivel },
                { emoji: "🚪", titulo: "Progresso", linhas: [
                    F.campo("Próximo andar liberado", user.dungeonFloor),
                    F.campo("Recorde", `andar ${formatNumber(user.dungeonRecorde)}`)
                ] }
            ],
            dica: !dropGanho
                ? `Sua mochila está cheia: venda espólios ou aumente com ${p}mochila up.`
                : (isBossFloor
                    ? `O chefe volta ao covil: repita com ${p}dungeon ${currentFloor.andar} para caçar mais equipamentos.`
                    : "A cada 5 andares há um chefe, com o dobro de chance de soltar equipamento."),
            prefix: p,
            proximos: [
                { nome: "dungeon", oque: `seguir para o andar ${user.dungeonFloor}` },
                equipDrop ? { nome: "equipar", args: equipDrop.id, oque: "vestir o que caiu" } : { nome: "curar", oque: "recuperar a vida antes de descer" },
                dropGanho ? null : { nome: "mochila", args: "up", oque: "aumentar a mochila" }
            ].filter(Boolean)
        }), [sender]);
    }
};
