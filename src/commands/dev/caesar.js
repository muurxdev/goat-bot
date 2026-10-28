/**
 * Comando .caesar — Cifra de César com deslocamento configurável (ex: .caesar 3 texto)
 */
module.exports = {
    name: "caesar",
    aliases: ["cifradecesar","cmd_caesar","alt_caesar","atalho_caesar","abrev_caesar","call_caesar","func_caesar"],
    category: "dev",
    subcategory: "Ferramentas Dev",
    description: "Cifra de César com deslocamento configurável (ex: .caesar 3 texto)",
    cooldownMs: 1500,
    execute: async ({ text, args, reply }) => {
            if (!text) return reply('📌 Uso: `.caesar <deslocamento> <texto>`\nExemplo: `.caesar 3 Olá mundo`');
            const shift = parseInt(args[0], 10);
            if (isNaN(shift)) return reply('❌ O deslocamento deve ser um número inteiro (positivo ou negativo).');
            const message = args.slice(1).join(' ');
            if (!message) return reply('❌ Informe a mensagem a ser cifrada.');
            const normShift = ((shift % 26) + 26) % 26;
            const out = message.replace(/[a-zA-Z]/g, c => {
                const base = c <= 'Z' ? 65 : 97;
                return String.fromCharCode(((c.charCodeAt(0) - base + normShift) % 26) + base);
            });
            return reply(`🏛️ *CIFRA DE CÉSAR (Deslocamento: ${shift})*\n\n${out}`);
        }
};
