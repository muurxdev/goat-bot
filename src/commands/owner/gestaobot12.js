/**
 * Comando .novosusuarios — Quem se cadastrou nos últimos dias (7 se você não disser quantos)
 *
 * Só leitura: consulta o botManagementService e apresenta com utils/formato.
 */

const G = require('../../services/botManagementService')
const F = require('../../utils/formato')

function quando(v) {
    if (!v) return '—'
    const d = new Date(Number(v) || v)
    return Number.isFinite(d.getTime()) ? d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' }) : '—'
}

function plural(n, um, varios) { return n + ' ' + (n === 1 ? um : varios) }

function nomePessoa(u) {
    return String(u.display_nick || u.name || G.nomeCurto(u.jid)).slice(0, 22)
}

const POR_PAGINA = 15

module.exports = {
    name: 'novosusuarios',
    // Os antigos .novos1dias … .novos90dias eram este mesmo comando com os dias
    // fixos no nome (unificados em 2026-09-18); o número do atalho vira os dias.
    aliases: ["usuariosrecentes", "novos1dias", "novos3dias", "novos15dias", "novos30dias", "novos90dias", "cadastros1", "cadastros3", "cadastros15", "cadastros30", "cadastros90"],
    category: 'owner',
    subcategory: 'Gestão do Bot',
    description: 'Quem se cadastrou nos últimos dias, com página para ver todos',
    usage: '[dias de 1 a 90] [página]',
    examples: [' — cadastros dos últimos 7 dias', '30 — cadastros dos últimos 30 dias', '30 2 — segunda página dos últimos 30 dias'],
    cooldownMs: 3000,
    ownerOnly: true,
    execute: async ({ reply, args = [], commandName = '', prefix = '.' }) => {
    const doAtalho = String(commandName).match(/(\d+)(?:dias)?$/)
    const temDiasNoAtalho = Boolean(doAtalho)
    // No atalho (".novos30dias 2") o primeiro argumento já é a página.
    const dias = Math.min(90, Math.max(1, (temDiasNoAtalho ? parseInt(doAtalho[1], 10) : parseInt(args[0], 10)) || 7))
    const pagina = Math.max(1, parseInt(temDiasNoAtalho ? args[0] : args[1], 10) || 1)
    const r = G.novosUsuariosPagina(dias, pagina, POR_PAGINA)
    if (!r.total) {
        return reply(F.tela({
            emoji: '🆕',
            titulo: 'Ninguém se cadastrou em ' + dias + ' dias',
            intro: 'Esta tela mostra quem fez cadastro nos últimos ' + dias + ' dias, com a data. Nesse período não chegou ninguém.',
            secoes: [{ emoji: '📝', titulo: 'Como alguém se cadastra', linhas: [
                'A pessoa manda no grupo ou no privado:',
                '• ' + F.cmd(prefix, 'login', 'SeuNick') + ' — cria o cadastro e começa a salvar o progresso'
            ] }],
            dica: dias < 90 ? 'Quer olhar mais longe? Diga os dias, de 1 a 90: ' + F.cmd(prefix, 'novosusuarios', dias < 30 ? '30' : '90') + '.' : '',
            prefix
        }))
    }
    const linhas = r.itens.map(u => '• ' + nomePessoa(u) + ' — ' + quando(u.registered_at || u.created_at).slice(0, 10))
    const temMais = r.pagina < r.paginas
    return reply(F.tela({
        emoji: '🆕',
        titulo: plural(r.total, 'cadastro novo', 'cadastros novos') + ' em ' + dias + ' dias',
        intro: r.paginas > 1
            ? 'Página ' + r.pagina + ' de ' + r.paginas + ', do mais recente para o mais antigo.'
            : 'Do mais recente para o mais antigo.',
        secoes: [{ emoji: '👤', titulo: 'Quem chegou', linhas }],
        proximos: [
            temMais ? { nome: 'novosusuarios', args: dias + ' ' + (r.pagina + 1), oque: 'próxima página (' + (r.pagina + 1) + ' de ' + r.paginas + ')' } : null,
            r.pagina > 1 ? { nome: 'novosusuarios', args: dias + ' ' + (r.pagina - 1), oque: 'página anterior' } : null,
            dias < 90 ? { nome: 'novosusuarios', args: '90', oque: 'olhar os últimos 90 dias' } : null,
            { nome: 'usuariosparados', oque: 'quem se cadastrou e nunca usou' }
        ].filter(Boolean),
        prefix
    }))
    }
}
