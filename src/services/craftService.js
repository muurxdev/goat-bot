/**
 * craftService.js
 * Sistema de Forja Lendária, Alquimia e Encantamento de Relíquias de Reino.
 * Catálogo de receitas, exigências de nível, consumo de materiais e geração de itens.
 */

const { getDatabase } = require('../database/connection')
const economyService = require('./economyService')
const logger = require('../core/logger')

const RECIPES = {
    // Alquimia & Poções
    'pocao_vida_suprema': {
        id: 'pocao_vida_suprema',
        name: 'Elixir da Vitalidade Divina',
        category: 'alquimia',
        levelReq: 5,
        cost: 1500,
        materials: '2x Frascos de Cristal, 1x Água Sagrada',
        result: 'Elixir da Vitalidade (+500 HP instantâneo)',
        desc: 'Restaura totalmente os pontos de vida e confere regeneração passiva por 1 hora.'
    },
    'pocao_furia_demonio': {
        id: 'pocao_furia_demonio',
        name: 'Extrato de Fogo do Purgatório',
        category: 'alquimia',
        levelReq: 10,
        cost: 3500,
        materials: '3x Cinzas Demoníacas, 1x Chifre de Demônio Vermelho',
        result: 'Fogo do Purgatório (+35% Dano por 2 horas)',
        desc: 'Aumenta temporariamente todo o dano físico e mágico em combate contra chefes.'
    },
    'pocao_invisibilidade': {
        id: 'pocao_invisibilidade',
        name: 'Essência da Névoa Sombria',
        category: 'alquimia',
        levelReq: 8,
        cost: 2800,
        materials: '2x Ectoplasma, 1x Flor da Noite Eterna',
        result: 'Névoa Sombria (+25% Esquiva por 1 hora)',
        desc: 'Permite desviar de ataques letais e ataques surpresa de monstros.'
    },

    // Forja de Armas e Armaduras Lendárias
    'forja_espada_central': {
        id: 'forja_espada_central',
        name: 'Espada Longa dos Cavaleiros Sagrados',
        category: 'forja',
        levelReq: 12,
        cost: 8000,
        materials: '5x Lingotes de Aço Reforçado, 2x Fragmentos de Luz',
        result: 'Espada Longa Central (ATK +120, Crítico +10%)',
        desc: 'Arma padrão de alta nobreza com lâmina de corte afiado e encantamento sagrado.'
    },
    'forja_sombria_replica': {
        id: 'forja_sombria_replica',
        name: 'Réplica Mágica da Sombria',
        category: 'forja',
        levelReq: 25,
        cost: 35000,
        materials: '10x Aço das Fadas, 5x Cristais de Fogo, 1x Essência do Dragão',
        result: 'Sombria Réplica (ATK +350, Clones de Ilusão)',
        desc: 'Cria clones mágicos em combate dividindo o dano sofrido entre cópias.'
    },
    'forja_rhitta_machado': {
        id: 'forja_rhitta_machado',
        name: 'Machado Divino Rhitta - Forja Imperial',
        category: 'forja',
        levelReq: 30,
        cost: 50000,
        materials: '15x Ouro Solar, 8x Minérios do Meio-Dia, 3x Brasas do Sol',
        result: 'Machado Rhitta (ATK +500, Explosão Solar)',
        desc: 'Absorve energia ao longo da manhã e desfere golpes devastadores de fogo puro.'
    },
    'forja_chastiefol_lanca': {
        id: 'forja_chastiefol_lanca',
        name: 'Lança Espiritual Espiritual Reforçada',
        category: 'forja',
        levelReq: 20,
        cost: 28000,
        materials: '8x Troncos da Árvore Sagrada, 4x Pólen das Fadas',
        result: 'Espiritual (ATK +280, Troca de Formas)',
        desc: 'Permite alternar entre formato lança de ataque rápido e formato travesseiro de defesa.'
    },
    'forja_armadura_paladino': {
        id: 'forja_armadura_paladino',
        name: 'Placa Completa do Paladino Guardião',
        category: 'forja',
        levelReq: 15,
        cost: 16000,
        materials: '8x Placas de Titânio, 4x Selos de Proteção',
        result: 'Armadura do Paladino (DEF +180, HP +400)',
        desc: 'Blindagem pesada impenetrável contra flechas e ataques de monstros comuns.'
    },

    // Encantamentos & Gemas Mágicas
    'encantamento_runa_sol': {
        id: 'encantamento_runa_sol',
        name: 'Runa Ancestral do Sol Ardente',
        category: 'encantamento',
        levelReq: 10,
        cost: 6000,
        materials: '3x Fragmentos de Rubi, 1x Selo Solar',
        result: 'Runa do Sol (Gera queimadura contínua no inimigo)',
        desc: 'Encanta qualquer arma equipada com efeito de combustão mágica.'
    },
    'encantamento_runa_gelo': {
        id: 'encantamento_runa_gelo',
        name: 'Runa do Vento Congelante',
        category: 'encantamento',
        levelReq: 10,
        cost: 6000,
        materials: '3x Safiras da Montanha, 1x Selo de Gelo',
        result: 'Runa do Gelo (Reduz ataque e velocidade do alvo)',
        desc: 'Encanta armaduras para congelar oponentes que desferirem ataques corpo a corpo.'
    }
}

function getAllRecipes() {
    return Object.values(RECIPES)
}

function getRecipesByCategory(category) {
    category = String(category).toLowerCase().trim()
    return Object.values(RECIPES).filter(r => r.category === category)
}

function craftItem(jid, recipeId) {
    recipeId = String(recipeId).toLowerCase().trim()
    const rec = RECIPES[recipeId]
    if (!rec) {
        return {
            success: false,
            message: `Receita *${recipeId}* não encontrada. Use \`.receitas\` para ver o catálogo de forja.`
        }
    }

    const user = economyService.carregarUsuario(jid)
    if ((user.level || 1) < rec.levelReq) {
        return {
            success: false,
            message: `Nível insuficiente! Esta receita requer *Nível ${rec.levelReq}* no RPG. Seu nível atual é *${user.level || 1}*.`
        }
    }

    if ((user.coins || 0) < rec.cost) {
        return {
            success: false,
            message: `Custo de materiais da forja: *${rec.cost.toLocaleString('pt-BR')} moedas*. Saldo insuficiente.`
        }
    }

    // Debita moedas
    user.coins = (user.coins || 0) - rec.cost

    // Adiciona ao inventário
    const inv = Array.isArray(user.inventario) ? user.inventario : JSON.parse(user.inventario || '[]')
    inv.push({
        id: rec.id,
        nome: rec.result,
        tipo: rec.category,
        craftedAt: Date.now()
    })
    user.inventario = inv

    economyService.salvarUsuario ? economyService.salvarUsuario(user) : require('./dataService').saveUser(user)

    const db = getDatabase()
    db.prepare(`
        INSERT OR REPLACE INTO crafts (jid, item_nome, created_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
    `).run(jid, rec.result)

    return {
        success: true,
        recipeName: rec.name,
        resultItem: rec.result,
        cost: rec.cost,
        newBalance: user.coins
    }
}

module.exports = {
    RECIPES,
    getAllRecipes,
    getRecipesByCategory,
    craftItem
}
