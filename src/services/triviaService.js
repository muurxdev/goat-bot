/**
 * Serviço de Trivia, Perguntas e Estatísticas de Minigames
 * Conectado ao banco SQLite com rankings de acertos e sequências (streaks)
 */

const { getDatabase } = require('../database/connection');
const logger = require('../core/logger');

const TRIVIA_BANKS = {
    saga: [
        { q: 'Quantas Bolas de Ouro ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ conquistou ao longo da carreira?', opts: ['8', '7', '5', '6'], a: '8' },
        { q: 'Em qual ano ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ conquistou a Copa do Mundo FIFA com a Argentina?', opts: ['2022', '2014', '2018', '2026'], a: '2022' },
        { q: 'Qual número de camisa consagrou ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ no Barcelona e na Seleção Argentina?', opts: ['10', '7', '9', '11'], a: '10' },
        { q: 'Por qual clube ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ conquistou 4 títulos da UEFA Champions League?', opts: ['Barcelona', 'PSG', 'Inter Miami', "Newell's Old Boys"], a: 'Barcelona' },
        { q: 'Qual apelido mundialmente consagrado é dado a ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ como o melhor de todos os tempos?', opts: ['➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤', 'Fenômeno', 'Imperador', 'Rei'], a: '➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤' },
        { q: 'Em qual clube dos Estados Unidos ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ joga atualmente?', opts: ['Inter Miami', 'LA Galaxy', 'NYC FC', 'Orlando City'], a: 'Inter Miami' }
    ],
    futebol_br: [
        { q: 'Qual clube brasileiro conquistou a Copa Libertadores de 2019 de virada nos minutos finais?', opts: ['Flamengo', 'River Plate', 'Palmeiras', 'Grêmio'], a: 'Flamengo' },
        { q: 'Qual estádio foi palco do milésimo gol de Pelé em 1969?', opts: ['Maracanã', 'Vila Belmiro', 'Pacaembu', 'Mineirão'], a: 'Maracanã' },
        { q: 'Qual jogador detém o apelido de "Rei de Copas" e fez história no Grêmio?', opts: ['Renato Gaúcho', 'Romário', 'Zico', 'Falcão'], a: 'Renato Gaúcho' },
        { q: 'Quantas Copas do Mundo a Seleção Brasileira possui oficialmente?', opts: ['5', '4', '6', '3'], a: '5' },
        { q: 'Em que ano a Chapecoense foi declarada campeã da Copa Sul-Americana?', opts: ['2016', '2015', '2017', '2018'], a: '2016' }
    ],
    futebol_int: [
        { q: 'Qual clube possui mais títulos da UEFA Champions League na história?', opts: ['Real Madrid', 'Milan', 'Bayern de Munique', 'Liverpool'], a: 'Real Madrid' },
        { q: 'Qual seleção venceu a Copa do Mundo de 2022 no Catar?', opts: ['Argentina', 'França', 'Croácia', 'Marrocos'], a: 'Argentina' },
        { q: 'Quem marcou 91 gols em um único ano civil (2012)?', opts: ['➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤', 'Cristiano Ronaldo', 'Lewandowski', 'Gerd Müller'], a: '➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤' },
        { q: 'Em qual estádio britânico a Inglaterra conquistou a Copa de 1966?', opts: ['Wembley', 'Old Trafford', 'Anfield', 'Emirates'], a: 'Wembley' }
    ],
    games: [
        { q: 'Qual é o minério mais raro e resistente para armaduras no Minecraft tradicional moderno?', opts: ['Netherita', 'Diamante', 'Ouro', 'Esmeralda'], a: 'Netherita' },
        { q: 'Qual jogo da FromSoftware foi eleito Game of the Year no TGA 2022?', opts: ['Elden Ring', 'God of War Ragnarök', 'Horizon Forbidden West', 'Stray'], a: 'Elden Ring' },
        { q: 'Qual campeão de League of Legends é conhecido como a Raposa de Nove Caudas?', opts: ['Ahri', 'Akali', 'Kassadin', 'Yasuo'], a: 'Ahri' },
        { q: 'Qual cidade fictícia serve de cenário principal em GTA V?', opts: ['Los Santos', 'Vice City', 'Liberty City', 'San Fierro'], a: 'Los Santos' }
    ],
    cinema_series: [
        { q: 'Qual elemento metálico fictício compõe o escudo do Capitão América?', opts: ['Vibranium', 'Adamantium', 'Beskar', 'Uru'], a: 'Vibranium' },
        { q: 'Qual é o nome do professor de química que se torna produtor de metanfetamina em Breaking Bad?', opts: ['Walter White', 'Jesse Pinkman', 'Saul Goodman', 'Gustavo Fring'], a: 'Walter White' },
        { q: 'Qual casa de Westeros tem o lema "O Inverno Está Chegando"?', opts: ['Stark', 'Lannister', 'Targaryen', 'Baratheon'], a: 'Stark' },
        { q: 'Qual diretor assinou a trilogia de filmes "O Senhor dos Anéis"?', opts: ['Peter Jackson', 'Christopher Nolan', 'Steven Spielberg', 'James Cameron'], a: 'Peter Jackson' }
    ],
    ciencias: [
        { q: 'Qual a velocidade aproximada da luz no vácuo?', opts: ['300.000 km/s', '150.000 km/s', '1.000.000 km/s', '30.000 km/s'], a: '300.000 km/s' },
        { q: 'Qual organela celular é conhecida como a "usina de energia" da célula?', opts: ['Mitocôndria', 'Ribossomo', 'Complexo de Golgi', 'Lisossomo'], a: 'Mitocôndria' },
        { q: 'Qual o gás mais abundante na atmosfera do planeta Terra?', opts: ['Nitrogênio', 'Oxigênio', 'Gás Carbônico', 'Argônio'], a: 'Nitrogênio' },
        { q: 'Quem formulou a Teoria da Relatividade Geral em 1915?', opts: ['Albert Einstein', 'Isaac Newton', 'Niels Bohr', 'Galileu Galilei'], a: 'Albert Einstein' }
    ],
    historia_brasil: [
        { q: 'Em qual ano ocorreu a Proclamação da República no Brasil?', opts: ['1889', '1822', '1888', '1930'], a: '1889' },
        { q: 'Quem foi a princesa que assinou a Lei Áurea em 13 de maio de 1888?', opts: ['Princesa Isabel', 'Imperatriz Leopoldina', 'Marquesa de Santos', 'Rainha Maria I'], a: 'Princesa Isabel' },
        { q: 'Qual presidente brasileiro liderou a construção de Brasília com a meta de "50 anos em 5"?', opts: ['Juscelino Kubitschek', 'Getúlio Vargas', 'Jânio Quadros', 'João Goulart'], a: 'Juscelino Kubitschek' },
        { q: 'Qual tratado de 1494 dividiu as terras recém-descobertas entre Portugal e Espanha?', opts: ['Tratado de Tordesilhas', 'Tratado de Madri', 'Tratado de Utrecht', 'Tratado de Petrópolis'], a: 'Tratado de Tordesilhas' }
    ]
};

/**
 * Retorna as categorias de trivia disponíveis
 */
function getCategories() {
    return Object.keys(TRIVIA_BANKS);
}

/**
 * Retorna perguntas de uma categoria
 */
function getQuestions(category) {
    return TRIVIA_BANKS[category] || TRIVIA_BANKS.ciencias;
}

/**
 * Retorna uma pergunta aleatória
 */
function getRandomQuestion(category = null) {
    const cat = category && TRIVIA_BANKS[category] ? category : Object.keys(TRIVIA_BANKS)[Math.floor(Math.random() * Object.keys(TRIVIA_BANKS).length)];
    const bank = TRIVIA_BANKS[cat];
    const q = bank[Math.floor(Math.random() * bank.length)];
    return { ...q, category: cat };
}

/**
 * Registra o resultado de uma tentativa de trivia
 */
function submitAnswer(userJid, category, isCorrect, prize = { coins: 150, xp: 200 }) {
    const db = getDatabase();
    const now = Date.now();

    const row = db.prepare('SELECT * FROM user_trivia_stats WHERE user_jid = ?').get(userJid);
    let totalPlayed = (row ? row.total_played : 0) + 1;
    let totalCorrect = (row ? row.total_correct : 0) + (isCorrect ? 1 : 0);
    let streak = isCorrect ? ((row ? row.streak : 0) + 1) : 0;
    let maxStreak = Math.max(row ? row.max_streak : 0, streak);
    let coinsWon = (row ? row.total_coins_won : 0) + (isCorrect ? prize.coins : 0);
    let xpWon = (row ? row.total_xp_won : 0) + (isCorrect ? prize.xp : 0);

    let catStats = {};
    if (row && row.category_stats) {
        try { catStats = JSON.parse(row.category_stats); } catch (err) { logger.warn('[TRIVIASERVICE] falha ignorada: ' + (err && err.message)) }
    }
    if (!catStats[category]) catStats[category] = { played: 0, correct: 0 };
    catStats[category].played += 1;
    if (isCorrect) catStats[category].correct += 1;

    db.prepare(`
        INSERT INTO user_trivia_stats (user_jid, total_played, total_correct, streak, max_streak, total_coins_won, total_xp_won, last_played_at, category_stats)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_jid) DO UPDATE SET
            total_played = excluded.total_played,
            total_correct = excluded.total_correct,
            streak = excluded.streak,
            max_streak = excluded.max_streak,
            total_coins_won = excluded.total_coins_won,
            total_xp_won = excluded.total_xp_won,
            last_played_at = excluded.last_played_at,
            category_stats = excluded.category_stats
    `).run(userJid, totalPlayed, totalCorrect, streak, maxStreak, coinsWon, xpWon, now, JSON.stringify(catStats));

    return { totalPlayed, totalCorrect, streak, maxStreak, coinsWon, xpWon };
}

/**
 * Retorna os dados do usuário em trivias
 */
function getUserStats(userJid) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM user_trivia_stats WHERE user_jid = ?').get(userJid) || {
        user_jid: userJid,
        total_played: 0,
        total_correct: 0,
        streak: 0,
        max_streak: 0,
        total_coins_won: 0,
        total_xp_won: 0
    };
}

/**
 * Retorna o ranking global de acertos em trivia
 */
function getLeaderboard(limit = 10) {
    const db = getDatabase();
    return db.prepare('SELECT user_jid, total_correct, max_streak, total_coins_won FROM user_trivia_stats ORDER BY total_correct DESC LIMIT ?').all(limit);
}

/**
 * Registra o histórico de minigames (jogo da velha, forca, dados, etc.)
 */
function recordGameResult(userJid, gameType, result, score = 0) {
    const db = getDatabase();
    const id = `${userJid}_${gameType}`;
    const now = Date.now();

    const row = db.prepare('SELECT * FROM user_game_stats WHERE id = ?').get(id);
    let wins = (row ? row.wins : 0) + (result === 'win' ? 1 : 0);
    let losses = (row ? row.losses : 0) + (result === 'loss' ? 1 : 0);
    let draws = (row ? row.draws : 0) + (result === 'draw' ? 1 : 0);
    let highScore = Math.max(row ? row.high_score : 0, score);

    db.prepare(`
        INSERT INTO user_game_stats (id, user_jid, game_type, wins, losses, draws, high_score, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            wins = excluded.wins,
            losses = excluded.losses,
            draws = excluded.draws,
            high_score = excluded.high_score,
            updated_at = excluded.updated_at
    `).run(id, userJid, gameType, wins, losses, draws, highScore, now);

    return { wins, losses, draws, highScore };
}

/**
 * Retorna o ranking de um minigame específico
 */
function getGameLeaderboard(gameType, limit = 10) {
    const db = getDatabase();
    return db.prepare('SELECT user_jid, wins, losses, high_score FROM user_game_stats WHERE game_type = ? ORDER BY wins DESC, high_score DESC LIMIT ?').all(gameType, limit);
}

module.exports = {
    TRIVIA_BANKS,
    getCategories,
    getQuestions,
    getRandomQuestion,
    submitAnswer,
    getUserStats,
    getLeaderboard,
    recordGameResult,
    getGameLeaderboard
};
