/**
 * Comando .mimetype
 * Dicionário de tipos MIME por extensão de arquivo
 */

const F = require("../../utils/formato");

const TYPES = {
    json: "application/json", png: "image/png", jpg: "image/jpeg",
    webp: "image/webp", mp4: "video/mp4", mp3: "audio/mpeg", pdf: "application/pdf"
};

module.exports = {
    name: "mimetype",
    aliases: ["tipomime","contenttype","mimetypes","cmd_mimetype","alt_mimetype","atalho_mimetype","abrev_mimetype","call_mimetype","func_mimetype"],
    category: "dev",
    subcategory: "Dev",
    description: "Mostra o tipo MIME (Content-Type) de uma extensão de arquivo",
    usage: '<extensão>',
    examples: ['png — tipo de imagem PNG', '.mp3 — aceita com ponto', 'pdf — tipo de documento PDF'],
    cooldownMs: 2000,
    execute: async ({ reply, args, prefix = '.' }) => {
    const ext = (args[0] || "json").replace(".", "").toLowerCase();
    const conhecido = Object.prototype.hasOwnProperty.call(TYPES, ext);
    const mime = TYPES[ext] || "application/octet-stream";
    return reply(F.tela({
        emoji: '📑',
        titulo: `Tipo MIME de .${ext}`,
        intro: '`' + mime + '`',
        secoes: [
            {
                emoji: '📋', titulo: 'Detalhes',
                linhas: [
                    F.campo('Extensão', '`.' + ext + '`'),
                    F.campo('Cabeçalho pronto', '`Content-Type: ' + mime + '`'),
                    !args[0] ? F.campo('Aviso', 'você não mandou extensão, então mostrei .json') : null,
                    !conhecido ? F.campo('Aviso', 'não conheço essa extensão; mostrei o tipo genérico de arquivo binário') : null
                ]
            },
            { emoji: '📚', titulo: 'Extensões que conheço', linhas: [Object.keys(TYPES).join(', ')] }
        ],
        dica: 'Servir um arquivo com o tipo errado faz o navegador baixar em vez de abrir.',
        proximos: [
            { nome: 'mimetype', args: 'webp', oque: 'outra extensão' },
            { nome: 'headers', args: 'https://exemplo.com', oque: 'ver os cabeçalhos de um site' }
        ],
        prefix
    }));
}
};
