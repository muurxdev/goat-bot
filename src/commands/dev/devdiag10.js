/**
 * Comando .diagintegridade — INTEGRIDADE DO BANCO
 *
 * Varredura completa em busca de corrupção.
 *
 * As leituras vêm de services/diagnosticsService.js; aqui só a apresentação.
 * Comandos da categoria dev não passam pelo tradutor do Reino: aqui o termo
 * técnico é o assunto, não um vazamento.
 */

const D = require('../../services/diagnosticsService')
const F = require('../../utils/formato')

module.exports = {
    name: 'diagintegridade',
    aliases: ["diagcheck","cmd_diagintegridade","alt_diagintegridade","atalho_diagintegridade","abrev_diagintegridade","call_diagintegridade","func_diagintegridade"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Varredura completa do banco de dados em busca de corrupção',
    examples: [' — confere o banco inteiro (pode demorar)'],
    cooldownMs: 4000,
    ownerOnly: true,
    execute: async ({ reply, prefix = '.' }) => {
    await reply('🩺 Conferindo o banco de dados inteiro. Em bancos grandes isso leva alguns segundos…')
    const inicio = Date.now()
    const i = D.integridade()
    if (i.erro) return reply(F.tela({ emoji: '🩺', titulo: 'Integridade do banco', intro: 'Não consegui rodar a verificação agora. O detalhe ficou no registro de erros.', proximos: [{ nome: 'diagbanco', oque: 'arquivo do banco' }], prefix }))
    return reply(F.tela({
        emoji: '🩺',
        titulo: 'Integridade do banco',
        intro: i.ok ? '🟢 *Íntegro.* Nenhuma corrupção encontrada.' : '🔴 *Corrompido.* A verificação encontrou problemas.',
        secoes: [
            { emoji: '📋', titulo: 'Verificação', linhas: [F.campo('Resultado', i.ok ? 'íntegro' : 'com problemas'), F.campo('Tempo', `${Date.now() - inicio} ms`)] },
            i.ok ? null : { emoji: '⚠️', titulo: 'Problemas', linhas: F.lista(i.mensagens) }
        ],
        dica: i.ok ? 'Rode depois de quedas de energia ou reinícios bruscos da máquina.' : 'Não restaure por cima dos dados atuais antes de guardar uma cópia: faça um backup primeiro.',
        proximos: [
            i.ok ? { nome: 'diagfragmentacao', oque: 'espaço desperdiçado no banco' } : { nome: 'backup', oque: 'guardar uma cópia agora' },
            { nome: 'diagbackups', oque: 'cópias de segurança existentes' }
        ],
        prefix
    }))
    }
}
