/**
 * Comando Executivo de Orientação & Manual do Sistema // ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ (➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤)
 *
 * Guia definitivo de uso e comandos práticos para administradores e membros:
 * - Abertura e Fechamento de Grupos (por minutos, horas, horários fixos e imediato)
 * - Agenda Automática & Ciclos (permanente, semanal, mensal)
 * - Mensagens Personalizadas de Abertura e Fechamento
 * - Presets de Grupo (divulgação, vagas, vendas, estudos, resenha)
 * - Futebol & Esportes em Tempo Real (Brasileirão, Champions League, Copa Libertadores)
 * - Radar de Vagas Tech & Reputação Comercial
 */

const F = require('../../utils/formato')

module.exports = {
    name: 'orientacao',
    aliases: ['guia', 'manual', 'tutorial', 'orientacoes', 'instrucoes', 'ajudagrupo', 'ajudaabertura'],
    category: 'general',
    subcategory: 'Ajuda & Guia',
    description: 'Guia completo e orientação passo a passo de todos os recursos do bot',
    usage: '[abertura | fechar | agenda | preset | futebol | vagas | reputacao]',
    examples: [
        ' — painel central de orientação com todos os tópicos',
        'abertura — manual detalhado de como abrir, fechar e agendar horários',
        'agenda — como programar rotinas automáticas de abertura diária',
        'preset — como blindar seu grupo com 1 único comando',
        'futebol — guia das tabelas ao vivo e campeonatos'
    ],
    cooldownMs: 2000,
    execute: async ({ reply, args = [], prefix = '.' }) => {
        const sub = (args[0] || '').toLowerCase().trim()

        // 1. ORIENTAÇÃO DE ABERTURA E FECHAMENTO
        if (['abertura', 'abrir', 'fechar', 'fechamento', 'trancar', 'destrancar', 'horario'].includes(sub)) {
            let doc = `╔══════════════════════════════════════╗\n`
            doc += `║  🔓  GUIA DE ABERTURA & FECHAMENTO   ║\n`
            doc += `╚══════════════════════════════════════╝\n`
            doc += `       ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ SKYCODE PROTOCOL\n\n`

            doc += `O bot permite abrir e fechar grupos imediatamente ou com agendamento no tempo que você escolher.\n\n`

            doc += `🔒 *COMO FECHAR O GRUPO:*\n`
            doc += `• \`${prefix}fechar\` ➔ Fecha o grupo agora imediatamente.\n`
            doc += `• \`${prefix}fechar 10 minutos\` ➔ Fecha e reabre automaticamente em 10 minutos.\n`
            doc += `• \`${prefix}fechar 30m\` ou \`${prefix}fechar 30\` ➔ Fecha por 30 minutos.\n`
            doc += `• \`${prefix}fechar 2 horas\` ou \`${prefix}fechar 2h\` ➔ Fecha por 2 horas.\n`
            doc += `• \`${prefix}fechar 1h30m\` ➔ Duração composta (1 hora e meia).\n`
            doc += `• \`${prefix}fechar 22:00\` ou \`${prefix}fechar 22h\` ➔ Fecha até o horário fixado.\n\n`

            doc += `🔓 *COMO ABRIR O GRUPO:*\n`
            doc += `• \`${prefix}abrir\` ou \`${prefix}abertura\` ➔ Abre o grupo imediatamente agora.\n`
            doc += `• \`${prefix}abrir 10 minutos\` ➔ Programa a abertura para daqui a 10 minutos.\n`
            doc += `• \`${prefix}abrir 08:00\` ou \`${prefix}abrir 08h\` ➔ Programa para abrir às 08h da manhã.\n\n`

            doc += `📝 *MENSAGENS PERSONALIZADAS:*\n`
            doc += `• \`${prefix}msgabertura msg <texto>\` ➔ Mensagem personalizada ao abrir.\n`
            doc += `• \`${prefix}msgfechamento msg <texto>\` ➔ Mensagem personalizada ao fechar.\n`
            doc += `• \`${prefix}msgabertura -config\` ➔ Testa e visualiza o modelo atual.\n\n`

            doc += `──────────────────────────────────────\n`
            doc += `🧭 *COMANDOS PARA AJUDAR:*\n`
            doc += `• \`${prefix}fechar\` — Trancar o grupo imediatamente\n`
            doc += `• \`${prefix}abrir\` — Reabrir o grupo imediatamente\n`
            doc += `• \`${prefix}agenda\` — Programar horários automáticos diários\n`
            doc += `• \`${prefix}orientacao agenda\` — Manual da agenda automática`
            return reply(doc)
        }

        // 2. ORIENTAÇÃO DA AGENDA AUTOMÁTICA
        if (['agenda', 'agendamento', 'rotina', 'ciclo'].includes(sub)) {
            let doc = `╔══════════════════════════════════════╗\n`
            doc += `║  📅  GUIA DA AGENDA AUTOMÁTICA       ║\n`
            doc += `╚══════════════════════════════════════╝\n`
            doc += `       ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ SKYCODE PROTOCOL\n\n`

            doc += `A Agenda Automática abre e fecha o grupo todos os dias nos horários programados sem você precisar digitar nada.\n\n`

            doc += `⚙️ *CONFIGURANDO OS HORÁRIOS:*\n`
            doc += `• \`${prefix}agenda set 22:00 07:00\` ➔ Fecha às 22h e abre às 07h todo dia.\n`
            doc += `• \`${prefix}agenda set 22h 7h\` ➔ Formato simplificado.\n`
            doc += `• \`${prefix}agenda set seg-sex 23:00 08:00\` ➔ Apenas em dias úteis.\n\n`

            doc += `⏳ *CICLOS DE REPETIÇÃO:*\n`
            doc += `• \`${prefix}agenda ciclo permanente\` ➔ Funciona continuamente sem expirar.\n`
            doc += `• \`${prefix}agenda ciclo semana\` ➔ Fica ativa por 7 dias corridos.\n`
            doc += `• \`${prefix}agenda ciclo mes\` ➔ Fica ativa por 30 dias corridos.\n`
            doc += `• \`${prefix}agenda ciclo ate 31/12/2026\` ➔ Válida até uma data limite.\n\n`

            doc += `🕹️ *CONTROLES RÁPIDOS:*\n`
            doc += `• \`${prefix}agenda\` ➔ Visualiza o status e os horários configurados.\n`
            doc += `• \`${prefix}agenda on\` ➔ Ativa a agenda no grupo.\n`
            doc += `• \`${prefix}agenda off\` ➔ Pausa a agenda.\n`
            doc += `• \`${prefix}agenda remover\` ➔ Limpa a agenda do grupo.\n\n`

            doc += `📝 *MENSAGENS PERSONALIZADAS DA AGENDA:*\n`
            doc += `• \`${prefix}config agenda msgfechar <texto>\` ➔ Personaliza notificação ao fechar.\n`
            doc += `• \`${prefix}config agenda msgabrir <texto>\` ➔ Personaliza notificação ao abrir.\n`
            doc += `• \`${prefix}config agenda preview\` ➔ Simula a prévia de ambas as mensagens.\n`
            doc += `• \`${prefix}config agenda reset\` ➔ Restaura as mensagens para o padrão oficial.\n\n`

            doc += `──────────────────────────────────────\n`
            doc += `🧭 *COMANDOS PARA AJUDAR:*\n`
            doc += `• \`${prefix}agenda\` — Ver status da agenda\n`
            doc += `• \`${prefix}abrir\` — Abrir o grupo\n`
            doc += `• \`${prefix}fechar\` — Fechar o grupo\n`
            doc += `• \`${prefix}orientacao abertura\` — Manual de abertura e fechamento`
            return reply(doc)
        }

        // 3. ORIENTAÇÃO DE PRESETS DE GRUPO
        if (['preset', 'presets', 'seguranca', 'moderacao'].includes(sub)) {
            let doc = `╔══════════════════════════════════════╗\n`
            doc += `║  🛡️  GUIA DE PRESETS DE GRUPO        ║\n`
            doc += `╚══════════════════════════════════════╝\n`
            doc += `       ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ SKYCODE PROTOCOL\n\n`

            doc += `Configure todas as regras de segurança e moderação do grupo em 1 único comando:\n\n`

            doc += `• \`${prefix}preset divulgacao\`\n`
            doc += `  Antilink total (todas as redes), antitrava, antiflood, modo divulgação ativo com envio no PV dos administradores.\n\n`

            doc += `• \`${prefix}preset vagas\`\n`
            doc += `  Permite links profissionais (LinkedIn, Gupy, GitHub, Greenhouse) e bloqueia convites de grupos rivais e spam.\n\n`

            doc += `• \`${prefix}preset vendas\`\n`
            doc += `  Escudo anti-golpe ativo (Zero-Day), bloqueio de DDIs falsos estrangeiros, antitrava e sistema de reputação comercial.\n\n`

            doc += `• \`${prefix}preset estudos\`\n`
            doc += `  Foco didático: livros e PDFs liberados (\`${prefix}livro\`), YouTube liberado e cartões de level-up silenciados.\n\n`

            doc += `• \`${prefix}preset resenha\`\n`
            doc += `  Chat livre para conversas, economia, cassino, RPG e cartões comemorativos de level-up ativados.\n\n`

            doc += `──────────────────────────────────────\n`
            doc += `🧭 *COMANDOS PARA AJUDAR:*\n`
            doc += `• \`${prefix}preset\` — Ver preset ativo no grupo\n`
            doc += `• \`${prefix}moderacao\` — Painel completo de escudos\n`
            doc += `• \`${prefix}agenda\` — Programar horários de funcionamento\n`
            doc += `• \`${prefix}regras\` — Exibir regulamento do grupo`
            return reply(doc)
        }

        // 4. ORIENTAÇÃO DE FUTEBOL & ESPORTES
        if (['futebol', 'jogos', 'campeonatos', 'tabela', 'goat'].includes(sub)) {
            let doc = `╔══════════════════════════════════════╗\n`
            doc += `║  ⚽  GUIA DE FUTEBOL & CAMPEONATOS   ║\n`
            doc += `╚══════════════════════════════════════╝\n`
            doc += `       ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ CLUBE DOS CAMPEÕES\n\n`

            doc += `Tabelas inteiras e independentes em tempo real com regras específicas por competição:\n\n`
            doc += `🇧🇷 *BRASILEIRÃO:*\n`
            doc += `• \`${prefix}brasileirao\` ➔ Tabela completa da Série A (20 clubes, G4 Libertadores, Pré-Libertadores, Sul-Americana e Z4).\n`
            doc += `• \`${prefix}serieb\` ➔ Tabela completa da Série B (20 clubes, G4 Acesso e Z4).\n\n`

            doc += `🏆 *TORNEIOS INTERNACIONAIS:*\n`
            doc += `• \`${prefix}champions\` ➔ UEFA Champions League (Fase de Liga de 36 clubes, 1º-8º Oitavas Diretas, 9º-24º Playoffs 16-avos, 25º-36º Eliminados).\n`
            doc += `• \`${prefix}libertadores\` ➔ Copa Libertadores (todos os 8 grupos de A a H, com 1º e 2º nas Oitavas, 3º na Sul-Americana e 4º Eliminado).\n`
            doc += `• \`${prefix}libertadores <grupo>\` ➔ Visualiza apenas o grupo solicitado (ex: \`${prefix}libertadores a\`).\n\n`

            doc += `🏴󠁧󠁢󠁥󠁮󠁧󠁿 *LIGAS NACIONAIS & JOGOS:*\n`
            doc += `• \`${prefix}premier\` ➔ Tabela completa da Premier League Inglesa.\n`
            doc += `• \`${prefix}laliga\` ➔ Tabela completa de La Liga Espanhola.\n`
            doc += `• \`${prefix}jogos\` ➔ Partidas do dia e placar ao vivo.\n`
            doc += `• \`${prefix}jogos <liga>\` ➔ Jogos de hoje por liga (ex: \`${prefix}jogos champions\`).\n\n`

            doc += `──────────────────────────────────────\n`
            doc += `🧭 *COMANDOS PARA AJUDAR:*\n`
            doc += `• \`${prefix}brasileirao\` — Ver tabela do Brasileirão Série A\n`
            doc += `• \`${prefix}champions\` — Ver tabela da UEFA Champions League\n`
            doc += `• \`${prefix}libertadores\` — Ver grupos da Copa Libertadores\n`
            doc += `• \`${prefix}jogos\` — Partidas de hoje e placar ao vivo`
            return reply(doc)
        }

        // 5. ORIENTAÇÃO DE VAGAS & CARREIRA
        if (['vagas', 'vaga', 'emprego', 'trampo'].includes(sub)) {
            let doc = `╔══════════════════════════════════════╗\n`
            doc += `║  💼  GUIA DE VAGAS TECH // SKYCODE   ║\n`
            doc += `╚══════════════════════════════════════╝\n`
            doc += `       ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ SKYCODE PROTOCOL\n\n`

            doc += `Radar de vagas reais apuradas diretamente dos maiores repositórios abertos do Brasil:\n\n`
            doc += `• \`${prefix}vagas\` ➔ Lista as vagas mais recentes de todas as áreas.\n`
            doc += `• \`${prefix}vagas backend\` ➔ Oportunidades em Node, Python, Java, Go, PHP.\n`
            doc += `• \`${prefix}vagas frontend\` ➔ Vagas em React, Vue, Angular, TypeScript.\n`
            doc += `• \`${prefix}vagas remoto\` ➔ Apenas vagas 100% Home Office.\n`
            doc += `• \`${prefix}vagas clt\` ou \`${prefix}vagas pj\` ➔ Filtro por modelo de contratação.\n\n`

            doc += `──────────────────────────────────────\n`
            doc += `🧭 *COMANDOS PARA AJUDAR:*\n`
            doc += `• \`${prefix}vagas\` — Ver vagas tech mais recentes\n`
            doc += `• \`${prefix}vagas remoto\` — Filtrar vagas 100% Home Office\n`
            doc += `• \`${prefix}noticias\` — Notícias de mercado e tecnologia\n`
            doc += `• \`${prefix}orientacao preset\` — Configurar o preset de vagas no grupo`
            return reply(doc)
        }

        // 6. ORIENTAÇÃO DE REPUTAÇÃO COMERCIAL & ANTI-GOLPE
        if (['reputacao', 'vendas', 'compras', 'comercio'].includes(sub)) {
            let doc = `╔══════════════════════════════════════╗\n`
            doc += `║  ⭐  GUIA DE REPUTAÇÃO COMERCIAL     ║\n`
            doc += `╚══════════════════════════════════════╝\n`
            doc += `       ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ SKYCODE PROTOCOL\n\n`

            doc += `Sistema comunitário de confiança para compra e venda segura:\n\n`
            doc += `• \`${prefix}reputacao\` ➔ Consulta seu próprio score e medalha comercial.\n`
            doc += `• \`${prefix}reputacao @usuario\` ➔ Consulta a reputação e histórico de outro membro.\n`
            doc += `• \`${prefix}reputacao positivo @usuario <motivo>\` ➔ Registra avaliação positiva (+1 REP).\n`
            doc += `• \`${prefix}reputacao alertar @usuario <motivo>\` ➔ Emite alerta contra fraude/golpe (-2 REP).\n\n`
            doc += `🏅 *Medalhas de Confiança:* 💎 Comerciante Lendário, 🥇 Vendedor Verificado, 🚨 Risco de Golpe.\n\n`

            doc += `──────────────────────────────────────\n`
            doc += `🧭 *COMANDOS PARA AJUDAR:*\n`
            doc += `• \`${prefix}reputacao\` — Ver seu score de reputação\n`
            doc += `• \`${prefix}saldo\` — Consultar moedas e extrato\n`
            doc += `• \`${prefix}preset vendas\` — Ativar segurança anti-golpe no grupo\n`
            doc += `• \`${prefix}orientacao preset\` — Manual de presets de segurança`
            return reply(doc)
        }

        // MENU CENTRAL DE ORIENTAÇÃO
        let doc = `╔══════════════════════════════════════╗\n`
        doc += `║  🧭  CENTRAL DE ORIENTAÇÃO // ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤  ║\n`
        doc += `╚══════════════════════════════════════╝\n`
        doc += `       ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ OFFICIAL SYSTEM\n\n`

        doc += `Olá! Escolha um dos tópicos abaixo para ver o manual completo passo a passo:\n\n`

        doc += `🔓 *1. Abertura & Fechamento de Grupos*\n`
        doc += `• Digite: \`${prefix}orientacao abertura\`\n`
        doc += `  Aprenda a fechar por minutos, horas ou reabrir no horário exato.\n\n`

        doc += `📅 *2. Agenda Automática Diária*\n`
        doc += `• Digite: \`${prefix}orientacao agenda\`\n`
        doc += `  Programe horários de abrir de manhã e fechar à noite todo dia.\n\n`

        doc += `🛡️ *3. Presets & Blindagem de Grupo*\n`
        doc += `• Digite: \`${prefix}orientacao preset\`\n`
        doc += `  Configure antilink, antitrava e moderação com 1 comando.\n\n`

        doc += `⚽ *4. Futebol & Campeonatos ao Vivo*\n`
        doc += `• Digite: \`${prefix}orientacao futebol\`\n`
        doc += `  Tabelas inteiras (Brasileirão, Champions, Libertadores) e jogos de hoje.\n\n`

        doc += `💼 *5. Radar de Vagas Tech*\n`
        doc += `• Digite: \`${prefix}orientacao vagas\`\n`
        doc += `  Busca de vagas para desenvolvedores em tempo real.\n\n`

        doc += `⭐ *6. Reputação Comercial & Anti-Golpe*\n`
        doc += `• Digite: \`${prefix}orientacao reputacao\`\n`
        doc += `  Negociações seguras e verificação de confiança de vendedores.\n\n`

        doc += `──────────────────────────────────────\n`
        doc += `🧭 *COMANDOS PARA AJUDAR:*\n`
        doc += `• \`${prefix}orientacao abertura\` — Guia de abrir e fechar grupo\n`
        doc += `• \`${prefix}orientacao agenda\` — Guia da agenda diária\n`
        doc += `• \`${prefix}orientacao preset\` — Guia de blindagem e presets\n`
        doc += `• \`${prefix}orientacao futebol\` — Guia de futebol do ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤\n`
        doc += `• \`${prefix}menu\` — Painel geral de categorias`
        return reply(doc)
    }
}
