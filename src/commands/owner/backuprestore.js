/**
 * Comando .backuprestore
 * Restaura um snapshot específico do SQLite com criação automática de backup de segurança
 */

const { restoreBackup } = require('../../services/backupService')
const logger = require('../../core/logger')
const F = require('../../utils/formato')

module.exports = {
    name: 'backuprestore',
    aliases: ['restore', 'restaurar', 'bkprestore'],
    category: 'owner',
    subcategory: 'Infraestrutura',
    description: 'Volta meus dados para uma cópia de segurança guardada',
    usage: '<nome do arquivo da cópia>',
    examples: ['meliodas_backup_1700000000000.sqlite — volta os dados para essa cópia'],
    ownerOnly: true,
    cooldownMs: 5000,
    execute: async ({ text, reply, prefix = '.' }) => {
        if (!text) {
            return reply(F.tela({
                prefix,
                emoji: '♻️',
                titulo: 'Voltar para uma cópia de segurança',
                intro: 'Troco os dados atuais pelos de uma cópia guardada. Antes disso, guardo uma cópia do estado atual, por garantia.',
                secoes: [{
                    emoji: '✍️', titulo: 'Digite assim', linhas: [
                        F.cmd(prefix, 'backuprestore', '<nome do arquivo>'),
                        `Exemplo: ${F.cmd(prefix, 'backuprestore', 'meliodas_backup_1700000000000.sqlite')}`
                    ]
                }],
                dica: 'Tudo o que mudou depois da cópia escolhida some. Faça um .backup antes se estiver em dúvida.',
                proximos: [
                    { nome: 'backuplist', oque: 'ver os nomes das cópias guardadas' },
                    { nome: 'backup', oque: 'fazer uma cópia agora' }
                ]
            }))
        }

        const filename = text.trim()

        try {
            await reply('⏳ *Voltando os dados para a cópia escolhida...*\n\nAntes, guardo uma cópia do estado atual.')
            const res = restoreBackup(filename)

            return reply(F.tela({
                prefix,
                emoji: '✅',
                titulo: 'Dados restaurados',
                intro: 'Os dados agora estão como na cópia escolhida.',
                secoes: [{
                    emoji: '📋', titulo: 'Detalhes', linhas: [
                        F.campo('Cópia aplicada', '`' + res.restoredFrom + '`'),
                        F.campo('Cópia do estado anterior', '`' + res.safetyBackup + '`')
                    ]
                }],
                dica: 'Se algo ficou errado, restaure a cópia do estado anterior, listada acima.',
                proximos: [
                    { nome: 'backuprestore', args: res.safetyBackup, oque: 'desfazer esta restauração' },
                    { nome: 'auditoria', oque: 'conferir se está tudo em ordem' }
                ]
            }))
        } catch (err) {
            logger.error(`[BACKUP RESTORE ERROR] arquivo="${filename}"`, err)
            const naoAchou = /não encontrado/i.test(String(err?.message || ''))
            return reply(F.tela({
                prefix,
                emoji: '❌',
                titulo: naoAchou ? 'Não achei essa cópia' : 'Não consegui restaurar',
                intro: naoAchou
                    ? 'Não existe cópia guardada com o nome `' + filename.replace(/`/g, "'") + '`. Confira o nome exato na lista.'
                    : 'Algo falhou durante a restauração. O motivo detalhado ficou no log do dia.',
                dica: naoAchou ? 'Copie o nome inteiro, com a extensão no final.' : 'Rode .auditoria para ver se os dados continuam íntegros.',
                proximos: [
                    { nome: 'backuplist', oque: 'ver os nomes das cópias guardadas' },
                    naoAchou ? null : { nome: 'auditoria', oque: 'checar os dados' }
                ].filter(Boolean)
            }))
        }
    }
}
