/**
 * Comando .votacao / .plebiscito / .enqueterapida
 * Cria uma votação rápida no chat de Sim / Não com contagem automática
 */

const { renderCard } = require("../../utils/uiEngine");

module.exports = {
    name: "votacao",
    aliases: ["plebiscito","enqueterapida","votacaosimnao","cmd_votacao","alt_votacao","atalho_votacao","abrev_votacao","call_votacao","func_votacao"],
    category: "admin",
    description: "Cria uma votação rápida Sim / Não para decisão democrática no grupo",
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 3000,
    execute: async ({ sender, reply, args }) => {
        const tema = args.join(" ").trim();
        if (!tema) {
            return reply("❌ Informe o tema ou pergunta da votação.\n\n👉 *Exemplo:* `.votacao Devemos fechar o grupo às 23h?`");
        }

        const card = renderCard({
            title: "VOTAÇÃO DEMOCRÁTICA DO GRUPO",
            icon: "🗳️",
            subtitle: `📢 *Iniciada por:* @${sender.split("@")[0]}`,
            sections: [
                {
                    title: "PAUTA EM VOTAÇÃO",
                    icon: "❓",
                    fields: [
                        `📌 *"${tema}"*`,
                        "",
                        "🟢 Reaja com 👍 para *SIM*",
                        "🔴 Reaja com 👎 para *NÃO*",
                        "🟡 Reaja com 🤷 para *ABSTENÇÃO*"
                    ]
                }
            ],
            tip: "Todos os membros podem votar reagindo diretamente a esta mensagem!",
            mentions: [sender]
        });

        return reply(card, [sender]);
    }
};

