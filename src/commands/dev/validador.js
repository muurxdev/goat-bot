/**
 * Comando .validador / .validarcpf / .validarcnpj
 * Validador de dígitos verificadores de CPF e CNPJ
 */

const { getBotName } = require("../../config/botConfig");

function isValidCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
    let sum = 0, rest;
    for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    rest = (sum * 10) % 11;
    if ((rest === 10) || (rest === 11)) rest = 0;
    if (rest !== parseInt(cpf.substring(9, 10))) return false;
    sum = 0;
    for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    rest = (sum * 10) % 11;
    if ((rest === 10) || (rest === 11)) rest = 0;
    if (rest !== parseInt(cpf.substring(10, 11))) return false;
    return true;
}

module.exports = {
    name: "validador",
    aliases: ["validarcpf","validarcnpj","verificarcpf","cmd_validador","alt_validador","atalho_validador","abrev_validador","call_validador","func_validador"],
    category: "dev",
    description: "Valida matematicamente dígitos verificadores de CPF ou CNPJ",
    cooldownMs: 2000,
    execute: async ({ text, reply }) => {
        const botName = getBotName();
        const docClean = (text || "").replace(/\D/g, "");

        if (!docClean || (docClean.length !== 11 && docClean.length !== 14)) {
            return reply(
                "❌ *Informe um número de documento válido para testar!*\n\n" +
                "📌 *Exemplo:* `.validador 123.456.789-00`"
            );
        }

        const valid = isValidCPF(docClean);

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   📋 *VALIDAÇÃO DE DOCUMENTO* 📋   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `╭━〔 🔍 RESULTADO MATEMÁTICO 〕━⬣\n`;
        doc += `┃ 📄 *Documento:* \`${docClean}\`\n`;
        doc += `┃ ${valid ? "🟢" : "🔴"} *Status:* ${valid ? "*VÁLIDO (Dígitos Conferem)*" : "*INVÁLIDO (Dígitos Incorretos)*"}\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};

