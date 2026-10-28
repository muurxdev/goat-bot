/**
 * Comando .diagcpu — USO DE PROCESSAMENTO
 *
 * Quanto processador eu uso e a carga da máquina.
 *
 * As leituras vêm de services/diagnosticsService.js; aqui só a apresentação.
 * Comandos da categoria dev não passam pelo tradutor do Reino: aqui o termo
 * técnico é o assunto, não um vazamento.
 */

const os = require('os')
const D = require('../../services/diagnosticsService')
const F = require('../../utils/formato')

module.exports = {
    name: 'diagcpu',
    aliases: ["cmd_diagcpu","alt_diagcpu","atalho_diagcpu","abrev_diagcpu","call_diagcpu","func_diagcpu"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Quanto processador eu uso e a carga da máquina',
    examples: [' — mostra o uso de processador'],
    cooldownMs: 4000,
    execute: async ({ reply, prefix = '.' }) => {
    const c = D.usoDeCpu()
    if (c.erro) return reply(F.tela({ emoji: '⚙️', titulo: 'Uso de processamento', intro: 'Não consegui ler o uso de processador agora. O detalhe ficou no registro de erros.', proximos: [{ nome: 'diagresumo', oque: 'resumo geral' }], prefix }))
    const nucleos = os.cpus().length || 1
    const cargaRel = c.carga[0] / nucleos
    const veredito = cargaRel < 0.7 ? '🟢 Folgada' : cargaRel < 1 ? '🟡 Ocupada' : '🔴 Sobrecarregada'
    return reply(F.tela({
        emoji: '⚙️',
        titulo: 'Uso de processamento',
        intro: `Uso médio de *${c.percentual.toFixed(1)}%* de um núcleo desde que liguei. Máquina: ${veredito}.`,
        secoes: [
            {
                emoji: '🧠', titulo: 'Meu processo',
                linhas: [
                    F.campo('Tempo em modo usuário', (c.usuarioMs / 1000).toFixed(1) + ' s'),
                    F.campo('Tempo em modo sistema', (c.sistemaMs / 1000).toFixed(1) + ' s'),
                    F.campo('Média desde o início', c.percentual.toFixed(1) + '%')
                ]
            },
            {
                emoji: '🖥️', titulo: 'Máquina',
                linhas: [
                    F.campo('Carga (1 / 5 / 15 min)', c.carga.map(x => x.toFixed(2)).join(' / ')),
                    F.campo('Núcleos', String(nucleos)),
                    F.campo('Ocupação no último minuto', F.barra(cargaRel))
                ]
            }
        ],
        dica: 'Carga maior que o número de núcleos quer dizer fila de tarefas esperando processador. Downloads com conversão de vídeo costumam causar isso.',
        proximos: [
            { nome: 'diagloop', oque: 'ver se o processo está travando' },
            { nome: 'queue', oque: 'fila de downloads' }
        ],
        prefix
    }))
    }
}
