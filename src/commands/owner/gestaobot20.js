/**
 * Comando .diagnosticobot — Aponta só o que precisa de atenção: grupos mudos, aluguéis e cadastros
 *
 * Só leitura: consulta o botManagementService e apresenta com utils/formato.
 */

const G = require('../../services/botManagementService')
const F = require('../../utils/formato')

module.exports = {
    name: 'diagnosticobot',
    aliases: ["checagemrapida"],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Aponta só o que precisa de atenção: grupos mudos, aluguéis e cadastros',
    examples: [' — faz uma checagem rápida'],
    cooldownMs: 3000,
    ownerOnly: true,
    execute: async ({ reply, args = [], prefix = '.' }) => {
    const p = G.painel()
    const u = p.usuarios || {}
    const mudos = G.dominiosPorAmbiente().filter(g => g.ligados === 0)
    const vencidos = G.alugueis().filter(x => x.situacao === 'vencido')
    const semPerfil = G.perfisAtivos().filter(x => !x.perfil)
    const travados = (u.total || 0) - (u.registrados || 0)

    const alertas = []
    if (mudos.length) alertas.push('🔴 ' + mudos.length + ' grupo(s) com tudo desligado — ' + F.cmd(prefix, 'gruposmudos'))
    if (vencidos.length) alertas.push('🔴 ' + vencidos.length + ' aluguel(is) vencido(s) ainda ativo(s) — ' + F.cmd(prefix, 'aluguelvencidos'))
    if (p.vencendo) alertas.push('🟡 ' + p.vencendo + ' aluguel(is) vencendo em 7 dias — ' + F.cmd(prefix, 'aluguelvencendo'))
    if (semPerfil.length) alertas.push('🟡 ' + semPerfil.length + ' grupo(s) sem perfil — ' + F.cmd(prefix, 'perfisbot'))
    if (travados > 10) alertas.push('🟡 ' + travados + ' pessoas conhecidas sem cadastro — ' + F.cmd(prefix, 'usuariosbot'))

    if (!alertas.length) {
        return reply(F.tela({
            emoji: '🩺',
            titulo: 'Nada exigindo atenção',
            intro: 'Chequei grupos mudos, aluguéis vencidos ou perto de vencer, grupos sem perfil e pessoas sem cadastro. Está tudo em ordem.',
            secoes: [{ emoji: '📋', titulo: 'Resumo', linhas: [
                F.campo('Grupos configurados', p.grupos),
                F.campo('Cadastrados', u.registrados || 0),
                F.campo('Aluguéis', p.alugueis.total)
            ] }],
            proximos: [{ nome: 'painelbot', oque: 'o painel completo' }],
            prefix
        }))
    }
    return reply(F.tela({
        emoji: '🩺',
        titulo: alertas.length + ' ponto(s) de atenção',
        intro: 'O vermelho pede ação logo; o amarelo pode esperar um pouco.',
        secoes: [{ emoji: '⚠️', titulo: 'O que encontrei', linhas: alertas }],
        proximos: [{ nome: 'painelbot', oque: 'o painel completo' }],
        prefix
    }))
    }
}
