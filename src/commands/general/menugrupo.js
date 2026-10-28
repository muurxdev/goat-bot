/**
 * Menu Oficial de Comandos de Grupo // GOATBOT (GOAT)
 * Mapeia 100% dos comandos de gestão, segurança, mensagens automáticas e moderação de grupos
 */

const { sendMenuMediaMessage } = require("../../utils/wallpapers");

module.exports = {
    name: "menugrupo",
    aliases: [
        "grupomenu", "comandosgrupo", "comandosdegrupo", "menuadmin", "menugrupos", "painelgrupo"
    ],
    category: "general",
    subcategory: "Moderação de Grupos",
    description: "Menu completo e visual com todos os comandos de gestão, segurança e mensagens automáticas de grupo",
    cooldownMs: 2000,
    execute: async ({ reply, client, from, info, prefix = "." }) => {
        let doc = `╔══════════════════════════════════════╗\n`;
        doc += `║  👥  COMANDOS DE GRUPO // GOAT 10   ║\n`;
        doc += `╚══════════════════════════════════════╝\n`;
        doc += `       GOAT CLUBE DOS CAMPEÕES\n\n`;

        doc += `🔓 *ABERTURA & FECHAMENTO:*\n`;
        doc += `• \`${prefix}abrir [tempo]\` — Abre o grupo imediatamente ou por minutos/horas\n`;
        doc += `• \`${prefix}fechar [tempo]\` — Tranca o grupo imediatamente ou programa reabertura\n`;
        doc += `• \`${prefix}agenda [set|on|off]\` — Rotina diária automática de horários\n\n`;

        doc += `⚙️ *CONFIGURAÇÕES & MENSAGENS:*\n`;
        doc += `• \`${prefix}config\` — Painel central de configurações do grupo\n`;
        doc += `• \`${prefix}config agenda [on|off|msgfechar|msgabrir|preview]\` — Agenda e mensagens automáticas\n`;
        doc += `• \`${prefix}config abertura [on|off|msg]\` — Mensagem automática ao abrir\n`;
        doc += `• \`${prefix}config fechamento [on|off|msg]\` — Mensagem automática ao fechar\n`;
        doc += `• \`${prefix}config boasvindas [on|off|msg|figurinha]\` — Mensagem e figurinha para novos membros\n`;
        doc += `• \`${prefix}config despedida [on|off|msg|figurinha]\` — Mensagem e figurinha de saída de membros\n`;
        doc += `• \`${prefix}config figurinhas [on|off]\` — Figurinhas de eventos (diferenciadas dos wallpapers)\n\n`;

        doc += `🛡️ *SEGURANÇA & PRESETS:*\n`;
        doc += `• \`${prefix}preset <perfil>\` — Aplica perfil pronto (vagas, vendas, estudos...)\n`;
        doc += `• \`${prefix}antilink [on|off]\` — Bloqueio automático de links externos e grupos\n`;
        doc += `• \`${prefix}antifake [on|off]\` — Bloqueio de números virtuais estrangeiros (DDI)\n`;
        doc += `• \`${prefix}antitrava [on|off]\` — Blindagem ativa contra travas de zap\n`;
        doc += `• \`${prefix}antispam [on|off]\` — Bloqueio contra flood e spam de mensagens\n`;
        doc += `• \`${prefix}moderacao\` — Painel com o status de todos os escudos\n\n`;

        doc += `👥 *MODERAÇÃO DE MEMBROS:*\n`;
        doc += `• \`${prefix}ban @user\` — Bane um participante do grupo\n`;
        doc += `• \`${prefix}kick @user\` — Remove um participante\n`;
        doc += `• \`${prefix}mute @user\` — Silencia mensagens de um membro\n`;
        doc += `• \`${prefix}unmute @user\` — Remove silenciamento\n`;
        doc += `• \`${prefix}warn @user\` — Aplica advertência\n`;
        doc += `• \`${prefix}promover @user\` — Promove a administrador\n`;
        doc += `• \`${prefix}rebaixar @user\` — Remove cargo de admin\n`;
        doc += `• \`${prefix}inativos\` — Lista membros inativos do grupo\n`;
        doc += `• \`${prefix}limparmensagens <qtd>\` — Apaga mensagens recentes\n\n`;

        doc += `📣 *COMUNICAÇÃO & ENGAJAMENTO:*\n`;
        doc += `• \`${prefix}tagall <texto>\` — Menciona todos os membros\n`;
        doc += `• \`${prefix}hidetag <texto>\` — Notificação invisível para todos\n`;
        doc += `• \`${prefix}avisogrupo <texto>\` — Emite anúncio oficial destacado\n`;
        doc += `• \`${prefix}enquete <tema|op1|op2>\` — Cria votação interativa\n`;
        doc += `• \`${prefix}sorteio\` — Sorteia um participante ativo\n\n`;

        doc += `🤖 *AUTONOMIA SKYCODE 24H:*\n`;
        doc += `• \`${prefix}autoresposta [on|off|status]\` — Resposta contextual por nicho 24h\n`;
        doc += `• \`${prefix}auto [on|off|tempo|tema]\` — Envio automático periódico de conteúdo\n`;
        doc += `• \`${prefix}skycode [auto on|off]\` — Autonomia em lote para toda a rede\n\n`;

        doc += `──────────────────────────────────────\n`;
        doc += `🧭 *COMANDOS PARA AJUDAR:*\n`;
        doc += `• \`${prefix}config\` — Painel geral de configurações do grupo\n`;
        doc += `• \`${prefix}preset\` — Perfis temáticos de segurança\n`;
        doc += `• \`${prefix}orientacao abertura\` — Manual de abertura e fechamento\n`;
        doc += `• \`${prefix}menu\` — Menu geral de categorias`;

        if (process.env.NODE_ENV === "test" || !client || typeof client.sendMessage !== "function") {
            return reply(doc);
        }

        return await sendMenuMediaMessage(client, from, {
            category: "mensagens-grupo",
            text: doc,
            quoted: info
        });
    }
};
