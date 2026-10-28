/**
 * Comando .agendagrupo / .agenda
 * Agenda automática para fechar e reabrir o grupo por horário
 * Suporte completo a dias da semana, ciclos (Semanal, Mensal ou Permanente até remover)
 * e notificações 100% personalizadas
 */

const F = require('../../utils/formato');
const groupScheduleService = require('../../services/groupScheduleService');
const groupAuthService = require('../../services/groupAuthService');
const { getGreetingVars, resolveMentionsForText } = require('../../services/groupGreetingService');
const logger = require('../../core/logger');

module.exports = {
    name: 'agendagrupo',
    aliases: ["agenda","agendag","horariogrupo","horariosgrupo","autoabrir","autofechar","cmd_agendagrupo","alt_agendagrupo","atalho_agendagrupo","abrev_agendagrupo","call_agendagrupo","func_agendagrupo"],
    category: 'admin',
    subcategory: 'Moderação de Grupos',
    description: 'Configura a agenda de fechamento e abertura automática do grupo (Semanal, Mensal ou Permanente)',
    usage: '[on | off | set <dias> <hora_fechar> <hora_abrir> [ciclo] | ciclo <semana|mes|permanente|ate data> | remover | msgfechar <texto> | msgabrir <texto> | testar]',
    examples: [
        ' — exibe o painel da agenda e o ciclo ativo',
        'set seg-sex 22:00 07:00 permanente — agenda definitiva até remover',
        'set seg-sex 22:00 07:00 semana — ativa pelo período de 1 semana',
        'set todos 23:00 08:00 mes — ativa pelo período de 1 mês',
        'ciclo semana — altera o ciclo para 7 dias',
        'ciclo mes — altera o ciclo para 30 dias',
        'ciclo permanente — roda continuamente até remoção manual',
        'on — ativa a agenda no grupo',
        'off — pausa a agenda no grupo',
        'remover — apaga a agenda configurada'
    ],
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, args, reply, client, sender, prefix = '.' }) => {
        const sub = (args[0] || '').toLowerCase().trim();
        const sched = groupScheduleService.getSchedule(from);

        // 1. SEM ARGUMENTOS OU STATUS: exibe o painel completo da agenda
        if (!sub || sub === 'status' || sub === 'ver' || sub === 'painel') {
            const diasFmt = groupScheduleService.formatDays(sched.days);
            const statusEmoji = sched.enabled ? '🟢' : '🔴';
            const statusTxt = sched.enabled ? 'Ativada' : 'Desativada';
            const cicloFmt = groupScheduleService.formatCycle(sched);

            return reply(F.tela({
                emoji: '📅',
                titulo: 'Agenda Automática do Grupo',
                intro: `Controle de abertura e fechamento programado (fuso de Brasília).`,
                secoes: [
                    {
                        emoji: '⚙️',
                        titulo: 'Configuração Atual',
                        linhas: [
                            F.campo('Status', `${statusEmoji} ${statusTxt}`),
                            F.campo('Ciclo / Validade', cicloFmt),
                            F.campo('Dias ativos', diasFmt),
                            F.campo('Horário de fechar', `🔒 ${sched.closeTime}`),
                            F.campo('Horário de abrir', `🔓 ${sched.openTime}`),
                            F.campo('Msg Fechar', sched.closeMsg ? 'Personalizada' : 'Padrão Oficial'),
                            F.campo('Msg Abrir', sched.openMsg ? 'Personalizada' : 'Padrão Oficial')
                        ]
                    },
                    {
                        emoji: '✍️',
                        titulo: 'Opções de Programação',
                        linhas: [
                            `• ${F.cmd(prefix, 'agenda', 'on / off')} — liga ou desliga a agenda`,
                            `• ${F.cmd(prefix, 'agenda', 'ciclo permanente')} — ativo para sempre até remover`,
                            `• ${F.cmd(prefix, 'agenda', 'ciclo semana')} — válido por 7 dias`,
                            `• ${F.cmd(prefix, 'agenda', 'ciclo mes')} — válido por 30 dias`,
                            `• ${F.cmd(prefix, 'agenda', 'set seg-sex 22:00 07:00')} — programa dias e horários`,
                            `• ${F.cmd(prefix, 'agenda', 'remover')} — apaga a programação`,
                            `• ${F.cmd(prefix, 'agenda', 'testar')} — simula prévia das notificações`
                        ]
                    }
                ],
                dica: 'Variáveis aceitas nas mensagens: {grupo}, {hora_fechar}, {hora_abrir}, {dia_abrir}, {dono}, {adms}.',
                proximos: [
                    sched.enabled
                        ? { nome: 'agenda', args: 'off', oque: 'desativar agenda' }
                        : { nome: 'agenda', args: 'on', oque: 'ativar agenda' },
                    { nome: 'agenda', args: 'ciclo', oque: 'configurar ciclo' }
                ],
                prefix
            }));
        }

        // 2. ATIVAR (ON) / DESATIVAR (OFF)
        if (sub === 'on' || sub === 'ativar' || sub === 'ligar') {
            await groupScheduleService.saveSchedule(from, { enabled: true, expired: false });
            const cicloFmt = groupScheduleService.formatCycle(sched);
            return reply(`✅ *Agenda automática ATIVADA no grupo!*\n\n📅 *Dias:* ${groupScheduleService.formatDays(sched.days)}\n🔒 *Fechar:* às ${sched.closeTime}\n🔓 *Abrir:* às ${sched.openTime}\n⏳ *Ciclo:* ${cicloFmt}`);
        }

        if (sub === 'off' || sub === 'desativar' || sub === 'desligar') {
            await groupScheduleService.saveSchedule(from, { enabled: false });
            return reply(`🔴 *Agenda automática DESATIVADA no grupo.* O grupo não fechará nem abrirá sozinho até ser religado.`);
        }

        // 3. CICLO: SEMANA, MES, PERMANENTE, OU DATA ESPECÍFICA
        if (sub === 'ciclo' || sub === 'duracao' || sub === 'validade' || sub === 'periodo') {
            const tipoCiclo = (args[1] || '').toLowerCase().trim();
            const paramData = args.slice(2).join(' ').trim();

            if (!tipoCiclo) {
                return reply(`📅 *CONFIGURAÇÃO DE CICLO DA AGENDA*\n\nEscolha como a agenda deve operar:\n• \`${prefix}agenda ciclo permanente\` — Fica ativa continuamente até que alguém remova manualmente.\n• \`${prefix}agenda ciclo semana\` — Fica ativa pelos próximos 7 dias e depois conclui.\n• \`${prefix}agenda ciclo mes\` — Fica ativa pelos próximos 30 dias.\n• \`${prefix}agenda ciclo ate DD/MM/AAAA\` — Ativa até uma data limite específica.\n\nStatus atual: ${groupScheduleService.formatCycle(sched)}`);
            }

            let cycleKey = 'permanente';
            let expiresAt = null;

            if (tipoCiclo === 'semana' || tipoCiclo === '7dias' || tipoCiclo === '1semana') {
                cycleKey = 'semana';
                expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
            } else if (tipoCiclo === 'mes' || tipoCiclo === 'mês' || tipoCiclo === '30dias' || tipoCiclo === '1mes') {
                cycleKey = 'mes';
                expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
            } else if (tipoCiclo === 'permanente' || tipoCiclo === 'infinito' || tipoCiclo === 'sempre') {
                cycleKey = 'permanente';
                expiresAt = null;
            } else if (tipoCiclo === 'ate' || tipoCiclo === 'até') {
                cycleKey = `ate ${paramData}`;
                expiresAt = groupScheduleService.calculateCycleExpiration(cycleKey);
                if (!expiresAt) {
                    return reply(`❌ Formato de data inválido. Use no padrão DD/MM/AAAA.\nExemplo: \`${prefix}agenda ciclo ate 31/12/2026\``);
                }
            } else {
                return reply(`❌ Opção de ciclo inválida. Use \`semana\`, \`mes\`, \`permanente\` ou \`ate DD/MM/AAAA\`.`);
            }

            await groupScheduleService.saveSchedule(from, {
                cycle: cycleKey,
                startedAt: Date.now(),
                expiresAt,
                enabled: true,
                expired: false
            });

            const updatedSched = groupScheduleService.getSchedule(from);
            return reply(`⏳ *Ciclo de repetição atualizado com sucesso!*\n\n📌 *Novo Ciclo:* ${groupScheduleService.formatCycle(updatedSched)}\nO grupo seguirá a agenda de abertura e fechamento dentro deste período.`);
        }

        // 4. SET: Configura dias, horários e opcionalmente o ciclo
        if (sub === 'set' || sub === 'config' || sub === 'horario') {
            let argDias = args[1];
            let argFechar = args[2];
            let argAbrir = args[3];
            let argCiclo = args[4];

            const normalizarHora = t => {
                if (!t || typeof t !== 'string') return null;
                const m = t.trim().toLowerCase().match(/^(\d{1,2})(?::(\d{2})|h(\d{2})?)$/);
                if (!m) return null;
                const h = parseInt(m[1], 10);
                const min = parseInt(m[2] || m[3] || '0', 10);
                if (h >= 0 && h <= 23 && min >= 0 && min <= 59) {
                    return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
                }
                return null;
            };

            const hora1 = normalizarHora(argDias);
            const hora2 = normalizarHora(argFechar);

            // Se digitou apenas horários: .agenda set 22:00 07:00 ou .agenda set 22h 7h
            if (hora1 && hora2) {
                argCiclo = argAbrir;
                argAbrir = hora2;
                argFechar = hora1;
                argDias = null;
            } else {
                argFechar = normalizarHora(argFechar);
                argAbrir = normalizarHora(argAbrir);
            }

            if (!argFechar || !argAbrir) {
                return reply(F.tela({
                    emoji: '⚠️',
                    titulo: 'Formato de Horário Inválido',
                    intro: 'Informe os horários no padrão HH:MM de 24 horas (ex: 22:00 e 07:00).',
                    secoes: [{
                        emoji: '📋',
                        titulo: 'Exemplos Corretos',
                        linhas: [
                            `• ${F.cmd(prefix, 'agenda', 'set seg-sex 22:00 07:00 permanente')}`,
                            `• ${F.cmd(prefix, 'agenda', 'set seg-sex 22:00 07:00 semana')}`,
                            `• ${F.cmd(prefix, 'agenda', 'set todos 23:00 08:00 mes')}`,
                            `• ${F.cmd(prefix, 'agenda', 'set 22:30 06:30')}`
                        ]
                    }],
                    prefix
                }));
            }

            const diasArray = argDias ? groupScheduleService.parseDays(argDias) : sched.days;
            const cycleKey = argCiclo ? argCiclo.toLowerCase() : (sched.cycle || 'permanente');
            const expiresAt = groupScheduleService.calculateCycleExpiration(cycleKey);

            await groupScheduleService.saveSchedule(from, {
                enabled: true,
                days: diasArray,
                closeTime: argFechar,
                openTime: argAbrir,
                cycle: cycleKey,
                startedAt: Date.now(),
                expiresAt,
                expired: false
            });

            const newSched = groupScheduleService.getSchedule(from);

            return reply(F.tela({
                emoji: '✅',
                titulo: 'Agenda Programada com Sucesso!',
                intro: 'O grupo agora fechará e reabrirá automaticamente nos horários definidos.',
                secoes: [{
                    emoji: '📋',
                    titulo: 'Nova Programação',
                    linhas: [
                        F.campo('Status', '🟢 Ativada'),
                        F.campo('Ciclo', groupScheduleService.formatCycle(newSched)),
                        F.campo('Dias ativos', groupScheduleService.formatDays(diasArray)),
                        F.campo('Horário de fechar', `🔒 ${argFechar}`),
                        F.campo('Horário de abrir', `🔓 ${argAbrir}`)
                    ]
                }],
                proximos: [
                    { nome: 'agenda', args: 'testar', oque: 'ver prévia das mensagens' },
                    { nome: 'agenda', oque: 'ver painel completo' }
                ],
                prefix
            }));
        }

        // 5. REMOVER / LIMPAR AGENDA
        if (sub === 'remover' || sub === 'del' || sub === 'delete' || sub === 'apagar') {
            await groupScheduleService.saveSchedule(from, {
                enabled: false,
                days: [1, 2, 3, 4, 5],
                closeTime: '22:00',
                openTime: '07:00',
                cycle: 'permanente',
                expiresAt: null,
                startedAt: null,
                closeMsg: null,
                openMsg: null,
                expired: false
            });
            return reply(`🗑️ *Agenda automática removida e resetada com sucesso neste grupo.*`);
        }

        // 6. MENSAGEM AO FECHAR
        if (sub === 'msgfechar' || sub === 'msgfecha' || sub === 'msgfechamento' || sub === 'texto_fechar') {
            const customMsg = args.slice(1).join(' ').trim();
            if (!customMsg) {
                return reply(`📜 *Como personalizar a notificação de fechamento:*\n\nUso: \`.agenda msgfechar <sua mensagem>\`\n\nVariáveis suportadas: \`{grupo}\`, \`{hora_fechar}\`, \`{hora_abrir}\`, \`{dia_abrir}\`, \`{dono}\`, \`{adms}\`.\n\nExemplo: \`.agenda msgfechar 🔒 Grupo fechado! Reabrimos amanhã às {hora_abrir}. Boa noite!\``);
            }
            await groupScheduleService.saveSchedule(from, { closeMsg: customMsg });
            return reply(`✅ *Mensagem de fechamento atualizada com sucesso!*\n\nPara conferir como ficou, use: \`${prefix}agenda testar\``);
        }

        // 7. MENSAGEM AO ABRIR
        if (sub === 'msgabrir' || sub === 'msgabre' || sub === 'msgabertura' || sub === 'texto_abrir') {
            const customMsg = args.slice(1).join(' ').trim();
            if (!customMsg) {
                return reply(`📜 *Como personalizar a notificação de reabertura:*\n\nUso: \`.agenda msgabrir <sua mensagem>\`\n\nVariáveis suportadas: \`{grupo}\`, \`{hora_fechar}\`, \`{hora_abrir}\`, \`{dono}\`, \`{adms}\`.\n\nExemplo: \`.agenda msgabrir 🔓 Bom dia grupo {grupo}! Estamos abertos novamente para o dia!\``);
            }
            await groupScheduleService.saveSchedule(from, { openMsg: customMsg });
            return reply(`✅ *Mensagem de reabertura atualizada com sucesso!*\n\nPara conferir como ficou, use: \`${prefix}agenda testar\``);
        }

        // 7.1 ATALHO UNIFICADO .agenda msg <fechar|abrir> <texto>
        if (sub === 'msg' || sub === 'mensagem') {
            const alvo = (args[1] || '').toLowerCase().trim();
            const textoResto = args.slice(2).join(' ').trim();
            if (alvo === 'fechar' || alvo === 'fechamento' || alvo === 'close') {
                if (!textoResto) {
                    return reply(`📜 *Personalizar Mensagem da Agenda ao Fechar:*\n\nUso: \`${prefix}agenda msg fechar <sua mensagem>\`\nVariáveis: \`{grupo}\`, \`{hora_fechar}\`, \`{hora_abrir}\`, \`{dia_abrir}\`, \`{dono}\`, \`{adms}\`.`);
                }
                await groupScheduleService.saveSchedule(from, { closeMsg: textoResto });
                return reply(`✅ *Mensagem de fechamento atualizada com sucesso!*\n\nPara conferir: \`${prefix}agenda testar\``);
            }
            if (alvo === 'abrir' || alvo === 'abertura' || alvo === 'open') {
                if (!textoResto) {
                    return reply(`📜 *Personalizar Mensagem da Agenda ao Abrir:*\n\nUso: \`${prefix}agenda msg abrir <sua mensagem>\`\nVariáveis: \`{grupo}\`, \`{hora_fechar}\`, \`{hora_abrir}\`, \`{dono}\`, \`{adms}\`.`);
                }
                await groupScheduleService.saveSchedule(from, { openMsg: textoResto });
                return reply(`✅ *Mensagem de reabertura atualizada com sucesso!*\n\nPara conferir: \`${prefix}agenda testar\``);
            }
            return reply(`📜 *Como configurar mensagens da agenda:*\n\n• \`${prefix}agenda msgfechar <texto>\` — mensagem ao trancar\n• \`${prefix}agenda msgabrir <texto>\` — mensagem ao reabrir\n• \`${prefix}agenda testar\` — prévia das mensagens\n• \`${prefix}agenda reset\` — restaurar mensagens para o padrão`);
        }

        // 8. RESETAR PARA PADRÃO
        if (sub === 'reset' || sub === 'padrao') {
            await groupScheduleService.saveSchedule(from, { closeMsg: null, openMsg: null });
            return reply(`✅ *Mensagens de fechamento e reabertura restauradas para o modelo padrão oficial!*`);
        }

        // 9. TESTAR / PREVIEW
        if (sub === 'testar' || sub === 'teste' || sub === 'preview') {
            const gVars = await getGreetingVars(client, from, sender);
            const closeTpl = sched.closeMsg || groupScheduleService.DEFAULT_CLOSE_MESSAGE;
            const openTpl = sched.openMsg || groupScheduleService.DEFAULT_OPEN_MESSAGE;

            const closePreview = groupScheduleService.formatScheduleMessage(closeTpl, {
                groupName: gVars.groupName,
                horaFechar: sched.closeTime,
                horaAbrir: sched.openTime,
                diaAbrir: 'às ' + sched.openTime,
                donoTag: gVars.donoTag,
                admsTags: gVars.admsTags
            });

            const openPreview = groupScheduleService.formatScheduleMessage(openTpl, {
                groupName: gVars.groupName,
                horaFechar: sched.closeTime,
                horaAbrir: sched.openTime,
                donoTag: gVars.donoTag,
                admsTags: gVars.admsTags
            });

            let doc = `╭━〔 🧪 PRÉVIA DAS NOTIFICAÇÕES 〕━⬣\n\n`;
            doc += `━━━━━ [ 🔒 AO FECHAR (${sched.closeTime}) ] ━━━━━\n\n`;
            doc += closePreview + '\n\n';
            doc += `━━━━━ [ 🔓 AO ABRIR (${sched.openTime}) ] ━━━━━\n\n`;
            doc += openPreview + '\n\n';
            doc += `╰━━━━━━━━━━━━━━━━━━━━━━━⬣\n`;
            doc += `💡 _Para alterar use:_ \`${prefix}agenda msgfechar <texto>\` ou \`${prefix}agenda msgabrir <texto>\``;

            const mentions = resolveMentionsForText(doc, gVars);
            return reply(doc.trim(), mentions);
        }

        return reply(`❌ Subcomando não reconhecido. Use \`${prefix}agenda\` para ver o painel.`);
    }
};
