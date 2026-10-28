/**
 * Comando .pesadelo (Modo Pesadelo do Purgatório)
 * Batalha de dificuldade Extrema contra entidades do Purgatório com 3x multiplicador de recompensas
 */

const dataService = require('../../services/dataService');
const { initializeUser, adicionarXp } = require('../../services/xpService');
const { calculateFullCharacterStats } = require('../../services/characterEngine');
const { getBotName } = require('../../config/botConfig');

const NIGHTMARE_BOSSES = [
    { name: "🌑 Sombra de Sombra", minLevel: 10, hp: 12000, atk: 450, xp: 3500, coins: 2500, drop: "🔮 Fragmento de Trevas Puras" },
    { name: "🔥 Besta Indura do Purgatório", minLevel: 25, hp: 35000, atk: 900, xp: 8500, coins: 6000, drop: "🩸 Sangue de Indura Ancestral" },
    { name: "👑 Avatar do Rei Demônio", minLevel: 50, hp: 90000, atk: 2200, xp: 25000, coins: 18000, drop: "👑 Coroa das Trevas Eternas" }
];

module.exports = {
    name: 'pesadelo',
    aliases: ['nightmare', 'purgatorio', 'modopesadelo'],
    category: 'rpg',
    description: 'Modo extremo de combate contra horrores do Purgatório com multiplicador de recompensas 3x',
    cooldownMs: 15000,
    execute: async ({ sender, args, reply }) => {
        const botName = getBotName();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);
        const stats = calculateFullCharacterStats(user);

        const sub = (args[0] || '').toLowerCase();

        if (sub === 'info' || sub === 'regras' || (!sub && user.level < 10)) {
            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🌑 *MODO PESADELO DO PURGATÓRIO* 🌑\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `⚠️ *AVISO:* O Modo Pesadelo é uma arena de alta dificuldade recomendada para guerreiros experientes (Nível 10+).\n\n`;
            doc += `╭━〔 📜 REGRAS DO PESADELO 〕━⬣\n`;
            doc += `┃ ⚔️ Inimigos possuem 3x mais vida e ataque.\n`;
            doc += `┃ 🎁 Vitórias concedem 3x mais XP, Coins e Drops Míticos.\n`;
            doc += `┃ 💀 Em caso de derrota, você perde 50% do seu HP atual.\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `╭━〔 👹 CHEFES DO PESADELO 〕━⬣\n`;
            NIGHTMARE_BOSSES.forEach((b, i) => {
                doc += `┃ ${i + 1}. *${b.name}* (Nível Mínimo: ${b.minLevel})\n`;
                doc += `┃    ❤️ HP: ${b.hp.toLocaleString('pt-BR')} | 💥 Recompensa: +${b.xp.toLocaleString('pt-BR')} XP\n`;
            });
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `💡 _Para entrar na batalha agora:_ \`.pesadelo entrar\`\n`;
            doc += `👑 *${botName}*`;
            return reply(doc.trim(), [sender]);
        }

        // Batalha Pesadelo
        const available = NIGHTMARE_BOSSES.filter(b => (user.level || 1) >= b.minLevel);
        const boss = available[available.length - 1] || NIGHTMARE_BOSSES[0];

        // Simulação de combate por turnos
        let playerHp = user.hp || stats.hpMax;
        let bossHp = boss.hp;
        let turnos = 0;
        let danoTotalPlayer = 0;
        let danoTotalBoss = 0;

        while (playerHp > 0 && bossHp > 0 && turnos < 6) {
            turnos++;
            // Ataque do jogador com crítico
            const isCrit = Math.random() < (stats.crit / 100);
            const playerDmg = Math.floor(stats.atk * (isCrit ? 2.0 : 1.0) * (0.9 + Math.random() * 0.3));
            bossHp -= playerDmg;
            danoTotalPlayer += playerDmg;

            if (bossHp <= 0) break;

            // Contra-ataque do boss mitigado pela defesa
            const bossDmg = Math.max(20, Math.floor(boss.atk * (1 - (stats.def / (stats.def + 400)))));
            playerHp -= bossDmg;
            danoTotalBoss += bossDmg;
        }

        const venceu = bossHp <= 0;
        user.hp = Math.max(1, playerHp);

        if (!venceu) {
            await dataService.saveXpData(xpData);
            let failDoc = `╔══════════════════════════════╗\n`;
            failDoc += `║   💀 *DERROTADO NO PESADELO* 💀\n`;
            failDoc += `╚══════════════════════════════╝\n\n`;
            failDoc += `👹 *Oponente:* ${boss.name}\n`;
            failDoc += `💥 *Dano Causado:* -${danoTotalPlayer.toLocaleString('pt-BR')} HP\n`;
            failDoc += `💔 *Dano Sofrido:* -${danoTotalBoss.toLocaleString('pt-BR')} HP (Seu HP restante: ${user.hp}/${stats.hpMax})\n\n`;
            failDoc += `💡 _Fortaleça seus equipamentos com \`.forjar\` e tome poções com \`.curar-max\` antes de tentar novamente._\n`;
            failDoc += `👑 *${botName}*`;
            return reply(failDoc.trim(), [sender]);
        }

        // Vitória Épica 3x
        const { xpGanho, lvlRes } = adicionarXp(user, boss.xp, { source: 'rpg' });
        user.coins = (user.coins || 0) + boss.coins;
        if (!Array.isArray(user.inventario)) user.inventario = [];
        if (user.inventario.length < (user.mochila || 20)) {
            user.inventario.push(boss.drop);
        }
        await dataService.saveXpData(xpData);

        let winDoc = `╔══════════════════════════════╗\n`;
        winDoc += `║   🏆 *PESADELO CONQUISTADO!* 🏆\n`;
        winDoc += `╚══════════════════════════════╝\n\n`;
        winDoc += `👤 *Campeão:* @${sender.split('@')[0]}\n`;
        winDoc += `👹 *Chefe Eliminado:* ${boss.name}\n`;
        winDoc += `💥 *Dano Desferido:* -${danoTotalPlayer.toLocaleString('pt-BR')} HP em ${turnos} turnos\n\n`;
        winDoc += `╭━〔 🎁 RECOMPENSAS TRIPLAS (3x) 〕━⬣\n`;
        winDoc += `┃ ⭐ *XP Ganho:* +${xpGanho.toLocaleString('pt-BR')} XP\n`;
        if (lvlRes.subiu) winDoc += `┃ 🆙 *Subiu de nível!* Agora nível ${user.level}\n`;
        winDoc += `┃ 💰 *Coins Coletados:* +${boss.coins.toLocaleString('pt-BR')} Coins\n`;
        winDoc += `┃ 🔮 *Drop Raro do Purgatório:* ${boss.drop}\n`;
        winDoc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
        winDoc += `👑 *${botName}*`;
        return reply(winDoc.trim(), [sender]);
    }
};
