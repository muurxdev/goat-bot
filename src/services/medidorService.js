/**
 * Medidores de brincadeira (.belezometro, .coragemetro, .sonometro...).
 *
 * Cada medidor tinha a mesma conta e a mesma resposta seca copiadas em um
 * arquivo: só o número e uma barra. Aqui a tela fica igual para todos, com um
 * veredito por faixa, e cada comando só informa o que mede.
 *
 * O número continua o mesmo de antes: depende da pessoa, do dia e do nome do
 * medidor — a mesma pessoa vê o mesmo resultado o dia todo.
 */

const F = require('../utils/formato')

/** Nota do dia (0..100) — mesma conta que os comandos usavam. */
function notaDoDia(alvo, chave) {
    const seed = [...(String(alvo) + new Date().toDateString() + chave)].reduce((a, c) => a + c.charCodeAt(0), 0)
    return seed % 101
}

/** Outros medidores, para sugerir no fim da tela. */
const MEDIDORES = [
    ['belezometro', 'beleza'], ['burrometro', 'burrice'], ['coragemetro', 'coragem'],
    ['fofurometro', 'fofura'], ['fomemetro', 'fome'], ['inteligenciometro', 'inteligência'],
    ['maldademetro', 'maldade'], ['nerdometro', 'nerd'], ['otakumetro', 'otaku'],
    ['preguicometro', 'preguiça'], ['riquezometro', 'riqueza'], ['romanticometro', 'romantismo'],
    ['sonometro', 'sono'], ['sortometro', 'sorte']
]

/**
 * Monta a resposta de um medidor.
 * @param {object} o
 * @param {string} o.chave       nome do comando (entra na semente)
 * @param {string} o.emoji
 * @param {string} o.oque        o que mede, em minúsculas ("beleza")
 * @param {string[]} o.vereditos cinco frases: 0-19, 20-39, 40-59, 60-79, 80-100
 * @param {string} o.sender
 * @param {string[]} [o.mentionedJid]
 * @param {string} [o.prefix]
 * @returns {{ texto: string, mencoes: string[] }}
 */
function medir({ chave, emoji, oque, vereditos, sender, mentionedJid, prefix = '.' }) {
    const alvo = (mentionedJid && mentionedJid[0]) || sender || 'alguem'
    const nome = '@' + String(alvo).split('@')[0]
    const proprio = String(alvo) === String(sender)
    const pct = notaDoDia(alvo, chave)
    const faixa = Math.min(4, Math.floor(pct / 20))
    const veredito = (vereditos && vereditos[faixa]) || ''

    // Sugere dois outros medidores, variando com a nota para não repetir sempre.
    const outros = MEDIDORES.filter(([n]) => n !== chave)
    const s1 = outros[pct % outros.length]
    const s2 = outros[(pct + 7) % outros.length]

    const texto = F.tela({
        emoji,
        titulo: 'Medidor de ' + oque,
        intro: nome + ' está com *' + pct + '%* de ' + oque + ' hoje.',
        secoes: [{
            emoji: '📏', titulo: 'Resultado',
            linhas: [F.barra(pct / 100), veredito ? '_' + veredito + '_' : null]
        }],
        dica: 'O resultado vale pelo dia todo. ' + (proprio
            ? 'Marque alguém para medir outra pessoa.'
            : 'Sem marcar ninguém, eu meço você.'),
        proximos: [
            { nome: chave, args: '@pessoa', oque: 'medir alguém do grupo' },
            { nome: s1[0], oque: 'medir ' + s1[1] },
            s2[0] !== s1[0] ? { nome: s2[0], oque: 'medir ' + s2[1] } : null
        ].filter(Boolean),
        prefix
    })
    return { texto, mencoes: [alvo] }
}

module.exports = { medir, notaDoDia, MEDIDORES }
