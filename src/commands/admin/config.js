/**
 * Comando .config / .configurar / .painelconfig
 * Painel Central de Configurações do Grupo, Mensagens Automáticas e Segurança
 *
 * Mapeamento completo e modular:
 * - Mensagens Automáticas: Abertura, Fechamento, Boas-Vindas (Welcome) e Despedida (Leave)
 * - Rotinas Automáticas: Agenda Diária e Ciclos de Funcionamento
 * - Conteúdo Autônomo: Temas e Intervalos
 * - Segurança & Moderação: Presets e Escudos (Anti-Link, Anti-Fake, Anti-Trava, Anti-Spam)
 * - Wallpapers & Vídeos Animados de Menus
 */

const dataService = require("../../services/dataService");
const { getGreetingVars, buildOpenMessage, buildCloseMessage, buildWelcomeMessage, buildLeaveMessage, variableGuide, resolveMentionsForText } = require("../../services/groupGreetingService");
const { sendMenuMediaMessage, getAllMenuMediaStatus, setWallpaperMode } = require("../../utils/wallpapers");
const { getBotName } = require("../../config/botConfig");
const F = require("../../utils/formato");

module.exports = {
    name: "config",
    aliases: [
        "configurar", "configuracoes", "configs", "painelconfig", "configgrupo", "grupoconfig",
        "configabertura", "configfechamento", "configboasvindas", "configwelcome",
        "configsaida", "configdespedida", "configadeus", "configleave",
        "configfigurinhas", "configfigurinha", "configstickers",
        "configautoresposta", "configautoreply",
        "configagenda", "configauto", "configpreset",
        "configantilink", "configantispam", "configantifake", "configantitrava", "configantidelete", "configantistatus", "configmoderacao", "configseguranca", "configantiraid", "configantiscam", "configantigolpe"
    ],
    category: "admin",
    subcategory: "Configurações do Grupo",
    description: "Painel de controle central de configurações, mensagens automáticas e segurança do grupo",
    usage: "[abertura | fechamento | boasvindas | despedida | figurinhas | autoresposta | agenda | auto | preset | wallpaper | status]",
    examples: [
        " — exibe o painel visual completo com o status de todos os módulos",
        "abertura on — ativa a notificação de abertura",
        "abertura msg <texto> — personaliza a mensagem de abertura",
        "abertura preview — testa o modelo atual de abertura",
        "fechamento msg <texto> — personaliza a mensagem de fechamento",
        "boasvindas on — ativa a mensagem de boas-vindas para novos membros",
        "despedida on — ativa a mensagem de saída",
        "agenda on — ativa a agenda automática de horários",
        "preset vagas — aplica o preset temático de vagas tech"
    ],
    groupOnly: true,
    adminOnly: true,
    cooldownMs: 2000,
    execute: async ({ from, args = [], reply, sender, client, info, commandName, prefix = '.' }) => {
        const botName = getBotName();
        const configs = dataService.getConfigsData();
        if (!configs[from]) configs[from] = {};
        const groupConfig = configs[from];

        // Normalização de gatilhos acionados via aliases específicos (ex: .configabertura on)
        let sub = (args[0] || "").toLowerCase().trim();
        let opt = (args[1] || "").toLowerCase().trim();
        const cmdName = (commandName || "").toLowerCase();

        if (cmdName === "configabertura") {
            opt = sub || "status";
            sub = "abertura";
        } else if (cmdName === "configfechamento") {
            opt = sub || "status";
            sub = "fechamento";
        } else if (cmdName === "configboasvindas" || cmdName === "configwelcome") {
            opt = sub || "status";
            sub = "boasvindas";
        } else if (cmdName === "configsaida" || cmdName === "configdespedida" || cmdName === "configadeus" || cmdName === "configleave") {
            opt = sub || "status";
            sub = "despedida";
        } else if (cmdName === "configfigurinhas" || cmdName === "configfigurinha" || cmdName === "configstickers") {
            opt = sub || "status";
            sub = "figurinhas";
        } else if (cmdName === "configautoresposta" || cmdName === "configautoreply") {
            opt = sub || "status";
            sub = "autoresposta";
        } else if (cmdName === "configagenda") {
            opt = sub || "status";
            sub = "agenda";
        } else if (cmdName === "configauto") {
            opt = sub || "status";
            sub = "auto";
        } else if (cmdName === "configpreset") {
            opt = sub || "status";
            sub = "preset";
        } else if (cmdName === "configantilink") {
            opt = sub || "status";
            sub = "antilink";
        } else if (cmdName === "configantispam") {
            opt = sub || "status";
            sub = "antispam";
        } else if (cmdName === "configantifake") {
            opt = sub || "status";
            sub = "antifake";
        } else if (cmdName === "configantitrava") {
            opt = sub || "status";
            sub = "antitrava";
        } else if (cmdName === "configantidelete") {
            opt = sub || "status";
            sub = "antidelete";
        } else if (cmdName === "configantistatus") {
            opt = sub || "status";
            sub = "antistatus";
        } else if (cmdName === "configmoderacao" || cmdName === "configseguranca") {
            opt = sub || "status";
            sub = "moderacao";
        } else if (cmdName === "configantiraid") {
            opt = sub || "status";
            sub = "antiraid";
        } else if (cmdName === "configantiscam" || cmdName === "configantigolpe") {
            opt = sub || "status";
            sub = "antiscam";
        }

        // ── 1. SUBMÓDULO: MENSAGEM DE ABERTURA ─────────────────────────────
        if (sub === "abertura" || sub === "abrir" || sub === "open") {
            if (opt === "on" || opt === "ativar" || opt === "1") {
                groupConfig.abertura = true;
                groupConfig.aberturaEnabled = true;
                dataService.saveConfigsData(configs);
                return reply(F.tela({
                    emoji: "🔓",
                    titulo: "Mensagem de Abertura Ativada",
                    intro: `A notificação de abertura do grupo foi *ATIVADA* com sucesso!`,
                    proximos: [
                        { nome: "config abertura preview", oque: "ver como a mensagem é exibida" },
                        { nome: "config abertura msg", args: "<texto>", oque: "personalizar o texto" },
                        { nome: "config", oque: "voltar ao painel geral" }
                    ],
                    prefix
                }));
            }

            if (opt === "off" || opt === "desativar" || opt === "0") {
                groupConfig.abertura = false;
                groupConfig.aberturaEnabled = false;
                dataService.saveConfigsData(configs);
                return reply(F.tela({
                    emoji: "🔴",
                    titulo: "Mensagem de Abertura Desativada",
                    intro: `O bot não enviará mais mensagem ao reabrir o grupo.`,
                    proximos: [
                        { nome: "config abertura on", oque: "reativar a notificação" },
                        { nome: "config", oque: "voltar ao painel geral" }
                    ],
                    prefix
                }));
            }

            if (opt === "msg" || opt === "set" || opt === "mensagem") {
                const customMsg = args.slice(2).join(" ").trim();
                if (!customMsg) {
                    return reply(F.tela({
                        emoji: "📝",
                        titulo: "Como Personalizar a Abertura",
                        intro: `Digite: \`${prefix}config abertura msg <seu texto>\`\n\n${variableGuide("abertura")}`,
                        proximos: [
                            { nome: "config abertura preview", oque: "ver o modelo atual" }
                        ],
                        prefix
                    }));
                }
                groupConfig.aberturaMsg = customMsg;
                groupConfig.abertura = true;
                groupConfig.aberturaEnabled = true;
                dataService.saveConfigsData(configs);
                return reply(F.tela({
                    emoji: "✅",
                    titulo: "Mensagem de Abertura Salva",
                    intro: `Seu modelo personalizado foi gravado com sucesso!`,
                    proximos: [
                        { nome: "config abertura preview", oque: "testar a visualização" },
                        { nome: "config", oque: "voltar ao painel geral" }
                    ],
                    prefix
                }));
            }

            if (opt === "reset" || opt === "padrao") {
                delete groupConfig.aberturaMsg;
                delete groupConfig.openMessage;
                dataService.saveConfigsData(configs);
                return reply(F.tela({
                    emoji: "🔄",
                    titulo: "Abertura Restaurada",
                    intro: `O modelo de abertura voltou para o Padrão Oficial do Clube dos Campeões.`,
                    prefix
                }));
            }

            // Preview / Status de abertura
            const vars = await getGreetingVars(client, from, sender, { adminJid: sender, tempo: "Abertura Manual / Programada" });
            const previewText = buildOpenMessage(groupConfig, vars).trim();
            const isActive = Boolean(groupConfig.abertura || groupConfig.aberturaEnabled);

            let doc = `╔══════════════════════════════════════╗\n`;
            doc += `║ ⚙️  CONFIG: MENSAGEM DE ABERTURA     ║\n`;
            doc += `╚══════════════════════════════════════╝\n`;
            doc += `       ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ SKYCODE PROTOCOL\n\n`;
            doc += `📌 *Status:* ${isActive ? "🟢 Ativado" : "🔴 Desativado"} | 📝 *Modelo:* ${groupConfig.aberturaMsg ? "Personalizado" : "Padrão Oficial"}\n`;
            doc += `👥 *Grupo:* ${vars.groupName} (${vars.memberCount} membros)\n\n`;
            doc += `━━━━━ [ PRÉVIA DA NOTIFICAÇÃO ] ━━━━━\n\n`;
            doc += previewText + `\n\n`;
            doc += `──────────────────────────────────────\n`;
            doc += `🧭 *COMANDOS PARA AJUDAR:*\n`;
            doc += `• \`${prefix}config abertura on\` — Ativar mensagem\n`;
            doc += `• \`${prefix}config abertura off\` — Desativar mensagem\n`;
            doc += `• \`${prefix}config abertura msg <texto>\` — Personalizar texto\n`;
            doc += `• \`${prefix}config abertura reset\` — Restaurar padrão oficial\n`;
            doc += `• \`${prefix}config\` — Voltar ao painel geral`;
            return reply(doc);
        }

        // ── 2. SUBMÓDULO: MENSAGEM DE FECHAMENTO ───────────────────────────
        if (sub === "fechamento" || sub === "fechar" || sub === "close") {
            if (opt === "on" || opt === "ativar" || opt === "1") {
                groupConfig.fechamento = true;
                groupConfig.fechamentoEnabled = true;
                dataService.saveConfigsData(configs);
                return reply(F.tela({
                    emoji: "🔒",
                    titulo: "Mensagem de Fechamento Ativada",
                    intro: `A notificação ao fechar o grupo foi *ATIVADA* com sucesso!`,
                    proximos: [
                        { nome: "config fechamento preview", oque: "ver prévia do fechamento" },
                        { nome: "config fechamento msg", args: "<texto>", oque: "personalizar o texto" },
                        { nome: "config", oque: "voltar ao painel geral" }
                    ],
                    prefix
                }));
            }

            if (opt === "off" || opt === "desativar" || opt === "0") {
                groupConfig.fechamento = false;
                groupConfig.fechamentoEnabled = false;
                dataService.saveConfigsData(configs);
                return reply(F.tela({
                    emoji: "🔴",
                    titulo: "Mensagem de Fechamento Desativada",
                    intro: `O bot não enviará notificação ao trancar o grupo.`,
                    prefix
                }));
            }

            if (opt === "msg" || opt === "set" || opt === "mensagem") {
                const customMsg = args.slice(2).join(" ").trim();
                if (!customMsg) {
                    return reply(F.tela({
                        emoji: "📝",
                        titulo: "Como Personalizar o Fechamento",
                        intro: `Digite: \`${prefix}config fechamento msg <seu texto>\`\n\n${variableGuide("fechamento")}`,
                        prefix
                    }));
                }
                groupConfig.fechamentoMsg = customMsg;
                groupConfig.fechamento = true;
                groupConfig.fechamentoEnabled = true;
                dataService.saveConfigsData(configs);
                return reply(F.tela({
                    emoji: "✅",
                    titulo: "Mensagem de Fechamento Salva",
                    intro: `Seu modelo personalizado de fechamento foi gravado com sucesso!`,
                    proximos: [
                        { nome: "config fechamento preview", oque: "testar visualização" },
                        { nome: "config", oque: "voltar ao painel geral" }
                    ],
                    prefix
                }));
            }

            if (opt === "reset" || opt === "padrao") {
                delete groupConfig.fechamentoMsg;
                delete groupConfig.closeMessage;
                dataService.saveConfigsData(configs);
                return reply(F.tela({
                    emoji: "🔄",
                    titulo: "Fechamento Restaurado",
                    intro: `O modelo de fechamento voltou para o Padrão Oficial do Clube dos Campeões.`,
                    prefix
                }));
            }

            const vars = await getGreetingVars(client, from, sender, { adminJid: sender, tempo: "Duração Definida / Fechado" });
            const previewText = buildCloseMessage(groupConfig, vars).trim();
            const isActive = Boolean(groupConfig.fechamento || groupConfig.fechamentoEnabled);

            let doc = `╔══════════════════════════════════════╗\n`;
            doc += `║ ⚙️  CONFIG: MENSAGEM DE FECHAMENTO   ║\n`;
            doc += `╚══════════════════════════════════════╝\n`;
            doc += `       ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ SKYCODE PROTOCOL\n\n`;
            doc += `📌 *Status:* ${isActive ? "🟢 Ativado" : "🔴 Desativado"} | 📝 *Modelo:* ${groupConfig.fechamentoMsg ? "Personalizado" : "Padrão Oficial"}\n`;
            doc += `👥 *Grupo:* ${vars.groupName} (${vars.memberCount} membros)\n\n`;
            doc += `━━━━━ [ PRÉVIA DA NOTIFICAÇÃO ] ━━━━━\n\n`;
            doc += previewText + `\n\n`;
            doc += `──────────────────────────────────────\n`;
            doc += `🧭 *COMANDOS PARA AJUDAR:*\n`;
            doc += `• \`${prefix}config fechamento on\` — Ativar mensagem\n`;
            doc += `• \`${prefix}config fechamento off\` — Desativar mensagem\n`;
            doc += `• \`${prefix}config fechamento msg <texto>\` — Personalizar texto\n`;
            doc += `• \`${prefix}config fechamento reset\` — Restaurar padrão oficial\n`;
            doc += `• \`${prefix}config\` — Voltar ao painel geral`;
            return reply(doc);
        }

        // ── 3. SUBMÓDULO: MENSAGEM DE BOAS-VINDAS (WELCOME) ────────────────
        if (sub === "boasvindas" || sub === "welcome" || sub === "bv" || sub === "bemvindo") {
            if (opt === "on" || opt === "ativar" || opt === "1") {
                groupConfig.welcome = true;
                groupConfig.welcomeEnabled = true;
                dataService.saveConfigsData(configs);
                return reply(F.tela({
                    emoji: "👋",
                    titulo: "Boas-Vindas Ativada",
                    intro: `Novos membros receberão card e mensagem comemorativa ao entrar no grupo!`,
                    proximos: [
                        { nome: "config boasvindas preview", oque: "ver modelo de boas-vindas" },
                        { nome: "config boasvindas msg", args: "<texto>", oque: "personalizar mensagem" },
                        { nome: "config", oque: "voltar ao painel geral" }
                    ],
                    prefix
                }));
            }

            if (opt === "off" || opt === "desativar" || opt === "0") {
                groupConfig.welcome = false;
                groupConfig.welcomeEnabled = false;
                dataService.saveConfigsData(configs);
                return reply(F.tela({
                    emoji: "🔴",
                    titulo: "Boas-Vindas Desativada",
                    intro: `O bot não enviará mensagem quando novos membros entrarem.`,
                    prefix
                }));
            }

            if (opt === "msg" || opt === "set" || opt === "mensagem") {
                const customMsg = args.slice(2).join(" ").trim();
                if (!customMsg) {
                    return reply(F.tela({
                        emoji: "📝",
                        titulo: "Como Personalizar Boas-Vindas",
                        intro: `Digite: \`${prefix}config boasvindas msg <seu texto>\`\n\n${variableGuide("welcome")}`,
                        prefix
                    }));
                }
                groupConfig.welcomeMessage = customMsg;
                groupConfig.welcome = true;
                groupConfig.welcomeEnabled = true;
                dataService.saveConfigsData(configs);
                return reply(F.tela({
                    emoji: "✅",
                    titulo: "Boas-Vindas Personalizada Salva",
                    intro: `Seu modelo foi registrado com sucesso!`,
                    proximos: [
                        { nome: "config boasvindas preview", oque: "ver prévia" },
                        { nome: "config", oque: "voltar ao painel geral" }
                    ],
                    prefix
                }));
            }

            if (opt === "reset" || opt === "padrao") {
                delete groupConfig.welcomeMessage;
                dataService.saveConfigsData(configs);
                return reply(F.tela({
                    emoji: "🔄",
                    titulo: "Boas-Vindas Restaurada",
                    intro: `Modelo de boas-vindas restaurado para o padrão oficial.`,
                    prefix
                }));
            }

            if (opt === "figurinha" || opt === "sticker" || opt === "fig") {
                const subOpt = (args[2] || "").toLowerCase().trim();
                if (subOpt === "on" || subOpt === "ativar" || subOpt === "1") {
                    groupConfig.welcomeFigurinha = true;
                    groupConfig.welcomeSticker = true;
                    dataService.saveConfigsData(configs);
                    return reply(F.tela({
                        emoji: "🎨",
                        titulo: "Figurinha de Boas-Vindas Ativada",
                        intro: `A figurinha exclusiva do ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ será enviada com o anúncio de entrada!\n\n✨ *Garantia:* A figurinha é 100% diferente do wallpaper da notificação.`,
                        proximos: [
                            { nome: "config boasvindas preview", oque: "ver prévia atual" },
                            { nome: "config boasvindas figurinha off", oque: "desativar envio da figurinha" },
                            { nome: "config", oque: "voltar ao painel geral" }
                        ],
                        prefix
                    }));
                }
                if (subOpt === "off" || subOpt === "desativar" || subOpt === "0") {
                    groupConfig.welcomeFigurinha = false;
                    groupConfig.welcomeSticker = false;
                    dataService.saveConfigsData(configs);
                    return reply(F.tela({
                        emoji: "🔴",
                        titulo: "Figurinha de Boas-Vindas Desativada",
                        intro: `Novos membros receberão apenas o wallpaper e o texto de boas-vindas (sem figurinha).`,
                        proximos: [
                            { nome: "config boasvindas figurinha on", oque: "reativar figurinha" },
                            { nome: "config", oque: "voltar ao painel geral" }
                        ],
                        prefix
                    }));
                }
                const isFigOn = Boolean(groupConfig.welcomeFigurinha || groupConfig.welcomeSticker);
                return reply(F.tela({
                    emoji: "🎨",
                    titulo: "Configuração de Figurinha de Entrada",
                    intro: `Status atual: ${isFigOn ? "🟢 Ativada (Diferenciada do Wallpaper)" : "🔴 Desativada"}\n\nPara alternar use:\n• \`${prefix}config boasvindas figurinha on\`\n• \`${prefix}config boasvindas figurinha off\``,
                    prefix
                }));
            }

            const vars = await getGreetingVars(client, from, sender);
            const previewText = buildWelcomeMessage(groupConfig, vars).trim();
            const isActive = groupConfig.welcome === true || groupConfig.welcomeEnabled === true;
            const isFigOn = Boolean(groupConfig.welcomeFigurinha || groupConfig.welcomeSticker) && Boolean(groupConfig.figurinhasEventos);

            let doc = `╔══════════════════════════════════════╗\n`;
            doc += `║ ⚙️  CONFIG: BOAS-VINDAS (WELCOME)    ║\n`;
            doc += `╚══════════════════════════════════════╝\n`;
            doc += `       ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ SKYCODE PROTOCOL\n\n`;
            doc += `📌 *Status:* ${isActive ? "🟢 Ativado" : "🔴 Desativado"} | 📝 *Modelo:* ${groupConfig.welcomeMessage ? "Personalizado" : "Padrão Oficial"}\n`;
            doc += `🎨 *Figurinha Exclusiva:* ${isFigOn ? "🟢 Ativada (Diferenciada do Wallpaper)" : "🔴 Desativada"}\n`;
            doc += `👥 *Grupo:* ${vars.groupName} (${vars.memberCount} membros)\n\n`;
            doc += `━━━━━ [ PRÉVIA DE BOAS-VINDAS ] ━━━━━\n\n`;
            doc += previewText + `\n\n`;
            doc += `──────────────────────────────────────\n`;
            doc += `🧭 *COMANDOS PARA AJUDAR:*\n`;
            doc += `• \`${prefix}config boasvindas on\` — Ativar mensagem\n`;
            doc += `• \`${prefix}config boasvindas off\` — Desativar mensagem\n`;
            doc += `• \`${prefix}config boasvindas msg <texto>\` — Personalizar texto\n`;
            doc += `• \`${prefix}config boasvindas figurinha on|off\` — Alternar figurinha de entrada\n`;
            doc += `• \`${prefix}config boasvindas reset\` — Restaurar padrão\n`;
            doc += `• \`${prefix}config\` — Voltar ao painel geral`;
            return reply(doc);
        }

        // ── 4. SUBMÓDULO: MENSAGEM DE DESPEDIDA / SAÍDA (LEAVE) ───────────
        if (sub === "despedida" || sub === "leave" || sub === "saida" || sub === "adeus") {
            if (opt === "on" || opt === "ativar" || opt === "1") {
                groupConfig.leave = true;
                groupConfig.leaveEnabled = true;
                dataService.saveConfigsData(configs);
                return reply(F.tela({
                    emoji: "🚪",
                    titulo: "Mensagem de Despedida Ativada",
                    intro: `O bot anunciará no grupo quando algum membro sair ou for removido.`,
                    proximos: [
                        { nome: "config despedida preview", oque: "ver modelo de saída" },
                        { nome: "config despedida msg", args: "<texto>", oque: "personalizar mensagem" },
                        { nome: "config", oque: "voltar ao painel geral" }
                    ],
                    prefix
                }));
            }

            if (opt === "off" || opt === "desativar" || opt === "0") {
                groupConfig.leave = false;
                groupConfig.leaveEnabled = false;
                dataService.saveConfigsData(configs);
                return reply(F.tela({
                    emoji: "🔴",
                    titulo: "Mensagem de Despedida Desativada",
                    intro: `O bot não enviará mais mensagem quando alguém sair.`,
                    prefix
                }));
            }

            if (opt === "msg" || opt === "set" || opt === "mensagem") {
                const customMsg = args.slice(2).join(" ").trim();
                if (!customMsg) {
                    return reply(F.tela({
                        emoji: "📝",
                        titulo: "Como Personalizar Despedida",
                        intro: `Digite: \`${prefix}config despedida msg <seu texto>\`\n\n${variableGuide("leave")}`,
                        prefix
                    }));
                }
                groupConfig.leaveMessage = customMsg;
                groupConfig.leave = true;
                groupConfig.leaveEnabled = true;
                dataService.saveConfigsData(configs);
                return reply(F.tela({
                    emoji: "✅",
                    titulo: "Mensagem de Despedida Salva",
                    intro: `Seu modelo de saída foi registrado com sucesso!`,
                    proximos: [
                        { nome: "config despedida preview", oque: "testar prévia" },
                        { nome: "config", oque: "voltar ao painel geral" }
                    ],
                    prefix
                }));
            }

            if (opt === "reset" || opt === "padrao") {
                delete groupConfig.leaveMessage;
                dataService.saveConfigsData(configs);
                return reply(F.tela({
                    emoji: "🔄",
                    titulo: "Despedida Restaurada",
                    intro: `Modelo de despedida restaurado para o padrão oficial.`,
                    prefix
                }));
            }

            if (opt === "figurinha" || opt === "sticker" || opt === "fig") {
                const subOpt = (args[2] || "").toLowerCase().trim();
                if (subOpt === "on" || subOpt === "ativar" || subOpt === "1") {
                    groupConfig.leaveFigurinha = true;
                    groupConfig.leaveSticker = true;
                    dataService.saveConfigsData(configs);
                    return reply(F.tela({
                        emoji: "🎨",
                        titulo: "Figurinha de Despedida Ativada",
                        intro: `A saída de participantes será acompanhada de figurinha exclusiva do ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤!\n\n✨ *Garantia:* A figurinha é 100% diferente do wallpaper de saída.`,
                        proximos: [
                            { nome: "config despedida preview", oque: "ver status atual" },
                            { nome: "config despedida figurinha off", oque: "desativar figurinha" },
                            { nome: "config", oque: "voltar ao painel geral" }
                        ],
                        prefix
                    }));
                }
                if (subOpt === "off" || subOpt === "desativar" || subOpt === "0") {
                    groupConfig.leaveFigurinha = false;
                    groupConfig.leaveSticker = false;
                    dataService.saveConfigsData(configs);
                    return reply(F.tela({
                        emoji: "🔴",
                        titulo: "Figurinha de Despedida Desativada",
                        intro: `A saída terá apenas o wallpaper e texto da notificação (sem figurinha).`,
                        proximos: [
                            { nome: "config despedida figurinha on", oque: "reativar figurinha" },
                            { nome: "config", oque: "voltar ao painel geral" }
                        ],
                        prefix
                    }));
                }
                const isFigOn = Boolean(groupConfig.leaveFigurinha || groupConfig.leaveSticker);
                return reply(F.tela({
                    emoji: "🎨",
                    titulo: "Configuração de Figurinha de Saída",
                    intro: `Status atual: ${isFigOn ? "🟢 Ativada (Diferenciada do Wallpaper)" : "🔴 Desativada"}\n\nPara alternar use:\n• \`${prefix}config despedida figurinha on\`\n• \`${prefix}config despedida figurinha off\``,
                    prefix
                }));
            }

            const vars = await getGreetingVars(client, from, sender);
            const previewText = buildLeaveMessage(groupConfig, vars).trim();
            const isActive = groupConfig.leave === true || groupConfig.leaveEnabled === true;
            const isFigOn = Boolean(groupConfig.leaveFigurinha || groupConfig.leaveSticker) && Boolean(groupConfig.figurinhasEventos);

            let doc = `╔══════════════════════════════════════╗\n`;
            doc += `║ ⚙️  CONFIG: DESPEDIDA / SAÍDA        ║\n`;
            doc += `╚══════════════════════════════════════╝\n`;
            doc += `       ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ SKYCODE PROTOCOL\n\n`;
            doc += `📌 *Status:* ${isActive ? "🟢 Ativado" : "🔴 Desativado"} | 📝 *Modelo:* ${groupConfig.leaveMessage ? "Personalizado" : "Padrão Oficial"}\n`;
            doc += `🎨 *Figurinha Exclusiva:* ${isFigOn ? "🟢 Ativada (Diferenciada do Wallpaper)" : "🔴 Desativada"}\n`;
            doc += `👥 *Grupo:* ${vars.groupName} (${vars.memberCount} membros)\n\n`;
            doc += `━━━━━ [ PRÉVIA DE DESPEDIDA ] ━━━━━\n\n`;
            doc += previewText + `\n\n`;
            doc += `──────────────────────────────────────\n`;
            doc += `🧭 *COMANDOS PARA AJUDAR:*\n`;
            doc += `• \`${prefix}config despedida on\` — Ativar mensagem\n`;
            doc += `• \`${prefix}config despedida off\` — Desativar mensagem\n`;
            doc += `• \`${prefix}config despedida msg <texto>\` — Personalizar texto\n`;
            doc += `• \`${prefix}config despedida figurinha on|off\` — Alternar figurinha de saída\n`;
            doc += `• \`${prefix}config despedida reset\` — Restaurar padrão\n`;
            doc += `• \`${prefix}config\` — Voltar ao painel geral`;
            return reply(doc);
        }

        // ── 4.1 SUBMÓDULO: FIGURINHAS DE EVENTOS (ROTAÇÃO & DIFERENCIAÇÃO) ─
        if (sub === "figurinhas" || sub === "figurinha" || sub === "stickers" || sub === "sticker") {
            const figurinhaEventoService = require("../../services/figurinhaEventoService");
            if (opt === "on" || opt === "ativar" || opt === "1") {
                groupConfig.figurinhasEventos = true;
                groupConfig.welcomeFigurinha = true;
                groupConfig.welcomeSticker = true;
                groupConfig.leaveFigurinha = true;
                groupConfig.leaveSticker = true;
                dataService.saveConfigsData(configs);
                return reply(F.tela({
                    emoji: "🎨",
                    titulo: "Figurinhas de Eventos Ativadas",
                    intro: `Todas as figurinhas automáticas nos eventos de grupo foram *ATIVADAS*!\n\n✨ *Diferenciação Ativa:* Nenhuma figurinha repete a imagem do wallpaper da mensagem automática.`,
                    proximos: [
                        { nome: "config", oque: "painel geral de configurações" },
                        { nome: "config boasvindas figurinha off", oque: "desativar só de entrada" },
                        { nome: "config despedida figurinha off", oque: "desativar só de saída" }
                    ],
                    prefix
                }));
            }
            if (opt === "off" || opt === "desativar" || opt === "0") {
                groupConfig.figurinhasEventos = false;
                dataService.saveConfigsData(configs);
                return reply(F.tela({
                    emoji: "🔴",
                    titulo: "Figurinhas de Eventos Desativadas",
                    intro: `As figurinhas automáticas nos eventos de grupo foram desativadas.`,
                    proximos: [
                        { nome: "config figurinhas on", oque: "reativar todas as figurinhas" },
                        { nome: "config", oque: "voltar ao painel geral" }
                    ],
                    prefix
                }));
            }

            const figStatus = figurinhaEventoService.contagem ? figurinhaEventoService.contagem() : [];
            const isGlobalOn = Boolean(groupConfig.figurinhasEventos);
            const isWelcomeOn = isGlobalOn && Boolean(groupConfig.welcomeFigurinha || groupConfig.welcomeSticker);
            const isLeaveOn = isGlobalOn && Boolean(groupConfig.leaveFigurinha || groupConfig.leaveSticker);

            let doc = `╔══════════════════════════════════════╗\n`;
            doc += `║ 🎨  CONFIG: FIGURINHAS DE EVENTOS    ║\n`;
            doc += `╚══════════════════════════════════════╝\n`;
            doc += `       ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ SKYCODE PROTOCOL\n\n`;
            doc += `📌 *Status Geral:* ${isGlobalOn ? "🟢 Ativadas" : "🔴 Desativadas"}\n`;
            doc += `🖼️ *Diferenciação de Mídia:* 🟢 Ativa (100% distintas dos wallpapers)\n\n`;
            doc += `📋 *ESTADO POR EVENTO:*\n`;
            doc += `• 👋 *Entrada (Boas-Vindas):* ${isWelcomeOn ? "🟢 Ativada" : "🔴 Desativada"}\n`;
            doc += `• 🚪 *Saída (Despedida):* ${isLeaveOn ? "🟢 Ativada" : "🔴 Desativada"}\n`;
            doc += `• 👢 *Banimento:* ${isGlobalOn ? "🟢 Ativada" : "🔴 Desativada"}\n`;
            doc += `• ⭐ *Promoção/Admin:* ${isGlobalOn ? "🟢 Ativada" : "🔴 Desativada"}\n\n`;
            doc += `📦 *PACOTE DE FIGURINHAS DO ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤:*\n`;
            for (const item of figStatus) {
                doc += `• ${item.emoji} *${item.rotulo}:* ${item.total} figurinhas exclusivas\n`;
            }
            doc += `\n──────────────────────────────────────\n`;
            doc += `🧭 *COMANDOS PARA AJUDAR:*\n`;
            doc += `• \`${prefix}config figurinhas on\` — Ativar todas as figurinhas\n`;
            doc += `• \`${prefix}config figurinhas off\` — Desativar todas as figurinhas\n`;
            doc += `• \`${prefix}config boasvindas figurinha on|off\` — Alternar apenas na entrada\n`;
            doc += `• \`${prefix}config despedida figurinha on|off\` — Alternar apenas na saída\n`;
            doc += `• \`${prefix}config\` — Voltar ao painel geral`;
            return reply(doc);
        }

        // ── 5. SUBMÓDULO: AGENDA AUTOMÁTICA & NOTIFICAÇÕES ────────────────
        if (sub === "agenda" || sub === "agendamento" || sub === "rotina") {
            const groupScheduleService = require("../../services/groupScheduleService");
            const sched = groupScheduleService.getSchedule(from);

            // 5.1 ATIVAR (ON) / DESATIVAR (OFF)
            if (opt === "on" || opt === "ativar" || opt === "1" || opt === "ligar") {
                await groupScheduleService.saveSchedule(from, { enabled: true, expired: false });
                const updatedSched = groupScheduleService.getSchedule(from);
                const cicloFmt = groupScheduleService.formatCycle(updatedSched);
                return reply(F.tela({
                    emoji: "📅",
                    titulo: "Agenda Automática Ativada",
                    intro: `A rotina diária de abertura e fechamento foi *ATIVADA* com sucesso!`,
                    secoes: [{
                        emoji: "⚙️",
                        titulo: "Programação Ativa",
                        linhas: [
                            F.campo("Status", "🟢 Ativada"),
                            F.campo("Ciclo", cicloFmt),
                            F.campo("Dias", groupScheduleService.formatDays(updatedSched.days)),
                            F.campo("Fechar", `🔒 ${updatedSched.closeTime}`),
                            F.campo("Abrir", `🔓 ${updatedSched.openTime}`)
                        ]
                    }],
                    proximos: [
                        { nome: "config agenda preview", oque: "ver prévia das notificações" },
                        { nome: "config agenda msgfechar", args: "<texto>", oque: "personalizar mensagem ao fechar" },
                        { nome: "config agenda msgabrir", args: "<texto>", oque: "personalizar mensagem ao abrir" },
                        { nome: "config", oque: "voltar ao painel geral" }
                    ],
                    prefix
                }));
            }

            if (opt === "off" || opt === "desativar" || opt === "0" || opt === "desligar") {
                await groupScheduleService.saveSchedule(from, { enabled: false });
                return reply(F.tela({
                    emoji: "🔴",
                    titulo: "Agenda Automática Desativada",
                    intro: `A rotina de horários foi pausada. O grupo não fechará nem abrirá sozinho até ser religada.`,
                    proximos: [
                        { nome: "config agenda on", oque: "reativar a agenda" },
                        { nome: "config", oque: "voltar ao painel geral" }
                    ],
                    prefix
                }));
            }

            // 5.2 MENSAGEM AO FECHAR (CUSTOMIZAÇÃO)
            if (opt === "msgfechar" || opt === "msgfechamento" || opt === "fechar" || opt === "texto_fechar") {
                const customMsg = args.slice(2).join(" ").trim();
                if (!customMsg) {
                    return reply(F.tela({
                        emoji: "📝",
                        titulo: "Como Personalizar a Agenda ao Fechar",
                        intro: `Digite: \`${prefix}config agenda msgfechar <seu texto>\`\n\n${variableGuide("agenda")}`,
                        proximos: [
                            { nome: "config agenda preview", oque: "ver o modelo atual" }
                        ],
                        prefix
                    }));
                }
                await groupScheduleService.saveSchedule(from, { closeMsg: customMsg });
                return reply(F.tela({
                    emoji: "✅",
                    titulo: "Mensagem da Agenda (Fechar) Salva",
                    intro: `O modelo de notificação para quando a agenda trancar o grupo foi salvo com sucesso!`,
                    proximos: [
                        { nome: "config agenda preview", oque: "testar a visualização" },
                        { nome: "config agenda msgabrir", args: "<texto>", oque: "personalizar mensagem ao abrir" },
                        { nome: "config", oque: "voltar ao painel geral" }
                    ],
                    prefix
                }));
            }

            // 5.3 MENSAGEM AO ABRIR (CUSTOMIZAÇÃO)
            if (opt === "msgabrir" || opt === "msgabertura" || opt === "abrir" || opt === "texto_abrir") {
                const customMsg = args.slice(2).join(" ").trim();
                if (!customMsg) {
                    return reply(F.tela({
                        emoji: "📝",
                        titulo: "Como Personalizar a Agenda ao Abrir",
                        intro: `Digite: \`${prefix}config agenda msgabrir <seu texto>\`\n\n${variableGuide("agenda")}`,
                        proximos: [
                            { nome: "config agenda preview", oque: "ver o modelo atual" }
                        ],
                        prefix
                    }));
                }
                await groupScheduleService.saveSchedule(from, { openMsg: customMsg });
                return reply(F.tela({
                    emoji: "✅",
                    titulo: "Mensagem da Agenda (Abrir) Salva",
                    intro: `O modelo de notificação para quando a agenda reabrir o grupo foi salvo com sucesso!`,
                    proximos: [
                        { nome: "config agenda preview", oque: "testar a visualização" },
                        { nome: "config agenda msgfechar", args: "<texto>", oque: "personalizar mensagem ao fechar" },
                        { nome: "config", oque: "voltar ao painel geral" }
                    ],
                    prefix
                }));
            }

            // 5.4 ATALHO UNIFICADO .config agenda msg <fechar|abrir> <texto>
            if (opt === "msg" || opt === "mensagem") {
                const alvo = (args[2] || "").toLowerCase().trim();
                const textoResto = args.slice(3).join(" ").trim();
                if (alvo === "fechar" || alvo === "fechamento" || alvo === "close") {
                    if (!textoResto) {
                        return reply(F.tela({
                            emoji: "📝",
                            titulo: "Personalizar Mensagem da Agenda ao Fechar",
                            intro: `Digite: \`${prefix}config agenda msg fechar <seu texto>\`\n\n${variableGuide("agenda")}`,
                            prefix
                        }));
                    }
                    await groupScheduleService.saveSchedule(from, { closeMsg: textoResto });
                    return reply(F.tela({
                        emoji: "✅",
                        titulo: "Mensagem da Agenda (Fechar) Salva",
                        intro: `A mensagem enviada ao trancar pela agenda foi atualizada com sucesso!`,
                        proximos: [
                            { nome: "config agenda preview", oque: "testar visualização" }
                        ],
                        prefix
                    }));
                }
                if (alvo === "abrir" || alvo === "abertura" || alvo === "open") {
                    if (!textoResto) {
                        return reply(F.tela({
                            emoji: "📝",
                            titulo: "Personalizar Mensagem da Agenda ao Abrir",
                            intro: `Digite: \`${prefix}config agenda msg abrir <seu texto>\`\n\n${variableGuide("agenda")}`,
                            prefix
                        }));
                    }
                    await groupScheduleService.saveSchedule(from, { openMsg: textoResto });
                    return reply(F.tela({
                        emoji: "✅",
                        titulo: "Mensagem da Agenda (Abrir) Salva",
                        intro: `A mensagem enviada ao reabrir pela agenda foi atualizada com sucesso!`,
                        proximos: [
                            { nome: "config agenda preview", oque: "testar visualização" }
                        ],
                        prefix
                    }));
                }

                // Se passou texto direto sem especificar: orienta os dois lados
                return reply(F.tela({
                    emoji: "📝",
                    titulo: "Como Editar as Mensagens da Agenda",
                    intro: `A agenda possui duas mensagens automáticas personalizáveis:\n\n• \`${prefix}config agenda msgfechar <texto>\` — Notificação ao fechar o grupo\n• \`${prefix}config agenda msgabrir <texto>\` — Notificação ao reabrir o grupo\n\nOu use:\n• \`${prefix}config agenda msg fechar <texto>\`\n• \`${prefix}config agenda msg abrir <texto>\``,
                    proximos: [
                        { nome: "config agenda preview", oque: "ver os modelos atuais" },
                        { nome: "config agenda reset", oque: "restaurar para o padrão oficial" }
                    ],
                    prefix
                }));
            }

            // 5.5 RESETAR PARA PADRÃO OFICIAL
            if (opt === "reset" || opt === "padrao") {
                await groupScheduleService.saveSchedule(from, { closeMsg: null, openMsg: null });
                return reply(F.tela({
                    emoji: "🔄",
                    titulo: "Mensagens da Agenda Restauradas",
                    intro: `As mensagens de abertura e fechamento da agenda voltaram para o Padrão Oficial do Clube dos Campeões.`,
                    proximos: [
                        { nome: "config agenda preview", oque: "conferir modelo padrão" },
                        { nome: "config", oque: "voltar ao painel geral" }
                    ],
                    prefix
                }));
            }

            // 5.6 SET DE HORÁRIOS & DIAS & CICLO (delega ao comando agendagrupo)
            if (opt === "set" || opt === "horario" || opt === "horarios" || opt === "ciclo" || opt === "remover" || opt === "del") {
                const agendaCmd = require("./agendagrupo");
                const newArgs = args.slice(1);
                return agendaCmd.execute({ from, args: newArgs, reply, sender, prefix, client });
            }

            // 5.7 PAINEL / PREVIEW DE AGENDA (DEFAULT)
            const vars = await getGreetingVars(client, from, sender);
            const closeTpl = sched.closeMsg || groupScheduleService.DEFAULT_CLOSE_MESSAGE;
            const openTpl = sched.openMsg || groupScheduleService.DEFAULT_OPEN_MESSAGE;

            const closePreview = groupScheduleService.formatScheduleMessage(closeTpl, {
                groupName: vars.groupName,
                horaFechar: sched.closeTime,
                horaAbrir: sched.openTime,
                diaAbrir: 'às ' + sched.openTime,
                donoTag: vars.donoTag,
                admsTags: vars.admsTags
            });

            const openPreview = groupScheduleService.formatScheduleMessage(openTpl, {
                groupName: vars.groupName,
                horaFechar: sched.closeTime,
                horaAbrir: sched.openTime,
                donoTag: vars.donoTag,
                admsTags: vars.admsTags
            });

            const isActive = sched.enabled;
            const cicloFmt = groupScheduleService.formatCycle(sched);
            const diasFmt = groupScheduleService.formatDays(sched.days);

            let doc = `╔══════════════════════════════════════╗\n`;
            doc += `║ ⚙️  CONFIG: AGENDA AUTOMÁTICA        ║\n`;
            doc += `╚══════════════════════════════════════╝\n`;
            doc += `       ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ SKYCODE PROTOCOL\n\n`;
            doc += `📌 *Status:* ${isActive ? "🟢 Ativada" : "🔴 Desativada"} | ⏳ *Ciclo:* ${cicloFmt}\n`;
            doc += `⏰ *Horários:* 🔒 Fechar: ${sched.closeTime} | 🔓 Abrir: ${sched.openTime}\n`;
            doc += `📅 *Dias:* ${diasFmt}\n`;
            doc += `📝 *Msg Fechar:* ${sched.closeMsg ? "Personalizada" : "Padrão Oficial"}\n`;
            doc += `📝 *Msg Abrir:* ${sched.openMsg ? "Personalizada" : "Padrão Oficial"}\n`;
            doc += `👥 *Grupo:* ${vars.groupName} (${vars.memberCount} membros)\n\n`;

            doc += `━━━━━ [ 🔒 PRÉVIA: AO FECHAR (${sched.closeTime}) ] ━━━━━\n\n`;
            doc += closePreview.trim() + `\n\n`;

            doc += `━━━━━ [ 🔓 PRÉVIA: AO ABRIR (${sched.openTime}) ] ━━━━━\n\n`;
            doc += openPreview.trim() + `\n\n`;

            doc += `──────────────────────────────────────\n`;
            doc += `🧭 *COMANDOS PARA AJUDAR:*\n`;
            doc += `• \`${prefix}config agenda on\` — Ativar agenda\n`;
            doc += `• \`${prefix}config agenda off\` — Desativar agenda\n`;
            doc += `• \`${prefix}config agenda msgfechar <texto>\` — Personalizar mensagem ao trancar\n`;
            doc += `• \`${prefix}config agenda msgabrir <texto>\` — Personalizar mensagem ao reabrir\n`;
            doc += `• \`${prefix}config agenda preview\` — Testar prévia das mensagens\n`;
            doc += `• \`${prefix}config agenda reset\` — Restaurar padrão oficial\n`;
            doc += `• \`${prefix}config agenda set <dias> <fechar> <abrir>\` — Programar dias e horários\n`;
            doc += `• \`${prefix}config agenda ciclo <permanente|semana|mes>\` — Definir ciclo de repetição\n`;
            doc += `• \`${prefix}config\` — Voltar ao painel geral`;

            const mentions = resolveMentionsForText(doc, vars);
            return reply(doc, mentions);
        }

        // ── 6. SUBMÓDULO: CONTEÚDO AUTÔNOMO ────────────────────────────────
        if (sub === "auto" || sub === "autocontent" || sub === "automatico") {
            const autoCmd = require("../owner/auto");
            const newArgs = args.slice(1);
            return autoCmd.execute({ from, args: newArgs, reply, prefix, isGroup: true, client, sender });
        }

        // ── 6.1 SUBMÓDULO: RESPOSTA AUTÔNOMA POR NICHO (24H Engine) ───────
        if (sub === "autoresposta" || sub === "autoreply" || sub === "ia") {
            const autoRespCmd = require("./autoresposta");
            const newArgs = args.slice(1);
            return autoRespCmd.execute({ from, args: newArgs, reply, sender, prefix, client });
        }

        // ── 7. SUBMÓDULO: PRESET DE SEGURANÇA ──────────────────────────────
        if (sub === "preset" || sub === "presets") {
            const presetCmd = require("./seguranca/seg_regra_89");
            const newArgs = args.slice(1);
            return presetCmd.execute({ from, args: newArgs, reply, prefix, sender });
        }

        // ── 8. SUBMÓDULO: WALLPAPER & MÍDIA DE MENUS ───────────────────────
        if (sub === "wallpaper" || sub === "wallpapers" || sub === "midia" || sub === "video") {
            if (["imagem", "foto", "image"].includes(opt)) {
                setWallpaperMode("imagem");
                return reply(F.tela({ emoji: "🖼️", titulo: "Modo Imagem Ativado", intro: "Os menus serão enviados como imagem Full HD estática na legenda.", prefix }));
            }
            if (["video", "mp4", "animado"].includes(opt)) {
                setWallpaperMode("video");
                return reply(F.tela({ emoji: "🎬", titulo: "Modo Vídeo Ativado", intro: "Os menus serão enviados em vídeo animado 1080p.", prefix }));
            }
            if (["gif"].includes(opt)) {
                setWallpaperMode("gif");
                return reply(F.tela({ emoji: "✨", titulo: "Modo GIF Ativado", intro: "Os menus serão enviados com reprodução em loop contínuo.", prefix }));
            }

            const list = getAllMenuMediaStatus();
            let wpFields = list.slice(0, 8).map(m => `• *${m.label}:* ${m.status}`);
            return reply(F.tela({
                emoji: "🎨",
                titulo: "Configuração de Wallpapers",
                intro: "Personalize os papéis de parede e vídeos animados de todos os menus:",
                secoes: [
                    { emoji: "📊", titulo: "Estado das Mídias", linhas: wpFields },
                    { emoji: "⚙️", titulo: "Opções Rápidas", linhas: [
                        `• \`${prefix}config wallpaper imagem\` — Força fotos 1080p`,
                        `• \`${prefix}config wallpaper video\` — Vídeos animados MP4`,
                        `• \`${prefix}config wallpaper gif\` — Reprodução loop`,
                        `• \`${prefix}setwallpaper <categoria>\` — Altera a foto de um menu`
                    ]}
                ],
                prefix
            }));
        }

        // ── 9. SUBMÓDULOS DE SEGURANÇA & ESCUDOS (ANTI-*) ──────────────────
        if (sub === "antilink" || sub === "link" || sub === "links") {
            const antilinkCmd = require("./antilink");
            return antilinkCmd.execute({ from, args: args.slice(1), reply, sender, contextInfo: info?.message?.extendedTextMessage?.contextInfo || null });
        }
        if (sub === "antispam" || sub === "spam") {
            const antispamCmd = require("./antispam");
            return antispamCmd.execute({ from, args: args.slice(1), reply, sender });
        }
        if (sub === "antifake" || sub === "fake") {
            const antifakeCmd = require("./antifake");
            return antifakeCmd.execute({ from, args: args.slice(1), reply, sender, prefix });
        }
        if (sub === "antitrava" || sub === "trava" || sub === "travazap") {
            const antitravaCmd = require("./antitrava");
            return antitravaCmd.execute({ from, args: args.slice(1), reply, sender });
        }
        if (sub === "antidelete" || sub === "delete" || sub === "apagadas") {
            const antideleteCmd = require("./antidelete");
            return antideleteCmd.execute({ from, args: args.slice(1), reply, sender, prefix });
        }
        if (sub === "antistatus" || sub === "statusmention") {
            const antistatusCmd = require("./antistatus");
            return antistatusCmd.execute({ from, args: args.slice(1), reply, sender, prefix, isBotAdmin: true });
        }
        if (sub === "profanity" || sub === "antipalavrao" || sub === "palavrao" || sub === "palavroes") {
            const profanityCmd = require("./profanity");
            return profanityCmd.execute({ from, args: args.slice(1), reply, sender, prefix, isBotAdmin: true, contextInfo });
        }
        if (sub === "capslock" || sub === "anticapslock") {
            const capslockCmd = require("./capslock");
            return capslockCmd.execute({ from, args: args.slice(1), reply, sender });
        }
        if (sub === "flood" || sub === "antiflood") {
            const floodCmd = require("./flood");
            return floodCmd.execute({ from, args: args.slice(1), reply, sender });
        }
        if (sub === "slowmode" || sub === "modolento") {
            const slowmodeCmd = require("./slowmode");
            return slowmodeCmd.execute({ from, args: args.slice(1), reply, sender });
        }
        if (sub === "antiraid" || sub === "raid") {
            const antiraidCmd = require("./seguranca/seg_antiraid");
            return antiraidCmd.execute({ from, args: args.slice(1), reply, sender, prefix });
        }
        if (sub === "antiscam" || sub === "antigolpe" || sub === "antifraude" || sub === "scam") {
            const antiscamCmd = require("./antiscam");
            return antiscamCmd.execute({ from, args: args.slice(1), reply, sender, prefix });
        }
        if (sub === "moderacao" || sub === "seguranca" || sub === "escudos") {
            const modCmd = require("./moderacao");
            return modCmd.execute({ from, args: args.slice(1), reply, sender, prefix });
        }

        // ── 10. PAINEL CENTRAL COMPLETO (EXECUTIVO & ORGANIZADO NA RÉGUA) ───
        const isAbertura = Boolean(groupConfig.abertura || groupConfig.aberturaEnabled);
        const isFechamento = Boolean(groupConfig.fechamento || groupConfig.fechamentoEnabled);
        const isWelcome = Boolean(groupConfig.welcome || groupConfig.welcomeEnabled);
        const isLeave = Boolean(groupConfig.leave || groupConfig.leaveEnabled);
        const isAntilink = Boolean(groupConfig.antilink && groupConfig?.antilinkConfig?.enabled !== false);
        const isAntifake = Boolean(groupConfig.antifake);
        const isAntitrava = Boolean(groupConfig.antitrava);
        const isAntispam = Boolean(groupConfig.antispam || groupConfig.antiFlood);
        const isAntidelete = Boolean(groupConfig.antidelete);
        const isAntistatus = Boolean(groupConfig.antistatus);
        const isProfanity = Boolean(groupConfig.antiProfanity);
        const isCapslock = Boolean(groupConfig.antiCapslock);
        const isSlowmode = Boolean(groupConfig.slowmode);
        const isAntiraid = Boolean(groupConfig.antiraid || groupConfig.seg_antiraid);
        const isAntiscam = Boolean(groupConfig.antiscam);
        const currentPreset = groupConfig.activePreset || "Personalizado (Manual)";

        // Lê estado da agenda
        const groupScheduleService = require("../../services/groupScheduleService");
        const schedInfo = groupScheduleService.getSchedule ? groupScheduleService.getSchedule(from) : null;
        let agendaStatus = "⚪ Desligada";
        if (schedInfo && schedInfo.enabled) {
            agendaStatus = `🟢 Ativa (${schedInfo.closeTime || "22:00"} ➔ ${schedInfo.openTime || "07:00"})`;
        }

        // Lê estado do auto content
        const autoContentService = require("../../services/autoContentService");
        const autoCfg = autoContentService.getConfig ? autoContentService.getConfig(from) : null;
        let autoStatus = "⚪ Desligado";
        if (autoCfg && autoCfg.ativo) {
            autoStatus = `🟢 Ativo (${autoCfg.tema || "deduzido"} · a cada ${autoCfg.intervaloMin || 120}m)`;
        }

        const isFigEventos = Boolean(groupConfig.figurinhasEventos);
        const isFigBv = isFigEventos && Boolean(groupConfig.welcomeFigurinha || groupConfig.welcomeSticker);
        const isFigLeave = isFigEventos && Boolean(groupConfig.leaveFigurinha || groupConfig.leaveSticker);

        let doc = `╔══════════════════════════════════════╗\n`;
        doc += `║  ⚙️  CONFIGURAÇÕES DO GRUPO // ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤  ║\n`;
        doc += `╚══════════════════════════════════════╝\n`;
        doc += `       ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ SKYCODE PROTOCOL\n\n`;

        doc += `📬 *MENSAGENS AUTOMÁTICAS:*\n`;
        doc += `• 🔓 *Abertura:* ${isAbertura ? "🟢 Ativado" : "🔴 Desativado"} · ${groupConfig.aberturaMsg ? "Personalizada" : "Padrão"}\n`;
        doc += `  ↳ \`${prefix}config abertura <on|off|msg|preview>\`\n\n`;
        doc += `• 🔒 *Fechamento:* ${isFechamento ? "🟢 Ativado" : "🔴 Desativado"} · ${groupConfig.fechamentoMsg ? "Personalizada" : "Padrão"}\n`;
        doc += `  ↳ \`${prefix}config fechamento <on|off|msg|preview>\`\n\n`;
        doc += `• 👋 *Boas-Vindas:* ${isWelcome ? "🟢 Ativado" : "🔴 Desativado"} · Figurinha: ${isFigBv ? "🟢 On" : "🔴 Off"}\n`;
        doc += `  ↳ \`${prefix}config boasvindas <on|off|msg|figurinha|preview>\`\n\n`;
        doc += `• 🚪 *Despedida:* ${isLeave ? "🟢 Ativado" : "🔴 Desativado"} · Figurinha: ${isFigLeave ? "🟢 On" : "🔴 Off"}\n`;
        doc += `  ↳ \`${prefix}config despedida <on|off|msg|figurinha|preview>\`\n\n`;
        doc += `• 🎨 *Figurinhas de Evento:* ${isFigEventos ? "🟢 Ativadas" : "🔴 Desativadas"} (Diferenciadas dos Wallpapers)\n`;
        doc += `  ↳ \`${prefix}config figurinhas <on|off>\`\n\n`;

        const autonomousGroup = require("../../services/groupAutonomousAgentService");
        const isAutoReply = autonomousGroup.isAutoReplyEnabled(from);
        const groupNiche = autonomousGroup.resolveGroupNiche(from);

        doc += `🤖 *ROTINAS & AUTONOMIA 24H:*\n`;
        doc += `• 💬 *Auto-Resposta por Nicho:* ${isAutoReply ? `🟢 Ativa (${groupNiche.emoji} ${groupNiche.label})` : "🔴 Desativada"}\n`;
        doc += `  ↳ \`${prefix}config autoresposta <on|off|status>\`\n\n`;
        doc += `• ⚡ *Conteúdo Autônomo:* ${autoStatus}\n`;
        doc += `  ↳ \`${prefix}config auto <on|off|tempo|tema>\`\n\n`;
        doc += `• 📅 *Agenda Automática:* ${agendaStatus}\n`;
        doc += `  ↳ \`${prefix}config agenda <on|off|msgfechar|msgabrir|preview|set>\`\n\n`;

        doc += `🛡️ *SEGURANÇA & ESCUDOS:*\n`;
        doc += `• 🎯 *Preset Ativo:* ${currentPreset}\n`;
        doc += `• 🔗 *Anti-Link:* ${isAntilink ? "🟢 Ativo" : "🔴 Desligado"}\n`;
        doc += `• ⚡ *Anti-Spam:* ${isAntispam ? "🟢 Ativo" : "🔴 Desligado"}\n`;
        doc += `• 🌍 *Anti-Fake (+55):* ${isAntifake ? "🟢 Ativo" : "🔴 Desligado"}\n`;
        doc += `• 🛡️ *Anti-Trava:* ${isAntitrava ? "🟢 Ativo" : "🔴 Desligado"}\n`;
        doc += `• 🗑️ *Anti-Delete:* ${isAntidelete ? "🟢 Ativo" : "🔴 Desligado"}\n`;
        doc += `• 📢 *Anti-Status:* ${isAntistatus ? "🟢 Ativo" : "🔴 Desligado"}\n`;
        doc += `• 🤬 *Anti-Palavrão:* ${isProfanity ? "🟢 Ativo" : "🔴 Desligado"}\n`;
        doc += `• 🔠 *Anti-Capslock:* ${isCapslock ? "🟢 Ativo" : "🔴 Desligado"}\n`;
        doc += `• 🛑 *Anti-Raid:* ${isAntiraid ? "🟢 Ativo" : "🔴 Desligado"}\n`;
        doc += `• 🚷 *Anti-Golpe (Scam):* ${isAntiscam ? "🟢 Ativo" : "🔴 Desligado"}\n`;
        doc += `  ↳ \`${prefix}config <antilink|antispam|antifake|antitrava|antidelete|antiscam|antiraid|moderacao> <on|off>\`\n\n`;

        doc += `──────────────────────────────────────\n`;
        doc += `🧭 *COMANDOS PARA AJUDAR:*\n`;
        doc += `• \`${prefix}config figurinhas\` — Configurar figurinhas de entrada, saída e banimento\n`;
        doc += `• \`${prefix}menugrupo\` — Ver todos os comandos de grupo\n`;
        doc += `• \`${prefix}orientacao abertura\` — Manual passo a passo de abertura\n`;
        doc += `• \`${prefix}preset\` — Ver regras recomendadas por nicho\n`;
        doc += `• \`${prefix}menu\` — Menu geral de categorias`;

        if (process.env.NODE_ENV === "test" || !client || typeof client.sendMessage !== "function") {
            return reply(doc);
        }

        return await sendMenuMediaMessage(client, from, {
            category: "config",
            text: doc,
            mentions: [sender],
            quoted: info
        });
    }
};
