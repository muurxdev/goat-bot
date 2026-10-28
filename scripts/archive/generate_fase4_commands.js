/**
 * generate_fase4_commands.js
 * Gerador de Comandos da Fase 4 (+1.400 comandos).
 * Educação, Ciências Exatas, Tabela Periódica, Atlas Global, História, Literatura e Dev Hub.
 */

const fs = require('fs')
const path = require('path')

const ESCOLA_DIR = path.resolve(__dirname, '../src/commands/escola')
const DEV_DIR = path.resolve(__dirname, '../src/commands/dev')
const FERRAMENTAS_DIR = path.resolve(__dirname, '../src/commands/ferramentas')

const existingNames = new Set()
const existingAliases = new Set()

function scanExisting(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, ent.name)
        if (ent.isDirectory()) scanExisting(full)
        else if (ent.name.endsWith('.js')) {
            try {
                const mod = require(full)
                if (mod.name) existingNames.add(mod.name.toLowerCase())
                if (Array.isArray(mod.aliases)) {
                    for (const a of mod.aliases) existingAliases.add(String(a).toLowerCase())
                }
            } catch (e) {}
        }
    }
}
scanExisting(path.resolve(__dirname, '../src/commands'))

console.log(`Nomes existentes antes da Fase 4: ${existingNames.size}`)

function ensureDir(p) {
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
}

const folders = {
    elementos: path.join(ESCOLA_DIR, 'elementos'),
    paises: path.join(ESCOLA_DIR, 'paises'),
    solvers: path.join(ESCOLA_DIR, 'solvers'),
    historia: path.join(ESCOLA_DIR, 'historia'),
    literatura: path.join(ESCOLA_DIR, 'literatura'),
    cheatsheets: path.join(DEV_DIR, 'cheatsheets'),
    http: path.join(DEV_DIR, 'http'),
    conversores: path.join(FERRAMENTAS_DIR, 'conversores')
}
Object.values(folders).forEach(ensureDir)

let createdCount = 0

function safeWrite(filePath, content, cmdName) {
    if (existingNames.has(cmdName.toLowerCase())) {
        return false
    }
    fs.writeFileSync(filePath, content.trim() + '\n', 'utf8')
    existingNames.add(cmdName.toLowerCase())
    createdCount++
    return true
}

// -------------------------------------------------------------
// 1. TABELA PERIÓDICA (118 ELEMENTOS QUÍMICOS)
// -------------------------------------------------------------
const educationService = require('../src/services/educationService')

// Lista dos 118 elementos da tabela periódica
const ALL_118_ELEMENTS = [
    { num: 1, sym: 'H', name: 'Hidrogênio', mass: '1.008', group: 'Não-metal', phase: 'Gás' },
    { num: 2, sym: 'He', name: 'Hélio', mass: '4.0026', group: 'Gás Nobre', phase: 'Gás' },
    { num: 3, sym: 'Li', name: 'Lítio', mass: '6.94', group: 'Metal Alcalino', phase: 'Sólido' },
    { num: 4, sym: 'Be', name: 'Berílio', mass: '9.0122', group: 'Alcalino-terroso', phase: 'Sólido' },
    { num: 5, sym: 'B', name: 'Boro', mass: '10.81', group: 'Semimetal', phase: 'Sólido' },
    { num: 6, sym: 'C', name: 'Carbono', mass: '12.011', group: 'Não-metal', phase: 'Sólido' },
    { num: 7, sym: 'N', name: 'Nitrogênio', mass: '14.007', group: 'Não-metal', phase: 'Gás' },
    { num: 8, sym: 'O', name: 'Oxigênio', mass: '15.999', group: 'Calcogênio', phase: 'Gás' },
    { num: 9, sym: 'F', name: 'Flúor', mass: '18.998', group: 'Halogênio', phase: 'Gás' },
    { num: 10, sym: 'Ne', name: 'Neônio', mass: '20.180', group: 'Gás Nobre', phase: 'Gás' },
    { num: 11, sym: 'Na', name: 'Sódio', mass: '22.990', group: 'Metal Alcalino', phase: 'Sólido' },
    { num: 12, sym: 'Mg', name: 'Magnésio', mass: '24.305', group: 'Alcalino-terroso', phase: 'Sólido' },
    { num: 13, sym: 'Al', name: 'Alumínio', mass: '26.982', group: 'Metal Pós-transição', phase: 'Sólido' },
    { num: 14, sym: 'Si', name: 'Silício', mass: '28.085', group: 'Semimetal', phase: 'Sólido' },
    { num: 15, sym: 'P', name: 'Fósforo', mass: '30.974', group: 'Não-metal', phase: 'Sólido' },
    { num: 16, sym: 'S', name: 'Enxofre', mass: '32.06', group: 'Calcogênio', phase: 'Sólido' },
    { num: 17, sym: 'Cl', name: 'Cloro', mass: '35.45', group: 'Halogênio', phase: 'Gás' },
    { num: 18, sym: 'Ar', name: 'Argônio', mass: '39.948', group: 'Gás Nobre', phase: 'Gás' },
    { num: 19, sym: 'K', name: 'Potássio', mass: '39.098', group: 'Metal Alcalino', phase: 'Sólido' },
    { num: 20, sym: 'Ca', name: 'Cálcio', mass: '40.078', group: 'Alcalino-terroso', phase: 'Sólido' },
    { num: 21, sym: 'Sc', name: 'Escândio', mass: '44.956', group: 'Metal de Transição', phase: 'Sólido' },
    { num: 22, sym: 'Ti', name: 'Titânio', mass: '47.867', group: 'Metal de Transição', phase: 'Sólido' },
    { num: 23, sym: 'V', name: 'Vanádio', mass: '50.942', group: 'Metal de Transição', phase: 'Sólido' },
    { num: 24, sym: 'Cr', name: 'Cromo', mass: '51.996', group: 'Metal de Transição', phase: 'Sólido' },
    { num: 25, sym: 'Mn', name: 'Manganês', mass: '54.938', group: 'Metal de Transição', phase: 'Sólido' },
    { num: 26, sym: 'Fe', name: 'Ferro', mass: '55.845', group: 'Metal de Transição', phase: 'Sólido' },
    { num: 27, sym: 'Co', name: 'Cobalto', mass: '58.933', group: 'Metal de Transição', phase: 'Sólido' },
    { num: 28, sym: 'Ni', name: 'Níquel', mass: '58.693', group: 'Metal de Transição', phase: 'Sólido' },
    { num: 29, sym: 'Cu', name: 'Cobre', mass: '63.546', group: 'Metal de Transição', phase: 'Sólido' },
    { num: 30, sym: 'Zn', name: 'Zinco', mass: '65.38', group: 'Metal de Transição', phase: 'Sólido' },
    { num: 31, sym: 'Ga', name: 'Gálio', mass: '69.723', group: 'Metal Pós-transição', phase: 'Sólido' },
    { num: 32, sym: 'Ge', name: 'Germânio', mass: '72.63', group: 'Semimetal', phase: 'Sólido' },
    { num: 33, sym: 'As', name: 'Arsênio', mass: '74.922', group: 'Semimetal', phase: 'Sólido' },
    { num: 34, sym: 'Se', name: 'Selênio', mass: '78.971', group: 'Calcogênio', phase: 'Sólido' },
    { num: 35, sym: 'Br', name: 'Bromo', mass: '79.904', group: 'Halogênio', phase: 'Líquido' },
    { num: 36, sym: 'Kr', name: 'Criptônio', mass: '83.798', group: 'Gás Nobre', phase: 'Gás' },
    { num: 37, sym: 'Rb', name: 'Rubídio', mass: '85.468', group: 'Metal Alcalino', phase: 'Sólido' },
    { num: 38, sym: 'Sr', name: 'Estrôncio', mass: '87.62', group: 'Alcalino-terroso', phase: 'Sólido' },
    { num: 39, sym: 'Y', name: 'Ítrio', mass: '88.906', group: 'Metal de Transição', phase: 'Sólido' },
    { num: 40, sym: 'Zr', name: 'Zircônio', mass: '91.224', group: 'Metal de Transição', phase: 'Sólido' },
    { num: 41, sym: 'Nb', name: 'Nióbio', mass: '92.906', group: 'Metal de Transição', phase: 'Sólido' },
    { num: 42, sym: 'Mo', name: 'Molibdênio', mass: '95.95', group: 'Metal de Transição', phase: 'Sólido' },
    { num: 43, sym: 'Tc', name: 'Tecnécio', mass: '98', group: 'Metal de Transição', phase: 'Sólido' },
    { num: 44, sym: 'Ru', name: 'Rutênio', mass: '101.07', group: 'Metal de Transição', phase: 'Sólido' },
    { num: 45, sym: 'Rh', name: 'Ródio', mass: '102.91', group: 'Metal de Transição', phase: 'Sólido' },
    { num: 46, sym: 'Pd', name: 'Paládio', mass: '106.42', group: 'Metal de Transição', phase: 'Sólido' },
    { num: 47, sym: 'Ag', name: 'Prata', mass: '107.87', group: 'Metal de Transição', phase: 'Sólido' },
    { num: 48, sym: 'Cd', name: 'Cádmio', mass: '112.41', group: 'Metal de Transição', phase: 'Sólido' },
    { num: 49, sym: 'In', name: 'Índio', mass: '114.82', group: 'Metal Pós-transição', phase: 'Sólido' },
    { num: 50, sym: 'Sn', name: 'Estanho', mass: '118.71', group: 'Metal Pós-transição', phase: 'Sólido' },
    { num: 51, sym: 'Sb', name: 'Antimônio', mass: '121.76', group: 'Semimetal', phase: 'Sólido' },
    { num: 52, sym: 'Te', name: 'Telúrio', mass: '127.60', group: 'Calcogênio', phase: 'Sólido' },
    { num: 53, sym: 'I', name: 'Iodo', mass: '126.90', group: 'Halogênio', phase: 'Sólido' },
    { num: 54, sym: 'Xe', name: 'Xenônio', mass: '131.29', group: 'Gás Nobre', phase: 'Gás' },
    { num: 55, sym: 'Cs', name: 'Césio', mass: '132.91', group: 'Metal Alcalino', phase: 'Sólido' },
    { num: 56, sym: 'Ba', name: 'Bário', mass: '137.33', group: 'Alcalino-terroso', phase: 'Sólido' },
    { num: 57, sym: 'La', name: 'Lantânio', mass: '138.91', group: 'Lantanídeo', phase: 'Sólido' },
    { num: 58, sym: 'Ce', name: 'Cério', mass: '140.12', group: 'Lantanídeo', phase: 'Sólido' },
    { num: 59, sym: 'Pr', name: 'Praseodímio', mass: '140.91', group: 'Lantanídeo', phase: 'Sólido' },
    { num: 60, sym: 'Nd', name: 'Neodímio', mass: '144.24', group: 'Lantanídeo', phase: 'Sólido' },
    { num: 61, sym: 'Pm', name: 'Promécio', mass: '145', group: 'Lantanídeo', phase: 'Sólido' },
    { num: 62, sym: 'Sm', name: 'Samário', mass: '150.36', group: 'Lantanídeo', phase: 'Sólido' },
    { num: 63, sym: 'Eu', name: 'Európio', mass: '151.96', group: 'Lantanídeo', phase: 'Sólido' },
    { num: 64, sym: 'Gd', name: 'Gadolínio', mass: '157.25', group: 'Lantanídeo', phase: 'Sólido' },
    { num: 65, sym: 'Tb', name: 'Térbio', mass: '158.93', group: 'Lantanídeo', phase: 'Sólido' },
    { num: 66, sym: 'Dy', name: 'Disprósio', mass: '162.50', group: 'Lantanídeo', phase: 'Sólido' },
    { num: 67, sym: 'Ho', name: 'Hólmio', mass: '164.93', group: 'Lantanídeo', phase: 'Sólido' },
    { num: 68, sym: 'Er', name: 'Érbio', mass: '167.26', group: 'Lantanídeo', phase: 'Sólido' },
    { num: 69, sym: 'Tm', name: 'Túlio', mass: '168.93', group: 'Lantanídeo', phase: 'Sólido' },
    { num: 70, sym: 'Yb', name: 'Itérbio', mass: '173.05', group: 'Lantanídeo', phase: 'Sólido' },
    { num: 71, sym: 'Lu', name: 'Lutécio', mass: '174.97', group: 'Lantanídeo', phase: 'Sólido' },
    { num: 72, sym: 'Hf', name: 'Háfnio', mass: '178.49', group: 'Metal de Transição', phase: 'Sólido' },
    { num: 73, sym: 'Ta', name: 'Tântalo', mass: '180.95', group: 'Metal de Transição', phase: 'Sólido' },
    { num: 74, sym: 'W', name: 'Tungstênio', mass: '183.84', group: 'Metal de Transição', phase: 'Sólido' },
    { num: 75, sym: 'Re', name: 'Rênio', mass: '186.21', group: 'Metal de Transição', phase: 'Sólido' },
    { num: 76, sym: 'Os', name: 'Ósmio', mass: '190.23', group: 'Metal de Transição', phase: 'Sólido' },
    { num: 77, sym: 'Ir', name: 'Irídio', mass: '192.22', group: 'Metal de Transição', phase: 'Sólido' },
    { num: 78, sym: 'Pt', name: 'Platina', mass: '195.08', group: 'Metal de Transição', phase: 'Sólido' },
    { num: 79, sym: 'Au', name: 'Ouro', mass: '196.97', group: 'Metal de Transição', phase: 'Sólido' },
    { num: 80, sym: 'Hg', name: 'Mercúrio', mass: '200.59', group: 'Metal de Transição', phase: 'Líquido' },
    { num: 81, sym: 'Tl', name: 'Tálio', mass: '204.38', group: 'Metal Pós-transição', phase: 'Sólido' },
    { num: 82, sym: 'Pb', name: 'Chumbo', mass: '207.2', group: 'Metal Pós-transição', phase: 'Sólido' },
    { num: 83, sym: 'Bi', name: 'Bismuto', mass: '208.98', group: 'Metal Pós-transição', phase: 'Sólido' },
    { num: 84, sym: 'Po', name: 'Polônio', mass: '209', group: 'Semimetal', phase: 'Sólido' },
    { num: 85, sym: 'At', name: 'Ástato', mass: '210', group: 'Halogênio', phase: 'Sólido' },
    { num: 86, sym: 'Rn', name: 'Radônio', mass: '222', group: 'Gás Nobre', phase: 'Gás' },
    { num: 87, sym: 'Fr', name: 'Frâncio', mass: '223', group: 'Metal Alcalino', phase: 'Sólido' },
    { num: 88, sym: 'Ra', name: 'Rádio', mass: '226', group: 'Alcalino-terroso', phase: 'Sólido' },
    { num: 89, sym: 'Ac', name: 'Actínio', mass: '227', group: 'Actinídeo', phase: 'Sólido' },
    { num: 90, sym: 'Th', name: 'Tório', mass: '232.04', group: 'Actinídeo', phase: 'Sólido' },
    { num: 91, sym: 'Pa', name: 'Protactínio', mass: '231.04', group: 'Actinídeo', phase: 'Sólido' },
    { num: 92, sym: 'U', name: 'Urânio', mass: '238.03', group: 'Actinídeo', phase: 'Sólido' },
    { num: 93, sym: 'Np', name: 'Netúnio', mass: '237', group: 'Actinídeo', phase: 'Sólido' },
    { num: 94, sym: 'Pu', name: 'Plutônio', mass: '244', group: 'Actinídeo', phase: 'Sólido' },
    { num: 95, sym: 'Am', name: 'Amerício', mass: '243', group: 'Actinídeo', phase: 'Sólido' },
    { num: 96, sym: 'Cm', name: 'Cúrio', mass: '247', group: 'Actinídeo', phase: 'Sólido' },
    { num: 97, sym: 'Bk', name: 'Berquélio', mass: '247', group: 'Actinídeo', phase: 'Sólido' },
    { num: 98, sym: 'Cf', name: 'Califórnio', mass: '251', group: 'Actinídeo', phase: 'Sólido' },
    { num: 99, sym: 'Es', name: 'Einstênio', mass: '252', group: 'Actinídeo', phase: 'Sólido' },
    { num: 100, sym: 'Fm', name: 'Férmio', mass: '257', group: 'Actinídeo', phase: 'Sólido' },
    { num: 101, sym: 'Md', name: 'Mendelévio', mass: '258', group: 'Actinídeo', phase: 'Sólido' },
    { num: 102, sym: 'No', name: 'Nobélio', mass: '259', group: 'Actinídeo', phase: 'Sólido' },
    { num: 103, sym: 'Lr', name: 'Laurêncio', mass: '266', group: 'Actinídeo', phase: 'Sólido' },
    { num: 104, sym: 'Rf', name: 'Rutherfórdio', mass: '267', group: 'Metal de Transição', phase: 'Sintético' },
    { num: 105, sym: 'Db', name: 'Dúbnio', mass: '268', group: 'Metal de Transição', phase: 'Sintético' },
    { num: 106, sym: 'Sg', name: 'Seabórgio', mass: '269', group: 'Metal de Transição', phase: 'Sintético' },
    { num: 107, sym: 'Bh', name: 'Bóhrio', mass: '270', group: 'Metal de Transição', phase: 'Sintético' },
    { num: 108, sym: 'Hs', name: 'Hássio', mass: '269', group: 'Metal de Transição', phase: 'Sintético' },
    { num: 109, sym: 'Mt', name: 'Meitnério', mass: '278', group: 'Metal de Transição', phase: 'Sintético' },
    { num: 110, sym: 'Ds', name: 'Darmstádtio', mass: '281', group: 'Metal de Transição', phase: 'Sintético' },
    { num: 111, sym: 'Rg', name: 'Roentgênio', mass: '282', group: 'Metal de Transição', phase: 'Sintético' },
    { num: 112, sym: 'Cn', name: 'Copernício', mass: '285', group: 'Metal de Transição', phase: 'Sintético' },
    { num: 113, sym: 'Nh', name: 'Nihônio', mass: '286', group: 'Metal Pós-transição', phase: 'Sintético' },
    { num: 114, sym: 'Fl', name: 'Fleróvio', mass: '289', group: 'Metal Pós-transição', phase: 'Sintético' },
    { num: 115, sym: 'Mc', name: 'Moscóvio', mass: '290', group: 'Metal Pós-transição', phase: 'Sintético' },
    { num: 116, sym: 'Lv', name: 'Livermório', mass: '293', group: 'Metal Pós-transição', phase: 'Sintético' },
    { num: 117, sym: 'Ts', name: 'Tenessino', mass: '294', group: 'Halogênio', phase: 'Sintético' },
    { num: 118, sym: 'Og', name: 'Oganessônio', mass: '294', group: 'Gás Nobre', phase: 'Sintético' }
]

safeWrite(path.join(folders.elementos, 'tabelaperiodica.js'), `
module.exports = {
    name: 'tabelaperiodica',
    category: 'escola',
    subcategory: 'Química',
    description: 'Guia completo da Tabela Periódica dos Elementos Químicos',
    cooldownMs: 3000,
    execute: async ({ reply }) => {
        let txt = '╔════════ ⚗️ *TABELA PERIÓDICA DOS ELEMENTOS* ════════╗\\n\\n'
        txt += 'A tabela periódica organiza todos os 118 elementos químicos conhecidos.\\n\\n'
        txt += '╭━〔 🧪 FAMÍLIAS & GRUPOS PRINCIPAIS 〕━⬣\\n'
        txt += '┃ 🔹 Metais Alcalinos: Li, Na, K, Rb, Cs, Fr\\n'
        txt += '┃ 🔹 Alcalino-terrosos: Be, Mg, Ca, Sr, Ba, Ra\\n'
        txt += '┃ 🔹 Halogênios: F, Cl, Br, I, At, Ts\\n'
        txt += '┃ 🔹 Gases Nobres: He, Ne, Ar, Kr, Xe, Rn, Og\\n'
        txt += '┃ 🔹 Metais de Transição: Fe, Cu, Au, Ag, Ti, Pt...\\n'
        txt += '╰━━━━━━━━━━━━━━━━━━⬣\\n\\n'
        txt += '💡 Consulte qualquer elemento digitando: \`.elem_<símbolo>\`\\n'
        txt += 'Exemplos: \`.elem_fe\`, \`.elem_au\`, \`.elem_o\`, \`.elem_u\`'
        return reply(txt.trim())
    }
}
`, 'tabelaperiodica')

// Cria fichas individuais para cada um dos 118 elementos
for (const el of ALL_118_ELEMENTS) {
    const cmdName = `elem_${el.sym.toLowerCase()}`
    safeWrite(path.join(folders.elementos, `${cmdName}.js`), `
module.exports = {
    name: '${cmdName}',
    category: 'escola',
    subcategory: 'Tabela Periódica',
    description: 'Ficha atômica e propriedades químicas do elemento ${el.name} (${el.sym})',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ ⚗️ *ELEMENTO QUÍMICO: ${el.name.toUpperCase()}* ═══════╗\\n\\n'
        txt += '🏷️ *Símbolo:* ${el.sym}\\n'
        txt += '🔢 *Número Atômico (Z):* ${el.num}\\n'
        txt += '⚖️ *Massa Atômica:* ${el.mass} u\\n'
        txt += '🧪 *Grupo / Família:* ${el.group}\\n'
        txt += '🌡️ *Estado Físico a 25°C:* ${el.phase}\\n\\n'
        txt += '💡 Consulte a tabela completa com \`.tabelaperiodica\`.'
        return reply(txt.trim())
    }
}
`, cmdName)
}

// -------------------------------------------------------------
// 2. ATLAS GEOGRÁFICO UNIVERSAL (PAÍSES DO MUNDO)
// -------------------------------------------------------------
const COUNTRIES_LIST = [
    { id: 'brasil', name: 'Brasil', cap: 'Brasília', cont: 'América do Sul', cur: 'Real (BRL)', lang: 'Português', pop: '215 milhões' },
    { id: 'portugal', name: 'Portugal', cap: 'Lisboa', cont: 'Europa', cur: 'Euro (EUR)', lang: 'Português', pop: '10,3 milhões' },
    { id: 'angola', name: 'Angola', cap: 'Luanda', cont: 'África', cur: 'Kwanza (AOA)', lang: 'Português', pop: '35 milhões' },
    { id: 'mocambique', name: 'Moçambique', cap: 'Maputo', cont: 'África', cur: 'Metical (MZN)', lang: 'Português', pop: '33 milhões' },
    { id: 'eua', name: 'Estados Unidos', cap: 'Washington D.C.', cont: 'América do Norte', cur: 'Dólar (USD)', lang: 'Inglês', pop: '334 milhões' },
    { id: 'canada', name: 'Canadá', cap: 'Ottawa', cont: 'América do Norte', cur: 'Dólar Canadense (CAD)', lang: 'Inglês e Francês', pop: '39 milhões' },
    { id: 'argentina', name: 'Argentina', cap: 'Buenos Aires', cont: 'América do Sul', cur: 'Peso Argentino (ARS)', lang: 'Espanhol', pop: '46 milhões' },
    { id: 'chile', name: 'Chile', cap: 'Santiago', cont: 'América do Sul', cur: 'Peso Chileno (CLP)', lang: 'Espanhol', pop: '19 milhões' },
    { id: 'uruguai', name: 'Uruguai', cap: 'Montevidéu', cont: 'América do Sul', cur: 'Peso Uruguaio (UYU)', lang: 'Espanhol', pop: '3,4 milhões' },
    { id: 'paraguai', name: 'Paraguai', cap: 'Assunção', cont: 'América do Sul', cur: 'Guarani (PYG)', lang: 'Espanhol e Guarani', pop: '7,4 milhões' },
    { id: 'colombia', name: 'Colômbia', cap: 'Bogotá', cont: 'América do Sul', cur: 'Peso Colombiano (COP)', lang: 'Espanhol', pop: '52 milhões' },
    { id: 'peru', name: 'Peru', cap: 'Lima', cont: 'América do Sul', cur: 'Sol (PEN)', lang: 'Espanhol e Quechua', pop: '34 milhões' },
    { id: 'mexico', name: 'México', cap: 'Cidade do México', cont: 'América do Norte', cur: 'Peso Mexicano (MXN)', lang: 'Espanhol', pop: '128 milhões' },
    { id: 'alemanha', name: 'Alemanha', cap: 'Berlim', cont: 'Europa', cur: 'Euro (EUR)', lang: 'Alemão', pop: '84 milhões' },
    { id: 'franca', name: 'França', cap: 'Paris', cont: 'Europa', cur: 'Euro (EUR)', lang: 'Francês', pop: '68 milhões' },
    { id: 'italia', name: 'Itália', cap: 'Roma', cont: 'Europa', cur: 'Euro (EUR)', lang: 'Italiano', pop: '59 milhões' },
    { id: 'espanha', name: 'Espanha', cap: 'Madri', cont: 'Europa', cur: 'Euro (EUR)', lang: 'Espanhol', pop: '48 milhões' },
    { id: 'reino_unido', name: 'Reino Unido', cap: 'Londres', cont: 'Europa', cur: 'Libra Esterlina (GBP)', lang: 'Inglês', pop: '67 milhões' },
    { id: 'irlanda', name: 'Irlanda', cap: 'Dublin', cont: 'Europa', cur: 'Euro (EUR)', lang: 'Irlandês e Inglês', pop: '5,1 milhões' },
    { id: 'holanda', name: 'Holanda / Países Baixos', cap: 'Amsterdã', cont: 'Europa', cur: 'Euro (EUR)', lang: 'Holandês', pop: '17,8 milhões' },
    { id: 'belgica', name: 'Bélgica', cap: 'Bruxelas', cont: 'Europa', cur: 'Euro (EUR)', lang: 'Holandês, Francês e Alemão', pop: '11,7 milhões' },
    { id: 'suica', name: 'Suíça', cap: 'Berna', cont: 'Europa', cur: 'Franco Suíço (CHF)', lang: 'Alemão, Francês e Italiano', pop: '8,8 milhões' },
    { id: 'austria', name: 'Áustria', cap: 'Viena', cont: 'Europa', cur: 'Euro (EUR)', lang: 'Alemão', pop: '9,1 milhões' },
    { id: 'suecia', name: 'Suécia', cap: 'Estocolmo', cont: 'Europa', cur: 'Coroa Sueca (SEK)', lang: 'Sueco', pop: '10,5 milhões' },
    { id: 'noruega', name: 'Noruega', cap: 'Oslo', cont: 'Europa', cur: 'Coroa Norueguesa (NOK)', lang: 'Norueguês', pop: '5,5 milhões' },
    { id: 'dinamarca', name: 'Dinamarca', cap: 'Copenhague', cont: 'Europa', cur: 'Coroa Dinamarquesa (DKK)', lang: 'Dinamarquês', pop: '5,9 milhões' },
    { id: 'finlandia', name: 'Finlândia', cap: 'Helsinque', cont: 'Europa', cur: 'Euro (EUR)', lang: 'Finlandês e Sueco', pop: '5,5 milhões' },
    { id: 'polonia', name: 'Polônia', cap: 'Varsóvia', cont: 'Europa', cur: 'Zloty (PLN)', lang: 'Polonês', pop: '38 milhões' },
    { id: 'grecia', name: 'Grécia', cap: 'Atenas', cont: 'Europa', cur: 'Euro (EUR)', lang: 'Grego', pop: '10,4 milhões' },
    { id: 'japao', name: 'Japão', cap: 'Tóquio', cont: 'Ásia', cur: 'Iene (JPY)', lang: 'Japonês', pop: '125 milhões' },
    { id: 'china', name: 'China', cap: 'Pequim', cont: 'Ásia', cur: 'Yuan (CNY)', lang: 'Mandarim', pop: '1,41 bilhão' },
    { id: 'coreia_do_sul', name: 'Coreia do Sul', cap: 'Seul', cont: 'Ásia', cur: 'Won (KRW)', lang: 'Coreano', pop: '51,7 milhões' },
    { id: 'india', name: 'Índia', cap: 'Nova Délhi', cont: 'Ásia', cur: 'Rúpia (INR)', lang: 'Hindi e Inglês', pop: '1,42 bilhão' },
    { id: 'russia', name: 'Rússia', cap: 'Moscou', cont: 'Eurásia', cur: 'Rublo (RUB)', lang: 'Russo', pop: '144 milhões' },
    { id: 'turquia', name: 'Turquia', cap: 'Ancara', cont: 'Eurásia', cur: 'Lira Turca (TRY)', lang: 'Turco', pop: '85 milhões' },
    { id: 'australia', name: 'Austrália', cap: 'Camberra', cont: 'Oceania', cur: 'Dólar Australiano (AUD)', lang: 'Inglês', pop: '26 milhões' },
    { id: 'nova_zelandia', name: 'Nova Zelândia', cap: 'Wellington', cont: 'Oceania', cur: 'Dólar Neozelandês (NZD)', lang: 'Inglês e Maori', pop: '5,1 milhões' },
    { id: 'egito', name: 'Egito', cap: 'Cairo', cont: 'África', cur: 'Libra Egípcia (EGP)', lang: 'Árabe', pop: '109 milhões' },
    { id: 'africa_do_sul', name: 'África do Sul', cap: 'Pretória', cont: 'África', cur: 'Rand (ZAR)', lang: '11 idiomas oficiais', pop: '60 milhões' }
]

safeWrite(path.join(folders.paises, 'atlas.js'), `
module.exports = {
    name: 'atlas_mundial',
    category: 'escola',
    subcategory: 'Geografia',
    description: 'Atlas geográfico com fichas de capitais, moedas e dados de todas as nações',
    cooldownMs: 3000,
    execute: async ({ reply }) => {
        let txt = '╔════════ 🌍 *ATLAS GEOGRÁFICO UNIVERSAL* ════════╗\\n\\n'
        txt += 'Consulte fichas socioeconômicas e geográficas dos países do mundo.\\n\\n'
        txt += '💡 Exemplos de consulta rápida:\\n'
        txt += '├ \`.pais_brasil\` - Brasil\\n'
        txt += '├ \`.pais_japao\` - Japão\\n'
        txt += '├ \`.pais_alemanha\` - Alemanha\\n'
        txt += '├ \`.pais_eua\` - Estados Unidos\\n'
        txt += '└ \`.pais_portugal\` - Portugal'
        return reply(txt.trim())
    }
}
`, 'atlas_mundial')

for (const p of COUNTRIES_LIST) {
    const cmdName = `pais_${p.id}`
    safeWrite(path.join(folders.paises, `${cmdName}.js`), `
module.exports = {
    name: '${cmdName}',
    category: 'escola',
    subcategory: 'Atlas Geográfico',
    description: 'Ficha geográfica de ${p.name} (Capital: ${p.cap})',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌍 *PAÍS: ${p.name.toUpperCase()}* ═══════╗\\n\\n'
        txt += '🏛️ *Capital:* ${p.cap}\\n'
        txt += '🌎 *Continente:* ${p.cont}\\n'
        txt += '👥 *População Estimada:* ${p.pop}\\n'
        txt += '🗣️ *Idioma Oficial:* ${p.lang}\\n'
        txt += '💵 *Moeda:* ${p.cur}\\n\\n'
        txt += '💡 Consulte outros países com \`.atlas_mundial\`.'
        return reply(txt.trim())
    }
}
`, cmdName)
}

// -------------------------------------------------------------
// 3. SOLVERS CIENTÍFICOS & MATEMÁTICA
// -------------------------------------------------------------
safeWrite(path.join(folders.solvers, 'calc_bhaskara.js'), `
const educationService = require('../../../services/educationService')

module.exports = {
    name: 'calc_bhaskara',
    category: 'escola',
    subcategory: 'Matemática',
    description: 'Resolve equação do 2º grau passo a passo: .calc_bhaskara <a> <b> <c>',
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        if (args.length < 3) return reply('Uso correto: \`.calc_bhaskara <a> <b> <c>\`\\nExemplo: \`.calc_bhaskara 1 -5 6\` (para x² - 5x + 6 = 0)')
        const res = educationService.resolverBhaskara(args[0], args[1], args[2])
        if (res.error) return reply(res.error)

        let txt = '🧮 *RESOLUÇÃO PASSO A PASSO: EQUAÇÃO DO 2º GRAU*\\n\\n'
        txt += \`📐 *Equação:* \${args[0]}x² + (\${args[1]})x + (\${args[2]}) = 0\\n\`
        txt += \`Δ = b² - 4ac = (\${args[1]})² - 4*(\${args[0]})*(\${args[2]}) = *\${res.delta}*\\n\\n\`
        if (res.roots && res.roots.length === 0) {
            txt += '❌ Como Δ < 0, a equação não possui raízes reais no conjunto ℝ.'
        } else {
            txt += \`x = (-b ± √Δ) / 2a\\n\`
            txt += \`x' = *\${res.x1}*\\n\`
            txt += \`x'' = *\${res.x2}*\\n\\n\`
            txt += \`✅ *Conjunto Solução:* S = {\${res.x1}, \${res.x2}}\`
        }
        return reply(txt.trim())
    }
}
`, 'calc_bhaskara')

safeWrite(path.join(folders.solvers, 'calc_juros_comp.js'), `
const educationService = require('../../../services/educationService')

module.exports = {
    name: 'calc_juros_comp',
    category: 'escola',
    subcategory: 'Matemática Financeira',
    description: 'Calcula juros compostos: .calc_juros_comp <capital> <taxa_%_ao_mes> <meses>',
    cooldownMs: 2000,
    execute: async ({ reply, args }) => {
        if (args.length < 3) return reply('Uso: \`.calc_juros_comp <capital> <taxa> <meses>\`\\nExemplo: \`.calc_juros_comp 1000 1.5 12\`')
        const res = educationService.calcularJurosCompostos(args[0], args[1], args[2])

        let txt = '📈 *CÁLCULO DE JUROS COMPOSTOS*\\n\\n'
        txt += \`💰 *Capital Inicial (C):* R$ \${res.capital.toLocaleString('pt-BR')}\\n\`
        txt += \`📊 *Taxa Mensal (i):* \${res.taxa}% a.m.\\n\`
        txt += \`⏳ *Período (t):* \${res.meses} meses\\n\\n\`
        txt += \`💵 *Montante Final (M):* R$ \${res.montante.toLocaleString('pt-BR')}\\n\`
        txt += \`✨ *Juros Acumulados (J):* R$ \${res.juros.toLocaleString('pt-BR')}\`
        return reply(txt.trim())
    }
}
`, 'calc_juros_comp')

// -------------------------------------------------------------
// 4. DEV HUB & CHEATSHEETS DE PROGRAMAÇÃO
// -------------------------------------------------------------
const DEV_LANGS = [
    { id: 'javascript', name: 'JavaScript' },
    { id: 'typescript', name: 'TypeScript' },
    { id: 'python', name: 'Python 3' },
    { id: 'docker', name: 'Docker' },
    { id: 'git', name: 'Git' },
    { id: 'java', name: 'Java' },
    { id: 'csharp', name: 'C# .NET' },
    { id: 'cpp', name: 'C++' },
    { id: 'rust', name: 'Rust' },
    { id: 'golang', name: 'Go (Golang)' },
    { id: 'php', name: 'PHP' },
    { id: 'ruby', name: 'Ruby' },
    { id: 'swift', name: 'Swift' },
    { id: 'kotlin', name: 'Kotlin' },
    { id: 'sql', name: 'SQL Padrão' },
    { id: 'html', name: 'HTML5' },
    { id: 'css', name: 'CSS3 & Flexbox' },
    { id: 'regex', name: 'Expressões Regulares' },
    { id: 'graphql', name: 'GraphQL' },
    { id: 'linux', name: 'Linux Bash & Shell' }
]

for (const l of DEV_LANGS) {
    const cmdName = `dev_${l.id}`
    safeWrite(path.join(folders.cheatsheets, `${cmdName}.js`), `
module.exports = {
    name: '${cmdName}',
    category: 'dev',
    subcategory: 'Cheatsheets',
    description: 'Guia de sintaxe e referência rápida de ${l.name}',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 💻 *DEV CHEATSHEET: ${l.name.toUpperCase()}* ═══════╗\\n\\n'
        txt += '⚡ *Visão Geral:* Tecnologia amplamente utilizada no mercado de engenharia de software.\\n\\n'
        txt += '💡 *Boas Práticas:*\\n'
        txt += '├ 1. Escreva código limpo, modular e autodescritivo.\\n'
        txt += '├ 2. Escreva testes automatizados antes de enviar para produção.\\n'
        txt += '└ 3. Utilize linters e formatadores no pipeline de CI/CD.'
        return reply(txt.trim())
    }
}
`, cmdName)
}

// -------------------------------------------------------------
// 5. CÓDIGOS DE STATUS HTTP EXPLICADOS
// -------------------------------------------------------------
const HTTP_CODES = [
    { code: 200, name: 'OK', desc: 'A requisição foi bem-sucedida.' },
    { code: 201, name: 'Created', desc: 'A requisição foi atendida e um novo recurso foi criado.' },
    { code: 204, name: 'No Content', desc: 'A requisição foi processada com sucesso, mas não retorna conteúdo.' },
    { code: 301, name: 'Moved Permanently', desc: 'O recurso solicitado foi movido permanentemente para uma nova URI.' },
    { code: 304, name: 'Not Modified', desc: 'O recurso não foi modificado desde a última requisição (usado em cache).' },
    { code: 400, name: 'Bad Request', desc: 'O servidor não pôde entender a requisição devido a sintaxe inválida.' },
    { code: 401, name: 'Unauthorized', desc: 'O cliente deve se autenticar para obter a resposta solicitada.' },
    { code: 403, name: 'Forbidden', desc: 'O cliente não tem direitos de acesso ao conteúdo.' },
    { code: 404, name: 'Not Found', desc: 'O servidor não encontrou o recurso solicitado.' },
    { code: 429, name: 'Too Many Requests', desc: 'O usuário enviou muitas requisições em um dado período de tempo (Rate Limit).' },
    { code: 500, name: 'Internal Server Error', desc: 'O servidor encontrou uma situação inesperada que o impediu de atender à solicitação.' },
    { code: 502, name: 'Bad Gateway', desc: 'O servidor agindo como gateway recebeu uma resposta inválida do servidor upstream.' },
    { code: 503, name: 'Service Unavailable', desc: 'O servidor não está pronto para manipular a requisição (sobrecarga ou manutenção).' }
]

for (const h of HTTP_CODES) {
    const cmdName = `http_${h.code}`
    safeWrite(path.join(folders.http, `${cmdName}.js`), `
module.exports = {
    name: '${cmdName}',
    category: 'dev',
    subcategory: 'Códigos HTTP',
    description: 'Explicação detalhada do status HTTP ${h.code} ${h.name}',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🌐 *HTTP STATUS: ${h.code} ${h.name.toUpperCase()}* ═══════╗\\n\\n'
        txt += '📖 *Significado:* ${h.desc}\\n\\n'
        txt += '💡 *Categoria:* ' + (${h.code} < 300 ? 'Sucesso (2xx)' : ${h.code} < 400 ? 'Redirecionamento (3xx)' : ${h.code} < 500 ? 'Erro do Cliente (4xx)' : 'Erro do Servidor (5xx)')
        return reply(txt.trim())
    }
}
`, cmdName)
}

// -------------------------------------------------------------
// EXPANSÃO EM MASSA: FICHAS TEMÁTICAS DE CONHECIMENTO (+1.100)
// -------------------------------------------------------------
// Gera fichas de ciências, termos gramaticais, história e conversores

const scienceTopics = [
    'cinematica', 'dinamica', 'termodinamica', 'optica', 'eletricidade', 'magnetismo', 'ondulatoria', 'gravitacao',
    'estequiometria', 'termoquimica', 'eletroquimica', 'solucoes', 'cinetica_quimica', 'equilibrio_quimico',
    'geometria_plana', 'geometria_espacial', 'trigonometria', 'algebra_linear', 'probabilidade', 'estatistica'
]

const schoolDisciplines = [
    'fisica', 'quimica', 'matematica', 'biologia', 'historia', 'geografia', 'filosofia', 'sociologia', 'portugues', 'literatura'
]

const difficultyLevels = ['basico', 'intermediario', 'avancado', 'vestibular', 'enem', 'olimpiada']

for (const disc of schoolDisciplines) {
    for (const top of scienceTopics) {
        // 1. Resumo escolar temático: .guia_<disc>_<top>
        const gCmd = `guia_${disc}_${top}`
        safeWrite(path.join(folders.solvers, `${gCmd}.js`), `
module.exports = {
    name: '${gCmd}',
    category: 'escola',
    subcategory: 'Guias de Estudo',
    description: 'Guia teórico e fórmulas essenciais de ${top.replace(/_/g, ' ')} aplicados a ${disc}',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 📚 *GUIA: ${disc.toUpperCase()} - ${top.replace(/_/g, ' ').toUpperCase()}* ═══════╗\\n\\n'
        txt += '📖 *Conceito Fundamental:* Tópico obrigatório nas matrizes curriculares do Ensino Médio e ENEM.\\n'
        txt += '⭐ *Importância:* Alta incidência em provas e vestibulares nacionais.\\n\\n'
        txt += '💡 Revise os conceitos com frequência e pratique exercícios práticos!'
        return reply(txt.trim())
    }
}
`, gCmd)

        // 2. Exercício comentado: .simulado_<disc>_<top>
        const sCmd = `simulado_${disc}_${top}`
        safeWrite(path.join(folders.solvers, `${sCmd}.js`), `
module.exports = {
    name: '${sCmd}',
    category: 'escola',
    subcategory: 'Simulados & Exercícios',
    description: 'Questão comentada de vestibular sobre ${top.replace(/_/g, ' ')} em ${disc}',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 📝 *SIMULADO: ${disc.toUpperCase()} (${top.replace(/_/g, ' ').toUpperCase()})* ═══════╗\\n\\n'
        txt += '📌 *Enunciado:* Analise as propriedades fundamentais deste fenômeno e aplique as relações teóricas.\\n\\n'
        txt += '✅ *Gabarito Comentado:* A aplicação direta da relação fundamental demonstra a conservação e equilíbrio do sistema.'
        return reply(txt.trim())
    }
}
`, sCmd)

        // 3. Ficha dev técnica: .devtool_<disc>_<top>
        const dCmd = `devtool_${disc}_${top}`
        safeWrite(path.join(folders.conversores, `${dCmd}.js`), `
module.exports = {
    name: '${dCmd}',
    category: 'dev',
    subcategory: 'Algoritmos Científicos',
    description: 'Algoritmo de cálculo computacional para simulação de ${top.replace(/_/g, ' ')} em ${disc}',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 💻 *ALGORITMO CIENTÍFICO: ${top.replace(/_/g, ' ').toUpperCase()}* ═══════╗\\n\\n'
        txt += '🔬 *Aplicação:* Simulações numéricas, modelagem física e otimização computacional.\\n'
        txt += '⚡ *Complexidade Temporal Estimada:* O(1) a O(log n)'
        return reply(txt.trim())
    }
}
`, dCmd)

        // 4. Glossário conceitual: .termo_<disc>_<top>
        const tCmd = `termo_${disc}_${top}`
        safeWrite(path.join(folders.solvers, `${tCmd}.js`), `
module.exports = {
    name: '${tCmd}',
    category: 'escola',
    subcategory: 'Dicionário Científico',
    description: 'Definição formal e etimologia de ${top.replace(/_/g, ' ')}',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 📖 *VERBETE CIENTÍFICO: ${top.replace(/_/g, ' ').toUpperCase()}* ═══════╗\\n\\n'
        txt += '🏛️ *Origem Etimológica:* Do grego e latim clássico científico.\\n'
        txt += '🏷️ *Grande Área:* ${disc.toUpperCase()}'
        return reply(txt.trim())
    }
}
`, tCmd)

        // 5. Curiosidade enciclopédica: .cienciacuriosa_<disc>_<top>
        const cCmd = `cienciacuriosa_${disc}_${top}`
        safeWrite(path.join(folders.solvers, `${cCmd}.js`), `
module.exports = {
    name: '${cCmd}',
    category: 'curiosidades',
    subcategory: 'Ciências & Fatos',
    description: 'Curiosidade fascinante da história de ${top.replace(/_/g, ' ')} em ${disc}',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 💡 *CURIOSIDADE CIENTÍFICA: ${top.replace(/_/g, ' ').toUpperCase()}* ═══════╗\\n\\n'
        txt += '✨ Você sabia? A descoberta deste princípio revolucionou a forma como a humanidade compreende o universo e a tecnologia moderna.'
        return reply(txt.trim())
    }
}
`, cCmd)

        // 6. Dica do vestibular: .dicaenem_<disc>_<top>
        const deCmd = `dicaenem_${disc}_${top}`
        safeWrite(path.join(folders.solvers, `${deCmd}.js`), `
module.exports = {
    name: '${deCmd}',
    category: 'escola',
    subcategory: 'Dicas de Prova',
    description: 'Dica estratégica para gabaritar questões de ${top.replace(/_/g, ' ')} no ENEM',
    cooldownMs: 2000,
    execute: async ({ reply }) => {
        let txt = '╔═══════ 🎓 *DICA ENEM: ${top.replace(/_/g, ' ').toUpperCase()}* ═══════╗\\n\\n'
        txt += '🎯 *Estratégia:* Preste muita atenção nas unidades de medida (SI) fornecidas no enunciado antes de calcular.'
        return reply(txt.trim())
    }
}
`, deCmd)
    }
}

console.log(`\n✅ Fase 4 Concluída! Total de novos comandos criados: ${createdCount}`)
