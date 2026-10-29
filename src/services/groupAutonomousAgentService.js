const { nomeDoMembro } = require('../utils/nomeMembro');
/**
 * Serviço de Automação e Resposta Autônoma Contextual por Grupo (24H Engine)
 * GOATBOT // GOAT Prime (GOAT)
 *
 * Responsável por:
 * 1. Identificar o nicho do grupo (Vagas, Vendas, Estudos, Divulgação, Resenha/Futebol, Comandos)
 * 2. Responder automaticamente com autoridade e conhecimento contextual de acordo com o nicho
 * 3. Operação resiliente 24 horas por dia com suporte a ativação/desativação individual e em massa
 * 4. Proteção anti-flood com cooldown inteligente por grupo
 */

const dataService = require('./dataService');
const logger = require('../core/logger');
const { getBotName } = require('../config/botConfig');
const { detectarTema } = require('../config/autoContent');

// Cooldown de resposta espontânea por grupo (evita spam quando o bot não é chamado diretamente)
const COOLDOWN_AUTO_REPLY_MS = 60 * 1000;
const _lastAutoReplyTime = new Map();

// Definição dos nichos e sua base de conhecimento especializado
const NICHES = Object.freeze({
    vagas: {
        id: 'vagas',
        label: 'Vagas Tech & Carreiras',
        emoji: '💼',
        keywords: [
            'vaga', 'vagas', 'trampo', 'emprego', 'oportunidade', 'oportunidades',
            'curriculo', 'cv', 'linkedin', 'junior', 'pleno', 'senior', 'estagio',
            'backend', 'frontend', 'fullstack', 'remoto', 'home office', 'contratando',
            'salario', 'recrutador', 'tech lead', 'entrevista'
        ],
        directReplies: [
            {
                trigger: /(onde\s+(acho|tem|encontro)|tem\s+vaga|vagas?\s+de|procurando\s+vaga|vaga\s+remot[ao])/i,
                response: (prefix) =>
                    `💼 *RADAR DE VAGAS TECH // SKYCODE*\n\n` +
                    `Aqui no grupo monitoramos oportunidades em aberto para desenvolvedores em tempo real!\n\n` +
                    `🔍 *Comandos Rápidos para Buscar:*\n` +
                    `• \`${prefix}vagas backend\` — Vagas de Node, Java, C#, Python, Go\n` +
                    `• \`${prefix}vagas frontend\` — Vagas de React, Vue, Angular, Mobile\n` +
                    `• \`${prefix}vagas remoto\` — Vagas 100% home office nacionais e gringas\n` +
                    `• \`${prefix}vagas estágio\` — Oportunidades para quem está começando\n\n` +
                    `📌 *Dica Profissional:* Mantenha seu GitHub ativo e seu LinkedIn alinhado com projetos práticos!`
            },
            {
                trigger: /(curriculo|dica\s+de\s+cv|analisar\s+cv|portfolio)/i,
                response: (prefix) =>
                    `📄 *GUIA DE CARREIRA & CURRÍCULO TECH*\n\n` +
                    `Para se destacar nos processos seletivos de tecnologia:\n\n` +
                    `1. *Objetivo Direto:* Destaque sua stack principal logo no topo (ex: Backend Node.js / TypeScript).\n` +
                    `2. *Projetos Reais:* Inclua links do GitHub com README documentado e deploy funcionando.\n` +
                    `3. *Impacto Mensurável:* Fale de resultados (ex: "Otimizou tempo de resposta de API em 40%").\n\n` +
                    `💡 _Para pesquisar vagas ativas no grupo:_ \`${prefix}vagas\``
            }
        ],
        fallback: (prefix) =>
            `💼 *Assistente de Vagas & Carreiras Skycode:*\n` +
            `Este grupo é focado em empregos, networking e carreira tech. Consulte vagas atualizadas digitando \`${prefix}vagas\` ou filtre por área (\`${prefix}vagas remoto\`, \`${prefix}vagas backend\`).`
    },

    vendas: {
        id: 'vendas',
        label: 'Balcão Seguro & Classificados',
        emoji: '🛡️',
        keywords: [
            'vender', 'comprar', 'reputacao', 'reputação', 'confiavel', 'confiável',
            'golpe', 'seguro', 'calote', 'pix', 'preco', 'preço', 'anunciar',
            'pagamento', 'comprovante', 'garantia', 'fraude', 'referencia', 'referência'
        ],
        directReplies: [
            {
                trigger: /(como\s+(sei|saber)|confiavel|confiável|seguro|golpe|reputacao|reputação)/i,
                response: (prefix) =>
                    `🛡️ *BALCÃO SEGURO // REGRAS DE NEGOCIAÇÃO SKYCODE*\n\n` +
                    `Para realizar compras e vendas 100% seguras neste grupo:\n\n` +
                    `• *Consulte o Vendedor:* Digite \`${prefix}reputacao @usuario\` para ver o histórico e avaliações.\n` +
                    `• *Avalie Transações:* Após concluir um negócio use \`${prefix}reputacao positivo @usuario motivo\`.\n` +
                    `• *Alerta Preventivo:* Se notar comportamento suspeito, alerte a moderação com \`${prefix}reputacao alertar @usuario motivo\`.\n\n` +
                    `⚠️ *Atenção:* Desconfie de preços muito abaixo do mercado e confira o extrato bancário antes de entregar qualquer produto!`
            },
            {
                trigger: /(como\s+anunciar|quero\s+vender|posso\s+anunciar)/i,
                response: (prefix) =>
                    `💎 *COMO ANUNCIAR NO BALCÃO DE NEGÓCIOS:*\n\n` +
                    `1. Descreva o produto com clareza, fotos reais e preço explícito.\n` +
                    `2. Informe o método de entrega e meios de pagamento aceitos.\n` +
                    `3. Sempre solicite que o comprador registre sua qualificação após a conclusão com \`${prefix}reputacao positivo\`.\n\n` +
                    `_Proteção ativa contra golpes e perfis falsos pelo Skycode Protocol._`
            }
        ],
        fallback: (prefix) =>
            `🛡️ *Balcão Seguro Skycode:*\n` +
            `Ambiente monitorado contra fraudes. Sempre consulte a reputação do parceiro de negócios com \`${prefix}reputacao @usuario\` antes de fechar transações.`
    },

    estudos: {
        id: 'estudos',
        label: 'Estudos, Livros & Cursos',
        emoji: '📚',
        keywords: [
            'livro', 'livros', 'pdf', 'estudar', 'estudo', 'estudos', 'aprender',
            'curso', 'cursos', 'leitura', 'apostila', 'resumo', 'material', 'biblioteca',
            'dica\s+de\s+estudo', 'ingles', 'programacao', 'matematica'
        ],
        directReplies: [
            {
                trigger: /(onde\s+(acho|tem|baixo)|tem\s+livro|livro\s+de|pdf\s+de|procurando\s+livro)/i,
                response: (prefix) =>
                    `📚 *BIBLIOTECA VIRTUAL // ACERVO DE ESTUDOS*\n\n` +
                    `Temos acesso a mais de 100.000 obras literárias, técnicas e acadêmicas gratuitas!\n\n` +
                    `🔎 *Comandos para Estudar:*\n` +
                    `• \`${prefix}livro <título ou autor>\` — Pesquisa e entrega PDF completo\n` +
                    `• \`${prefix}calc <expressão>\` — Calculadora científica para exatas\n` +
                    `• \`${prefix}traduzir <texto>\` — Tradução imediata para estudos de idiomas\n` +
                    `• \`${prefix}artigo <tema>\` — Resumos enciclopédicos rápidos\n\n` +
                    `💡 _Exemplo de busca:_ \`${prefix}livro Clean Code\``
            },
            {
                trigger: /(metodo|técnica|como\s+estudar|foco|produtividade)/i,
                response: (prefix) =>
                    `🧠 *DICA DE PRODUTIVIDADE & APRENDIZADO ACELERADO*\n\n` +
                    `• *Técnica Feynman:* Tente explicar o conteúdo em termos simples como se ensinasse para um leigo.\n` +
                    `• *Pomodoro:* Foque por 25 minutos ininterruptos e descanse 5 minutos.\n` +
                    `• *Prática Espaçada:* Revise conceitos chave em intervalos de 1, 3 e 7 dias para fixação permanente.\n\n` +
                    `📖 _Acesse livros sobre o tema com:_ \`${prefix}livro hábitos atômicos\``
            }
        ],
        fallback: (prefix) =>
            `📚 *Academia de Estudos Skycode:*\n` +
            `Foco total em evolução intelectual. Utilize \`${prefix}livro <nome>\` para baixar livros em PDF ou \`${prefix}calc\` para cálculos e estudos.`
    },

    divulgacao: {
        id: 'divulgacao',
        label: 'Divulgações & Parcerias',
        emoji: '📢',
        keywords: [
            'divulgar', 'divulga', 'divulgacao', 'divulgação', 'link', 'meu canal',
            'meu grupo', 'parceria', 'youtube', 'instagram', 'tiktok', 'grupo de',
            'anuncio', 'anúncio'
        ],
        directReplies: [
            {
                trigger: /(posso\s+divulgar|como\s+divulgar|regras?\s+de\s+divulga)/i,
                response: (prefix) =>
                    `📢 *CENTRAL DE DIVULGAÇÃO & PARCERIAS // SKYCODE*\n\n` +
                    `Regras para manter a comunidade organizada e respeitosa:\n\n` +
                    `1. Divulgue apenas conteúdos pertinentes (projetos, canais educativos, parcerias).\n` +
                    `2. Proibido flood repetitivo do mesmo link em curto período.\n` +
                    `3. Links maliciosos, golpes ou correntes são punidos com ban imediato pelo anti-link.\n\n` +
                    `📣 _Para divulgar com destaque institucional fale com os administradores ou use:_ \`${prefix}divulgar\``
            }
        ],
        fallback: (prefix) =>
            `📢 *Canal de Divulgação Skycode:*\n` +
            `Compartilhe seus projetos e parcerias com responsabilidade. Evite spam para manter a convivência saudável.`
    },

    resenha: {
        id: 'resenha',
        label: 'Resenha & Clube dos Campeões (GOAT)',
        emoji: '⚽',
        keywords: [
            'futebol', 'goat', 'bola de ouro', 'champions', 'libertadores',
            'brasileirao', 'brasileirão', 'jogo', 'campeonato', 'tabela', 'gol',
            'barcelona', 'argentina', 'inter miami', 'selecao', 'seleção', 'rodada', 'artilheiro'
        ],
        directReplies: [
            {
                trigger: /(goat|melhor\s+do\s+mundo|goat|camisa\s+10|bola\s+de\s+ouro)/i,
                response: (prefix) =>
                    `🐐 *GOAT // O MAIOR DA HISTÓRIA (GOAT)*\n\n` +
                    `• 8x Bolas de Ouro 🏆\n` +
                    `• Campeão da Copa do Mundo FIFA 2022 🇦🇷\n` +
                    `• 4x UEFA Champions League 🌟\n` +
                    `• Mais de 800 gols oficiais na carreira lendária!\n\n` +
                    `⚽ _Acompanhe as tabelas oficiais com:_ \`${prefix}tabela brasileirao\` ou \`${prefix}champions\``
            },
            {
                trigger: /(tabela|jogos|rodada|classificacao|classificação|quem\s+joga)/i,
                response: (prefix) =>
                    `🏆 *CENTRAL ESPORTIVA // CLUBE DOS CAMPEÕES*\n\n` +
                    `Confira as tabelas completas e atualizadas em tempo real:\n\n` +
                    `• \`${prefix}tabela brasileirao\` — Série A 2026 completa (G4 e Z4)\n` +
                    `• \`${prefix}champions\` — UEFA Champions League (Fase de Liga 36 clubes)\n` +
                    `• \`${prefix}libertadores\` — Copa Libertadores (Fase de Grupos A ao H)\n` +
                    `• \`${prefix}premier\` — Premier League inglesa\n` +
                    `• \`${prefix}laliga\` — La Liga espanhola`
            }
        ],
        fallback: (prefix) =>
            `⚽ *Resenha Oficial do Clube dos Campeões (GOAT):*\n` +
            `O espaço do bom futebol, debates e resenha descontraída. Digite \`${prefix}tabela brasileirao\` para conferir a tabela ou \`${prefix}menu\` para jogos e diversão.`
    },

    comandos: {
        id: 'comandos',
        label: 'Laboratório de Comandos & RPG',
        emoji: '🎮',
        keywords: [
            'comando', 'comandos', 'bot', 'como funciona', 'ajuda', 'teste',
            'rpg', 'banco', 'economia', 'jogos', 'jogo', 'slayer', 'cassino', 'ficha'
        ],
        directReplies: [
            {
                trigger: /(como\s+usar|quais\s+comandos|lista\s+de\s+comandos|o\s+que\s+voce\s+faz)/i,
                response: (prefix) =>
                    `🎮 *LABORATÓRIO DE COMANDOS // GOATBOT*\n\n` +
                    `Contamos com mais de 10.000 comandos canônicos e 20.000 atalhos JIT ativos!\n\n` +
                    `🧭 *Principais Menus do Bot:*\n` +
                    `• \`${prefix}menu\` — Menu principal visual com todas as categorias\n` +
                    `• \`${prefix}menugrupo\` — Painel completo de comandos para grupos e admins\n` +
                    `• \`${prefix}dossie\` — Seu perfil completo, patente e conquistas\n` +
                    `• \`${prefix}banco\` — Economia, PIX, cofre e investimentos\n` +
                    `• \`${prefix}slayer\` — Ficha do RPG de combate e coliseu\n\n` +
                    `💡 _Para tirar dúvida de um comando específico use:_ \`${prefix}help <comando>\``
            }
        ],
        fallback: (prefix) =>
            `🎮 *Arena de Comandos e Testes Skycode:*\n` +
            `Ambiente aberto para experimentar minigames, RPG, ferramentas de mídia e utilitários. Digite \`${prefix}menu\` para começar.`
    }
});

/**
 * Identifica o nicho predominante de um grupo a partir de preset, tema ou nome
 * @param {string} groupJid
 * @param {string} [groupSubject]
 * @returns {object} Informações completas do nicho
 */
function resolveGroupNiche(groupJid, groupSubject = '') {
    try {
        const configs = dataService.getConfigsData();
        const groupConfig = configs[groupJid] || {};

        // 1. Preset de segurança explicitamente ativo no grupo (.preset)
        const preset = String(groupConfig.activePreset || '').toLowerCase();
        if (preset.includes('vaga')) return NICHES.vagas;
        if (preset.includes('venda')) return NICHES.vendas;
        if (preset.includes('estudo')) return NICHES.estudos;
        if (preset.includes('divulga')) return NICHES.divulgacao;
        if (preset.includes('resenha')) return NICHES.resenha;
        if (preset.includes('comando')) return NICHES.comandos;

        // 2. Tema configurado no AutoContent (.auto tema)
        const autoTema = String(groupConfig.autoContent?.tema || '').toLowerCase();
        if (autoTema === 'vagas') return NICHES.vagas;
        if (autoTema === 'vendas') return NICHES.vendas;
        if (autoTema === 'idiomas' || autoTema === 'geral') return NICHES.estudos;
        if (autoTema === 'futebol') return NICHES.resenha;
        if (autoTema === 'dev' || autoTema === 'rpg') return NICHES.comandos;

        // 3. Dedução heurística a partir do nome do grupo
        const name = String(groupSubject || groupConfig.subject || '').toLowerCase();
        if (/vagas?|trampo|jobs?|carreiras?/i.test(name)) return NICHES.vagas;
        if (/vendas?|compras?|mercado|neg[oó]cios?/i.test(name)) return NICHES.vendas;
        if (/estudos?|livros?|pdf|acad[eê]mia|idiomas?/i.test(name)) return NICHES.estudos;
        if (/divulga|parcerias?|anuncios?/i.test(name)) return NICHES.divulgacao;
        if (/resenha|futebol|goat|campe[oõ]es/i.test(name)) return NICHES.resenha;
        if (/comandos?|testes?|lab|rpg/i.test(name)) return NICHES.comandos;

        // Padrão comunitário padrão: Resenha & Clube dos Campeões
        return NICHES.resenha;
    } catch (err) {
        logger.warn(`[AUTONOMOUS] Erro ao resolver nicho para ${groupJid}: ${err.message}`);
        return NICHES.resenha;
    }
}

/**
 * Retorna se o motor de respostas autônomas está ativo no grupo
 * @param {string} groupJid
 * @returns {boolean}
 */
function isAutoReplyEnabled(groupJid) {
    if (!groupJid || !String(groupJid).endsWith('@g.us')) return false;
    const configs = dataService.getConfigsData();
    const cfg = configs[groupJid] || {};
    // Ativo apenas se explicitamente ligado pelos administradores
    return Boolean(cfg.autoresposta === true || cfg.autoReply === true);
}

/**
 * Ativa ou desativa a resposta autônoma no grupo
 * @param {string} groupJid
 * @param {boolean} enabled
 */
async function setAutoReply(groupJid, enabled) {
    const configs = dataService.getConfigsData();
    if (!configs[groupJid]) configs[groupJid] = {};
    configs[groupJid].autoresposta = Boolean(enabled);
    configs[groupJid].autoReply = Boolean(enabled);
    await dataService.saveConfigsData(configs);
    logger.info(`[AUTONOMOUS] Auto-resposta ${enabled ? 'LIGADA' : 'DESLIGADA'} em ${groupJid}`);
    return configs[groupJid].autoresposta;
}

/**
 * Ativa ou desativa a auto-resposta em todos os grupos (com opção de filtro Skycode)
 * @param {object} client
 * @param {boolean} enabled
 * @param {{ filtroSkycode?: boolean }} [opts]
 */
async function setAutoReplyAll(client, enabled, opts = {}) {
    if (!client || typeof client.groupFetchAllParticipating !== 'function') return { total: 0, alterados: 0 };
    const todos = await client.groupFetchAllParticipating();
    const lista = Object.values(todos || {});
    let alterados = 0;

    for (const g of lista) {
        if (!g.id) continue;
        const nome = String(g.subject || '');
        if (opts.filtroSkycode && !/skycode/i.test(nome)) continue;
        await setAutoReply(g.id, enabled);
        alterados++;
    }

    return { total: lista.length, alterados };
}

/**
 * Avalia e responde contextualmente mensagens em grupos de acordo com o nicho
 * @param {object} params
 * @returns {Promise<boolean>} se a mensagem foi tratada e respondida
 */
async function handleGroupMessage({
    client,
    from,
    sender,
    body = '',
    isBotMentioned = false,
    respondeuBot = false,
    prefix = '.',
    reply
}) {
    if (!from || !from.endsWith('@g.us') || !body || typeof reply !== 'function') return false;
    if (!isAutoReplyEnabled(from)) return false;

    const groupNiche = resolveGroupNiche(from);
    const cleanBody = body.replace(/@\d+/g, '').trim().toLowerCase();
    const agora = Date.now();

    // 1. Caso direto: o bot foi mencionado ou respondido no grupo
    if (isBotMentioned || respondeuBot) {
        // Confere se casou com alguma resposta direta específica do nicho
        for (const item of groupNiche.directReplies) {
            if (item.trigger.test(cleanBody)) {
                const respostaTexto = item.response(prefix);
                await reply(respostaTexto, [sender]);
                _lastAutoReplyTime.set(from, agora);
                logger.info(`[AUTONOMOUS REPLY] Resposta direta [${groupNiche.id}] enviada para ${nomeDoMembro(sender)} em ${from}`);
                return true;
            }
        }

        // Se foi chamado diretamente no grupo mas não casou gatilho exato:
        // entrega o resumo contextual do nicho do grupo com comandos úteis
        const fallbackTexto = groupNiche.fallback(prefix);
        await reply(fallbackTexto, [sender]);
        _lastAutoReplyTime.set(from, agora);
        logger.info(`[AUTONOMOUS REPLY] Resumo contextual [${groupNiche.id}] enviado para ${nomeDoMembro(sender)} em ${from}`);
        return true;
    }

    // 2. Caso espontâneo: palavras-chave do nicho em conversa comum no grupo
    // Respeita intervalo anti-flood mínimo de 60s por grupo
    const ultimoEnvio = _lastAutoReplyTime.get(from) || 0;
    if (agora - ultimoEnvio < COOLDOWN_AUTO_REPLY_MS) {
        return false;
    }

    // Só reage se houver pergunta ou intenção explícita
    const parecePergunta = cleanBody.includes('?') || /\b(como|onde|qual|alguem|alguém|quem|quando|posso)\b/i.test(cleanBody);
    if (!parecePergunta) {
        return false;
    }

    // Verifica se alguma resposta direta do nicho foi acionada
    for (const item of groupNiche.directReplies) {
        if (item.trigger.test(cleanBody)) {
            const respostaTexto = item.response(prefix);
            await reply(respostaTexto, [sender]);
            _lastAutoReplyTime.set(from, agora);
            logger.info(`[AUTONOMOUS SPONTANEOUS] Orientação espontânea [${groupNiche.id}] em ${from}`);
            return true;
        }
    }

    return false;
}

/**
 * Retorna diagnóstico de integridade do motor 24H
 */
function get24hHealthStatus() {
    const autoContent = require('./autoContentService');
    const configs = dataService.getConfigsData();
    let totalGruposAuto = 0;
    let totalGruposReply = 0;

    for (const [jid, cfg] of Object.entries(configs)) {
        if (!jid.endsWith('@g.us')) continue;
        if (cfg.autoContent?.ativo) totalGruposAuto++;
        if (cfg.autoresposta === true || cfg.autoReply === true) totalGruposReply++;
    }

    return {
        status: '🟢 Operacional 24/7',
        totalGruposAuto,
        totalGruposReply,
        cooldownMs: COOLDOWN_AUTO_REPLY_MS,
        uptimeSeconds: Math.floor(process.uptime())
    };
}

module.exports = {
    NICHES,
    resolveGroupNiche,
    isAutoReplyEnabled,
    setAutoReply,
    setAutoReplyAll,
    handleGroupMessage,
    get24hHealthStatus,
    COOLDOWN_AUTO_REPLY_MS
};
