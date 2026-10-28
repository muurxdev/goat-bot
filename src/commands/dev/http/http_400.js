module.exports = {
    name: 'http_400',
    aliases: ["cmd_http_400","atalho_http_400","abrev_http_400"],
    category: 'dev',
    subcategory: 'Códigos HTTP',
    description: 'Explicação detalhada do status HTTP 400 Bad Request',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌐 *HTTP STATUS: 400 BAD REQUEST* ═══════╗\n\n'
        txt += '📖 *Significado:* O servidor não pôde entender a requisição devido a sintaxe inválida.\n\n'
        txt += '💡 *Categoria:* ' + (400 < 300 ? 'Sucesso (2xx)' : 400 < 400 ? 'Redirecionamento (3xx)' : 400 < 500 ? 'Erro do Cliente (4xx)' : 'Erro do Servidor (5xx)')
        return reply(txt.trim())
    }
}
