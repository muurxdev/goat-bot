const logger = require('../core/logger')

/**
 * Serviço de saudações de grupo (welcome / leave)
 *
 * Fonte ÚNICA das mensagens de entrada/saída. Tanto o handler de eventos real
 * quanto os comandos `.welcome -config` / `.leave -config` usam estas funções,
 * garantindo que a pré-visualização mostre EXATAMENTE o que o membro verá, com
 * os dados reais do usuário e do grupo.
 */

/** Substitui as variáveis no template com suporte a tags hierárquicas completas. */
function formatTemplate(tpl, vars = {}) {
    const {
        userTag = "@usuario",
        adminTag = "@admin",
        donoTag = "@dono",
        segundoAdmTag = "@subdono",
        admsTags = "@admins",
        listaAdmsFormatada = "",
        groupName = "Grupo",
        groupDesc = "Sem descrição",
        memberCount = 0,
        timeStr = "",
        dateStr = "",
        botName = "",
        adminCount = 0,
        saudacao = "Olá",
        diaSemana = "",
        tempo = "",
        motivo = ""
    } = vars;

    return String(tpl)
        .replace(/\{user\}/gi, userTag)
        .replace(/\{usuario\}/gi, userTag)
        .replace(/\{membro\}/gi, userTag)
        .replace(/\{admin\}/gi, adminTag)
        .replace(/\{adm\}/gi, adminTag)
        .replace(/\{dono\}/gi, donoTag)
        .replace(/\{criador\}/gi, donoTag)
        .replace(/\{owner\}/gi, donoTag)
        .replace(/\{subdono\}/gi, segundoAdmTag)
        .replace(/\{segundo_adm\}/gi, segundoAdmTag)
        .replace(/\{segundoadm\}/gi, segundoAdmTag)
        .replace(/\{sucessor\}/gi, segundoAdmTag)
        .replace(/\{adms\}/gi, admsTags)
        .replace(/\{marcaradms\}/gi, admsTags)
        .replace(/\{lista_admins\}/gi, listaAdmsFormatada || admsTags)
        .replace(/\{grupo\}/gi, groupName)
        .replace(/\{nome\}/gi, groupName)
        .replace(/\{desc\}/gi, groupDesc || "Sem descrição")
        .replace(/\{membros\}/gi, String(memberCount))
        .replace(/\{hora\}/gi, timeStr)
        .replace(/\{data\}/gi, dateStr || "")
        .replace(/\{bot\}/gi, botName || "")
        .replace(/\{admins\}/gi, String(adminCount ?? ""))
        .replace(/\{saudacao\}/gi, saudacao || "")
        .replace(/\{dia\}/gi, diaSemana || "")
        .replace(/\{tempo\}/gi, tempo || "")
        .replace(/\{duracao\}/gi, tempo || "")
        .replace(/\{motivo\}/gi, motivo || "")
        .replace(/\{razao\}/gi, motivo || "");
}

/**
 * Coleta as variáveis reais do grupo e do participante.
 * @param {object} client - socket
 * @param {string} groupJid
 * @param {string} participantJid - membro alvo (novo/removido, ou quem testa)
 * @param {object} [extraVars] - dados extras como tempo, adminJid, motivo
 */
async function getGreetingVars(client, groupJid, participantJid, extraVars = {}) {
    let groupName = "Grupo";
    let groupDesc = "";
    let memberCount = 0;
    let adminCount = 0;
    let ownerJid = null;
    let secondAdminJid = null;
    let adminJids = [];

    try {
        if (client && typeof client.groupMetadata === "function") {
            const meta = await client.groupMetadata(groupJid);
            if (meta?.subject) groupName = meta.subject;
            if (meta?.desc) groupDesc = meta.desc;
            if (Array.isArray(meta?.participants)) {
                memberCount = meta.participants.length;
                const admins = meta.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
                adminCount = admins.length;
                adminJids = admins.map(p => p.id || p.jid || String(p));

                // 1. Identifica Dono / Criador / Superadmin
                const superadmin = meta.participants.find(p => p.admin === 'superadmin');
                ownerJid = meta.owner || meta.subjectOwner || (superadmin && (superadmin.id || superadmin.jid)) || adminJids[0] || null;

                // 2. Identifica o Segundo Administrador (subdono ou sucessor pós-saída)
                const otherAdmins = adminJids.filter(j => j !== ownerJid);
                secondAdminJid = otherAdmins[0] || adminJids[1] || ownerJid || null;
            }
        }
    } catch (errIgnorado) {
        logger.warn(`[GROUPGREETINGSERVICE] Falha ao obter metadados de ${groupJid}: ${errIgnorado.message}`);
    }

    const cleanNumber = jid => String(jid || "").split("@")[0].split(":")[0];
    const userNumber = cleanNumber(participantJid);
    const ownerNumber = cleanNumber(ownerJid);
    const secondAdminNumber = cleanNumber(secondAdminJid);
    const adminNumber = cleanNumber(extraVars.adminJid || participantJid || ownerJid);

    const userTag = userNumber ? "@" + userNumber : "@usuario";
    const adminTag = adminNumber ? "@" + adminNumber : userTag;
    const donoTag = ownerNumber ? "@" + ownerNumber : (userTag || "Dono");
    const segundoAdmTag = secondAdminNumber ? "@" + secondAdminNumber : donoTag;
    const admsTags = adminJids.length > 0 ? adminJids.map(j => "@" + cleanNumber(j)).join(" ") : donoTag;
    const listaAdmsFormatada = adminJids.length > 0
        ? adminJids.map((j, i) => `${i + 1}. @${cleanNumber(j)}`).join("\n")
        : donoTag;

    const allMentionJids = Array.from(new Set([
        participantJid,
        ownerJid,
        secondAdminJid,
        extraVars.adminJid,
        ...adminJids
    ].filter(Boolean)));

    const now = new Date();
    const timeStr = now.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" });
    const dateStr = now.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
    const botName = require("../config/botConfig").getBotName();
    const saudacao = (h => h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite")(now.getHours());
    const diaSemana = now.toLocaleDateString("pt-BR", { weekday: "long", timeZone: "America/Sao_Paulo" });

    return {
        participantJid,
        ownerJid,
        secondAdminJid,
        adminJids,
        allMentionJids,
        userTag,
        adminTag,
        donoTag,
        segundoAdmTag,
        admsTags,
        listaAdmsFormatada,
        groupName,
        groupDesc,
        memberCount,
        timeStr,
        dateStr,
        botName,
        adminCount,
        saudacao,
        diaSemana,
        tempo: extraVars.tempo || extraVars.durationStr || "",
        motivo: extraVars.motivo || ""
    };
}

/**
 * Extrai todos os JIDs que devem ser marcados em um texto formatado
 * @param {string} text - Mensagem final formatada
 * @param {object} vars - Objeto de variáveis de saudação
 * @returns {string[]} Lista de JIDs para envio no mentions do Baileys
 */
function resolveMentionsForText(text, vars = {}) {
    const mentions = new Set();
    if (vars.participantJid) mentions.add(vars.participantJid);

    const matches = String(text || '').match(/@(\d{5,25})/g);
    if (matches && vars.allMentionJids) {
        for (const m of matches) {
            const num = m.replace('@', '');
            const found = vars.allMentionJids.find(j => j.startsWith(num));
            if (found) {
                mentions.add(found);
            } else {
                mentions.add(`${num}@s.whatsapp.net`);
            }
        }
    }
    return Array.from(mentions);
}

/** Mensagem de boas-vindas (custom via template, ou o padrão oficial). */
function buildWelcomeMessage(groupConfig, vars) {
    if (groupConfig && groupConfig.welcomeMessage) {
        return formatTemplate(groupConfig.welcomeMessage, vars);
    }
    const regras = vars.groupDesc ? "Leia as regras na descrição" : "Leia as regras do grupo";
    let t = "🍺 Boas-vindas, " + vars.userTag + "!\n\n";
    t += "Que bom ter você no *" + vars.groupName + "*. " + regras + " e, quando quiser, digite `.menu` para ver o que eu faço.";
    return t;
}

/** Mensagem de despedida (custom via template, ou o padrão oficial). */
function buildLeaveMessage(groupConfig, vars) {
    if (groupConfig && groupConfig.leaveMessage) {
        return formatTemplate(groupConfig.leaveMessage, vars);
    }
    let t = "👋 " + vars.userTag + " saiu do grupo.";
    if (vars.memberCount > 0) t += " Agora somos " + vars.memberCount + ".";
    return t;
}

/** Mensagem de abertura de grupo (custom via template, ou o padrão oficial). */
function buildOpenMessage(groupConfig, vars) {
    if (groupConfig && (groupConfig.aberturaMsg || groupConfig.openMessage)) {
        return formatTemplate(groupConfig.aberturaMsg || groupConfig.openMessage, vars);
    }
    let t = "╔══════════════════════════════╗\n";
    t += "║   🔓 *GRUPO ABERTO!* 🔓      ║\n";
    t += "╚══════════════════════════════╝\n\n";
    t += "💬 O grupo *" + vars.groupName + "* foi liberado para todos os membros!\n\n";
    t += "╭━〔 📋 INFORMAÇÕES 〕━⬣\n";
    t += "┃ 👑 *Dono:* " + vars.donoTag + "\n";
    t += "┃ 👥 *Membros:* " + vars.memberCount + "\n";
    t += "┃ ⏰ *Horário:* " + vars.timeStr + "\n";
    if (vars.tempo) t += "┃ ⏱️ *Programação:* " + vars.tempo + "\n";
    t += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";
    t += "💡 _Respeitem as regras do grupo e tenham uma ótima conversa!_";
    return t;
}

/** Mensagem de fechamento de grupo (custom via template, ou o padrão oficial). */
function buildCloseMessage(groupConfig, vars) {
    if (groupConfig && (groupConfig.fechamentoMsg || groupConfig.closeMessage)) {
        return formatTemplate(groupConfig.fechamentoMsg || groupConfig.closeMessage, vars);
    }
    let t = "╔══════════════════════════════╗\n";
    t += "║   🔒 *GRUPO FECHADO!* 🔒     ║\n";
    t += "╚══════════════════════════════╝\n\n";
    t += "⛔ O grupo *" + vars.groupName + "* foi temporariamente fechado.\n\n";
    t += "╭━〔 📋 INFORMAÇÕES 〕━⬣\n";
    t += "┃ 🛡️ *Administração:* Apenas administradores podem enviar mensagens\n";
    t += "┃ 👑 *Dono:* " + vars.donoTag + "\n";
    t += "┃ 👥 *Membros:* " + vars.memberCount + "\n";
    t += "┃ ⏰ *Horário:* " + vars.timeStr + "\n";
    if (vars.tempo) t += "┃ ⏱️ *Programação:* " + vars.tempo + "\n";
    t += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";
    t += "💡 _Aguardem a reabertura pela administração._";
    return t;
}

/** Guia das variáveis e subcomandos (o "processo" que o admin encaixa). */
function variableGuide(type) {
    let cmd = "welcome";
    let titulo = "Boas-Vindas";
    if (type === "leave" || type === "despedida") {
        cmd = "leave";
        titulo = "Despedida";
    } else if (type === "open" || type === "abertura" || type === "msgabertura") {
        cmd = "msgabertura";
        titulo = "Abertura de Grupo";
    } else if (type === "close" || type === "fechamento" || type === "msgfechamento") {
        cmd = "msgfechamento";
        titulo = "Fechamento de Grupo";
    } else if (type === "agenda" || type === "agendagrupo" || type === "rotina") {
        cmd = "config agenda";
        titulo = "Agenda Automática";
    }

    let g = `🔤 *Variáveis do Modelo (${titulo})*\n\n`;
    g += "• `{grupo}` — nome do grupo\n";
    g += "• `{dono}` / `{criador}` — marca o criador/dono do grupo\n";
    g += "• `{subdono}` / `{segundo_adm}` — marca o 2º administrador na hierarquia (sucessor)\n";
    g += "• `{adms}` — marca todos os administradores atuais\n";
    g += "• `{lista_admins}` — lista numerada com todos os admins\n";
    g += "• `{membros}` — quantidade total de membros\n";
    g += "• `{hora}` — horário da ação (Brasília)\n";
    g += "• `{data}` — data atual (dd/mm/aaaa)\n";
    g += "• `{saudacao}` — Bom dia, Boa tarde ou Boa noite\n";
    g += "• `{dia}` — dia da semana\n";
    g += "• `{desc}` — descrição/regras do grupo\n";
    g += "• `{bot}` — nome do bot\n";
    if (cmd === "welcome" || cmd === "leave") {
        g += "• `{user}` — marca a pessoa que entrou/saiu\n";
    } else if (cmd === "config agenda") {
        g += "• `{hora_fechar}` — horário configurado para trancar o grupo\n";
        g += "• `{hora_abrir}` — horário configurado para reabrir o grupo\n";
        g += "• `{dia_abrir}` — dia da próxima reabertura\n";
    } else {
        g += "• `{admin}` — marca o administrador que executou a ação\n";
        g += "• `{tempo}` — duração ou horário programado\n";
    }

    g += "\n*Comandos*\n\n";
    if (cmd === "config agenda") {
        g += `• \`.${cmd} on\` / \`.${cmd} off\` — liga ou desliga a agenda\n`;
        g += `• \`.${cmd} msgfechar <texto>\` — personaliza mensagem ao fechar\n`;
        g += `• \`.${cmd} msgabrir <texto>\` — personaliza mensagem ao abrir\n`;
        g += `• \`.${cmd} preview\` — visualiza como ficam as mensagens\n`;
        g += `• \`.${cmd} reset\` — volta ao padrão oficial oficial`;
    } else {
        g += `• \`.${cmd} on\` / \`.${cmd} off\` — liga ou desliga\n`;
        g += `• \`.${cmd} msg <texto>\` — personaliza a mensagem\n`;
        g += `• \`.${cmd} reset\` — volta ao padrão oficial\n`;
        g += `• \`.${cmd} -config\` — mostra este painel e simulação`;
    }
    return g;
}

module.exports = {
    formatTemplate,
    getGreetingVars,
    resolveMentionsForText,
    buildWelcomeMessage,
    buildLeaveMessage,
    buildOpenMessage,
    buildCloseMessage,
    variableGuide
};
