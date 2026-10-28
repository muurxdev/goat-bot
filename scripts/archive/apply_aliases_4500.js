/**
 * Script para Enriquecimento Oficial de Aliases no GOATBOT
 * Atribui aliases únicos, limpos e temáticos aos comandos canônicos que estavam com aliases: []
 * Elevando o total de aliases registrados para o patamar planejado de ~4500 a 4800 aliases.
 */

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const dispatcher = require(path.join(ROOT, 'src/handlers/commandDispatcher'));
dispatcher.loadCommands();

const cmds = dispatcher.getCommands();
const existingAliases = dispatcher.getAliases();

const takenNames = new Set([...cmds.keys()].map(k => k.toLowerCase()));
const takenAliases = new Set([...existingAliases.keys()].map(k => k.toLowerCase()));
const reserved = new Set([...takenNames, ...takenAliases]);

console.log(`[INÍCIO] Comandos canônicos: ${cmds.size} | Aliases registrados: ${takenAliases.size}`);

const PREFIX_MAP = {
    'mandamento': ['mand', 'manda', 'lei', 'commandment'],
    'chamaescura': ['chama', 'cescura', 'darkflame', 'chamas'],
    'escuridao': ['escur', 'darkness', 'darkmatter', 'trevas'],
    'purga': ['purge', 'expurgo', 'purga-rpg', 'purgar'],
    'arcanjo': ['arc', 'archangel', 'anjo', 'arcanjos'],
    'ark': ['holyark', 'arkdeusa', 'luzark', 'arkluz'],
    'bencao': ['benc', 'blessing', 'graca', 'bencao-rpg'],
    'raiodeluz': ['raioluz', 'lightray', 'luzraio', 'raio-de-luz'],
    'espiritual': ['chasti', 'lance', 'lanck', 'chastie'],
    'basquias': ['basq', 'lanceb', 'gloxinia', 'basquias-rpg'],
    'polen': ['pollen', 'polencura', 'jardimpolen', 'polen-rpg'],
    'levitacao': ['levit', 'levitate', 'voofada', 'flutuar'],
    'dancaterra': ['danca', 'droledance', 'terra', 'dancadrole'],
    'heavymetal': ['hmetal', 'metal', 'heavy', 'peleferro'],
    'sagrado': ['gid', 'martelogideon', 'martelo', 'sagrado-rpg'],
    'redemoinho': ['redem', 'vortex', 'areia', 'redemoinho-rpg'],
    'raio': ['trovao', 'thunder', 'raio-central', 'trovaocentral'],
    'tempestade': ['temp', 'cyclone', 'ciclone', 'tempestade-rpg'],
    'barreira': ['barr', 'barrier', 'muralha', 'barreira-rpg'],
    'explosao': ['expl', 'detonation', 'detonar', 'explosao-rpg'],
    'reliquia': ['reliq', 'relic', 'artefato', 'reliquiasagrada'],
    'forja': ['forge', 'ferreiro', 'forjadubs', 'forja-rpg'],
    'purgatorio': ['purg', 'purgatory', 'inferno', 'purgatorio-rpg'],
    'demonio': ['demon', 'demonclan', 'besta', 'demonioclan'],
    'dragao': ['drag', 'dragon', 'dragao-tyrant', 'tyrantdrag'],
    'albion': ['alb', 'golem', 'albiongolem', 'albioncerco'],
    'pocao': ['poc', 'potion', 'elixir', 'pocao-rpg'],
    'receita': ['rec', 'recipe', 'prato', 'receitabotanica'],
    'erva': ['herb', 'druidherb', 'ervadruida', 'erva-rpg'],
    'gestaobot': ['gbot', 'admbot', 'painelbot', 'gestaovps'],
    'grupomsg': ['gmsg', 'msggrp', 'mensagensgrp', 'comunicadogrp'],
    'mod': ['modgrp', 'segurancagrp', 'admmod', 'moderargrp'],
    'midiautil': ['mutil', 'utilmidia', 'dlutil', 'midiatool'],
    'ecogame': ['egame', 'gameco', 'jogofin', 'ecofun'],
    'funextra': ['fextra', 'extrafun', 'zoeiraextra', 'diversaoextra'],
    'devtool': ['dtool', 'tooldev', 'devhub', 'devutil'],
    'perfilrank': ['prank', 'rankperfil', 'xprank', 'perfilxp'],
    'calcutil': ['cutil', 'utilcalc', 'mathutil', 'calcpro'],
    'livrobib': ['lbib', 'biblivro', 'ebookbib', 'bibliotecalivro'],
    'iasmart': ['ismart', 'smartia', 'aiintel', 'iapro'],
    'socialinter': ['sinter', 'intersocial', 'afetosocial', 'socialrel'],
    'adicionais': ['adplus', 'extraplus', 'adicionalextra', 'plustool']
};

function walkCommands(dir) {
    let files = [];
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, item.name);
        if (item.isDirectory()) {
            files = files.concat(walkCommands(full));
        } else if (item.name.endsWith('.js')) {
            files.push(full);
        }
    }
    return files;
}

const allFiles = walkCommands(path.join(ROOT, 'src/commands'));
let filesUpdated = 0;
let aliasesAdded = 0;

for (const filePath of allFiles) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Procura comandos com aliases vazios: aliases: []
    if (/aliases:\s*\[\s*\]/.test(content)) {
        // Extrai o nome do comando
        const nameMatch = content.match(/name:\s*["']([^"']+)["']/);
        if (!nameMatch) continue;
        const name = nameMatch[1];

        const match = name.match(/^([a-z]+)(\d+)$/);
        const candidates = [];
        if (match) {
            const prefix = match[1];
            const num = match[2];
            const patterns = PREFIX_MAP[prefix] || [prefix.slice(0, 4), prefix + '-cmd'];
            for (const p of patterns) {
                candidates.push(p + num);
                candidates.push(p + '-' + num);
            }
        } else {
            candidates.push(name + '-cmd');
            candidates.push('cmd-' + name);
            candidates.push(name.slice(0, Math.min(name.length, 5)) + '-alias');
        }

        const validAliases = [];
        for (const cand of candidates) {
            const cleanCand = cand.toLowerCase().trim();
            if (cleanCand && !reserved.has(cleanCand) && cleanCand !== name.toLowerCase()) {
                reserved.add(cleanCand);
                validAliases.push(cleanCand);
                if (validAliases.length >= 2) break;
            }
        }

        if (validAliases.length > 0) {
            const aliasesCode = `aliases: ${JSON.stringify(validAliases)}`;
            content = content.replace(/aliases:\s*\[\s*\]/, aliasesCode);
            fs.writeFileSync(filePath, content, 'utf8');
            filesUpdated++;
            aliasesAdded += validAliases.length;
        }
    }
}

console.log(`[SUCESSO] Arquivos atualizados: ${filesUpdated} | Novos aliases atribuídos: ${aliasesAdded}`);
