/**
 * Comando .faixasnivel — Como os jogadores cadastrados se espalham pelas faixas de nível
 *
 * Só leitura: consulta o botManagementService e apresenta com utils/formato.
 */

const G = require('../../services/botManagementService')
const F = require('../../utils/formato')

function plural(n, um, varios) { return n + ' ' + (n === 1 ? um : varios) }

module.exports = {
    name: 'faixasnivel',
    aliases: ["distribuicaoniveis"],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Como os jogadores cadastrados se espalham pelas faixas de nível',
    examples: [' — mostra quantos jogadores há em cada faixa de nível'],
    cooldownMs: 3000,
    ownerOnly: true,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const f = G.faixasDeNivel()
    const total = f.reduce((s, x) => s + x.n, 0)
    if (!total) {
        return reply(F.tela({
            emoji: '📈',
            titulo: 'Ainda não há jogadores',
            intro: 'Esta tela mostra quantos cadastrados há em cada faixa de nível. Ninguém tem cadastro ainda.',
            secoes: [{ emoji: '📝', titulo: 'Como alguém começa', linhas: ['• ' + F.cmd(prefix, 'login', 'SeuNick') + ' — cria o cadastro'] }],
            prefix
        }))
    }
    return reply(F.tela({
        emoji: '📈',
        titulo: 'Jogadores por nível',
        intro: plural(total, 'jogador cadastrado', 'jogadores cadastrados') + ', divididos por faixa de nível.',
        secoes: [{ emoji: '📊', titulo: 'Faixas', linhas: f.map(x => F.campo('Nível ' + x.faixa, x.n + ' · ' + F.barra(x.n / total, 5))) }],
        dica: 'É normal a maioria ficar nas faixas baixas. Ninguém nas altas pode indicar progressão travada.',
        proximos: [{ nome: 'usuariosbot', oque: 'os números da base inteira' }],
        prefix
    }))
    }
}
