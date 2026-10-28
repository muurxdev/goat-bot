/**
 * Comando .diagversoes — VERSÕES
 *
 * Minha versão, a do Node.js e das bibliotecas que eu uso.
 *
 * As leituras vêm de services/diagnosticsService.js; aqui só a apresentação.
 * Comandos da categoria dev não passam pelo tradutor do Reino: aqui o termo
 * técnico é o assunto, não um vazamento.
 */

const D = require('../../services/diagnosticsService')
const F = require('../../utils/formato')

module.exports = {
    name: 'diagversoes',
    aliases: ["diagversao","cmd_diagversoes","alt_diagversoes","atalho_diagversoes","abrev_diagversoes","call_diagversoes","func_diagversoes"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Minha versão, a do Node.js e a das bibliotecas que eu uso',
    examples: [' — mostra as versões'],
    cooldownMs: 4000,
    execute: async ({ reply, prefix = '.' }) => {
    const v = D.versoes()
    if (v.erro) return reply(F.tela({ emoji: '📦', titulo: 'Versões', intro: 'Não consegui ler as versões agora. O detalhe ficou no registro de erros.', proximos: [{ nome: 'diagresumo', oque: 'resumo geral' }], prefix }))
    const todas = Object.entries(v.dependencias)
    const deps = todas.slice(0, 12)
    return reply(F.tela({
        emoji: '📦',
        titulo: 'Versões',
        intro: `Estou na versão *${v.bot}*, rodando no Node.js *${v.node}*.`,
        secoes: [
            {
                emoji: '⚙️', titulo: 'Base',
                linhas: [F.campo('Eu', v.bot), F.campo('Node.js', v.node), F.campo('Motor V8', v.v8)]
            },
            {
                emoji: '📚', titulo: `Bibliotecas (${deps.length} de ${todas.length})`,
                linhas: F.lista(deps.map(([nome, faixa]) => `${nome} ${faixa}`))
            }
        ],
        dica: 'O Baileys (conexão com o WhatsApp) é a biblioteca que mais quebra entre versões: atualize com cuidado.',
        proximos: [
            { nome: 'diagambiente', oque: 'ambiente de execução' },
            { nome: 'diagsistema', oque: 'dados da máquina' }
        ],
        prefix
    }))
    }
}
