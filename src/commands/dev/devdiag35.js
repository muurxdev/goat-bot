/**
 * Comando .diagrede — SAÍDA PARA A INTERNET
 *
 * Testa se eu consigo acessar a internet.
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
    name: 'diagrede',
    aliases: ["diagnet","cmd_diagrede","alt_diagrede","atalho_diagrede","abrev_diagrede","call_diagrede","func_diagrede"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Testa se eu consigo acessar a internet',
    examples: [' — testa a saída para a internet'],
    cooldownMs: 4000,
    execute: async ({ reply, prefix = '.' }) => {
    await reply('🌍 Testando minha saída para a internet…')
    const r = await D.alcancarHost('https://www.google.com')
    const alcancou = !r.erro
    return reply(F.tela({
        emoji: '🌍',
        titulo: 'Saída para a internet',
        intro: alcancou ? `🟢 Consigo acessar a internet (${r.ms} ms até o Google).` : `🔴 Não consegui acessar a internet: ${motivoRede(r.erro)}.`,
        secoes: [{ emoji: '📋', titulo: 'Teste', linhas: [F.campo('Destino', 'google.com'), F.campo('Resultado', alcancou ? '🟢 Alcançável' : '🔴 Inalcançável'), F.campo('Tempo', r.ms + ' ms'), r.status ? F.campo('Resposta', `HTTP ${r.status}`) : null] }],
        dica: alcancou ? 'Se a internet funciona mas downloads falham, o problema é no site de destino, não na minha conexão.' : 'Sem internet, nada funciona: nem WhatsApp, nem downloads. Confira a rede da máquina.',
        proximos: [
            { nome: 'diagdns', oque: 'resolução de nomes' },
            { nome: 'diaglatencia', oque: 'tempo até vários destinos' }
        ],
        prefix
    }))
    }
}
