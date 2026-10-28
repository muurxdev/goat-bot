/**
 * Comando .calorias — Estimativa de Taxa Metabólica Basal: .calorias <peso> <altura_cm> <idade> <m/f>
 */
module.exports = {
    name: "calorias",
    aliases: ["calorias-cmd","cmd-calorias"],
    category: "general",
    subcategory: "Saúde",
    description: "Estimativa de Taxa Metabólica Basal: .calorias <peso> <altura_cm> <idade> <m/f>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            if (args.length < 4) return reply("🔥 *Cálculo de TMB (Harris-Benedict)*\nUso: `.calorias <peso_kg> <altura_cm> <idade> <m|f>`\nEx: `.calorias 70 175 25 m`");
            const p = parseFloat(args[0]), h = parseFloat(args[1]), idade = parseInt(args[2]), sexo = (args[3] || "").toLowerCase();
            if (isNaN(p) || isNaN(h) || isNaN(idade)) return reply("❌ Dados inválidos.");
            let tmb = 0;
            if (sexo === 'm') tmb = 88.36 + (13.4 * p) + (4.8 * h) - (5.7 * idade);
            else tmb = 447.6 + (9.2 * p) + (3.1 * h) - (4.3 * idade);
            return reply(`🔥 *Gasto Calórico Basal Estimado:*\n▫️ TMB: *${Math.round(tmb)} kcal/dia*\nPara manter peso com atividade moderada: *${Math.round(tmb * 1.55)} kcal/dia*`);
        }
};
