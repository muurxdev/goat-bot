/**
 * Comando .diagyoutube — ALCANCE DO YOUTUBE
 *
 * Testa a rota usada pelos downloads de vídeo.
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

/** Traduz a falha de rede para português simples. */
function motivoRede(erro) {
    const m = String(erro || '')
    if (/abort/i.test(m)) return 'demorou demais para responder'
    if (/ENOTFOUND|EAI_AGAIN|getaddrinfo/i.test(m)) return 'não consegui descobrir o endereço (falha de DNS)'
    if (/ECONNREFUSED/i.test(m)) return 'a conexão foi recusada'
    if (/ECONNRESET|socket/i.test(m)) return 'a conexão caiu no meio'
    if (/CERT|SSL|TLS/i.test(m)) return 'problema no certificado de segurança'
    return 'não houve resposta'
}

module.exports = {
    name: 'diagyoutube',
    aliases: ["diagyt","cmd_diagyoutube","alt_diagyoutube","atalho_diagyoutube","abrev_diagyoutube","call_diagyoutube","func_diagyoutube"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Testa a rota usada pelos downloads de vídeo',
    examples: [' — testa a rota até o YouTube'],
    cooldownMs: 4000,
    execute: async ({ reply, prefix = '.' }) => {
    await reply('▶️ Testando a rota até o YouTube…')
    const r = await D.alcancarHost('https://www.youtube.com')
    const alcancou = !r.erro
    return reply(F.tela({
        emoji: '▶️',
        titulo: 'Alcance do YouTube',
        intro: alcancou ? `🟢 O YouTube responde (${r.ms} ms).` : `🔴 Não alcancei o YouTube: ${motivoRede(r.erro)}.`,
        secoes: [{ emoji: '📋', titulo: 'Teste', linhas: [F.campo('Destino', 'youtube.com'), F.campo('Resultado', alcancou ? '🟢 Alcançável' : '🔴 Inalcançável'), F.campo('Tempo', r.ms + ' ms')] }],
        dica: 'Alcançar não garante download: o endereço da máquina pode estar bloqueado pelo YouTube mesmo assim. Nesse caso, faltam cookies de uma conta logada.',
        proximos: [
            { nome: 'cookies', oque: 'ver os cookies de download' },
            { nome: 'diaglatencia', oque: 'tempo até vários destinos' }
        ],
        prefix
    }))
    }
}
