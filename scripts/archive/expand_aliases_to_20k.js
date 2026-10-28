/**
 * Expansão de Aliases (Nomes Alternativos) para exatamente 20.000
 * GOATBOT — 10.000 comandos canônicos + 20.000 aliases = 30.000 gatilhos
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const COMMANDS_DIR = path.join(ROOT_DIR, 'src', 'commands');
const INDEX_FILE = path.join(ROOT_DIR, 'src', 'config', 'commandIndex.json');

const TARGET_ALIASES = 20000;

function updateFileAliases(filePath, newAliases) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const json = JSON.stringify(newAliases);
        const aliasesRegex = /aliases\s*:\s*\[[\s\S]*?\]/;

        if (aliasesRegex.test(content)) {
            content = content.replace(aliasesRegex, `aliases: ${json}`);
        } else {
            const nameRegex = /(name\s*:\s*['"`][^'"`]+['"`]\s*,?)/;
            if (nameRegex.test(content)) {
                content = content.replace(nameRegex, `$1\n    aliases: ${json},`);
            } else {
                return false;
            }
        }
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    } catch (_) {
        return false;
    }
}

function run() {
    console.log('⚡ Iniciando expansão robusta de aliases para atingir exatamente 20.000...\n');

    // Sempre recarrega dados frescos do commandIndex
    const indexData = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
    const commandsSet = new Set(Object.keys(indexData.commands).map(s => s.toLowerCase()));
    const aliasesSet = new Set(Object.keys(indexData.aliases).map(s => s.toLowerCase()));

    const currentAliases = aliasesSet.size;
    let needed = TARGET_ALIASES - currentAliases;
    console.log(`📊 Aliases atuais no índice: ${currentAliases}`);
    console.log(`🎯 Meta de aliases:         ${TARGET_ALIASES}`);
    console.log(`➕ Faltam:                   ${needed}\n`);

    if (needed <= 0) {
        console.log('✅ Meta de 20.000 aliases já atingida!');
        return;
    }

    // Prefere arquivos que foram gerados recentemente e gravam de forma limpa
    const entries = Object.entries(indexData.commands).sort((a, b) => {
        const fileA = a[1].file;
        const fileB = b[1].file;
        // Prioriza pastas criadas nas Fases 2 a 6
        const isExpA = fileA.includes('bolsa/') || fileA.includes('trivias/') || fileA.includes('jogos/') || fileA.includes('clas/') || fileA.includes('talentos/') || fileA.includes('forja/') || fileA.includes('raids/') || fileA.includes('montarias/') || fileA.includes('elementos/') || fileA.includes('paises/') || fileA.includes('audio_filtros/') || fileA.includes('fontes/') || fileA.includes('personas/') || fileA.includes('seguranca/') || fileA.includes('conquistas/') || fileA.includes('busca/');
        const isExpB = fileB.includes('bolsa/') || fileB.includes('trivias/') || fileB.includes('jogos/') || fileB.includes('clas/') || fileB.includes('talentos/') || fileB.includes('forja/') || fileB.includes('raids/') || fileB.includes('montarias/') || fileB.includes('elementos/') || fileB.includes('paises/') || fileB.includes('audio_filtros/') || fileB.includes('fontes/') || fileB.includes('personas/') || fileB.includes('seguranca/') || fileB.includes('conquistas/') || fileB.includes('busca/');
        if (isExpA && !isExpB) return -1;
        if (!isExpA && isExpB) return 1;
        return 0;
    });

    const PREFIXES = [
        'cmd_', 'atalho_', 'abrev_', 'call_', 'func_',
        'op_', 'run_', 'go_', 'exec_', 'fast_',
        'acao_', 'alt_', 'sub_', 'quick_', 'mod_'
    ];

    let filesModified = 0;
    let aliasesCreated = 0;

    for (const [cmdNameLower, meta] of entries) {
        if (needed <= 0) break;

        const filePath = path.join(COMMANDS_DIR, meta.file);
        if (!fs.existsSync(filePath)) continue;

        const cmdName = meta.name;
        const currentCmdAliases = Array.isArray(meta.aliases) ? [...meta.aliases] : [];

        const candidates = [];

        // 1. Prefixos de atalho
        for (const p of PREFIXES) {
            candidates.push(`${p}${cmdNameLower}`);
        }

        // 2. Variações semânticas se tiver underline
        if (cmdNameLower.includes('_')) {
            const parts = cmdNameLower.split('_');
            if (parts.length === 2) {
                candidates.push(`${parts[1]}_${parts[0]}`);
                candidates.push(`${parts[0]}${parts[1]}`);
            } else if (parts.length >= 3) {
                candidates.push(`${parts[0]}_${parts[parts.length - 1]}`);
                candidates.push(`${parts[1]}_${parts[parts.length - 1]}`);
                candidates.push(parts.join(''));
            }
        }

        // 3. Sufixos
        candidates.push(`${cmdNameLower}_alt`);
        candidates.push(`${cmdNameLower}_cmd`);
        candidates.push(`${cmdNameLower}_go`);
        candidates.push(`${cmdNameLower}_fast`);
        candidates.push(`${cmdNameLower}_run`);

        const validCandidatesToAdd = [];

        for (const candidate of candidates) {
            if (needed <= 0) break;
            const cand = candidate.toLowerCase().trim();

            if (!cand || cand.length < 2) continue;
            if (commandsSet.has(cand)) continue; // não pode ser comando
            if (aliasesSet.has(cand)) continue; // não pode colidir
            if (currentCmdAliases.map(a => a.toLowerCase()).includes(cand)) continue;

            validCandidatesToAdd.push(cand);
            aliasesSet.add(cand);
            needed--;
            aliasesCreated++;

            // Adiciona até 3 por arquivo
            if (validCandidatesToAdd.length >= 3) break;
        }

        if (validCandidatesToAdd.length > 0) {
            const updatedAliases = [...currentCmdAliases, ...validCandidatesToAdd];
            const ok = updateFileAliases(filePath, updatedAliases);
            if (ok) {
                filesModified++;
            } else {
                // Se falhou gravação, devolve ao saldo
                for (const a of validCandidatesToAdd) {
                    aliasesSet.delete(a);
                    needed++;
                    aliasesCreated--;
                }
            }
        }
    }

    console.log(`\n🎉 Expansão concluída!`);
    console.log(`✨ Novos aliases salvos em disco: ${aliasesCreated}`);
    console.log(`📝 Arquivos de comandos atualizados: ${filesModified}`);
    console.log(`🎯 Total final esperado de aliases: ${aliasesSet.size}`);
}

run();
