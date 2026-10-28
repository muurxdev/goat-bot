/**
 * Comandos de Interação Social & Afeto
 * Permite interações dinâmicas entre membros do grupo com cards, menções e controle on/off
 */
const F = require("../../utils/formato");

const { getBotName } = require("../../config/botConfig");
const dataService = require("../../services/dataService");

const INTERACTIONS = {
    abracar: {
        action: "abraçou carinhosamente",
        solo: "está precisando de um abraço quentinho... 🤗",
        emoji: "🤗",
        frases: [
            "deu um abraço tão apertado que quase quebrou uma costela!",
            "envolveu seus braços com todo carinho e afeto.",
            "deu um abraço fofo e reconfortante."
        ]
    },
    beijar: {
        action: "deu um beijo apaixonado em",
        solo: "mandou um beijinho doce no ar para todo mundo! 😘",
        emoji: "😘",
        frases: [
            "roubou um selinho surpresa!",
            "deu um beijo daqueles de cinema!",
            "deu um beijinho carinhoso na bochecha."
        ]
    },
    tapa: {
        action: "deu um super tapa estalado na cara de",
        solo: "está dando tapas no ar de tanta raiva! 😡",
        emoji: "👋",
        frases: [
            "acertou um tapa tão forte que até a alma balançou!",
            "deu uma bofetada sonora estilo novela das nove!",
            "meteu a mão aberta sem dó nem piedade."
        ]
    },
    cafune: {
        action: "está fazendo um cafuné gostoso na cabeça de",
        solo: "está sonhando com um cafuné bem quentinho... 😴",
        emoji: "💆",
        frases: [
            "fez um cafuné tão suave que deu até soninho.",
            "passou a mão pelos cabelos com muito carinho.",
            "fez aquele cafuné que cura qualquer dia ruim."
        ]
    },
    matar: {
        action: "eliminou sumariamente",
        solo: "ativou o modo Contra-ataque Total e explodiu o cenário! 💥",
        emoji: "⚔️",
        frases: [
            "usou a espada Sombria e não sobrou nem poeira!",
            "desferiu um golpe crítico fatal!",
            "mandou direto para o submundo dos demônios!"
        ]
    },
    dancar: {
        action: "puxou para dançar juntos",
        solo: "começou a dançar no meio do grupo como se não houvesse amanhã! 💃🕺",
        emoji: "💃",
        frases: [
            "dançaram um forrozinho coladinho!",
            "fizeram uma coreografia sincronizada do TikTok!",
            "arrasaram na pista de dança!"
        ]
    },
    chorar: {
        action: "está chorando no ombro de",
        solo: "desabou no choro pelos cantos... 😭",
        emoji: "😭",
        frases: [
            "molhou a camisa toda com lágrimas!",
            "está chorando litros de emoção!",
            "precisa de um lenço urgentemente."
        ]
    },
    rir: {
        action: "está morrendo de rir da cara de",
        solo: "caiu na gargalhada e não consegue mais parar de rir! 🤣",
        emoji: "🤣",
        frases: [
            "está rindo tanto que a barriga tá doendo!",
            "quase engasgou de tanto dar risada!",
            "não aguentou e explodiu na gargalhada."
        ]
    },
    lamber: {
        action: "deu uma lambida atrevida em",
        solo: "passou a língua nos lábios com fome... 😋",
        emoji: "👅",
        frases: [
            "deu uma lambidinha na bochecha!",
            "provou para ver se era doce!",
            "deixou tudo babado de zoeira."
        ]
    },
    casar: {
        action: "pediu em casamento com aliança de diamante e aceitou com",
        solo: "está sonhando com o casamento perfeito e jogando o buquê! 👰🤵",
        emoji: "💍",
        frases: [
            "e agora estão oficialmente casados e felizes para sempre!",
            "colocaram a aliança no dedo e comemoraram com bolo!",
            "formam o casal mais fofo do grupo!"
        ]
    },
    divorcio: {
        action: "assinou o divórcio e pediu 50% dos bens de",
        solo: "está sem compromisso e livre na pista de novo! 💔",
        emoji: "💔",
        frases: [
            "e levou embora o cachorro e a televisão!",
            "acabou o amor, agora é cada um pro seu lado!",
            "jogou a aliança fora e foi curtir a vida."
        ]
    }
};

module.exports = {
    name: "interacao",
    aliases: ["social", "afeto", "beijar", "beijo", "bater", "tapa", "cafune", "cafuné", "matar", "dancar", "dançar", "chorar", "rir", "lamber", "divorcio", "divórcio"],
    category: "fun",
    description: "Abraço, beijo, tapa, cafuné e outras brincadeiras entre membros",
    usage: "[interação] [@pessoa] | on | off",
    examples: ["abracar @pessoa — abraça alguém", "on — administrador liga as interações", "off — administrador desliga as interações"],
    subcategory: "Interação Social",
    cooldownMs: 1500,
    execute: async ({ sender, from, isGroup, isAdmin, isOwner, userRole, reply, info, args, commandName, prefix = "." }) => {
        const configs = dataService.getConfigsData();
        if (!configs[from]) configs[from] = {};

        const isUserAdmin = isAdmin || isOwner || (userRole && userRole.level >= 3);
        const sub = (args[0] || "").toLowerCase().trim();

        // 1. CONTROLE DE ATIVAÇÃO / DESATIVAÇÃO (.interacao on / off)
        if (commandName === "interacao" || commandName === "social" || commandName === "afeto") {
            if (sub === "on" || sub === "ativar" || sub === "ligar" || sub === "1") {
                if (!isUserAdmin) {
                    return reply("🔒 Só os administradores do grupo podem ligar as interações.\n\nPeça a um deles para digitar " + F.cmd(prefix, "interacao", "on") + ".");
                }
                configs[from].interacoes = true;
                await dataService.saveConfigsData(configs);
                return reply(F.tela({
                    emoji: "✅",
                    titulo: "Interações ligadas",
                    intro: "Abraços, beijos, tapas e companhia estão liberados para todos do grupo.",
                    secoes: [{ emoji: "🎭", titulo: "Algumas para testar", linhas: [
                        "• " + F.cmd(prefix, "abracar", "@pessoa") + " · " + F.cmd(prefix, "cafune", "@pessoa"),
                        "• " + F.cmd(prefix, "dancar", "@pessoa") + " · " + F.cmd(prefix, "tapa", "@pessoa")
                    ] }],
                    proximos: [{ nome: "interacao", args: "off", oque: "desligar de novo" }],
                    prefix
                }));
            }

            if (sub === "off" || sub === "desativar" || sub === "desligar" || sub === "0") {
                if (!isUserAdmin) {
                    return reply("🔒 Só os administradores do grupo podem desligar as interações.\n\nPeça a um deles para digitar " + F.cmd(prefix, "interacao", "off") + ".");
                }
                configs[from].interacoes = false;
                await dataService.saveConfigsData(configs);
                return reply(F.tela({
                    emoji: "🔒",
                    titulo: "Interações desligadas",
                    intro: "Os membros comuns não podem mais usar abraço, beijo, tapa e companhia neste grupo.",
                    dica: "Administradores continuam podendo usar.",
                    proximos: [{ nome: "interacao", args: "on", oque: "ligar de novo" }],
                    prefix
                }));
            }
        }

        // 2. VERIFICAÇÃO SE INTERAÇÕES ESTÃO DESATIVADAS NO GRUPO
        if (isGroup && configs[from]?.interacoes === false && !isUserAdmin) {
            return reply("🔒 *Interações desligadas neste grupo*\n\nA administração desligou abraço, beijo, tapa e companhia por aqui.\n\n💡 _Peça a um administrador para ligar com " + F.cmd(prefix, "interacao", "on") + "._");
        }

        let key = commandName.toLowerCase()
            .replace("ç", "c")
            .replace("ã", "a")
            .replace("é", "e")
            .replace("ó", "o");

        if (key === "beijo") key = "beijar";
        if (key === "bater") key = "tapa";

        if (!INTERACTIONS[key]) {
            key = sub
                .replace("ç", "c")
                .replace("ã", "a")
                .replace("é", "e")
                .replace("ó", "o");
        }

        const botName = getBotName();
        const inter = INTERACTIONS[key] || INTERACTIONS["abracar"];

        const mentioned = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        const targetJid = mentioned || (args && args[0] && args[0].includes("@") ? args[0].replace(/[^0-9@s.whatsapp.net]/g, "") : null);

        const senderNumber = sender.split("@")[0].split(":")[0];
        const mentions = [sender];

        if (targetJid && targetJid !== sender) {
            const targetNumber = targetJid.split("@")[0].split(":")[0];
            mentions.push(targetJid);
            const fraseSorteada = inter.frases[Math.floor(Math.random() * inter.frases.length)];

            let doc = inter.emoji + " @" + senderNumber + " *" + inter.action + "* @" + targetNumber + "!\n\n";
            doc += "✨ _" + fraseSorteada + "_";
            return reply(doc, mentions);
        }

        // Sem alvo: a frase solo continua, mas explica como mandar para alguém.
        const nomeCmd = INTERACTIONS[key] ? key : "abracar";
        const usarDireto = nomeCmd !== "abracar" && nomeCmd !== "casar";
        return reply(F.tela({
            emoji: inter.emoji,
            titulo: "Interação social",
            intro: "@" + senderNumber + " " + inter.solo,
            secoes: [{ emoji: "✍️", titulo: "Para mandar para alguém", linhas: [
                "Marque a pessoa junto com o comando:",
                usarDireto ? F.cmd(prefix, nomeCmd, "@pessoa") : F.cmd(prefix, "interacao", nomeCmd + " @pessoa")
            ] }, { emoji: "🎭", titulo: "Todas as interações", linhas: [
                Object.keys(INTERACTIONS).join(" · ")
            ] }],
            dica: "Administradores podem desligar estas brincadeiras com " + F.cmd(prefix, "interacao", "off") + ".",
            proximos: [
                { nome: "cafune", args: "@pessoa", oque: "fazer um cafuné" },
                { nome: "socialcatalogo", oque: "gestos que contam afinidade" }
            ],
            prefix
        }), mentions);
    }
};
