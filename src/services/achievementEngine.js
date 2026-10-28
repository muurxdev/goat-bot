/**
 * Motor de Conquistas (Achievement Engine)
 * Avalia critérios e concede conquistas e recompensas automáticas aos jogadores.
 */

const achievementsCatalog = [
    {
        id: 'primeiro_codigo',
        titulo: '🌱 Primeiro Código',
        descricao: 'Envie suas primeiras 10 mensagens no grupo.',
        check: (user) => (user.messages || 0) >= 10,
        recompensa: { xp: 50, coins: 100 }
    },
    {
        id: 'dev_junior',
        titulo: '💻 Dev Junior',
        descricao: 'Alcance o nível 10 de progressão.',
        check: (user) => (user.level || 1) >= 10,
        recompensa: { xp: 200, coins: 500 }
    },
    {
        id: 'tech_lead',
        titulo: '👑 Tech Lead',
        descricao: 'Alcance o nível 50 de progressão.',
        check: (user) => (user.level || 1) >= 50,
        recompensa: { xp: 1000, coins: 2500 }
    },
    {
        id: 'deus_do_codigo',
        titulo: '⚡ Deus do Código',
        descricao: 'Alcance o lendário nível 100.',
        check: (user) => (user.level || 1) >= 100,
        recompensa: { xp: 5000, coins: 10000 }
    },
    {
        id: 'cacador_novato',
        titulo: '🗡️ Primeira Caçada',
        descricao: 'Alcance 100 vitórias em combates.',
        check: (user) => (user.wins || 0) >= 10,
        recompensa: { xp: 100, coins: 250 }
    },
    {
        id: 'assassino_bosses',
        titulo: '🐉 Carrasco de Bosses',
        descricao: 'Derrote 25 grandes Chefões.',
        check: (user) => (user.bossesMortos || 0) >= 25,
        recompensa: { xp: 800, coins: 2000 }
    },
    {
        id: 'gladiador_arena',
        titulo: '🏟️ Gladiador da Arena',
        descricao: 'Acumule 1000 ou mais troféus de arena.',
        check: (user) => (user.arenaPontos || 0) >= 1000,
        recompensa: { xp: 500, coins: 1000 }
    },
    {
        id: 'magnata_dev',
        titulo: '💰 Magnata Dev',
        descricao: 'Acumule 10.000 coins no saldo.',
        check: (user) => (user.coins || 0) >= 10000,
        recompensa: { xp: 500, coins: 1000 }
    },
    {
        id: 'streak_fogo',
        titulo: '🔥 Dedicação Diária',
        descricao: 'Mantenha um streak diário de 7 dias seguidos.',
        check: (user) => (user.streak || 0) >= 7,
        recompensa: { xp: 300, coins: 700 }
    }
]

/**
 * Avalia se o usuário atingiu novas conquistas
 * @param {object} user - Perfil do usuário
 * @returns {Array<object>} Conquistas desbloqueadas nesta verificação
 */
function verificarConquistas(user) {
    if (!user.conquistas) user.conquistas = []
    const desbloqueadas = []

    let xpRecompensa = 0
    for (const ach of achievementsCatalog) {
        if (!user.conquistas.includes(ach.id)) {
            if (ach.check(user)) {
                user.conquistas.push(ach.id)
                user.xp = (user.xp || 0) + (ach.recompensa.xp || 0)
                xpRecompensa += (ach.recompensa.xp || 0)
                user.coins = (user.coins || 0) + (ach.recompensa.coins || 0)
                desbloqueadas.push(ach)
            }
        }
    }

    // O XP da recompensa pode fechar um nível. processarLevelUp chama esta
    // função de novo, mas a recursão termina: cada conquista entra em
    // user.conquistas antes, então a chamada interna só age se desbloquear
    // outra conquista nova (catálogo finito). Require preguiçoso porque o
    // xpService já importa este módulo.
    if (xpRecompensa > 0) {
        const { processarLevelUp } = require('./xpService')
        const lvlRes = processarLevelUp(user)
        if (lvlRes && Array.isArray(lvlRes.conquistas)) desbloqueadas.push(...lvlRes.conquistas)
    }

    return desbloqueadas
}

module.exports = {
    achievementsCatalog,
    verificarConquistas
}

