/**
 * Comando .menu
 * Menu gerado dinamicamente a partir do registro de comandos (menuService).
 * Todo comando com `category` aparece automaticamente — nunca mais desatualiza.
 */

const env = require('../../config/env')
const { getBotName } = require('../../config/botConfig')
const dataService = require('../../services/dataService')
const { resolveCategoryKey } = require('../../config/categories')
const { buildMenu } = require('../../services/menuService')

module.exports = {
    name: 'menu',
    aliases: [ 'todos-comandos', 'ajuda-menu', 'menulist',
        'menurpg', 'menueco', 'menueconomia', 'menucalc',
        'menuinteracao', 'menusocial', 'menupesquisa', 'menuia',
        'menufun', 'menudiversao', 'menudev', 'menuping', 'menurede',
        'menuconfig', 'menuadmin', 'menuadm', 'menualuguel', 'menudono',
        'menuhierarquia', 'menucargos',
        'menuowner', 'menuall', 'menucompleto', 'menutotal', 'allmenu'
    ],
    category: 'general',
    description: 'Exibe o menu geral ou submenus específicos por categoria',
    cooldownMs: 2000,
    execute: async ({ reply, client, from, info, isAdmin, isOwner, userRole, args, commandName }) => {
        const configs = dataService.getConfigsData()
        const prefix = configs[from]?.prefix || configs['global']?.prefix || env.prefix || '.'
        const botName = configs['global']?.customMenuNames?.global || getBotName()

        const level = (userRole && userRole.level) || (isOwner ? 5 : isAdmin ? 3 : 1)
        const dispatcher = require('../../handlers/commandDispatcher')

        // Resolve categoria e página: via alias do comando (.menurpg 2) ou argumentos (.menu 2, .menu parte 2, .menu rpg 2)
        let category = null
        let requestedCategory = null
        let pageArg = 1

        // 1. Categoria via alias: .menurpg, .menuall, etc.
        if (commandName && commandName.startsWith('menu') && commandName !== 'menu' && commandName !== 'menulist') {
            const fromAlias = commandName.replace(/^menu/, '').toLowerCase()
            category = (fromAlias === 'all' || fromAlias === 'completo' || fromAlias === 'total')
                ? 'all'
                : resolveCategoryKey(fromAlias)
            requestedCategory = fromAlias
            if (args[0] && /^\d+$/.test(args[0])) {
                pageArg = parseInt(args[0], 10) || 1
            }
        }

        // 2. Argumentos normais: .menu <categoria|página> [página]
        if (!category && args.length > 0) {
            const a0 = args[0].toLowerCase()

            // Caso A: .menu 2 ou .menu 1
            if (/^\d+$/.test(a0)) {
                pageArg = parseInt(a0, 10) || 1
                category = null
            }
            // Caso B: .menu parte 2, .menu p2, .menu pag 2
            else if (a0 === 'parte' || a0 === 'p' || a0 === 'pag' || a0 === 'pagina' || a0 === 'página') {
                if (args[1] && /^\d+$/.test(args[1])) {
                    pageArg = parseInt(args[1], 10) || 1
                } else {
                    pageArg = 2
                }
                category = null
            }
            else if (a0 === 'p1' || a0 === 'parte1') {
                pageArg = 1
                category = null
            }
            else if (a0 === 'p2' || a0 === 'parte2') {
                pageArg = 2
                category = null
            }
            // Caso C: .menu main 2 ou .menu principal 2
            else if (a0 === 'main' || a0 === 'global' || a0 === 'principal') {
                if (args[1] && /^\d+$/.test(args[1])) {
                    pageArg = parseInt(args[1], 10) || 1
                }
                category = null
            }
            // Caso D: Categoria específica (.menu rpg 2, .menu all 3, .menu dono 2)
            else {
                category = (a0 === 'all' || a0 === 'todos' || a0 === 'completo')
                    ? 'all'
                    : resolveCategoryKey(a0)
                requestedCategory = a0
                if (args[1] && /^\d+$/.test(args[1])) {
                    pageArg = parseInt(args[1], 10) || 1
                }
            }
        }

        const menu = buildMenu({
            category,
            requestedCategory,
            page: pageArg,
            prefix,
            userLevel: level,
            botName,
            registry: dispatcher.getCommands(),
            totalAliases: dispatcher.getAliases().size
        })

        const pageText = menu.pages[menu.page - 1] || menu.pages[0]
        // TODA página de TODO menu vai com wallpaper. A página 1 usa o wallpaper
        // da categoria; menu 2, menu 3... usam a variante "<categoria>-<n>" quando
        // ela existe e caem na da categoria quando não — mesmo tema em todas.
        return sendMenuWithWallpaper(client, from, info, reply, pageText, menu.mediaKey, menu.page)
    }
}

async function sendMenuWithWallpaper(client, from, info, reply, textContent, category, page = 1) {
    if (process.env.NODE_ENV === 'test') {
        return reply(textContent.trim());
    }

    const { sendMenuMediaMessage } = require('../../utils/wallpapers');
    return await sendMenuMediaMessage(client, from, {
        category,
        text: textContent,
        quoted: info,
        page
    });
}
