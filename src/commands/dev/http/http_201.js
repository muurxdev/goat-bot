module.exports = {
    name: 'http_201',
    aliases: ["cmd_http_201","atalho_http_201","abrev_http_201"],
    category: 'dev',
    subcategory: 'Códigos HTTP',
    description: 'Explicação detalhada do status HTTP 201 Created',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌐 *HTTP STATUS: 201 CREATED* ═══════╗\n\n'
        txt += '📖 *Significado:* A requisição foi atendida e um novo recurso foi criado.\n\n'
        txt += '💡 *Categoria:* ' + (201 < 300 ? 'Sucesso (2xx)' : 201 < 400 ? 'Redirecionamento (3xx)' : 201 < 500 ? 'Erro do Cliente (4xx)' : 'Erro do Servidor (5xx)')
        return reply(txt.trim())
    }
}
