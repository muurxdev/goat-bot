/**
 * Script de Restauração Mestra de Níveis, XP e Moedas
 * Consolida o histórico completo de todos os 159 backups SQLite e xp.json
 */

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const backupDir = path.join(__dirname, '..', 'backups');
const dataDir = path.join(__dirname, '..', 'data');
const targetDbPath = path.join(dataDir, 'database.sqlite');
const xpJsonPath = path.join(dataDir, 'xp.json');

const allUsers = new Map();

// 1. Varrer todos os backups SQLite
if (fs.existsSync(backupDir)) {
    const backupFiles = fs.readdirSync(backupDir).filter(f => f.endsWith('.sqlite')).sort();
    console.log(`🔍 Analisando ${backupFiles.length} arquivos de backup históricos...`);

    for (const bf of backupFiles) {
        const bp = path.join(backupDir, bf);
        try {
            const db = new DatabaseSync(bp);
            const rows = db.prepare('SELECT * FROM users').all();
            for (const r of rows) {
                const jid = r.jid;
                if (!jid) continue;

                if (!allUsers.has(jid)) {
                    allUsers.set(jid, { ...r });
                } else {
                    const ex = allUsers.get(jid);
                    ex.level = Math.max(ex.level || 1, r.level || 1);
                    ex.xp = Math.max(ex.xp || 0, r.xp || 0);
                    ex.coins = Math.max(ex.coins || 0, r.coins || 0);
                    ex.messages = Math.max(ex.messages || 0, r.messages || 0);
                    ex.messages_group = Math.max(ex.messages_group || 0, r.messages_group || 0);
                    ex.messages_pv = Math.max(ex.messages_pv || 0, r.messages_pv || 0);
                    ex.commands_group = Math.max(ex.commands_group || 0, r.commands_group || 0);
                    ex.commands_pv = Math.max(ex.commands_pv || 0, r.commands_pv || 0);
                    ex.xp_group = Math.max(ex.xp_group || 0, r.xp_group || 0);
                    ex.xp_pv = Math.max(ex.xp_pv || 0, r.xp_pv || 0);
                    ex.bank = Math.max(ex.bank || 0, r.bank || 0);
                    ex.streak = Math.max(ex.streak || 0, r.streak || 0);
                    ex.rep = Math.max(ex.rep || 0, r.rep || 0);
                    ex.wins = Math.max(ex.wins || 0, r.wins || 0);
                    ex.losses = Math.max(ex.losses || 0, r.losses || 0);
                    ex.bosses_mortos = Math.max(ex.bosses_mortos || 0, r.bosses_mortos || 0);
                    ex.arena_pontos = Math.max(ex.arena_pontos || 0, r.arena_pontos || 0);
                    ex.arena_atual = Math.max(ex.arena_atual || 1, r.arena_atual || 1);

                    if (r.name && (!ex.name || ex.name === 'Sem Nome')) ex.name = r.name;
                    if (r.phone && !ex.phone) ex.phone = r.phone;
                    if (r.lid && !ex.lid) ex.lid = r.lid;
                    if (r.classe && !ex.classe) ex.classe = r.classe;
                    if (r.classe_lendaria && !ex.classe_lendaria) ex.classe_lendaria = r.classe_lendaria;
                    if (r.arma && !ex.arma) ex.arma = r.arma;
                    if (r.guilda && !ex.guilda) ex.guilda = r.guilda;
                }
            }
            db.close();
        } catch (_) {}
    }
}

// 2. Varrer xp.json
if (fs.existsSync(xpJsonPath)) {
    try {
        const xpJson = JSON.parse(fs.readFileSync(xpJsonPath, 'utf8'));
        for (const [jid, u] of Object.entries(xpJson)) {
            if (!allUsers.has(jid)) {
                allUsers.set(jid, {
                    jid,
                    level: u.level || 1,
                    xp: u.xp || 0,
                    coins: u.coins || 0,
                    messages: u.messages || 0,
                    name: u.name || null,
                    phone: u.phone || null,
                    lid: u.lid || null,
                    classe: u.classe || null,
                    classe_lendaria: u.classeLendaria || null,
                    arma: u.arma || u.equipado || null,
                    guilda: u.guilda || null
                });
            } else {
                const ex = allUsers.get(jid);
                ex.level = Math.max(ex.level || 1, u.level || 1);
                ex.xp = Math.max(ex.xp || 0, u.xp || 0);
                ex.coins = Math.max(ex.coins || 0, u.coins || 0);
                ex.messages = Math.max(ex.messages || 0, u.messages || 0);
                if (u.name && (!ex.name || ex.name === 'Sem Nome')) ex.name = u.name;
            }
        }
    } catch (_) {}
}

// Usuário Dono (5511999999999): Garantir que seus dados reais estejam preservados
const ownerJid = '5511999999999@s.whatsapp.net';
if (allUsers.has(ownerJid)) {
    const owner = allUsers.get(ownerJid);
    if ((owner.level || 1) < 12) owner.level = 12;
    if ((owner.coins || 0) < 50000) owner.coins = 50000;
}

console.log(`✨ Total consolidado: ${allUsers.size} usuários únicos recuperados.`);

// 3. Salvar de volta em data/xp.json em formato enriquecido
const outputJson = {};
for (const [jid, u] of allUsers.entries()) {
    outputJson[jid] = {
        jid: u.jid,
        level: u.level || 1,
        xp: u.xp || 0,
        coins: u.coins || 0,
        messages: u.messages || 0,
        messagesGroup: u.messages_group || 0,
        messagesPv: u.messages_pv || 0,
        commandsGroup: u.commands_group || 0,
        commandsPv: u.commands_pv || 0,
        xpGroup: u.xp_group || 0,
        xpPv: u.xp_pv || 0,
        bank: u.bank || 0,
        hp: u.hp || 100,
        hpMax: u.hp_max || 100,
        mundo: u.mundo || 'floresta',
        mochila: u.mochila || 20,
        streak: u.streak || 0,
        rep: u.rep || 0,
        wins: u.wins || 0,
        losses: u.losses || 0,
        bossesMortos: u.bosses_mortos || 0,
        arenaPontos: u.arena_pontos || 0,
        arenaAtual: u.arena_atual || 1,
        name: u.name || null,
        phone: u.phone || null,
        lid: u.lid || null,
        classe: u.classe || null,
        classeLendaria: u.classe_lendaria || null,
        arma: u.arma || null,
        guilda: u.guilda || null,
        inventario: typeof u.inventario === 'string' ? JSON.parse(u.inventario || '[]') : (u.inventario || []),
        conquistas: typeof u.conquistas === 'string' ? JSON.parse(u.conquistas || '[]') : (u.conquistas || []),
        pets: typeof u.pets === 'string' ? JSON.parse(u.pets || '[]') : (u.pets || [])
    };
}
fs.writeFileSync(xpJsonPath, JSON.stringify(outputJson, null, 2), 'utf8');
console.log(`💾 ${Object.keys(outputJson).length} usuários salvos em data/xp.json`);

// 4. Salvar diretamente no SQLite database.sqlite
const { getDatabase } = require('../src/database/connection');
const userRepo = require('../src/database/repositories/userRepository');
const db = getDatabase(targetDbPath);

let inserted = 0;
for (const [jid, u] of allUsers.entries()) {
    try {
        userRepo.saveUser({
            jid: u.jid,
            level: u.level || 1,
            xp: u.xp || 0,
            coins: u.coins || 0,
            messages: u.messages || 0,
            messagesGroup: u.messages_group || 0,
            messagesPv: u.messages_pv || 0,
            commandsGroup: u.commands_group || 0,
            commandsPv: u.commands_pv || 0,
            xpGroup: u.xp_group || 0,
            xpPv: u.xp_pv || 0,
            bank: u.bank || 0,
            hp: u.hp || 100,
            hpMax: u.hp_max || 100,
            mundo: u.mundo || 'floresta',
            mochila: u.mochila || 20,
            streak: u.streak || 0,
            rep: u.rep || 0,
            wins: u.wins || 0,
            losses: u.losses || 0,
            bossesMortos: u.bosses_mortos || 0,
            arenaPontos: u.arena_pontos || 0,
            arenaAtual: u.arena_atual || 1,
            name: u.name || null,
            phone: u.phone || null,
            lid: u.lid || null,
            classe: u.classe || null,
            classeLendaria: u.classe_lendaria || null,
            arma: u.arma || null,
            guilda: u.guilda || null,
            inventario: typeof u.inventario === 'string' ? JSON.parse(u.inventario || '[]') : (u.inventario || []),
            conquistas: typeof u.conquistas === 'string' ? JSON.parse(u.conquistas || '[]') : (u.conquistas || []),
            pets: typeof u.pets === 'string' ? JSON.parse(u.pets || '[]') : (u.pets || [])
        });
        inserted++;
    } catch (e) {
        console.error(`Erro ao salvar usuário ${jid}:`, e.message);
    }
}

console.log(`✅ ${inserted} usuários sincronizados com sucesso no banco SQLite!`);

// Top 10 usuários restaurados
const top10 = db.prepare('SELECT jid, name, level, xp, coins FROM users ORDER BY level DESC LIMIT 10').all();
console.log('\n🏆 Top 10 Usuários Restaurados:');
top10.forEach((u, i) => {
    console.log(`  ${i + 1}. ${u.name || u.jid} | Nível ${u.level} | ${u.xp.toLocaleString('pt-BR')} XP | ${u.coins.toLocaleString('pt-BR')} Coins`);
});

