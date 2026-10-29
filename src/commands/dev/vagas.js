/**
 * Comando .vagas / .jobs
 * Radar em Tempo Real de Vagas Tech / TI (Remotas e Presenciais)
 */

const logger = require('../../core/logger');
const M = require('../../utils/moldura');

let cacheVagas = {
    data: [],
    at: 0
};

const CACHE_TTL = 10 * 60 * 1000; // 10 minutos

async function fetchLiveVagas() {
    if (cacheVagas.data.length > 0 && (Date.now() - cacheVagas.at < CACHE_TTL)) {
        return cacheVagas.data;
    }

    const repos = [
        { name: 'Backend', path: 'backend-br/vagas', emoji: '⚙️' },
        { name: 'Frontend', path: 'frontendbr/vagas', emoji: '🎨' },
        { name: 'React / Mobile', path: 'react-brasil/vagas', emoji: '📱' }
    ];

    const results = [];

    for (const r of repos) {
        try {
            const res = await fetch(`https://api.github.com/repos/${r.path}/issues?state=open&per_page=6`, {
                headers: { 'User-Agent': '➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤/2.0 (Skycode Community)' },
                signal: AbortSignal.timeout(6000)
            });
            if (res.ok) {
                const issues = await res.json();
                for (const iss of issues) {
                    if (iss.pull_request) continue;
                    const labels = (iss.labels || []).map(l => l.name);
                    results.push({
                        categoria: r.name,
                        emoji: r.emoji,
                        titulo: iss.title.replace(/^\[.*?\]\s*/, '').trim() || iss.title,
                        rawTitulo: iss.title,
                        url: iss.html_url,
                        labels: labels.slice(0, 5),
                        isRemoto: labels.some(l => /remot/i.test(l)) || /remot/i.test(iss.title),
                        numero: iss.number
                    });
                }
            }
        } catch (e) {
            logger.warn(`[VAGAS] Falha ao consultar ${r.path}: ${e.message}`);
        }
    }

    if (results.length > 0) {
        cacheVagas = { data: results, at: Date.now() };
    }

    return cacheVagas.data;
}

module.exports = {
    name: 'vagas',
    aliases: ["jobs","cmd_vagas","alt_vagas","atalho_vagas","abrev_vagas","call_vagas","func_vagas"],
    category: 'dev',
    subcategory: 'Dev Hub & Ferramentas',
    description: 'Radar em tempo real de vagas de tecnologia abertas (remotas e presenciais)',
    cooldownMs: 3000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const filtro = (args.join(' ') || '').toLowerCase().trim();
        const lista = await fetchLiveVagas();

        if (!lista || lista.length === 0) {
            // Fallback elegante com links diretos se o GitHub API estiver indisponível
            return reply(
                `💼 *PLATAFORMAS DE VAGAS DEV:*\n\n` +
                `🌐 *LinkedIn Jobs:* https://linkedin.com/jobs\n` +
                `🌐 *GitHub Careers:* https://github.careers\n` +
                `🌐 *We Work Remotely:* https://weworkremotely.com\n` +
                `🌐 *Remote OK:* https://remoteok.com\n` +
                `🌐 *ProgramaThor:* https://programathor.com.br/jobs`
            );
        }

        let selecionadas = lista;
        if (filtro) {
            selecionadas = lista.filter(v => 
                v.titulo.toLowerCase().includes(filtro) ||
                v.categoria.toLowerCase().includes(filtro) ||
                v.labels.some(l => l.toLowerCase().includes(filtro))
            );
        }

        if (selecionadas.length === 0) {
            return reply(`🔍 Nenhuma vaga recente encontrada para o filtro "*${filtro}*". Tente \`${prefix}vagas\` sem filtro para ver as mais recentes.`);
        }

        const exibidas = selecionadas.slice(0, 5);
        const linhasVagas = [];

        exibidas.forEach((v, idx) => {
            const remotoBadge = v.isRemoto ? '🌍 [REMOTO]' : '📍 [LOCAL/HÍBRIDO]';
            const tagsFmt = v.labels.length > 0 ? `\n   🏷️ *Tags:* ${v.labels.join(', ')}` : '';
            linhasVagas.push(
                `*${idx + 1}.* ${v.emoji} *${v.titulo}*\n` +
                `   ${remotoBadge} · *Área:* ${v.categoria}${tagsFmt}\n` +
                `   🔗 *Candidatura:* ${v.url}`
            );
        });

        const blocos = [
            M.cabecalho('💼', 'RADAR DE VAGAS TECH // SKYCODE'),
            M.secao('🚀', filtro ? `Vagas Filtradas: "${filtro.toUpperCase()}"` : 'Últimas Oportunidades Abertas', linhasVagas),
            `💡 _Dica: Filtre por área digitando \`${prefix}vagas backend\`, \`${prefix}vagas frontend\` ou \`${prefix}vagas remoto\`._`,
            M.assinatura()
        ];

        return reply(blocos.join('\n\n'));
    }
};
