const { nomeDoMembro } = require('../../utils/nomeMembro');
/**
 * Comando .afiliado / .linkafiliado / .permissaolink
 * Gestão de permissões de postagem de links e afiliados com cotas diárias e punição progressiva
 */

const dataService = require('../../services/dataService');
const groupAuthService = require('../../services/groupAuthService');
const groupRemovalService = require('../../services/groupRemovalService');
const { getBotName } = require('../../config/botConfig');
const { renderCard } = require('../../utils/uiEngine');
const logger = require('../../core/logger');

module.exports = {
    name: 'afiliado',
    aliases: ["linkafiliado","permissaolink","limitelink","afiliados","cotaslinks","cmd_afiliado","alt_afiliado","atalho_afiliado","abrev_afiliado","call_afiliado","func_afiliado"],
    category: 'admin',
    description: 'Configura cotas e limites diários de postagem de links por usuário no grupo',
    usage: '[on|off | limite <n> | autorizar @pessoa <n> | revogar @pessoa]',
    examples: [' — mostra o painel', 'on — liga a fiscalização de links', 'limite 3 — até 3 links por dia por membro'],
    groupOnly: true,
    adminOnly: true,
    botAdminOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, args, reply, sender, mentioned, info, client, prefix = '.' }) => {
        const botName = getBotName();

        // Alvo no mesmo formato de JID que o anti-link usa para contar (o
        // participante do grupo). Antes a cota era gravada em "@5511...", uma
        // chave que nunca batia com ninguém: o comando dizia sucesso e não fazia nada.
        const alvoDe = async () => {
            const bruto = groupRemovalService.extrairAlvo({ info, args: args.slice(1), mentioned });
            if (!bruto) return null;
            try {
                return await groupAuthService.resolveMemberJid(client, bruto, from) || bruto;
            } catch (err) {
                logger.warn(`[AFILIADO] Não resolvi ${bruto} em ${from}: ${err.message}`);
                return bruto;
            }
        };
        const configs = dataService.getConfigsData();
        if (!configs[from]) configs[from] = {};

        if (!configs[from].afiliadoConfig) {
            configs[from].afiliadoConfig = {
                enabled: false,
                defaultLinkLimit: 2, // 2 links por dia por padrão
                userLimits: {},     // { [jid]: customLimit }
                userPosts: {}       // { [jid]: { count: number, date: 'YYYY-MM-DD' } }
            };
        }

        const cfg = configs[from].afiliadoConfig;
        const sub = (args[0] || '').toLowerCase().trim();
        const param = (args[1] || '').trim();

        // 0. PREVIEW: Simulação de Alerta de Limite Excedido
        if (sub === 'preview' || sub === 'teste' || sub === 'test') {
            const senderNum = sender.split('@')[0].split(':')[0];
            const warnLimit = configs[from].warnLimit || 3;

            const card = renderCard({
                title: "ALERTA: LIMITE DE LINKS EXCEDIDO!",
                icon: "🚫",
                subtitle: `👤 *Usuário:* ${nomeDoMembro(sender)}`,
                sections: [
                    {
                        title: "DETALHES DA INFRAÇÃO",
                        icon: "🔗",
                        fields: [
                            { label: "Cota Diária Permitida", value: `${cfg.defaultLinkLimit} Links / dia`, icon: "📊" },
                            { label: "Links Enviados Hoje", value: `${cfg.defaultLinkLimit + 1} Links (Limite Ultrapassado)`, icon: "🔢" },
                            { label: "Ação Imediata", value: "🗑️ Mensagem com link apagada", icon: "⚡" },
                            { label: "Punição Aplicada", value: `⚠️ +1 Advertência (2 / ${warnLimit})`, icon: "⚖️" }
                        ]
                    },
                    {
                        title: "REGRA DE BANIMENTO",
                        icon: "🚫",
                        fields: [
                            `Ao atingir ${warnLimit} advertências, o infrator é permanentemente expulso do grupo!`
                        ]
                    }
                ],
                tip: `Administradores podem alterar a cota com: ${prefix}afiliado limite <n>`,
                mentions: [sender]
            });

            return reply(card, [sender]);
        }

        // 1. Toggle Geral (.afiliado on / .afiliado off)
        if (sub === 'on' || sub === 'ativar' || sub === '1') {
            cfg.enabled = true;
            await dataService.saveConfigsData(configs);
            return reply(`🛡️ *SISTEMA DE LINKS & AFILIADOS ATIVADO!*\n\n📊 *Limite Padrão:* ${cfg.defaultLinkLimit} links/dia por usuário.\n🗑️ Links acima do limite serão *apagados*, o usuário receberá *+1 advertência* e será *banido* ao atingir o limite de warns.`);
        }

        if (sub === 'off' || sub === 'desativar' || sub === '0') {
            cfg.enabled = false;
            await dataService.saveConfigsData(configs);
            return reply(`🛡️ *SISTEMA DE LINKS & AFILIADOS DESATIVADO!*`);
        }

        // 2. Definir Limite Geral (.afiliado limite <número>)
        if (sub === 'limite' || sub === 'limit' || sub === 'max') {
            const novoLimite = parseInt(param, 10);
            if (isNaN(novoLimite) || novoLimite < 0 || novoLimite > 50) {
                return reply(`❌ Informe um número válido de links permitidos de 0 a 50 (ex: \`${prefix}afiliado limite 2\`).\n💡 Se definir 0, nenhum link será permitido.`);
            }

            cfg.defaultLinkLimit = novoLimite;
            await dataService.saveConfigsData(configs);
            return reply(`✅ *LIMITE DE LINKS ATUALIZADO!*\n\n📊 Cada membro comum agora pode postar no máximo *${novoLimite} link(s)* por dia no grupo.`);
        }

        // 3. Autorizar Cota Personalizada (.afiliado autorizar @user <limite>)
        if (sub === 'autorizar' || sub === 'permitir' || sub === 'liberar') {
            const cleanTarget = await alvoDe();
            const targetLimit = parseInt(args[2], 10);

            if (!cleanTarget || isNaN(targetLimit) || targetLimit < 1) {
                return reply(`❓ Diga quem e quantos links por dia: \`${prefix}afiliado autorizar @pessoa 10\``);
            }

            cfg.userLimits = cfg.userLimits || {};
            cfg.userLimits[cleanTarget] = targetLimit;
            await dataService.saveConfigsData(configs);

            return reply(`🎉 *COTA DE AFILIADO CONCEDIDA!*\n\n👤 *Afiliado:* ${nomeDoMembro(cleanTarget)}\n📊 *Cota Especial:* *${targetLimit} link(s)* por dia liberados no grupo!`, [cleanTarget]);
        }

        // 4. Revogar Cota Personalizada (.afiliado revogar @user)
        if (sub === 'revogar' || sub === 'remover' || sub === 'desautorizar') {
            const cleanTarget = await alvoDe();
            if (!cleanTarget) {
                return reply(`❓ Diga de quem tirar a cota especial: \`${prefix}afiliado revogar @pessoa\``);
            }

            if (cfg.userLimits && cfg.userLimits[cleanTarget]) {
                delete cfg.userLimits[cleanTarget];
                await dataService.saveConfigsData(configs);
                return reply(`🗑️ Cota personalizada de ${nomeDoMembro(cleanTarget)} revogada. O usuário voltou ao limite padrão de ${cfg.defaultLinkLimit} links/dia.`, [cleanTarget]);
            } else {
                return reply(`ℹ️ O usuário ${nomeDoMembro(cleanTarget)} não possuía cota especial cadastrada.`, [cleanTarget]);
            }
        }

        // 5. Resetar Contadores (.afiliado resetar @user / .afiliado resetartodos)
        if (sub === 'resetar' || sub === 'zerar') {
            if (param === 'todos' || param === 'all') {
                cfg.userPosts = {};
                await dataService.saveConfigsData(configs);
                return reply(`🔄 *CONTADORES ZERADOS!* O histórico de links postados hoje foi resetado para todos os membros.`);
            }

            const cleanTarget = await alvoDe();
            if (cleanTarget) {
                if (cfg.userPosts && cfg.userPosts[cleanTarget]) {
                    delete cfg.userPosts[cleanTarget];
                    await dataService.saveConfigsData(configs);
                }
                return reply(`🔄 O contador de links postados hoje por ${nomeDoMembro(cleanTarget)} foi zerado com sucesso.`, [cleanTarget]);
            }

            return reply(`❌ Especifique \`${prefix}afiliado resetar @usuario\` ou \`${prefix}afiliado resetar todos\`.`);
        }

        // 6. Painel Principal de Status
        const warnLimit = configs[from].warnLimit || 3;
        const totalAfiliadosEspeciais = Object.keys(cfg.userLimits || {}).length;

        const card = renderCard({
            title: "GESTÃO DE LINKS & AFILIADOS",
            icon: "💼",
            subtitle: "Controla quantos links cada membro pode mandar por dia neste grupo.",
            sections: [
                {
                    title: "STATUS DO SISTEMA",
                    icon: "📊",
                    fields: [
                        { label: "Fiscalização Ativa", value: cfg.enabled ? "🟢 *ATIVADA*" : "🔴 *DESATIVADA*", icon: "⚙️" },
                        { label: "Limite Padrão", value: `${cfg.defaultLinkLimit} Links / dia por membro`, icon: "🔢" },
                        { label: "Limite de Advertências", value: `${warnLimit} Advertências (Ban)`, icon: "⚖️" },
                        { label: "Afiliados com Cota", value: `${totalAfiliadosEspeciais} Membros Autorizados`, icon: "👥" }
                    ]
                },
                {
                    title: "COMANDOS DE CONFIGURAÇÃO",
                    icon: "📜",
                    fields: [
                        `• \`${prefix}afiliado on / off\` ➔ Ativar/Desativar fiscalização`,
                        `• \`${prefix}afiliado limite <n>\` ➔ Alterar limite diário geral`,
                        `• \`${prefix}afiliado autorizar @user <n>\` ➔ Cota especial de links`,
                        `• \`${prefix}afiliado revogar @user\` ➔ Remover cota especial`,
                        `• \`${prefix}afiliado resetar todos\` ➔ Zerar contadores do dia`,
                        `• \`${prefix}afiliado preview\` ➔ Testar visualização do alerta`
                    ]
                }
            ],
            tip: "Qualquer link postado após o limite será apagado na hora e gerará advertência!",
            mentions: [sender]
        });

        return reply(card, [sender]);
    }
};

