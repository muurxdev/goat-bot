/**
 * Comando .mandamentocastidade — Testa o Mandamento da Castidade (Feiticeira): .mandamentocastidade
 */
module.exports = {
    name: "mandamentocastidade",
    aliases: ["mandamentocastidade-cmd","cmd-mandamentocastidade"],
    category: "rpg",
    subcategory: "Mandamentos",
    description: "Testa o Mandamento da Castidade (Feiticeira): .mandamentocastidade",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
            return reply(`🥊 *MANDAMENTO DA CASTIDADE (Feiticeira)*\n\n▫️ Pureza em ação e retidão corporal. Aquele que sucumbir a impulsos impuros é atingido por enfermidades fulminantes.`);
        }
};
