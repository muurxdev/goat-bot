/**
 * Generate Command Index
 * Varre todos os comandos em src/commands, valida integridade, aplica política
 * de resolução de nomes e aliases, e gera um manifesto pré-compilado ultraleve (commandIndex.json).
 */

const fs = require('fs');
const path = require('path');
const { validateRegistry, formatReport } = require('../src/handlers/commandValidator');
const aliasOwners = require('../src/config/aliasOwners');

const COMMANDS_DIR = path.resolve(__dirname, '../src/commands');
const OUTPUT_FILE = path.resolve(__dirname, '../src/config/commandIndex.json');

function buildCommandIndex() {
    console.log('⚡ Gerando índice pré-compilado de comandos...');
    const start = Date.now();

    const entries = [];
    function scanDir(dir) {
        const dirEntries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of dirEntries) {
            const fullPath = path.resolve(dir, entry.name);
            if (entry.isDirectory()) {
                scanDir(fullPath);
            } else if (entry.isFile() && entry.name.endsWith('.js')) {
                const relPath = path.relative(COMMANDS_DIR, fullPath).replace(/\\/g, '/');
                try {
                    delete require.cache[require.resolve(fullPath)];
                    const cmd = require(fullPath);
                    entries.push({ file: relPath, cmd });
                } catch (err) {
                    console.error(`Erro ao carregar comando ${relPath}:`, err);
                    entries.push({ file: relPath, cmd: null, loadError: err });
                }
            }
        }
    }
    scanDir(COMMANDS_DIR);

    const validEntries = entries.filter(e => !e.loadError);
    const report = validateRegistry(validEntries);

    if (report.errors.length) {
        console.error(formatReport(report));
        throw new Error(`Erros de integridade encontrados: ${report.errors.length}`);
    }

    const commandsMeta = {};
    const aliasesMeta = {};

    // 1. Resolução de nomes canônicos (first-wins)
    for (const { cmd, file } of validEntries) {
        if (!cmd || !cmd.name || typeof cmd.execute !== 'function') continue;
        const cmdName = cmd.name.toLowerCase();

        if (!commandsMeta[cmdName]) {
            commandsMeta[cmdName] = {
                name: cmd.name,
                file: file,
                category: cmd.category || 'general',
                description: cmd.description || '',
                aliases: Array.isArray(cmd.aliases) ? cmd.aliases : [],
                groupOnly: Boolean(cmd.groupOnly),
                adminOnly: Boolean(cmd.adminOnly),
                ownerOnly: Boolean(cmd.ownerOnly),
                botAdminOnly: Boolean(cmd.botAdminOnly),
                cooldownMs: Number(cmd.cooldownMs) || 0,
                examples: Array.isArray(cmd.examples) ? cmd.examples : [],
                subcategory: cmd.subcategory || "",
                hidden: Boolean(cmd.hidden),
                minRole: typeof cmd.minRole === 'number' ? cmd.minRole : undefined,
                loreExempt: Boolean(cmd.loreExempt),
                mediaCommand: Boolean(cmd.mediaCommand)
            };
        }
    }

    // 2. Resolução de aliases
    for (const { cmd } of validEntries) {
        if (!cmd || !cmd.name || typeof cmd.execute !== 'function') continue;
        if (!Array.isArray(cmd.aliases)) continue;

        for (const rawAlias of cmd.aliases) {
            const alias = String(rawAlias).toLowerCase();
            if (commandsMeta[alias]) continue; // alias morto: nome ganha

            const owner = aliasOwners[alias];
            if (aliasesMeta[alias]) {
                if (owner && owner === cmd.name) {
                    aliasesMeta[alias] = cmd.name.toLowerCase();
                }
                continue; // senão: first-wins
            }
            if (owner && owner !== cmd.name && commandsMeta[owner]) {
                continue;
            }
            aliasesMeta[alias] = cmd.name.toLowerCase();
        }
    }

    const payload = {
        generatedAt: new Date().toISOString(),
        totalCommands: Object.keys(commandsMeta).length,
        totalAliases: Object.keys(aliasesMeta).length,
        commands: commandsMeta,
        aliases: aliasesMeta,
        validationReport: {
            duplicateNames: report.duplicateNames,
            missingFields: report.missingFields,
            unknownKeys: report.unknownKeys,
            aliasShadowedByName: report.aliasShadowedByName,
            aliasConflicts: report.aliasConflicts,
            errors: report.errors,
            warnings: report.warnings
        }
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(payload, null, 2), 'utf8');
    const elapsed = Date.now() - start;
    console.log(`✅ Índice salvo com sucesso: ${OUTPUT_FILE}`);
    console.log(`   Total de comandos indexados: ${payload.totalCommands}`);
    console.log(`   Total de aliases mapeados:   ${payload.totalAliases}`);
    console.log(`   Tempo de geração: ${elapsed} ms\n`);

    return payload;
}

if (require.main === module) {
    buildCommandIndex();
}

module.exports = { buildCommandIndex };
