/**
 * ÁRVORES DE HABILIDADE — progressão de escolha, não só de número.
 *
 * O RPG subia de nível e o personagem ficava maior, mas nunca DIFERENTE: dois
 * guerreiros de nível 80 eram idênticos. As árvores dão a cada jogador uma
 * decisão que o distingue — e uma decisão só é decisão se custa: os pontos são
 * limitados, então investir num ramo é abrir mão de outro.
 *
 * Regras da casa:
 *   - 1 ponto a cada 5 níveis; nada de ganhar tudo
 *   - habilidade só abre se o requisito anterior estiver pago (é árvore, não lista)
 *   - cada classe tem a SUA árvore, com efeitos que combinam com ela
 *   - o estado vive em `extra` do usuário, sem migração de banco
 */

const dataService = require('./dataService')
const logger = require('../core/logger')

/** Um ponto de habilidade a cada tantos níveis. */
const NIVEIS_POR_PONTO = 5

/**
 * As árvores, uma por classe.
 *
 * `req` é a habilidade que precisa estar paga antes. `nivel` é o nível mínimo
 * do personagem. `efeito` descreve o que muda; `bonus` é o que o motor aplica.
 */
const ARVORES = {
    guerreiro: {
        nome: '⚔️ Caminho do Aço',
        descricao: 'Resistência e dano bruto. Aguenta o que vier e devolve.',
        habilidades: {
            postura: { nome: 'Postura Firme', nivel: 1, custo: 1, req: null, efeito: '+8% de defesa', bonus: { defPct: 8 } },
            golpe: { nome: 'Golpe Pesado', nivel: 5, custo: 1, req: 'postura', efeito: '+10% de ataque', bonus: { atkPct: 10 } },
            couraca: { nome: 'Couraça de Reino', nivel: 15, custo: 2, req: 'postura', efeito: '+15% de vida máxima', bonus: { hpPct: 15 } },
            furia: { nome: 'Fúria Contida', nivel: 25, custo: 2, req: 'golpe', efeito: '+12% de ataque e +5% de crítico', bonus: { atkPct: 12, critPct: 5 } },
            muralha: { nome: 'Muralha Viva', nivel: 40, custo: 3, req: 'couraca', efeito: '+20% de defesa e +10% de bloqueio', bonus: { defPct: 20, bloqPct: 10 } },
            devastar: { nome: 'Devastação', nivel: 60, custo: 3, req: 'furia', efeito: '+25% de ataque', bonus: { atkPct: 25 } },
            imortal: { nome: 'Vontade Imortal', nivel: 90, custo: 4, req: 'muralha', efeito: '+30% de vida e +15% de defesa', bonus: { hpPct: 30, defPct: 15 } }
        }
    },
    mago: {
        nome: '🔮 Círculo Arcano',
        descricao: 'Dano mágico crescente ao custo de resistência.',
        habilidades: {
            foco: { nome: 'Foco Arcano', nivel: 1, custo: 1, req: null, efeito: '+10% de ataque', bonus: { atkPct: 10 } },
            canalizar: { nome: 'Canalização', nivel: 5, custo: 1, req: 'foco', efeito: '+8% de crítico', bonus: { critPct: 8 } },
            barreira: { nome: 'Barreira Etérea', nivel: 15, custo: 2, req: 'foco', efeito: '+12% de vida máxima', bonus: { hpPct: 12 } },
            explosao: { nome: 'Explosão Rúnica', nivel: 25, custo: 2, req: 'canalizar', efeito: '+18% de ataque', bonus: { atkPct: 18 } },
            tempestade: { nome: 'Tempestade de Mana', nivel: 40, custo: 3, req: 'explosao', efeito: '+15% de crítico', bonus: { critPct: 15 } },
            singularidade: { nome: 'Singularidade', nivel: 60, custo: 3, req: 'explosao', efeito: '+30% de ataque', bonus: { atkPct: 30 } },
            onisciencia: { nome: 'Onisciência', nivel: 90, custo: 4, req: 'singularidade', efeito: '+35% de ataque e +10% de crítico', bonus: { atkPct: 35, critPct: 10 } }
        }
    },
    arqueiro: {
        nome: '🏹 Trilha do Vento',
        descricao: 'Crítico e esquiva. Acerta primeiro e não é acertado.',
        habilidades: {
            mira: { nome: 'Mira Firme', nivel: 1, custo: 1, req: null, efeito: '+6% de crítico', bonus: { critPct: 6 } },
            passo: { nome: 'Passo Leve', nivel: 5, custo: 1, req: null, efeito: '+8% de esquiva', bonus: { esqPct: 8 } },
            precisao: { nome: 'Precisão Letal', nivel: 15, custo: 2, req: 'mira', efeito: '+12% de crítico', bonus: { critPct: 12 } },
            rajada: { nome: 'Rajada Múltipla', nivel: 25, custo: 2, req: 'mira', efeito: '+15% de ataque', bonus: { atkPct: 15 } },
            sombra: { nome: 'Sombra do Vento', nivel: 40, custo: 3, req: 'passo', efeito: '+15% de esquiva e +8% de crítico', bonus: { esqPct: 15, critPct: 8 } },
            flechacosmica: { nome: 'Flecha Cósmica', nivel: 60, custo: 3, req: 'rajada', efeito: '+28% de ataque', bonus: { atkPct: 28 } },
            olhodofalcao: { nome: 'Olho do Falcão', nivel: 90, custo: 4, req: 'precisao', efeito: '+25% de crítico', bonus: { critPct: 25 } }
        }
    },
    curandeiro: {
        nome: '💚 Bênção da Deusa',
        descricao: 'Vida e sustentação. Vence pelo que aguenta.',
        habilidades: {
            prece: { nome: 'Prece Simples', nivel: 1, custo: 1, req: null, efeito: '+12% de vida máxima', bonus: { hpPct: 12 } },
            luz: { nome: 'Toque de Luz', nivel: 5, custo: 1, req: 'prece', efeito: '+8% de defesa', bonus: { defPct: 8 } },
            aura: { nome: 'Aura Restauradora', nivel: 15, custo: 2, req: 'prece', efeito: '+18% de vida máxima', bonus: { hpPct: 18 } },
            escudodivino: { nome: 'Escudo Divino', nivel: 25, custo: 2, req: 'luz', efeito: '+15% de defesa e +8% de bloqueio', bonus: { defPct: 15, bloqPct: 8 } },
            renascer: { nome: 'Renascer', nivel: 40, custo: 3, req: 'aura', efeito: '+25% de vida máxima', bonus: { hpPct: 25 } },
            graca: { nome: 'Graça Celestial', nivel: 60, custo: 3, req: 'escudodivino', efeito: '+22% de defesa', bonus: { defPct: 22 } },
            eternidade: { nome: 'Eternidade', nivel: 90, custo: 4, req: 'renascer', efeito: '+40% de vida e +12% de defesa', bonus: { hpPct: 40, defPct: 12 } }
        }
    },
    ladino: {
        nome: '🗡️ Véu das Sombras',
        descricao: 'Crítico extremo, defesa mínima. Alto risco, alto retorno.',
        habilidades: {
            furtividade: { nome: 'Furtividade', nivel: 1, custo: 1, req: null, efeito: '+10% de esquiva', bonus: { esqPct: 10 } },
            lamina: { nome: 'Lâmina Afiada', nivel: 5, custo: 1, req: null, efeito: '+8% de crítico', bonus: { critPct: 8 } },
            golpebaixo: { nome: 'Golpe Baixo', nivel: 15, custo: 2, req: 'lamina', efeito: '+15% de ataque', bonus: { atkPct: 15 } },
            venenos: { nome: 'Venenos Antigos', nivel: 25, custo: 2, req: 'golpebaixo', efeito: '+14% de crítico', bonus: { critPct: 14 } },
            dancadasombra: { nome: 'Dança das Sombras', nivel: 40, custo: 3, req: 'furtividade', efeito: '+18% de esquiva e +10% de ataque', bonus: { esqPct: 18, atkPct: 10 } },
            execucao: { nome: 'Execução', nivel: 60, custo: 3, req: 'venenos', efeito: '+20% de crítico e +15% de ataque', bonus: { critPct: 20, atkPct: 15 } },
            assassinoperfeito: { nome: 'Assassino Perfeito', nivel: 90, custo: 4, req: 'execucao', efeito: '+30% de crítico', bonus: { critPct: 30 } }
        }
    },
    paladino: {
        nome: '🛡️ Juramento Sagrado',
        descricao: 'Equilíbrio entre proteger e punir.',
        habilidades: {
            juramento: { nome: 'Juramento', nivel: 1, custo: 1, req: null, efeito: '+7% de defesa e +7% de vida', bonus: { defPct: 7, hpPct: 7 } },
            martelo: { nome: 'Martelo da Fé', nivel: 5, custo: 1, req: 'juramento', efeito: '+9% de ataque', bonus: { atkPct: 9 } },
            egide: { nome: 'Égide', nivel: 15, custo: 2, req: 'juramento', efeito: '+14% de defesa e +8% de bloqueio', bonus: { defPct: 14, bloqPct: 8 } },
            julgamento: { nome: 'Julgamento', nivel: 25, custo: 2, req: 'martelo', efeito: '+16% de ataque e +6% de crítico', bonus: { atkPct: 16, critPct: 6 } },
            santuario: { nome: 'Santuário', nivel: 40, custo: 3, req: 'egide', efeito: '+22% de vida e +12% de bloqueio', bonus: { hpPct: 22, bloqPct: 12 } },
            condenacao: { nome: 'Condenação', nivel: 60, custo: 3, req: 'julgamento', efeito: '+24% de ataque', bonus: { atkPct: 24 } },
            avatarsagrado: { nome: 'Avatar Sagrado', nivel: 90, custo: 4, req: 'santuario', efeito: '+20% em ataque, defesa e vida', bonus: { atkPct: 20, defPct: 20, hpPct: 20 } }
        }
    },
    necromante: {
        nome: '💀 Pacto do Vazio',
        descricao: 'Troca vida por poder. Cada ganho cobra o seu preço.',
        habilidades: {
            pacto: { nome: 'Pacto Menor', nivel: 1, custo: 1, req: null, efeito: '+12% de ataque', bonus: { atkPct: 12 } },
            ossos: { nome: 'Colheita de Ossos', nivel: 5, custo: 1, req: 'pacto', efeito: '+10% de crítico', bonus: { critPct: 10 } },
            legiao: { nome: 'Legião Silente', nivel: 15, custo: 2, req: 'pacto', efeito: '+16% de ataque', bonus: { atkPct: 16 } },
            drenar: { nome: 'Drenar Essência', nivel: 25, custo: 2, req: 'ossos', efeito: '+14% de vida e +8% de ataque', bonus: { hpPct: 14, atkPct: 8 } },
            maldicao: { nome: 'Maldição Antiga', nivel: 40, custo: 3, req: 'legiao', efeito: '+22% de ataque e +10% de crítico', bonus: { atkPct: 22, critPct: 10 } },
            ceifador: { nome: 'Ceifador', nivel: 60, custo: 3, req: 'drenar', efeito: '+26% de ataque', bonus: { atkPct: 26 } },
            senhordomortos: { nome: 'Senhor dos Mortos', nivel: 90, custo: 4, req: 'ceifador', efeito: '+38% de ataque e +15% de crítico', bonus: { atkPct: 38, critPct: 15 } }
        }
    },
    berserker: {
        nome: '🔥 Sangue Fervente',
        descricao: 'Só ataque. Defesa é problema de quem sobrevive.',
        habilidades: {
            raiva: { nome: 'Raiva Crescente', nivel: 1, custo: 1, req: null, efeito: '+14% de ataque', bonus: { atkPct: 14 } },
            pele: { nome: 'Pele Grossa', nivel: 5, custo: 1, req: null, efeito: '+12% de vida máxima', bonus: { hpPct: 12 } },
            frenesi: { nome: 'Frenesi', nivel: 15, custo: 2, req: 'raiva', efeito: '+18% de ataque', bonus: { atkPct: 18 } },
            semdor: { nome: 'Sem Dor', nivel: 25, custo: 2, req: 'pele', efeito: '+20% de vida máxima', bonus: { hpPct: 20 } },
            carnificina: { nome: 'Carnificina', nivel: 40, custo: 3, req: 'frenesi', efeito: '+24% de ataque e +12% de crítico', bonus: { atkPct: 24, critPct: 12 } },
            ultimosuspiro: { nome: 'Último Suspiro', nivel: 60, custo: 3, req: 'semdor', efeito: '+28% de vida e +15% de ataque', bonus: { hpPct: 28, atkPct: 15 } },
            aniquilar: { nome: 'Aniquilar', nivel: 90, custo: 4, req: 'carnificina', efeito: '+45% de ataque', bonus: { atkPct: 45 } }
        }
    }
}

/** Quantos pontos o personagem tem no total, pelo nível. */
function pontosTotais(nivel) {
    return Math.floor(Math.max(1, Number(nivel) || 1) / NIVEIS_POR_PONTO)
}

/**
 * Habilidades já pagas pelo usuário, sempre como lista de chaves.
 * Aceita os formatos históricos: lista, JSON de lista e JSON de JSON de lista
 * (aprender gravava JSON.stringify e o repositório codificava de novo).
 */
function pagas(user) {
    let lista = user?.skills
    if (!lista) return []
    try {
        for (let i = 0; i < 5 && typeof lista === 'string'; i++) lista = JSON.parse(lista)
    } catch (err) {
        logger.warn(`[HABILIDADE] Lista de ${user?.jid} ilegível: ${err.message} — tratando como vazia.`)
        return []
    }
    return Array.isArray(lista) ? lista.filter(k => typeof k === 'string' && k) : []
}

/** Qual árvore pertence ao usuário, pela classe dele. */
function arvoreDe(user) {
    const classe = String(user?.classe || '').toLowerCase().replace(/[^a-z]/g, '')
    for (const [chave, arvore] of Object.entries(ARVORES)) {
        if (classe.includes(chave)) return { chave, ...arvore }
    }
    return null
}

/** Pontos gastos e disponíveis. */
function saldoDe(user) {
    const arvore = arvoreDe(user)
    const total = pontosTotais(user?.level)
    if (!arvore) return { total, gastos: 0, livres: total, arvore: null }

    const escolhidas = pagas(user)
    const gastos = escolhidas.reduce((soma, chave) => soma + (arvore.habilidades[chave]?.custo || 0), 0)
    return { total, gastos, livres: Math.max(0, total - gastos), arvore }
}

/** Uma habilidade está disponível para compra? */
function situacaoDe(user, chaveHabilidade) {
    const { arvore, livres } = saldoDe(user)
    if (!arvore) return { ok: false, motivo: 'Você ainda não tem classe. Escolha uma com `.classe`.' }

    const h = arvore.habilidades[chaveHabilidade]
    if (!h) return { ok: false, motivo: 'Essa habilidade não existe na sua árvore.' }

    const escolhidas = pagas(user)
    if (escolhidas.includes(chaveHabilidade)) return { ok: false, motivo: 'Você já domina essa habilidade.', jaTem: true }

    const nivel = Number(user?.level) || 1
    if (nivel < h.nivel) return { ok: false, motivo: `Exige nível ${h.nivel}; você tem ${nivel}.` }
    if (h.req && !escolhidas.includes(h.req)) {
        return { ok: false, motivo: `Exige *${arvore.habilidades[h.req]?.nome || h.req}* antes.` }
    }
    if (livres < h.custo) return { ok: false, motivo: `Custa ${h.custo} ponto(s); você tem ${livres}.` }

    return { ok: true, habilidade: h }
}

/** Compra uma habilidade. */
function aprender(user, chaveHabilidade) {
    const s = situacaoDe(user, chaveHabilidade)
    if (!s.ok) return { ok: false, erro: s.motivo }

    const escolhidas = pagas(user)
    escolhidas.push(chaveHabilidade)
    user.skills = escolhidas
    dataService.saveUser(user)
    return { ok: true, habilidade: s.habilidade, total: escolhidas.length }
}

/**
 * Zera a árvore e devolve os pontos.
 * Usa `force` porque reduzir progresso é exatamente o caso em que o repositório
 * preserva o valor antigo por padrão.
 */
function esquecerTudo(user) {
    // user.skills também guarda as chaves da .arvorehabilidades (ataque, defesa...).
    // Só as chaves das árvores de classe são esquecidas; as outras ficam.
    const deClasse = k => Object.values(ARVORES).some(a => a.habilidades[k])
    const atuais = pagas(user)
    const quantas = atuais.filter(deClasse).length
    user.skills = atuais.filter(k => !deClasse(k))
    dataService.saveUser(user, { force: true })
    return { ok: true, devolvidas: quantas }
}

/** Soma dos bônus das habilidades pagas. */
function bonusDe(user) {
    const arvore = arvoreDe(user)
    if (!arvore) return {}
    const total = {}
    for (const chave of pagas(user)) {
        const h = arvore.habilidades[chave]
        if (!h?.bonus) continue
        for (const [k, v] of Object.entries(h.bonus)) total[k] = (total[k] || 0) + v
    }
    return total
}

/** A árvore inteira com o estado de cada habilidade para este usuário. */
function mapaDe(user) {
    const { arvore, livres } = saldoDe(user)
    if (!arvore) return null
    const escolhidas = pagas(user)
    const nivel = Number(user?.level) || 1

    const nos = Object.entries(arvore.habilidades).map(([chave, h]) => {
        let estado
        if (escolhidas.includes(chave)) estado = 'paga'
        else if (nivel < h.nivel) estado = 'nivel'
        else if (h.req && !escolhidas.includes(h.req)) estado = 'bloqueada'
        else if (livres < h.custo) estado = 'sem-pontos'
        else estado = 'disponivel'
        return { chave, ...h, estado }
    })
    return { arvore, nos: nos.sort((a, b) => a.nivel - b.nivel) }
}

module.exports = {
    ARVORES,
    NIVEIS_POR_PONTO,
    pontosTotais,
    pagas,
    arvoreDe,
    saldoDe,
    situacaoDe,
    aprender,
    esquecerTudo,
    bonusDe,
    mapaDe
}
