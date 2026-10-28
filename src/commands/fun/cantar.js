const logger = require('../../core/logger')

const MUSICAS = [
    {
        titulo: 'Dream On — Aerosmith',
        trecho: '🎶 *Sing with me, sing for the years*\n*Sing for the laughter, sing for the tear*\n*Dream on, dream on, dream on*\n*Dream until your dreams come true* 🎶'
    },
    {
        titulo: 'Bohemian Rhapsody — Queen',
        trecho: '🎶 *Is this the real life?*\n*Is this just fantasy?*\n*Caught in a landslide*\n*No escape from reality* 🎶'
    },
    {
        titulo: 'Imagine — John Lennon',
        trecho: '🎶 *Imagine there\'s no heaven*\n*It\'s easy if you try*\n*No hell below us*\n*Above us, only sky* 🎶'
    },
    {
        titulo: 'Hotel California — Eagles',
        trecho: '🎶 *On a dark desert highway*\n*Cool wind in my hair*\n*Warm smell of colitas*\n*Rising up through the air* 🎶'
    },
    {
        titulo: 'Stairway to Heaven — Led Zeppelin',
        trecho: '🎶 *There\'s a lady who\'s sure*\n*All that glitters is gold*\n*And she\'s buying a stairway*\n*To heaven* 🎶'
    },
    {
        titulo: 'Let It Be — The Beatles',
        trecho: '🎶 *When I find myself in times of trouble*\n*Mother Mary comes to me*\n*Speaking words of wisdom*\n*Let it be* 🎶'
    },
    {
        titulo: 'Smells Like Teen Spirit — Nirvana',
        trecho: '🎶 *Load up on guns, bring your friends*\n*It\'s fun to lose and to pretend*\n*She\'s over-bored and self-assured*\n*Oh no, I know a dirty word* 🎶'
    },
    {
        titulo: 'Wonderwall — Oasis',
        trecho: '🎶 *Today is gonna be the day*\n*That they\'re gonna throw it back to you*\n*By now you should\'ve somehow*\n*Realized what you gotta do* 🎶'
    }
]

module.exports = {
    name: 'cantar',
    aliases: ['cantaroma'],
    category: 'fun',
    subcategory: 'Diversão',
    description: 'Cante um trecho de música aleatória',
    cooldownMs: 5000,
    execute: async ({ reply }) => {
        const musica = MUSICAS[Math.floor(Math.random() * MUSICAS.length)]
        return reply(
            `🎤 *CANTANDO HOJE:*\n\n` +
            `🎵 *${musica.titulo}*\n\n` +
            `${musica.trecho}`
        )
    }
}
