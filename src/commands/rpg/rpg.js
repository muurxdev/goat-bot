/**
 * Comando .rpg — Universo e Controle do Sistema de RPG (Reino Central)
 * 
 * Permite que o Dono ative/desative o módulo RPG (.rpg on / .rpg off)
 * e oferece a aventureiros a visão geral das masmorras, coliseu e combate.
 */

const moduleState = require('../../services/moduleStateService')
const { getBotName } = require('../../config/botConfig')

module.exports = {
    name: 'rpg',
    aliases: ['modorpg', 'rpgsistema', 'central', 'reinocentral'],
    category: 'rpg',
    subcategory: 'Sistema RPG',
    description: 'Painel do Reino Central e controle do sistema de RPG',
    cooldownMs: 2000,
    execute: async ({ reply, prefix = '.', from, isGroup, args, isOwner, userRole, sender }) => {
        const scope = moduleState.scopeOf(from, isGroup)
        const sub = (args[0] || '').toLowerCase()
        const isUserOwner = isOwner || (userRole && userRole.level >= 5)

        // Subcomando de ativação (exclusivo Dono)
        if (sub === 'on' || sub === 'ativar' || sub === 'ligar' || sub === '1') {
            if (!isUserOwner) {
                return reply('⚔️ *Apenas os Grão-Mestres (Donos) podem erguer os portões do RPG neste reino!*')
            }
            moduleState.setModule('rpg', true, scope)
            let doc = `╔════════════════════════════════════╗\n`
            doc += `║   ⚔️ *REINO CENTRAL // RPG ATIVO* ⚔️ ║\n`
            doc += `╚════════════════════════════════════╝\n\n`
            doc += `🛡️ *Os portões do Reino Central foram ABERTOS!*\n`
            doc += `📍 *Ambiente:* \`${scope}\`\n`
            doc += `✨ Dungeons, Coliseu, Bosses e Duelos estão disponíveis para todos os cavaleiros.\n\n`
            doc += `🗡️ _Para explorar:_ \`${prefix}rpg\` ou \`${prefix}menurpg\`\n`
            doc += `🔒 _Para fechar os portões:_ \`${prefix}rpg off\``
            return reply(doc.trim())
        }

        // Subcomando de desativação (exclusivo Dono)
        if (sub === 'off' || sub === 'desativar' || sub === 'desligar' || sub === '0') {
            if (!isUserOwner) {
                return reply('⚔️ *Apenas os Grão-Mestres (Donos) podem fechar os portões do RPG neste reino!*')
            }
            moduleState.setModule('rpg', false, scope)
            let doc = `╔════════════════════════════════════╗\n`
            doc += `║   ⚔️ *REINO CENTRAL // RPG OFF* ⚔️   ║\n`
            doc += `╚════════════════════════════════════╝\n\n`
            doc += `🛡️ *Os portões do Reino Central foram TRANCADOS!*\n`
            doc += `📍 *Ambiente:* \`${scope}\`\n`
            doc += `💤 Batalhas e explorações foram suspensas neste ambiente.\n\n`
            doc += `🗡️ _Para reabrir os portões:_ \`${prefix}rpg on\``
            return reply(doc.trim())
        }

        // Verificação se o módulo está ativo neste ambiente
        const isEnabled = moduleState.isModuleEnabled('rpg', scope)
        if (!isEnabled && !isUserOwner) {
            let doc = `╔════════════════════════════════════╗\n`
            doc += `║    ⚔️ *PORTÕES TRANCADOS* ⚔️        ║\n`
            doc += `╚════════════════════════════════════╝\n\n`
            doc += `🔒 *O Sistema de RPG está desativado neste reino.*\n`
            doc += `Aventureiros não podem invocar batalhas ou explorar masmorras no momento.\n\n`
            doc += `👑 _Peça ao Dono para liberar com:_ \`${prefix}rpg on\``
            return reply(doc.trim())
        }

        // Status rápido
        if (sub === 'status') {
            return reply(`⚔️ *Status do Reino Central (RPG):* ${isEnabled ? '🟢 ATIVO (Portões Abertos)' : '🔴 INATIVO (Portões Fechados)'} no ambiente \`${scope}\`.`)
        }

        // Painel Imersivo do RPG
        const cleanSender = sender ? sender.split('@')[0].split(':')[0] : 'Cavaleiro'
        let doc = `╔════════════════════════════════════╗\n`
        doc += `║    🏰 *REINO CENTRAL — RPG* 🏰    ║\n`
        doc += `╚════════════════════════════════════╝\n\n`
        doc += `⚔️ Saudações, nobre @${cleanSender}!\n`
        doc += `Seja bem-vindo ao Estádio dos Campeões e aos domínios lendários do Reino.\n\n`
        doc += `╭━〔 🛡️ BATALHAS & ARENA 〕━⬣\n`
        doc += `┃ ➤ \`${prefix}batalhar\` — Enfrente monstros e ganhe glória\n`
        doc += `┃ ➤ \`${prefix}coliseu\` — Sobreviva a ondas brutais de gladiadores\n`
        doc += `┃ ➤ \`${prefix}duelo @user\` — Desafie outro cavaleiro para combate\n`
        doc += `┃ ➤ \`${prefix}boss\` — Convoque o Grande Chefe Demoníaco\n`
        doc += `┃ ➤ \`${prefix}dungeonboss\` — Desbrave a masmorra com sua guilda\n`
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
        doc += `╭━〔 📜 PROGRESSÃO & PERFIL 〕━⬣\n`
        doc += `┃ ➤ \`${prefix}dossie\` — Seu histórico militar, vitórias e bosses\n`
        doc += `┃ ➤ \`${prefix}statusrpg\` — Atributos, clã, magia e força\n`
        doc += `┃ ➤ \`${prefix}rankingrpg\` — Os maiores guerreiros do Reino\n`
        doc += `┃ ➤ \`${prefix}inventario\` — Seus tesouros sagrados e equipamentos\n`
        doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
        if (isUserOwner) {
            doc += `╭━〔 👑 CONTROLE DO GRÃO-MESTRE 〕━⬣\n`
            doc += `┃ ➤ \`${prefix}rpg on\` — Abre o RPG no chat atual\n`
            doc += `┃ ➤ \`${prefix}rpg off\` — Fecha o RPG no chat atual\n`
            doc += `╰━━━━━━━━━━━━━━━━━━⬣\n\n`
        }
        doc += `💡 _Para ver a lista completa de comandos:_ \`${prefix}menurpg\``

        return reply(doc.trim(), sender ? [sender] : [])
    }
}

