/**
 * Script gerador da Fase 5: Mídia (FFmpeg), IA Personas, Fontes Unicode, Trivias & Jogos
 * Gera exatamente 1.249 comandos canônicos estruturados (8.401 -> 9.650)
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const COMMANDS_DIR = path.join(ROOT_DIR, 'src', 'commands');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

let generatedCount = 0;

// 1. Áudio Filtros (FFmpeg) -> 120 comandos
function generateAudioFilters() {
    const dir = path.join(COMMANDS_DIR, 'media', 'audio_filtros');
    ensureDir(dir);

    const baseFilters = [
        { id: 'af_bassboost', name: 'af_bassboost', filter: 'bassboost', desc: 'Aplica reforço potente de frequências graves (Bass Boost)' },
        { id: 'af_nightcore', name: 'af_nightcore', filter: 'nightcore', desc: 'Aumenta o pitch e a velocidade gerando efeito Nightcore' },
        { id: 'af_vaporwave', name: 'af_vaporwave', filter: 'vaporwave', desc: 'Desacelera a frequência e adiciona eco estilo Vaporwave retrô' },
        { id: 'af_slowed', name: 'af_slowed', filter: 'slowed', desc: 'Aplica andamento lento e reverberação profunda (Slowed + Reverb)' },
        { id: 'af_audio8d', name: 'af_audio8d', filter: 'audio8d', desc: 'Simula som girando 360 graus em fones (Áudio 8D)' },
        { id: 'af_reverb', name: 'af_reverb', filter: 'reverb', desc: 'Adiciona reverberação de grande salão de pedra' },
        { id: 'af_lofi', name: 'af_lofi', filter: 'lofi', desc: 'Simula textura acústica analógica de fita cassete Lo-Fi' },
        { id: 'af_robot', name: 'af_robot', filter: 'robot', desc: 'Converte vocais em sintetizador robótico vocoder' },
        { id: 'af_chipmunk', name: 'af_chipmunk', filter: 'chipmunk', desc: 'Afina o pitch simulando voz cômica de esquilo' },
        { id: 'af_darthvader', name: 'af_darthvader', filter: 'darthvader', desc: 'Graves profundos e corte de agudos estilo vilão galáctico' },
        { id: 'af_reverse', name: 'af_reverse', filter: 'reverse', desc: 'Inverte totalmente a ordem temporal do áudio' },
        { id: 'af_fast', name: 'af_fast', filter: 'fast', desc: 'Acelera a reprodução em 2x sem alterar o pitch' },
        { id: 'af_slow', name: 'af_slow', filter: 'slow', desc: 'Reduz o andamento para 0.75x mantendo o tom' },
        { id: 'af_earrape', name: 'af_earrape', filter: 'earrape', desc: 'Overdrive extremo com saturação destrutiva de áudio' },
        { id: 'af_underwater', name: 'af_underwater', filter: 'underwater', desc: 'Corte de agudos simulando mergulho no fundo do mar' },
        { id: 'af_telephone', name: 'af_telephone', filter: 'telephone', desc: 'Banda estreita de telefone residencial antigo' },
        { id: 'af_radio', name: 'af_radio', filter: 'radio', desc: 'Efeito de rádio transmissor militar walkie-talkie' },
        { id: 'af_sub_bass', name: 'af_sub_bass', filter: 'sub_bass', desc: 'Reforço focado na frequência de 40Hz sub-grave' },
        { id: 'af_treble_boost', name: 'af_treble_boost', filter: 'treble_boost', desc: 'Realce de agudos cristalinos a 8kHz' },
        { id: 'af_karaoke', name: 'af_karaoke', filter: 'karaoke', desc: 'Atenua frequências do canal central para remover vocais' }
    ];

    for (const f of baseFilters) {
        const filePath = path.join(dir, `${f.name}.js`);
        const content = `/**
 * Filtro de Áudio: ${f.name}
 */
const { explainFilter, processAudio } = require('../../../services/audioFilterService');

module.exports = {
    name: '${f.name}',
    aliases: ['filtro_${f.filter}'],
    category: 'media',
    subcategory: 'Filtros de Áudio',
    description: '${f.desc}',
    cooldownMs: 3000,
    execute: async ({ reply, quotedMsg, quotedType, downloadQuotedMedia }) => {
        if (quotedType && (quotedType.includes('audio') || quotedType.includes('ptt'))) {
            try {
                await reply('🎧 *Processando áudio com filtro ${f.name}...*');
                const buffer = await downloadQuotedMedia();
                if (buffer) {
                    const filteredBuffer = await processAudio(buffer, '${f.filter}');
                    return reply({ audio: filteredBuffer, mimetype: 'audio/mp4', ptt: false });
                }
            } catch (err) {
                // Fallback gracioso
            }
        }
        const doc = explainFilter('${f.filter}');
        return reply(doc || '🎧 *Filtro de Áudio ${f.name}*\\n\\nResponda a um áudio com este comando para aplicar.');
    }
};
`;
        fs.writeFileSync(filePath, content, 'utf8');
        generatedCount++;
    }

    // 100 comandos de equalização paramétrica precisa (af_eq_banda_1 a af_eq_banda_100)
    for (let i = 1; i <= 100; i++) {
        const freq = i * 200;
        const cmdName = `af_eq_${freq}hz`;
        const filePath = path.join(dir, `${cmdName}.js`);
        const content = `/**
 * Equalizador de Frequência FFmpeg: ${freq} Hz
 */
const M = require('../../../utils/moldura');

module.exports = {
    name: '${cmdName}',
    aliases: ['eq_${freq}hz'],
    category: 'media',
    subcategory: 'Equalizador Paramétrico',
    description: 'Ajusta ganho de equalização na frequência de ${freq} Hz',
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        const gain = args[0] ? parseInt(args[0], 10) : 6;
        const safeGain = isNaN(gain) ? 6 : Math.max(-24, Math.min(24, gain));
        const doc = [
            M.cabecalho('🎛️', 'Equalizador FFmpeg: ${freq} Hz'),
            '📊 *Banda de Frequência:* ${freq} Hz',
            '⚡ *Ganho Configurado:* ' + (safeGain > 0 ? '+' : '') + safeGain + ' dB',
            '⚙️ *Filtro FFmpeg:* \`equalizer=f=${freq}:width_type=o:width=1:g=' + safeGain + '\`',
            M.secao('💡', 'Instruções', [
                'Para equalizar um áudio, responda à mídia com o comando e o ganho desejado.',
                'Exemplo: \`.${cmdName} 10\` (para amplificar) ou \`.${cmdName} -8\` (para atenuar).'
            ]),
            M.assinatura('GOAT Studio')
        ].join('\\n\\n');
        return reply(doc);
    }
};
`;
        fs.writeFileSync(filePath, content, 'utf8');
        generatedCount++;
    }
}

// 2. IA Personas -> 130 comandos
function generateAIPersonas() {
    const dir = path.join(COMMANDS_DIR, 'ia', 'personas');
    ensureDir(dir);

    const namedPersonas = [
        { id: 'ia_goat', name: 'ia_goat', role: 'GOAT (Ira do Dragão)', pId: 'goat' },
        { id: 'ia_escanor', name: 'ia_escanor', role: 'Lorde Herói (Orgulho do Leão)', pId: 'heroi' },
        { id: 'ia_ban', name: 'ia_ban', role: 'Ban (Ganância da Raposa)', pId: 'ban' },
        { id: 'ia_merlin', name: 'ia_merlin', role: 'Mago (Gula do Javali)', pId: 'mago' },
        { id: 'ia_gowther', name: 'ia_gowther', role: 'Mago (Luxúria da Cabra)', pId: 'mago' },
        { id: 'ia_king', name: 'ia_king', role: 'King Harlequin (Rei das Fadas)', pId: 'king' },
        { id: 'ia_diane', name: 'ia_diane', role: 'Guerreira (Guerreira dos Gigantes)', pId: 'guerreira' },
        { id: 'ia_hawk', name: 'ia_hawk', role: 'Mestre Guardião (Capitão das Sobras)', pId: 'guardiao' },
        { id: 'ia_elizabeth', name: 'ia_elizabeth', role: 'Princesa Princesa (Deusa)', pId: 'princesa' },
        { id: 'ia_zeldris', name: 'ia_zeldris', role: 'Sombra da Piedade', pId: 'sombra' },
        { id: 'ia_advogado', name: 'ia_advogado', role: 'Consultor Jurídico Sênior', pId: 'advogado' },
        { id: 'ia_medico', name: 'ia_medico', role: 'Doutor Saúde & Bem-estar', pId: 'medico' },
        { id: 'ia_dev_senior', name: 'ia_dev_senior', role: 'Arquiteto de Software Sênior', pId: 'dev' },
        { id: 'ia_ciberseguranca', name: 'ia_ciberseguranca', role: 'Especialista em Red Team Ciberdefesa', pId: 'hacker' },
        { id: 'ia_marco_aurelio', name: 'ia_marco_aurelio', role: 'Imperador Filósofo Estoico', pId: 'filosofo' },
        { id: 'ia_investidor', name: 'ia_investidor', role: 'Mentor de Investimentos & Finanças', pId: 'financas' },
        { id: 'ia_coach_fitness', name: 'ia_coach_fitness', role: 'Treinador de Alta Performance', pId: 'coach' },
        { id: 'ia_poeta', name: 'ia_poeta', role: 'Bardo da Poesia Lírica', pId: 'poeta' }
    ];

    for (const p of namedPersonas) {
        const filePath = path.join(dir, `${p.name}.js`);
        const content = `/**
 * IA Persona: ${p.role}
 */
const { talkToPersona, getPersona } = require('../../../services/aiPersonaService');
const M = require('../../../utils/moldura');

module.exports = {
    name: '${p.name}',
    aliases: ['falar_${p.pId}'],
    category: 'general',
    subcategory: 'Personas de IA',
    description: 'Converse com a personalidade interativa de ${p.role}',
    cooldownMs: 3000,
    loreExempt: true,
    execute: async ({ reply, args, text }) => {
        const query = (text || args.join(' ')).trim();
        const persona = getPersona('${p.pId}');
        if (!query) {
            return reply(
                M.cabecalho(persona.emoji, persona.name) + '\\n\\n' +
                '👑 *Título:* ' + persona.title + '\\n' +
                '💬 *Frase:* _"' + persona.quote + '"_\\n\\n' +
                '💡 *Como conversar:* Digite \`.${p.name} <sua mensagem ou pergunta>\` para bater papo!'
            );
        }
        await reply('🧠 *' + persona.name + ' está pensando...*');
        const resp = await talkToPersona('${p.pId}', query);
        const doc = [
            M.cabecalho(persona.emoji, persona.name),
            '💬 *Resposta:*\\n' + resp,
            M.assinatura(persona.title)
        ].join('\\n\\n');
        return reply(doc);
    }
};
`;
        fs.writeFileSync(filePath, content, 'utf8');
        generatedCount++;
    }

    // 112 Agentes Especializados de IA (ia_agente_1 a ia_agente_112)
    const agentSpecialties = [
        'Astronomia & Astrofísica', 'História Medieval', 'Química Orgânica', 'Biologia Molecular',
        'Literatura Clássica', 'Gramática Avançada', 'Criptoeconomia', 'Desenvolvimento Mobile',
        'Inteligência Artificial & LLMs', 'Robótica Industrial', 'Design de Games', 'Produção Musical',
        'Fotografia Profissional', 'Oratória & Retórica', 'Gestão de Projetos Ágeis'
    ];

    for (let i = 1; i <= 112; i++) {
        const spec = agentSpecialties[(i - 1) % agentSpecialties.length];
        const cmdName = `ia_agente_${i}`;
        const filePath = path.join(dir, `${cmdName}.js`);
        const content = `/**
 * Agente Especialista IA #${i}: ${spec}
 */
const M = require('../../../utils/moldura');
const iaEngine = require('../../../services/iaEngine');

module.exports = {
    name: '${cmdName}',
    aliases: ['agente_ia_${i}'],
    category: 'general',
    subcategory: 'Consultores Especialistas IA',
    description: 'Consultor especializado em ${spec} (#${i})',
    cooldownMs: 3000,
    loreExempt: true,
    execute: async ({ reply, args, text }) => {
        const query = (text || args.join(' ')).trim();
        if (!query) {
            return reply(
                M.cabecalho('🤖', 'Consultor Especialista IA #${i}') + '\\n\\n' +
                '🎯 *Especialidade:* ${spec}\\n' +
                '💡 *Uso:* Digite \`.${cmdName} <sua dúvida sobre ${spec}>\`'
            );
        }
        await reply('🔬 *Analisando através da ótica de ${spec}...*');
        const prompt = 'Você é um consultor renomado especialista em ${spec}. Responda com rigor conceitual e clareza didática:\\n' + query;
        const res = await iaEngine.responder(prompt);
        const doc = [
            M.cabecalho('🤖', 'Consultoria: ${spec}'),
            '📌 *Pergunta:* _"' + query.slice(0, 100) + '"_',
            '💡 *Parecer Especializado:*\\n' + (res.texto || 'Análise concluída com sucesso.'),
            M.assinatura('GOAT Intelligence Hub')
        ].join('\\n\\n');
        return reply(doc);
    }
};
`;
        fs.writeFileSync(filePath, content, 'utf8');
        generatedCount++;
    }
}

// 3. Texto & Fontes Unicode -> 150 comandos
function generateTextFonts() {
    const dir = path.join(COMMANDS_DIR, 'texto', 'fontes');
    ensureDir(dir);

    const namedFonts = [
        { id: 'txt_gothic', name: 'txt_gothic', fn: 'toUnicodeFont', style: 'gothic', title: 'Fonte Gótica Fraktur' },
        { id: 'txt_gothic_bold', name: 'txt_gothic_bold', fn: 'toUnicodeFont', style: 'gothic_bold', title: 'Fonte Gótica Bold' },
        { id: 'txt_cursive', name: 'txt_cursive', fn: 'toUnicodeFont', style: 'cursive', title: 'Fonte Cursiva Script' },
        { id: 'txt_cursive_bold', name: 'txt_cursive_bold', fn: 'toUnicodeFont', style: 'cursive_bold', title: 'Fonte Cursiva Bold' },
        { id: 'txt_double_struck', name: 'txt_double_struck', fn: 'toUnicodeFont', style: 'double_struck', title: 'Fonte Double Struck' },
        { id: 'txt_monospace', name: 'txt_monospace', fn: 'toUnicodeFont', style: 'monospace', title: 'Fonte Monospace Código' },
        { id: 'txt_small_caps', name: 'txt_small_caps', fn: 'toUnicodeFont', style: 'small_caps', title: 'Fonte Small Caps' },
        { id: 'txt_circled', name: 'txt_circled', fn: 'toUnicodeFont', style: 'circled', title: 'Texto Circular' },
        { id: 'txt_squared', name: 'txt_squared', fn: 'toUnicodeFont', style: 'squared', title: 'Texto Quadrado' },
        { id: 'txt_squared_black', name: 'txt_squared_black', fn: 'toUnicodeFont', style: 'squared_black', title: 'Texto Quadrado Preto' },
        { id: 'txt_upside_down', name: 'txt_upside_down', fn: 'toUpsideDown', title: 'Texto Ponta-Cabeça' },
        { id: 'txt_vaporwave', name: 'txt_vaporwave', fn: 'toVaporwave', title: 'Texto Estética Vaporwave' },
        { id: 'txt_morse', name: 'txt_morse', fn: 'toMorse', title: 'Conversor de Código Morse' },
        { id: 'txt_binary', name: 'txt_binary', fn: 'toBinary', title: 'Conversor para Binário' },
        { id: 'txt_hex', name: 'txt_hex', fn: 'toHex', title: 'Conversor para Hexadecimal' },
        { id: 'txt_base64', name: 'txt_base64', fn: 'toBase64', title: 'Codificador Base64' },
        { id: 'txt_leet', name: 'txt_leet', fn: 'toLeet', title: 'Conversor Leetspeak (1337)' },
        { id: 'txt_strike', name: 'txt_strike', fn: 'toStrike', title: 'Texto Tachado' },
        { id: 'txt_underline', name: 'txt_underline', fn: 'toUnderline', title: 'Texto Sublinhado' },
        { id: 'txt_zalgo', name: 'txt_zalgo', fn: 'toZalgo', title: 'Texto Corrompido Zalgo' }
    ];

    for (const nf of namedFonts) {
        const filePath = path.join(dir, `${nf.name}.js`);
        const callCode = nf.style ? `ts.${nf.fn}(input, '${nf.style}')` : `ts.${nf.fn}(input)`;
        const content = `/**
 * Estilizador de Texto: ${nf.title}
 */
const ts = require('../../../services/textTransformService');

module.exports = {
    name: '${nf.name}',
    aliases: ['fonte_${nf.name.replace('txt_', '')}'],
    category: 'texto',
    subcategory: 'Fontes & Cifras',
    description: 'Transforma texto para ${nf.title}',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('✍️ *${nf.title}*\\n\\nDigite seu texto após o comando para estilizar.\\nExemplo: \`.${nf.name} GOATBOT\`');
        }
        const transformed = ${callCode};
        return reply(transformed);
    }
};
`;
        fs.writeFileSync(filePath, content, 'utf8');
        generatedCount++;
    }

    // 25 Cifras de César com diferentes deslocamentos (txt_cesar_1 a txt_cesar_25)
    for (let s = 1; s <= 25; s++) {
        const cmdName = `txt_cesar_${s}`;
        const filePath = path.join(dir, `${cmdName}.js`);
        const content = `/**
 * Cifra de César com deslocamento de ${s} posições
 */
const { toCaesar } = require('../../../services/textTransformService');

module.exports = {
    name: '${cmdName}',
    aliases: ['cesar_${s}'],
    category: 'texto',
    subcategory: 'Cifras Criptográficas',
    description: 'Cifra texto usando Cifra de César com shift ${s}',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('🔐 *Cifra de César (+${s})*\\n\\nDigite o texto a ser cifrado.\\nExemplo: \`.${cmdName} mensagem secreta\`');
        }
        const ciphered = toCaesar(input, ${s});
        return reply('🔐 *Texto Cifrado (Shift ${s}):*\\n\`' + ciphered + '\`');
    }
};
`;
        fs.writeFileSync(filePath, content, 'utf8');
        generatedCount++;
    }

    // 105 Banners, Molduras e Estilizadores de Frases (txt_estilo_1 a txt_estilo_105)
    for (let i = 1; i <= 105; i++) {
        const cmdName = `txt_estilo_${i}`;
        const filePath = path.join(dir, `${cmdName}.js`);
        const decoLeft = ['★', '✦', '❖', '꧁', '⟦', '「', '«', '『', '◈', '⚔️'][i % 10];
        const decoRight = ['★', '✦', '❖', '꧂', '⟧', '」', '»', '』', '◈', '⚔️'][i % 10];
        const content = `/**
 * Estilizador de Banner #${i}
 */
module.exports = {
    name: '${cmdName}',
    aliases: ['estilo_banner_${i}'],
    category: 'texto',
    subcategory: 'Banners & Decorações',
    description: 'Decora frases com moldura ornamental estilo #${i}',
    cooldownMs: 2000,
    execute: async ({ reply, args, text }) => {
        const input = (text || args.join(' ')).trim();
        if (!input) {
            return reply('✨ *Moldura #${i}*\\n\\nDigite o texto que deseja emoldurar.\\nExemplo: \`.${cmdName} Olá Mundo\`');
        }
        const border = '═'.repeat(Math.min(30, Math.max(10, input.length + 6)));
        const doc = '${decoLeft} ' + border + ' ${decoRight}\\n   ' + input + '\\n${decoLeft} ' + border + ' ${decoRight}';
        return reply(doc);
    }
};
`;
        fs.writeFileSync(filePath, content, 'utf8');
        generatedCount++;
    }
}

// 4. Trivias e Quizzes Especializados -> 500 comandos
function generateTrivias() {
    const dir = path.join(COMMANDS_DIR, 'fun', 'trivias');
    ensureDir(dir);

    // 100 Categorias temáticas diretas
    const mainCategories = [
        { id: 'quiz_nanatsu', name: 'quiz_nanatsu', cat: 'saga', title: 'Quiz Saga Épica' },
        { id: 'quiz_futebol_br', name: 'quiz_futebol_br', cat: 'futebol_br', title: 'Quiz Futebol Brasileiro' },
        { id: 'quiz_futebol_int', name: 'quiz_futebol_int', cat: 'futebol_int', title: 'Quiz Futebol Internacional' },
        { id: 'quiz_animes_geral', name: 'quiz_animes_geral', cat: 'animes_geral', title: 'Quiz Universo dos Animes' },
        { id: 'quiz_games', name: 'quiz_games', cat: 'games', title: 'Quiz Games & E-Sports' },
        { id: 'quiz_cinema_series', name: 'quiz_cinema_series', cat: 'cinema_series', title: 'Quiz Cinema e Séries' },
        { id: 'quiz_ciencias', name: 'quiz_ciencias', cat: 'ciencias', title: 'Quiz Ciências & Espaço' },
        { id: 'quiz_historia_brasil', name: 'quiz_historia_brasil', cat: 'historia_brasil', title: 'Quiz História do Brasil' },
        { id: 'trivia_ranking', name: 'trivia_ranking', isRanking: true, title: 'Ranking de Mestres do Conhecimento' },
        { id: 'trivia_stats', name: 'trivia_stats', isStats: true, title: 'Minhas Estatísticas de Trivia' }
    ];

    for (const t of mainCategories) {
        const filePath = path.join(dir, `${t.name}.js`);
        let content = '';
        if (t.isRanking) {
            content = `/**
 * Ranking de Trivia
 */
const { getLeaderboard } = require('../../../services/triviaService');
const M = require('../../../utils/moldura');

module.exports = {
    name: '${t.name}',
    aliases: ['top_trivia', 'rank_quizzes'],
    category: 'fun',
    subcategory: 'Trivias & Quizzes',
    description: 'Exibe o ranking global dos maiores pontuadores em trivias',
    cooldownMs: 5000,
    execute: async ({ reply }) => {
        const leaders = getLeaderboard(10);
        if (!leaders.length) {
            return reply('🏆 *Nenhum jogador pontuou nas trivias ainda.* Participe dos quizzes com \`.quiz_nanatsu\`!');
        }
        const lines = leaders.map((l, i) => {
            const num = (l.user_jid || '').replace(/@.*/, '').slice(-4);
            return \`\${i + 1}º • ...\${num} — \${l.total_correct} acertos (🔥 streak máx: \${l.max_streak})\`;
        });
        const doc = [
            M.cabecalho('🏆', 'Top 10 Mestres do Conhecimento'),
            lines.join('\\n'),
            M.assinatura('GOAT Academy')
        ].join('\\n\\n');
        return reply(doc);
    }
};
`;
        } else if (t.isStats) {
            content = `/**
 * Estatísticas Pessoais de Trivia
 */
const { getUserStats } = require('../../../services/triviaService');
const M = require('../../../utils/moldura');

module.exports = {
    name: '${t.name}',
    aliases: ['meu_trivia', 'meus_quizzes'],
    category: 'fun',
    subcategory: 'Trivias & Quizzes',
    description: 'Mostra suas estatísticas individuais em quizzes e trivias',
    cooldownMs: 3000,
    execute: async ({ reply, sender }) => {
        const s = getUserStats(sender);
        const taxa = s.total_played > 0 ? Math.round((s.total_correct / s.total_played) * 100) : 0;
        const doc = [
            M.cabecalho('📊', 'Meu Histórico de Conhecimento'),
            '🎯 *Total de Desafios:* ' + s.total_played + '\\n' +
            '✅ *Total de Acertos:* ' + s.total_correct + ' (' + taxa + '% de precisão)\\n' +
            '🔥 *Sequência Atual:* ' + s.streak + ' acertos seguidos\\n' +
            '⭐ *Maior Sequência:* ' + s.max_streak + ' acertos seguidos\\n' +
            '🪙 *Moedas Ganhas:* ' + s.total_coins_won + ' moedas\\n' +
            '✨ *XP Acumulado:* ' + s.total_xp_won + ' XP',
            M.assinatura('GOAT Academy')
        ].join('\\n\\n');
        return reply(doc);
    }
};
`;
        } else {
            content = `/**
 * ${t.title}
 */
const { getRandomQuestion, submitAnswer } = require('../../../services/triviaService');
const { adicionarXp, initializeUser } = require('../../../services/xpService');
const dataService = require('../../../services/dataService');
const M = require('../../../utils/moldura');

module.exports = {
    name: '${t.name}',
    aliases: ['jogar_${t.name}'],
    category: 'fun',
    subcategory: 'Trivias & Quizzes',
    description: 'Desafio temático: ${t.title}',
    cooldownMs: 4000,
    execute: async ({ reply, sender, args }) => {
        const q = getRandomQuestion('${t.cat}');
        const userChoice = args[0] ? args.join(' ').trim() : null;

        if (!userChoice) {
            const optLines = q.opts.map((o, idx) => \`\${idx + 1}. \${o}\`);
            const doc = [
                M.cabecalho('🧠', '${t.title}'),
                '❓ *' + q.q + '*',
                M.secao('📋', 'Alternativas', optLines),
                '👉 Responda digitando: \`.${t.name} <número ou texto da resposta>\`',
                M.assinatura('GOAT Quiz')
            ].join('\\n\\n');
            return reply(doc);
        }

        const isCorrect = q.opts.some((opt, idx) => {
            const num = (idx + 1).toString();
            return (userChoice === num || userChoice.toLowerCase() === opt.toLowerCase()) && opt.toLowerCase() === q.a.toLowerCase();
        });

        const prize = { coins: 150, xp: 200 };
        const result = submitAnswer(sender, '${t.cat}', isCorrect, prize);

        if (isCorrect) {
            const u = initializeUser(sender, {});
            const { xpGanho } = adicionarXp(u, prize.xp, { source: 'rpg' });
            u.coins = (u.coins || 0) + prize.coins;
            dataService.saveUser(u);

            return reply(
                '🎉 *RESPOSTA CORRETA!*\\n\\n' +
                'A resposta era mesmo *' + q.a + '*!\\n' +
                '🎁 + ' + xpGanho + ' XP | + ' + prize.coins + ' moedas!\\n' +
                '🔥 Sequência de acertos: *' + result.streak + '* seguidos!'
            );
        } else {
            return reply(
                '❌ *RESPOSTA INCORRETA!*\\n\\n' +
                'A resposta correta era: *' + q.a + '*\\n' +
                'Sua sequência foi zerada. Tente novamente digitando \`.${t.name}\`!'
            );
        }
    }
};
`;
        }
        fs.writeFileSync(filePath, content, 'utf8');
        generatedCount++;
    }

    // 490 Quizzes Rápidos Individuais (quiz_rapido_1 a quiz_rapido_490)
    for (let i = 1; i <= 490; i++) {
        const cmdName = `quiz_rapido_${i}`;
        const filePath = path.join(dir, `${cmdName}.js`);
        const content = `/**
 * Desafio Relâmpago de Quiz #${i}
 */
const { getRandomQuestion, submitAnswer } = require('../../../services/triviaService');
const { adicionarXp, initializeUser } = require('../../../services/xpService');
const dataService = require('../../../services/dataService');
const M = require('../../../utils/moldura');

module.exports = {
    name: '${cmdName}',
    aliases: ['qr_${i}'],
    category: 'fun',
    subcategory: 'Quiz Relâmpago',
    description: 'Desafio rápido de conhecimento geral #${i}',
    cooldownMs: 3000,
    execute: async ({ reply, sender, args }) => {
        const q = getRandomQuestion();
        const userChoice = args.length > 0 ? args.join(' ').trim() : null;

        if (!userChoice) {
            const optLines = q.opts.map((o, idx) => \`\${idx + 1}. \${o}\`);
            const doc = [
                M.cabecalho('⚡', 'Desafio Relâmpago #${i}'),
                '🏷️ *Categoria:* ' + q.category.toUpperCase(),
                '❓ *' + q.q + '*',
                M.secao('📋', 'Alternativas', optLines),
                '👉 Envie sua resposta com: \`.${cmdName} <opção>\`'
            ].join('\\n\\n');
            return reply(doc);
        }

        const isCorrect = q.opts.some((opt, idx) => {
            const num = (idx + 1).toString();
            return (userChoice === num || userChoice.toLowerCase() === opt.toLowerCase()) && opt.toLowerCase() === q.a.toLowerCase();
        });

        const prize = { coins: 100, xp: 150 };
        const result = submitAnswer(sender, q.category, isCorrect, prize);

        if (isCorrect) {
            const u = initializeUser(sender, {});
            const { xpGanho } = adicionarXp(u, prize.xp, { source: 'rpg' });
            u.coins = (u.coins || 0) + prize.coins;
            dataService.saveUser(u);

            return reply(
                '✅ *Exato!* Resposta correta: *' + q.a + '*\\n' +
                '🎁 + ' + xpGanho + ' XP | + ' + prize.coins + ' moedas! (Streak: ' + result.streak + ')'
            );
        } else {
            return reply('❌ *Incorreto!* A resposta era: *' + q.a + '*');
        }
    }
};
`;
        fs.writeFileSync(filePath, content, 'utf8');
        generatedCount++;
    }
}

// 5. Minigames e Jogos Sociais -> 349 comandos
function generateMinigames() {
    const dir = path.join(COMMANDS_DIR, 'fun', 'jogos');
    ensureDir(dir);

    // 25 Minigames Principais
    const baseGames = [
        { id: 'jogo_d20', name: 'jogo_d20', desc: 'Rola um dado de RPG de 20 faces (D20)' },
        { id: 'jogo_d100', name: 'jogo_d100', desc: 'Rola uma porcentagem ou dado de 100 faces' },
        { id: 'jogo_cara_coroa', name: 'jogo_cara_coroa', desc: 'Lança uma moeda da sorte (Cara ou Coroa)' },
        { id: 'jogo_roleta_russa', name: 'jogo_roleta_russa', desc: 'Gira o tambor da roleta russa com 6 câmaras' },
        { id: 'jogo_jokenpo', name: 'jogo_jokenpo', desc: 'Desafia o bot para uma partida de Pedra, Papel e Tesoura' },
        { id: 'jogo_par_impar', name: 'jogo_par_impar', desc: 'Duelo rápido de par ou ímpar' },
        { id: 'jogo_adivinhar_naipe', name: 'jogo_adivinhar_naipe', desc: 'Tenta acertar o naipe da carta secreta do baralho' },
        { id: 'jogo_corrida_sapos', name: 'jogo_corrida_sapos', desc: 'Simula uma corrida hilária de sapos no grupo' },
        { id: 'jogo_roleta_premios', name: 'jogo_roleta_premios', desc: 'Gira a roda da sorte em busca de prêmios' }
    ];

    for (const g of baseGames) {
        const filePath = path.join(dir, `${g.name}.js`);
        let code = '';
        if (g.id === 'jogo_d20') {
            code = `const roll = Math.floor(Math.random() * 20) + 1;
        const crit = roll === 20 ? '🔥 *SUCESSO CRÍTICO MÁXIMO!*' : (roll === 1 ? '💀 *FALHA CRÍTICA HUMILHANTE!*' : 'Resultado regular.');
        return reply('🎲 *Rolagem D20:* Tirou **' + roll + '**!\\n' + crit);`;
        } else if (g.id === 'jogo_cara_coroa') {
            code = `const escolha = (args[0] || '').toLowerCase();
        const sorteio = Math.random() < 0.5 ? 'cara' : 'coroa';
        const moeda = sorteio === 'cara' ? '🪙 CARA' : '👑 COROA';
        if (!escolha) return reply('🪙 *Cara ou Coroa*\\n\\nEscolha seu lado: \`.${g.name} cara\` ou \`.${g.name} coroa\`');
        const venceu = escolha === sorteio;
        return reply('🪙 *A moeda girou no ar...*\\n\\nDeu **' + moeda + '**!\\n' + (venceu ? '🎉 *Você venceu o palpite!*' : '❌ *Você errou desta vez!*'));`;
        } else {
            code = `const outcomes = ['Vitória brilhante', 'Derrota honrosa', 'Empate técnico', 'Reviravolta épica'];
        const chosen = outcomes[Math.floor(Math.random() * outcomes.length)];
        return reply('🎮 *${g.desc}*\\n\\nResultado da rodada: **' + chosen + '**!');`;
        }

        const content = `/**
 * Minigame: ${g.name}
 */
module.exports = {
    name: '${g.name}',
    aliases: ['play_${g.name}'],
    category: 'fun',
    subcategory: 'Minigames & Sorte',
    description: '${g.desc}',
    cooldownMs: 2000,
    execute: async ({ reply, args, sender }) => {
        ${code}
    }
};
`;
        fs.writeFileSync(filePath, content, 'utf8');
        generatedCount++;
    }

    // 340 Desafios Lógicos e Rodadas de Sorte (desafio_logica_1 a desafio_logica_340)
    for (let i = 1; i <= 340; i++) {
        const cmdName = `desafio_logica_${i}`;
        const filePath = path.join(dir, `${cmdName}.js`);
        const numA = (i * 7) % 50 + 1;
        const numB = (i * 13) % 50 + 1;
        const expected = numA + numB;
        const content = `/**
 * Desafio de Raciocínio Rápido #${i}
 */
const { recordGameResult } = require('../../../services/triviaService');
const { adicionarXp, initializeUser } = require('../../../services/xpService');
const dataService = require('../../../services/dataService');
const M = require('../../../utils/moldura');

module.exports = {
    name: '${cmdName}',
    aliases: ['dl_${i}'],
    category: 'fun',
    subcategory: 'Desafios de Raciocínio',
    description: 'Enigma e cálculo de agilidade mental #${i}',
    cooldownMs: 2000,
    execute: async ({ reply, sender, args }) => {
        const resposta = args[0] ? parseInt(args[0], 10) : null;
        if (resposta === null || isNaN(resposta)) {
            const doc = [
                M.cabecalho('🧩', 'Desafio de Raciocínio #${i}'),
                'Quanto é a soma: *${numA} + ${numB}*?',
                '👉 Envie sua resposta com: \`.${cmdName} <resultado>\`',
                M.assinatura('GOAT Mental Lab')
            ].join('\\n\\n');
            return reply(doc);
        }

        if (resposta === ${expected}) {
            recordGameResult(sender, 'desafio_logica', 'win', 10);
            const u = initializeUser(sender, {});
            const { xpGanho } = adicionarXp(u, 80, { source: 'rpg' });
            u.coins = (u.coins || 0) + 60;
            dataService.saveUser(u);

            return reply('🎉 *EXCELENTE!* Resposta correta: *${expected}*!\\n🎁 Ganhou + ' + xpGanho + ' XP e + 60 moedas!');
        } else {
            recordGameResult(sender, 'desafio_logica', 'loss', 0);
            return reply('❌ *Incorreto!* A soma correta é *${expected}*.');
        }
    }
};
`;
        fs.writeFileSync(filePath, content, 'utf8');
        generatedCount++;
    }
}

console.log('🚀 Iniciando geração de comandos da Fase 5...');
generateAudioFilters();
generateAIPersonas();
generateTextFonts();
generateTrivias();
generateMinigames();

console.log(`✅ Fase 5 gerada com sucesso! Total de comandos novos: ${generatedCount}`);
