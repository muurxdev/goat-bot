const { nomeDoMembro } = require('../../utils/nomeMembro');
const logger = require('../../core/logger')
/**
 * Comando .parceria / .afiliacao
 * Gestão de parcerias, afiliados e orientações de divulgação de links no grupo
 */

const dataService = require("../../services/dataService");
const aiLearning = require("../../services/aiLearningService");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "parceria",
    aliases: [
        "parcerias", "afiliacao", "linkpermissao",
        "cmd_parceria", "alt_parceria", "atalho_parceria", "abrev_parceria", "call_parceria", "func_parceria"
    ],
    category: "admin",
    subcategory: "Administração",
    description: "Gerencia parcerias, afiliações e permissões de postagem de links no grupo ou no privado (DM)",
    groupOnly: false,
    adminOnly: false,
    cooldownMs: 2000,
    execute: async ({ from, args, reply, sender, isGroup, isAdmin, isOwner, contextInfo, prefix, client }) => {
        const p = prefix || ".";
        const botName = getBotName();
        const configs = dataService.getConfigsData();

        // Determina o grupo alvo:
        // Se estiver no grupo, é o próprio grupo.
        // Se estiver no privado (DM), busca o JID do grupo nos argumentos ou nos grupos onde o remetente é admin
        let targetGroup = isGroup ? from : null;

        if (!isGroup) {
            // Verifica se o usuário passou um ID de grupo como argumento (ex: .parceria add @user 120363...@g.us)
            const possibleGroupArg = args.find(a => a.endsWith('@g.us'));
            if (possibleGroupArg) {
                targetGroup = possibleGroupArg;
            } else {
                // Tenta encontrar grupos onde este usuário é administrador
                const groupAuthService = require('../../services/groupAuthService');
                const allGroups = Object.keys(configs).filter(k => k.endsWith('@g.us'));
                for (const gId of allGroups) {
                    if (isOwner) {
                        targetGroup = gId;
                        break;
                    }
                    try {
                        const isAdm = await groupAuthService.isGroupAdmin(gId, sender);
                        if (isAdm) {
                            targetGroup = gId;
                            break;
                        }
                    } catch (err) { logger.warn('[PARCERIA] falha ignorada: ' + (err && err.message)) }
                }
            }
        }

        const sub = (args[0] || "").toLowerCase().trim();

        // Se não houver grupo alvo no privado e tentar add/del, solicita o ID do grupo
        if (!targetGroup && (sub === "add" || sub === "del" || sub === "autorizar" || sub === "remover")) {
            return reply(`💡 *No privado (DM), informe o grupo alvo:*\n\`${p}parceria add @user <id_do_grupo@g.us>\`\n\n_Exemplo:_ \`${p}parceria add @5511999990001 120363000000000099@g.us\``);
        }

        const effectiveGroup = targetGroup || from;
        if (!configs[effectiveGroup]) configs[effectiveGroup] = {};
        const allowed = configs[effectiveGroup].allowedLinkUsers || [];

        // Validação de permissão: no grupo precisa ser admin ou dono; no PV precisa ser admin daquele grupo ou dono
        let canManage = isOwner || (isGroup && isAdmin);
        if (!canManage && effectiveGroup.endsWith('@g.us')) {
            const groupAuthService = require('../../services/groupAuthService');
            try {
                canManage = await groupAuthService.isGroupAdmin(effectiveGroup, sender);
            } catch (err) { logger.warn('[PARCERIA] falha ignorada: ' + (err && err.message)) }
        }

        // Operações administrativas: add / del
        if (sub === "add" || sub === "autorizar" || sub === "permitir") {
            if (!canManage) {
                return reply("🛡️ Apenas administradores do grupo ou o dono podem conceder parcerias de links.");
            }
            const target = (contextInfo?.mentionedJid && contextInfo.mentionedJid[0]) ||
                (args[1] && args[1].includes('@') ? args[1].replace(/[@\s]/g, '') + '@s.whatsapp.net' : null) ||
                (args[1] && /^\d+$/.test(args[1]) ? args[1] + '@s.whatsapp.net' : null);

            if (!target) return reply(`💡 Marque o usuário para conceder parceria: \`${p}parceria add @user\``);

            await aiLearning.allowLinkUser(effectiveGroup, target);
            // Mostra o nome do parceiro, nunca o número (a menção continua notificando)
            const nomeParceiro = String(dataService.getUser(target)?.name || '').trim() || 'Este membro';
            return reply(`🤝 *NOVA PARCERIA FIRMADA!*\n\n*${nomeParceiro}* agora é um parceiro oficial e tem permissão permanente para postar qualquer link sem limite diário nem exclusão!\n\n📌 *Válido até:* Remoção manual por um administrador ou pelo dono.`, [target]);
        }

        if (sub === "del" || sub === "remover" || sub === "revogar") {
            if (!canManage) {
                return reply("🛡️ Apenas administradores do grupo ou o dono podem revogar parcerias.");
            }
            const target = (contextInfo?.mentionedJid && contextInfo.mentionedJid[0]) ||
                (args[1] && args[1].includes('@') ? args[1].replace(/[@\s]/g, '') + '@s.whatsapp.net' : null) ||
                (args[1] && /^\d+$/.test(args[1]) ? args[1] + '@s.whatsapp.net' : null);

            if (!target) return reply(`💡 Marque o usuário para remover parceria: \`${p}parceria del @user\``);

            await aiLearning.disallowLinkUser(effectiveGroup, target);
            return reply(`🚫 A parceria de ${nomeDoMembro(target)} foi encerrada e a permissão de links foi revogada.`, [target]);
        }

        // Painel e Orientações para Usuários e Admins
        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🤝 *PARCERIAS & AFILIAÇÃO* 🤝   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `📢 *Quer divulgar seu link, canal ou projeto sem restrições?*\n`;
        doc += `Neste grupo, o envio de links não autorizados resulta em banimento imediato. Com a parceria oficial ativada, você tem permissão contínua sem limites diários.\n\n`;
        doc += `╭━〔 📋 COMO CONSEGUIR PERMISSÃO 〕━⬣\n`;
        doc += `┃ 1️⃣ Chame um administrador do grupo no privado (DM)\n`;
        doc += `┃ 2️⃣ Apresente sua proposta de parceria\n`;
        doc += `┃ 3️⃣ O admin pode autorizar no grupo ou no privado com \`${p}parceria add @user\`\n`;
        doc += `┃ 4️⃣ Para falar com a liderança geral do bot: \`${p}dono\`\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;

        doc += `╭━〔 👥 PARCEIROS ATIVOS (${effectiveGroup.endsWith('@g.us') ? 'GRUPO' : 'SISTEMA'}) 〕━⬣\n`;
        if (allowed.length === 0) {
            doc += `┃ _Nenhum parceiro cadastrado no momento._\n`;
        } else {
            allowed.forEach((j, i) => {
                doc += `┃ ${i + 1}. ${nomeDoMembro(j)} ✅ (Sem limites)\n`;
            });
        }
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;

        if (canManage) {
            doc += `👑 *Comandos de Administrador (Grupo ou DM):*\n`;
            doc += `• \`${p}parceria add @user\` — Autorizar novo parceiro permanente\n`;
            doc += `• \`${p}parceria del @user\` — Revogar parceria\n\n`;
        }
        doc += `👑 *${botName}*`;

        return reply(doc, allowed);
    }
};
