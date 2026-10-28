/**
 * Comando .jogodavelha / .jdv
 * Jogo da velha entre dois jogadores no mesmo chat.
 *
 * A partida fica guardada com as DUAS pessoas. Antes ficava só com quem
 * desafiou: o adversário mandava a jogada, o bot não achava partida nenhuma e
 * respondia "Nenhum jogo em andamento" — o jogo nunca passava do 1º lance.
 * O desafio também lia `mentionedJids`, campo que o contexto não tem, então
 * nem começava.
 */

const groupAuthService = require("../../services/groupAuthService");

// jid normalizado -> partida (o mesmo objeto para os dois jogadores)
const games = new Map();

const CASAS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

function chave(jid) {
    return groupAuthService.normalizeJid(jid);
}

function tag(jid) {
    return '@' + String(jid).split('@')[0].split(':')[0];
}

function checkWinner(board) {
    const lines = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];
    for (const [a,b,c] of lines) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return board.every(cell => cell !== null) ? 'tie' : null;
}

function formatBoard(board) {
    const cells = board.map((cell, i) => cell === 'X' ? '❌' : cell === 'O' ? '⭕' : CASAS[i]);
    return [0, 3, 6].map(i => cells.slice(i, i + 3).join(' ')).join('\n');
}

function encerrar(game) {
    games.delete(chave(game.player1));
    games.delete(chave(game.player2));
}

module.exports = {
    name: "jogodavelha",
    aliases: ["jdv", "jogovelha"],
    category: "fun",
    subcategory: "Jogos",
    description: "Jogue o clássico jogo da velha contra outro jogador",
    cooldownMs: 3000,
    execute: async ({ from, sender, args = [], reply, mentionedJid = [], client }) => {
        const minha = games.get(chave(sender));

        if ((args[0] || '').toLowerCase() === 'cancelar') {
            if (!minha) return reply("🎮 Você não está em nenhuma partida agora.");
            encerrar(minha);
            return reply(`🎮 Partida cancelada. Quando quiser, é só desafiar de novo.`);
        }

        if (args[0] && /^[1-9]$/.test(args[0])) {
            if (!minha) {
                return reply("🎮 Você não está em nenhuma partida. Desafie alguém com `.jdv @pessoa`.");
            }
            if (minha.from !== from) {
                return reply("🎮 Sua partida está acontecendo em outro chat.");
            }

            const vezDe = minha.currentPlayer === 'X' ? minha.player1 : minha.player2;
            if (!groupAuthService.sameUser(sender, vezDe)) {
                return reply(`⏳ Agora é a vez de ${tag(vezDe)}.`, [vezDe]);
            }

            const pos = parseInt(args[0], 10) - 1;
            if (minha.board[pos]) {
                return reply("⚠️ Essa casa já foi usada. Escolha um número que ainda aparece no tabuleiro.");
            }

            minha.board[pos] = minha.currentPlayer;
            const winner = checkWinner(minha.board);

            if (winner) {
                encerrar(minha);
                if (winner === 'tie') {
                    return reply(`🤝 Deu velha! Ninguém venceu.\n\n${formatBoard(minha.board)}`);
                }
                const vencedor = winner === 'X' ? minha.player1 : minha.player2;
                return reply(`🎉 ${tag(vencedor)} venceu!\n\n${formatBoard(minha.board)}`, [vencedor]);
            }

            minha.currentPlayer = minha.currentPlayer === 'X' ? 'O' : 'X';
            const proximo = minha.currentPlayer === 'X' ? minha.player1 : minha.player2;
            return reply(`${formatBoard(minha.board)}\n\nSua vez, ${tag(proximo)} (${minha.currentPlayer === 'X' ? '❌' : '⭕'}). Mande o número da casa.`, [proximo]);
        }

        const opponent = mentionedJid[0];
        if (opponent) {
            if (groupAuthService.sameUser(opponent, sender)) {
                return reply("🎮 Não dá para jogar contra você mesmo. Marque outra pessoa.");
            }
            if (groupAuthService.isBotJid(opponent, client)) {
                return reply("🎮 Eu só apito o jogo. Marque outra pessoa para jogar.");
            }
            if (minha || games.has(chave(opponent))) {
                return reply("⚠️ Uma das duas pessoas já está numa partida. Termine ou use `.jdv cancelar`.");
            }

            const game = {
                from,
                board: Array(9).fill(null),
                currentPlayer: 'X',
                player1: sender,
                player2: opponent
            };
            games.set(chave(sender), game);
            games.set(chave(opponent), game);

            return reply(
                `🎮 *Jogo da velha*\n\n` +
                `${tag(sender)} (❌) desafiou ${tag(opponent)} (⭕).\n\n` +
                `${formatBoard(game.board)}\n\n` +
                `Começa ${tag(sender)}: mande o número da casa, por exemplo \`.jdv 5\`.`,
                [sender, opponent]
            );
        }

        return reply("🎮 Marque alguém para jogar: `.jdv @pessoa`");
    }
};
