const bossCommand = require('./boss')

module.exports = {
    name: 'atk',
    aliases: ['atacar'],
    category: 'rpg',
    description: 'Ataque o seu chefe ativo (o mesmo que .boss atk)',
    execute: async (context) => {
        context.args = ['atk']
        return bossCommand.execute(context)
    }
}