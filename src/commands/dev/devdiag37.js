/**
 * Comando .diagwhatsapp — ALCANCE DO WHATSAPP
 *
 * Testa a rota até os servidores do WhatsApp.
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
    name: 'diagwhatsapp',
    aliases: ["diagwa","cmd_diagwhatsapp","alt_diagwhatsapp","atalho_diagwhatsapp","abrev_diagwhatsapp","call_diagwhatsapp","func_diagwhatsapp"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Testa a rota até os servidores do WhatsApp',
    examples: [' — testa a rota até o WhatsApp'],
    cooldownMs: 4000,
    execute: async ({ reply, prefix = '.' }) => {
    await reply('📱 Testando a rota até o WhatsApp…')
    const r = await D.alcancarHost('https://web.whatsapp.com')
    const alcancou = !r.erro
    return reply(F.tela({
        emoji: '📱',
        titulo: 'Alcance do WhatsApp',
        intro: alcancou ? `🟢 Os servidores do WhatsApp respondem (${r.ms} ms).` : `🔴 Não alcancei o WhatsApp: ${motivoRede(r.erro)}.`,
        secoes: [{ emoji: '📋', titulo: 'Teste', linhas: [F.campo('Destino', 'web.whatsapp.com'), F.campo('Resultado', alcancou ? '🟢 Alcançável' : '🔴 Inalcançável'), F.campo('Tempo', r.ms + ' ms')] }],
        dica: 'Se aqui falhar, nenhuma mensagem sai; nem adianta olhar o resto antes de resolver a rede.',
        proximos: [
            { nome: 'diagconexao', oque: 'estado da conexão' },
            { nome: 'diagrede', oque: 'saída para a internet' }
        ],
        prefix
    }))
    }
}
