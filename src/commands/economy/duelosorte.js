/**
 * Comando .duelosorte — cara ou coroa valendo moedas.
 *
 * Era um stub: sorteava, escrevia "você ganhou X moedas" e não tocava no banco.
 * Dava para apostar 1,5 milhão com saldo zero e "ganhar" 3 milhões sem que nada
 * mudasse. Agora valida saldo e persiste via economyService.
 */

const economy = require('../../services/economyService')
const { moedas, marcar } = require('../../utils/textoRpg')
const F = require('../../utils/formato')

const COOLDOWN_MS = 3000

/**
 * Tela de aposta recusada. Reproduz as mesmas condições de validarAposta só
 * para escrever a mensagem; quem decide continua sendo o serviço.
 */
function telaRecusa({ sender, escolha, texto, prefix }) {
    const atual = economy.saldo(economy.carregarUsuario(sender))
    const valor = economy.parseValor(texto, atual)
    const exemplos = [
        `• ${F.cmd(prefix, 'duelosorte', `${escolha} 500`)} — aposta 500 moedas`,
        `• ${F.cmd(prefix, 'duelosorte', `${escolha} metade`)} — aposta metade da carteira`,
        `• ${F.cmd(prefix, 'duelosorte', `${escolha} tudo`)} — aposta a carteira inteira`
    ]
    let titulo, intro
    if (valor === null) {
        titulo = texto ? 'Valor não entendido' : 'Quanto quer apostar?'
        intro = texto
            ? `"${texto}" não é um valor que eu entenda. Use um número, tudo, metade, 50% ou 1k.`
            : `Você escolheu *${escolha}*. Agora diga quanto apostar.`
    } else if (atual <= 0) {
        titulo = 'Carteira vazia'
        intro = 'Você está sem moedas na carteira para apostar.'
    } else if (valor <= 0) {
        titulo = 'Aposta zerada'
        intro = 'A aposta precisa ser maior que zero.'
    } else if (valor < economy.APOSTA_MINIMA) {
        titulo = 'Aposta baixa demais'
        intro = `A aposta mínima é *${moedas(economy.APOSTA_MINIMA)}*.`
    } else if (valor > economy.APOSTA_MAXIMA) {
        titulo = 'Aposta alta demais'
        intro = `A aposta máxima é *${moedas(economy.APOSTA_MAXIMA)}*.`
    } else if (valor > atual) {
        titulo = 'Moedas insuficientes'
        intro = `Você quer apostar *${moedas(valor)}*, mas tem *${moedas(atual)}* na carteira.`
    } else {
        return null
    }
    return F.tela({
        emoji: '🪙',
        titulo,
        intro,
        secoes: [
            { emoji: '✍️', titulo: 'Digite assim', linhas: exemplos },
            { emoji: '💳', titulo: 'Você', linhas: [F.campo('Carteira', moedas(atual))] }
        ],
        dica: atual <= 0 ? 'Ganhe moedas trabalhando e volte para a moeda dourada.' : 'Acertou, recebe o dobro da aposta. Errou, perde a aposta.',
        proximos: atual <= 0 ? [{ nome: 'trabalhar', oque: 'ganhar moedas' }] : [],
        prefix
    })
}

module.exports = {
    name: 'duelosorte',
    // .caraoucoroa fazia a mesma aposta; virou atalho daqui em 2026-09-18.
    aliases: ["caracoroaduelo","moedadourada","caraoucoroa","coinflip","flip","cara-coroa","cmd_duelosorte","alt_duelosorte","atalho_duelosorte","abrev_duelosorte","call_duelosorte","func_duelosorte"],
    category: 'economy',
    subcategory: 'Cassino',
    description: 'Aposta em cara ou coroa: .duelosorte <cara|coroa> <valor>',
    usage: '<cara|coroa> <valor|tudo|metade|50%>',
    examples: [
        'coroa 5000 — aposta 5.000 moedas em coroa',
        'cara tudo — aposta a carteira inteira em cara',
        'coroa 50% — aposta metade da carteira'
    ],
    cooldownMs: COOLDOWN_MS,
    execute: async ({ sender, args = [], reply, prefix = '.' }) => {
        // Aceita as duas ordens: "cara 500" e "500 cara". A segunda era a do
        // antigo .caraoucoroa, que virou atalho deste comando em 2026-09-18.
        const LADOS = ['cara', 'coroa']
        if (!LADOS.includes((args[0] || '').toLowerCase()) && LADOS.includes((args[1] || '').toLowerCase())) {
            args = [args[1], args[0], ...args.slice(2)]
        }
        const escolha = (args[0] || '').toLowerCase()

        if (!['cara', 'coroa'].includes(escolha)) {
            const carteira = economy.saldo(economy.carregarUsuario(sender))
            return reply(F.tela({
                emoji: '🪙',
                titulo: 'Cara ou coroa',
                intro: args[0]
                    ? `"${args[0]}" não é um lado da moeda. Escolha *cara* ou *coroa* e diga quanto apostar.`
                    : 'Escolha um lado da moeda e quanto apostar. Acertou, dobra a aposta. Errou, perde.',
                secoes: [
                    { emoji: '✍️', titulo: 'Digite assim', linhas: [
                        `• ${F.cmd(prefix, 'duelosorte', 'coroa 5000')} — aposta 5.000 moedas em coroa`,
                        `• ${F.cmd(prefix, 'duelosorte', 'cara tudo')} — aposta a carteira inteira`,
                        `• ${F.cmd(prefix, 'duelosorte', 'coroa 50%')} — aposta metade da carteira`
                    ] },
                    { emoji: '🎲', titulo: 'Como funciona', linhas: [
                        F.campo('Chance de acertar', '50%'),
                        F.campo('Multiplicador', '2x a aposta'),
                        F.campo('Aposta mínima', moedas(economy.APOSTA_MINIMA)),
                        F.campo('Sua carteira', moedas(carteira))
                    ] }
                ],
                prefix
            }))
        }

        const sorteio = Math.random() < 0.5 ? 'cara' : 'coroa'
        const ganhou = escolha === sorteio

        const r = economy.resolverAposta({
            sender,
            texto: args[1],
            ganhou,
            multiplicador: 2
        })
        if (!r.ok) {
            return reply(telaRecusa({ sender, escolha, texto: args[1], prefix }) || r.erro)
        }

        const antes = r.saldo - r.delta
        return reply(F.tela({
            emoji: ganhou ? '🎉' : '💀',
            titulo: ganhou ? `Deu ${sorteio}: você acertou` : `Deu ${sorteio}: você errou`,
            intro: ganhou
                ? `${marcar(sender)}, você apostou *${moedas(r.valor)}* em ${escolha} e ganhou *${moedas(r.delta)}*.`
                : `${marcar(sender)}, você apostou *${moedas(r.valor)}* em ${escolha} e perdeu a aposta.`,
            secoes: [{ emoji: '🪙', titulo: 'Moeda dourada', linhas: [
                F.campo('Sua escolha', escolha),
                F.campo('Caiu em', sorteio),
                F.campo('Aposta', moedas(r.valor)),
                F.campo('Chance', '50% · paga 2x'),
                F.campo('Resultado', `${r.delta >= 0 ? '+' : '−'}${moedas(Math.abs(r.delta))}`),
                F.campo('Carteira', `${moedas(antes)} → *${moedas(r.saldo)}*`),
                F.campo('Pode jogar de novo em', F.tempo(COOLDOWN_MS))
            ] }],
            dica: ganhou
                ? 'Guarde o lucro no cofre antes da próxima aposta.'
                : 'Cada lançamento é independente: perder agora não aumenta a chance da próxima.',
            proximos: [
                r.saldo >= economy.APOSTA_MINIMA ? { nome: 'duelosorte', args: `${escolha} ${Math.min(r.valor, r.saldo)}`, oque: 'jogar de novo' } : { nome: 'trabalhar', oque: 'ganhar moedas' },
                ganhou ? { nome: 'banco', args: 'depositar tudo', oque: 'guardar o lucro' } : null
            ].filter(Boolean),
            prefix
        }), [sender])
    }
}
