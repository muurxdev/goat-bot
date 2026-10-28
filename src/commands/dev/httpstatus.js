/**
 * Comando .httpstatus / .statuscode / .httpcode
 * Dicionário interativo e técnico de códigos de status HTTP
 */

const { renderCard } = require("../../utils/uiEngine");

const STATUS_CODES = {
    "200": { title: "200 OK", desc: "A requisição foi bem-sucedida e o servidor retornou o conteúdo solicitado.", cat: "Sucesso" },
    "201": { title: "201 Created", desc: "A requisição foi atendida e resultou na criação de um novo recurso no servidor.", cat: "Sucesso" },
    "400": { title: "400 Bad Request", desc: "O servidor não pôde processar a requisição devido a um erro de sintaxe do cliente.", cat: "Erro do Cliente" },
    "401": { title: "401 Unauthorized", desc: "A requisição exige autenticação de usuário (Token ou Credenciais ausentes).", cat: "Erro do Cliente" },
    "403": { title: "403 Forbidden", desc: "O servidor entendeu o pedido, mas se recusa a autorizá-lo (Permissões insuficientes).", cat: "Erro do Cliente" },
    "404": { title: "404 Not Found", desc: "O recurso solicitado não pôde ser encontrado no servidor.", cat: "Erro do Cliente" },
    "418": { title: "418 I'm a teapot", desc: "Código RFC 2324/7168: O servidor se recusa a preparar café em um bule de chá.", cat: "Easter Egg RFC" },
    "429": { title: "429 Too Many Requests", desc: "O cliente enviou muitas requisições em um determinado período (Rate Limit estourado).", cat: "Erro do Cliente" },
    "500": { title: "500 Internal Server Error", desc: "O servidor encontrou uma condição inesperada que o impediu de atender à solicitação.", cat: "Erro do Servidor" },
    "502": { title: "502 Bad Gateway", desc: "O servidor estava atuando como gateway/proxy e recebeu uma resposta inválida do servidor upstream.", cat: "Erro do Servidor" },
    "503": { title: "503 Service Unavailable", desc: "O servidor não está pronto para lidar com a requisição (Manutenção ou Sobrecarga).", cat: "Erro do Servidor" }
};

module.exports = {
    name: "httpstatus",
    aliases: ["statuscode","httpcode","codigoshttp","cmd_httpstatus","alt_httpstatus","atalho_httpstatus","abrev_httpstatus","call_httpstatus","func_httpstatus"],
    category: "dev",
    description: "Consulta o significado e categoria de qualquer código de status HTTP",
    cooldownMs: 2000,
    execute: async ({ sender, reply, args }) => {
        const code = (args[0] || "200").trim();
        const info = STATUS_CODES[code];

        if (!info) {
            return reply(`❌ Código HTTP *${code}* não encontrado no catálogo rápido! Tente: \`200\`, \`400\`, \`401\`, \`403\`, \`404\`, \`418\`, \`429\`, \`500\`, \`502\` ou \`503\`.`);
        }

        const card = renderCard({
            title: `HTTP STATUS: ${info.title.toUpperCase()}`,
            icon: "🌐",
            subtitle: `👨‍💻 *Categoria:* ${info.cat}`,
            sections: [
                {
                    title: "SIGNIFICADO & DIAGNÓSTICO",
                    icon: "📜",
                    fields: [
                        { label: "Código", value: `\`HTTP ${code}\``, icon: "🔢" },
                        { label: "Descrição", value: info.desc, icon: "💡" }
                    ]
                }
            ],
            tip: "Digite .httpstatus <codigo> para consultar qualquer status HTTP!",
            mentions: [sender]
        });

        return reply(card, [sender]);
    }
};

