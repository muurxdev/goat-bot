/**
 * Comando .diaglatencia — TEMPO ATÉ OS DESTINOS
 *
 * Mede o tempo de resposta de vários destinos.
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
    name: 'diaglatencia',
    aliases: ["diagping","cmd_diaglatencia","alt_diaglatencia","atalho_diaglatencia","abrev_diaglatencia","call_diaglatencia","func_diaglatencia"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Mede o tempo de resposta de WhatsApp, Google, YouTube e Spotify',
    examples: [' — mede o tempo até os destinos'],
    cooldownMs: 4000,
    execute: async ({ reply, prefix = '.' }) => {
    await reply('📡 Medindo o tempo até os destinos…')
    const alvos = [
        ['WhatsApp', 'https://web.whatsapp.com', 'mensagens'],
        ['Google', 'https://www.google.com', 'internet em geral'],
        ['YouTube', 'https://www.youtube.com', 'downloads de vídeo e música'],
        ['Spotify', 'https://open.spotify.com', 'buscas de música']
    ]
    const res = await Promise.all(alvos.map(([, u]) => D.alcancarHost(u, 6000)))
    const falhas = alvos.filter((_, i) => res[i].erro).map(a => a[0])
    return reply(F.tela({
        emoji: '📡',
        titulo: 'Tempo até os destinos',
        intro: falhas.length ? `🔴 Não alcancei: *${falhas.join(', ')}*.` : '🟢 Todos os destinos responderam.',
        secoes: [{
            emoji: '📋', titulo: 'Resultados',
            linhas: res.map((r, i) => F.campo(alvos[i][0], (r.erro ? `🔴 ${motivoRede(r.erro)}` : `🟢 ${r.ms} ms`) + ` · ${alvos[i][2]}`))
        }],
        dica: 'Abaixo de 300 ms é ótimo. Se só um destino falha, o problema é nele; se todos falham, é na minha rede.',
        proximos: [
            { nome: 'diagrede', oque: 'saída para a internet' },
            { nome: 'speedtest', oque: 'teste rápido de conexão' }
        ],
        prefix
    }))
    }
}
