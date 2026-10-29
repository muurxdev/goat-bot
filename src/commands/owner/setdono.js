const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .setdono / .adddono
 * Nomeia ou altera Donos seguindo a hierarquia militar rígida
 * Suporta menção (@user), resolução profunda de LID para número real, nome do perfil e quem nomeou
 */

const logger = require('../../core/logger')
const { updateOwner, canModifyOwner } = require("../../services/ownerService");
const dataService = require("../../services/dataService");
const groupAuthService = require("../../services/groupAuthService");
const { getDatabase } = require("../../database/connection");
const { formatPhoneFromJid } = require("../../config/env");

module.exports = {
    name: "setdono",
    aliases: ["setowner", "adddono", "mudardono", "nomearpatente"],
    category: "owner",
    description: "Nomeia ou altera um Dono seguindo a hierarquia militar rígida",
    ownerOnly: true,
    cooldownMs: 2000,
    execute: async ({ args, reply, sender, senderReal, roleJid, mentionedJid, client, info, quotedSender }) => {
        const quotedParticipant = quotedSender || info?.message?.extendedTextMessage?.contextInfo?.participant || null;
        const hasMention = Array.isArray(mentionedJid) && mentionedJid.length > 0;

        if (args.length < 1 || (args.length < 2 && !quotedParticipant && !hasMention)) {
            let doc = "╔══════════════════════════════╗\n";
            doc += "║   👑 *GESTÃO DE PATENTES* 👑   ║\n";
            doc += "╚══════════════════════════════╝\n\n";
            doc += "📌 *Como usar:*\n";
            doc += "• `.setdono <patente> <telefone>` (Ex: `.setdono Tenente 21 98459-6995`)\n";
            doc += "• `.setdono <patente> @usuario` (Mencione o usuário)\n";
            doc += "• `.setdono <patente> <nome> | <telefone>`\n";
            doc += "• Responder a uma mensagem com `.setdono <patente>`\n\n";
            doc += "🎖️ *Patentes Oficiais:* Capitão, Tenente, Sargento, Cabo, Soldado, Guardião, Cavaleiro, Escudeiro, Aprendiz, Recruta\n\n";
            doc += "🛡️ *Regras de Hierarquia Militar:*\n";
            doc += "• 👑 *Capitão:* Altera e nomeia todas as patentes.\n";
            doc += "• 🎖️ *Tenente:* Altera patentes abaixo dele (Sargento, Cabo, Soldado...).\n";
            doc += "• 🚫 *Imunidade:* Ninguém tem autoridade para alterar ou rebaixar o Capitão.";
            return reply(doc.trim());
        }

        const cargo = args[0].toLowerCase();
        const candidates = [roleJid, senderReal, sender].filter(Boolean);
        const check = canModifyOwner(sender, cargo, candidates);

        if (!check.allowed) {
            return reply(check.reason);
        }

        const fullInput = args.slice(1).join(" ").trim();
        let targetJid = "";
        let phoneFormatted = "";
        let customName = "";

        // 1. VERIFICAÇÃO DE MENÇÃO DIRETA (@usuario)
        const mention = hasMention ? mentionedJid[0] : (info?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || null);

        if (mention) {
            targetJid = mention;
            customName = fullInput.replace(/@\d+/g, "").trim();
        }
        // 2. VERIFICAÇÃO DE RESPOSTA A MENSAGEM (QUOTED)
        else if (quotedParticipant && (!fullInput || !/\d{8,}/.test(fullInput.replace(/\D/g, "")))) {
            targetJid = quotedParticipant;
            customName = fullInput.trim();
        }
        // 3. FORMATO COM PIPE (Nome | Telefone ou Telefone | Nome)
        else if (fullInput.includes("|")) {
            const parts = fullInput.split("|").map(p => p.trim());
            const d0 = parts[0].replace(/\D/g, "");
            const d1 = parts[1].replace(/\D/g, "");
            if (d1.length >= 8) {
                targetJid = d1;
                customName = parts[0];
            } else if (d0.length >= 8) {
                targetJid = d0;
                customName = parts[1];
            } else {
                customName = fullInput;
            }
        }
        // 4. TELEFONE NO TEXTO (Dígitos diretos, com ou sem espaços, traços, parênteses, +55)
        else {
            const cleanDigits = fullInput.replace(/\D/g, "");
            // A. Entrada puramente de telefone (ex: "21 98459-6995", "+55 21 98459-6995", "(21) 98459-6995")
            if (/^[+\d\s().-]+$/.test(fullInput) && cleanDigits.length >= 8) {
                targetJid = cleanDigits;
                customName = "";
            } else {
                // B. Nome acompanhado de telefone (ex: "GOAT 21 98459-6995" ou "21 98459-6995 GOAT")
                const phoneMatch = fullInput.match(/(?:\+?\d{1,4}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{4,5}[-\s]?\d{4}/);
                if (phoneMatch && phoneMatch[0].replace(/\D/g, "").length >= 8) {
                    targetJid = phoneMatch[0].replace(/\D/g, "");
                    customName = fullInput.replace(phoneMatch[0], "").replace(/[@|]/g, "").trim();
                } else {
                    // C. Apenas nome informado
                    customName = fullInput.trim();
                }
            }
        }

        let rawDigits = targetJid.replace(/\D/g, "");

        // Se for LID, tenta resolver o JID canônico real via groupAuthService e users
        if (targetJid.endsWith("@lid") || (rawDigits.length >= 14 && !rawDigits.startsWith("55"))) {
            try {
                const resolved = await groupAuthService.resolveRealJid(client, targetJid);
                if (resolved && !resolved.endsWith("@lid")) {
                    targetJid = resolved;
                    rawDigits = resolved.replace(/\D/g, "");
                }
            } catch (errIgnorado) { logger.warn(`[SETDONO] Falha ignorada em src/commands/owner/setdono.js:111: ${errIgnorado.message}`) }
        }

        // Inferência automática de DDI Brasil (55) se o número foi digitado com DDD (10 ou 11 dígitos)
        if (rawDigits.length === 10 || rawDigits.length === 11) {
            rawDigits = "55" + rawDigits;
        }

        if (rawDigits.length >= 8) {
            targetJid = rawDigits + "@s.whatsapp.net";
            phoneFormatted = formatPhoneFromJid(targetJid);
        }

        // Resolução do Nome Real (WhatsApp PushName / Perfil / Cadastro SQLite)
        let realWhatsappName = "";

        if (targetJid) {
            // A. Store do Baileys
            try {
                const contact = client?.store?.contacts?.[targetJid];
                realWhatsappName = contact?.notify || contact?.name || "";
            } catch (errIgnorado) { logger.warn(`[SETDONO] Falha ignorada em src/commands/owner/setdono.js:132: ${errIgnorado.message}`) }

            // B. Repositório de Usuários / SQLite
            if (!realWhatsappName) {
                try {
                    const userRepo = require("../../database/repositories/userRepository");
                    const u = userRepo.getUser(targetJid) || (rawDigits ? userRepo.getUser(rawDigits + "@s.whatsapp.net") : null);
                    if (u) {
                        realWhatsappName = u.display_nick || u.name || "";
                    }
                } catch (errIgnorado) { logger.warn(`[SETDONO] Falha ignorada em src/commands/owner/setdono.js:142: ${errIgnorado.message}`) }
            }

            if (!realWhatsappName && rawDigits) {
                try {
                    const db = getDatabase();
                    const row = db.prepare("SELECT name, display_nick FROM users WHERE jid = ? OR phone LIKE ?").get(targetJid, `%${rawDigits.slice(-8)}%`);
                    if (row) {
                        realWhatsappName = row.display_nick || row.name || "";
                    }
                } catch (errIgnorado) { logger.warn(`[SETDONO] Falha ignorada em src/commands/owner/setdono.js:152: ${errIgnorado.message}`) }
            }
        }

        // Define o nome final: customName (se o operador digitou um nome explicitamente) ou realWhatsappName
        let nome = customName || realWhatsappName || "";

        // Se ainda não temos JID nem nome
        if (!targetJid && !nome) {
            return reply("❌ Informe o número de telefone (com ou sem DDD), marque o usuário (@) ou digite um nome para registrar a patente.");
        }

        const appointedByText = check.senderRank?.name
            ? `${check.senderRank.rank} (${check.senderRank.name})`
            : (check.senderRank?.rank || "Dono");

        const updated = updateOwner(cargo, nome, phoneFormatted, targetJid, appointedByText);
        if (!updated) {
            return reply(`❌ Falha ao atualizar a patente \`${cargo}\`.`);
        }

        // Sincroniza imediatamente o cargo OWNER na tabela user_roles do SQLite e lista TRUSTED
        try {
            const permissionRepo = require("../../database/repositories/permissionRepository");
            if (targetJid) {
                permissionRepo.setUserRole(targetJid, "OWNER", sender);
                permissionRepo.setTrusted(targetJid, true, sender, `Nomeado ${updated.rank}`);
            }
        } catch (errIgnorado) { logger.warn(`[SETDONO] Falha ignorada em src/commands/owner/setdono.js:180: ${errIgnorado.message}`) }

        const mentions = [];
        if (targetJid) mentions.push(targetJid);
        if (sender) mentions.push(sender);

        const { resolveOwnerName } = require("../../services/ownerService");
        const liveName = resolveOwnerName(updated);
        const displayName = liveName && liveName !== updated.rank ? liveName : (updated.name || updated.rank);
        const contactDisplay = updated.phone || phoneFormatted || (targetJid ? formatPhoneFromJid(targetJid) : "Sem número cadastrado");
        const tagIdentifier = (updated.jid || targetJid) ? `${nomeDoMembro((updated.jid || targetJid))}` : `${nomeDoMembro(sender)}`;

        let res = "╔══════════════════════════════╗\n";
        res += "║  👑 *PATENTE DE DONO ATUALIZADA!*  \n";
        res += "╚══════════════════════════════╝\n\n";
        res += `🎖️ *Patente:* **${updated.rank}** (Nível ${updated.level})\n`;
        res += `👤 *Nome Registrado:* ${tagIdentifier} (${displayName})\n`;
        res += `📱 *WhatsApp/Contato:* ${contactDisplay}\n`;
        res += `🟢 *Nomeado por:* ${appointedByText}\n`;
        res += `📅 *Data:* ${updated.appointedAt || "Hoje"}`;

        return reply(res.trim(), mentions);
    }
};
