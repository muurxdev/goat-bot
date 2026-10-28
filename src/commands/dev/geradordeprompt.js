/**
 * Comando .geradordeprompt — Gera estrutura de prompt avançado para IAs: .geradordeprompt <objetivo>
 */
module.exports = {
    name: "geradordeprompt",
    aliases: ["geradordeprompt-cmd","cmd-geradordeprompt","cmd_geradordeprompt","alt_geradordeprompt","atalho_geradordeprompt","abrev_geradordeprompt","call_geradordeprompt","func_geradordeprompt"],
    category: "dev",
    subcategory: "IA",
    description: "Gera estrutura de prompt avançado para IAs: .geradordeprompt <objetivo>",
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
            const obj = args.join(" ") || "criar uma estratégia de marketing";
            return reply(`🤖📝 *ESTRUTURA DE PROMPT OTIMIZADA*\n\n\`\`\`\n[Papel]: Você é um especialista sênior na área.\n[Contexto]: Preciso de uma solução robusta e detalhada.\n[Objetivo]: ${obj}.\n[Instruções]: Seja conciso, inclua exemplos práticos e liste passos acionáveis.\n[Formato]: Resposta estruturada em tópicos com marcadores.\n\`\`\``);
        }
};
