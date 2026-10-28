/**
 * Comando .diagproblemas — ARQUIVOS COM PROBLEMA
 *
 * Comandos que não carregam ou estão incompletos.
 *
 * As leituras vêm de services/diagnosticsService.js; aqui só a apresentação.
 * Comandos da categoria dev não passam pelo tradutor do Reino: aqui o termo
 * técnico é o assunto, não um vazamento.
 */

const D = require('../../services/diagnosticsService')
const F = require('../../utils/formato')

module.exports = {
    name: 'diagproblemas',
    aliases: ["diagerros","cmd_diagproblemas","alt_diagproblemas","atalho_diagproblemas","abrev_diagproblemas","call_diagproblemas","func_diagproblemas"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Comandos que não carregam ou estão incompletos',
    examples: [' — lista os arquivos de comando com problema'],
    cooldownMs: 4000,
    execute: async ({ reply, prefix = '.' }) => {
    const r = D.registroDeComandos()
    if (r.erro) return reply(F.tela({ emoji: '🚨', titulo: 'Arquivos com problema', intro: 'Não consegui ler o registro de comandos agora. O detalhe ficou no registro de erros.', proximos: [{ nome: 'diagcomandos', oque: 'registro de comandos' }], prefix }))
    if (!r.problemas.length) {
        return reply(F.tela({
            emoji: '🟢',
            titulo: 'Nenhum arquivo com problema',
            intro: `Todos os *${Number(r.arquivos).toLocaleString('pt-BR')}* arquivos carregaram com nome e função de execução válidos.`,
            dica: 'Arquivo com problema some do menu sem avisar ninguém; rode isto depois de cada atualização.',
            proximos: [
                { nome: 'diagcolisoes', oque: 'nomes repetidos' },
                { nome: 'diagcategorias', oque: 'comandos por categoria' }
            ],
            prefix
        }))
    }
    return reply(F.tela({
        emoji: '🚨',
        titulo: 'Arquivos com problema',
        intro: `*${r.problemas.length}* de ${Number(r.arquivos).toLocaleString('pt-BR')} arquivos não carregaram direito. Esses comandos não respondem.`,
        secoes: [{ emoji: '📋', titulo: r.problemas.length > 25 ? 'Primeiros 25' : 'Lista', linhas: F.lista(r.problemas.slice(0, 25)) }],
        dica: 'Todo arquivo de comando precisa exportar name e execute.',
        proximos: [{ nome: 'diagcolisoes', oque: 'nomes repetidos' }],
        prefix
    }))
    }
}
