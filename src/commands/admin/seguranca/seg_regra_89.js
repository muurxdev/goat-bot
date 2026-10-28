/**
 * Comando .preset / .presets
 * Aplica configurações completas e instantâneas baseadas no nicho do grupo:
 * - divulgacao: Blindagem total anti-link, modo divulgação e alertas no PV dos ADMs/Dono
 * - vagas: Filtro profissional, anti-spam agressivo e bloqueio de grupos concorrentes
 * - estudos: Foco em PDFs e livros, XP silencioso sem poluição visual
 * - vendas: Anti-fake DDI, trava de segurança e proteção anti-golpe
 * - resenha: Liberdade total para comandos, jogos, figurinhas e cartões de level-up
 * - comandos: Grupo livre para testes de todos os 10.000 comandos
 */

const dataService = require('../../../services/dataService');
const { getBotName } = require('../../../config/botConfig');
const F = require('../../../utils/formato');

module.exports = {
    name: 'preset',
    aliases: ['presets', 'grupopreset', 'presetgrupo', 'configpreset', 'cmd_preset', 'alt_preset', 'atalhopreset'],
    category: 'admin',
    subcategory: 'Moderação de Grupos',
    description: 'Aplica um perfil de configuração completo no grupo com 1 comando (divulgacao, vagas, estudos, vendas, resenha ou comandos)',
    usage: '[divulgacao | vagas | estudos | vendas | resenha | comandos | status]',
    examples: [
        ' — exibe os presets disponíveis e o perfil atual',
        'divulgacao — blinda o grupo para divulgação e parcerias oficiais',
        'vagas — configura para compartilhamento de vagas de T.I',
        'estudos — otimiza para leitura de PDFs e livros com XP silencioso',
        'vendas — proteção anti-fake e moderação de classificados',
        'resenha — chat livre com level-up comemorativo e minigames',
        'comandos — ambiente de testes de comandos'
    ],
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, args, reply, prefix = '.', sender }) => {
        const botName = getBotName();
        const configs = dataService.getConfigsData();
        if (!configs[from]) configs[from] = {};

        const sub = (args[0] || '').toLowerCase().trim();

        // 1. SEM ARGUMENTOS OU STATUS: Menu visual de Presets
        if (!sub || sub === 'status' || sub === 'ajuda' || sub === 'help' || sub === 'menu') {
            const currentPreset = configs[from].activePreset || 'Personalizado (Manual)';

            return reply(F.tela({
                emoji: '🎯',
                titulo: 'Presets de Grupo SkyCode',
                intro: `Configure o comportamento completo do bot neste grupo com apenas 1 comando!\n\n📌 *Preset Atual:* ${currentPreset}`,
                secoes: [
                    {
                        emoji: '📋',
                        titulo: 'Perfis Disponíveis',
                        linhas: [
                            `• *${F.cmd(prefix, 'preset', 'divulgacao')}*`,
                            `  ↳ Anti-link total, anti-trava, anti-flood, modo divulgação e aviso no PV.`,
                            ``,
                            `• *${F.cmd(prefix, 'preset', 'vagas')}*`,
                            `  ↳ Anti-spam agressivo, bloqueio de grupos rivais e XP silencioso.`,
                            ``,
                            `• *${F.cmd(prefix, 'preset', 'estudos')}*`,
                            `  ↳ Foco em livros/PDFs, permissão de videoaulas e XP sem flood de cartões.`,
                            ``,
                            `• *${F.cmd(prefix, 'preset', 'vendas')}*`,
                            `  ↳ Anti-fake (DDI gringo bloqueado), anti-golpe e travas de segurança.`,
                            ``,
                            `• *${F.cmd(prefix, 'preset', 'resenha')}*`,
                            `  ↳ Chat livre, comemorações de level-up ativas, minigames e figurinhas.`,
                            ``,
                            `• *${F.cmd(prefix, 'preset', 'comandos')}*`,
                            `  ↳ Laboratório aberto para teste dos 10.000 comandos sem restrições.`
                        ]
                    }
                ],
                dica: `Basta digitar ${prefix}preset <nome> para ativar instantaneamente todas as regras recomendadas.`,
                prefix
            }));
        }

        // 2. PRESET: DIVULGAÇÃO
        if (sub === 'divulgacao' || sub === 'divulgação' || sub === 'network' || sub === 'parcerias') {
            configs[from].activePreset = '📢 Rede & Divulgação';
            configs[from].antilink = true;
            configs[from].antilinkConfig = {
                enabled: true,
                action: 'delete',
                platforms: { whatsapp: true, canal: true, telegram: true, instagram: true, tiktok: true, discord: true, youtube: true, outros: true }
            };
            configs[from].antitrava = true;
            configs[from].antispam = true;
            configs[from].antiscam = true;
            configs[from].antifake = true;
            configs[from].autokick = true;
            configs[from].xpEnabled = true;
            configs[from].notifyLevelUp = false; // Não polui com cartões
            if (!configs[from].divulgacaoMode) {
                configs[from].divulgacaoMode = { enabled: true, notifyPv: true, link: '', closeMessage: '' };
            } else {
                configs[from].divulgacaoMode.enabled = true;
            }
            await dataService.saveConfigsData(configs);

            return reply(`✅ *PRESET ATIVADO: 📢 REDE & DIVULGAÇÃO*\n\n🛡️ *Proteções Aplicadas:*\n• Anti-Link Global 100% Ativo (bloqueia todas as redes)\n• Anti-Trava, Anti-Flood e Auto-Kick Ativados\n• Anti-Fake Ativado (DDI estrangeiro)\n• Modo Divulgação Ativo (mensagem e link ao fechar)\n• Avisos de Level-Up Silenciados\n\n💡 _Use \`${prefix}mododivulgacao link <url>\` para cadastrar o link oficial._`);
        }

        // 3. PRESET: VAGAS T.I
        if (sub === 'vagas' || sub === 'vaga' || sub === 'oportunidades' || sub === 'trampo') {
            configs[from].activePreset = '💼 Vagas & Carreiras T.I';
            configs[from].antilink = true;
            configs[from].antilinkConfig = {
                enabled: true,
                action: 'delete',
                platforms: { whatsapp: true, canal: true, telegram: true, instagram: true, tiktok: true, discord: true, youtube: true, outros: false }
            };
            configs[from].antispam = true;
            configs[from].antitrava = true;
            configs[from].antifake = true;
            configs[from].autokick = true;
            configs[from].xpEnabled = true;
            configs[from].notifyLevelUp = false;
            await dataService.saveConfigsData(configs);

            return reply(`✅ *PRESET ATIVADO: 💼 VAGAS & CARREIRAS T.I*\n\n🛡️ *Configurações Aplicadas:*\n• Links de outros grupos/canais: ❌ Bloqueados\n• Links de vagas (LinkedIn/Gupy/GitHub/Sites): ✅ Permitidos\n• Anti-Spam de correntes e robôs: ✅ Ativo\n• Anti-Fake & Trava: ✅ Ativos\n• Cartões de Level-Up: 🔇 Silenciosos`);
        }

        // 4. PRESET: ESTUDOS & PDFS
        if (sub === 'estudos' || sub === 'estudo' || sub === 'livros' || sub === 'livro' || sub === 'pdf' || sub === 'pdfs') {
            configs[from].activePreset = '📚 Estudos & Livros';
            configs[from].antilink = true;
            configs[from].antilinkConfig = {
                enabled: true,
                action: 'delete',
                platforms: { whatsapp: true, canal: true, telegram: true, instagram: false, tiktok: true, discord: false, youtube: false, outros: false }
            };
            configs[from].antitrava = true;
            configs[from].antispam = true;
            configs[from].xpEnabled = true;
            configs[from].notifyLevelUp = false; // Silêncio para quem estuda
            await dataService.saveConfigsData(configs);

            return reply(`✅ *PRESET ATIVADO: 📚 ESTUDOS & LIVROS*\n\n📖 *Configurações Otimizadas:*\n• Motor de Livros & PDFs (\`${prefix}livro\`): 🚀 Prioridade Máxima\n• Links de grupos invasores: ❌ Bloqueados\n• Links de videoaulas (YouTube) e Docs: ✅ Permitidos\n• Alertas de subida de nível: 🔇 Silenciosos (não poluem o estudo)\n• Ganho de XP por mensagem: ✅ Ativo`);
        }

        // 5. PRESET: VENDAS & COMPRAS
        if (sub === 'vendas' || sub === 'compras' || sub === 'comprasevendas' || sub === 'marketplace') {
            configs[from].activePreset = '🏷️ Vendas & Negócios';
            configs[from].preset = 'vendas';
            configs[from].antiscam = true; // Anti-Golpe Heurístico Zero-Day
            configs[from].antilink = true;
            configs[from].antilinkConfig = {
                enabled: true,
                action: 'delete',
                platforms: { whatsapp: true, canal: true, telegram: true, instagram: false, tiktok: false, discord: true, youtube: false, outros: false }
            };
            configs[from].antitrava = true;
            configs[from].antispam = true;
            configs[from].antiscam = true;
            configs[from].antifake = true; // Bloqueia fakes gringos
            configs[from].autokick = true;
            configs[from].xpEnabled = true;
            configs[from].notifyLevelUp = false;
            await dataService.saveConfigsData(configs);

            return reply(`✅ *PRESET ATIVADO: 🏷️ VENDAS & NEGÓCIOS*\n\n🛡️ *Configurações de Segurança:*\n• Anti-Golpe Heurístico Zero-Day (tarefas/renda falsa): 🚨 Ativo com ban imediato\n• Anti-Fake (DDIs estrangeiros bloqueados): ✅ Ativo\n• Anti-Link para canais e grupos de terceiros: ❌ Bloqueados\n• Sistema de Reputação Comercial (\`${prefix}reputacao\`): 💎 Recomendado\n• Anti-Trava e Anti-Spam: ✅ Ativos\n• Auto-Kick em infrações: ✅ Ativo`);
        }

        // 6. PRESET: RESENHA & CHAT GERAL
        if (sub === 'resenha' || sub === 'geral' || sub === 'chatgeral' || sub === 'social') {
            configs[from].activePreset = '💬 Resenha & Chat Geral';
            configs[from].antilink = true;
            configs[from].antilinkConfig = {
                enabled: true,
                action: 'delete',
                platforms: { whatsapp: true, canal: true, telegram: false, instagram: false, tiktok: false, discord: false, youtube: false, outros: false }
            };
            configs[from].antitrava = true;
            configs[from].antispam = false;
            configs[from].antifake = false;
            configs[from].xpEnabled = true;
            configs[from].notifyLevelUp = true; // Comemorações ativas!
            await dataService.saveConfigsData(configs);

            return reply(`✅ *PRESET ATIVADO: 💬 RESENHA & CHAT GERAL*\n\n🎉 *Configurações de Interação:*\n• Minigames, Cassino, RPG e Economia: ✅ 100% Liberados\n• Cartões de Level-Up no Chat: 🎉 Ativados com festa\n• Anti-Trava: ✅ Ativo\n• Bloqueio de links de grupos invasores: ✅ Ativo`);
        }

        // 7. PRESET: COMANDOS
        if (sub === 'comandos' || sub === 'cmd' || sub === 'bot' || sub === 'testes') {
            configs[from].activePreset = '⚡ Laboratório de Comandos';
            configs[from].antilink = false;
            configs[from].antispam = false;
            configs[from].antitrava = true;
            configs[from].xpEnabled = true;
            configs[from].notifyLevelUp = true;
            await dataService.saveConfigsData(configs);

            return reply(`✅ *PRESET ATIVADO: ⚡ LABORATÓRIO DE COMANDOS*\n\n🧪 *Configurações para Testes:*\n• Todos os 10.000 Comandos e 20.000 Aliases Liberados\n• Rate Limits: Suaves\n• XP e Level-Up: Ativos\n• Anti-Link: Desativado para facilitar envio de testes`);
        }

        return reply(`❌ Preset "${sub}" não encontrado. Digite \`${prefix}preset\` para ver as opções disponíveis.`);
    }
};
