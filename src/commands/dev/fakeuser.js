/**
 * Comando .fakeuser / .gerarpessoa
 * Gerador de dados fictícios para testes de desenvolvimento (nomes, emails, dados simulados)
 */

const { getBotName } = require("../../config/botConfig");

const FIRST_NAMES = ["Lucas", "Gabriel", "Mateus", "Mariana", "Beatriz", "Larissa", "Felipe", "Thiago", "Camila", "Juliana"];
const LAST_NAMES = ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes"];
const CITIES = ["São Paulo/SP", "Rio de Janeiro/RJ", "Belo Horizonte/MG", "Curitiba/PR", "Salvador/BA", "Fortaleza/CE"];

module.exports = {
    name: "fakeuser",
    aliases: ["gerarpessoa","pessoa-fake","dadosfake","mockuser","cmd_fakeuser","alt_fakeuser","atalho_fakeuser","abrev_fakeuser","call_fakeuser","func_fakeuser"],
    category: "dev",
    description: "Gera perfil fictício completo para testes de software e validação",
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        const botName = getBotName();
        const fn = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
        const ln = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
        const fullName = `${fn} ${ln}`;
        const age = Math.floor(Math.random() * 40 + 18);
        const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${Math.floor(Math.random() * 900 + 100)}@exemplo.com`;
        const city = CITIES[Math.floor(Math.random() * CITIES.length)];
        const phone = `(11) 9${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`;

        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   👤 *DADOS FICTÍCIOS DEV* 👤   ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `╭━〔 🧪 PERFIL SIMULADO 〕━⬣\n`;
        doc += `┃ 👤 *Nome:* ${fullName}\n`;
        doc += `┃ 🎂 *Idade:* ${age} anos\n`;
        doc += `┃ 📧 *E-mail:* ${email}\n`;
        doc += `┃ 📱 *Telefone:* ${phone}\n`;
        doc += `┃ 📍 *Cidade:* ${city}\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `💡 _Dados gerados apenas para testes e desenvolvimento de software._\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim());
    }
};

