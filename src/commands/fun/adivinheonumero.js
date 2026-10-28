/**
 * Comando .adivinheonumero
 * Adivinhe o número secreto (1-100). CORRIGIDO: antes gerava um número novo a cada
 * chamada (impossível "acertar"); agora o número é FIXO por partida e o palpite
 * pode ser enviado livremente no chat (via interactionService).
 */
const F = require("../../utils/formato");

const dataService = require("../../services/dataService");
const interactionService = require("../../services/interactionService");

const games = new Map(); // chatJid -> { secret, tentativas }

function processGuess(from, palpiteRaw, sender) {
    const game = games.get(from);
    if (!game) return { consumed: false, msg: null };
    const palpite = parseInt(String(palpiteRaw).trim(), 10);
    if (isNaN(palpite) || palpite < 1 || palpite > 100) return { consumed: false, msg: null };

    game.tentativas += 1;
    if (palpite === game.secret) {
        games.delete(from);
        const user = dataService.initializeUser(sender);
        const premio = Math.max(200, 1000 - (game.tentativas - 1) * 80);
        user.coins = (user.coins || 0) + premio;
        dataService.saveUser(user);
        return { consumed: true, msg: `🎉 *ACERTOU! O número era ${game.secret}!*\n🏆 Em ${game.tentativas} tentativa(s). +${premio.toLocaleString('pt-BR')} Coins!` };
    }
    const dica = palpite < game.secret ? "📈 *MAIOR* que " + palpite : "📉 *MENOR* que " + palpite;
    return { consumed: true, msg: `${dica}! (tentativa ${game.tentativas})\n👉 _Continue enviando números no chat._` };
}

module.exports = {
    name: "adivinheonumero",
    aliases: ["acertenumero", "guessnumber", "adivinharnumero"],
    category: "fun",
    subcategory: "Jogos",
    description: "Adivinhe o número secreto de 1 a 100 (responda no chat)",
    usage: "[palpite]",
    examples: [" — começa uma partida", "42 — dá um palpite na partida em andamento"],
    cooldownMs: 2000,
    execute: async ({ from, reply, args, sender, prefix = "." }) => {
        // palpite direto com partida ativa
        if (args[0] && games.has(from)) {
            const { consumed, msg } = processGuess(from, args[0], sender);
            if (consumed) {
                if (!games.has(from)) interactionService.clear(from);
                return reply(msg);
            }
        }

        if (!games.has(from)) {
            games.set(from, { secret: Math.floor(Math.random() * 100) + 1, tentativas: 0 });
            interactionService.register(from, {
                type: "adivinheonumero",
                ttlMs: 180000,
                onText: async (text, c) => {
                    const { consumed, msg } = processGuess(from, text, c.userJid || sender);
                    if (!consumed) return false;
                    if (!games.has(from)) c.clear();
                    await c.reply(msg);
                    return true;
                }
            });
            return reply(F.tela({
                emoji: "🔢",
                titulo: "Adivinhe o número",
                intro: "Pensei num número de *1 a 100*. Mande seus palpites no chat!",
                secoes: [{ emoji: "📜", titulo: "Como funciona", linhas: [
                    "• Envie só o número, por exemplo: *50*.",
                    "• Eu digo se o número secreto é maior ou menor.",
                    "• Quem acertar ganha até *1.000 moedas*; cada erro antes tira 80 (mínimo de 200).",
                    "• A partida fica aberta por 3 minutos."
                ] }],
                dica: "Comece pelo meio (50) e vá cortando pela metade: acerta em até 7 tentativas.",
                proximos: [
                    { nome: "adivinheonumero", args: "50", oque: "palpite direto pelo comando" },
                    { nome: "forca", oque: "jogo da forca" }
                ],
                prefix
            }));
        }

        // partida ativa, palpite direto inválido
        if (args[0]) return reply("🔢 Esse palpite não vale: mande um número inteiro de *1 a 100*.\n\nExemplo: " + F.cmd(prefix, "adivinheonumero", "42"));
        return reply("🔢 *Já tem uma partida valendo!* Mande um número de 1 a 100 no chat para tentar acertar.\n\nExemplo: *42* ou " + F.cmd(prefix, "adivinheonumero", "42"));
    }
};
