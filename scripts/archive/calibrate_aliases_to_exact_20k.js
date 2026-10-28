/**
 * Calibra o número de aliases para atingir EXATAMENTE 20.000
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const COMMANDS_DIR = path.join(ROOT_DIR, 'src', 'commands');
const { buildCommandIndex } = require('./generate_command_index');

function run() {
    let index = buildCommandIndex();
    let excess = index.totalAliases - 20000;
    console.log(`Excesso atual de aliases: ${excess}`);

    if (excess <= 0) {
        console.log(`Aliases já estão em ${index.totalAliases}`);
        return;
    }

    const commandFiles = [];
    function scanDir(dir) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                scanDir(fullPath);
            } else if (entry.name.endsWith('.js')) {
                commandFiles.push(fullPath);
            }
        }
    }
    scanDir(COMMANDS_DIR);

    // Itera pelos arquivos de trás para frente removendo aliases excedentes com prefixo cmd_/atalho_
    for (let i = commandFiles.length - 1; i >= 0 && excess > 0; i--) {
        const filePath = commandFiles[i];
        let content = fs.readFileSync(filePath, 'utf8');

        const aliasesRegex = /aliases\s*:\s*(\[[^\]]*\])/;
        const match = content.match(aliasesRegex);
        if (!match) continue;

        let arr;
        try {
            arr = JSON.parse(match[1]);
        } catch (_) {
            continue;
        }

        if (!Array.isArray(arr) || arr.length <= 1) continue;

        // Procura aliases adicionados recentemente
        const removableIndices = [];
        for (let j = arr.length - 1; j >= 0; j--) {
            const a = arr[j];
            if (a.startsWith('cmd_') || a.startsWith('atalho_') || a.startsWith('abrev_') || a.endsWith('_alt') || a.endsWith('_cmd') || a.endsWith('_go')) {
                removableIndices.push(j);
            }
        }

        if (removableIndices.length === 0) continue;

        let modified = false;
        for (const idx of removableIndices) {
            if (excess <= 0) break;
            arr.splice(idx, 1);
            excess--;
            modified = true;
        }

        if (modified) {
            try {
                const newJson = JSON.stringify(arr);
                content = content.replace(aliasesRegex, `aliases: ${newJson}`);
                fs.writeFileSync(filePath, content, 'utf8');
            } catch (_) {
                // se falhar escrita, não desconta excess
                excess += (match[1].length - JSON.stringify(arr).length);
            }
        }
    }

    console.log(`Re-indexando após calibragem...`);
    const finalIndex = buildCommandIndex();
    console.log(`\n🎯 TOTAL FINAL DE ALIASES: ${finalIndex.totalAliases}`);
}

run();
