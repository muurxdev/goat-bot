/**
 * Comando .gestaoajuda — Todos os comandos de gestão do reino, agrupados por assunto
 *
 * Só leitura: consulta o botManagementService e apresenta com utils/formato.
 */

const G = require('../../services/botManagementService')
const F = require('../../utils/formato')

module.exports = {
    name: 'gestaoajuda',
    aliases: ["guiagestao"],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Todos os comandos de gestão do reino, agrupados por assunto',
    examples: [' — mostra o guia com os comandos de gestão'],
    cooldownMs: 3000,
    ownerOnly: true,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const it = (nome, oque, a = '') => '• ' + F.cmd(prefix, nome, a) + ' — ' + oque
    return reply(F.tela({
        emoji: '🗺️',
        titulo: 'Guia da gestão',
        intro: 'Comandos para acompanhar o reino inteiro. Todos só leem: nenhum muda nada.',
        secoes: [
            { emoji: '👑', titulo: 'Panorama', linhas: [
                it('painelbot', 'os números principais'),
                it('diagnosticobot', 'só o que precisa de atenção')
            ] },
            { emoji: '🌐', titulo: 'Ambientes', linhas: [
                it('ambientesbot', 'lugares com configuração própria'),
                it('gruposbot', 'só os grupos configurados'),
                it('dominiosbot', 'Domínios ligados por grupo'),
                it('gruposmudos', 'grupos com tudo desligado'),
                it('perfisbot', 'perfil de cada grupo'),
                it('ajustesglobais', 'o que vale em todo lugar')
            ] },
            { emoji: '📜', titulo: 'Aluguéis', linhas: [
                it('listaalugueis', 'todos e a situação'),
                it('aluguelvencendo', 'os que acabam logo', '7'),
                it('aluguelvencidos', 'os que passaram do prazo'),
                it('aluguelsituacao', 'contagem por situação')
            ] },
            { emoji: '👤', titulo: 'Pessoas', linhas: [
                it('usuariosbot', 'tamanho da base'),
                it('novosusuarios', 'quem chegou', '7'),
                it('usuariosparados', 'cadastros sem uso'),
                it('cargosbot', 'cargos atribuídos'),
                it('confiaveisbot', 'lista de confiança'),
                it('bloqueadosbot', 'quem está bloqueado'),
                it('restricoespv', 'quem está barrado no privado')
            ] }
        ],
        dica: 'Não entendeu algum termo? ' + F.cmd(prefix, 'gestaoglossario') + ' explica cada um.',
        prefix
    }))
    }
}
