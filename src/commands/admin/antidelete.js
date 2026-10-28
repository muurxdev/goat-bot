/**
 * Comando .antidelete
 * Ativa ou desativa a detecção de mensagens apagadas no grupo
 */

const dataService = require("../../services/dataService");
const { getBotName } = require("../../config/botConfig");
const logger = require("../../core/logger");
const F = require("../../utils/formato");

module.exports = {
    name: "antidelete",
    aliases: ["verapagadas","msgdeletadas","auditapagar","cmd_antidelete","alt_antidelete","atalho_antidelete","abrev_antidelete","call_antidelete","func_antidelete"],
    category: "admin",
    description: "Ativa ou desativa a detecção e alerta de mensagens apagadas no grupo",
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, args = [], reply, sender, prefix = "." }) => {
        const botName = getBotName();
        const configs = dataService.getConfigsData();
        if (!configs[from]) configs[from] = {};

        const opt = (args[0] || "").toLowerCase().trim();
        const isEnable = ["on", "1", "ativar", "sim", "ligar"].includes(opt);
        const isDisable = ["off", "0", "desativar", "nao", "desligar"].includes(opt);

        if (isEnable) {
            configs[from].antidelete = true;
            await dataService.saveConfigsData(configs);
            logger.info(`[ANTIDELETE] Ativado em ${from} por ${sender}`);
            return reply(
                `🗑️ *ANTI-DELETE: ATIVADO!*\n\n` +
                `A partir de agora, quando um participante apagar uma mensagem para todos no grupo, o bot alertará a administração com o autor e conteúdo original.`
            );
        }

        if (isDisable) {
            configs[from].antidelete = false;
            await dataService.saveConfigsData(configs);
            logger.info(`[ANTIDELETE] Desativado em ${from} por ${sender}`);
            return reply(
                `🗑️ *ANTI-DELETE: DESATIVADO!*\n\n` +
                `O monitoramento de mensagens apagadas foi desativado no grupo.`
            );
        }

        const isAtivo = Boolean(configs[from].antidelete);
        return reply(F.tela({
            emoji: "🗑️",
            titulo: "Módulo Anti-Delete",
            intro: `O monitoramento de mensagens apagadas está *${isAtivo ? "🟢 ATIVADO" : "🔴 DESATIVADO"}* neste grupo.\n\n` +
                   `Quando ativado, caso alguém delete uma mensagem, o bot identifica o autor e recupera o texto deletado para auditoria.`,
            secoes: [
                {
                    emoji: "⚙️",
                    titulo: "Como Configurar",
                    linhas: [
                        `• \`${prefix}antidelete on\` — Ativar detecção`,
                        `• \`${prefix}antidelete off\` — Desativar detecção`,
                        `• \`${prefix}config antidelete <on|off>\` — Configurar pelo painel`
                    ]
                }
            ],
            dica: `Administradores do grupo têm controle total sobre as proteções.`,
            prefix
        }));
    }
};
