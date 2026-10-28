/**
 * Comando .ativar / .ligar / .enable / .on
 * Permite que administradores ativem rapidamente comandos ou categorias no grupo.
 */

const cmdHandler = require('./cmd')

module.exports = {
    name: 'ativar',
    aliases: ["ligar","habilitar","enable","on","cmd_ativar","alt_ativar","atalho_ativar","abrev_ativar","call_ativar","func_ativar"],
    category: 'admin',
    description: 'Ativa um comando, categoria ou todos os comandos no grupo (.ativar <cmd|cat|all>)',
    adminOnly: true,
    groupOnly: false,
    cooldownMs: 800,
    execute: async (context) => {
        const { args, reply } = context
        if (!args || args.length === 0) {
            return reply('📌 *Uso correto:* `.ativar <comando|categoria|all>`\n\n💡 *Exemplos:*\n• `.ativar ping` — Ativa comando específico\n• `.ativar rpg` — Ativa categoria inteira de RPG\n• `.ativar all` — Ativa todos os comandos do grupo')
        }

        const target = args[0].replace(/^[.!#\/]/, '').toLowerCase()
        context.args = [target, 'on', ...args.slice(1)]
        return cmdHandler.execute(context)
    }
}

