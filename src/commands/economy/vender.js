const dataService = require('../../services/dataService')
const logger = require('../../core/logger')
const F = require('../../utils/formato')

const precosLoot = {
    // Mobs Comuns
    '🟢 Fragmento de Bug': 20,
    '🟢 Asa Corrompida': 25,
    '🪲 Casca Binária': 35,
    '🌿 Gosma de Código': 45,
    '🔥 Log Perdido': 80,
    '💾 Arquivo Quebrado': 100,
    '📡 Sinal Perdido': 130,
    '🧯 Fragmento de Firewall': 150,
    '🕷️ Dados Roubados': 180,
    '🔓 Chave Digital': 220,
    '👁️ Lente Sombria': 260,
    '🧬 Gene Corrompido': 320,
    '🐉 Escama Binária': 400,
    '👁️ Olho Ancestral': 500,
    '🗿 Pedra de Script': 650,
    '⚔️ Lâmina Algorítmica': 800,

    // Dungeon & Masmorra
    '🦴 Crânio Amaldiçoado': 200,
    '🗡️ Adaga de Ferro Goblin': 350,
    '🌑 Fragmento de Sombra': 600,
    '🛡️ Brasão de Ferro Real': 1000,
    '🔥 Escama de Dragão Ancestral': 2000,
    '🩸 Sangue Demoníaco Puro': 3000,
    '🪽 Pluma Celestial Sagrada': 4000,
    '👑 Coroa do Soberano Sombrio': 5000,
    '✨ Orbe da Graça Imortal': 6000,
    '🌌 Centelha do Caos Infinito': 10000,

    // Loots de Boss Raid Titânicos
    '🐉 Escama do Dragão Sombria': 3500,
    '🗡️ Lâmina Quebrada Sagrada': 4000,
    '👑 Coroa do Rei Demônio': 5000,
    '🗡️ Espada da Escuridão': 4500,
    '🧬 Fragmento Mandamento': 3000,
    '✨ Asas do Arcanjo': 3500,
    '☀️ Centelha do Sol Cruel': 4000,
    '🛡️ Escudo da Graça': 4000,
    '🪽 Pluma Corrompida': 3000,
    '⚡ Raio da Punição Divina': 4500,
    '⭐ Cristal do Vazio': 2500,
    '🗡️ Lâmina Dimensional': 3000,
    '🛡️ Escudo Abissal': 3000,
    '👑 Coroa do Guardião': 3500,
    '🐉 Escama do Titã Ancestral': 3000
}

module.exports = {
    name: 'vender',
    aliases: ["sell","cmd_vender","alt_vender","atalho_vender","abrev_vender","call_vender","func_vender"],
    category: 'economy',
    subcategory: 'Mercado',
    description: 'Vende todos os loots de monstros, masmorras e raids do inventário por moedas',
    usage: 'loot',
    examples: ['loot — vende de uma vez todo loot vendável do inventário'],
    execute: async ({ args = [], sender, reply, prefix = '.' }) => {
        const user = dataService.initializeUser(sender)
        const inventario = Array.isArray(user.inventario) ? user.inventario : []
        const nomeDe = item => (typeof item === 'object' && item !== null) ? (item.nome || item.name) : String(item)
        const vendaveis = inventario.filter(item => precosLoot[nomeDe(item)])
        const valorPossivel = vendaveis.reduce((a, item) => a + precosLoot[nomeDe(item)], 0)

        if (String(args[0] || '').toLowerCase() !== 'loot') {
            return reply(F.tela({
                emoji: '💰',
                titulo: 'Vender loot',
                intro: vendaveis.length
                    ? 'Você tem *' + vendaveis.length + '* ' + (vendaveis.length === 1 ? 'loot vendável' : 'loots vendáveis') + ', que valem *' + valorPossivel.toLocaleString('pt-BR') + ' moedas*.'
                    : 'Aqui eu compro os loots de monstros, masmorras e raids. Agora você não tem nenhum para vender.',
                secoes: [
                    { emoji: '✍️', titulo: 'Digite assim', linhas: ['• ' + F.cmd(prefix, 'vender', 'loot') + ' — vende todo loot vendável de uma vez'] },
                    { emoji: '💎', titulo: 'Alguns preços', linhas: [
                        F.campo('🟢 Fragmento de Bug', '20 moedas'),
                        F.campo('🛡️ Brasão de Ferro Real', '1.000 moedas'),
                        F.campo('🌌 Centelha do Caos Infinito', '10.000 moedas')
                    ] }
                ],
                dica: 'Só loot de monstros, masmorras e raids é vendido. Armas, poções e outros itens ficam no inventário.',
                proximos: [{ nome: 'inventario', oque: 'ver o que você carrega' }],
                prefix
            }))
        }

        if (!vendaveis.length) {
            return reply(F.tela({
                emoji: '📦',
                titulo: 'Nada para vender',
                intro: inventario.length
                    ? 'Nenhum item do seu inventário é loot vendável. Só compro loot de monstros, masmorras e raids.'
                    : 'Seu inventário está vazio.',
                dica: 'Caçar monstros e entrar em masmorras rende loot para vender aqui.',
                proximos: [{ nome: 'inventario', oque: 'ver o que você carrega' }],
                prefix
            }))
        }

        let total = 0
        const vendidos = []

        user.inventario = inventario.filter(item => {
            const nomeItem = nomeDe(item)
            if (nomeItem && precosLoot[nomeItem]) {
                total += precosLoot[nomeItem]
                vendidos.push(nomeItem)
                return false
            }
            return true
        })

        const carteiraAntes = user.coins || 0
        user.coins = carteiraAntes + total
        // Reduz a mochila: precisa de force para o inventário menor ser gravado.
        dataService.saveUser(user, { force: true })
        logger.info('[VENDER] User ' + sender + ' vendeu ' + vendidos.length + ' loots por ' + total + ' coins')

        // Agrupa repetidos: "• 🟢 Fragmento de Bug ×3 — 60 moedas".
        const contagem = new Map()
        for (const nome of vendidos) contagem.set(nome, (contagem.get(nome) || 0) + 1)
        const linhas = [...contagem.entries()]
            .sort((a, b) => precosLoot[b[0]] * b[1] - precosLoot[a[0]] * a[1])
            .map(([nome, n]) => '• ' + nome + (n > 1 ? ' ×' + n : '') + ' — ' + (precosLoot[nome] * n).toLocaleString('pt-BR') + ' moedas')
        const mostrar = linhas.slice(0, 15)
        if (linhas.length > 15) mostrar.push('• e mais ' + (linhas.length - 15) + ' tipos de item')

        return reply(F.tela({
            emoji: '💰',
            titulo: 'Loot vendido',
            intro: 'Vendi *' + vendidos.length + '* ' + (vendidos.length === 1 ? 'item' : 'itens') + ' e você recebeu *' + total.toLocaleString('pt-BR') + ' moedas*.',
            secoes: [
                { emoji: '📦', titulo: 'Itens vendidos', linhas: mostrar },
                { emoji: '💳', titulo: 'Antes e depois', linhas: [
                    F.campo('Recebido', '+' + total.toLocaleString('pt-BR') + ' moedas'),
                    F.campo('Carteira', carteiraAntes.toLocaleString('pt-BR') + ' → *' + user.coins.toLocaleString('pt-BR') + ' moedas*')
                ] }
            ],
            dica: 'Guarde as moedas no banco para não perder num roubo.',
            proximos: [
                { nome: 'banco', args: 'depositar tudo', oque: 'guardar no banco' },
                { nome: 'inventario', oque: 'ver o que sobrou' }
            ],
            prefix
        }))
    }
}
