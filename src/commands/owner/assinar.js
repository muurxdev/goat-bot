/**
 * Comando .assinar — gera cobrança PIX com QR Code e Copia e Cola via Mercado Pago
 * 
 * Permite assinar planos de aluguel e comprar créditos instantaneamente via PIX.
 * O QR Code é gerado como imagem PNG e enviado diretamente no chat com legenda detalhada,
 * e o código Copia e Cola é enviado em seguida como mensagem única para cópia facilitada no celular.
 * 
 * Também suporta conferência instantânea: `.assinar status <paymentId>`
 */

const mercadoPago = require('../../services/payments/mercadoPagoService')
const creditos = require('../../services/payments/creditsService')
const rentalPackages = require('../../services/payments/rentalPackagesService')
const rentalService = require('../../services/rentalService')
const persistentScheduler = require('../../services/persistentScheduler')
const { notifyDonos } = require('../../services/ownerService')
const { getBotName } = require('../../config/botConfig')
const logger = require('../../core/logger')
const F = require('../../utils/formato')

const reais = c => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

module.exports = {
    name: 'assinar',
    aliases: ['checkout', 'pix', 'comprarcreditos', 'planos', 'alugarbot', 'pagar'],
    category: 'owner',
    subcategory: 'Aluguel',
    description: 'Mostra os planos e gera cobrança PIX instantânea com QR Code do Mercado Pago',
    usage: '[código do plano | status <id>] [@pessoa | número]',
    examples: [
        ' — mostra os planos com preços e códigos',
        'g2 — gera o PIX do Grupo Mensal para você',
        'pv2 @fulano — gera o PIX do PV Mensal para outra pessoa',
        'status 12345678 — confere se o pagamento já caiu no Mercado Pago'
    ],
    cooldownMs: 5000,
    execute: async ({ sender, from, isGroup, args, reply, client, info, quotedSender, isOwner, userRole, prefix = '.' }) => {
        const sub = (args[0] || '').toLowerCase()

        // 1. CONFERÊNCIA MANUAL DE STATUS (.assinar status <paymentId>)
        if (sub === 'status' || sub === 'conferir' || sub === 'checar') {
            const paymentId = (args[1] || '').trim()
            if (!paymentId) {
                return reply(F.tela({
                    prefix,
                    emoji: '🔍',
                    titulo: 'Conferir Pagamento PIX',
                    intro: 'Informe o ID do pagamento retornado na geração do PIX.',
                    dica: 'Exemplo: .assinar status 123456789',
                    proximos: [
                        { nome: 'assinar', oque: 'ver planos de aluguel' }
                    ]
                }))
            }

            await reply('⏳ *Consultando status no Mercado Pago...*')

            try {
                const infoPay = await mercadoPago.consultarPagamento(paymentId)
                if (infoPay.isApproved) {
                    const meta = infoPay.metadata || {}
                    await mercadoPago.processarAprovacao({
                        paymentId,
                        client,
                        pacoteId: meta.pacote || 'Aluguel',
                        targetJid: meta.target_jid || meta.targetJid || sender,
                        requestedBy: meta.requested_by || meta.requestedBy || sender,
                        dias: Number(meta.dias || 30),
                        valorCentavos: Math.round((infoPay.amount || 0) * 100)
                    })
                    return reply('🎉 *Pagamento APROVADO!* O seu aluguel já foi ativado com sucesso.')
                }

                return reply(F.tela({
                    prefix,
                    emoji: '⏳',
                    titulo: 'Pagamento em Processamento',
                    intro: `O pagamento #${paymentId} está com status: *${infoPay.status}* (${infoPay.statusDetail || 'aguardando transferência'}).`,
                    dica: 'Assim que você efetuar a transferência no app do banco, o aluguel será liberado automaticamente em alguns instantes.',
                    proximos: [
                        { nome: 'assinar', args: `status ${paymentId}`, oque: 'consultar novamente' },
                        { nome: 'aluguel', args: 'status', oque: 'ver tempo atual' }
                    ]
                }))
            } catch (err) {
                logger.error(`[ASSINAR STATUS] Erro ao consultar pagamento #${paymentId}: ${err.message}`)
                return reply(`❌ Não consegui consultar o pagamento no Mercado Pago: ${err.message}`)
            }
        }

        // 2. LISTAGEM DE PLANOS
        const pacotes = rentalPackages.getPacotes()
        const pacote = rentalPackages.getPacote(sub)

        if (!pacote) {
            const linhasDe = escopo => pacotes.filter(x => x.escopo === escopo).map(p => {
                const cr = creditos.centavosParaCreditos(p.centavos)
                return `• \`${p.id}\` — *${p.nome}:* ${reais(p.centavos)} _(${cr} créditos, ${p.dias} dias)_`
            })

            return reply(F.tela({
                prefix,
                emoji: '💳',
                titulo: 'Planos de aluguel (PIX Mercado Pago)',
                intro: sub
                    ? `Não achei o plano "${sub}". Escolha um dos códigos abaixo.`
                    : 'Escolha um plano e mande o código. Eu gero na hora a chave Copia e Cola e o QR Code do PIX!',
                secoes: [
                    { emoji: '🏢', titulo: 'Grupo', linhas: linhasDe('Grupo') },
                    { emoji: '👤', titulo: 'Privado', linhas: linhasDe('PV') },
                    { emoji: '👑', titulo: 'Combo (grupo + privado)', linhas: linhasDe('Combo') },
                    {
                        emoji: '💰', titulo: 'Sua carteira', linhas: [
                            F.campo('Créditos atuais', creditos.saldo(sender)),
                            mercadoPago.modo() === 'simulacao' ? '⚠️ *Modo de simulação:* adicione MERCADO_PAGO_ACCESS_TOKEN no .env para pagamentos em produção.' : null
                        ]
                    }
                ],
                dica: 'O PIX cai na hora e libera o bot instantaneamente sem intervenção manual.',
                proximos: [
                    { nome: 'assinar', args: 'g2', oque: 'pagar o Grupo Mensal (R$ 35,00)' },
                    { nome: 'assinar', args: 'pv2', oque: 'pagar o PV Mensal (R$ 20,00)' },
                    { nome: 'assinar', args: 'c1', oque: 'pagar o Combo Mensal (R$ 45,00)' },
                    { nome: 'aluguel', args: 'teste', oque: 'liberar 2 horas grátis antes' }
                ]
            }))
        }

        // 3. DETERMINAR BENEFICIÁRIO
        let targetJid = sender
        let targetName = sender.split('@')[0]
        const rawTarget = args[1]
        const mentioned = info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        const targetInput = mentioned || quotedSender || rawTarget

        if (targetInput) {
            const resolved = await rentalService.resolveRentalTarget(targetInput, { from, isGroup, client })
            if (resolved) {
                targetJid = resolved.jid
                targetName = resolved.name
            }
        }

        await reply('⏳ *Gerando cobrança PIX no Mercado Pago...*')

        try {
            const pixData = await mercadoPago.criarPixPayment({
                valorCentavos: pacote.centavos,
                descricao: `Aluguel ${getBotName()} - ${pacote.nome}`,
                metadata: {
                    targetJid,
                    requestedBy: sender,
                    pacote: pacote.id,
                    dias: String(pacote.dias),
                    beneficiaryName: targetName
                },
                payerEmail: `${sender.split('@')[0]}@goat-bot.local`,
                payerName: targetName || 'Cliente GOAT'
            })

            logger.info(`[ASSINAR/PIX] Cobrança #${pixData.id} criada para ${targetJid} via ${sender} (${pacote.nome})`)

            const cr = creditos.centavosParaCreditos(pacote.centavos)
            const expiraFormatado = new Date(pixData.expiresAt).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })

            const captionDoc = F.tela({
                prefix,
                emoji: '⚡',
                titulo: 'PIX Pronto para Pagamento',
                intro: `Use o QR Code acima ou o código Copia e Cola abaixo para pagar no app do seu banco.`,
                secoes: [
                    {
                        emoji: '📦', titulo: 'Resumo do Pedido', linhas: [
                            F.campo('Plano', pacote.nome),
                            F.campo('Duração', `${pacote.dias} dias`),
                            F.campo('Valor', reais(pacote.centavos)),
                            F.campo('Créditos inclusos', cr),
                            F.campo('ID Cobrança', `#${pixData.id}`),
                            F.campo('Para', `@${targetJid.split('@')[0]}`),
                            F.campo('Vence às', `${expiraFormatado} (em 30 min)`)
                        ]
                    },
                    mercadoPago.modo() === 'simulacao' ? '⚠️ *Modo demonstração/simulado:* nenhuma cobrança real será feita.' : null
                ],
                dica: 'Assim que pagar, o aluguel é estendido sozinho! Se demorar, use .assinar status ' + pixData.id,
                proximos: [
                    { nome: 'assinar', args: `status ${pixData.id}`, oque: 'conferir se o PIX foi aprovado' },
                    { nome: 'aluguel', args: 'status', oque: 'ver situação do aluguel' }
                ]
            })

            // 1) Envia imagem do QR Code com legenda se gerado com sucesso
            if (pixData.qrCodeBuffer) {
                try {
                    await client.sendMessage(from, {
                        image: pixData.qrCodeBuffer,
                        caption: captionDoc,
                        mentions: [targetJid]
                    })
                } catch (errImg) {
                    logger.warn(`[ASSINAR/PIX] Falha ao enviar imagem do QR Code: ${errImg.message}; enviando texto`)
                    await reply(captionDoc, [targetJid])
                }
            } else {
                await reply(captionDoc, [targetJid])
            }

            // 2) Envia o Copia e Cola puro em mensagem separada para facilitar copiar no celular
            if (pixData.copiaCola) {
                await client.sendMessage(from, { text: pixData.copiaCola })
            }

            // 3) Agenda polling automático a cada 20 segundos por até 10 minutos para aprovação autônoma
            let tentativas = 0
            const maxTentativas = 25
            const intervaloId = setInterval(async () => {
                tentativas++
                try {
                    const st = await mercadoPago.consultarPagamento(pixData.id)
                    if (st.isApproved) {
                        clearInterval(intervaloId)
                        await mercadoPago.processarAprovacao({
                            paymentId: pixData.id,
                            client,
                            pacoteId: pacote.id,
                            targetJid,
                            requestedBy: sender,
                            dias: pacote.dias,
                            valorCentavos: pacote.centavos
                        })
                    }
                } catch (e) {
                    // Ignora falhas de rede no polling
                }
                if (tentativas >= maxTentativas) {
                    clearInterval(intervaloId)
                }
            }, 20000)

            // 4) Notifica os Donos do bot via WhatsApp
            const donoDoc = F.tela({
                prefix,
                emoji: '🔔',
                titulo: 'Nova Cobrança PIX Gerada',
                intro: `@${sender.split('@')[0]} gerou uma cobrança PIX no Mercado Pago.`,
                secoes: [{
                    emoji: '📋', titulo: 'Detalhes', linhas: [
                        F.campo('ID Cobrança', `#${pixData.id}`),
                        F.campo('Pediu', `@${sender.split('@')[0]}`),
                        F.campo('Para', `@${targetJid.split('@')[0]} (${targetName})`),
                        F.campo('Plano', `${pacote.nome} (${pacote.id})`),
                        F.campo('Valor', reais(pacote.centavos)),
                        F.campo('Horário', new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }))
                    ]
                }]
            })

            try {
                await notifyDonos(client, donoDoc, { mentions: [sender, targetJid] })
            } catch (e) {
                logger.warn(`[ASSINAR/PIX] Aviso aos donos falhou: ${e.message}`)
            }

        } catch (e) {
            logger.error(`[ASSINAR/PIX ERROR] Falha ao criar cobrança PIX: ${e.message}`)
            return reply(F.tela({
                prefix,
                emoji: '❌',
                titulo: 'Não consegui gerar o PIX',
                intro: `O Mercado Pago não respondeu adequadamente: ${e.message}`,
                dica: 'Tente de novo em alguns minutos ou fale diretamente com um dos donos.',
                proximos: [
                    { nome: 'assinar', args: pacote.id, oque: 'tentar de novo' },
                    { nome: 'dono', oque: 'falar com os donos' }
                ]
            }))
        }
    }
}
