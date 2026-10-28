/**
 * Comando .diagsessao — ARQUIVOS DE SESSÃO
 *
 * Peso da sessão do WhatsApp em disco.
 *
 * As leituras vêm de services/diagnosticsService.js; aqui só a apresentação.
 * Comandos da categoria dev não passam pelo tradutor do Reino: aqui o termo
 * técnico é o assunto, não um vazamento.
 */

const D = require('../../services/diagnosticsService')
const F = require('../../utils/formato')

/** Tela para quando a leitura falha (o detalhe já foi para o logger pela sonda). */
function semLeitura(prefix, emoji, titulo, oque) {
    return F.tela({ emoji, titulo, intro: 'Não consegui ler ' + oque + ' agora. O detalhe ficou no registro de erros.', proximos: [{ nome: 'diagresumo', oque: 'resumo geral' }], prefix })
}

module.exports = {
    name: 'diagsessao',
    aliases: ["diagsession","cmd_diagsessao","alt_diagsessao","atalho_diagsessao","abrev_diagsessao","call_diagsessao","func_diagsessao"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Peso e situação dos arquivos de login no WhatsApp',
    examples: [' — mostra os arquivos de sessão'],
    cooldownMs: 4000,
    ownerOnly: true,
    execute: async ({ reply, prefix = '.' }) => {
    const r = D.pesoDoDiretorio('sessao')
    if (r.erro) return reply(semLeitura(prefix, '🔑', 'Arquivos de sessão', 'a pasta de sessão'))
    if (!r.existe) {
        return reply(F.tela({
            emoji: '🔑',
            titulo: 'Arquivos de sessão',
            intro: '🔴 A pasta de sessão não existe. Se eu cair, não vou conseguir reconectar sem parear o número de novo.',
            secoes: [{ emoji: '📋', titulo: 'O que isso significa', linhas: ['A sessão guarda o login do WhatsApp. Sem ela, cada reinício pede novo pareamento pelo código ou QR.'] }],
            dica: 'Em servidor, a pasta de sessão precisa ficar num volume que sobrevive a recriar o container.',
            proximos: [{ nome: 'diagconexao', oque: 'estado da conexão' }],
            prefix
        }))
    }
    const situacao = r.arquivos > 0 ? '🟢 Sessão presente' : '🔴 Sessão vazia'
    return reply(F.tela({
        emoji: '🔑',
        titulo: 'Arquivos de sessão',
        intro: `${situacao}: *${r.arquivos}* arquivo(s), *${D.tamanho(r.bytes)}*.`,
        secoes: [{ emoji: '📋', titulo: 'Resumo', linhas: [F.campo('Arquivos', String(r.arquivos)), F.campo('Peso', D.tamanho(r.bytes)), F.campo('Situação', situacao)] }],
        dica: r.arquivos > 2000
            ? 'Muitos arquivos de sessão: chaves antigas estão se acumulando. Isso deixa a conexão mais lenta e pode fazer mensagens sumirem em grupos.'
            : 'Nunca compartilhe esta pasta: com ela, qualquer pessoa entra no meu WhatsApp.',
        proximos: [{ nome: 'diagconexao', oque: 'estado da conexão' }, { nome: 'diagdisco', oque: 'espaço de todas as pastas' }],
        prefix
    }))
    }
}
