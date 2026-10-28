/**
 * Comando .diagconexao — ESTADO DA CONEXÃO
 *
 * Se estou conectado ao WhatsApp e com qual número.
 *
 * As leituras vêm de services/diagnosticsService.js; aqui só a apresentação.
 * Comandos da categoria dev não passam pelo tradutor do Reino: aqui o termo
 * técnico é o assunto, não um vazamento.
 */

const D = require('../../services/diagnosticsService')
const F = require('../../utils/formato')

/** Tela para quando a leitura falha (o detalhe já foi para o logger pela sonda). */
function semLeitura(prefix, emoji, titulo, oque) {
    return F.tela({ emoji, titulo, intro: 'Não consegui ler ' + oque + ' agora. O detalhe ficou no registro de erros.', proximos: [{ nome: 'diagresumo', oque: 'resumo geral' }], prefix })
}

module.exports = {
    name: 'diagconexao',
    aliases: ["diagconn","cmd_diagconexao","alt_diagconexao","atalho_diagconexao","abrev_diagconexao","call_diagconexao","func_diagconexao"],
    category: 'dev',
    subcategory: 'Diagnóstico',
    description: 'Se estou conectado ao WhatsApp e com qual número',
    examples: [' — mostra o estado da conexão'],
    cooldownMs: 4000,
    ownerOnly: true,
    execute: async ({ reply, prefix = '.' }) => {
    const c = D.estadoDaConexao()
    if (c.erro) return reply(semLeitura(prefix, '📶', 'Estado da conexão', 'o estado da conexão'))
    const numero = c.eu ? String(c.eu).split(':')[0].split('@')[0] : null
    return reply(F.tela({
        emoji: '📶',
        titulo: 'Estado da conexão',
        intro: c.conectado ? `🟢 Estou conectado ao WhatsApp${numero ? ` como *+${numero}*` : ''}.` : '🔴 Não estou conectado ao WhatsApp neste momento.',
        secoes: [{
            emoji: '📋', titulo: 'Detalhes',
            linhas: [
                F.campo('Conectado', c.conectado ? '🟢 Sim' : '🔴 Não'),
                numero ? F.campo('Número', '+' + numero) : null,
                c.nome ? F.campo('Nome exibido', c.nome) : null,
                c.plataforma ? F.campo('Plataforma', c.plataforma) : null,
                c.registrado != null ? F.campo('Aparelho registrado', c.registrado ? 'sim' : 'não') : null
            ]
        }],
        dica: c.conectado ? 'Se as mensagens não chegam mesmo conectado, teste a rota até o WhatsApp.' : 'Sem conexão, confira a pasta de sessão: se ela sumiu, é preciso parear o número de novo.',
        proximos: [
            { nome: 'diagwhatsapp', oque: 'rota até o WhatsApp' },
            { nome: 'diagsessao', oque: 'arquivos de sessão' }
        ],
        prefix
    }))
    }
}
