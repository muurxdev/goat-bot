/**
 * Serviço de Conquistas, Insígnias (Badges) e Títulos Honorários do Reino
 * Conectado à coluna `conquistas` da tabela `users` do SQLite
 */

const { getDatabase } = require('../database/connection');
const logger = require('../core/logger');

const BADGES = {
    // Economia & Riqueza
    primeiro_milhao: {
        id: 'primeiro_milhao',
        name: 'Primeiro Milhão',
        title: 'Milionário Central',
        emoji: '💰',
        category: 'economia',
        tier: 'Raro',
        description: 'Acumulou mais de 1.000.000 de moedas no banco do reino.'
    },
    lobo_wallstreet: {
        id: 'lobo_wallstreet',
        name: 'Lobo de Wall Street',
        title: 'Magnata da Bolsa',
        emoji: '📈',
        category: 'economia',
        tier: 'Épico',
        description: 'Operou com sucesso mais de 50 ordens na Bolsa de Valores.'
    },
    imperador_imobiliario: {
        id: 'imperador_imobiliario',
        name: 'Imperador Imobiliário',
        title: 'Senhor dos Castelos',
        emoji: '🏰',
        category: 'economia',
        tier: 'Lendário',
        description: 'Proprietário de pelo menos 10 imóveis no Reino.'
    },
    rei_do_cassino: {
        id: 'rei_do_cassino',
        name: 'Rei do Cassino',
        title: 'Apostador Lendário',
        emoji: '🎰',
        category: 'economia',
        tier: 'Épico',
        description: 'Venceu rodadas de alto risco no Blackjack ou Roleta.'
    },

    // RPG & Combate
    cacador_de_dragoes: {
        id: 'cacador_de_dragoes',
        name: 'Caçador de Dragões',
        title: 'Mata-Dragões',
        emoji: '🐉',
        category: 'rpg',
        tier: 'Lendário',
        description: 'Derrotou o temível Dragão Carmesim em uma Raid de Grupo.'
    },
    general_de_cla: {
        id: 'general_de_cla',
        name: 'General de Clã',
        title: 'Senhor Territorial',
        emoji: '🛡️',
        category: 'rpg',
        tier: 'Épico',
        description: 'Conquistou um dos 8 territórios estratégicos do Reino.'
    },
    forjador_ancestral: {
        id: 'forjador_ancestral',
        name: 'Forjador Ancestral',
        title: 'Mestre da Bigorna',
        emoji: '⚒️',
        category: 'rpg',
        tier: 'Raro',
        description: 'Criou ou aprimorou itens até o grau Lendário na Forja.'
    },
    cavaleiro_sagrado: {
        id: 'cavaleiro_sagrado',
        name: 'Cavaleiro Sagrado de Diamante',
        title: 'Guardião Central',
        emoji: '⚔️',
        category: 'rpg',
        tier: 'Mítico',
        description: 'Alcançou o nível 50 no RPG e desbloqueou a árvore de talentos mestre.'
    },

    // Sabedoria & Escola
    mestre_tabela_periodica: {
        id: 'mestre_tabela_periodica',
        name: 'Mestre dos Elementos',
        title: 'Alquimista Químico',
        emoji: '🧪',
        category: 'escola',
        tier: 'Raro',
        description: 'Consultou e dominou todos os 118 elementos da Tabela Periódica.'
    },
    poliglota_universal: {
        id: 'poliglota_universal',
        name: 'Cidadão do Mundo',
        title: 'Embaixador do Atlas',
        emoji: '🌍',
        category: 'escola',
        tier: 'Raro',
        description: 'Explorou a geografia e dados de dezenas de nações soberanas.'
    },
    sabio_das_trivias: {
        id: 'sabio_das_trivias',
        name: 'Mente Brilhante',
        title: 'Grande Sábio',
        emoji: '🧠',
        category: 'escola',
        tier: 'Épico',
        description: 'Manteve uma sequência invicta de mais de 20 acertos em trivias.'
    },

    // Comunidade & Social
    guardiao_da_paz: {
        id: 'guardiao_da_paz',
        name: 'Guardião da Paz',
        title: 'Protetor do Grupo',
        emoji: '🕊️',
        category: 'social',
        tier: 'Comum',
        description: 'Membro com conduta exemplar sem nenhuma advertência ou infração.'
    },
    lenda_dos_dez_mil: {
        id: 'lenda_dos_dez_mil',
        name: 'Lenda dos 10.000 Comandos',
        title: 'Pioneiro da Era Dourada',
        emoji: '👑',
        category: 'social',
        tier: 'Mítico',
        description: 'Presente no lançamento oficial dos 10.000 comandos canônicos da comunidade.'
    }
};

/**
 * Retorna uma badge pelo ID
 */
function getBadge(id) {
    if (!id) return null;
    return BADGES[id] || null;
}

/**
 * Lista todas as badges disponíveis
 */
function listBadges(category = null) {
    const all = Object.values(BADGES);
    if (!category) return all;
    return all.filter(b => b.category === category);
}

/**
 * Retorna a lista de badges desbloqueadas de um usuário
 */
function getUserBadges(userJid) {
    const db = getDatabase();
    const row = db.prepare('SELECT conquistas FROM users WHERE jid = ?').get(userJid);
    if (!row || !row.conquistas) return [];
    try {
        const arr = JSON.parse(row.conquistas);
        return Array.isArray(arr) ? arr : [];
    } catch (_) {
        return [];
    }
}

/**
 * Desbloqueia uma badge para o usuário
 */
function unlockBadge(userJid, badgeId) {
    const badge = getBadge(badgeId);
    if (!badge) return { success: false, reason: 'Badge inexistente' };

    const db = getDatabase();
    const current = getUserBadges(userJid);
    if (current.includes(badgeId)) {
        return { success: false, reason: 'Já desbloqueada' };
    }

    current.push(badgeId);
    db.prepare(`
        INSERT INTO users (jid, conquistas)
        VALUES (?, ?)
        ON CONFLICT(jid) DO UPDATE SET conquistas = excluded.conquistas
    `).run(userJid, JSON.stringify(current));
    return { success: true, badge };
}

/**
 * Renderiza a vitrine de conquistas do usuário
 */
function renderShowcase(userJid) {
    const userBadges = getUserBadges(userJid);
    const M = require('../utils/moldura');

    if (!userBadges.length) {
        return [
            M.cabecalho('🏅', 'Vitrine de Conquistas'),
            'Nenhuma insígnia conquistada ainda.',
            '💡 Participe de raids, jogue trivias, opere na bolsa e suba de nível para desbloquear insígnias!',
            M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Bot · Perfil')
        ].join('\n\n');
    }

    const lines = userBadges.map(bId => {
        const b = getBadge(bId) || { name: bId, emoji: '🏅', tier: 'Especial', title: 'Aventureiro' };
        return `• ${b.emoji} *${b.name}* [${b.tier}]\n  ↳ Título: _"${b.title}"_`;
    });

    return [
        M.cabecalho('🏅', 'Vitrine de Conquistas & Insígnias'),
        `Total Desbloqueadas: *${userBadges.length}*`,
        M.secao('✨', 'Insígnias Exibidas', lines),
        M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Bot · Perfil')
    ].join('\n\n');
}

module.exports = {
    BADGES,
    getBadge,
    listBadges,
    getUserBadges,
    unlockBadge,
    renderShowcase
};
