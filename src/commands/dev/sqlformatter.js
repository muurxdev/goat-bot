/**
 * Comando .sqlformatter
 * Formata consultas SQL básicas: palavras-chave em maiúsculas e uma cláusula por linha.
 *
 * Antes só devolvia o texto recebido dentro de um bloco de código, sem formatar nada.
 */

const F = require("../../utils/formato");

const EXEMPLO = "select id, name, email from users where active = 1 order by id desc limit 10;";
const QUEBRA = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'JOIN', 'UNION ALL', 'UNION', 'VALUES', 'SET', 'INSERT INTO', 'UPDATE', 'DELETE FROM'];
const RECUO = ['AND', 'OR', 'ON'];
const OUTRAS = ['AS', 'IN', 'NOT', 'NULL', 'IS', 'LIKE', 'BETWEEN', 'DESC', 'ASC', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END'];

/** Formatação simples: não entende subconsultas, mas deixa o comum legível. */
function formatarSql(sql) {
    let s = String(sql).replace(/\s+/g, ' ').trim();
    const partes = s.split(/('(?:[^']|'')*')/);
    for (let i = 0; i < partes.length; i += 2) {
        let p = partes[i];
        for (const k of [...QUEBRA, ...RECUO, ...OUTRAS]) {
            const re = new RegExp('(^|[^A-Za-z0-9_])' + k.replace(' ', '\\s+') + '(?=$|[^A-Za-z0-9_])', 'gi');
            p = p.replace(re, (m, antes) => antes + k);
        }
        p = p.replace(new RegExp(' (?<!DELETE )(' + QUEBRA.join('|') + ')(?=$|[^A-Za-z0-9_])', 'g'), '\n$1');
        for (const k of RECUO) p = p.replace(new RegExp(' ' + k + '(?=$|[^A-Za-z0-9_])', 'g'), '\n  ' + k);
        partes[i] = p;
    }
    return partes.join('').trim();
}

module.exports = {
    name: "sqlformatter",
    aliases: ["formatsql","embellishsql","sqlformat","cmd_sqlformatter","alt_sqlformatter","atalho_sqlformatter","abrev_sqlformatter","call_sqlformatter","func_sqlformatter"],
    category: "dev",
    subcategory: "Dev",
    description: "Formata consultas SQL com palavras-chave em maiúsculas e uma cláusula por linha",
    usage: '<consulta SQL>',
    examples: [' — mostra um exemplo formatado', "select * from users where id = 1 and active = 1 — formata a sua consulta"],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const recebida = args.join(" ").trim();
        const query = recebida || EXEMPLO;
        const pronta = formatarSql(query);
        return reply(F.tela({
            emoji: "🗄️",
            titulo: recebida ? "SQL formatado" : "Exemplo de SQL formatado",
            intro: recebida ? '' : 'Você não mandou uma consulta, então formatei um exemplo:',
            secoes: [
                "```sql\n" + pronta + "\n```",
                { emoji: '📋', titulo: 'Detalhes', linhas: [F.campo('Linhas', String(pronta.split('\n').length)), F.campo('Caracteres', String(query.length))] }
            ],
            dica: 'Formatação simples: subconsultas e comentários ficam como vieram. Nada é executado no banco.',
            proximos: [
                { nome: 'sqlformatter', args: 'select * from users where id = 1', oque: 'formatar a sua consulta' },
                { nome: 'json', args: 'format {"a":1}', oque: 'formatar JSON' }
            ],
            prefix
        }));
    }
};
