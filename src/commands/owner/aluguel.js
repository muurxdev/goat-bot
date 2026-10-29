const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .aluguel / .rent
 * Aluguel de grupos e do privado. Parte é pública (planos, teste grátis,
 * status) e parte é só dos Donos (modo, vitalício, set/add/del, planos).
 */

const rentalService = require('../../services/rentalService')
const rentalPackages = require('../../services/payments/rentalPackagesService')
const { getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')
const F = require('../../utils/formato')

const formatBrl = c => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

/** Identificação legível de um alvo: número para pessoa, código para grupo. */
function identificacao(jid) {
    const j = String(jid || '')
    return j.endsWith('@g.us') ? '`' + j + '`' : j.split('@')[0].split(':')[0]
}

/** Nome legível de cada modalidade de aluguel. */
const NOME_ESCOPO = { group: 'grupo', pv: 'privado', combo: 'grupo + privado', bot: 'subdono' }

const UNIDADES = {
    s: ['segundo', 'segundos'], m: ['minuto', 'minutos'], h: ['hora', 'horas'], d: ['dia', 'dias'],
    sem: ['semana', 'semanas'], mes: ['mês', 'meses'], ano: ['ano', 'anos'], y: ['ano', 'anos']
}
const PALAVRAS_VITALICIO = ['inf', 'infinito', 'vitalicio', 'vitalício', 'permanente', 'ilimitado', 'sempre', '0']

/** "30d" vira "30 dias", "2h" vira "2 horas". Se não reconhecer, devolve como veio. */
function duracaoLegivel(str) {
    const limpo = String(str || '').trim().toLowerCase()
    if (PALAVRAS_VITALICIO.includes(limpo)) return 'vitalício'
    const m = limpo.match(/^(\d+)\s*(s|m|h|d|sem|mes|ano|y)?$/)
    if (!m) return String(str || '')
    const n = parseInt(m[1], 10)
    const [um, varios] = UNIDADES[m[2] || 'd']
    return `${n} ${n === 1 ? um : varios}`
}

/**
 * Linhas de prazo de um aluguel: situação, tempo restante com barra e vencimento.
 * O remainingText do serviço traz emoji e caixa alta nos casos vitalício e
 * vencido; aqui esses dois casos ganham texto próprio.
 */
function linhasDePrazo(r) {
    if (r.isLifetime) return [F.campo('Situação', '♾️ vitalício, não vence')]
    if (r.isExpired) return [F.campo('Situação', '🔴 vencido'), F.campo('Venceu em', r.expiresAtFormatted)]
    const total = Math.max(1, (r.expiresAt || 0) - (r.startsAt || 0))
    return [
        F.campo('Situação', r.isTrial ? '⚡ teste grátis ativo' : '🟢 ativo'),
        F.campo('Tempo restante', r.remainingText),
        F.barra((r.remainingMs || 0) / total),
        F.campo('Início', r.startsAtFormatted),
        F.campo('Vence em', r.expiresAtFormatted)
    ]
}

/** Resposta padrão para duração que o serviço recusou. */
function telaDuracaoInvalida(prefix, durationStr, exemplos) {
    return F.tela({
        prefix,
        emoji: '⏱️',
        titulo: 'Não entendi essa duração',
        intro: `"${durationStr}" não é uma duração que eu reconheço. Escreva o número colado na letra da unidade.`,
        secoes: [{
            emoji: '📏', titulo: 'Formatos aceitos', linhas: [
                '• `30d` — 30 dias',
                '• `7d` — 7 dias',
                '• `24h` — 24 horas',
                '• `15m` — 15 minutos',
                '• `vitalicio` — sem data para vencer'
            ]
        }],
        dica: 'Sem letra, conto como dias: 30 é o mesmo que 30d.',
        proximos: exemplos
    })
}

/** Tela de destino não identificado: como informar o grupo ou a pessoa. */
function telaAlvoInvalido(prefix, exemplos) {
    return F.tela({
        prefix,
        emoji: '🎯',
        titulo: 'Não sei para quem é',
        intro: 'Não consegui identificar o grupo ou a pessoa. Informe o destino de um destes jeitos:',
        secoes: [{
            emoji: '📌', titulo: 'Como informar', linhas: [
                '• *Grupo:* mande o comando dentro do próprio grupo, sem destino',
                '• *Grupo de fora:* use o código que aparece em `.aluguel list`',
                '• *Pessoa:* número com DDD, como 5511999999999',
                '• *Pessoa:* marque com @ ou responda a uma mensagem dela'
            ]
        }],
        proximos: exemplos
    })
}

/**
 * Confere os dados do plano ANTES do aviso "⏳ Atualizando...". Sem isto, um
 * valor inválido gerava duas mensagens: o aviso e, logo depois, a recusa.
 * Lança os mesmos erros do rentalPackagesService, que traduzirErro já conhece.
 * @param {{id:string, valor:string, existente?:boolean, escopo?:string, nome?:string, dias?:number}} o
 */
function validarPlanoAntes({ id, valor, existente = false, escopo, nome, dias }) {
    const cleanId = String(id || '').toLowerCase().trim()
    if (existente) {
        if (!rentalPackages.getPacotes().some(p => p.id.toLowerCase() === cleanId)) {
            throw new Error(`Pacote com código "${id}" não encontrado.`)
        }
    } else {
        if (cleanId.length < 2) throw new Error('ID do plano deve ter pelo menos 2 caracteres (ex: g5, pv5, c4).')
        if (!['Grupo', 'PV', 'Combo'].includes(escopo)) throw new Error('Escopo deve ser "Grupo", "PV" ou "Combo".')
        if (!nome || nome.length < 3) throw new Error('Nome do plano deve ser informado.')
        if (!dias || isNaN(dias) || dias < 1) throw new Error('Quantidade de dias deve ser um número maior que zero.')
    }
    if (rentalPackages.reaisParaCentavos(valor) < 100) {
        throw new Error('O valor mínimo permitido é R$ 1,00.')
    }
}

/**
 * Tradutor dos erros que os serviços de aluguel e de planos lançam.
 *
 * As mensagens conhecidas são de negócio (duração inválida, teste já usado,
 * destino faltando, plano inexistente, valor baixo) e viram uma tela com a
 * orientação certa. Qualquer outra é falha inesperada: a pessoa recebe uma
 * frase simples e o detalhe vai para o logger.error. Nunca repassa a mensagem
 * original ao usuário.
 *
 * @param {Error} err
 * @param {{prefix:string, contexto:string, duracao?:string, exemplos?:Array, falha:{titulo:string, intro:string}}} o
 */
function traduzirErro(err, { prefix, contexto, duracao = '', exemplos = [], falha }) {
    const msg = String((err && err.message) || '')

    if (/formato de duração inválido/i.test(msg)) {
        logger.warn(`[ALUGUEL] ${contexto}: duração recusada (${duracao})`)
        return telaDuracaoInvalida(prefix, duracao || (msg.match(/"([^"]*)"/) || [])[1] || '', exemplos)
    }
    if (/já utilizou o período de teste/i.test(msg)) {
        logger.warn(`[ALUGUEL] ${contexto}: teste grátis já usado`)
        return F.tela({
            prefix,
            emoji: '🎁',
            titulo: 'Teste grátis já usado',
            intro: 'Este lugar já usou as 2 horas grátis. O teste vale uma única vez por grupo e uma vez por pessoa no privado.',
            dica: 'Para continuar usando meus comandos, escolha um plano. Os semanais são os mais em conta para começar.',
            proximos: [
                { nome: 'aluguel', args: 'planos', oque: 'ver os planos e preços' },
                { nome: 'dono', oque: 'falar com os donos' }
            ]
        })
    }
    if (/já possui aluguel ativo/i.test(msg)) {
        logger.warn(`[ALUGUEL] ${contexto}: teste recusado, já existe aluguel ativo`)
        return F.tela({
            prefix,
            emoji: '✅',
            titulo: 'Aluguel já ativo',
            intro: 'Este lugar já tem um aluguel valendo, então não precisa do teste grátis. O teste continua guardado para quando precisar.',
            proximos: [
                { nome: 'aluguel', oque: 'ver quanto tempo ainda resta' },
                { nome: 'aluguel', args: 'planos', oque: 'ver os planos para renovar' }
            ]
        })
    }
    if (/alvo inválido|destino do aluguel não informado|destino não especificado/i.test(msg)) {
        logger.warn(`[ALUGUEL] ${contexto}: destino não informado`)
        return telaAlvoInvalido(prefix, exemplos)
    }
    if (/não encontrado/i.test(msg)) {
        logger.warn(`[ALUGUEL] ${contexto}: plano não encontrado`)
        return F.tela({
            prefix,
            emoji: '🔎',
            titulo: 'Plano não encontrado',
            intro: 'Não achei nenhum plano com esse código. Os códigos são curtos, como g2, pv2 ou c1.',
            proximos: [{ nome: 'aluguel', args: 'planos', oque: 'ver os códigos dos planos' }, ...exemplos]
        })
    }
    if (/valor mínimo/i.test(msg)) {
        logger.warn(`[ALUGUEL] ${contexto}: valor abaixo do mínimo`)
        return F.tela({
            prefix,
            emoji: '💰',
            titulo: 'Valor inválido',
            intro: 'O valor precisa ser um número de pelo menos R$ 1,00.',
            dica: 'Centavos com ponto ou vírgula: 39.90 ou 39,90.',
            proximos: exemplos
        })
    }
    if (/pelo menos 2 caracteres|nome do plano|quantidade de dias|escopo deve ser/i.test(msg)) {
        logger.warn(`[ALUGUEL] ${contexto}: dados do plano recusados: ${msg}`)
        return F.tela({
            prefix,
            emoji: '📝',
            titulo: 'Dados do plano incompletos',
            intro: 'Confira: código com 2 letras ou mais, dias maior que zero, valor de pelo menos R$ 1,00 e nome com 3 letras ou mais.',
            proximos: exemplos
        })
    }

    logger.error(`[ALUGUEL] Falha inesperada em ${contexto}: ${msg}`, err && err.stack)
    return F.tela({
        prefix,
        emoji: '❌',
        titulo: falha.titulo,
        intro: falha.intro,
        proximos: exemplos
    })
}

/**
 * Aviso de mudança do Modo Aluguel, escrito para ser LIDO por uma pessoa.
 *
 * Diz três coisas, nesta ordem: o que mudou, quem sente a mudança, e o que
 * acontece a partir de agora. Não sugere o atalho de vitalício de propósito —
 * liberar acesso permanente é decisão à parte, não o passo natural de ligar
 * uma restrição; oferecê-la aqui convidava a anular a própria restrição que
 * acabou de ser criada.
 *
 * @param {{escopo:string, ligado:boolean, jaLiberado:boolean, quemUsa:string, global?:boolean, prefix?:string}} p
 */
function montarAvisoDeModo({ escopo, ligado, jaLiberado, quemUsa, global = false, prefix = '.' }) {
    if (!ligado) {
        const linhas = [
            `🔓 *Modo aluguel desligado*`,
            ``,
            `📍 *Onde:* ${escopo}`,
            ``,
            `A partir de agora ${quemUsa} usa os comandos livremente, sem assinatura.`
        ]
        // Sem filter(Boolean) aqui: ele descartaria as linhas em branco
        // propositais (string vazia é falsy) e grudaria o texto todo.
        if (global) {
            linhas.push(``)
            linhas.push(`⚠️ _Isto vale para os lugares que não tenham ajuste próprio._`)
        }
        return linhas.join('\n')
    }

    const linhas = [
        `🛡️ *Modo aluguel ligado*`,
        ``,
        `📍 *Onde:* ${escopo}`,
        ``,
        `*O que muda:* para usar os comandos agora é preciso ter assinatura ativa — vale para ${quemUsa}.`,
        ``,
        `*Quem continua livre:*`,
        `• Você e os demais donos`,
        `• Lugares com aluguel ou vitalício já ativos`,
        ``
    ]

    // No modo global não existe "este lugar": cada grupo tem a própria situação.
    if (!global) {
        if (jaLiberado) {
            linhas.push(`✅ *Situação daqui:* este lugar *já tem acesso ativo*, então ninguém foi bloqueado agora. A restrição só passa a pesar quando esse acesso vencer.`)
        } else {
            linhas.push(`⚠️ *Situação daqui:* este lugar *não tem acesso ativo*. Os membros já começam bloqueados.`)
        }
        linhas.push(``)
    }
    linhas.push(`*Como alguém libera o acesso:*`)
    linhas.push(`• ${F.cmd(prefix, 'aluguel', 'planos')} — vê os valores`)
    linhas.push(`• ${F.cmd(prefix, 'aluguel', 'teste')} — 2 horas grátis, uma vez por lugar`)
    linhas.push(`• ${F.cmd(prefix, 'assinar')} — fecha a assinatura`)
    linhas.push(``)
    linhas.push(`_Para reverter:_ ${F.cmd(prefix, 'aluguel', `modo ${global ? '' : (escopo.includes('privado') ? 'pv ' : 'grupo ')}off`)}`)

    return linhas.join('\n')
}

module.exports = {
    name: 'aluguel',
    aliases: ['rent', 'alugar', 'locacao', 'alugueis'],
    category: 'owner',
    subcategory: 'Aluguel',
    description: 'Mostra a situação do aluguel, os planos e, para os donos, cadastra e renova prazos',
    usage: '[planos | teste | set <tempo> [pv|grupo] [alvo] | add <tempo> [alvo] | list | modo ...]',
    examples: [
        ' — situação do aluguel aqui',
        'planos — tabela de preços',
        'set 30d grupo — (dono) libera este grupo por 30 dias',
        'set 30d pv 5511999999999 — (dono) libera o privado dessa pessoa',
        'add 15d — (dono) soma 15 dias ao prazo deste grupo'
    ],
    ownerOnly: false,
    cooldownMs: 2000,
    execute: async ({ from, isGroup, sender, args, reply, client, info, quotedSender, isOwner, userRole, prefix = '.' }) => {
        const isUserOwner = isOwner || (userRole && userRole.level >= 5)
        const sub = (args[0] || '').toLowerCase().trim()

        // 0. TABELA DE PLANOS E PREÇOS (Livre para todos)
        if (sub === 'planos' || sub === 'tabela' || sub === 'valores' || sub === 'precos' || sub === 'preco') {
            const pacotes = rentalPackages.getPacotes()
            // Cada seção: o que inclui, depois cada plano com preço, duração e o comando para assinar.
            const linhasDe = (escopo, inclui, extra) => {
                const ls = pacotes.filter(p => p.escopo === escopo)
                    .map(p => `• *${p.nome}* — ${formatBrl(p.centavos)} por ${p.isLifetime ? 'tempo ilimitado' : `${p.dias} dias`} · ${F.cmd(prefix, 'assinar', p.id)}`)
                if (!ls.length) return []
                return [`_Inclui: ${inclui}_`, ...ls, extra].filter(Boolean)
            }

            const secoes = [
                { emoji: '🏢', titulo: 'Aluguel de grupo', linhas: linhasDe('Grupo', 'todos os meus comandos para os membros do grupo', '• ♾️ *Vitalício:* a combinar com os donos') },
                { emoji: '👤', titulo: 'Aluguel do privado', linhas: linhasDe('PV', 'todos os meus comandos conversando comigo no privado', '• ♾️ *Vitalício:* a combinar com os donos') },
                { emoji: '👑', titulo: 'Combo (grupo + privado)', linhas: linhasDe('Combo', 'um grupo e o seu privado com um só pagamento', '• ♾️ *Vitalício combo:* a combinar com os donos') },
                { emoji: '🎖️', titulo: 'Subdono', linhas: linhasDe('Bot (Subdono)', 'privado liberado, comandos de gerência e cargo de subdono') }
            ]

            if (isUserOwner) {
                secoes.push({
                    emoji: '🛠️', titulo: 'Gerenciar planos (donos)', linhas: [
                        `• ${F.cmd(prefix, 'aluguel', 'setpreco g2 39.90')} — muda o preço`,
                        `• ${F.cmd(prefix, 'aluguel', 'addplano g5 Grupo 60 70.00 Grupo Bimestral')} — cria plano`,
                        `• ${F.cmd(prefix, 'aluguel', 'addcombo c4 60 85.00 Combo Bimestral')} — cria combo`,
                        `• ${F.cmd(prefix, 'aluguel', 'delplano g5')} — remove plano`,
                        `• ${F.cmd(prefix, 'aluguel', 'resetplanos')} — volta à tabela padrão`,
                        `• ${F.cmd(prefix, 'aluguel', 'syncmp')} — sincroniza planos no Mercado Pago`
                    ]
                })
            }

            return reply(F.tela({
                prefix,
                emoji: '💎',
                titulo: 'Planos e preços',
                intro: `Escolha a modalidade para liberar os recursos do *${getBotName()}*. Para assinar, mande o comando ao lado do plano: o pagamento sai por cartão ou Pix.`,
                secoes,
                dica: 'Quer experimentar antes? O teste grátis libera 2 horas, uma vez por grupo ou por pessoa.',
                proximos: [
                    { nome: 'aluguel', args: 'teste', oque: 'liberar 2 horas grátis' },
                    { nome: 'assinar', args: 'g2', oque: 'gerar o pagamento (cartão ou Pix)' },
                    { nome: 'dono', oque: 'falar com os donos' }
                ]
            }))
        }

        // 0.05 GERAR CHECKOUT STRIPE / PIX (.aluguel checkout <plano> [alvo] / .aluguel renovar)
        if (sub === 'checkout' || sub === 'assinar' || sub === 'pagar' || sub === 'renovar') {
            const assinarCmd = require('./assinar')
            return assinarCmd.execute({
                sender,
                from,
                isGroup,
                args: args.slice(1),
                reply,
                client,
                info,
                quotedSender,
                isOwner,
                userRole,
                prefix
            })
        }

        // 0.06 STATUS DO LOCATÁRIO (.aluguel meualuguel / .aluguel locatario)
        if (sub === 'meualuguel' || sub === 'locatario') {
            const meuAluguelCmd = require('../general/meualuguel')
            return meuAluguelCmd.execute({
                sender,
                from,
                isGroup,
                args: args.slice(1),
                reply,
                client,
                info,
                quotedSender,
                isOwner,
                userRole,
                prefix
            })
        }

        // 0.1 MODO TESTE GRATUITO (.aluguel teste / .aluguel trial)
        if (sub === 'teste' || sub === 'trial' || sub === 'degustacao') {
            let targetJid = isGroup ? from : sender
            let targetName = isGroup ? 'Grupo de WhatsApp' : (sender.split('@')[0])

            // Se for Dono passando alvo customizado
            if (isUserOwner && args[1]) {
                const resolved = await rentalService.resolveRentalTarget(args[1], { from, isGroup, client })
                if (resolved) {
                    targetJid = resolved.jid
                    targetName = resolved.name
                }
            } else if (isGroup && client) {
                try {
                    const m = await client.groupMetadata(from)
                    if (m?.subject) targetName = m.subject
                } catch (e) {
                    logger.warn(`[ALUGUEL TESTE] Não consegui ler o nome do grupo ${from}: ${e.message}`)
                }
            }

            const durationStr = (isUserOwner && args[2]) ? args[2] : '2h'

            try {
                const trial = rentalService.activateTrial({
                    targetJid,
                    targetType: targetJid.endsWith('@g.us') ? 'group' : 'pv',
                    targetName,
                    durationStr,
                    requestedBy: sender
                })

                return reply(F.tela({
                    prefix,
                    emoji: '🎉',
                    titulo: 'Teste grátis liberado',
                    intro: `Liberei todos os comandos por *${duracaoLegivel(durationStr)}* para você testar à vontade.`,
                    secoes: [{
                        emoji: '📋', titulo: 'Detalhes', linhas: [
                            F.campo('Onde', targetName),
                            F.campo('Duração', duracaoLegivel(durationStr)),
                            F.campo('Termina em', F.dataHora(trial.expiresAt))
                        ]
                    }],
                    dica: 'O teste grátis vale uma vez por grupo ou pessoa.',
                    proximos: [
                        { nome: 'aluguel', args: 'planos', oque: 'ver os planos para continuar depois' },
                        { nome: 'menu', oque: 'ver o que dá para fazer' }
                    ]
                }))
            } catch (err) {
                return reply(traduzirErro(err, {
                    prefix,
                    contexto: `teste ${targetJid}`,
                    duracao: durationStr,
                    exemplos: [
                        { nome: 'aluguel', args: 'teste 5511999999999 2h', oque: '(donos) 2 horas para essa pessoa' },
                        { nome: 'aluguel', args: 'planos', oque: 'ver os planos' }
                    ],
                    falha: { titulo: 'Não consegui liberar o teste', intro: 'Algo deu errado do meu lado e nada foi alterado. Tente de novo em instantes.' }
                }))
            }
        }

        // 0.2 TOGGLE DO MODO ALUGUEL (.aluguel modo <global|grupo|pv> <on|off>)
        if (sub === 'modo' || sub === 'mode') {
            if (!isUserOwner) {
                return reply(`🔒 *Só meus donos podem ligar ou desligar o modo aluguel.*\n\n💡 _Para ver os preços:_ ${F.cmd(prefix, 'aluguel', 'planos')}`)
            }

            const target = (args[1] || '').toLowerCase()
            const state = (args[2] || args[1] || '').toLowerCase()
            const modeOn = state === 'on' || state === 'ativar' || state === '1'

            if (target === 'grupo' || target === 'group') {
                if (!isGroup) {
                    return reply(F.tela({
                        prefix,
                        emoji: '👥',
                        titulo: 'Mande dentro do grupo',
                        intro: 'Para mudar o modo aluguel de um grupo, use o comando dentro dele.',
                        proximos: [
                            { nome: 'aluguel', args: 'modo pv on', oque: 'ligar para o privado' },
                            { nome: 'aluguel', args: 'modo on', oque: 'ligar para todos os lugares' }
                        ]
                    }))
                }
                await rentalService.setRentalMode(modeOn, from)
                const jaTem = rentalService.hasActiveRental(from, 'group')
                return reply(montarAvisoDeModo({
                    escopo: 'este grupo',
                    ligado: modeOn,
                    // hasActiveRental devolve sempre um objeto; o que importa é .active
                    jaLiberado: Boolean(jaTem && jaTem.active),
                    quemUsa: 'os membros deste grupo',
                    prefix
                }))
            }

            if (target === 'pv' || target === 'dm') {
                await rentalService.setRentalMode(modeOn, 'pv')
                return reply(montarAvisoDeModo({
                    escopo: 'o privado',
                    ligado: modeOn,
                    jaLiberado: false,
                    quemUsa: 'quem falar comigo no privado',
                    prefix
                }))
            }

            await rentalService.setRentalMode(modeOn, null)
            return reply(montarAvisoDeModo({
                escopo: 'todos os grupos e o privado',
                ligado: modeOn,
                jaLiberado: false,
                quemUsa: 'todo mundo que falar comigo',
                global: true,
                prefix
            }))
        }

        // 0.3 COMANDO VITALÍCIO DIRETO (.aluguel vitalicio <pv|grupo|combo> <alvo>)
        if (sub === 'vitalicio' || sub === 'vitalício' || sub === 'inf' || sub === 'infinito') {
            if (!isUserOwner) {
                return reply(`🔒 *Só meus donos podem liberar acesso vitalício.*\n\n💡 _Para ver os preços:_ ${F.cmd(prefix, 'aluguel', 'planos')}`)
            }

            const firstParam = (args[1] || '').toLowerCase()
            let scope = 'group'
            let rawTarget = ''

            if (['pv', 'dm', 'user', 'privado'].includes(firstParam)) {
                scope = 'pv'
                rawTarget = args.slice(2).join(' ')
            } else if (['grupo', 'group', 'grp'].includes(firstParam)) {
                scope = 'group'
                rawTarget = args.slice(2).join(' ')
            } else if (['combo', 'ambos'].includes(firstParam)) {
                scope = 'combo'
                rawTarget = args.slice(2).join(' ')
            } else {
                scope = isGroup ? 'group' : 'pv'
                rawTarget = args.slice(1).join(' ')
            }

            const mentioned = info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
            const targetInput = mentioned || quotedSender || rawTarget

            const resolved = await rentalService.resolveRentalTarget(targetInput, { from, isGroup, client })
            if (!resolved) {
                return reply(F.tela({
                    prefix,
                    emoji: '❌',
                    titulo: 'Para quem é o vitalício?',
                    intro: 'Não consegui identificar o destino. Informe número, marque a pessoa ou mande dentro do grupo.',
                    secoes: [{
                        emoji: '✍️', titulo: 'Digite assim', linhas: [
                            `• ${F.cmd(prefix, 'aluguel', 'vitalicio pv 5511999999999')} — pelo número`,
                            `• ${F.cmd(prefix, 'aluguel', 'vitalicio pv @fulano')} — marcando a pessoa`,
                            `• ${F.cmd(prefix, 'aluguel', 'vitalicio grupo')} — dentro do grupo`,
                            `• ${F.cmd(prefix, 'aluguel', 'vitalicio combo 5511999999999')} — grupo + privado`
                        ]
                    }]
                }))
            }

            if (scope === 'combo') {
                // Combo: concede vitalício no PV do usuário E no grupo (se estiver em grupo)
                rentalService.setLifetimeRental({
                    targetJid: resolved.jid,
                    targetType: 'pv',
                    targetName: resolved.name,
                    grantedBy: sender,
                    notes: 'Combo Vitalício (PV)'
                })
                if (isGroup) {
                    let groupName = 'Grupo Atual'
                    try {
                        const gm = await client.groupMetadata(from)
                        if (gm?.subject) groupName = gm.subject
                    } catch (e) {
                        logger.warn(`[ALUGUEL VITALICIO] Não consegui ler o nome do grupo ${from}: ${e.message}`)
                    }
                    rentalService.setLifetimeRental({
                        targetJid: from,
                        targetType: 'group',
                        targetName: groupName,
                        grantedBy: sender,
                        notes: `Combo Vitalício de ${nomeDoMembro(resolved.jid)}`
                    })
                }
            } else {
                rentalService.setLifetimeRental({
                    targetJid: resolved.jid,
                    targetType: scope,
                    targetName: resolved.name,
                    grantedBy: sender,
                    notes: `Acesso Vitalício [${scope.toUpperCase()}]`
                })
            }

            return reply(F.tela({
                prefix,
                emoji: '♾️',
                titulo: 'Acesso vitalício liberado',
                intro: `*${resolved.name}* pode usar os comandos para sempre, sem renovar.`,
                secoes: [{
                    emoji: '📋', titulo: 'Detalhes', linhas: [
                        F.campo('Para', resolved.name),
                        F.campo(resolved.jid.endsWith('@g.us') ? 'Código do grupo' : 'Número', identificacao(resolved.jid)),
                        F.campo('Modalidade', NOME_ESCOPO[scope] || scope),
                        F.campo('Liberado por', `${nomeDoMembro(sender)}`)
                    ]
                }],
                proximos: [
                    { nome: 'aluguel', args: 'list', oque: 'ver todos os aluguéis' },
                    { nome: 'aluguel', args: `del ${resolved.jid.endsWith('@g.us') ? resolved.jid : identificacao(resolved.jid)}`, oque: 'retirar o acesso' }
                ]
            }), [sender, resolved.jid])
        }

        // Validação de Dono para comandos de escrita subsequentes
        if (!isUserOwner && sub !== 'status' && sub !== '') {
            return reply(F.tela({
                prefix,
                emoji: '🔒',
                titulo: 'Só para os donos',
                intro: 'Essa parte do aluguel é só dos meus donos. Você pode ver os preços ou testar grátis.',
                proximos: [
                    { nome: 'aluguel', args: 'planos', oque: 'ver os preços' },
                    { nome: 'aluguel', args: 'teste', oque: 'liberar 2 horas grátis' },
                    { nome: 'aluguel', oque: 'ver a situação daqui' }
                ]
            }))
        }

        // 0.4 ALTERAR PREÇO E SINCRONIZAR NA STRIPE (.aluguel setpreco <id> <valor>)
        if (sub === 'setpreco' || sub === 'setprice' || sub === 'alterarpreco' || sub === 'mudarpreco') {
            const id = (args[1] || '').toLowerCase().trim()
            const novoValor = args[2]

            if (!id || !novoValor) {
                return reply(F.tela({
                    prefix,
                    emoji: '💰',
                    titulo: 'Mudar o preço de um plano',
                    intro: 'Informe o código do plano e o novo valor em reais. Eu atualizo no bot e no Mercado Pago.',
                    secoes: [{
                        emoji: '✍️', titulo: 'Digite assim', linhas: [
                            `• ${F.cmd(prefix, 'aluguel', 'setpreco g2 39.90')} — Grupo Mensal`,
                            `• ${F.cmd(prefix, 'aluguel', 'setpreco pv2 25')} — PV Mensal`,
                            `• ${F.cmd(prefix, 'aluguel', 'setpreco c1 49.90')} — Combo Mensal`
                        ]
                    }],
                    proximos: [{ nome: 'aluguel', args: 'planos', oque: 'ver os códigos dos planos' }]
                }))
            }

            try {
                validarPlanoAntes({ id, valor: novoValor, existente: true })
                await reply('⏳ *Atualizando o preço do plano...*')
                const res = await rentalPackages.setPreco(id, novoValor)
                const p = res.pacote

                return reply(F.tela({
                    prefix,
                    emoji: '✅',
                    titulo: 'Preço atualizado',
                    intro: `*${p.nome}* agora custa *${formatBrl(p.centavos)}*.`,
                    secoes: [{
                        emoji: '📋', titulo: 'Detalhes', linhas: [
                            F.campo('Plano', `${p.nome} (\`${p.id}\`)`),
                            F.campo('Modalidade', p.escopo),
                            F.campo('Duração', `${p.dias} dias`),
                            F.campo('Novo valor', formatBrl(p.centavos)),
                            F.campo('Mercado Pago (PIX)', '🟢 sincronizado')
                        ]
                    }],
                    proximos: [
                        { nome: 'aluguel', args: 'planos', oque: 'ver a tabela' },
                        { nome: 'assinar', args: p.id, oque: 'testar cobrança PIX' }
                    ]
                }))
            } catch (err) {
                return reply(traduzirErro(err, {
                    prefix,
                    contexto: `setpreco ${id}=${novoValor}`,
                    exemplos: [{ nome: 'aluguel', args: 'setpreco g2 39.90', oque: 'exemplo pronto' }],
                    falha: { titulo: 'Não consegui mudar o preço', intro: 'Algo deu errado do meu lado ao salvar o preço. Tente de novo em instantes.' }
                }))
            }
        }

        // 0.5 ADICIONAR NOVO PLANO (.aluguel addplano <id> <Grupo|PV> <dias> <valor> <Nome>)
        if (sub === 'addplano' || sub === 'criarplano' || sub === 'novoplano') {
            const id = (args[1] || '').toLowerCase().trim()
            const escopoRaw = (args[2] || '').toLowerCase().trim()
            const dias = parseInt(args[3], 10)
            const valor = args[4]
            const nome = args.slice(5).join(' ').trim()

            const escopoMap = { grupo: 'Grupo', group: 'Grupo', pv: 'PV', privado: 'PV', combo: 'Combo' }
            const escopo = escopoMap[escopoRaw]

            if (!id || !escopo || isNaN(dias) || !valor || !nome) {
                return reply(F.tela({
                    prefix,
                    emoji: '🆕',
                    titulo: 'Criar um plano',
                    intro: 'Informe, nesta ordem: código, modalidade (Grupo ou PV), dias, valor e nome.',
                    secoes: [{
                        emoji: '✍️', titulo: 'Digite assim', linhas: [
                            F.cmd(prefix, 'aluguel', 'addplano <código> <Grupo|PV> <dias> <valor> <nome>'),
                            `• ${F.cmd(prefix, 'aluguel', 'addplano g5 Grupo 60 70.00 Grupo Bimestral')}`,
                            `• ${F.cmd(prefix, 'aluguel', 'addplano pv5 PV 60 40.00 PV Bimestral')}`
                        ]
                    }],
                    proximos: [{ nome: 'aluguel', args: 'addcombo', oque: 'criar um combo grupo + privado' }]
                }))
            }

            try {
                validarPlanoAntes({ id, escopo, nome, dias, valor })
                await reply('⏳ *Criando o plano e sincronizando com a Stripe...*')
                const res = await rentalPackages.addPlano({ id, escopo, nome, dias, valor })
                const p = res.pacote
                if (!res.stripeSync?.ok) logger.warn(`[ALUGUEL ADDPLANO] Stripe não sincronizou ${p.id}: ${res.stripeSync?.motivo || 'sem motivo'}`)

                return reply(F.tela({
                    prefix,
                    emoji: '🎉',
                    titulo: 'Plano criado',
                    intro: `*${p.nome}* já aparece na tabela com o código \`${p.id}\`.`,
                    secoes: [{
                        emoji: '📋', titulo: 'Detalhes', linhas: [
                            F.campo('Nome', p.nome),
                            F.campo('Código', '`' + p.id + '`'),
                            F.campo('Modalidade', p.escopo),
                            F.campo('Validade', `${p.dias} dias`),
                            F.campo('Valor', formatBrl(p.centavos)),
                            F.campo('Stripe', res.stripeSync?.ok ? '🟢 produto e preço criados' : '⚠️ não atualizou agora (o plano já vale aqui)')
                        ]
                    }],
                    proximos: [
                        res.stripeSync?.ok ? null : { nome: 'aluguel', args: 'syncstripe', oque: 'tentar atualizar na Stripe de novo' },
                        { nome: 'aluguel', args: 'planos', oque: 'ver a tabela' }
                    ].filter(Boolean)
                }))
            } catch (err) {
                return reply(traduzirErro(err, {
                    prefix,
                    contexto: `addplano ${id}`,
                    exemplos: [{ nome: 'aluguel', args: 'addplano g5 Grupo 60 70.00 Grupo Bimestral', oque: 'exemplo pronto' }],
                    falha: { titulo: 'Não consegui criar o plano', intro: 'Algo deu errado do meu lado ao salvar o plano. Tente de novo em instantes.' }
                }))
            }
        }

        // 0.6 ADICIONAR NOVO COMBO (.aluguel addcombo <id> <dias> <valor> <Nome>)
        if (sub === 'addcombo' || sub === 'criarcombo' || sub === 'novocombo') {
            const id = (args[1] || '').toLowerCase().trim()
            const dias = parseInt(args[2], 10)
            const valor = args[3]
            const nome = args.slice(4).join(' ').trim()

            if (!id || isNaN(dias) || !valor || !nome) {
                return reply(F.tela({
                    prefix,
                    emoji: '👑',
                    titulo: 'Criar um combo',
                    intro: 'Combo libera grupo e privado juntos. Informe código, dias, valor e nome.',
                    secoes: [{
                        emoji: '✍️', titulo: 'Digite assim', linhas: [
                            F.cmd(prefix, 'aluguel', 'addcombo <código> <dias> <valor> <nome>'),
                            `• ${F.cmd(prefix, 'aluguel', 'addcombo c4 60 85.00 Combo Bimestral')}`,
                            `• ${F.cmd(prefix, 'aluguel', 'addcombo c5 180 200.00 Combo Semestral')}`
                        ]
                    }],
                    proximos: [{ nome: 'aluguel', args: 'planos', oque: 'ver os códigos já usados' }]
                }))
            }

            try {
                validarPlanoAntes({ id, escopo: 'Combo', nome, dias, valor })
                await reply('⏳ *Criando o combo e sincronizando com a Stripe...*')
                const res = await rentalPackages.addPlano({ id, escopo: 'Combo', nome, dias, valor })
                const p = res.pacote
                if (!res.stripeSync?.ok) logger.warn(`[ALUGUEL ADDCOMBO] Stripe não sincronizou ${p.id}: ${res.stripeSync?.motivo || 'sem motivo'}`)

                return reply(F.tela({
                    prefix,
                    emoji: '👑',
                    titulo: 'Combo criado',
                    intro: `*${p.nome}* já aparece na tabela com o código \`${p.id}\`.`,
                    secoes: [{
                        emoji: '📋', titulo: 'Detalhes', linhas: [
                            F.campo('Nome', p.nome),
                            F.campo('Código', '`' + p.id + '`'),
                            F.campo('Modalidade', 'grupo + privado'),
                            F.campo('Validade', `${p.dias} dias`),
                            F.campo('Valor', formatBrl(p.centavos)),
                            F.campo('Stripe', res.stripeSync?.ok ? '🟢 produto e preço criados' : '⚠️ não atualizou agora (o combo já vale aqui)')
                        ]
                    }],
                    proximos: [
                        res.stripeSync?.ok ? null : { nome: 'aluguel', args: 'syncstripe', oque: 'tentar atualizar na Stripe de novo' },
                        { nome: 'aluguel', args: 'planos', oque: 'ver a tabela' }
                    ].filter(Boolean)
                }))
            } catch (err) {
                return reply(traduzirErro(err, {
                    prefix,
                    contexto: `addcombo ${id}`,
                    exemplos: [{ nome: 'aluguel', args: 'addcombo c4 60 85.00 Combo Bimestral', oque: 'exemplo pronto' }],
                    falha: { titulo: 'Não consegui criar o combo', intro: 'Algo deu errado do meu lado ao salvar o combo. Tente de novo em instantes.' }
                }))
            }
        }

        // 0.7 REMOVER PLANO OU COMBO (.aluguel delplano <id>)
        if (sub === 'delplano' || sub === 'removerplano' || sub === 'excluirplano') {
            const id = (args[1] || '').toLowerCase().trim()
            if (!id) {
                return reply(F.tela({
                    prefix,
                    emoji: '🗑️',
                    titulo: 'Remover um plano',
                    intro: 'Informe o código do plano ou combo que quer tirar da tabela.',
                    secoes: [{ emoji: '✍️', titulo: 'Digite assim', linhas: [F.cmd(prefix, 'aluguel', 'delplano g5')] }],
                    proximos: [{ nome: 'aluguel', args: 'planos', oque: 'ver os códigos' }]
                }))
            }
            try {
                rentalPackages.delPlano(id)
                return reply(F.tela({
                    prefix,
                    emoji: '🗑️',
                    titulo: 'Plano removido',
                    intro: `Tirei o plano \`${id}\` da tabela. Quem já pagou continua com o prazo que tinha.`,
                    proximos: [
                        { nome: 'aluguel', args: 'planos', oque: 'ver a tabela' },
                        { nome: 'aluguel', args: 'resetplanos', oque: 'voltar à tabela padrão' }
                    ]
                }))
            } catch (err) {
                return reply(traduzirErro(err, {
                    prefix,
                    contexto: `delplano ${id}`,
                    falha: { titulo: 'Não consegui remover o plano', intro: 'Algo deu errado do meu lado e a tabela não mudou. Tente de novo em instantes.' }
                }))
            }
        }

        // 0.8 RESETAR PLANOS PARA O PADRÃO (.aluguel resetplanos)
        if (sub === 'resetplanos' || sub === 'restaurarplanos') {
            rentalPackages.resetPacotes()
            return reply(F.tela({
                prefix,
                emoji: '🔄',
                titulo: 'Tabela de planos restaurada',
                intro: 'Voltei os planos e combos para a tabela padrão. Preços e planos criados à mão foram desfeitos.',
                proximos: [
                    { nome: 'aluguel', args: 'planos', oque: 'ver a tabela' },
                    { nome: 'aluguel', args: 'syncmp', oque: 'sincronizar planos no Mercado Pago' }
                ]
            }))
        }

        // 0.9 FORÇAR SINCRONIZAÇÃO GERAL (.aluguel syncmp / .aluguel syncstripe)
        if (sub === 'syncmp' || sub === 'sincronizarmp' || sub === 'sync' || sub === 'syncstripe' || sub === 'sincronizarstripe') {
            await reply('⏳ *Sincronizando planos com o Mercado Pago...*')
            let res
            try {
                res = await rentalPackages.sincronizarTodosComMercadoPago()
            } catch (err) {
                return reply(traduzirErro(err, {
                    prefix,
                    contexto: 'syncmp',
                    exemplos: [{ nome: 'aluguel', args: 'syncmp', oque: 'tentar de novo' }],
                    falha: { titulo: 'Não consegui sincronizar', intro: 'Algo deu errado do meu lado. A tabela daqui continua valendo; tente de novo em instantes.' }
                }))
            }
            const falhas = res.filter(r => !r.ok)

            return reply(F.tela({
                prefix,
                emoji: falhas.length ? '⚠️' : '⚡',
                titulo: falhas.length ? `Mercado Pago: ${falhas.length} plano(s) com pendência` : 'Mercado Pago sincronizado',
                intro: falhas.length
                    ? 'Alguns planos não foram sincronizados. A tabela interna permanece ativa.'
                    : `Todos os ${res.length} planos estão prontos para pagamentos PIX no Mercado Pago.`,
                secoes: [{
                    emoji: '📋', titulo: 'Planos Ativos', linhas: res.map(r => `${r.ok ? '🟢' : '🔴'} \`${r.id}\` — ${r.nome}`)
                }],
                dica: 'Use .assinar <codigo> para gerar um PIX de teste ou cobrança real.'
            }))
        }

        // 1. LISTA DE TODOS OS ALUGUÉIS (.aluguel list / .aluguel lista)
        if (sub === 'list' || sub === 'lista') {
            const list = rentalService.getAllRentalsList()
            if (list.length === 0) {
                return reply(F.tela({
                    prefix,
                    emoji: '📋',
                    titulo: 'Nenhum aluguel cadastrado',
                    intro: 'Aqui aparecem os grupos e pessoas com aluguel, com o prazo de cada um. Ainda não há nenhum.',
                    secoes: [{
                        emoji: '✍️', titulo: 'Como cadastrar', linhas: [
                            `• ${F.cmd(prefix, 'aluguel', 'set 30d grupo')} — dentro do grupo, libera por 30 dias`,
                            `• ${F.cmd(prefix, 'aluguel', 'set 30d pv 5511999999999')} — libera o privado dessa pessoa`,
                            `• ${F.cmd(prefix, 'aluguel', 'vitalicio grupo')} — libera o grupo para sempre`
                        ]
                    }],
                    dica: 'Quem pagar pelo link gera créditos e renova sozinho com .reativar.'
                }))
            }

            const blocos = list.map((r, idx) => {
                const statusEmoji = r.isExpired ? '🔴' : (r.isLifetime ? '♾️' : (r.isTrial ? '⚡' : '🟢'))
                const tipo = r.targetType === 'pv' ? '👤 privado' : '🏢 grupo'
                const jid = r.targetJid || r.groupJid
                return [
                    `${statusEmoji} *${idx + 1}. ${r.targetName || 'Sem nome'}* (${tipo})`,
                    F.campo(String(jid).endsWith('@g.us') ? 'Código' : 'Número', identificacao(jid)),
                    F.campo('Situação', r.isLifetime ? 'vitalício' : (r.isExpired ? 'vencido' : `faltam ${r.remainingText}`)),
                    r.isLifetime ? null : F.campo(r.isExpired ? 'Venceu em' : 'Vence em', r.expiresAtFormatted),
                    r.price > 0 ? F.campo('Valor', `R$ ${r.price.toFixed(2)}`) : null
                ].filter(Boolean).join('\n')
            })

            return reply(F.tela({
                prefix,
                emoji: '📋',
                titulo: `Aluguéis cadastrados (${list.length})`,
                intro: '🟢 ativo • ⚡ teste • ♾️ vitalício • 🔴 vencido',
                secoes: [blocos.join('\n\n')],
                proximos: [
                    { nome: 'aluguel', args: 'add 15d <número ou código>', oque: 'somar dias a um aluguel' },
                    { nome: 'aluguel', args: 'del <número ou código>', oque: 'remover um aluguel' }
                ]
            }))
        }

        // 2. DEFINIR OU RENOVAR ALUGUEL (.aluguel set <tempo> [pv|grupo] [alvo] [valor] [pix])
        if (sub === 'set' || sub === 'definir' || sub === 'novo') {
            const durationStr = args[1] || '30d'
            let scope = 'group'
            let targetArgIndex = 2

            if (['pv', 'dm', 'privado'].includes((args[2] || '').toLowerCase())) {
                scope = 'pv'
                targetArgIndex = 3
            } else if (['grupo', 'group'].includes((args[2] || '').toLowerCase())) {
                scope = 'group'
                targetArgIndex = 3
            }

            const rawTarget = args[targetArgIndex]
            const mentioned = info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
            const targetInput = mentioned || quotedSender || rawTarget

            const resolved = await rentalService.resolveRentalTarget(targetInput, { from, isGroup, client })
            if (!resolved) {
                return reply(telaAlvoInvalido(prefix, [
                    { nome: 'aluguel', args: 'set 30d pv 5511999999999', oque: 'privado de uma pessoa por 30 dias' },
                    { nome: 'aluguel', args: 'set 30d grupo', oque: 'dentro do grupo, por 30 dias' }
                ]))
            }

            const price = parseFloat(args[targetArgIndex + 1]) || 0
            const pixKey = args[targetArgIndex + 2] || ''

            try {
                const rental = rentalService.setRental({
                    targetJid: resolved.jid,
                    targetType: scope,
                    targetName: resolved.name,
                    renterJid: resolved.jid,
                    rentedBy: sender,
                    durationStr,
                    price,
                    pixKey
                })

                const isLifetime = rental.isLifetime
                const duracaoTexto = isLifetime ? '♾️ vitalício' : duracaoLegivel(durationStr)
                const expiraTexto = isLifetime ? '♾️ nunca' : F.dataHora(rental.expiresAt)

                // Notifica o alvo diretamente com a mensagem oficial de retorno de pagamento confirmado
                if (client?.sendMessage && resolved.jid && resolved.jid !== from) {
                    try {
                        let retornoMsg = `╔══════════════════════════════╗\n`;
                        retornoMsg += `║   💳 *PAGAMENTO CONFIRMADO!*   ║\n`;
                        retornoMsg += `╚══════════════════════════════╝\n\n`;
                        retornoMsg += `👑 *Dono Temporário / Aluguel Ativado!* ⚡\n`;
                        retornoMsg += `Olá! Seu pagamento foi confirmado e seu acesso oficial foi liberado com sucesso.\n\n`;
                        retornoMsg += `╭━〔 📋 DETALHES DA ATIVAÇÃO 〕━⬣\n`;
                        retornoMsg += `┃ 👤 *Titular:* ${resolved.name}\n`;
                        retornoMsg += `┃ 🏷️ *Modalidade:* ${NOME_ESCOPO[scope] || scope}\n`;
                        retornoMsg += `┃ ⏱️ *Duração:* ${duracaoTexto}\n`;
                        retornoMsg += `┃ 📅 *Vencimento:* ${expiraTexto}\n`;
                        if (price > 0) retornoMsg += `┃ 💰 *Valor:* R$ ${price.toFixed(2)}\n`;
                        retornoMsg += `┃ 🔓 *Acesso:* Comandos e privado totalmente liberados\n`;
                        retornoMsg += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
                        retornoMsg += `💡 _Dúvidas ou suporte? Digite \`${prefix}dono\` ou fale com a administração._\n`;
                        retornoMsg += `👑 *➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Prime*`;

                        await client.sendMessage(resolved.jid, { text: retornoMsg });
                    } catch (notifyErr) {
                        logger.warn(`[RENTAL NOTIFY] Não foi possível enviar confirmação para ${resolved.jid}: ${notifyErr.message}`);
                    }
                }

                return reply(F.tela({
                    prefix,
                    emoji: '🎉',
                    titulo: 'Aluguel ativado',
                    intro: `*${resolved.name}* está liberado ${isLifetime ? 'para sempre' : `até *${expiraTexto}*`}.`,
                    secoes: [{
                        emoji: '📋', titulo: 'Detalhes', linhas: [
                            F.campo('Para', `${resolved.name} (${NOME_ESCOPO[scope] || scope})`),
                            F.campo(resolved.jid.endsWith('@g.us') ? 'Código do grupo' : 'Número', identificacao(resolved.jid)),
                            F.campo('Duração', duracaoTexto),
                            F.campo('Vence em', expiraTexto),
                            price > 0 ? F.campo('Valor', `R$ ${price.toFixed(2)}`) : null,
                            pixKey ? F.campo('Chave Pix para renovar', '`' + pixKey + '`') : null,
                            F.campo('Ativado por', `${nomeDoMembro(sender)}`)
                        ]
                    }],
                    proximos: [
                        { nome: 'aluguel', args: 'add 15d', oque: 'somar mais dias depois' },
                        { nome: 'aluguel', args: 'list', oque: 'ver todos os aluguéis' }
                    ]
                }), [sender, resolved.jid])
            } catch (err) {
                const resto = args.slice(2).join(' ') || (scope === 'pv' ? 'pv' : 'grupo')
                return reply(traduzirErro(err, {
                    prefix,
                    contexto: `set ${durationStr} ${resolved.jid}`,
                    duracao: durationStr,
                    exemplos: [
                        { nome: 'aluguel', args: `set 30d ${resto}`, oque: 'liberar por 30 dias' },
                        { nome: 'aluguel', args: `set 7d ${resto}`, oque: 'liberar por 7 dias' }
                    ],
                    falha: { titulo: 'Não consegui ativar o aluguel', intro: 'Algo deu errado do meu lado e nada foi alterado. Tente de novo em instantes.' }
                }))
            }
        }

        // 3. ADICIONAR TEMPO EXTRA (.aluguel add 15d [alvo])
        if (sub === 'add' || sub === 'estender' || sub === 'mais') {
            const durationStr = args[1] || '30d'
            const rawTarget = args[2]
            const mentioned = info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
            const targetInput = mentioned || quotedSender || rawTarget

            const resolved = await rentalService.resolveRentalTarget(targetInput, { from, isGroup, client })
            if (!resolved) {
                return reply(telaAlvoInvalido(prefix, [
                    { nome: 'aluguel', args: 'add 15d', oque: 'dentro do grupo, soma 15 dias' },
                    { nome: 'aluguel', args: 'add 15d 5511999999999', oque: 'privado de uma pessoa' },
                    { nome: 'aluguel', args: 'list', oque: 'ver números e códigos cadastrados' }
                ]))
            }

            try {
                const rental = rentalService.addRentalTime(resolved.jid, durationStr, sender)

                return reply(F.tela({
                    prefix,
                    emoji: '⏳',
                    titulo: 'Aluguel estendido',
                    intro: `Somei *${duracaoLegivel(durationStr)}* ao prazo de *${rental.targetName || resolved.name}*.`,
                    secoes: [{
                        emoji: '📋', titulo: 'Detalhes', linhas: [
                            F.campo('Para', rental.targetName || resolved.name),
                            F.campo('Tempo somado', `+${duracaoLegivel(durationStr)}`),
                            F.campo('Novo vencimento', rental.isLifetime ? '♾️ vitalício' : F.dataHora(rental.expiresAt))
                        ]
                    }],
                    proximos: [{ nome: 'aluguel', args: 'list', oque: 'ver todos os aluguéis' }]
                }))
            } catch (err) {
                return reply(traduzirErro(err, {
                    prefix,
                    contexto: `add ${durationStr} ${resolved.jid}`,
                    duracao: durationStr,
                    exemplos: [
                        { nome: 'aluguel', args: 'add 15d', oque: 'somar 15 dias' },
                        { nome: 'aluguel', args: 'add 24h', oque: 'somar 24 horas' }
                    ],
                    falha: { titulo: 'Não consegui estender o aluguel', intro: 'Algo deu errado do meu lado e o prazo não mudou. Tente de novo em instantes.' }
                }))
            }
        }

        // 4. REMOVER ALUGUEL (.aluguel del [alvo])
        if (sub === 'del' || sub === 'off' || sub === 'remover' || sub === 'cancelar') {
            const rawTarget = args[1]
            const mentioned = info.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
            const targetInput = mentioned || quotedSender || rawTarget

            const resolved = await rentalService.resolveRentalTarget(targetInput, { from, isGroup, client })
            if (!resolved) {
                return reply(telaAlvoInvalido(prefix, [
                    { nome: 'aluguel', args: 'del', oque: 'dentro do grupo, cancela o aluguel dele' },
                    { nome: 'aluguel', args: 'del 5511999999999', oque: 'privado de uma pessoa' },
                    { nome: 'aluguel', args: 'list', oque: 'ver números e códigos cadastrados' }
                ]))
            }

            rentalService.removeRental(resolved.jid)
            logger.info(`[RENTAL DELETE] ${sender} removeu o aluguel de ${resolved.jid}`)
            return reply(F.tela({
                prefix,
                emoji: '🔓',
                titulo: 'Aluguel removido',
                intro: `Cancelei o aluguel de *${resolved.name}* (${identificacao(resolved.jid)}). Se o modo aluguel estiver ligado, o acesso lá fica bloqueado.`,
                proximos: [
                    { nome: 'aluguel', args: 'set 30d', oque: 'cadastrar de novo' },
                    { nome: 'aluguel', args: 'list', oque: 'ver os aluguéis restantes' }
                ]
            }))
        }

        // 5. STATUS ATUAL DO ALUGUEL (.aluguel / .aluguel status)
        if (isGroup) {
            const isModeActive = rentalService.isRentalModeEnabled(from, true)
            const r = rentalService.getRentalInfo(from)

            if (!r) {
                return reply(F.tela({
                    prefix,
                    emoji: '📌',
                    titulo: 'Aluguel deste grupo',
                    intro: isModeActive
                        ? 'Este grupo *não tem aluguel* e o modo aluguel está ligado: os membros estão bloqueados.'
                        : 'Este grupo *não tem aluguel*, mas o modo aluguel está desligado: todos usam livremente.',
                    secoes: [
                        {
                            emoji: '📋', titulo: 'Situação', linhas: [
                                F.campo('Modo aluguel', isModeActive ? '🟢 ligado (exige assinatura)' : '⚪ desligado (livre)'),
                                F.campo('Aluguel', 'nenhum cadastrado')
                            ]
                        },
                        // O atalho de vitalício NÃO é sugerido aqui. Ele anula a cobrança
                        // do ambiente para sempre e é decisão deliberada do dono — não o
                        // caminho natural de quem só consultou o status.
                        isUserOwner ? {
                            emoji: '👑', titulo: 'Para os donos', linhas: [
                                `• ${F.cmd(prefix, 'aluguel', 'set 30d grupo')} — cadastra 30 dias para este grupo`,
                                `• ${F.cmd(prefix, 'aluguel', 'list')} — vê todos os aluguéis`,
                                '_Seus comandos funcionam mesmo com o grupo bloqueado._'
                            ]
                        } : null
                    ],
                    proximos: [
                        { nome: 'aluguel', args: 'teste', oque: 'liberar 2 horas grátis' },
                        { nome: 'aluguel', args: 'planos', oque: 'ver os preços' }
                    ]
                }))
            }

            const nomeGrupo = r.groupName || r.targetName || 'Este grupo'
            return reply(F.tela({
                prefix,
                emoji: '📌',
                titulo: 'Aluguel deste grupo',
                intro: r.isLifetime
                    ? `*${nomeGrupo}* tem acesso vitalício, não vence.`
                    : (r.isExpired
                        ? `O aluguel de *${nomeGrupo}* venceu em ${r.expiresAtFormatted}.`
                        : `*${nomeGrupo}* está liberado por mais *${r.remainingText}*, até ${r.expiresAtFormatted}.`),
                secoes: [{
                    emoji: '📋', titulo: 'Situação', linhas: [
                        F.campo('Grupo', nomeGrupo),
                        F.campo('Modo aluguel', isModeActive ? '🟢 ligado' : '⚪ desligado'),
                        ...linhasDePrazo(r),
                        r.price > 0 ? F.campo('Valor', `R$ ${r.price.toFixed(2)}`) : null,
                        r.pixKey ? F.campo('Pix para renovar', '`' + r.pixKey + '`') : null
                    ]
                }],
                proximos: [
                    isUserOwner ? { nome: 'aluguel', args: 'add 30d', oque: 'somar 30 dias (dono)' } : null,
                    { nome: 'assinar', oque: 'pagar a renovação' },
                    { nome: 'reativar', args: '30', oque: 'renovar com créditos' }
                ].filter(Boolean)
            }))
        }

        // No Privado (PV)
        const isPvModeActive = rentalService.isRentalModeEnabled(sender, false)
        const pvInfo = rentalService.getRentalInfo(sender)
        const ativo = pvInfo && !pvInfo.isExpired

        return reply(F.tela({
            prefix,
            emoji: '👤',
            titulo: 'Seu acesso no privado',
            intro: ativo
                ? (pvInfo.isLifetime ? 'Seu acesso comigo no privado é vitalício.' : `Seu acesso comigo no privado está liberado até *${pvInfo.expiresAtFormatted}*.`)
                : (isPvModeActive
                    ? 'Você não tem plano de privado ativo, e o privado exige assinatura agora.'
                    : 'Você não tem plano de privado, mas o privado está livre no momento.'),
            secoes: [
                {
                    emoji: '📋', titulo: 'Situação', linhas: [
                        F.campo('Modo aluguel no privado', isPvModeActive ? '🟢 ligado' : '⚪ desligado'),
                        ...(pvInfo ? linhasDePrazo(pvInfo) : [F.campo('Plano', '🔴 nenhum ativo')])
                    ]
                },
                isUserOwner ? {
                    emoji: '👑', titulo: 'Atalhos dos donos', linhas: [
                        `• ${F.cmd(prefix, 'aluguel', 'set 30d pv 5511999999999')} — libera o privado de alguém`,
                        `• ${F.cmd(prefix, 'aluguel', 'vitalicio pv 5511999999999')} — privado vitalício`,
                        `• ${F.cmd(prefix, 'aluguel', 'modo pv on')} — liga ou desliga o modo no privado`,
                        `• ${F.cmd(prefix, 'aluguel', 'list')} — vê todos os aluguéis`
                    ]
                } : null
            ],
            proximos: ativo ? [] : [
                { nome: 'aluguel', args: 'teste', oque: 'liberar 2 horas grátis' },
                { nome: 'aluguel', args: 'planos', oque: 'ver os preços de privado e combo' }
            ]
        }))
    }
}
