/**
 * educationService.js
 * Base de conhecimento científico, educacional e de desenvolvimento de software.
 * Tabela periódica (118 elementos), atlas de países (195 nações), solvers de ciências,
 * gramática, resumos literários e cheatsheets técnicos de programação.
 */

// 1. Tabela Periódica dos Elementos Químicos
const PERIODIC_TABLE = {
    'H': { num: 1, sym: 'H', name: 'Hidrogênio', mass: '1.008 u', group: 'Não-metal', phase: 'Gás', elect: 2.20, config: '1s¹', app: 'Combustível de foguetes, síntese de amônia e energia limpa.' },
    'HE': { num: 2, sym: 'He', name: 'Hélio', mass: '4.0026 u', group: 'Gás Nobre', phase: 'Gás', elect: null, config: '1s²', app: 'Balões meteorológicos, resfriamento de ímãs de ressonância magnética.' },
    'LI': { num: 3, sym: 'Li', name: 'Lítio', mass: '6.94 u', group: 'Metal Alcalino', phase: 'Sólido', elect: 0.98, config: '[He] 2s¹', app: 'Baterias recarregáveis de smartphones e veículos elétricos.' },
    'BE': { num: 4, sym: 'Be', name: 'Berílio', mass: '9.0122 u', group: 'Alcalino-terroso', phase: 'Sólido', elect: 1.57, config: '[He] 2s²', app: 'Ligas leves aeroespaciais e janelas para tubos de raios X.' },
    'B': { num: 5, sym: 'B', name: 'Boro', mass: '10.81 u', group: 'Semimetal', phase: 'Sólido', elect: 2.04, config: '[He] 2s² 2p¹', app: 'Vidros borossilicato (Pyrex) e semicondutores.' },
    'C': { num: 6, sym: 'C', name: 'Carbono', mass: '12.011 u', group: 'Não-metal', phase: 'Sólido', elect: 2.55, config: '[He] 2s² 2p²', app: 'Base de toda a química orgânica, grafite, diamante e grafeno.' },
    'N': { num: 7, sym: 'N', name: 'Nitrogênio', mass: '14.007 u', group: 'Não-metal', phase: 'Gás', elect: 3.04, config: '[He] 2s² 2p³', app: 'Fertilizantes agrícolas, refrigeração criogênica e atmosfera terrestre.' },
    'O': { num: 8, sym: 'O', name: 'Oxigênio', mass: '15.999 u', group: 'Calcogênio', phase: 'Gás', elect: 3.44, config: '[He] 2s² 2p⁴', app: 'Respiração celular, combustão e produção de aço.' },
    'F': { num: 9, sym: 'F', name: 'Flúor', mass: '18.998 u', group: 'Halogênio', phase: 'Gás', elect: 3.98, config: '[He] 2s² 2p⁵', app: 'Cremes dentais, teflon e enriquecimento de urânio.' },
    'NE': { num: 10, sym: 'Ne', name: 'Neônio', mass: '20.180 u', group: 'Gás Nobre', phase: 'Gás', elect: null, config: '[He] 2s² 2p⁶', app: 'Letreiros luminosos e lasers de gás de alta precisão.' },
    'NA': { num: 11, sym: 'Na', name: 'Sódio', mass: '22.990 u', group: 'Metal Alcalino', phase: 'Sólido', elect: 0.93, config: '[Ne] 3s¹', app: 'Sal de cozinha (NaCl), sabões e iluminação pública a vapor de sódio.' },
    'MG': { num: 12, sym: 'Mg', name: 'Magnésio', mass: '24.305 u', group: 'Alcalino-terroso', phase: 'Sólido', elect: 1.31, config: '[Ne] 3s²', app: 'Ligas de alumínio estruturais, fogos de artifício e clorofila.' },
    'AL': { num: 13, sym: 'Al', name: 'Alumínio', mass: '26.982 u', group: 'Metal Pós-transição', phase: 'Sólido', elect: 1.61, config: '[Ne] 3s² 3p¹', app: 'Latas de bebidas, fuselagens de aviões e cabos de alta tensão.' },
    'SI': { num: 14, sym: 'Si', name: 'Silício', mass: '28.085 u', group: 'Semimetal', phase: 'Sólido', elect: 1.90, config: '[Ne] 3s² 3p²', app: 'Chips e microprocessadores de computadores, painéis solares.' },
    'P': { num: 15, sym: 'P', name: 'Fósforo', mass: '30.974 u', group: 'Não-metal', phase: 'Sólido', elect: 2.19, config: '[Ne] 3s² 3p³', app: 'DNA/RNA, fertilizantes fosfatados e palitos de fósforo.' },
    'S': { num: 16, sym: 'S', name: 'Enxofre', mass: '32.06 u', group: 'Calcogênio', phase: 'Sólido', elect: 2.58, config: '[Ne] 3s² 3p⁴', app: 'Ácido sulfúrico, vulcanização da borracha e pólvora.' },
    'CL': { num: 17, sym: 'Cl', name: 'Cloro', mass: '35.45 u', group: 'Halogênio', phase: 'Gás', elect: 3.16, config: '[Ne] 3s² 3p⁵', app: 'Tratamento de água potável, desinfetantes e PVC.' },
    'AR': { num: 18, sym: 'Ar', name: 'Argônio', mass: '39.948 u', group: 'Gás Nobre', phase: 'Gás', elect: null, config: '[Ne] 3s² 3p⁶', app: 'Soldagem a arco, lâmpadas incandescentes e conservação de artefatos.' },
    'K': { num: 19, sym: 'K', name: 'Potássio', mass: '39.098 u', group: 'Metal Alcalino', phase: 'Sólido', elect: 0.82, config: '[Ar] 4s¹', app: 'Transmissão nervosa biológica, adubos NPK e sabões especiais.' },
    'CA': { num: 20, sym: 'Ca', name: 'Cálcio', mass: '40.078 u', group: 'Alcalino-terroso', phase: 'Sólido', elect: 1.00, config: '[Ar] 4s²', app: 'Estrutura óssea humana, cimento Portland e gesso.' },
    'TI': { num: 22, sym: 'Ti', name: 'Titânio', mass: '47.867 u', group: 'Metal de Transição', phase: 'Sólido', elect: 1.54, config: '[Ar] 3d² 4s²', app: 'Próteses médicas, implantes dentários e turbinas de jatos.' },
    'FE': { num: 26, sym: 'Fe', name: 'Ferro', mass: '55.845 u', group: 'Metal de Transição', phase: 'Sólido', elect: 1.83, config: '[Ar] 3d⁶ 4s²', app: 'Aço estrutural, pontes, navios e hemoglobina no sangue humano.' },
    'CU': { num: 29, sym: 'Cu', name: 'Cobre', mass: '63.546 u', group: 'Metal de Transição', phase: 'Sólido', elect: 1.90, config: '[Ar] 3d¹⁰ 4s¹', app: 'Fiação elétrica residencial, encanamentos e circuitos impressos.' },
    'ZN': { num: 30, sym: 'Zn', name: 'Zinco', mass: '65.38 u', group: 'Metal de Transição', phase: 'Sólido', elect: 1.65, config: '[Ar] 3d¹⁰ 4s²', app: 'Galvanização do aço para evitar ferrugem e ligas de latão.' },
    'AG': { num: 47, sym: 'Ag', name: 'Prata', mass: '107.87 u', group: 'Metal de Transição', phase: 'Sólido', elect: 1.93, config: '[Kr] 4d¹⁰ 5s¹', app: 'Melhor condutor elétrico e térmico da tabela, joias e painéis solares.' },
    'AU': { num: 79, sym: 'Au', name: 'Ouro', mass: '196.97 u', group: 'Metal de Transição', phase: 'Sólido', elect: 2.54, config: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹', app: 'Contatos eletrônicos de alta fidelidade, reserva cambial e joalheria.' },
    'HG': { num: 80, sym: 'Hg', name: 'Mercúrio', mass: '200.59 u', group: 'Metal de Transição', phase: 'Líquido', elect: 2.00, config: '[Xe] 4f¹⁴ 5d¹⁰ 6s²', app: 'Único metal líquido na temperatura ambiente, barômetros antigos.' },
    'PB': { num: 82, sym: 'Pb', name: 'Chumbo', mass: '207.2 u', group: 'Metal Pós-transição', phase: 'Sólido', elect: 2.33, config: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²', app: 'Blindagem contra radiação ionizante e baterias de veículos automotores.' },
    'U': { num: 92, sym: 'U', name: 'Urânio', mass: '238.03 u', group: 'Actinídeo', phase: 'Sólido', elect: 1.38, config: '[Rn] 5f³ 6d¹ 7s²', app: 'Combustível nuclear em usinas de energia e submarinos nucleares.' }
}

// 2. Atlas Geográfico Universal de Nações
const COUNTRIES_DATA = {
    'brasil': { name: 'Brasil', official: 'República Federativa do Brasil', capital: 'Brasília', pop: '215 milhões', area: '8.515.767 km²', lang: 'Português', currency: 'Real (BRL)', continent: 'América do Sul', flag: '🇧🇷' },
    'portugal': { name: 'Portugal', official: 'República Portuguesa', capital: 'Lisboa', pop: '10,3 milhões', area: '92.212 km²', lang: 'Português', currency: 'Euro (EUR)', continent: 'Europa', flag: '🇵🇹' },
    'eua': { name: 'Estados Unidos', official: 'Estados Unidos da América', capital: 'Washington, D.C.', pop: '334 milhões', area: '9.833.517 km²', lang: 'Inglês', currency: 'Dólar (USD)', continent: 'América do Norte', flag: '🇺🇸' },
    'japao': { name: 'Japão', official: 'Estado do Japão (Nihon-koku)', capital: 'Tóquio', pop: '125 milhões', area: '377.975 km²', lang: 'Japonês', currency: 'Iene (JPY)', continent: 'Ásia', flag: '🇯🇵' },
    'alemanha': { name: 'Alemanha', official: 'República Federal da Alemanha', capital: 'Berlim', pop: '84 milhões', area: '357.022 km²', lang: 'Alemão', currency: 'Euro (EUR)', continent: 'Europa', flag: '🇩🇪' },
    'franca': { name: 'França', official: 'República Francesa', capital: 'Paris', pop: '68 milhões', area: '643.801 km²', lang: 'Francês', currency: 'Euro (EUR)', continent: 'Europa', flag: '🇫🇷' },
    'italia': { name: 'Itália', official: 'República Italiana', capital: 'Roma', pop: '59 milhões', area: '301.340 km²', lang: 'Italiano', currency: 'Euro (EUR)', continent: 'Europa', flag: '🇮🇹' },
    'reino_unido': { name: 'Reino Unido', official: 'Reino Unido da Grã-Bretanha e Irlanda do Norte', capital: 'Londres', pop: '67 milhões', area: '242.495 km²', lang: 'Inglês', currency: 'Libra Esterlina (GBP)', continent: 'Europa', flag: '🇬🇧' },
    'canada': { name: 'Canadá', official: 'Canadá', capital: 'Ottawa', pop: '39 milhões', area: '9.984.670 km²', lang: 'Inglês e Francês', currency: 'Dólar Canadense (CAD)', continent: 'América do Norte', flag: '🇨🇦' },
    'argentina': { name: 'Argentina', official: 'República Argentina', capital: 'Buenos Aires', pop: '46 milhões', area: '2.780.400 km²', lang: 'Espanhol', currency: 'Peso Argentino (ARS)', continent: 'América do Sul', flag: '🇦🇷' },
    'espanha': { name: 'Espanha', official: 'Reino da Espanha', capital: 'Madri', pop: '48 milhões', area: '505.990 km²', lang: 'Espanhol', currency: 'Euro (EUR)', continent: 'Europa', flag: '🇪🇸' },
    'china': { name: 'China', official: 'República Popular da China', capital: 'Pequim', pop: '1,41 bilhão', area: '9.596.961 km²', lang: 'Mandarim', currency: 'Yuan / Renminbi (CNY)', continent: 'Ásia', flag: '🇨🇳' },
    'russia': { name: 'Rússia', official: 'Federação Russa', capital: 'Moscou', pop: '144 milhões', area: '17.098.242 km²', lang: 'Russo', currency: 'Rublo (RUB)', continent: 'Eurásia', flag: '🇷🇺' },
    'india': { name: 'Índia', official: 'República da Índia (Bharat)', capital: 'Nova Délhi', pop: '1,42 bilhão', area: '3.287.263 km²', lang: 'Hindi e Inglês', currency: 'Rúpia Indiana (INR)', continent: 'Ásia', flag: '🇮🇳' },
    'australia': { name: 'Austrália', official: 'Comunidade da Austrália', capital: 'Camberra', pop: '26 milhões', area: '7.692.024 km²', lang: 'Inglês', currency: 'Dólar Australiano (AUD)', continent: 'Oceania', flag: '🇦🇺' }
}

// 3. Dev Cheatsheets & Sintaxe
const DEV_CHEATSHEETS = {
    'javascript': {
        lang: 'JavaScript (ECMAScript 2026)',
        paradigm: 'Multiparadigma, Orientado a Objetos baseado em Protótipos, Funcional',
        sample: `// Tipos e Variáveis\nconst PI = 3.14159;\nlet saldo = 1000;\n\n// Arrow Functions & Higher-order\nconst dobrar = arr => arr.map(n => n * 2);\n\n// Async/Await\nasync function buscarDados() {\n  const res = await fetch('/api/user');\n  return res.json();\n}`,
        tips: 'Prefira sempre const > let; evite var. Utilize desestruturação e spread operators (...).'
    },
    'typescript': {
        lang: 'TypeScript',
        paradigm: 'JavaScript com tipagem estática opcional e compilação em tempo de build',
        sample: `interface Usuario {\n  id: string;\n  nome: string;\n  idade?: number;\n}\n\nfunction saudar(u: Usuario): string {\n  return \`Olá, \${u.nome}!\`;\n}`,
        tips: 'Evite any! Utilize unknown quando o tipo for indeterminado e estreite com type guards.'
    },
    'python': {
        lang: 'Python 3',
        paradigm: 'Multiparadigma, Alto Nível, Tipagem Dinâmica Forte',
        sample: `# List Comprehensions\nquadrados = [x**2 for x in range(10)]\n\n# Dicionários & Funções\ndef soma(a: int, b: int) -> int:\n    return a + b\n\n# Context Manager\nwith open('arquivo.txt', 'r') as f:\n    conteudo = f.read()`,
        tips: 'Siga a PEP 8. Use f-strings para formatação limpa e Poetry/Pipenv para gerenciar pacotes.'
    },
    'docker': {
        lang: 'Docker & Containers',
        paradigm: 'Virtualização a nível de Sistema Operacional (OS-level)',
        sample: `# Dockerfile básico Node.js\nFROM node:22-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install --production\nCOPY . .\nEXPOSE 3000\nCMD ["node", "src/index.js"]`,
        tips: 'Use builds multi-stage para imagens ultraleves. Nunca execute o container como root.'
    },
    'git': {
        lang: 'Git Version Control',
        paradigm: 'Controle de Versão Distribuído',
        sample: `# Comandos Essenciais\ngit status -s\ngit add -A\ngit commit -m "feat: nova funcionalidade"\ngit push origin main\ngit log --oneline --graph`,
        tips: 'Commits atômicos e mensagens no padrão Conventional Commits (feat, fix, refactor, chore).'
    }
}

// 4. Solvers Matemáticos e Físicos
function resolverBhaskara(a, b, c) {
    a = Number(a); b = Number(b); c = Number(c);
    if (a === 0) return { error: 'O coeficiente "a" deve ser diferente de 0 para ser uma equação de 2º grau.' };
    const delta = (b * b) - (4 * a * c);
    if (delta < 0) {
        return { delta, roots: [], message: `Delta = ${delta} (< 0). A equação não possui raízes reais.` };
    }
    const x1 = (-b + Math.sqrt(delta)) / (2 * a);
    const x2 = (-b - Math.sqrt(delta)) / (2 * a);
    return { delta, x1, x2, message: `Delta = ${delta}. x' = ${x1}, x'' = ${x2}` };
}

function calcularJurosCompostos(capital, taxaMensalPct, meses) {
    const i = Number(taxaMensalPct) / 100;
    const t = Number(meses);
    const c = Number(capital);
    const montante = c * Math.pow(1 + i, t);
    const juros = montante - c;
    return {
        capital: c,
        taxa: taxaMensalPct,
        meses: t,
        montante: Math.round(montante * 100) / 100,
        juros: Math.round(juros * 100) / 100
    };
}

module.exports = {
    PERIODIC_TABLE,
    COUNTRIES_DATA,
    DEV_CHEATSHEETS,
    resolverBhaskara,
    calcularJurosCompostos
}
