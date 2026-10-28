/**
 * Comando .bancometa — META DE POUPANÇA
 *
 * Define ou consulta seu objetivo de moedas.
 *
 * As contas ficam em services/bankingService.js; aqui só a apresentação.
 */

const B = require('../../services/bankingService')
const dataService = require('../../services/dataService')
const F = require('../../utils/formato')

module.exports = {
    name: 'bancometa',
    aliases: ["definirmeta","cmd_bancometa","alt_bancometa","atalho_bancometa","abrev_bancometa","call_bancometa","func_bancometa"],
    category: 'economy',
    subcategory: 'Tesouraria',
    description: 'Define ou consulta seu objetivo de moedas',
    usage: '[valor]',
    examples: [' — mostra sua meta e o progresso', '500000 — define a meta em 500.000 moedas'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
        // initializeUser em vez de getUser: getUser devolve null para quem ainda
        // não tem linha no banco, e aí até o glossário respondia "sem cadastro".
        const user = dataService.initializeUser(sender)
        const prefs = B.lerPreferencias(user)
        const p = B.patrimonio(user)
        if (args[0]) {
            const valor = parseInt(String(args[0]).replace(/\D/g, ''), 10)
            if (!valor || valor <= 0) {
                return reply(F.tela({
                    emoji: '🔢',
                    titulo: 'Não entendi o valor',
                    intro: '"' + String(args[0]).slice(0, 30) + '" não é um valor válido. Use um número maior que zero.',
                    secoes: [{ emoji: '✍️', titulo: 'Digite assim', linhas: ['• ' + F.cmd(prefix, 'bancometa', '500000')] }],
                    prefix
                }))
            }
            B.salvarPreferencia(user, 'bancoMeta', valor)
            const pct = Math.min(100, (p.total / valor) * 100)
            return reply(F.tela({
                emoji: '🎯',
                titulo: 'Meta definida',
                intro: 'Sua meta agora é *' + B.moeda(valor) + '*. Você já tem ' + pct.toFixed(1).replace('.', ',') + '% dela.',
                secoes: [{ emoji: '📋', titulo: 'Progresso', linhas: [
                    F.campo('Você tem', B.moeda(p.total)),
                    F.campo('Falta', B.moeda(Math.max(0, valor - p.total))),
                    F.barra(pct / 100)
                ] }],
                proximos: [{ nome: 'bancoquantofalta', oque: 'quanto tempo falta só com rendimento' }],
                prefix
            }))
        }
        if (!prefs.meta) {
            return reply(F.tela({
                emoji: '🎯',
                titulo: 'Meta de poupança',
                intro: 'Você ainda não definiu uma meta. Com ela, eu mostro quanto já juntou e quanto falta.',
                secoes: [
                    { emoji: '💳', titulo: 'Hoje', linhas: [F.campo('Patrimônio', B.moeda(p.total))] },
                    { emoji: '✍️', titulo: 'Digite assim', linhas: [
                        '• ' + F.cmd(prefix, 'bancometa', '500000') + ' — meta de 500.000 🪙',
                        '• ' + F.cmd(prefix, 'bancometa', String(Math.max(1000, Math.ceil(p.total * 2 / 1000) * 1000))) + ' — dobrar o que você tem'
                    ] }
                ],
                dica: 'Uma meta alcançável em poucas semanas motiva mais que uma enorme.',
                prefix
            }))
        }
        const pct = Math.min(100, (p.total / prefs.meta) * 100)
        return reply(F.tela({
            emoji: '🎯',
            titulo: pct >= 100 ? 'Meta alcançada' : 'Meta de poupança',
            intro: pct >= 100
                ? 'Você passou da meta de *' + B.moeda(prefs.meta) + '*. Hora de definir a próxima.'
                : 'Você tem *' + pct.toFixed(1).replace('.', ',') + '%* da meta de ' + B.moeda(prefs.meta) + '.',
            secoes: [{ emoji: '📋', titulo: 'Progresso', linhas: [
                F.campo('Meta', B.moeda(prefs.meta)),
                F.campo('Você tem', B.moeda(p.total)),
                F.campo('Falta', B.moeda(Math.max(0, prefs.meta - p.total))),
                F.barra(pct / 100)
            ] }],
            proximos: [
                pct >= 100 ? { nome: 'bancometa', args: String(prefs.meta * 2), oque: 'dobrar a meta' } : { nome: 'bancoquantofalta', oque: 'quanto tempo falta só com rendimento' },
                { nome: 'banco', args: 'depositar tudo', oque: 'guardar a carteira no banco' }
            ],
            prefix
        }))
    }
}
