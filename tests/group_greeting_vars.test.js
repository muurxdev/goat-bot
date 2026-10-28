const assert = require('assert');
const { formatTemplate, resolveMentionsForText, getGreetingVars, variableGuide } = require('../src/services/groupGreetingService');

console.log('🧪 Iniciando testes de variáveis adicionais de Boas-Vindas...');

// 1. Teste de substituição das novas variáveis dinâmicas
const vars = {
    userTag: '@553599991111',
    participantJid: '553599991111@s.whatsapp.net',
    donoTag: '@553599992222',
    ownerJid: '553599992222@s.whatsapp.net',
    segundoAdmTag: '@553599993333',
    secondAdminJid: '553599993333@s.whatsapp.net',
    admsTags: '@553599992222 @553599993333 @553599994444',
    listaAdmsFormatada: '1. @553599992222\n2. @553599993333\n3. @553599994444',
    adminJids: ['553599992222@s.whatsapp.net', '553599993333@s.whatsapp.net', '553599994444@s.whatsapp.net'],
    allMentionJids: [
        '553599991111@s.whatsapp.net',
        '553599992222@s.whatsapp.net',
        '553599993333@s.whatsapp.net',
        '553599994444@s.whatsapp.net'
    ],
    groupName: 'Família GOAT',
    groupDesc: 'Respeitem as regras e divirtam-se!',
    memberCount: 42,
    timeStr: '14:30:00',
    dateStr: '25/10/2026',
    botName: 'GOATBOT',
    adminCount: 3,
    saudacao: 'Boa tarde',
    diaSemana: 'domingo'
};

const template = 'Bem-vindo {user} ao {grupo}! Dono: {dono}. Subdono/2º adm: {subdono}. Admins: {adms}. Membros: {membros}. Hora: {hora}.';
const rendered = formatTemplate(template, vars);

console.log('Mensagem formatada:', rendered);
assert(rendered.includes('@553599991111'), 'Deve conter tag do usuário');
assert(rendered.includes('Família GOAT'), 'Deve conter nome do grupo');
assert(rendered.includes('@553599992222'), 'Deve conter tag do dono');
assert(rendered.includes('@553599993333'), 'Deve conter tag do subdono / segundo adm');
assert(rendered.includes('@553599994444'), 'Deve conter menção de todos os admins');
assert(rendered.includes('42'), 'Deve conter total de membros');

// 2. Teste de resolução de mentions para o Baileys
const mentions = resolveMentionsForText(rendered, vars);
console.log('Mentions extraídas:', mentions);
assert(mentions.includes('553599991111@s.whatsapp.net'), 'Mentions deve incluir o usuário');
assert(mentions.includes('553599992222@s.whatsapp.net'), 'Mentions deve incluir o dono');
assert(mentions.includes('553599993333@s.whatsapp.net'), 'Mentions deve incluir o subdono');
assert(mentions.includes('553599994444@s.whatsapp.net'), 'Mentions deve incluir o terceiro admin');
assert.strictEqual(mentions.length, 4, 'Deve conter exatamente 4 mentions únicas');

// 3. Teste do guia de variáveis
const guide = variableGuide('welcome');
assert(guide.includes('{user}'), 'Guia deve listar {user}');
assert(guide.includes('{dono}'), 'Guia deve listar {dono}');
assert(guide.includes('{subdono}'), 'Guia deve listar {subdono}');
assert(guide.includes('{adms}'), 'Guia deve listar {adms}');

console.log('✅ Todos os testes de Boas-Vindas passaram com sucesso!');
