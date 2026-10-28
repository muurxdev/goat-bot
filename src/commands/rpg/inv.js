/**
 * Comando .inv / .inventario / .itens
 * Painel completo de Inventário com visualização dos 7 Slots de Equipamentos, Loots, Minérios e Capacidade
 */

const dataService = require('../../services/dataService');
const { initializeUser } = require('../../services/xpService');
const { getItem, ITEMS_DB } = require('../../services/rpgEquipmentService');
const { calculateFullCharacterStats } = require('../../services/characterEngine');
const { formatNumber, moedas, plural, marcar, NOME_ESPACO } = require('../../utils/textoRpg');
const F = require('../../utils/formato');

/** Retorna o nome legível de um item (string ou objeto) */
function itemDisplayName(item) {
    if (!item) return 'Item desconhecido';
    if (typeof item === 'object' && item !== null) {
        return item.nome || item.name || item.id || 'Item desconhecido';
    }
    return String(item);
}

/** Verifica se um item casa com um filtro de texto */
function itemMatchesFilter(item, filters) {
    const name = itemDisplayName(item).toLowerCase();
    return filters.some(f => name.includes(f.toLowerCase()));
}

/**
 * Equipamento do catálogo: objeto com espaço, ou texto com o nome exato de uma
 * peça. Não usa getItem para texto porque a busca dele é aproximada e trataria
 * espólio comum como arma.
 */
const NOMES_EQUIPAMENTO = new Set(Object.values(ITEMS_DB).map(i => i.nome.toLowerCase()));
function ehEquipamento(item) {
    if (item && typeof item === 'object') return Boolean(item.slot);
    return NOMES_EQUIPAMENTO.has(String(item || '').toLowerCase());
}

/** Junta itens repetidos: [["Crânio", 3], ...] na ordem em que aparecem. */
function agrupar(itens) {
    const mapa = new Map();
    for (const i of itens) {
        const nome = itemDisplayName(i);
        mapa.set(nome, (mapa.get(nome) || 0) + 1);
    }
    return [...mapa.entries()];
}

/** Linhas de um grupo, com teto para a mensagem não passar do "Ler mais" útil. */
function linhasGrupo(itens, teto = 8, marca = () => '') {
    const grupos = agrupar(itens);
    const linhas = grupos.slice(0, teto).map(([nome, qtd]) => `• ${nome}${qtd > 1 ? ` ×${qtd}` : ''}${marca(nome)}`);
    if (grupos.length > teto) {
        const resto = grupos.slice(teto).reduce((soma, [, qtd]) => soma + qtd, 0);
        linhas.push(`_e mais ${plural(resto, 'item', 'itens')}_`);
    }
    return linhas;
}

module.exports = {
    name: 'inv',
    aliases: ['itens', 'meusitens', 'equipamentos'],
    category: 'rpg',
    subcategory: 'Personagem',
    description: 'Mostra o que você tem equipado e o que carrega na mochila',
    examples: [' — mostra a mochila por tipo de item, o espaço ocupado e o que está equipado'],
    cooldownMs: 2000,
    execute: async ({ sender, reply, prefix = '.' }) => {
        const xpData = dataService.getXpData();
        const user = initializeUser(sender, xpData);
        const stats = calculateFullCharacterStats(user);

        const slots = user.slots || {};
        const inventario = Array.isArray(user.inventario) ? user.inventario : [];
        const limiteMochila = user.mochila || 20;
        const ocupado = inventario.length;
        const livres = Math.max(0, limiteMochila - ocupado);
        const cheia = ocupado >= limiteMochila;

        const nomeSlot = (ref) => {
            if (!ref) return '_vazio_';
            if (typeof ref === 'object') return `${ref.nome || ref.name}${ref.raridade ? ` (${ref.raridade})` : ''}`;
            const it = getItem(ref);
            return it ? `${it.nome} (${it.raridade || '⚪ Comum'})` : String(ref);
        };
        const refArma = slots.arma || user.arma;
        const linhasEquipado = ['capacete', 'peitoral', 'calca', 'botas', 'arma', 'escudo', 'amuleto'].map(s => {
            const ref = s === 'arma' ? refArma : slots[s];
            const forja = s === 'arma' && ref ? ` · forja +${user.forgeLevel || 0}` : '';
            return F.campo(NOME_ESPACO[s], nomeSlot(ref) + forja);
        });
        const qtdEquipada = ['capacete', 'peitoral', 'calca', 'botas', 'escudo', 'amuleto'].filter(s => slots[s]).length + (refArma ? 1 : 0);

        // Separação por tipo — suporta AMBOS os formatos (texto e objeto)
        const bossFilters = ['Chip', 'Cristal', 'Núcleo', 'Chama', 'Exploit', 'Escama', 'Coroa', 'Trevas', 'Asas', 'Mítico', 'Mandamento'];
        const mobFilters = ['Fragmento', 'Asa', 'Casca', 'Gosma', 'Log', 'Chave', 'Pena', 'Crânio', 'Sangue'];

        const equipamentos = inventario.filter(ehEquipamento);
        const resto = inventario.filter(i => !equipamentos.includes(i));
        const lootBoss = resto.filter(i => itemMatchesFilter(i, bossFilters));
        const lootMobs = resto.filter(i => !lootBoss.includes(i) && itemMatchesFilter(i, mobFilters));
        const outrosItens = resto.filter(i => !lootBoss.includes(i) && !lootMobs.includes(i));

        // As lojas guardam uma cópia na mochila e vestem ao mesmo tempo; marcamos a
        // cópia para o jogador não achar que tem uma peça sobrando.
        const idsVestidos = new Set(['capacete', 'peitoral', 'calca', 'botas', 'escudo', 'amuleto']
            .map(s => slots[s]).concat(refArma)
            .map(r => (r && typeof r === 'object') ? r.id : r).filter(Boolean));
        const nomesVestidos = new Set([...idsVestidos].map(id => getItem(id)?.nome).filter(Boolean));
        const marcaVestido = nome => nomesVestidos.has(nome) ? ' · _igual ao que está vestido_' : '';
        const primeiroEquip = equipamentos.find(i => typeof i === 'object' && i.id && !idsVestidos.has(i.id)) || null;

        let intro;
        if (!ocupado) intro = `${marcar(sender)}, sua mochila está vazia. Você tem *${plural(limiteMochila, 'espaço livre', 'espaços livres')}* e *${moedas(user.coins || 0)}*.`;
        else if (cheia) intro = `${marcar(sender)}, sua mochila está *cheia* (${formatNumber(ocupado)} de ${formatNumber(limiteMochila)}). O próximo espólio que cair vai ficar para trás.`;
        else intro = `${marcar(sender)}, você carrega *${plural(ocupado, 'item', 'itens')}* e ainda cabem *${formatNumber(livres)}*.`;

        let dica;
        if (!ocupado) dica = 'Caçadas e expedições enchem a mochila com espólios e, com sorte, equipamentos.';
        else if (cheia) dica = 'Venda espólios, guarde itens no baú ou aumente a mochila antes de caçar de novo.';
        else if (primeiroEquip) dica = 'Equipamento parado na mochila não ajuda em luta: vista o melhor com .equipar.';
        else dica = 'Espólios de chefes valem mais na venda que materiais de monstros.';

        const doc = F.tela({
            emoji: '🎒',
            titulo: 'Sua mochila',
            intro,
            secoes: [
                { emoji: '📦', titulo: 'Espaço', linhas: [
                    F.campo('Ocupação', `${F.barra(ocupado / limiteMochila)} (${formatNumber(ocupado)} de ${formatNumber(limiteMochila)})`),
                    F.campo('Poder de combate', formatNumber(stats.cp)),
                    F.campo('Saldo', moedas(user.coins || 0))
                ] },
                { emoji: '⚔️', titulo: `Equipado (${qtdEquipada} de 7)`, linhas: linhasEquipado },
                { emoji: '🗡️', titulo: 'Equipamentos guardados', linhas: linhasGrupo(equipamentos, 8, marcaVestido) },
                { emoji: '🐉', titulo: 'Espólios de chefes', linhas: linhasGrupo(lootBoss) },
                { emoji: '👾', titulo: 'Materiais de monstros', linhas: linhasGrupo(lootMobs) },
                { emoji: '📦', titulo: 'Outros itens', linhas: linhasGrupo(outrosItens) }
            ],
            dica,
            proximos: [
                primeiroEquip ? { nome: 'equipar', args: primeiroEquip.id, oque: `vestir ${primeiroEquip.nome}` } : null,
                !ocupado ? { nome: 'hunt', oque: 'caçar e trazer espólios' } : null,
                (cheia || lootMobs.length || lootBoss.length) ? { nome: 'vender', args: 'loot', oque: 'vender os espólios' } : null,
                ocupado ? { nome: 'bau', args: 'guardar <item>', oque: 'guardar um item no baú' } : null,
                { nome: 'mochila', args: 'up', oque: 'aumentar a mochila em 10 espaços' },
                { nome: 'boneco', oque: 'ver a ficha completa do personagem' }
            ].filter(Boolean).slice(0, 4),
            prefix
        });

        return reply(doc, [sender]);
    }
};
