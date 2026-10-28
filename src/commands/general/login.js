/**
 * Comando .login / .registrar
 * Onboarding: o usuário se registra, define o nick pelo qual quer ser chamado e
 * escolhe se quer participar do RPG. Cada perfil fica salvo no banco, permitindo
 * contagem e separação corretas por função.
 */

const dataService = require('../../services/dataService')
const { getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')
const F = require('../../utils/formato')
const { formatNumber, marcar } = require('../../utils/textoRpg')

/** Linhas do perfil mostradas depois do cadastro e no painel. */
function linhasPerfil(user, nick) {
    return [
        F.campo('Nick', nick || user.displayNick || 'ainda sem nick'),
        F.campo('RPG', user.rpgEnabled ? '🟢 participando' : '🔴 fora do RPG'),
        F.campo('Nível', formatNumber(user.level || 1)),
        F.campo('XP', formatNumber(user.xp || 0))
    ]
}

module.exports = {
    name: 'login',
    aliases: ['registrar', 'cadastrar', 'registro', 'perfilconfig', 'entrarbot'],
    category: 'general',
    subcategory: 'Perfil & Ranking',
    description: 'Registre-se no bot: defina seu nick e escolha se quer jogar RPG',
    usage: '<seu nick> | nome <novo nick> | rpg on/off',
    examples: [
        'Dragão Negro — faz o cadastro com esse nick',
        'nome Rei Arthur — troca o nick',
        'rpg off — sai do RPG (os comandos de aventura somem para você)',
        ' — mostra seu cadastro'
    ],
    cooldownMs: 2000,
    execute: async ({ sender, senderReal, args, reply, prefix = '.' }) => {
        const botName = getBotName()
        const userRepo = require('../../database/repositories/userRepository')
        const candidateJids = [sender, senderReal].filter(Boolean)
        const user = dataService.getUser(sender, candidateJids) || dataService.initializeUser(sender, {}, candidateJids)

        if (senderReal && senderReal !== sender) {
            const phoneDigits = senderReal.replace(/[@].*$/, '').replace(/\D/g, '') || null
            try {
                userRepo.linkIdentity(user.jid || sender, {
                    lid: sender.endsWith('@lid') ? sender : (user.lid || null),
                    phoneDigits,
                    linkedJid: senderReal
                })
            } catch (err) {
                logger.warn(`[LOGIN] Não consegui ligar ${sender} a ${senderReal}: ${err.message}`)
            }
        }
        const sub = (args[0] || '').toLowerCase().trim()

        // Sub-ação: ligar/desligar RPG
        if (sub === 'rpg') {
            const val = (args[1] || '').toLowerCase()
            user.rpgEnabled = !['off', 'nao', 'não', 'false', '0', 'desativar'].includes(val)
            user.registered = true
            if (!user.registeredAt) user.registeredAt = new Date().toISOString()
            dataService.saveUser(user)
            if (user.rpgEnabled) {
                return reply(F.tela({
                    emoji: '⚔️',
                    titulo: 'Você entrou no RPG',
                    intro: 'Pronto! Os comandos de aventura estão liberados para você.',
                    dica: 'Comece caçando monstros fracos para subir de nível e juntar moedas.',
                    proximos: [
                        { nome: 'hunt', oque: 'caçar seu primeiro monstro' },
                        { nome: 'perfil', oque: 'ver seu personagem' },
                        { nome: 'login', args: 'rpg off', oque: 'sair do RPG' }
                    ],
                    prefix
                }))
            }
            return reply(F.tela({
                emoji: '🚫',
                titulo: 'Você saiu do RPG',
                intro: 'Os comandos de aventura ficam escondidos para você. Seu progresso continua guardado.',
                dica: 'Quando quiser voltar, é só ligar de novo: nível, moedas e itens estarão onde você deixou.',
                proximos: [
                    { nome: 'login', args: 'rpg on', oque: 'voltar para o RPG' },
                    { nome: 'menu', oque: 'ver o que mais posso fazer' }
                ],
                prefix
            }))
        }

        // Sub-ação: mudar o nick
        if (sub === 'nome' || sub === 'nick') {
            const novo = args.slice(1).join(' ').trim().slice(0, 40)
            if (!novo) {
                return reply(F.tela({
                    emoji: '📝',
                    titulo: 'Trocar o nick',
                    intro: user.displayNick ? `Faltou o nick novo. Hoje você está como *${user.displayNick}*.` : 'Faltou o nick novo. Escreva depois de nome como quer ser chamado.',
                    secoes: [{ emoji: '✍️', titulo: 'Digite assim', linhas: [
                        `• ${F.cmd(prefix, 'login', 'nome <novo nick>')}`,
                        `• ${F.cmd(prefix, 'login', 'nome Rei Arthur')}`,
                        `• ${F.cmd(prefix, 'login', 'nome Herói')}`
                    ] }],
                    dica: 'O nick pode ter até 40 letras e aparece no perfil e nos rankings.',
                    prefix
                }))
            }
            const antigo = user.displayNick
            user.displayNick = novo
            user.display_nick = novo
            user.nicknameRpg = novo
            user.nickname_rpg = novo
            user.name = novo
            user.registered = true
            if (!user.registeredAt) user.registeredAt = new Date().toISOString()
            dataService.saveUser(user, { force: true })
            return reply(F.tela({
                emoji: '✅',
                titulo: 'Nick trocado',
                intro: antigo && antigo !== novo
                    ? `Agora vou te chamar de *${novo}* (antes era ${antigo}).`
                    : `Agora vou te chamar de *${novo}*.`,
                proximos: [
                    { nome: 'perfil', oque: 'ver como ficou seu perfil' },
                    { nome: 'dossie', oque: 'ver sua ficha completa' }
                ],
                prefix
            }))
        }

        // Registro direto com nick: .login <nick>
        const nick = args.join(' ').trim().slice(0, 40)
        if (nick) {
            const jaEra = user.registered
            user.displayNick = nick
            user.display_nick = nick
            user.nicknameRpg = nick
            user.nickname_rpg = nick
            user.name = nick
            user.registered = true
            if (user.rpgEnabled === undefined) user.rpgEnabled = true
            if (!user.registeredAt) user.registeredAt = new Date().toISOString()
            dataService.saveUser(user, { force: true })

            const doc = F.tela({
                emoji: '✅',
                titulo: jaEra ? 'Cadastro atualizado' : 'Cadastro feito',
                intro: jaEra
                    ? `${marcar(sender)}, atualizei seu cadastro. Agora você é *${nick}*.`
                    : `Boas-vindas à taverna, ${marcar(sender)}! A partir de agora vou te chamar de *${nick}*.`,
                secoes: [{ emoji: '👤', titulo: 'Seu cadastro', linhas: linhasPerfil(user, nick) }],
                dica: user.rpgEnabled
                    ? 'Você já está no RPG. Se não quiser jogar, use .login rpg off e os comandos de aventura somem.'
                    : 'Você está fora do RPG. Para jogar, use .login rpg on.',
                proximos: [
                    { nome: 'perfil', oque: 'ver seu perfil' },
                    user.rpgEnabled ? { nome: 'hunt', oque: 'começar a aventura' } : { nome: 'login', args: 'rpg on', oque: 'entrar no RPG' },
                    { nome: 'menu', oque: 'ver tudo o que posso fazer' }
                ],
                prefix
            })
            return reply(doc, [sender])
        }

        // Sem args: painel de status / instruções
        if (user.registered) {
            return reply(F.tela({
                emoji: '🔐',
                titulo: 'Seu cadastro',
                intro: `Seu cadastro já existe, com o nick *${user.displayNick || 'sem nick'}*.`,
                secoes: [{ emoji: '👤', titulo: 'Dados', linhas: linhasPerfil(user) }],
                proximos: [
                    { nome: 'login', args: 'nome <novo nick>', oque: 'trocar o nick' },
                    { nome: 'login', args: user.rpgEnabled ? 'rpg off' : 'rpg on', oque: user.rpgEnabled ? 'sair do RPG' : 'entrar no RPG' },
                    { nome: 'dossie', oque: 'ver sua ficha completa' }
                ],
                prefix
            }), [sender])
        }

        return reply(F.tela({
            emoji: '👋',
            titulo: 'Faça seu cadastro',
            intro: `Boas-vindas à taverna! Sou *${botName}*. Para eu guardar seu progresso e te chamar pelo nome, faça seu cadastro.`,
            secoes: [{ emoji: '📝', titulo: 'Digite assim', linhas: [
                `1. ${F.cmd(prefix, 'login', '<seu nick>')} — como quer ser chamado`,
                `2. ${F.cmd(prefix, 'login', 'rpg on')} ou ${F.cmd(prefix, 'login', 'rpg off')} — se quer jogar RPG`,
                `\n*Exemplos:* ${F.cmd(prefix, 'login', 'Dragão Negro')} · ${F.cmd(prefix, 'login', 'Princesa')}`
            ] }],
            dica: 'Quem se cadastra já entra no RPG. Dá para sair a qualquer momento.',
            proximos: [
                { nome: 'login', args: 'Dragão Negro', oque: 'cadastrar com esse nick' },
                { nome: 'menu', oque: 'ver tudo o que posso fazer' }
            ],
            prefix
        }), [sender])
    }
}
