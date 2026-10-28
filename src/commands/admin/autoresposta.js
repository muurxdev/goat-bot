/**
 * Comando .autoresposta / .autoreply — Gestão da Resposta Autônoma Contextual por Nicho (24H Engine)
 * GOATBOT // GOAT Prime (GOAT)
 */

const autonomousGroup = require('../../services/groupAutonomousAgentService');
const ownerService = require('../../services/ownerService');
const F = require('../../utils/formato');
const { getBotName } = require('../../config/botConfig');

module.exports = {
    name: 'autoresposta',
    aliases: ['autoreply', 'respostauto', 'respostanicho', 'ia_grupo', 'chat_auto'],
    category: 'admin',
    subcategory: 'Autonomia & IA',
    description: 'Ativa ou desativa a resposta automática contextual do bot de acordo com o nicho do grupo (24H)',
    usage: '[on | off | status | skycode [on|off]]',
    examples: [
        ' — exibe o status da automação e o nicho detectado deste grupo',
        'on — ativa a resposta autônoma 24h neste grupo',
        'off — desativa a resposta autônoma neste grupo',
        'skycode on — ativa em lote para todos os grupos Skycode (apenas dono)'
    ],
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, args = [], reply, sender, prefix = '.', client }) => {
        const sub = (args[0] || '').toLowerCase().trim();
        const sub2 = (args[1] || '').toLowerCase().trim();
        const isOwner = ownerService.isOwner(sender);

        // ── 1. CONTROLE EM MASSA (EXCLUSIVO DONO: .autoresposta skycode / all) ──
        if (sub === 'skycode' || sub === 'all' || sub === 'todos') {
            if (!isOwner) {
                return reply(F.tela({
                    emoji: '🔒',
                    titulo: 'Comando Reservado ao Dono',
                    intro: 'Apenas os donos do bot podem ativar ou desativar a autonomia em massa para a rede.',
                    prefix
                }));
            }

            const ehSkycode = sub === 'skycode';
            const ligar = ['on', 'ligar', 'ativar', '1'].includes(sub2);
            const desligar = ['off', 'desligar', 'desativar', '0'].includes(sub2);

            if (ligar || desligar) {
                const res = await autonomousGroup.setAutoReplyAll(client, ligar, { filtroSkycode: ehSkycode });
                return reply(F.tela({
                    emoji: ligar ? '🟢' : '🔴',
                    titulo: ligar
                        ? (ehSkycode ? 'Auto-Resposta Ativada (Rede Skycode)' : 'Auto-Resposta Ativada (Todos os Grupos)')
                        : (ehSkycode ? 'Auto-Resposta Desativada (Rede Skycode)' : 'Auto-Resposta Desativada (Todos os Grupos)'),
                    intro: `O motor de respostas contextuais 24h foi *${ligar ? 'ATIVADO' : 'DESATIVADO'}* em *${res.alterados} de ${res.total}* grupo(s).`,
                    proximos: [
                        { nome: 'autoresposta', oque: 'ver status neste grupo' },
                        { nome: 'config', oque: 'painel geral de configurações' }
                    ],
                    prefix
                }));
            }
        }

        // ── 2. ATIVAÇÃO NO GRUPO (.autoresposta on) ─────────────────────────
        if (sub === 'on' || sub === 'ativar' || sub === 'ligar' || sub === '1') {
            await autonomousGroup.setAutoReply(from, true);
            const nicho = autonomousGroup.resolveGroupNiche(from);
            return reply(F.tela({
                emoji: '🟢',
                titulo: 'Resposta Autônoma Ativada (24H)',
                intro: `O bot agora responderá com autoridade sobre *${nicho.label}* neste grupo 24 horas por dia!\n\n` +
                       `✨ *Como Funciona:* Quando membros mencionarem o bot ou perguntarem sobre o tema do grupo, ele responderá com orientações e comandos úteis sem flood.`,
                secoes: [
                    {
                        emoji: nicho.emoji,
                        titulo: `Nicho Detectado: ${nicho.label}`,
                        linhas: [
                            `• *Comportamento:* Especialista no tema deste grupo`,
                            `• *Cooldown Anti-Spam:* 60 segundos para conversas espontâneas`,
                            `• *Menções Diretas:* Resposta imediata com comandos recomendados`
                        ]
                    }
                ],
                proximos: [
                    { nome: 'autoresposta status', oque: 'ver detalhes do nicho' },
                    { nome: 'config auto on', oque: 'ativar também envios periódicos' },
                    { nome: 'config', oque: 'voltar ao painel geral' }
                ],
                prefix
            }));
        }

        // ── 3. DESATIVAÇÃO NO GRUPO (.autoresposta off) ──────────────────────
        if (sub === 'off' || sub === 'desativar' || sub === 'desligar' || sub === '0') {
            await autonomousGroup.setAutoReply(from, false);
            return reply(F.tela({
                emoji: '🔴',
                titulo: 'Resposta Autônoma Desativada',
                intro: `O bot não interagirá mais de forma espontânea ou contextual neste grupo (responderá apenas a comandos com prefixo).`,
                proximos: [
                    { nome: 'autoresposta on', oque: 'reativar a qualquer momento' },
                    { nome: 'config', oque: 'voltar ao painel geral' }
                ],
                prefix
            }));
        }

        // ── 4. STATUS / PAINEL VISUAL (.autoresposta) ───────────────────────
        const isAtivo = autonomousGroup.isAutoReplyEnabled(from);
        const nicho = autonomousGroup.resolveGroupNiche(from);
        const health = autonomousGroup.get24hHealthStatus();

        let doc = `╔══════════════════════════════════════╗\n`;
        doc += `║ 🤖  AUTOMAÇÃO & RESPOSTA DE GRUPO    ║\n`;
        doc += `╚══════════════════════════════════════╝\n`;
        doc += `       GOAT SKYCODE 24/7 PROTOCOL\n\n`;

        doc += `📌 *Status da Auto-Resposta:* ${isAtivo ? '🟢 Ativada (24H Contínuo)' : '🔴 Desativada'}\n`;
        doc += `🎯 *Nicho do Grupo:* ${nicho.emoji} *${nicho.label}*\n`;
        doc += `⏱️ *Anti-Flood Spontaneous:* Cooldown de 60s por grupo\n`;
        doc += `⚡ *Saúde do Cluster:* ${health.status} (${health.totalGruposReply} grupos ativos)\n\n`;

        doc += `💡 *COMO O BOT RESPONDE NESTE GRUPO:*\n`;
        if (nicho.id === 'vagas') {
            doc += `• Indica vagas tech em tempo real, vagas remotas e backend/frontend.\n`;
            doc += `• Dicas de formatação de currículo, portfólio no GitHub e vagas abertas.\n`;
        } else if (nicho.id === 'vendas') {
            doc += `• Alertas anti-golpe, checagem de reputação (\`.reputacao @user\`).\n`;
            doc += `• Orientações para compras seguras e validação de PIX/comprovantes.\n`;
        } else if (nicho.id === 'estudos') {
            doc += `• Recomendações de livros em PDF gratuitos e materiais de estudo.\n`;
            doc += `• Métodos de aprendizado (Feynman/Pomodoro) e comandos úteis (\`.livro\`, \`.calc\`).\n`;
        } else if (nicho.id === 'divulgacao') {
            doc += `• Regras para manter parcerias e divulgações nos conformes.\n`;
            doc += `• Combate ao flood e orientação sobre canais oficiais.\n`;
        } else if (nicho.id === 'resenha') {
            doc += `• Resenha esportiva com energia do GOAT Prime (\`GOAT\`).\n`;
            doc += `• Tabelas do Brasileirão, Champions League, Libertadores e debate limpo.\n`;
        } else {
            doc += `• Guia interativo para os mais de 10.000 comandos e modo RPG.\n`;
        }

        doc += `\n──────────────────────────────────────\n`;
        doc += `🧭 *COMANDOS PARA AJUDAR:*\n`;
        doc += `• \`${prefix}autoresposta on\` — Ativar respostas automáticas\n`;
        doc += `• \`${prefix}autoresposta off\` — Desativar respostas automáticas\n`;
        doc += `• \`${prefix}config auto on\` — Ativar também envios periódicos\n`;
        doc += `• \`${prefix}config\` — Painel geral de configurações`;

        return reply(doc);
    }
};
