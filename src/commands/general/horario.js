/**
 * Comando .horario / .hora / .time / .fusohorario
 * Relógio mundial em tempo real com conversão de fusos horários e pesquisa de países/cidades
 */

const { getBotName } = require("../../config/botConfig");

const TIMEZONES = [
    { country: "Brasil (Brasília/SP)", flag: "🇧🇷", zone: "America/Sao_Paulo", tag: "brasil sp brasilia rio" },
    { country: "Brasil (Manaus/Amazonas)", flag: "🇧🇷", zone: "America/Manaus", tag: "manaus amazonas am" },
    { country: "Brasil (Fernando de Noronha)", flag: "🇧🇷", zone: "America/Noronha", tag: "noronha" },
    { country: "Brasil (Acre/Rio Branco)", flag: "🇧🇷", zone: "America/Rio_Branco", tag: "acre rio branco" },
    { country: "Portugal (Lisboa)", flag: "🇵🇹", zone: "Europe/Lisbon", tag: "portugal lisboa porto" },
    { country: "Estados Unidos (Nova York)", flag: "🇺🇸", zone: "America/New_York", tag: "eua_ny new york eua usa" },
    { country: "Estados Unidos (Los Angeles)", flag: "🇺🇸", zone: "America/Los_Angeles", tag: "eua_la los angeles califórnia" },
    { country: "Japão (Tóquio)", flag: "🇯🇵", zone: "Asia/Tokyo", tag: "japao toquio tokyo" },
    { country: "Reino Unido (Londres)", flag: "🇬🇧", zone: "Europe/London", tag: "londres london uk inglaterra" },
    { country: "França (Paris)", flag: "🇫🇷", zone: "Europe/Paris", tag: "franca paris" },
    { country: "Alemanha (Berlim)", flag: "🇩🇪", zone: "Europe/Berlin", tag: "alemanha berlim" },
    { country: "Rússia (Moscou)", flag: "🇷🇺", zone: "Europe/Moscow", tag: "russia moscou moscow" },
    { country: "Emirados Árabes (Dubai)", flag: "🇦🇪", zone: "Asia/Dubai", tag: "dubai uae" },
    { country: "China (Pequim)", flag: "🇨🇳", zone: "Asia/Shanghai", tag: "china pequim beijing" },
    { country: "Austrália (Sydney)", flag: "🇦🇺", zone: "Australia/Sydney", tag: "australia sydney" },
    { country: "Argentina (Buenos Aires)", flag: "🇦🇷", zone: "America/Argentina/Buenos_Aires", tag: "argentina buenos aires" },
    { country: "Espanha (Madri)", flag: "🇪🇸", zone: "Europe/Madrid", tag: "espanha madri madrid" },
    { country: "Itália (Roma)", flag: "🇮🇹", zone: "Europe/Rome", tag: "italia roma" },
    { country: "Canadá (Toronto)", flag: "🇨🇦", zone: "America/Toronto", tag: "canada toronto" }
];

function getUtcOffset(zone) {
    try {
        const now = new Date();
        const str = now.toLocaleDateString("en-US", { timeZone: zone, timeZoneName: "shortOffset" });
        const match = str.match(/GMT([+-]\d+(:?\d+)?)/);
        return match ? `UTC${match[1]}` : "UTC";
    } catch (_) {
        return "UTC";
    }
}

function getTimeForZone(zone) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("pt-BR", { timeZone: zone, hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const dateStr = now.toLocaleDateString("pt-BR", { timeZone: zone, day: "2-digit", month: "2-digit", year: "numeric" });
    const hour = parseInt(timeStr.split(":")[0], 10);
    const isDay = hour >= 6 && hour < 18;
    const icon = isDay ? "☀️" : "🌙";
    const offset = getUtcOffset(zone);
    return { timeStr, dateStr, icon, offset };
}

module.exports = {
    name: "horario",
    aliases: ["hora", "time", "worldtime", "fusohorario", "relogio", "fuso"],
    category: "general",
    description: "Exibe o relógio mundial em tempo real e o horário oficial de países e cidades",
    cooldownMs: 2000,
    execute: async ({ reply, text }) => {
        const botName = getBotName();
        const query = (text || "").toLowerCase().trim()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        if (query) {
            const found = TIMEZONES.find(t =>
                t.country.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(query) ||
                t.tag.includes(query) ||
                t.zone.toLowerCase().includes(query)
            );

            if (found) {
                const info = getTimeForZone(found.zone);
                let doc = "╔══════════════════════════════╗\n";
                doc += "║    ⏰ *FUSO HORÁRIO OFICIAL* ⏰    ║\n";
                doc += "╚══════════════════════════════╝\n\n";
                doc += "📍 *Localidade:* " + found.flag + " *" + found.country + "*\n\n";
                doc += "╭━〔 🕒 INFORMAÇÕES DE HORÁRIO 〕━⬣\n";
                doc += "┃ ⏰ *Hora Atual:* *" + info.timeStr + "* " + info.icon + "\n";
                doc += "┃ 📅 *Data Local:* *" + info.dateStr + "*\n";
                doc += "┃ 🌐 *Fuso (IANA):* \`" + found.zone + "\` (" + info.offset + ")\n";
                doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";
                doc += "👑 *" + botName + "*";
                return reply(doc.trim());
            }

            // Tenta consultar dinamicamente fuso IANA digitado diretamente (ex: America/Belem)
            try {
                const info = getTimeForZone(query);
                let doc = "╔══════════════════════════════╗\n";
                doc += "║    ⏰ *FUSO HORÁRIO OFICIAL* ⏰    ║\n";
                doc += "╚══════════════════════════════╝\n\n";
                doc += "📍 *Fuso Consultado:* \`" + query + "\`\n\n";
                doc += "╭━〔 🕒 INFORMAÇÕES DE HORÁRIO 〕━⬣\n";
                doc += "┃ ⏰ *Hora Atual:* *" + info.timeStr + "* " + info.icon + "\n";
                doc += "┃ 📅 *Data Local:* *" + info.dateStr + "*\n";
                doc += "┃ 🌐 *Deslocamento:* \`" + info.offset + "\`\n";
                doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";
                doc += "👑 *" + botName + "*";
                return reply(doc.trim());
            } catch (_) {
                // Não é fuso IANA válido, segue para relógio geral
            }
        }

        // Relógio Mundial Geral
        let doc = "╔══════════════════════════════╗\n";
        doc += "║    🌍 *RELÓGIO MUNDIAL* 🌍    ║\n";
        doc += "╚══════════════════════════════╝\n\n";
        doc += "🕒 *Horários oficiais sincronizados em tempo real:*\n\n";

        doc += "╭━〔 🌐 PRINCIPAIS PAÍSES & CIDADES 〕━⬣\n";
        for (const tz of TIMEZONES) {
            const info = getTimeForZone(tz.zone);
            doc += "┃ " + tz.flag + " *" + tz.country + ":* \`" + info.timeStr + "\` (" + info.offset + ") " + info.icon + "\n";
        }
        doc += "╰━━━━━━━━━━━━━━━━━━⬣\n\n";

        doc += "💡 *Dica:* Digite \`.horario <país ou cidade>\` para consultar uma região específica.\n\n";
        doc += "👑 *" + botName + "*";

        return reply(doc.trim());
    }
};
