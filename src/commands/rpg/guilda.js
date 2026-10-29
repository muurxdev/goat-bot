const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .guilda / .cla / .clan
 * Sistema completo de Guildas com convites pelo líder, expulsão, listagem de todas as guildas e membros
 */

const dataService = require('../../services/dataService');
const { initializeUser } = require('../../services/xpService');
const { getBotName } = require('../../config/botConfig');
const logger = require('../../core/logger');

module.exports = {
    name: 'guilda',
    aliases: ['cla', 'clan', 'guild', 'guildas'],
    category: 'rpg',
    description: 'Sistema completo de guildas: criar, convidar membros, aceitar convites, expulsar e listar guildas',
    cooldownMs: 2500,
    execute: async ({ args, sender, reply, mentionedJid, from }) => {
        const botName = getBotName();
        const guilds = dataService.getGuildData();
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);

        const acao = (args[0] || '').toLowerCase().trim();
        const nomeOuAlvo = args.slice(1).join(' ').trim();

        // 1. MENU PRINCIPAL DE AJUDA
        if (!acao || acao === 'ajuda' || acao === 'help') {
            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🏰 *SISTEMA DE GUILDAS & CLÃS* 🏰   \n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `╭━〔 📜 COMANDOS DISPONÍVEIS 〕━⬣\n`;
            doc += `┃ • \`.guilda criar [nome]\` ➔ Criar uma nova guilda (500 coins)\n`;
            doc += `┃ • \`.guilda convidar @user\` ➔ Líder convida um guerreiro\n`;
            doc += `┃ • \`.guilda aceitar [nome]\` ➔ Aceitar convite de guilda\n`;
            doc += `┃ • \`.guilda recusar\` ➔ Recusar convite pendente\n`;
            doc += `┃ • \`.guilda expulsar @user\` ➔ Líder remove um membro\n`;
            doc += `┃ • \`.guilda sair\` ➔ Sair da sua guilda atual\n`;
            doc += `┃ • \`.guilda info [nome]\` ➔ Ver detalhes e lista de membros\n`;
            doc += `┃ • \`.guilda lista\` ➔ Listar todas as guildas e seus membros\n`;
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `👑 *${botName}*`;
            return reply(doc.trim(), [sender]);
        }

        // 2. LISTAR TODAS AS GUILDAS E SEUS MEMBROS
        if (acao === 'lista' || acao === 'todas' || acao === 'ranks') {
            const guildNames = Object.keys(guilds);
            if (guildNames.length === 0) {
                return reply(`🏰 *Nenhuma guilda foi fundada ainda!*\n\n💡 _Seja o primeiro líder a fundar uma guilda com \`.guilda criar [nome]\`!_`);
            }

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🏰 *CATÁLOGO GERAL DE GUILDAS* 🏰   \n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `📊 *Total de Guildas Ativas:* ${guildNames.length}\n\n`;

            const mentions = [];

            guildNames.forEach((gName, idx) => {
                const g = guilds[gName];
                const liderJid = g.dono || '';
                if (liderJid) mentions.push(liderJid);

                const membrosStr = (g.membros || []).map(m => {
                    mentions.push(m);
                    return `${nomeDoMembro(m)}`;
                }).join(', ');

                doc += `╭━〔 ${idx + 1}. 🛡️ *${gName}* 〕━⬣\n`;
                doc += `┃ 👑 *Líder:* ${nomeDoMembro(liderJid)}\n`;
                doc += `┃ 📈 *Nível:* ${g.level || 1}  |  ⭐ *XP:* ${(g.xp || 0).toLocaleString('pt-BR')}\n`;
                doc += `┃ 👥 *Membros (${(g.membros || []).length}):* ${membrosStr || 'Nenhum'}\n`;
                doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            });

            doc += `👑 *${botName}*`;
            return reply(doc.trim(), mentions);
        }

        // 3. CRIAR GUILDA
        if (acao === 'criar') {
            if (!nomeOuAlvo) return reply('❌ Informe o nome da sua nova guilda. Ex: `.guilda criar Pecados Capitais`');
            if (user.guilda) return reply(`❌ Você já pertence à guilda *${user.guilda}*. Saia dela antes com \`.guilda sair\`.`);
            if (guilds[nomeOuAlvo]) return reply(`❌ Já existe uma guilda registrada com o nome *${nomeOuAlvo}*. Escolha outro nome.`);
            if ((user.coins || 0) < 500) return reply(`❌ Saldo insuficiente: Você precisa de 500 coins para criar uma guilda (Seu saldo: ${(user.coins || 0)} coins).`);

            user.coins -= 500;
            user.guilda = nomeOuAlvo;

            guilds[nomeOuAlvo] = {
                dono: sender,
                membros: [sender],
                convitesPendentes: [],
                level: 1,
                xp: 0,
                coins: 0
            };

            await dataService.saveXpData(xpData);
            await dataService.saveGuildData(guilds);

            let doc = `🏰 *GUILDA FUNDADA COM SUCESSO!*\n\n`;
            doc += `📛 *Nome:* ${nomeOuAlvo}\n`;
            doc += `👑 *Líder Soberano:* ${nomeDoMembro(sender)}\n`;
            doc += `👥 *Membros Iniciais:* 1\n`;
            doc += `💰 *Custo Pago:* 500 coins\n\n`;
            doc += `💡 _Convide membros para o seu clã usando \`.guilda convidar @user\`!_`;

            return reply(doc.trim(), [sender]);
        }

        // 4. CONVIDAR MEMBRO (Apenas Líder)
        if (acao === 'convidar' || acao === 'convite') {
            const minhaGuilda = user.guilda;
            if (!minhaGuilda || !guilds[minhaGuilda]) {
                return reply('❌ Você não pertence a nenhuma guilda.');
            }

            const g = guilds[minhaGuilda];
            if (g.dono !== sender) {
                return reply('⛔ *Permissão Negada:* Apenas o Líder da guilda pode enviar convites para novos membros.');
            }

            const target = (mentionedJid && mentionedJid[0]) || (args[1] ? args[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
            if (!target) {
                return reply('📌 Marque o usuário que deseja convidar: `.guilda convidar @user`');
            }

            if (target === sender) {
                return reply('❌ Você já é o líder da sua guilda.');
            }

            const targetUser = initializeUser(target, xpData);
            if (targetUser.guilda) {
                return reply(`❌ O jogador ${nomeDoMembro(target)} já pertence à guilda *${targetUser.guilda}*!`, [target]);
            }

            if (!Array.isArray(g.convitesPendentes)) g.convitesPendentes = [];
            if (!g.convitesPendentes.includes(target)) {
                g.convitesPendentes.push(target);
            }

            await dataService.saveGuildData(guilds);

            let doc = `📩 *CONVITE DE GUILDA ENVIADO!*\n\n`;
            doc += `🏰 *Guilda:* ${minhaGuilda}\n`;
            doc += `👑 *Líder Remetente:* ${nomeDoMembro(sender)}\n`;
            doc += `👤 *Convidado:* ${nomeDoMembro(target)}\n\n`;
            doc += `💡 _Para aceitar o convite, o jogador ${nomeDoMembro(target)} deve digitar:_ \`.guilda aceitar ${minhaGuilda}\``;

            return reply(doc.trim(), [sender, target]);
        }

        // 5. ACEITAR CONVITE
        if (acao === 'aceitar' || acao === 'entrar') {
            if (user.guilda) {
                return reply(`❌ Você já pertence à guilda *${user.guilda}*. Digite \`.guilda sair\` se desejar trocar de guilda.`);
            }

            let targetGuildName = nomeOuAlvo;
            if (!targetGuildName) {
                // Tenta achar guilda onde o usuário tem convite pendente
                const found = Object.keys(guilds).find(gn => guilds[gn].convitesPendentes && guilds[gn].convitesPendentes.includes(sender));
                if (found) targetGuildName = found;
            }

            if (!targetGuildName || !guilds[targetGuildName]) {
                return reply('❌ Nenhuma guilda especificada ou convite pendente encontrado. Use: `.guilda aceitar <nome_da_guilda>`');
            }

            const g = guilds[targetGuildName];
            if (!g.convitesPendentes || !g.convitesPendentes.includes(sender)) {
                return reply(`⛔ *Sem Convite:* Você não possui um convite pendente do líder da guilda *${targetGuildName}*.\n💡 Solicite ao líder ${nomeDoMembro(g.dono)} para enviar um convite com \`.guilda convidar @seu_usuario\`!`, [g.dono]);
            }

            // Remove convite pendente e adiciona à guilda
            g.convitesPendentes = g.convitesPendentes.filter(c => c !== sender);
            if (!g.membros.includes(sender)) g.membros.push(sender);
            user.guilda = targetGuildName;

            await dataService.saveXpData(xpData);
            await dataService.saveGuildData(guilds);

            let doc = `🎉 *CONVITE ACEITO COM SUCESSO!*\n\n`;
            doc += `🏰 Boas-vindas à guilda *${targetGuildName}*, ${nomeDoMembro(sender)}!\n`;
            doc += `👑 *Líder:* ${nomeDoMembro(g.dono)}\n`;
            doc += `👥 *Total de Membros:* ${g.membros.length}`;

            return reply(doc.trim(), [sender, g.dono]);
        }

        // 6. EXPULSAR MEMBRO (Apenas Líder)
        if (acao === 'expulsar' || acao === 'kick' || acao === 'remover') {
            const minhaGuilda = user.guilda;
            if (!minhaGuilda || !guilds[minhaGuilda]) return reply('❌ Você não pertence a nenhuma guilda.');
            const g = guilds[minhaGuilda];
            if (g.dono !== sender) return reply('⛔ Apenas o Líder da guilda tem autoridade para expulsar membros.');

            const target = (mentionedJid && mentionedJid[0]) || (args[1] ? args[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
            if (!target) return reply('📌 Marque o usuário que deseja expulsar: `.guilda expulsar @user`');
            if (target === sender) return reply('❌ O líder não pode expulsar a si mesmo.');

            if (!g.membros.includes(target)) {
                return reply(`❌ O jogador ${nomeDoMembro(target)} não faz parte da sua guilda.`, [target]);
            }

            g.membros = g.membros.filter(m => m !== target);
            const targetUser = initializeUser(target, xpData);
            delete targetUser.guilda;

            await dataService.saveXpData(xpData);
            await dataService.saveGuildData(guilds);

            return reply(`🚪 *MEMBRO EXPULSO DA GUILDA:*\n\nO jogador ${nomeDoMembro(target)} foi removido da guilda *${minhaGuilda}* pelo líder ${nomeDoMembro(sender)}.`, [target, sender]);
        }

        // 7. SAIR DA GUILDA
        if (acao === 'sair') {
            const minhaGuilda = user.guilda;
            if (!minhaGuilda) return reply('❌ Você não pertence a nenhuma guilda.');
            const g = guilds[minhaGuilda];

            if (g && g.dono === sender) {
                return reply('❌ O líder da guilda não pode sair diretamente. Se você for o único membro, a guilda será desfeita.');
            }

            if (g) {
                g.membros = g.membros.filter(m => m !== sender);
            }
            delete user.guilda;

            await dataService.saveXpData(xpData);
            await dataService.saveGuildData(guilds);

            return reply(`✅ Você saiu da guilda *${minhaGuilda}*.`);
        }

        // 8. INFO DA GUILDA
        if (acao === 'info') {
            const gName = nomeOuAlvo || user.guilda;
            if (!gName || !guilds[gName]) {
                return reply('❌ Nenhuma guilda especificada ou encontrada. Use `.guilda info <nome>` ou `.guilda lista`.');
            }

            const g = guilds[gName];
            const mentions = [g.dono, ...(g.membros || [])];

            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🏰 *DETALHES DA GUILDA* 🏰   \n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `📛 *Nome:* ${gName}\n`;
            doc += `👑 *Líder:* ${nomeDoMembro(g.dono)}\n`;
            doc += `📈 *Nível:* ${g.level || 1}  |  ⭐ *XP Total:* ${(g.xp || 0).toLocaleString('pt-BR')}\n`;
            doc += `💰 *Cofre da Guilda:* ${(g.coins || 0).toLocaleString('pt-BR')} coins\n\n`;

            doc += `╭━〔 👥 MEMBROS REGISTRADOS (${(g.membros || []).length}) 〕━⬣\n`;
            (g.membros || []).forEach((m, idx) => {
                const isLeader = m === g.dono;
                doc += `┃ ${idx + 1}. ${nomeDoMembro(m)} ${isLeader ? '👑 *(Líder)*' : '⚔️ *(Guerreiro)*'}\n`;
            });
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`;
            doc += `👑 *${botName}*`;

            return reply(doc.trim(), mentions);
        }

        return reply('❌ Opção não reconhecida. Digite `.guilda` para ver a lista de comandos.');
    }
};