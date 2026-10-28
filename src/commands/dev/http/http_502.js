module.exports = {
    name: 'http_502',
    aliases: ["cmd_http_502","atalho_http_502","abrev_http_502"],
    category: 'dev',
    subcategory: 'Códigos HTTP',
    description: 'Explicação detalhada do status HTTP 502 Bad Gateway',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌐 *HTTP STATUS: 502 BAD GATEWAY* ═══════╗\n\n'
        txt += '📖 *Significado:* O servidor agindo como gateway recebeu uma resposta inválida do servidor upstream.\n\n'
        txt += '💡 *Categoria:* ' + (502 < 300 ? 'Sucesso (2xx)' : 502 < 400 ? 'Redirecionamento (3xx)' : 502 < 500 ? 'Erro do Cliente (4xx)' : 'Erro do Servidor (5xx)')
        return reply(txt.trim())
    }
}
