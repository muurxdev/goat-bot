/**
 * Comando .desmutartodos
 * Destranca o chat permitindo o envio de mensagens por todos os membros
 */

const F = require("../../utils/formato");
const logger = require("../../core/logger");

module.exports = {
    name: "desmutartodos",
    aliases: ["destrancarchat","abrirtodos","liberargrupo","cmd_desmutartodos","alt_desmutartodos","atalho_desmutartodos","abrev_desmutartodos","call_desmutartodos","func_desmutartodos"],
    category: "admin",
    subcategory: "Moderação",
    description: "Destranca o chat para todos os membros voltarem a mandar mensagens",
    examples: [" — abre o chat para todos"],
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, client, reply, prefix = "." }) => {
        try {
            await client.groupSettingUpdate(from, "not_announcement");
            return reply(F.tela({
                emoji: "🔓", titulo: "Chat aberto", prefix,
                intro: "Pronto: todos os membros podem mandar mensagens de novo.",
                dica: "Quem estiver silenciado individualmente continua sem voz até o prazo acabar.",
                proximos: [
                    { nome: "mutados", oque: "vê quem ainda está silenciado" },
                    { nome: "msgabertura", oque: "avisa o grupo" }
                ]
            }));
        } catch (e) {
            logger.warn(`[DESMUTARTODOS] Falha ao abrir grupo ${from}: ${e.message}`);
            return reply(F.tela({
                emoji: "❌", titulo: "Não consegui destrancar o chat", prefix,
                intro: "O WhatsApp recusou o pedido. Confira se eu ainda sou administrador do grupo e tente de novo.",
                proximos: [{ nome: "admins", oque: "vê se estou entre os administradores" }]
            }));
        }
    }
};
