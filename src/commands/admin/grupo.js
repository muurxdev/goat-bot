/**
 * Comando Mestre .grupo / .gp
 * Painel completo de controle, abertura, fechamento e configurações do grupo
 */

const { getBotName } = require('../../config/botConfig');
const { downloadWhatsAppMedia } = require('../../services/mediaService');
const logger = require('../../core/logger');

module.exports = {
    name: 'grupo',
    aliases: ["gp","grupocontrol","configurar-grupo","painelgrupo","cmd_grupo","alt_grupo","atalho_grupo","abrev_grupo","call_grupo","func_grupo"],
    category: 'admin',
    description: 'Painel completo de controle, abertura, fechamento e configurações do grupo',
    usage: '[abrir|fechar|travarinfo|destravarinfo|nome|desc|foto|info]',
    examples: [' — mostra o painel do grupo', 'fechar — só a administração fala', 'nome Grupo dos Amigos — muda o nome'],
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    cooldownMs: 2000,
    execute: async ({ client, from, args = [], reply, sender, info, type, prefix = '.' }) => {
        const botName = getBotName();
        const action = (args[0] || '').toLowerCase().trim();
        const param = args.slice(1).join(' ').trim();
        const senderNum = sender.split('@')[0].split(':')[0];

        // 1. Abrir Grupo (Todos podem falar)
        if (['abrir', 'open', 'liberar', 'desmutar'].includes(action)) {
            try {
                const groupControlService = require('../../services/groupControlService');
                await groupControlService.openGroup(client, from);
                let doc = `╔══════════════════════════════╗\n`;
                doc += `║   🔓 *GRUPO ABERTO PARA TODOS* 🔓   ║\n`;
                doc += `╚══════════════════════════════╝\n\n`;
                doc += `✨ Todos os participantes agora podem enviar mensagens livremente.\n\n`;
                doc += `👤 *Autorizado por:* @${senderNum}\n`;
                doc += `👑 *${botName}*`;
                return reply(doc.trim(), [sender]);
            } catch (err) {
                logger.warn(`[GRUPO abrir] Falha em ${from}: ${err.message}`);
                return reply('❌ Não consegui abrir o grupo. Tente de novo em instantes; se continuar, confira se eu ainda sou administrador do grupo.');
            }
        }

        // 2. Fechar Grupo (Apenas Admins podem falar)
        if (['fechar', 'close', 'travar', 'mutar'].includes(action)) {
            try {
                const groupControlService = require('../../services/groupControlService');
                const res = await groupControlService.closeGroup(client, from, { input: param || null });
                let doc = `╔══════════════════════════════╗\n`;
                doc += `║   🔒 *GRUPO FECHADO (MUDO)* 🔒   ║\n`;
                doc += `╚══════════════════════════════╝\n\n`;
                doc += `🤐 Apenas os administradores podem enviar mensagens no grupo agora.\n\n`;
                if (res.until) {
                    const F = require('../../utils/formato');
                    doc += `⏱️ *Reabertura automática em:* ${F.dataHora(res.until)}\n\n`;
                }
                doc += `👤 *Fechado por:* @${senderNum}\n`;
                doc += `👑 *${botName}*`;
                return reply(doc.trim(), [sender]);
            } catch (err) {
                logger.warn(`[GRUPO fechar] Falha em ${from}: ${err.message}`);
                return reply('❌ Não consegui fechar o grupo. Tente de novo em instantes; se continuar, confira se eu ainda sou administrador do grupo.');
            }
        }

        // 3. Travar Edição de Dados (Apenas Admins editam nome, foto e bio)
        if (['travarinfo', 'lockinfo', 'proteger'].includes(action) || (action === 'info' && param === 'fechar')) {
            try {
                await client.groupSettingUpdate(from, 'locked');
                return reply(`🔒 *DADOS DO GRUPO BLINDADOS:*\nApenas administradores podem alterar o nome, foto e descrição do grupo.`);
            } catch (err) {
                logger.warn(`[GRUPO travarinfo] Falha em ${from}: ${err.message}`);
                return reply('❌ Não consegui travar os dados do grupo. Tente de novo em instantes; se continuar, confira se eu ainda sou administrador do grupo.');
            }
        }

        // 4. Destravar Edição de Dados (Todos editam dados)
        if (['destravarinfo', 'unlockinfo', 'liberarinfo'].includes(action) || (action === 'info' && param === 'abrir')) {
            try {
                await client.groupSettingUpdate(from, 'unlocked');
                return reply(`🔓 *DADOS DO GRUPO LIBERADOS:*\nTodos os membros agora podem alterar o nome, foto e descrição do grupo.`);
            } catch (err) {
                logger.warn(`[GRUPO destravarinfo] Falha em ${from}: ${err.message}`);
                return reply('❌ Não consegui liberar os dados do grupo. Tente de novo em instantes; se continuar, confira se eu ainda sou administrador do grupo.');
            }
        }

        // 5. Alterar Nome / Título do Grupo
        if (['nome', 'subject', 'titulo'].includes(action)) {
            if (!param) return reply(`❌ *Informe o novo nome do grupo!* Exemplo: \`${prefix}grupo nome Novos Amigos\``);
            if (param.length > 100) return reply(`❌ O nome excede o limite de 100 caracteres do WhatsApp.`);
            try {
                await client.groupUpdateSubject(from, param);
                return reply(`✏️ *Nome do grupo alterado com sucesso para:* *${param}*`);
            } catch (err) {
                logger.warn(`[GRUPO nome] Falha em ${from}: ${err.message}`);
                return reply('❌ Não consegui mudar o nome do grupo. Tente de novo em instantes; se continuar, confira se eu ainda sou administrador do grupo.');
            }
        }

        // 6. Alterar Descrição / Bio do Grupo
        if (['desc', 'bio', 'descricao', 'regras'].includes(action)) {
            const contextInfo = info?.message?.extendedTextMessage?.contextInfo;
            const quotedText = contextInfo?.quotedMessage?.conversation || contextInfo?.quotedMessage?.extendedTextMessage?.text;
            const newDesc = param || quotedText || '';

            if (!newDesc) return reply(`❌ *Informe a nova descrição ou responda a uma mensagem com:* \`${prefix}grupo desc\``);
            try {
                await client.groupUpdateDescription(from, newDesc);
                return reply(`📝 *Descrição do grupo atualizada com sucesso!*`);
            } catch (err) {
                logger.warn(`[GRUPO desc] Falha em ${from}: ${err.message}`);
                return reply('❌ Não consegui mudar a descrição do grupo. Tente de novo em instantes; se continuar, confira se eu ainda sou administrador do grupo.');
            }
        }

        // 7. Alterar Foto / Ícone do Grupo (respondendo a imagem)
        if (['foto', 'pic', 'icone', 'pfp', 'pp'].includes(action)) {
            const contextInfo = info?.message?.extendedTextMessage?.contextInfo;
            const quoted = contextInfo?.quotedMessage;
            const isDirectImage = type === 'imageMessage';
            const isQuotedImage = Boolean(quoted?.imageMessage);

            if (!isDirectImage && !isQuotedImage) {
                return reply(`❌ *Envie ou responda a uma foto com:* \`${prefix}grupo foto\``);
            }

            try {
                await reply('⏳ *Atualizando foto do grupo...*');
                const targetWrapper = isDirectImage ? info : {
                    key: { remoteJid: from, id: contextInfo?.stanzaId, participant: contextInfo?.participant },
                    message: quoted
                };
                const imageBuffer = await downloadWhatsAppMedia(targetWrapper, 'image', client);
                if (!imageBuffer || imageBuffer.length === 0) return reply('❌ Falha ao baixar imagem.');

                await client.updateProfilePicture(from, imageBuffer);
                return reply(`🖼️ *Foto de perfil do grupo atualizada com sucesso!*`);
            } catch (err) {
                logger.warn(`[GRUPO foto] Falha em ${from}: ${err.message}`);
                return reply('❌ Não consegui trocar a foto do grupo. Confira se respondeu a uma imagem e tente de novo em instantes.');
            }
        }

        // 8. Informações Gerais do Grupo
        if (['info', 'status', 'dados'].includes(action)) {
            try {
                const meta = await client.groupMetadata(from);
                const participants = meta?.participants || [];
                const admins = participants.filter(p => p.admin);

                let doc = `╔══════════════════════════════╗\n`;
                doc += `║   📋 *DADOS DO GRUPO* 📋   ║\n`;
                doc += `╚══════════════════════════════╝\n\n`;
                doc += `╭━〔 🏷️ METADADOS 〕━⬣\n`;
                doc += `┃ 📛 *Nome:* ${meta.subject}\n`;
                doc += `┃ 👥 *Membros:* ${participants.length} participantes\n`;
                doc += `┃ 🛡️ *Admins:* ${admins.length}\n`;
                doc += `┃ 🔒 *Mensagens:* ${meta.announce ? '🔴 Apenas Admins' : '🟢 Todos'}\n`;
                doc += `┃ 🛡️ *Edição Dados:* ${meta.restrict ? '🔒 Bloqueado (Admins)' : '🔓 Livre'}\n`;
                doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
                doc += `👑 *${botName}*`;
                return reply(doc.trim());
            } catch (err) {
                logger.warn(`[GRUPO info] Falha em ${from}: ${err.message}`);
                return reply('❌ Não consegui ler os dados do grupo agora. Tente de novo em instantes.');
            }
        }

        // Menu de Ajuda do comando
        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   ⚙️ *PAINEL GERAL DO GRUPO* ⚙️   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `Tudo o que a administração pode mudar neste grupo, num lugar só.\n\n`;
        doc += `╭━〔 🎛️ CONTROLES DISPONÍVEIS 〕━⬣\n`;
        doc += `┃ 🔓 \`${prefix}grupo abrir\` ➔ Libera o chat para todos\n`;
        doc += `┃ 🔒 \`${prefix}grupo fechar\` ➔ Muta o chat (somente admins)\n`;
        doc += `┃ 🔒 \`${prefix}grupo travarinfo\` ➔ Apenas admins editam dados\n`;
        doc += `┃ 🔓 \`${prefix}grupo destravarinfo\` ➔ Todos editam dados\n`;
        doc += `┃ ✏️ \`${prefix}grupo nome <texto>\` ➔ Altera o nome do grupo\n`;
        doc += `┃ 📝 \`${prefix}grupo desc <texto>\` ➔ Altera a biografia/regras\n`;
        doc += `┃ 🖼️ \`${prefix}grupo foto\` ➔ Altera o ícone (responda à foto)\n`;
        doc += `┃ 📊 \`${prefix}grupo info\` ➔ Exibe métricas e status\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `💡 _Para essas ações funcionarem, eu preciso ser administrador do grupo._`;

        return reply(doc.trim());
    }
};

