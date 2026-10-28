/**
 * Comando .calcimc — Calcula o Índice de Massa Corporal: .calcimc <peso> <altura>
 */
module.exports = {
    name: "calcimc",
    aliases: ["calcimc-cmd","cmd-calcimc"],
    category: "general",
    subcategory: "Saúde",
    description: "Calcula o Índice de Massa Corporal: .calcimc <peso> <altura>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            if (args.length < 2) return reply("⚖️ *Calculadora de IMC*\nUso: `.calcimc <peso_em_kg> <altura_em_metros>`\nEx: `.calcimc 75 1.75`");
            const peso = parseFloat(args[0]), altura = parseFloat(args[1]);
            if (isNaN(peso) || isNaN(altura) || peso <= 0 || altura <= 0) return reply("❌ Informe valores válidos de peso e altura.");
            const imc = peso / (altura * altura);
            let cat = "";
            if (imc < 18.5) cat = "Abaixo do peso";
            else if (imc < 24.9) cat = "Peso ideal (Normal)";
            else if (imc < 29.9) cat = "Sobrepeso";
            else if (imc < 34.9) cat = "Obesidade Grau I";
            else if (imc < 39.9) cat = "Obesidade Grau II";
            else cat = "Obesidade Grau III (Mórbida)";
            return reply(`⚖️ *IMC:* *${imc.toFixed(1)}*\nClassificação: *${cat}*`);
        }
};
