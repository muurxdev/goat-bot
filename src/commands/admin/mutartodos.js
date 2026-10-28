/**
 * Comando .mutartodos
 * Tranca o grupo imediatamente permitindo apenas mensagens de administradores
 */

const F = require("../../utils/formato");
const logger = require("../../core/logger");

module.exports = {
    name: "mutartodos",
    aliases: ["trancarchat","fechartodos","silenciargrupo","cmd_mutartodos","alt_mutartodos","atalho_mutartodos","abrev_mutartodos","call_mutartodos","func_mutartodos"],
    category: "admin",
    subcategory: "Moderação",
    description: "Tranca o chat na hora: só a administração consegue mandar mensagens",
    examples: [" — fecha o chat para os membros"],
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, client, reply, prefix = "." }) => {
        try {
            await client.groupSettingUpdate(from, "announcement");
            return reply(F.tela({
                emoji: "🔒", titulo: "Chat fechado", prefix,
                intro: "Pronto: agora só a administração consegue mandar mensagens no grupo.",
                dica: "Para fechar por um tempo e reabrir sozinho, use " + F.cmd(prefix, "fechargrupo", "1h") + ".",
                proximos: [
                    { nome: "desmutartodos", oque: "abre o chat de novo" },
                    { nome: "msgfechamento", oque: "avisa o grupo" }
                ]
            }));
        } catch (e) {
            logger.warn(`[MUTARTODOS] Falha ao fechar grupo ${from}: ${e.message}`);
            return reply(F.tela({
                emoji: "❌", titulo: "Não consegui trancar o chat", prefix,
                intro: "O WhatsApp recusou o pedido. Confira se eu ainda sou administrador do grupo e tente de novo.",
                proximos: [{ nome: "admins", oque: "vê se estou entre os administradores" }]
            }));
        }
    }
};
