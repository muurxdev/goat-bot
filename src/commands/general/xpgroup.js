/**
 * Comando .xpgroup / .xpg / .xpgrupo
 * Exibe o XP acumulado em grupos ou ativa/desativa XP e avisos no grupo (Admin)
 */

const dataService = require("../../services/dataService");
const { initializeUser, barraXP, getCargo, calcularXpNecessario } = require("../../services/xpService");
const { getBotName } = require("../../config/botConfig");

module.exports = {
    name: "xpgroup",
    aliases: ["xpg", "xpgrupo", "xpgrupos", "xpfarm"],
    category: "general",
    subcategory: "XP & Progressão",
    description: "Exibe XP ganho no grupo ou gerencia o sistema de XP e avisos no grupo (Admin)",
    cooldownMs: 2000,
    execute: async ({ sender, reply, args = [], isGroup, isAdmin, isOwner, from, prefix = '.' }) => {
        const botName = getBotName();
        const configs = dataService.getConfigsData();
        if (isGroup && !configs[from]) configs[from] = {};

        const sub = (args[0] || '').toLowerCase().trim();
        const param = (args[1] || '').toLowerCase().trim();

        // Operações administrativas em grupo
        if (isGroup && (sub === 'on' || sub === 'off' || sub === 'ativar' || sub === 'desativar' || sub === 'msg' || sub === 'aviso' || sub === 'avisos' || sub === 'card' || sub === 'status')) {
            if (!isAdmin && !isOwner) {
                return reply(`❌ Apenas administradores do grupo ou o Dono podem alterar as configurações de XP.`);
            }

            // Toggles de mensagens / avisos de level up: .xpgrupo msg off / on
            if (sub === 'msg' || sub === 'aviso' || sub === 'avisos' || sub === 'card') {
                const ligar = param === 'on' || param === 'ativar' || param === '1' || param === 'sim';
                const desligar = param === 'off' || param === 'desativar' || param === '0' || param === 'nao' || param === 'não';

                if (!ligar && !desligar) {
                    const statusAtual = configs[from]?.notifyLevelUp !== false ? '✅ ATIVADOS' : '🔇 DESATIVADOS';
                    return reply(`📢 *Avisos de Level Up no Grupo:*\nStatus atual: ${statusAtual}\n\nPara alterar use:\n• \`${prefix}xpgrupo msg on\` (ativa cartões de level up)\n• \`${prefix}xpgrupo msg off\` (silencia cartões de level up)`);
                }

                configs[from].notifyLevelUp = ligar;
                await dataService.saveConfigsData(configs);
                return reply(`🔔 *Avisos de Level Up:* ${ligar ? '✅ ATIVADOS' : '🔇 SILENCIADOS'}\n${ligar ? 'Os membros receberão cartões ao subir de nível.' : 'Membros sobem de nível em silêncio sem inundar o chat.'}`);
            }

            // Status geral do grupo
            if (sub === 'status') {
                const xpAtivo = configs[from]?.xpEnabled !== false ? '✅ ATIVO' : '❌ DESATIVADO';
                const msgAtiva = configs[from]?.notifyLevelUp !== false ? '✅ ATIVADOS' : '🔇 SILENCIADOS';
                return reply(`📊 *STATUS DE XP DO GRUPO:*\n\n⭐ *Ganho de XP por mensagem:* ${xpAtivo}\n🔔 *Avisos de Level Up:* ${msgAtiva}\n\nComandos rápidos:\n• \`${prefix}xpgrupo on / off\` — Liga/Desliga XP no grupo\n• \`${prefix}xpgrupo msg on / off\` — Liga/Desliga cartões de level up`);
            }

            // Ativar / Desativar XP geral por mensagem no grupo
            const ativar = sub === 'on' || sub === 'ativar';
            configs[from].xpEnabled = ativar;
            await dataService.saveConfigsData(configs);
            return reply(`⚡ *Sistema de XP por Mensagem:* ${ativar ? '✅ ATIVADO' : '❌ DESATIVADO'}\n${ativar ? 'Os membros voltarão a acumular XP conversando normalmente.' : 'Nenhum membro receberá XP por mensagens neste grupo.'}`);
        }

        // Exibição normal de estatísticas de XP
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        const farmGrupoMsgs = user.messagesGroup || 0;
        const farmGrupoXp = user.xpGroup || 0;
        const farmComandos = user.commandsGroup || 0;
        const level = user.level || 1;
        const currentXp = user.xp || 0;
        const maxXp = calcularXpNecessario(level);
        const barra = barraXP(currentXp, level);
        const cargo = getCargo(level);

        let doc = "╔══════════════════════════════╗\n";
        doc += "║   📊 *XP EM GRUPOS* 📊   ║\n";
        doc += "╚══════════════════════════════╝\n\n";

        doc += "╭━〔 🌐 FARM GRUPAL 〕━⬣\n";
        doc += "┃ 💬 *Mensagens no Grupo:* " + farmGrupoMsgs.toLocaleString('pt-BR') + "\n";
        doc += "┃ ⌨️ *Comandos no Grupo:* " + farmComandos.toLocaleString('pt-BR') + "\n";
        doc += "┃ ✨ *XP Ganho em Grupos:* " + farmGrupoXp.toLocaleString('pt-BR') + " XP\n";
        doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";

        doc += "╭━〔 📈 PROGRESSO TOTAL 〕━⬣\n";
        doc += "┃ 📊 *Nível:* " + level + " " + barra + "\n";
        doc += "┃ ⭐ *XP Atual:* " + currentXp.toLocaleString('pt-BR') + " / " + maxXp.toLocaleString('pt-BR') + " XP\n";
        doc += "┃ 💼 *Patente:* " + cargo + "\n";
        doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";

        if (isGroup) {
            const xpStatus = configs[from]?.xpEnabled !== false ? 'Ligado' : 'Desligado';
            const msgStatus = configs[from]?.notifyLevelUp !== false ? 'Ligado' : 'Silencioso';
            doc += `⚙️ *Config do Grupo:* XP: ${xpStatus} | Avisos: ${msgStatus}\n`;
            doc += `💡 _Admins podem usar \`${prefix}xpgrupo on/off\` ou \`${prefix}xpgrupo msg off\`_\n`;
        } else {
            doc += "💡 _XP é ganho automaticamente ao enviar mensagens em grupos!_\n";
        }
        doc += "👑 *" + botName + "*";

        return reply(doc.trim());
    }
};
