const curarCommand = require('./curar');

module.exports = {
    name: 'curar-max',
    aliases: ['curarmax', 'fullheal', 'curatotal'],
    category: 'rpg',
    description: 'Restaura 100% do HP máximo do personagem',
    execute: async (context) => {
        return curarCommand.execute(context);
    }
};

