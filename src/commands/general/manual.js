/**
 * Comando .manual / .guia
 * Manual Oficial de Funcionalidades, Módulos, Progressão de XP, Parcerias e Aluguel
 * ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ // ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Prime (➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤)
 */

const { getBotName } = require('../../config/botConfig');
const dataService = require('../../services/dataService');
const F = require('../../utils/formato');

module.exports = {
    name: 'manual',
    aliases: [
        'guia', 'instrucoes', 'tutorial', 'comofunciona', 'manualmodulos',
        'cmd_manual', 'alt_manual', 'atalho_manual', 'abrev_manual'
    ],
    category: 'general',
    description: 'Manual completo e oficial de funcionamento de cada módulo, regras de anti-link, aluguel e XP',
    cooldownMs: 2000,
    execute: async ({ reply, args, prefix, from }) => {
        const p = prefix || '.';
        const botName = getBotName();
        const sub = (args[0] || '').toLowerCase().trim();

        // 1. Manual de Módulos & Hierarquia
        if (sub === 'modulos' || sub === 'modulo' || sub === '1') {
            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   📖 *MANUAL DOS 3 MÓDULOS* 📖   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;
            doc += `O bot opera com *3 Árvores Hierárquicas Independentes* (Pais e Filhos):\n\n`;

            doc += `1️⃣ 🔓 *MÓDULO LIBERADO (ÁRVORE PRINCIPAL) (\`${p}perfil liberado\` ou \`${p}modulo on liberado\`)*\n`;
            doc += `• *Hierarquia:* Pai de todo o ecossistema de entretenimento do bot.\n`;
            doc += `• *Em Cascata:* Ativa todos os comandos proibíveis (Cassino, Apostas, Jogos, Downloads de Mídia, RPG, Economia, IA e Diversão sem restrições).\n\n`;

            doc += `2️⃣ 📢 *MÓDULO DIVULGAÇÃO & MODERAÇÃO (\`${p}perfil divulgacao\` ou \`${p}modulo on divulgacao\`)*\n`;
            doc += `• *Hierarquia:* Pai da comunicação, afiliados e proteção grupal.\n`;
            doc += `• *Em Cascata:* Ao ativar o pai Divulgação, os módulos *Moderação e Mensagens de Grupo ligam juntos obrigatoriamente*, além do Anti-Link Universal (com ação de ban).\n`;
            doc += `• *Isolamento:* NUNCA ativa comandos da árvore SkyCode nem jogos/cassino.\n\n`;

            doc += `3️⃣ 🛰️ *MÓDULO SKYCODE (\`${p}perfil skycode\` ou \`${p}modulo on skycode\`)*\n`;
            doc += `• *Hierarquia:* Pai da engenharia de software e pesquisa.\n`;
            doc += `• *Em Cascata:* Ativa Dev Tools, Livros, Utilidades Técnicas, Escola, Ferramentas e Texto.\n`;
            doc += `• *Isolamento:* NUNCA ativa Divulgação, Moderação, Cassino nem RPG.\n\n`;

            doc += `🛡️ *REGRA DA HIERARQUIA:*\n`;
            doc += `• Ativar um "Pai" ativa todos os seus filhos e isola completamente os ramos vizinhos!\n\n`;
            doc += `💡 _Como ativar no grupo:_ \`${p}perfil <liberado|divulgacao|skycode>\` ou \`${p}modulo on <pai>\`\n`;
            doc += `👑 *${botName}*`;
            return reply(doc);
        }

        // 2. Manual de Anti-Link e Parcerias
        if (sub === 'antilink' || sub === 'parceria' || sub === 'links' || sub === '2') {
            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   🛡️ *MANUAL: ANTI-LINK & PARCERIAS*   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;

            doc += `⚡ *COMO FUNCIONA O ANTI-LINK:* \n`;
            doc += `• O filtro monitora links de *todas as redes sociais* (WhatsApp, Canais, Telegram, Instagram, TikTok, Kwai, Discord, YouTube, Facebook, Threads, etc.) e sites da web.\n`;
            doc += `• *Sem Parceria:* Se um membro comum enviar link sem autorização, a punição é imediata:\n`;
            doc += `  1º O bot *bane o usuário* do grupo na hora;\n`;
            doc += `  2º O bot *publica o motivo* do banimento no chat;\n`;
            doc += `  3º O bot *apaga a mensagem* com o link.\n\n`;

            doc += `🤝 *MODO PARCERIA (SEM COTAS / SEM LIMITES):* \n`;
            doc += `• Uma vez que o usuário é aprovado como parceiro com \`${p}parceria add @user\` ou \`${p}antilink allow @user\`, ele tem *permissão permanente*.\n`;
            doc += `• Não existe limite de links por dia e suas mensagens *nunca são apagadas*.\n`;
            doc += `• A permissão dura até ser revogada manualmente pela administração (\`${p}parceria del @user\`).\n`;
            doc += `• Administradores podem gerenciar parcerias tanto no grupo quanto no privado (DM)!\n\n`;
            doc += `👑 *${botName}*`;
            return reply(doc);
        }

        // 3. Manual de Aluguel e Dono Temporário
        if (sub === 'aluguel' || sub === 'donotemporario' || sub === 'pagamento' || sub === '3') {
            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   👑 *MANUAL: DONO TEMPORÁRIO*   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;

            doc += `👑 *O QUE É O DONO TEMPORÁRIO?*\n`;
            doc += `• Usuários que contratam o aluguel do bot tornam-se Donos Temporários com privilégios exclusivos:\n`;
            doc += `  - Acesso liberado ao Privado (DM) mesmo com o bot fechado;\n`;
            doc += `  - Comandos VIP e gerenciamento de grupos alugados;\n`;
            doc += `  - Imunidade a limites comuns.\n\n`;

            doc += `💳 *MENSAGEM DE RETORNO DE PAGAMENTO:*\n`;
            doc += `• Assim que o pagamento (Pix ou cartão) é confirmado, o comprador recebe na hora uma mensagem oficial de retorno contendo:\n`;
            doc += `  - Modalidade contratada (Privado, Grupo, Combo ou Subdono);\n`;
            doc += `  - Duração e data exata de vencimento;\n`;
            doc += `  - Confirmação de liberação imediata do serviço.\n\n`;

            doc += `💡 _Para consultar planos disponíveis:_ \`${p}aluguel planos\`\n`;
            doc += `💡 _Para falar com a liderança:_ \`${p}dono\`\n`;
            doc += `👑 *${botName}*`;
            return reply(doc);
        }

        // 4. Manual de XP e Level Up
        if (sub === 'xp' || sub === 'level' || sub === 'nivel' || sub === '4') {
            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   ✨ *MANUAL: XP & PROGRESSÃO* ✨   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;

            doc += `📈 *COMO EVOLUIR NO BOT:*\n`;
            doc += `• Cada mensagem enviada no grupo rende entre 5 e 10 XP passivo (com bônus extras para envio de mídias como fotos, áudios e vídeos).\n`;
            doc += `• Ao acumular XP suficiente, você sobe de nível automaticamente!\n\n`;

            doc += `🖼️ *CARTÃO REAL DE LEVEL UP:*\n`;
            doc += `• O cartão visual de subida de nível é gerado com:\n`;
            doc += `  - *Seu nome real do WhatsApp* (sem nicks bugados ou fontes corrompidas);\n`;
            doc += `  - *Sua foto de perfil real do WhatsApp* com moldura dourada;\n`;
            doc += `  - *O nome e tema do grupo* onde você está participando;\n`;
            doc += `  - Informações completas de Vida Máxima (+HP), moedas ganhas e nova patente de aventureiro.\n\n`;

            doc += `💡 _Para ver sua ficha atual:_ \`${p}perfil\` ou \`${p}slayer\`\n`;
            doc += `👑 *${botName}*`;
            return reply(doc);
        }

        // 5. Manual de Anti-Spam e Limite de Mensagens
        if (sub === 'antispam' || sub === 'limitemsg' || sub === 'flood' || sub === '5') {
            let doc = `╔══════════════════════════════╗\n`;
            doc += `║   ⚡ *MANUAL: LIMITE DE MENSAGENS*   ║\n`;
            doc += `╚══════════════════════════════╝\n\n`;

            doc += `💬 *REMOVER LIMITES DE MENSAGENS NO CHAT:*\n`;
            doc += `• Se o chat do grupo estiver apagando mensagens por velocidade ou atrapalhando a conversa entre membros, basta desativar o limite:\n\n`;
            doc += `👉 \`${p}antispam off\` ou \`${p}limitemsg off\`\n\n`;
            doc += `• Com este comando, o bot desativa qualquer bloqueio de mensagens consecutivas ou flood humano, permitindo conversa 100% livre e contínua.\n\n`;
            doc += `💡 _Apenas administradores podem ligar ou desligar._\n`;
            doc += `👑 *${botName}*`;
            return reply(doc);
        }

        // Guia Geral / Sumário
        let doc = `╔══════════════════════════════╗\n`;
        doc += `║     📖 *MANUAL DO SISTEMA* 👑     ║\n`;
        doc += `╚══════════════════════════════╝\n\n`;
        doc += `Selecione a seção do manual que deseja consultar:\n\n`;
        doc += `• \`${p}manual 1\` ou \`${p}manual modulos\` — Os 3 Módulos Principais (Liberado, Divulgação, Skycode)\n`;
        doc += `• \`${p}manual 2\` ou \`${p}manual antilink\` — Anti-Link Fluente e Parcerias Sem Limites\n`;
        doc += `• \`${p}manual 3\` ou \`${p}manual aluguel\` — Dono Temporário, Aluguel e Retorno de Pagamento\n`;
        doc += `• \`${p}manual 4\` ou \`${p}manual xp\` — Sistema de XP, Cartão Real e Subida de Nível\n`;
        doc += `• \`${p}manual 5\` ou \`${p}manual limitemsg\` — Como remover limites de mensagens e antispam\n\n`;
        doc += `👑 *➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Prime (Camisa 10)*`;

        return reply(doc);
    }
};
