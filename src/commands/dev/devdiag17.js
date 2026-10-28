/**
 * Comando .diagcolisoes — COLISÕES DE NOME
 *
 * Nomes ou aliases registrados duas vezes.
 *
 * As leituras vêm de services/diagnosticsService.js; aqui só a apresentação.
 * Comandos da categoria dev não passam pelo tradutor do Reino: aqui o termo
 * técnico é o assunto, não um vazamento.
 */

const D = require('../../services/diagnosticsService')
const F = require('../../utils/formato')

module.exports = {
    name: 'diagcolisoes',
    aliases: ["diagcolisao","cmd_diagcolisoes","alt_diagcolisoes","atalho_diagcolisoes","abrev_diagcolisoes","call_diagcolisoes","func_diagcolisoes"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Nomes ou apelidos de comando registrados duas vezes',
    examples: [' — lista as colisões de nome'],
    cooldownMs: 4000,
    execute: async ({ reply, prefix = '.' }) => {
    const r = D.registroDeComandos()
    if (r.erro) return reply(F.tela({ emoji: '⚠️', titulo: 'Colisões de nome', intro: 'Não consegui ler o registro de comandos agora. O detalhe ficou no registro de erros.', proximos: [{ nome: 'diagcomandos', oque: 'registro de comandos' }], prefix }))
    if (!r.colisoes.length) {
        return reply(F.tela({
            emoji: '🟢',
            titulo: 'Nenhuma colisão de nome',
            intro: 'Cada nome e apelido aponta para um comando só.',
            secoes: [{ emoji: '📋', titulo: 'Conferido', linhas: [F.campo('Arquivos lidos', String(r.arquivos))] }],
            dica: 'Colisão acontece quando dois arquivos usam o mesmo nome ou apelido: só o primeiro carregado responde.',
            proximos: [
                { nome: 'diagproblemas', oque: 'arquivos que não carregam' },
                { nome: 'diagcomandos', oque: 'registro de comandos' }
            ],
            prefix
        }))
    }
    return reply(F.tela({
        emoji: '⚠️',
        titulo: 'Colisões de nome',
        intro: `Encontrei *${r.colisoes.length}* colisão(ões). A primeira definição vence; as outras ficam inalcançáveis.`,
        secoes: [{ emoji: '📋', titulo: r.colisoes.length > 30 ? 'Primeiras 30' : 'Lista', linhas: F.lista(r.colisoes.slice(0, 30)) }],
        dica: 'Corrija trocando o nome ou o apelido repetido num dos arquivos; nome e apelidos precisam ser únicos no projeto inteiro.',
        proximos: [{ nome: 'diagproblemas', oque: 'arquivos que não carregam' }],
        prefix
    }))
    }
}
