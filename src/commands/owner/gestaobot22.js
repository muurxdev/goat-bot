/**
 * Comando .gestaoglossario — O que cada termo usado na gestão significa
 *
 * Só leitura: consulta o botManagementService e apresenta com utils/formato.
 */

const G = require('../../services/botManagementService')
const F = require('../../utils/formato')

module.exports = {
    name: 'gestaoglossario',
    aliases: ["termosgestao"],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'O que cada termo usado na gestão significa',
    examples: [' — explica os termos da gestão'],
    cooldownMs: 3000,
    ownerOnly: true,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const termos = [
        ['Ambiente', 'um grupo, um privado ou o ajuste global, cada um com sua configuração'],
        ['Domínio', 'conjunto de comandos que pode ser ligado ou desligado'],
        ['Perfil', 'combinação de Domínios aplicada de uma vez'],
        ['Aluguel', 'permissão por tempo para eu funcionar num grupo ou privado'],
        ['Cargo', 'nível de permissão de uma pessoa comigo'],
        ['Lista de confiança', 'quem escapa de algumas restrições'],
        ['Cadastro', 'quem fez login e por isso tem progresso salvo']
    ]
    return reply(F.tela({
        emoji: '📚',
        titulo: 'Glossário da gestão',
        intro: 'Os termos que aparecem nos comandos de gestão, em poucas palavras.',
        secoes: [{ emoji: '📖', titulo: 'Termos', linhas: termos.map(([t, d]) => F.campo(t, d)) }],
        proximos: [{ nome: 'gestaoajuda', oque: 'todos os comandos de gestão' }],
        prefix
    }))
    }
}
