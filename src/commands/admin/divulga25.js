/**
 * Comando .mododivulgacao / .grupodivulgacao
 * Central de automação para grupos de divulgação e parcerias:
 * - Ativa filtros de segurança por padrão (anti-link, anti-trava, anti-spam, auto-kick)
 * - Dispara mensagem configurável com link ao fechar o grupo
 * - Envia alerta/comprovante no PV dos administradores e/ou Dono do Bot
 */

const dataService = require('../../services/dataService');
const { getBotName } = require('../../config/botConfig');
const groupAuthService = require('../../services/groupAuthService');

module.exports = {
    name: 'mododivulgacao',
    aliases: ['grupodivulgacao', 'divulgamode', 'divulgaauto', 'autodivulgacao', 'divulgacaofechar', 'cmd_mododivulgacao', 'mododivulga'],
    category: 'admin',
    subcategory: 'Divulgação',
    description: 'Ativa o modo divulgação com filtros de segurança automáticos, mensagem ao fechar e aviso no PV dos ADMs/Dono',
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ reply, sender, from, isGroup, args = [], prefix = '.', client }) => {
        const botName = getBotName();
        const configs = dataService.getConfigsData();
        if (!configs[from]) configs[from] = {};

        if (!configs[from].divulgacaoMode) {
            configs[from].divulgacaoMode = {
                enabled: false,
                link: '',
                closeMessage: '',
                notifyPv: true,
                autoShields: true
            };
        }

        const mode = configs[from].divulgacaoMode;
        const sub = (args[0] || '').toLowerCase().trim();
        const param = args.slice(1).join(' ').trim();

        // 1. ATIVAR MODO DIVULGAÇÃO (.mododivulgacao on / ativar)
        if (sub === 'on' || sub === 'ativar' || sub === 'ligar' || sub === '1') {
            mode.enabled = true;

            // Auto-Shields: Ativa todas as travas e filtros de segurança por padrão sem precisar rodar um por um
            configs[from].antilink = true;
            configs[from].antilinkConfig = {
                enabled: true,
                action: 'delete',
                platforms: {
                    whatsapp: true,
                    canal: true,
                    telegram: true,
                    instagram: true,
                    tiktok: true,
                    discord: true,
                    youtube: true,
                    outros: true
                }
            };
            configs[from].antitrava = true;
            configs[from].antispam = true;
            configs[from].antifake = true;
            configs[from].autokick = true;

            await dataService.saveConfigsData(configs);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║ 📢 *MODO DIVULGAÇÃO ATIVADO* 📢 ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `✅ *O grupo agora está operando no Modo Divulgação Oficial!*\n\n`;
            doc += `╭━〔 🛡️ FILTROS ATIVADOS POR PADRÃO 〕━⬣\n`;
            doc += `┃ 🔒 *Anti-Link Global:* Ativo (todos os links bloqueados)\n`;
            doc += `┃ 🛑 *Anti-Trava & Anti-Flood:* Ativo\n`;
            doc += `┃ 🛡️ *Anti-Fake / DDI Estrangeiro:* Ativo\n`;
            doc += `┃ ⚡ *Auto-Kick de Infratores:* Ativo\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `╭━〔 ⚙️ AUTOMAÇÃO AO FECHAR 〕━⬣\n`;
            doc += `┃ 📝 *Mensagem com Link:* ${mode.closeMessage ? 'Configurada' : 'Padrão Oficial'}\n`;
            doc += `┃ 🔗 *Link de Divulgação:* ${mode.link || '_(use ' + prefix + 'mododivulgacao link <url>)_'}\n`;
            doc += `┃ 📱 *Aviso no PV dos ADMs/Dono:* ${mode.notifyPv ? '✅ Ligado' : '❌ Desligado'}\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Quando o grupo for fechado com \`${prefix}fechar\`, a mensagem de divulgação será enviada e os ADMs/Dono serão avisados no PV!_`;

            return reply(doc.trim());
        }

        // 2. DESATIVAR MODO DIVULGAÇÃO (.mododivulgacao off / desativar)
        if (sub === 'off' || sub === 'desativar' || sub === 'desligar' || sub === '0') {
            mode.enabled = false;
            await dataService.saveConfigsData(configs);
            return reply(`🔴 *Modo Divulgação DESATIVADO neste grupo.*\nOs filtros voltam a seguir as configurações manuais padrão.`);
        }

        // 3. CONFIGURAR LINK (.mododivulgacao link <url>)
        if (sub === 'link') {
            if (!param) {
                return reply(`❌ Informe o link oficial de divulgação.\nExemplo: \`${prefix}mododivulgacao link https://chat.whatsapp.com/seu-grupo\``);
            }
            mode.link = param;
            await dataService.saveConfigsData(configs);
            return reply(`🔗 *Link de divulgação atualizado com sucesso!*\nNovo link: ${param}`);
        }

        // 4. CONFIGURAR MENSAGEM (.mododivulgacao msg <texto>)
        if (sub === 'msg' || sub === 'mensagem' || sub === 'texto') {
            if (!param) {
                return reply(`❌ Informe o texto da mensagem.\nVariáveis: \`{grupo}\`, \`{dono}\`, \`{adms}\`, \`{link}\`, \`{hora}\`\nExemplo:\n\`${prefix}mododivulgacao msg 📢 Grupo {grupo} fechado para divulgação! Conheça nosso canal: {link} — Dono: {dono}\``);
            }
            mode.closeMessage = param;
            await dataService.saveConfigsData(configs);
            return reply(`📝 *Mensagem de fechamento para divulgação salva com sucesso!*`);
        }

        // 5. ATIVAR/DESATIVAR NOTIFICAÇÃO NO PV DOS ADMS/DONO (.mododivulgacao pv on/off)
        if (sub === 'pv' || sub === 'notify' || sub === 'notificar') {
            const ligar = param === 'on' || param === 'ativar' || param === '1';
            const desligar = param === 'off' || param === 'desativar' || param === '0';
            if (!ligar && !desligar) {
                return reply(`📌 Uso: \`${prefix}mododivulgacao pv on\` ou \`${prefix}mododivulgacao pv off\``);
            }
            mode.notifyPv = ligar;
            await dataService.saveConfigsData(configs);
            return reply(`📱 *Aviso no PV dos ADMs/Dono ao fechar grupo:* ${ligar ? '✅ ATIVADO' : '❌ DESATIVADO'}`);
        }

        // 6. STATUS / PAINEL GERAL
        let doc = `╔══════════════════════════════╗\n`;
        doc += `║ 📢 *PAINEL: MODO DIVULGAÇÃO* 📢 ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `📌 *Status do Grupo:* ${mode.enabled ? '🟢 ATIVADO' : '🔴 DESATIVADO'}\n\n`;
        doc += `╭━〔 📋 CONFIGURAÇÕES ATUAIS 〕━⬣\n`;
        doc += `┃ 🔗 *Link Oficial:* ${mode.link || 'Nenhum cadastrado'}\n`;
        doc += `┃ 📱 *Avisar no PV dos ADMs/Dono:* ${mode.notifyPv ? '✅ Sim' : '❌ Não'}\n`;
        doc += `┃ 📝 *Mensagem de Fechamento:* ${mode.closeMessage ? 'Personalizada' : 'Padrão Oficial'}\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `╭━〔 ⚙️ COMANDOS DISPONÍVEIS 〕━⬣\n`;
        doc += `┃ • \`${prefix}mododivulgacao on / off\` — Liga/Desliga o modo\n`;
        doc += `┃ • \`${prefix}mododivulgacao link <url>\` — Define o link oficial\n`;
        doc += `┃ • \`${prefix}mododivulgacao msg <texto>\` — Mensagem personalizada\n`;
        doc += `┃ • \`${prefix}mododivulgacao pv on / off\` — Liga/Desliga aviso no PV\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};
