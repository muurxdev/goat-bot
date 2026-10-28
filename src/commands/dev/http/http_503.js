module.exports = {
    name: 'http_503',
    aliases: ["cmd_http_503","atalho_http_503","abrev_http_503"],
    category: 'dev',
    subcategory: 'Códigos HTTP',
    description: 'Explicação detalhada do status HTTP 503 Service Unavailable',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌐 *HTTP STATUS: 503 SERVICE UNAVAILABLE* ═══════╗\n\n'
        txt += '📖 *Significado:* O servidor não está pronto para manipular a requisição (sobrecarga ou manutenção).\n\n'
        txt += '💡 *Categoria:* ' + (503 < 300 ? 'Sucesso (2xx)' : 503 < 400 ? 'Redirecionamento (3xx)' : 503 < 500 ? 'Erro do Cliente (4xx)' : 'Erro do Servidor (5xx)')
        return reply(txt.trim())
    }
}
