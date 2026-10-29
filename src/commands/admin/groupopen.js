const logger = require('../../core/logger')
const F = require('../../utils/formato')
const groupAuthService = require('../../services/groupAuthService')
const groupControlService = require('../../services/groupControlService')

module.exports = {
    name: 'abrirgrupo',
    aliases: ["abrir","abertura","abrirg","abregrupo","destrancar","opengroup","destrancargrupo","cmd_abrirgrupo","alt_abrirgrupo","atalho_abrirgrupo","abrev_abrirgrupo","call_abrirgrupo","func_abrirgrupo"],
    category: 'admin',
    description: 'Reabre o grupo ou agenda a abertura no tempo à frente (ex: 2m, 2h, 08:00)',
    usage: '[tempo ou horário]',
    examples: [
        ' — reabre o grupo imediatamente e cancela agendamentos',
        '2m — agenda abertura para daqui a 2 minutos',
        '30m — agenda abertura para daqui a 30 minutos',
        '2h — agenda abertura para daqui a 2 horas',
        '08:00 — agenda abertura para as 08:00 da manhã'
    ],
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    execute: async ({ from, args, client, reply, prefix = '.', sender, info, commandName }) => {
        try {
            const fullInput = (Array.isArray(args) ? args.join(' ') : String(args || '')).trim();
            const firstWord = (args[0] || '').toLowerCase().trim();

            // Se o admin usou comandos de configuração da mensagem (.abrir msg, .abrir -config, etc)
            const configKeywords = ['msg', 'mensagem', 'set', 'texto', '-config', 'config', 'preview', 'teste', 'reset', 'padrao', 'on', 'off'];
            if (firstWord && configKeywords.includes(firstWord)) {
                const msgAberturaCmd = require('./msgabertura');
                return await msgAberturaCmd.execute({ from, args, client, reply, prefix, sender, info, commandName });
            }

            const groupData = await groupAuthService.getGroupData(from, { refresh: true })
            if (!groupData.isBotAdmin) {
                return reply(F.tela({
                    emoji: '🛡️', titulo: 'Preciso ser administrador', prefix,
                    intro: 'Só consigo reabrir o grupo se eu tiver cargo de administrador aqui.',
                    dica: 'Nas informações do grupo, toque no meu número e escolha "Promover a admin". Depois é só repetir o comando.',
                    proximos: [{ nome: 'abrirgrupo', oque: 'tenta de novo depois de me promover' }]
                }))
            }

            if (fullInput) {
                const targetTs = groupControlService.parseDurationOrTime(fullInput);
                if (!targetTs) {
                    return reply(
                        `╔══════════════════════════════════════╗\n` +
                        `║  🔓  CONTROLE & REABERTURA DE GRUPO  ║\n` +
                        `╚══════════════════════════════════════╝\n` +
                        `       ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ SKYCODE PROTOCOL\n\n` +
                        `⏱️ *Tempo ou horário não reconhecido:* "${fullInput}"\n\n` +
                        `📋 *Exemplos de minutos, horas e horários aceitos:*\n` +
                        `• \`${prefix}abrir 10 minutos\` — abre automaticamente em 10 minutos\n` +
                        `• \`${prefix}abrir 30m\` ou \`${prefix}abrir 30\` — 30 minutos\n` +
                        `• \`${prefix}abrir 2 horas\` ou \`${prefix}abrir 2h\`\n` +
                        `• \`${prefix}abrir 08:00\` ou \`${prefix}abrir 08h\` — abre no horário\n` +
                        `• \`${prefix}abrir\` — abre imediatamente agora`
                    );
                }

                // Agenda a abertura para o tempo à frente
                const res = groupControlService.scheduleOpenGroup(from, fullInput);
                const targetFmt = F.dataHora(res.triggerAt, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

                return reply(
                    `╔══════════════════════════════════════╗\n` +
                    `║  ⏳  ABERTURA AGENDADA COM SUCESSO   ║\n` +
                    `╚══════════════════════════════════════╝\n` +
                    `       ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ SKYCODE PROTOCOL\n\n` +
                    `🔓 *O grupo reabrirá automaticamente no tempo programado:*\n\n` +
                    `• 📅 *Data e Horário:* ${targetFmt}\n` +
                    `• ⏱️ *Parâmetro Definido:* "${fullInput}"\n` +
                    `• 💾 *Persistência:* Salvo no SQLite WAL (sobrevive a reinícios da VPS)\n\n` +
                    `💡 _Para abrir agora imediatamente, digite:_ \`${prefix}abrir\``
                );
            }

            await groupControlService.openGroup(client, from)
            logger.info(`[ABRIRGRUPO] Grupo ${from} reaberto imediatamente por admin`)

            const configRepo = require('../../database/repositories/configRepository');
            const groupConfig = configRepo.getConfig(from) || {};
            if (groupConfig.aberturaMsg || groupConfig.openMessage) {
                const { getGreetingVars, buildOpenMessage, resolveMentionsForText } = require('../../services/groupGreetingService');
                const vars = await getGreetingVars(client, from, sender, { adminJid: sender, tempo: "Imediato" });
                const customOpen = buildOpenMessage(groupConfig, vars);
                const mentions = resolveMentionsForText(customOpen, vars);
                return reply(customOpen, mentions);
            }

            return reply(F.tela({
                emoji: '🔓', titulo: 'Grupo reaberto',
                intro: 'Todos os membros podem mandar mensagens de novo. Qualquer agendamento pendente foi cancelado.',
                prefix,
                proximos: [
                    { nome: 'msgabertura', oque: 'configura a mensagem de abertura do grupo' },
                    { nome: 'fechargrupo', args: '2m', oque: 'agenda fechamento para daqui a 2 minutos' }
                ]
            }))
        } catch (err) {
            logger.error('[ABRIRGRUPO ERROR]', err)
            return reply(F.tela({
                emoji: '❌', titulo: 'Não consegui reabrir o grupo', prefix,
                intro: 'O WhatsApp não respondeu agora. Tente de novo em instantes.',
                dica: 'Se continuar falhando, confira se eu ainda sou administrador deste grupo.',
                proximos: [{ nome: 'abrirgrupo', oque: 'tenta de novo' }]
            }))
        }
    }
}
