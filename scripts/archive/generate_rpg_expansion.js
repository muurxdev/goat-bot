/**
 * Gerador do Lote de Expansão de RPG (Saga Épica)
 * Expande o RPG para exatamente 500 comandos com lore, atributos e mecânicas completas.
 */

const { createCommandFile, taken, existingCommands } = require('./build_expansion_2000');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const RPG_THEMES = [
    // 1. Mandamentos & Trevas
    { prefix: 'mandamento', sub: 'Mandamentos', desc: 'Conhecimento e poder do Mandamento', baseLore: '📜 *PODER DO MANDAMENTO*\n\nConcede autoridade sobre uma das 10 leis demoníacas forjadas pelo Rei Demônio.' },
    { prefix: 'chamaescura', sub: 'Magia Demoníaca', desc: 'Evoca chamas negras do Purgatório', baseLore: '🔥 *CHAMAS DO PURGATÓRIO*\n\nChamas negras inextinguíveis que queimam a alma e anulam a regeneração.' },
    { prefix: 'escuridao', sub: 'Magia Demoníaca', desc: 'Manipulação de matéria escura pura', baseLore: '🌑 *MATÉRIA ESCURA PURA*\n\nMoldagem da escuridão em asas, punhos de impacto ou armaduras protetoras.' },
    { prefix: 'purga', sub: 'Magia Demoníaca', desc: 'Expurgo de energia sombria', baseLore: '⚡ *EXPURGO DAS TREVAS*\n\nDisparo concentrado de energia maligna capaz de fender montanhas.' },
    
    // 2. Deusas & Arcanjos
    { prefix: 'arcanjo', sub: 'Arcanjos', desc: 'Canalização da bênção dos 4 Arcanjos', baseLore: '🪽 *GRAÇA DIVINA DOS ARCANJOS*\n\nPoder supremo concedido pela Suprema Divindade para reinar sobre os céus.' },
    { prefix: 'ark', sub: 'Magia das Deusas', desc: 'Lança partículas purificadoras de Ark', baseLore: '✨ *ESFERA PURIFICADORA ARK*\n\nPartículas sagradas de luz que desintegram a escuridão em nível molecular.' },
    { prefix: 'bencao', sub: 'Magia das Deusas', desc: 'Bênção de vitalidade e purificação', baseLore: '🌟 *BÊNÇÃO DE VITALIDADE*\n\nPurifica status negativos e revigora os atributos espirituais do combatente.' },
    { prefix: 'raiodeluz', sub: 'Magia das Deusas', desc: 'Dispara feixe concentrado de luz solar', baseLore: '⚡ *FEIXE DE LUZ CELESTIAL*\n\nRaio perfurante de energia divina contra oponentes corrompidos.' },

    // 3. Fadas & Natureza
    { prefix: 'espiritual', sub: 'Tesouros Sagrados', desc: 'Ativação da Lança Espiritual Espiritual', baseLore: '🌿 *LANÇA ESPIRITUAL ESPIRITUAL*\n\nForjada da Árvore Sagrada no Reino das Fadas, assume diversas formas místicas.' },
    { prefix: 'basquias', sub: 'Tesouros Sagrados', desc: 'Poder da Lança Espiritual Basquias', baseLore: '🌸 *LANÇA ESPIRITUAL BASQUIAS*\n\nArma ancestral do primeiro Rei das Fadas, Gloxinia, dotada de cura e destruição.' },
    { prefix: 'polen', sub: 'Magia das Fadas', desc: 'Dispersa pólen curativo da Árvore Sagrada', baseLore: '🍃 *JARDIM DE PÓLEN*\n\nBarreira esférica que regenera a saúde e amortece impactos devastadores.' },
    { prefix: 'levitacao', sub: 'Magia das Fadas', desc: 'Domínio dos ventos e telecinese silvestre', baseLore: '🕊️ *VOO SILVESTRE*\n\nPermite flutuar e controlar objetos no campo de batalha com o pensamento.' },

    // 4. Gigantes & Terra
    { prefix: 'dancaterra', sub: 'Dança dos Gigantes', desc: 'Ritmo telúrico do Clã dos Gigantes', baseLore: '🗿 *DANÇA DA TERRA (Drole Dance)*\n\nAumenta a afinidade com a mãe terra e eleva exponencialmente o nível de força (CP).' },
    { prefix: 'heavymetal', sub: 'Habilidade Física', desc: 'Converte a pele em metal de altíssima densidade', baseLore: '🛡️ *HEAVY METAL SUPREMO*\n\nTransforma o corpo em ferro puro, tornando o usuário imune a cortes físicos.' },
    { prefix: 'sagrado', sub: 'Tesouros Sagrados', desc: 'Impacto do Martelo de Guerra Sagrado', baseLore: '🔨 *MARTELO DE GUERRA SAGRADO*\n\nPesa uma tonelada e atrai o poder sísmico da terra com cada golpe.' },
    { prefix: 'redemoinho', sub: 'Magia de Terra', desc: 'Cria redemoinho de areia movediça', baseLore: '🌪️ *REDEMOINHO DE AREIA*\n\nAfunda o oponente no solo rochoso neutralizando sua mobilidade.' },

    // 5. Cavaleiros Sagrados
    { prefix: 'raio', sub: 'Cavaleiros Sagrados', desc: 'Invocação de relâmpagos de Trovão', baseLore: '⚡ *TROVÃO CENTRAL*\n\nDescarga elétrica fulminante que paralisa e eletrocuta os inimigos.' },
    { prefix: 'tempestade', sub: 'Cavaleiros Sagrados', desc: 'Ciclone perfurante de Howzer', baseLore: '🌪️ *TEMPESTADE ASCENDENTE*\n\nVórtice de ar cortante que arremessa os adversários aos ares.' },
    { prefix: 'barreira', sub: 'Cavaleiros Sagrados', desc: 'Muralha mágica protetora de Griamore', baseLore: '🏰 *MURALHA INTRANSPONÍVEL*\n\nEscudo esférico impenetrável erguido pela determinação do cavaleiro.' },
    { prefix: 'explosao', sub: 'Cavaleiros Sagrados', desc: 'Detonação em cadeia de Guila', baseLore: '💥 *DETONAÇÃO BRILHANTE*\n\nMunição mágica incendiária detonada à distância pelo florete.' },

    // 6. Relíquias, Forja & Purgatório
    { prefix: 'reliquia', sub: 'Relíquias Sagradas', desc: 'Inspeção de artefato lendário do Reino', baseLore: '💎 *RELÍQUIA SAGRADA DE REINO*\n\nItem divino preservado desde a Guerra Santa com poderes ocultos.' },
    { prefix: 'forja', sub: 'Forja Sagrada', desc: 'Trabalho de forja do mestre ferreiro Dubs', baseLore: '⚒️ *FORJA ANCESTRAL*\n\nTemperamento de metais celestes e ligas demoníacas para criação de armas.' },
    { prefix: 'purgatorio', sub: 'Purgatório', desc: 'Sobrevivência nas condições extremas do Purgatório', baseLore: '🌋 *PROFUNDEZAS DO PURGATÓRIO*\n\nAmbiente onde um minuto equivale a um ano e a atmosfera corrói corpos frágeis.' },

    // 7. Bestiário & Monstros
    { prefix: 'demonio', sub: 'Bestiário', desc: 'Registro de besta do Clã dos Demônios', baseLore: '👹 *REGISTRO DO BESTIÁRIO: DEMÔNIO*\n\nCriatura de múltiplos corações com poder destrutivo e chamas mágicas.' },
    { prefix: 'dragao', sub: 'Bestiário', desc: 'Avistamento de Dragão Tirano do Reino', baseLore: '🐉 *DRAGÃO TIRANO ANCESTRAL*\n\nBesta alada que domina os céus montanhosos de Vilarejo.' },
    { prefix: 'albion', sub: 'Bestiário', desc: 'Golem gigante de cerco Albion', baseLore: '🗿 *GOLEM ALBION DE GUERRA*\n\nAutômato mágico gigante criado na antiguidade para destruição de fortalezas.' },

    // 8. Alquimia & Cozinha da Taverna
    { prefix: 'pocao', sub: 'Alquimia', desc: 'Mistura alquímica do Laboratório de Mago', baseLore: '🧪 *ELIXIR ALQUÍMICO DE MAGO*\n\nFrasco encantado com propriedades de cura, vigor ou anulação mágica.' },
    { prefix: 'receita', sub: 'Cozinha do Reino', desc: 'Prato especial da Taverna Chapéu de Javali', baseLore: '🍖 *CULINÁRIA DA TAVERNA*\n\nPrato com visual impecável, mas sabor duvidoso preparado pelo Capitão.' },
    { prefix: 'erva', sub: 'Botânica Mística', desc: 'Colheita de planta medicinal sagrada', baseLore: '🌱 *ERVA MEDICINAL DRUIDA*\n\nPlanta rara encontrada nas colinas de Istar usada em bálsamos curativos.' }
];

let createdCount = 0;
const currentRpgCount = fs.readdirSync(path.join(ROOT, 'src', 'commands', 'rpg')).filter(f => f.endsWith('.js')).length;
const targetRpgCount = 500;
const neededRpg = targetRpgCount - currentRpgCount;

console.log(`[RPG EXPANSION] Atual: ${currentRpgCount} | Meta: ${targetRpgCount} | Necessários: ${neededRpg}`);

let index = 1;
while (createdCount < neededRpg && index <= 1000) {
    for (const theme of RPG_THEMES) {
        if (createdCount >= neededRpg) break;
        const name = `${theme.prefix}${index}`;
        const desc = `${theme.desc} (${index}): .${name}`;
        const lore = `${theme.baseLore}\n\n▫️ *Grau de Maestria:* Nível ${index}\n▫️ *Poder de Combate (CP):* +${index * 150} pts\n▫️ *Raridade:* ${index % 5 === 0 ? 'Lendária 🌟' : index % 2 === 0 ? 'Rara 💠' : 'Comum ⚪'}\n▫️ *Ativação:* \`.${name}\` para consultar lore e status.`;
        
        if (createCommandFile('rpg', name, theme.sub, desc, lore)) {
            createdCount++;
        }
    }
    index++;
}

const finalRpgCount = fs.readdirSync(path.join(ROOT, 'src', 'commands', 'rpg')).filter(f => f.endsWith('.js')).length;
console.log(`[RPG EXPANSION CONCLUÍDO] Criados: ${createdCount} novos comandos de RPG. Total final na pasta: ${finalRpgCount}`);
