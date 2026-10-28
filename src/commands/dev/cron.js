/**
 * Comando .cron / .cronjob / .explicarcron
 * Decodificador e explicador de expressões Cron para desenvolvedores
 */

const { renderCard } = require("../../utils/uiEngine");

module.exports = {
    name: "cron",
    aliases: ["cronjob","explicarcron","crontab","expressaocron","cmd_cron","alt_cron","atalho_cron","abrev_cron","call_cron","func_cron"],
    category: "dev",
    description: "Decodifica e explica expressões Cron (ex: */5 * * * *) em português claro",
    cooldownMs: 2000,
    execute: async ({ sender, reply, args }) => {
        const expression = args.join(" ").trim();

        if (!expression) {
            return reply("❌ Informe uma expressão cron de 5 campos.\n\n👉 *Exemplo:* `.cron */15 * * * *` ou `.cron 0 9 * * 1-5`");
        }

        const parts = expression.split(/\s+/);
        if (parts.length < 5) {
            return reply("❌ Uma expressão cron válida deve conter 5 campos: `minuto hora dia mês dia-da-semana`.");
        }

        let explicacao = "Executa ";
        const [min, hora, dia, mes, dow] = parts;

        if (min.startsWith("*/")) explicacao += `a cada ${min.slice(2)} minutos `;
        else if (min === "*") explicacao += "a cada minuto ";
        else explicacao += `no minuto ${min} `;

        if (hora.startsWith("*/")) explicacao += `a cada ${hora.slice(2)} horas `;
        else if (hora !== "*") explicacao += `às ${hora}h `;

        if (dia !== "*") explicacao += `no dia ${dia} do mês `;
        if (dow !== "*") explicacao += `nos dias da semana (${dow})`;

        const card = renderCard({
            title: "DECODIFICADOR CRON EXPRESSION",
            icon: "⏱️",
            subtitle: `👨‍💻 *Expressão:* \`${expression}\``,
            sections: [
                {
                    title: "SIGNIFICADO & PERIODICIDADE",
                    icon: "📜",
                    fields: [
                        { label: "Tradução em Português", value: explicacao.trim(), icon: "💡" },
                        { label: "Estrutura dos 5 Campos", value: `Minuto: \`${min}\` | Hora: \`${hora}\` | Dia: \`${dia}\` | Mês: \`${mes}\` | Semana: \`${dow}\``, icon: "🔢" }
                    ]
                }
            ],
            tip: "Use expressões cron para automatizar backups e tarefas no servidor!",
            mentions: [sender]
        });

        return reply(card, [sender]);
    }
};

