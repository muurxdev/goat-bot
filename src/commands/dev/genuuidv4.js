/**
 * Comando .genuuidv4 — Gera identificador UUID v4 único: .genuuidv4
 */
const F = require('../../utils/formato')

module.exports = {
    name: "genuuidv4",
    aliases: ["genu4","genu-4","cmd_genuuidv4","alt_genuuidv4","atalho_genuuidv4","abrev_genuuidv4","call_genuuidv4","func_genuuidv4"],
    category: "dev",
    subcategory: "Dev",
    description: "Gera um identificador único UUID versão 4",
    examples: [' — gera um UUID novo'],
    cooldownMs: 1500,
    execute: async ({ reply, prefix = '.' }) => {
            const crypto = require("crypto");
            const uuid = crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
                const r = Math.random() * 16 | 0;
                return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
            });
            return reply(F.tela({
                emoji: '🆔',
                titulo: 'UUID v4 gerado',
                intro: '`' + uuid + '`',
                secoes: [{
                    emoji: '📋', titulo: 'Outros formatos',
                    linhas: [
                        F.campo('Maiúsculas', '`' + uuid.toUpperCase() + '`'),
                        F.campo('Sem hífens', '`' + uuid.replace(/-/g, '') + '`')
                    ]
                }],
                dica: 'A chance de dois UUID v4 repetirem é tão pequena que dá para usar como chave em banco de dados sem conferir.',
                proximos: [
                    { nome: 'uuid', oque: 'gerar vários de uma vez' },
                    { nome: 'genuuidv4', oque: 'gerar outro' }
                ],
                prefix
            }));
        }
};
