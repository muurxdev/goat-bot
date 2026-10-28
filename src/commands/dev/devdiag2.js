/**
 * Comando .diagvida — TEMPO NO AR
 *
 * Há quanto tempo eu (o processo) e a máquina estamos ligados.
 *
 * As leituras vêm de services/diagnosticsService.js; aqui só a apresentação.
 * Comandos da categoria dev não passam pelo tradutor do Reino: aqui o termo
 * técnico é o assunto, não um vazamento.
 */

const D = require('../../services/diagnosticsService')
const F = require('../../utils/formato')

module.exports = {
    name: 'diagvida',
    aliases: ["diaguptime","cmd_diagvida","alt_diagvida","atalho_diagvida","abrev_diagvida","call_diagvida","func_diagvida"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Há quanto tempo eu e a máquina estamos ligados',
    examples: [' — mostra o tempo no ar'],
    cooldownMs: 4000,
    execute: async ({ reply, prefix = '.' }) => {
    const t = D.tempoDeVida()
    if (t.erro) return reply(F.tela({ emoji: '⏱️', titulo: 'Tempo no ar', intro: 'Não consegui ler o tempo no ar agora. O detalhe ficou no registro de erros.', proximos: [{ nome: 'diagresumo', oque: 'resumo geral' }], prefix }))
    const reiniciouHaPouco = t.processoSegundos < 600
    return reply(F.tela({
        emoji: '⏱️',
        titulo: 'Tempo no ar',
        intro: `Estou no ar há *${D.duracao(t.processoSegundos)}*; a máquina, há *${D.duracao(t.maquinaSegundos)}*.`,
        secoes: [{
            emoji: '📋', titulo: 'Detalhes',
            linhas: [
                F.campo('Eu (processo)', D.duracao(t.processoSegundos)),
                F.campo('Máquina', D.duracao(t.maquinaSegundos)),
                F.campo('Liguei em', new Date(t.iniciadoEm).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }))
            ]
        }],
        dica: reiniciouHaPouco ? 'Reiniciei há menos de 10 minutos. Se ninguém mandou reiniciar, vale olhar os registros de erro.' : 'Processo com pouco tempo e máquina com muito indica que só eu reiniciei (atualização ou queda).',
        proximos: [
            { nome: 'diaglogs', oque: 'arquivos de registro' },
            { nome: 'diagmemoria', oque: 'uso de memória' },
            { nome: 'diagresumo', oque: 'resumo geral' }
        ],
        prefix
    }))
    }
}
