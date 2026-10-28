/**
 * Owner Hierarchy Service
 * Gerencia a hierarquia militar dos 10 Donos do bot com regras rígidas de autorização:
 * • Capitão: Altera e remove todos os donos. Ninguém altera o Capitão.
 * • Tenente: Altera e remove todos abaixo dele (Sargento, Cabo, Soldado). Não altera o Capitão nem a si mesmo.
 */

const { getDatabase } = require("../database/connection");
const env = require("../config/env");
const logger = require("../core/logger");

// Hierarquia de 10 donos. Apenas Capitão (5) e Tenente (4) gerenciam a hierarquia
// (ver canModifyOwner); os demais são donos subordinados. O Capitão inicial é o
// dono do bot definido pela env BOT_OWNER_ID (o número NÃO fica no código —
// configure no seu .env); os outros slots são preenchidos via `.setdono`.
// O nome é resolvido AO VIVO do perfil do WhatsApp (pushName salvo em users.name).
const OWNER_JID = (process.env.BOT_OWNER_ID || "").trim();
const DEFAULT_OWNERS = [
    { rank: "Capitão",   level: 5, name: "", jid: OWNER_JID, phone: "", active: !!OWNER_JID },
    { rank: "Tenente",   level: 4, name: "", jid: "", phone: "", active: false },
    { rank: "Sargento",  level: 3, name: "", jid: "", phone: "", active: false },
    { rank: "Cabo",      level: 3, name: "", jid: "", phone: "", active: false },
    { rank: "Soldado",   level: 3, name: "", jid: "", phone: "", active: false },
    { rank: "Guardião",  level: 3, name: "", jid: "", phone: "", active: false },
    { rank: "Cavaleiro", level: 3, name: "", jid: "", phone: "", active: false },
    { rank: "Escudeiro", level: 3, name: "", jid: "", phone: "", active: false },
    { rank: "Aprendiz",  level: 3, name: "", jid: "", phone: "", active: false },
    { rank: "Recruta",   level: 3, name: "", jid: "", phone: "", active: false }
];

/**
 * Nome do PERFIL do dono (nick personalizado), exibido APENAS na lista de donos.
 * Prioridade: nick fixo salvo no owner -> OWNER_PROFILE_NAME (do dono via .env,
 * só para o Capitão/dono principal) -> pushName do WhatsApp -> patente.
 */
function resolveOwnerName(owner) {
    if (!owner || !owner.jid) return owner?.name || owner?.rank || "Dono";

    // 1. pushName real do WhatsApp ou nick cadastrado no perfil do bot
    try {
        const userRepo = require("../database/repositories/userRepository");
        const digits = owner.jid.replace(/\D/g, "");
        const u = userRepo.getUser(owner.jid) || userRepo.getUser(digits + "@s.whatsapp.net");
        if (u && (u.display_nick || u.name)) {
            return u.display_nick || u.name;
        }
    } catch (err) {
        logger.warn(`[OWNER SERVICE] resolveOwnerName: não consegui ler o perfil de ${owner.jid}: ${err.message}`);
    }

    // 2. nick fixo definido para este dono (via .setdono / saveOwners), se não for numérico ou genérico
    if (owner.name && !owner.name.startsWith("Dono ") && !/^[+\d\s().-]+$/.test(owner.name)) {
        return owner.name;
    }

    // 3. nick de perfil do dono principal (env), só quando bate com o OWNER_JID
    const profileNick = (process.env.OWNER_PROFILE_NAME || "").trim();
    if (profileNick && OWNER_JID && owner.jid.replace(/\D/g, "") === OWNER_JID.replace(/\D/g, "")) {
        return profileNick;
    }

    return owner.name || owner.rank;
}

/** Nick de perfil do dono principal (para exibição em .dono e no perfil do dono). */
function getOwnerProfileName() {
    return (process.env.OWNER_PROFILE_NAME || "").trim() || null;
}

function normalizeRank(r) {
    return String(r || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function getOwners() {
    try {
        const db = getDatabase();
        const row = db.prepare("SELECT settings FROM configs WHERE group_jid = ?").get("global_owners");
        if (row && row.settings) {
            const parsed = JSON.parse(row.settings);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch (err) {
        // getOwners roda em todo isOwner: avisa uma vez por tipo de erro.
        logger.warnOnce(`getOwners:${err.message}`, `[OWNER SERVICE] getOwners: lista de donos ilegível no banco, uso a padrão: ${err.message}`);
    }
    return DEFAULT_OWNERS;
}

function saveOwners(ownersList) {
    try {
        const db = getDatabase();
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO configs (group_jid, antilink, settings, updated_at)
            VALUES ('global_owners', 0, ?, CURRENT_TIMESTAMP)
        `);
        stmt.run(JSON.stringify(ownersList));
        logger.info("[OWNER SERVICE] Hierarquia dos Donos atualizada com sucesso.");
        return true;
    } catch (err) {
        logger.error("[OWNER SERVICE ERROR] Falha ao salvar donos:", err);
        return false;
    }
}

/**
 * Localiza um dono ou patente na hierarquia oficial a partir de:
 * • JID ou LID (@s.whatsapp.net ou @lid)
 * • Dígitos de telefone (5511...)
 * • Nome da patente base (Capitão, Tenente, Sargento...)
 * • Título personalizado (customTitle)
 * • Nome registrado no cargo (owner.name)
 * • Nick registrado no perfil do bot (display_nick) ou nome do WhatsApp (pushName)
 * @param {string} query
 * @param {Array<string>} [candidates]
 * @returns {object|null}
 */
function findOwnerByQuery(query, candidates = []) {
    if (!query) return null;
    const owners = getOwners();
    const queryStr = String(query).trim();
    const norm = normalizeRank(queryStr);
    const rawDigits = queryStr.replace(/\D/g, "");

    // 1. Busca por Patente base
    let found = owners.find(o => normalizeRank(o.rank) === norm);
    if (found) return found;

    // 2. Busca por Título Customizado (customTitle)
    found = owners.find(o => o.customTitle && normalizeRank(o.customTitle) === norm);
    if (found) return found;

    // 3. Busca por Dígitos de Telefone ou JID/LID direto
    const allDigits = new Set();
    if (rawDigits.length >= 8) {
        allDigits.add(rawDigits);
        if (rawDigits.length === 10 || rawDigits.length === 11) {
            allDigits.add("55" + rawDigits);
        } else if (rawDigits.startsWith("55") && (rawDigits.length === 12 || rawDigits.length === 13)) {
            allDigits.add(rawDigits.slice(2));
        }
    }
    if (Array.isArray(candidates)) {
        for (const c of candidates) {
            if (typeof c === "string") {
                const d = c.replace(/\D/g, "");
                if (d.length >= 8) {
                    allDigits.add(d);
                    if (d.length === 10 || d.length === 11) {
                        allDigits.add("55" + d);
                    } else if (d.startsWith("55") && (d.length === 12 || d.length === 13)) {
                        allDigits.add(d.slice(2));
                    }
                }
            }
        }
    }

    if (allDigits.size > 0) {
        found = owners.find(o => {
            if (!o.active) return false;
            const jidDigits = (o.jid || "").replace(/\D/g, "");
            const phoneDigits = (o.phone || "").replace(/\D/g, "");
            for (const d of allDigits) {
                if ((jidDigits && (jidDigits.includes(d) || d.includes(jidDigits))) ||
                    (phoneDigits && (phoneDigits.includes(d) || d.includes(phoneDigits)))) {
                    return true;
                }
            }
            return false;
        });
        if (found) return found;

        // Tenta resolver por user_identities ou tabela users do SQLite
        try {
            const db = getDatabase();
            for (const d of allDigits) {
                const row = db.prepare("SELECT jid, lid, phone FROM users WHERE jid = ? OR lid = ? OR phone LIKE ?").get(queryStr, queryStr, `%${d}%`);
                if (row) {
                    const uDigits = [row.phone, row.jid, row.lid].filter(Boolean).map(s => s.replace(/\D/g, "")).filter(x => x.length >= 8);
                    found = owners.find(o => {
                        if (!o.active) return false;
                        const jidDigits = (o.jid || "").replace(/\D/g, "");
                        const phoneDigits = (o.phone || "").replace(/\D/g, "");
                        return uDigits.some(ud => ud && (jidDigits.includes(ud) || ud.includes(jidDigits) || phoneDigits.includes(ud) || ud.includes(phoneDigits)));
                    });
                    if (found) return found;
                }
            }
        } catch (err) {
            logger.warn(`[OWNER SERVICE] findOwnerByQuery: busca por dígitos de "${queryStr}" falhou: ${err.message}`);
        }
    }

    // 4. Busca por nome registrado no cargo (owner.name)
    found = owners.find(o => o.active && o.name && (normalizeRank(o.name) === norm || normalizeRank(o.name).includes(norm)));
    if (found) return found;

    // 5. Busca por nick de perfil do bot (display_nick) ou nome do WhatsApp (pushName)
    try {
        const db = getDatabase();
        const userRow = db.prepare("SELECT jid, phone, lid FROM users WHERE LOWER(display_nick) = LOWER(?) OR LOWER(name) = LOWER(?)").get(queryStr, queryStr);
        if (userRow) {
            const uDigits = [userRow.phone, userRow.jid, userRow.lid].filter(Boolean).map(s => s.replace(/\D/g, "")).filter(x => x.length >= 8);
            found = owners.find(o => {
                if (!o.active) return false;
                const jidDigits = (o.jid || "").replace(/\D/g, "");
                const phoneDigits = (o.phone || "").replace(/\D/g, "");
                return uDigits.some(ud => ud && (jidDigits.includes(ud) || ud.includes(jidDigits) || phoneDigits.includes(ud) || ud.includes(phoneDigits)));
            });
            if (found) return found;
        }
    } catch (err) {
        logger.warn(`[OWNER SERVICE] findOwnerByQuery: busca por nick "${queryStr}" falhou: ${err.message}`);
    }

    return null;
}

/**
 * Valida a autorização de modificação respeitando a hierarquia militar rígida:
 * • Capitão: Imune a todos. Apenas o Capitão gerencia outros e a si mesmo.
 * • Tenente: Gerencia apenas subordinados abaixo dele (nível < 4).
 * • Demais: Sem autorização de modificação.
 * @param {string} senderJid
 * @param {string|object} targetOwnerOrRank
 * @param {Array<string>} [candidates]
 * @param {{ remocao?: boolean }} [opts] remocao: true quando a patente vai ficar vaga (.deldono)
 * @returns {{ allowed: boolean, reason?: string, senderRank?: any, targetOwner?: any }}
 */
function canModifyOwner(senderJid, targetOwnerOrRank, candidates = [], opts = {}) {
    const owners = getOwners();
    let senderRank = getOwnerRank(senderJid, candidates);

    if (!senderRank) {
        return { allowed: false, reason: "⛔ Só quem ocupa uma patente na minha hierarquia de donos pode mexer nela." };
    }

    let targetOwner = null;
    if (typeof targetOwnerOrRank === "object" && targetOwnerOrRank !== null && targetOwnerOrRank.rank) {
        targetOwner = owners.find(o => normalizeRank(o.rank) === normalizeRank(targetOwnerOrRank.rank)) || targetOwnerOrRank;
    } else {
        const normTarget = normalizeRank(targetOwnerOrRank);
        targetOwner = owners.find(o => normalizeRank(o.rank) === normTarget || (o.customTitle && normalizeRank(o.customTitle) === normTarget));
    }

    if (!targetOwner) {
        return { allowed: false, reason: "❌ Patente ou Dono `" + targetOwnerOrRank + "` não encontrado na hierarquia oficial. (Válidas: Capitão, Tenente, Sargento, Cabo, Soldado, Guardião, Cavaleiro, Escudeiro, Aprendiz, Recruta)" };
    }

    // REGRA 1: NINGUÉM ALTERA O CAPITÃO (Apenas o próprio Capitão)
    if (targetOwner.rank === "Capitão") {
        if (senderRank.rank !== "Capitão") {
            return { allowed: false, reason: "🛡️ O *Capitão* só pode ser alterado por ele mesmo. Nenhuma outra patente mexe nele." };
        }
        // Ninguém tira a si mesmo da patente de Capitão. Como só existe um
        // slot de Capitão, isso deixaria a hierarquia sem comando. Antes só o
        // número do .env era barrado; um Capitão nomeado via .setdono se removia.
        if (opts.remocao && targetOwner.jid) {
            const meus = resolveAllCandidateDigits(senderJid, candidates);
            const alvo = targetOwner.jid.split(":")[0].split("@")[0].replace(/\D/g, "");
            if (alvo && meus.some(d => d === alvo)) {
                return { allowed: false, reason: "⚠️ Você não pode remover a sua própria patente de Capitão: a hierarquia ficaria sem ninguém no comando. Para passar o posto, use .setdono capitão @pessoa." };
            }
        }
        // O dono principal do .env também não sai do posto por outros caminhos
        const senderDigits = (senderJid || "").replace(/\D/g, "");
        const targetDigits = (targetOwner.jid || "").replace(/\D/g, "");
        if (OWNER_JID && targetDigits && OWNER_JID.replace(/\D/g, "") === targetDigits && senderDigits === targetDigits) {
            return { allowed: false, reason: "⚠️ Você é o dono principal do bot e não pode tirar a si mesmo da patente de Capitão." };
        }
        return { allowed: true, senderRank, targetOwner };
    }

    // REGRA 2: O CAPITÃO PODE ALTERAR TODOS
    if (senderRank.rank === "Capitão") {
        return { allowed: true, senderRank, targetOwner };
    }

    // REGRA 3: O TENENTE ALTERA TODOS ABAIXO DELE (Sargento, Cabo, Soldado, Guardião, Cavaleiro...)
    if (senderRank.rank === "Tenente") {
        if (targetOwner.rank === "Tenente") {
            return { allowed: false, reason: "⚠️ O *Tenente* não pode alterar ou remover a si mesmo nem outro Tenente." };
        }
        if (targetOwner.level < senderRank.level) {
            return { allowed: true, senderRank, targetOwner };
        }
        return { allowed: false, reason: "⛔ O Tenente só tem autoridade para gerenciar patentes abaixo dele (Sargento, Cabo, Soldado, Guardião, etc.)." };
    }

    // REGRA 4: DEMAIS CARGOS NÃO ALTERAM DONOS
    return { allowed: false, reason: "⛔ Só o *Capitão* e o *Tenente* podem nomear ou remover donos." };
}

function updateOwner(rankQuery, newName, phone = "", jid = "", appointedBy = "") {
    const list = getOwners();
    const norm = normalizeRank(rankQuery);
    const owner = list.find(o => normalizeRank(o.rank) === norm);

    if (owner) {
        owner.name = newName || owner.name || "";
        owner.active = true;
        owner.appointedBy = appointedBy || owner.appointedBy || "";
        owner.appointedAt = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
        const targetNumber = phone || jid;
        if (targetNumber) {
            let rawDigits = targetNumber.replace(/\D/g, "");
            if (rawDigits.length === 10 || rawDigits.length === 11) {
                rawDigits = "55" + rawDigits;
            }
            // Mínimo de 12 dígitos (55 + DDD + número): com menos que isso não dá
            // para identificar uma pessoa, e cargo de dono é o acesso mais alto
            // do bot. Antes aceitava 8 dígitos.
            if (rawDigits.length >= 12) {
                owner.jid = rawDigits + "@s.whatsapp.net";
                owner.phone = env.formatPhoneFromJid(owner.jid) || ("+" + rawDigits);
            } else {
                logger.warn(`[OWNER SERVICE] Número recusado no cadastro de dono: "${targetNumber}" tem ${rawDigits.length} dígitos, preciso de 12 (com DDD e o 55).`);
            }
        }
        saveOwners(list);
        return owner;
    }
    return null;
}

function removeOwner(rankQuery) {
    const list = getOwners();
    const norm = normalizeRank(rankQuery);
    const owner = list.find(o => normalizeRank(o.rank) === norm);

    if (owner) {
        owner.name = "";
        owner.phone = "";
        owner.jid = "";
        owner.active = false;
        delete owner.customTitle;
        saveOwners(list);
        return owner;
    }
    return null;
}

function updateRankTitle(rankQuery, newTitle) {
    const list = getOwners();
    const norm = normalizeRank(rankQuery);
    const owner = list.find(o => normalizeRank(o.rank) === norm || (o.customTitle && normalizeRank(o.customTitle) === norm));

    if (owner) {
        owner.customTitle = newTitle ? newTitle.trim() : "";
        saveOwners(list);
        return owner;
    }
    return null;
}

function resetRankTitle(rankQuery) {
    const list = getOwners();
    const norm = normalizeRank(rankQuery);
    const owner = list.find(o => normalizeRank(o.rank) === norm || (o.customTitle && normalizeRank(o.customTitle) === norm));

    if (owner) {
        delete owner.customTitle;
        saveOwners(list);
        return owner;
    }
    return null;
}

function resolveAllCandidateDigits(jid, candidates = []) {
    const set = new Set();
    const list = [jid, ...(Array.isArray(candidates) ? candidates : [candidates])].filter(Boolean);
    
    for (const item of list) {
        if (!item || typeof item !== "string") continue;
        const clean = item.split(":")[0].split("@")[0].replace(/\D/g, "");
        if (clean.length >= 8) {
            set.add(clean);
            if (clean.length === 10 || clean.length === 11) {
                set.add("55" + clean);
            } else if (clean.startsWith("55") && (clean.length === 12 || clean.length === 13)) {
                set.add(clean.slice(2));
            }
        }
    }

    // Se houver algum item com @lid, tenta buscar o telefone real no SQLite
    for (const item of list) {
        if (typeof item === "string" && item.endsWith("@lid")) {
            try {
                const db = getDatabase();
                const row = db.prepare("SELECT phone, jid FROM users WHERE lid = ? OR jid = ?").get(item, item);
                if (row) {
                    if (row.phone) {
                        const p = row.phone.replace(/\D/g, "");
                        if (p.length >= 8) {
                            set.add(p);
                            if (p.length === 10 || p.length === 11) set.add("55" + p);
                            else if (p.startsWith("55") && (p.length === 12 || p.length === 13)) set.add(p.slice(2));
                        }
                    }
                    if (row.jid) {
                        const j = row.jid.split("@")[0].replace(/\D/g, "");
                        if (j.length >= 8) {
                            set.add(j);
                            if (j.length === 10 || j.length === 11) set.add("55" + j);
                            else if (j.startsWith("55") && (j.length === 12 || j.length === 13)) set.add(j.slice(2));
                        }
                    }
                }
            } catch (err) {
                // Caminho quente (todo isOwner com @lid): avisa uma vez por tipo de erro.
                logger.warnOnce(`resolveAllCandidateDigits:${err.message}`, `[OWNER SERVICE] resolveAllCandidateDigits: não consegui resolver o telefone de ${item}: ${err.message}`);
            }
        }
    }

    return Array.from(set);
}

/**
 * Forma canônica de um telefone para comparar: DDD + os 8 últimos dígitos, sem
 * código do país e sem o nono dígito.
 *
 * Existe porque a comparação anterior era por PEDAÇO de número, nos dois
 * sentidos (`a.includes(b) || b.includes(a)`). Bastava um dono cadastrado com
 * número curto — e `updateOwner` aceitava 8 dígitos — para que todo usuário cujo
 * telefone CONTIVESSE aquela sequência virasse dono, com acesso a desligar o bot
 * e cadastrar outros donos. Achado na auditoria de 2026-09-17.
 * @param {string} digitos
 * @returns {string|null} null quando é curto demais para identificar alguém
 */
function numeroCanonico(digitos) {
    let d = String(digitos || "").replace(/\D/g, "");
    if (d.startsWith("55") && (d.length === 12 || d.length === 13)) d = d.slice(2);
    if (d.length === 10 || d.length === 11) return d.slice(0, 2) + d.slice(-8);
    // Número de fora do Brasil (ou formato que não reconheço): compara inteiro,
    // mas nunca por pedaço.
    return d.length >= 8 ? d : null;
}

/** O telefone consultado é o mesmo do dono cadastrado? Comparação exata. */
function mesmoTelefone(ownerJid, allDigits) {
    const alvo = numeroCanonico(String(ownerJid || "").replace(/\D/g, ""));
    if (!alvo) {
        logger.warnOnce(`ownerCurto:${ownerJid}`, `[OWNER SERVICE] Dono cadastrado com número curto demais para identificar (${ownerJid}); ignorado na checagem.`);
        return false;
    }
    return allDigits.some(d => numeroCanonico(d) === alvo);
}

function isOwner(jid, candidates = []) {
    if (!jid) return false;
    if (env.isOwnerJid(jid)) return true;
    const allDigits = resolveAllCandidateDigits(jid, candidates);
    if (allDigits.some(d => env.isOwnerJid(d + "@s.whatsapp.net"))) return true;

    const owners = getOwners();
    return owners.some(o => o.active && o.jid && mesmoTelefone(o.jid, allDigits));
}

function getOwnerRank(jid, candidates = []) {
    if (!jid) return null;
    const allDigits = resolveAllCandidateDigits(jid, candidates);
    const owners = getOwners();

    for (const o of owners) {
        if (!o.active || !o.jid) continue;
        if (mesmoTelefone(o.jid, allDigits)) {
            return o;
        }
    }

    // Fallback: se estiver no .env mas não registrado explicitamente na lista
    if (env.isOwnerJid(jid) || allDigits.some(d => env.isOwnerJid(d + "@s.whatsapp.net"))) {
        return owners.find(o => o.rank === "Capitão") || { rank: "Capitão", level: 5, name: "", active: true };
    }

    return null;
}

/**
 * Extrai todos os detalhes profundos do perfil do dono no banco de dados SQLite e WhatsApp:
 * • Nick oficial cadastrado no bot via .login (display_nick)
 * • Nome pushName verificado do WhatsApp (name)
 * • Nome registrado no cargo oficial (owner.name)
 * • Telefone e JID canônico
 * • Patente, título personalizado e histórico de nomeação
 * @param {object} targetOwner
 * @param {Array<string>} [extraCandidates]
 * @returns {object}
 */
function resolveOwnerProfileDetails(targetOwner, extraCandidates = []) {
    if (!targetOwner) return null;
    let displayNick = null;
    let pushName = null;
    let phone = targetOwner.phone || null;
    let jid = targetOwner.jid || null;

    try {
        const db = getDatabase();
        const candidateDigits = resolveAllCandidateDigits(jid, extraCandidates);
        let userRow = null;

        if (jid) {
            userRow = db.prepare("SELECT * FROM users WHERE jid = ? OR lid = ?").get(jid, jid);
        }
        if (!userRow && candidateDigits.length > 0) {
            for (const d of candidateDigits) {
                userRow = db.prepare("SELECT * FROM users WHERE phone LIKE ? OR jid LIKE ?").get(`%${d}%`, `%${d}%`);
                if (userRow) break;
            }
        }
        if (!userRow && targetOwner.name) {
            userRow = db.prepare("SELECT * FROM users WHERE LOWER(display_nick) = LOWER(?) OR LOWER(name) = LOWER(?)").get(targetOwner.name, targetOwner.name);
        }

        if (userRow) {
            displayNick = userRow.display_nick || null;
            pushName = userRow.name || null;
            if (!phone && userRow.phone) phone = userRow.phone;
            if (!jid && userRow.jid) jid = userRow.jid;
        }
    } catch (err) {
        logger.warn(`[OWNER SERVICE] resolveOwnerProfileDetails: não consegui ler o perfil de ${jid || targetOwner.rank}: ${err.message}`);
    }

    return {
        displayNick,
        pushName,
        ownerName: targetOwner.name || null,
        phone,
        jid,
        rank: targetOwner.rank,
        customTitle: targetOwner.customTitle || null,
        level: targetOwner.level,
        appointedBy: targetOwner.appointedBy || null,
        appointedAt: targetOwner.appointedAt || null
    };
}

/**
 * Desocupa o slot de dono na hierarquia oficial e limpa os cargos relacionais e de trust
 * @param {object} targetOwner
 * @param {object} senderRank
 * @param {string} actorJid
 * @returns {object|null}
 */
function demoteOwnerComplete(targetOwner, senderRank, actorJid) {
    if (!targetOwner) return null;
    const owners = getOwners();
    const normRank = normalizeRank(targetOwner.rank);
    const slot = owners.find(o => normalizeRank(o.rank) === normRank);
    if (!slot) return null;

    const previousData = {
        rank: slot.rank,
        level: slot.level,
        name: slot.name,
        phone: slot.phone,
        jid: slot.jid,
        customTitle: slot.customTitle || null,
        appointedBy: slot.appointedBy || null,
        appointedAt: slot.appointedAt || null
    };

    slot.active = false;
    slot.name = "";
    slot.phone = "";
    slot.jid = "";
    delete slot.customTitle;
    delete slot.appointedBy;
    delete slot.appointedAt;
    saveOwners(owners);

    if (previousData.jid) {
        try {
            const permissionRepo = require("../database/repositories/permissionRepository");
            permissionRepo.removeUserRole(previousData.jid);
            permissionRepo.setTrusted(previousData.jid, false);

            const digits = previousData.jid.replace(/\D/g, "");
            if (digits) {
                permissionRepo.removeUserRole(digits + "@s.whatsapp.net");
                permissionRepo.setTrusted(digits + "@s.whatsapp.net", false);
            }
        } catch (pErr) {
            logger.warn(`[OWNER SERVICE] Falha ao remover cargo relacional: ${pErr.message}`);
        }
    }

    logger.info(`[OWNER DEMOTE] Patente ${previousData.rank} desocupada por ${senderRank?.rank || 'Dono'} (${actorJid}).`);
    return previousData;
}

/**
 * Envia uma notificação privada via WhatsApp para os Donos do bot (Capitão, Tenente, etc.).
 * @param {object} client - Baileys socket client
 * @param {string} messageText - Conteúdo da mensagem
 * @param {object} [opts] - Opções extras (ex: mentions)
 */
async function notifyDonos(client, messageText, opts = {}) {
    if (!client || !messageText) return;
    const owners = getOwners().filter(o => o.active && o.jid);
    const jids = new Set(owners.map(o => o.jid));
    if (OWNER_JID) jids.add(OWNER_JID);

    for (const targetJid of jids) {
        try {
            await client.sendMessage(targetJid, { text: messageText, mentions: opts.mentions || [] });
        } catch (e) {
            logger.warn(`[NOTIFY DONO WARN] Falha ao enviar para ${targetJid}: ${e.message}`);
        }
    }
}

module.exports = {
    DEFAULT_OWNERS,
    numeroCanonico,
    getOwners,
    saveOwners,
    findOwnerByQuery,
    canModifyOwner,
    updateOwner,
    updateOwnerName: updateOwner,
    removeOwner,
    demoteOwnerComplete,
    resolveOwnerProfileDetails,
    updateRankTitle,
    resetRankTitle,
    isOwner,
    resolveOwnerName,
    getOwnerProfileName,
    getOwnerRank,
    notifyDonos
};

