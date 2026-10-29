const { nomeDoMembro } = require('../../utils/nomeMembro');
const logger = require('../../core/logger');
const F = require('../../utils/formato');
const groupAuthService = require('../../services/groupAuthService');
const groupControlService = require('../../services/groupControlService');

module.exports = {
    name: 'fechargrupo',
    aliases: ["fechar","fechamento","fecharg","fechagrupo","trancar","closegroup","trancargrupo","cmd_fechargrupo","alt_fechargrupo","atalho_fechargrupo","abrev_fechargrupo","call_fechargrupo","func_fechargrupo"],
    category: 'admin',
    description: 'Fecha o grupo para só a administração falar, por um tempo, até um horário ou até reabrir',
    usage: '[tempo ou horário]',
    examples: [
        ' — fecha até alguém reabrir manualmente',
        '30m — fecha por 30 minutos e reabre sozinho',
        '2h — fecha por 2 horas e reabre sozinho',
        '20:44 — fecha agora e reabre às 20:44',
        '22:00 — fecha agora e reabre às 22h'
    ],
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    execute: async ({ from, args, client, reply, prefix = '.', sender, info, commandName }) => {
        try {
            const fullInput = (Array.isArray(args) ? args.join(' ') : String(args || '')).trim();
            const firstWord = (args[0] || '').toLowerCase().trim();

            // Se o admin usou comandos de configuração da mensagem (.fechar msg, .fechar -config, etc)
            const configKeywords = ['msg', 'mensagem', 'set', 'texto', '-config', 'config', 'preview', 'teste', 'reset', 'padrao', 'on', 'off'];
            if (firstWord && configKeywords.includes(firstWord)) {
                const msgFechamentoCmd = require('./msgfechamento');
                return await msgFechamentoCmd.execute({ from, args, client, reply, prefix, sender, info, commandName });
            }

            const groupData = await groupAuthService.getGroupData(from, { refresh: true });
            if (!groupData.isBotAdmin) {
                return reply(F.tela({
                    emoji: '🛡️', titulo: 'Preciso ser administrador', prefix,
                    intro: 'Só consigo fechar o grupo se eu tiver cargo de administrador aqui.',
                    dica: 'Nas informações do grupo, toque no meu número e escolha "Promover a admin". Depois é só repetir o comando.',
                    proximos: [{ nome: 'fechargrupo', oque: 'tenta de novo depois de me promover' }]
                }));
            }

            if (fullInput) {
                const targetTs = groupControlService.parseDurationOrTime(fullInput);
                if (!targetTs) {
                    return reply(
                        `╔══════════════════════════════════════╗\n` +
                        `║  🔒  CONTROLE & FECHAMENTO DE GRUPO  ║\n` +
                        `╚══════════════════════════════════════╝\n` +
                        `       GOAT SKYCODE PROTOCOL\n\n` +
                        `⏱️ *Tempo ou horário não reconhecido:* "${fullInput}"\n\n` +
                        `📋 *Exemplos de minutos, horas e horários aceitos:*\n` +
                        `• \`${prefix}fechar 10 minutos\` — fecha e reabre em 10 minutos\n` +
                        `• \`${prefix}fechar 30m\` ou \`${prefix}fechar 30\` — 30 minutos\n` +
                        `• \`${prefix}fechar 1 hora e 30 minutos\` ou \`${prefix}fechar 1h30m\`\n` +
                        `• \`${prefix}fechar 22:00\` ou \`${prefix}fechar 22h\` — fecha até o horário\n` +
                        `• \`${prefix}fechar\` — fecha imediatamente agora`
                    );
                }

                // Agenda o fechamento para o tempo à frente
                const res = groupControlService.scheduleCloseGroup(from, fullInput);
                const targetFmt = F.dataHora(res.triggerAt, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

                return reply(
                    `╔══════════════════════════════════════╗\n` +
                    `║  ⏳  FECHAMENTO AGENDADO COM SUCESSO ║\n` +
                    `╚══════════════════════════════════════╝\n` +
                    `       GOAT SKYCODE PROTOCOL\n\n` +
                    `🔒 *O grupo fechará automaticamente no tempo programado:*\n\n` +
                    `• 📅 *Data e Horário:* ${targetFmt}\n` +
                    `• ⏱️ *Parâmetro Definido:* "${fullInput}"\n` +
                    `• 💾 *Persistência:* Salvo no SQLite WAL (sobrevive a reinícios da VPS)\n\n` +
                    `💡 _Para cancelar a qualquer momento, digite:_ \`${prefix}abrir\``
                );
            }

            // Fechamento imediato
            await groupControlService.closeGroup(client, from);

            const configRepo = require('../../database/repositories/configRepository');
            const groupConfig = configRepo.getConfig(from) || {};

            // Modo Divulgação: notificação com link e envio no PV dos ADMs/Dono
            if (groupConfig.divulgacaoMode?.enabled) {
                const { getGreetingVars, resolveMentionsForText } = require('../../services/groupGreetingService');
                const vars = await getGreetingVars(client, from, sender, { adminJid: sender, tempo: "Imediato" });

                const customCloseTemplate = groupConfig.divulgacaoMode.closeMessage ||
                    `📢 *GRUPO FECHADO PARA DIVULGAÇÃO & PARCERIAS!*\n\n` +
                    `🔒 O grupo está temporariamente fechado para organização e comunicados oficiais.\n` +
                    (groupConfig.divulgacaoMode.link ? `🔗 *Link Oficial de Divulgação:* ${groupConfig.divulgacaoMode.link}\n` : '') +
                    `\n📌 Aproveite para divulgar nos canais permitidos e acompanhar nossas novidades!\n` +
                    `👑 Dono: {dono}\n🛡️ Admins: {adms}`;

                let closeText = customCloseTemplate
                    .replace(/\{link\}/gi, groupConfig.divulgacaoMode.link || '')
                    .replace(/\{grupo\}/gi, vars.groupName || 'Grupo')
                    .replace(/\{dono\}/gi, vars.donoTag || '')
                    .replace(/\{adms\}/gi, vars.admsTag || '')
                    .replace(/\{admin\}/gi, vars.adminTag || '')
                    .replace(/\{hora\}/gi, vars.hora || '')
                    .replace(/\{data\}/gi, vars.data || '');

                const mentions = resolveMentionsForText(closeText, vars);
                await reply(closeText, mentions);

                // Envia comprovante/alerta no PV dos administradores e no Dono do Bot
                if (groupConfig.divulgacaoMode.notifyPv !== false && client?.sendMessage) {
                    try {
                        const alertPv = `📢 *[ALERTA: GRUPO FECHADO PARA DIVULGAÇÃO]*\n\n` +
                            `👥 *Grupo:* ${vars.groupName}\n` +
                            `👤 *Fechado por:* ${nomeDoMembro(sender)}\n` +
                            `⏰ *Horário:* ${vars.hora || new Date().toLocaleTimeString('pt-BR')}\n` +
                            (groupConfig.divulgacaoMode.link ? `🔗 *Link:* ${groupConfig.divulgacaoMode.link}\n` : '') +
                            `\n✅ Travas e filtros de segurança 100% ativos no grupo.`;

                        const groupAdmins = await groupAuthService.getGroupAdmins(from);
                        for (const admJid of groupAdmins) {
                            if (admJid !== sender) {
                                client.sendMessage(admJid, { text: alertPv, mentions: [sender] }).catch(() => {});
                            }
                        }

                        const botOwnerNum = process.env.OWNER_NUMBER?.replace(/\D/g, '');
                        if (botOwnerNum) {
                            const botOwnerJid = `${botOwnerNum}@s.whatsapp.net`;
                            if (!groupAdmins.includes(botOwnerJid)) {
                                client.sendMessage(botOwnerJid, { text: alertPv, mentions: [sender] }).catch(() => {});
                            }
                        }
                    } catch (ePv) {
                        logger.warn(`[DIVULGACAO PV] Falha ao enviar no PV: ${ePv.message}`);
                    }
                }
                return;
            }

            if (groupConfig.fechamentoMsg || groupConfig.closeMessage) {
                const { getGreetingVars, buildCloseMessage, resolveMentionsForText } = require('../../services/groupGreetingService');
                const vars = await getGreetingVars(client, from, sender, { adminJid: sender, tempo: "Imediato" });
                const customClose = buildCloseMessage(groupConfig, vars);
                const mentions = resolveMentionsForText(customClose, vars);
                return reply(customClose, mentions);
            }

            return reply(F.tela({
                emoji: '🔒', titulo: 'Grupo fechado', prefix,
                intro: 'Só a administração pode mandar mensagens a partir de agora.',
                dica: 'Para agendar o fechamento para frente, informe o tempo: ' + F.cmd(prefix, 'fechar', '2m') + ' ou ' + F.cmd(prefix, 'fechar', '22:00'),
                proximos: [
                    { nome: 'abrirgrupo', oque: 'reabre o grupo' },
                    { nome: 'abrirgrupo', args: '2m', oque: 'agenda abertura para daqui a 2m' }
                ]
            }));
        } catch (err) {
            logger.error('[FECHARGRUPO ERROR]', err);
            return reply(F.tela({
                emoji: '❌', titulo: 'Não consegui fechar o grupo', prefix,
                intro: 'O WhatsApp não respondeu agora. Tente de novo em instantes.',
                dica: 'Se continuar falhando, confira se eu ainda sou administrador deste grupo.',
                proximos: [{ nome: 'fechargrupo', oque: 'tenta de novo' }]
            }));
        }
    }
};
