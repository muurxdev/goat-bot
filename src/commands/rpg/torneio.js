const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .torneio / .campeonato / .torre
 * Festival de Luta de Torre: Torneio eliminatório com chave de lutas, inscrições e premiação
 */

const { getBotName } = require("../../config/botConfig");
const dataService = require("../../services/dataService");
const { initializeUser, adicionarXp } = require("../../services/xpService");

let activeTournament = null;

module.exports = {
    name: "torneio",
    aliases: ["campeonato", "torneioluta", "torre", "festivaldeluta"],
    category: "rpg",
    description: "Festival de Luta de Torre: torneio eliminatório PvP com premiação em moedas e glória",
    groupOnly: true,
    cooldownMs: 3000,
    execute: async ({ from, sender, args, reply, mentionedJid }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        const sub = (args[0] || "").toLowerCase().trim();

        // 1. INICIAR REGISTRO DO TORNEIO
        if (sub === "criar" || sub === "iniciar" || sub === "novo") {
            if (activeTournament && activeTournament.group === from && activeTournament.status === "open") {
                return reply(`⚠️ Já existe um torneio com inscrições abertas neste grupo!\nDigite \`.torneio entrar\` para participar.`);
            }

            activeTournament = {
                group: from,
                criador: sender,
                status: "open",
                participantes: [sender],
                premio: 50000,
                inicio: Date.now()
            };

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🏆 *FESTIVAL DE LUTA DE TORRE* 🏆   \n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `⚔️ *As trombetas ecoaram! Um grande torneio de artes marciais foi anunciado!*\n\n`;
            doc += `╭━〔 📜 REGRAS DO FESTIVAL 〕━⬣\n`;
            doc += `┃ 💰 *Premiação do Campeão:* **50.000 Coins** + Título de Campeão\n`;
            doc += `┃ 👥 *Mínimo de Lutadores:* 2 Guerreiros (Máx: 8)\n`;
            doc += `┃ 🥊 *Como Participar:* Digite \`.torneio entrar\`\n`;
            doc += `┃ ⚡ *Iniciar Lutas:* O criador pode digitar \`.torneio lutar\`\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), [sender]);
        }

        // 2. ENTRAR NO TORNEIO
        if (sub === "entrar" || sub === "inscrever" || sub === "join") {
            if (!activeTournament || activeTournament.group !== from || activeTournament.status !== "open") {
                return reply(`❌ Não há nenhum torneio com inscrições abertas no momento.\nUse \`.torneio criar\` para abrir um torneio!`);
            }

            if (activeTournament.participantes.includes(sender)) {
                return reply(`⚠️ Você já está inscrito na chave do torneio!`);
            }

            if (activeTournament.participantes.length >= 8) {
                return reply(`🚫 A chave do torneio atingiu o limite de 8 lutadores!`);
            }

            activeTournament.participantes.push(sender);

            return reply(`🥊 *INSCRIÇÃO CONFIRMADA!*\n\n${nomeDoMembro(sender)} subiu ao ringue!\n👥 *Total de Lutadores Inscritos:* ${activeTournament.participantes.length} / 8\n💡 Digite \`.torneio lutar\` quando todos estiverem prontos!`, [sender]);
        }

        // 3. EXECUTAR LUTAS
        if (sub === "lutar" || sub === "comecar" || sub === "start") {
            if (!activeTournament || activeTournament.group !== from) {
                return reply(`❌ Nenhum torneio aberto neste grupo. Crie um com \`.torneio criar\`.`);
            }

            if (activeTournament.participantes.length < 2) {
                return reply(`⚠️ São necessários pelo menos 2 lutadores para dar início ao torneio (Atuais: ${activeTournament.participantes.length}).`);
            }

            const parts = [...activeTournament.participantes];
            const campeaoJid = parts[Math.floor(Math.random() * parts.length)];
            const viceJid = parts.find(p => p !== campeaoJid) || parts[0];

            const campeaoUser = initializeUser(campeaoJid, xpData);
            campeaoUser.coins = (campeaoUser.coins || 0) + 50000;
            const { xpGanho, lvlRes } = adicionarXp(campeaoUser, 15000, { source: "rpg" });
            await dataService.saveXpData(xpData);

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🏆 *GRANDE FINAL DE TORRE!* 🏆   \n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `💥 *Após combates brutais nas semifinais e uma final inesquecível...*\n\n`;
            doc += `🥇 *GRANDE CAMPEÃO:* ${nomeDoMembro(campeaoJid)} 👑\n`;
            doc += `🥈 *Vice-Campeão:* ${nomeDoMembro(viceJid)}\n\n`;
            doc += `╭━〔 🎁 PREMIAÇÃO CONCEDIDA 〕━⬣\n`;
            doc += `┃ 💰 *Prêmio Máximo:* +50.000 Coins\n`;
            doc += `┃ ⭐ *Experiência de Mestre:* +${xpGanho.toLocaleString("pt-BR")} XP\n`;
            if (lvlRes.subiu) doc += `┃ 🆙 *Subiu de nível!* Agora nível ${campeaoUser.level}\n`;
            doc += `┃ 📜 *Título:* "🏆 Campeão de Torre"\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `👑 *${botName}*`;

            activeTournament = null; // Reseta torneio

            return reply(doc.trim(), [campeaoJid, viceJid]);
        }

        // 4. GUIA DO TORNEIO
        let doc = `╔══════════════════════════════╗\n`;
        doc += `║   🏆 *FESTIVAL DE LUTA DE TORRE* 🏆   \n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `╭━〔 📜 COMANDOS DO TORNEIO 〕━⬣\n`;
        doc += `┃ • \`.torneio criar\` ➔ Abrir inscrições para o torneio\n`;
        doc += `┃ • \`.torneio entrar\` ➔ Inscrever-se na chave de lutas\n`;
        doc += `┃ • \`.torneio lutar\` ➔ Iniciar os confrontos e coroar o campeão\n`;
        doc += `┃ • \`.torneio status\` ➔ Ver lutadores inscritos\n`;
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        doc += `👑 *${botName}*`;

        return reply(doc.trim(), [sender]);
    }
};
