/**
 * Comando .desativar / .desligar / .disable / .off
 * Permite que administradores desativem rapidamente comandos ou categorias no grupo.
 */

const cmdHandler = require('./cmd')

module.exports = {
    name: 'desativar',
    aliases: ["desligar","desabilitar","disable","off","cmd_desativar","alt_desativar","atalho_desativar","abrev_desativar","call_desativar","func_desativar"],
    category: 'admin',
    description: 'Desativa um comando, categoria ou todos os comandos no grupo (.desativar <cmd|cat|all>)',
    adminOnly: true,
    groupOnly: false,
    cooldownMs: 800,
    execute: async (context) => {
        const { args, reply } = context
        if (!args || args.length === 0) {
            return reply('📌 *Uso correto:* `.desativar <comando|categoria|all>`\n\n💡 *Exemplos:*\n• `.desativar ping` — Desativa comando específico\n• `.desativar rpg` — Desativa categoria inteira de RPG\n• `.desativar all` — Desativa todos os comandos do grupo')
        }

        const target = args[0].replace(/^[.!#\/]/, '').toLowerCase()
        context.args = [target, 'off', ...args.slice(1)]
        return cmdHandler.execute(context)
    }
}

