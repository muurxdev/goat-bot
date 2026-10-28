/**
 * Comando .aprender — APRENDER HABILIDADE
 *
 * Gasta um ponto para dominar uma habilidade.
 */

const EQ = require('../../services/rpgEquipmentService')
const F = require('../../services/forgeService')
const SK = require('../../services/skillTreeService')
const dataService = require('../../services/dataService')
const Fmt = require('../../utils/formato')

function cab(titulo, emoji) {
    return '╔══════════════════════════════╗\n║   ' + emoji + ' *' + titulo + '*\n╚══════════════════════════════╝\n\n'
}
function linha(rotulo, valor) { return '┃ *' + rotulo + ':* ' + valor + '\n' }
function sep() { return '┣━━━━━━━━━━━━━━━━━━━━━━━━┫\n' }
function bloco(titulo, itens) {
    let t = '╭━〔 ' + titulo + ' 〕━⬣\n'
    for (const i of itens) t += '┃ ' + i + '\n'
    return t + '╰━━━━━━━━━━━━━━━━━━⬣\n'
}
function barra(fracao) {
    const f = Math.max(0, Math.min(1, Number(fracao) || 0))
    return '[' + '█'.repeat(Math.round(f * 20)) + '░'.repeat(20 - Math.round(f * 20)) + '] ' + (f * 100).toFixed(0) + '%'
}

function num(v) { return Number(v || 0).toLocaleString('pt-BR') }

/** Ficha de um item do catálogo. */
function fichaItem(id) {
    const i = EQ.ITEMS_DB[id]
    if (!i) return '❌ Esse item não existe mais no catálogo.'
    let doc = cab(String(i.nome).toUpperCase(), '⚔️')
    doc += linha('Raridade', i.raridade)
    doc += linha('Encaixe', i.slot)
    doc += linha('Tipo', i.tipo || i.slot)
    doc += sep()
    if (i.atk) doc += linha('Ataque', '+' + num(i.atk))
    if (i.def) doc += linha('Defesa', '+' + num(i.def))
    if (i.hp) doc += linha('Vida', '+' + num(i.hp))
    if (i.crit) doc += linha('Crítico', '+' + i.crit + '%')
    if (i.buffs) {
        const b = []
        if (i.buffs.danoPct) b.push('+' + i.buffs.danoPct + '% dano')
        if (i.buffs.defPct) b.push('+' + i.buffs.defPct + '% defesa')
        if (i.buffs.xpPct) b.push('+' + i.buffs.xpPct + '% XP')
        if (i.buffs.critPct) b.push('+' + i.buffs.critPct + '% crítico')
        if (b.length) doc += linha('Bônus percentual', b.join(' · '))
    }
    doc += linha('Poder de combate', num(i.cp))
    doc += linha('Preço', num(i.preco) + ' 🪙')
    if (i.preco && i.cp) doc += linha('Custo por ponto', num(Math.round(i.preco / i.cp)) + ' 🪙')
    return doc
}

/** Itens do catálogo por um filtro qualquer. */
function itensPor(filtro) {
    return Object.entries(EQ.ITEMS_DB).map(([id, i]) => ({ id, ...i })).filter(filtro)
}

module.exports = {
    name: 'aprender',
    aliases: ["aprenderhabilidade"],
    category: 'rpg',
    subcategory: 'Equipamento & Forja',
    description: 'Gasta um ponto para dominar uma habilidade',
    usage: '[habilidade]',
    examples: [' — lista as habilidades da sua classe que dá para aprender agora', 'raiva — aprende a habilidade Raiva Crescente'],
    cooldownMs: 3000,
    execute: async ({ reply, sender, args = [], prefix = '.' }) => {
    const user = dataService.initializeUser(sender)
    const chave = String(args[0] || '').toLowerCase()
    if (!chave) {
        const mapa = SK.mapaDe(user)
        if (!mapa) {
            return reply(Fmt.tela({
                emoji: '✨',
                titulo: 'Você ainda não tem classe',
                intro: 'As habilidades vêm da árvore da sua classe. Escolha uma classe primeiro e a árvore dela aparece aqui.',
                secoes: [{ emoji: '📜', titulo: 'Como funciona', linhas: [
                    '• Cada classe tem a própria árvore de habilidades',
                    `• Você ganha 1 ponto a cada ${SK.NIVEIS_POR_PONTO} níveis`,
                    '• Cada habilidade custa pontos e dá bônus de verdade no combate'
                ] }],
                dica: 'A classe define o estilo de luta, e a árvore reforça esse estilo.',
                proximos: [
                    { nome: 'classe', oque: 'ver e escolher uma classe' },
                    { nome: 'arvore', oque: 'ver a árvore depois de escolher' }
                ],
                prefix
            }))
        }
        const s = SK.saldoDe(user)
        const livres = mapa.nos.filter(n => n.estado === 'disponivel')
        if (!livres.length) {
            const proxima = mapa.nos.find(n => n.estado === 'nivel' || n.estado === 'sem-pontos')
            return reply(Fmt.tela({
                emoji: '✨',
                titulo: 'Nenhuma habilidade disponível agora',
                intro: `Você tem *${num(s.livres)}* ponto(s) livre(s) e nenhuma habilidade da árvore ${mapa.arvore.nome} está ao alcance neste momento.`,
                secoes: [{ emoji: '🎯', titulo: 'A próxima', linhas: proxima ? [
                    Fmt.campo('Habilidade', proxima.nome),
                    Fmt.campo('Pede', `nível ${proxima.nivel} e ${proxima.custo} ponto(s)`),
                    Fmt.campo('Efeito', proxima.efeito)
                ] : ['Você já domina todas as habilidades da árvore.'] }],
                dica: 'Subir de nível dá pontos novos e libera habilidades mais fortes.',
                proximos: [
                    { nome: 'arvore', oque: 'ver a árvore inteira' },
                    { nome: 'hunt', oque: 'caçar e subir de nível' }
                ],
                prefix
            }))
        }
        return reply(Fmt.tela({
            emoji: '✨',
            titulo: 'Habilidades para aprender',
            intro: `Você tem *${num(s.livres)}* ponto(s) livre(s) e ${livres.length} habilidade(s) ao alcance.`,
            secoes: [{ emoji: '📜', titulo: 'Disponíveis agora', linhas: livres.flatMap(n => [
                `• *${n.nome}* · ${n.custo} ponto(s) — ${Fmt.cmd(prefix, 'aprender', n.chave)}`,
                `   ${n.efeito}`
            ]) }],
            dica: 'O efeito já vale no próximo combate.',
            proximos: [
                { nome: 'aprender', args: livres[0].chave, oque: `aprender ${livres[0].nome}` },
                { nome: 'arvore', oque: 'ver a árvore inteira' }
            ],
            prefix
        }))
    }
    const r = SK.aprender(user, chave)
    if (!r.ok) {
        return reply(Fmt.tela({
            emoji: '❌',
            titulo: 'Não deu para aprender',
            intro: r.erro,
            dica: 'A árvore mostra o que cada habilidade pede e o que já está liberado.',
            proximos: [
                { nome: 'aprender', oque: 'ver o que dá para aprender agora' },
                { nome: 'arvore', oque: 'ver a árvore inteira' }
            ],
            prefix
        }))
    }
    const s = SK.saldoDe(user)
    return reply(Fmt.tela({
        emoji: '✨',
        titulo: 'Habilidade aprendida',
        intro: `Você agora domina *${r.habilidade.nome}*: ${r.habilidade.efeito}.`,
        secoes: [{ emoji: '📜', titulo: 'Detalhes', linhas: [
            Fmt.campo('Habilidade', r.habilidade.nome),
            Fmt.campo('Efeito', r.habilidade.efeito),
            Fmt.campo('Pontos restantes', num(s.livres))
        ] }],
        dica: 'O efeito já vale no próximo combate.',
        proximos: [
            { nome: 'bonusarvore', oque: 'ver o total de bônus da árvore' },
            { nome: 'hunt', oque: 'testar numa caçada' }
        ],
        prefix
    }))
    }
}
