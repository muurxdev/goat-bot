const logger = require('../../core/logger')
/**
 * Comando .meualuguel / .statusaluguel / .locatario
 * Exibe o status do aluguel, tempo restante, locatário responsável e poderes de gestão
 */

const rentalService = require('../../services/rentalService');
const { ROLES, resolveUserRole } = require('../../services/permissionService');
const { getBotName } = require('../../config/botConfig');
const M = require('../../utils/moldura');
const F = require('../../utils/formato');

module.exports = {
    name: 'meualuguel',
    aliases: ['statusaluguel', 'tempoaluguel', 'locatario', 'locatarios', 'minhalocacao', 'aluguelstatus'],
    category: 'owner',
    subcategory: 'Aluguel & Planos',
    description: 'Consulta o status, tempo restante e comandos liberados para o Dono de Aluguel',
    usage: '[set @usuario]',
    cooldownMs: 2000,
    execute: async ({ reply, client, from, info, isGroup, sender, isAdmin, isOwner, userRole, args = [], prefix = '.' }) => {
        const botName = getBotName();
        const role = userRole || resolveUserRole(sender, isAdmin, isOwner, { from, isGroup });
        const sub = (args[0] || '').toLowerCase().trim();

        // 1. Subcomando: .locatario set @usuario (Dono do Bot ou Locatário Atual transferindo)
        if (sub === 'set' || sub === 'definir' || sub === 'transferir') {
            if (!isGroup) {
                return reply('👥 A definição de locatário só pode ser feita dentro de grupos.');
            }

            const isAllowedToSet = role.level >= ROLES.BOT_ADMIN || role.level === ROLES.RENTAL_OWNER || role.isRentalOwner;
            if (!isAllowedToSet) {
                return reply('🔒 Apenas os Donos do Bot ou o atual Locatário titular podem transferir ou definir o locatário.');
            }

            let targetJid = null;
            if (info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
                targetJid = info.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (info?.message?.extendedTextMessage?.contextInfo?.participant) {
                targetJid = info.message.extendedTextMessage.contextInfo.participant;
            } else if (args[1]) {
                const digits = args[1].replace(/\D/g, '');
                if (digits.length >= 8) targetJid = `${digits}@s.whatsapp.net`;
            }

            if (!targetJid) {
                return reply(`⚠️ Marque o novo locatário ou mencione o número: \`${prefix}locatario set @usuario\``);
            }

            rentalService.setRentalOwner(from, targetJid, sender);
            const cleanNew = targetJid.split('@')[0].split(':')[0];
            let resp = `╔══════════════════════════════╗\n`;
            resp += `║   💼 *NOVO LOCATÁRIO DEFINIDO* 💼   ║\n`;
            resp += `╚══════════════════════════════╝\n\n`;
            resp += `👤 *Novo Dono de Aluguel:* @${cleanNew}\n`;
            resp += `🏢 *Grupo:* ${from}\n`;
            resp += `✍️ *Definido por:* @${sender.split('@')[0].split(':')[0]}\n\n`;
            resp += `✅ O novo locatário agora possui poderes plenos de configuração do bot neste grupo enquanto o aluguel estiver ativo!`;

            return reply(resp.trim(), [targetJid, sender]);
        }

        // 2. Visão de Grupo
        if (isGroup) {
            const isRentalActive = rentalService.isRentalModeEnabled(from, true);
            const rentalInfo = rentalService.getRentalInfo(from);
            const ownerData = rentalService.getRentalOwner(from);
            let groupName = 'Grupo de WhatsApp';

            try {
                if (client?.groupMetadata) {
                    const m = await client.groupMetadata(from);
                    if (m?.subject) groupName = m.subject;
                }
            } catch (err) { logger.warn('[MEUALUGUEL] falha ignorada: ' + (err && err.message)) }

            const active = rentalInfo && !rentalInfo.isExpired;
            const locatarioJid = ownerData?.ownerJid || rentalInfo?.renterJid || null;
            const cleanLocatario = locatarioJid ? `@${locatarioJid.split('@')[0].split(':')[0]}` : '_Não vinculado_';

            let doc = `${M.cabecalho('💼', `Status da Locação — ${botName}`)}\n\n`;
            doc += `╭━〔 🏢 DADOS DO GRUPO 〕━⬣\n`;
            doc += `┃ 🏷️ *Grupo:* ${groupName}\n`;
            doc += `┃ 👤 *Locatário Titular:* ${cleanLocatario}\n`;
            doc += `┃ ⚙️ *Modo Aluguel:* ${isRentalActive ? '🟢 Ativo' : '⚪ Desligado'}\n`;

            if (active) {
                const total = Math.max(1, (rentalInfo.expiresAt || 0) - (rentalInfo.startsAt || 0));
                const ratio = rentalInfo.isLifetime ? 1 : Math.min(1, Math.max(0, (rentalInfo.remainingMs || 0) / total));

                doc += `┃ 📊 *Situação:* ${rentalInfo.isLifetime ? '♾️ Vitalício (Não vence)' : (rentalInfo.isTrial ? '⚡ Teste Gratuito' : '🟢 Plano Ativo')}\n`;
                doc += `┃ ⏳ *Tempo Restante:* ${rentalInfo.remainingText}\n`;
                doc += `┃ 📈 *Progresso:* ${F.barra(ratio)}\n`;
                doc += `┃ 📅 *Início:* ${rentalInfo.startsAtFormatted}\n`;
                doc += `┃ 🏁 *Vencimento:* ${rentalInfo.expiresAtFormatted}\n`;
            } else if (rentalInfo && rentalInfo.isExpired) {
                doc += `┃ 📊 *Situação:* 🔴 Vencido em ${rentalInfo.expiresAtFormatted}\n`;
                doc += `┃ ⏳ *Tempo Restante:* Expirado\n`;
            } else {
                doc += `┃ 📊 *Situação:* ⚪ Sem aluguel registrado\n`;
            }
            doc += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⬣\n\n`;

            // Seção de Poderes de Gestão
            doc += `${M.abreSecao('⚡', 'Poderes de Gestão do Locatário')}\n`;
            doc += `┃ • \`${prefix}cmd on/off <comando>\` — Liga/desliga comandos individuais\n`;
            doc += `┃ • \`${prefix}modulo on/off <modulo>\` — Ativa módulos inteiros (rpg, cassino, etc)\n`;
            doc += `┃ • \`${prefix}categoria on/off <cat>\` — Ativa/desativa categorias completas\n`;
            doc += `┃ • \`${prefix}config\` — Painel de mensagens e configurações gerais\n`;
            doc += `┃ • \`${prefix}bemvindo\` / \`${prefix}adeus\` — Personaliza entradas e saídas\n`;
            doc += `┃ • \`${prefix}abertura\` / \`${prefix}fechamento\` — Horários automáticos do grupo\n`;
            doc += `┃ • \`${prefix}locatario set @user\` — Transfere a posse do aluguel\n`;
            doc += `${M.FECHA}\n\n`;

            doc += `🧭 *Ações Rápidas:*\n`;
            doc += `• \`${prefix}aluguel planos\` — Ver pacotes para contratar ou estender\n`;
            if (!active && !rentalService.hasUsedTrial ? true : false) {
                doc += `• \`${prefix}aluguel teste\` — Ativar 2 horas de teste gratuito\n`;
            }
            doc += `• \`${prefix}hierarquia\` — Ver todos os níveis do sistema\n`;
            doc += `• \`${prefix}dono\` — Falar diretamente com os donos`;

            const mentions = [sender];
            if (locatarioJid && locatarioJid.includes('@')) mentions.push(locatarioJid);

            if (process.env.NODE_ENV === 'test' || !client) {
                return reply(doc.trim(), mentions);
            }

            const { sendMenuMediaMessage } = require('../../utils/wallpapers');
            return await sendMenuMediaMessage(client, from, {
                category: 'aluguel',
                text: doc.trim(),
                quoted: info,
                mentions,
                page: 1
            });
        }

        // 3. Visão no Privado (PV)
        const pvRental = rentalService.getRentalInfo(sender);
        const isPvModeActive = rentalService.isRentalModeEnabled(sender, false);
        const pvActive = pvRental && !pvRental.isExpired;

        let docPv = `${M.cabecalho('👤', `Seu Acesso no Privado — ${botName}`)}\n\n`;
        docPv += `╭━〔 📋 SITUAÇÃO DO PRIVADO 〕━⬣\n`;
        docPv += `┃ 📱 *Seu Contato:* @${sender.split('@')[0].split(':')[0]}\n`;
        docPv += `┃ ⚙️ *Modo Aluguel no PV:* ${isPvModeActive ? '🟢 Ativo' : '⚪ Livre'}\n`;

        if (pvActive) {
            docPv += `┃ 📊 *Situação:* ${pvRental.isLifetime ? '♾️ Vitalício' : '🟢 Plano Ativo'}\n`;
            docPv += `┃ ⏳ *Tempo Restante:* ${pvRental.remainingText}\n`;
            docPv += `┃ 📅 *Início:* ${pvRental.startsAtFormatted}\n`;
            docPv += `┃ 🏁 *Vencimento:* ${pvRental.expiresAtFormatted}\n`;
        } else {
            docPv += `┃ 📊 *Situação:* 🔴 Nenhum plano de privado ativo\n`;
        }
        docPv += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⬣\n\n`;

        docPv += `🧭 *Para Liberar ou Renovar:*\n`;
        docPv += `• \`${prefix}aluguel planos\` — Ver opções de Privado e Combo (Grupo + PV)\n`;
        docPv += `• \`${prefix}aluguel teste\` — Experimentar 2 horas grátis\n`;
        docPv += `• \`${prefix}hierarquia\` — Entender os cargos do sistema`;

        if (process.env.NODE_ENV === 'test' || !client) {
            return reply(docPv.trim(), [sender]);
        }

        const { sendMenuMediaMessage } = require('../../utils/wallpapers');
        return await sendMenuMediaMessage(client, from, {
            category: 'aluguel',
            text: docPv.trim(),
            quoted: info,
            mentions: [sender],
            page: 1
        });
    }
};
