/**
 * Testes do GroupAuthService — autenticação de admin de grupo
 */
// Isola o banco: sem isto a suite escrevia no banco de PRODUCAO.
process.env.NODE_ENV = 'test'

const assert = require('assert')
const groupAuth = require('../src/services/groupAuthService')
const permissionService = require('../src/services/permissionService')

const GROUP = '1203630000000000000@g.us'
const OWNER = '5511999999999@s.whatsapp.net'
const OWNER_DEVICE = '5511999999999:10@s.whatsapp.net'
const SUPER_ADMIN_DEVICE = '5544999999999:3@s.whatsapp.net'
const MEMBER = '5511999997777@s.whatsapp.net'
const BOT_RAW = '639121522409:10@s.whatsapp.net'
const BOT_LID = '204741234567@lid'

async function run() {
    // ---- Cliente fake ----
    const client = {
        user: { id: BOT_RAW, lid: BOT_LID },
        async groupMetadata(jid) {
            assert.strictEqual(jid, GROUP)
            return {
                id: GROUP,
                subject: 'Teste',
                participants: [
                    { id: OWNER_DEVICE, admin: 'admin' },
                    { id: MEMBER },
                    { id: BOT_RAW, admin: 'superadmin' }
                ]
            }
        }
    }
    groupAuth.attach(client)

    // ---- 1. mesmos usuários com tolerância a dispositivo ----
    assert.ok(groupAuth.sameUser(OWNER, OWNER_DEVICE), 'device suffix deve ser ignorado')
    assert.ok(groupAuth.sameUser('12345@lid', '12345:7@lid'), 'sufixo em LID deve ser ignorado')
    assert.ok(!groupAuth.sameUser(OWNER, MEMBER), 'usuários diferentes')

    // ---- 1.1 getBotJids centraliza a identidade do bot (número + LID) ----
    const botJids = groupAuth.getBotJids(client)
    assert.ok(botJids.has('639121522409@s.whatsapp.net'), 'JID real normalizado presente')
    assert.ok(botJids.has(BOT_LID), 'LID presente')
    assert.strictEqual(botJids.size, 2, 'não deve conter duplicatas')

    // ---- 1.2 getParticipantJid extrai o participante normalizado ----
    assert.strictEqual(groupAuth.getParticipantJid({ key: { participant: '5511999999999:10@s.whatsapp.net' } }), '5511999999999@s.whatsapp.net')
    assert.strictEqual(groupAuth.getParticipantJid({ key: { remoteJid: '5511999997777@s.whatsapp.net' } }), '5511999997777@s.whatsapp.net')
    assert.strictEqual(groupAuth.getParticipantJid({}), '')

    // ---- 2. isGroupAdmin: admin com dispositivo, membro não, LID não ----
    assert.strictEqual(await groupAuth.isGroupAdmin(GROUP, OWNER), true, 'dono deve ser admin')
    assert.strictEqual(await groupAuth.isGroupAdmin(GROUP, OWNER_DEVICE), true, 'admin com :10 deve ser admin')
    assert.strictEqual(await groupAuth.isGroupAdmin(GROUP, MEMBER), false, 'membro não é admin')
    assert.strictEqual(await groupAuth.isGroupAdmin(GROUP, '5511000000009@s.whatsapp.net'), false, 'forasteiro não é admin')

    // ---- 3. isBotAdmin: bot por JID real e por LID ----
    assert.strictEqual(await groupAuth.isBotAdmin(GROUP), true, 'bot é admin por JID real')

    // ---- 3.1 Bot admin via LID (participantes do grupo em formato LID) ----
    const lidClient = {
        user: { id: '639121522409:10@s.whatsapp.net', lid: BOT_LID },
        async groupMetadata(jid) {
            assert.strictEqual(jid, GROUP)
            return {
                id: GROUP,
                participants: [
                    { id: `${BOT_LID.split('@')[0]}:10@lid`, admin: 'superadmin' }, // LID com sufixo de dispositivo (:10@lid)
                    { id: '204741234560@lid' },
                    { id: '5511999999999@s.whatsapp.net', admin: 'admin' }
                ]
            }
        }
    }
    groupAuth.attach(lidClient)
    groupAuth.invalidate(GROUP)
    assert.strictEqual(await groupAuth.isBotAdmin(GROUP), true, 'bot admin detectado em grupo LID (superadmin)')
    assert.strictEqual(await groupAuth.isGroupAdmin(GROUP, '5511999999999@s.whatsapp.net'), true, 'admin por número em grupo misto')

    // ---- 3.2 Bot NÃO admin (ausente/participante comum) ----
    const noAdminClient = {
        user: { id: '639121522409:10@s.whatsapp.net', lid: BOT_LID },
        async groupMetadata() {
            return { participants: [{ id: OWNER, admin: 'admin' }] }
        }
    }
    groupAuth.attach(noAdminClient)
    groupAuth.invalidate(GROUP)
    assert.strictEqual(await groupAuth.isBotAdmin(GROUP), false, 'bot ausente não é admin')
    assert.strictEqual(await groupAuth.isBotAdmin(GROUP, { refresh: true }), false, 'refresh mantém bot como não-admin')

    // ---- 3.3 Bot superadmin detectado como admin ----
    const superAdminClient = {
        user: { id: '5544999999999:3@s.whatsapp.net' },
        async groupMetadata() {
            return { participants: [{ id: '5544999999999@s.whatsapp.net', admin: 'superadmin' }] }
        }
    }
    groupAuth.attach(superAdminClient)
    groupAuth.invalidate(GROUP)
    assert.strictEqual(await groupAuth.isBotAdmin(GROUP), true, 'superadmin conta como admin do bot')

    // ---- 3.4 permissionService.isBotAdmin (função pura) ----
    const metaSuper = { participants: [{ id: BOT_RAW, admin: 'superadmin' }] }
    assert.ok(permissionService.isBotAdmin(metaSuper, '639121522409@s.whatsapp.net'), 'pure isBotAdmin: superadmin via número')
    assert.ok(permissionService.isBotAdmin(metaSuper, [BOT_RAW, BOT_LID]), 'pure isBotAdmin: aceita array de JIDs')
    assert.ok(!permissionService.isBotAdmin({ participants: [{ id: BOT_RAW }] }, BOT_RAW), 'pure isBotAdmin: participante SEM cargo não é admin')
    assert.ok(!permissionService.isBotAdmin({ participants: [] }, BOT_RAW), 'pure isBotAdmin: lista vazia')
    assert.ok(!permissionService.isBotAdmin(null, BOT_RAW), 'pure isBotAdmin: metadata nulo')
    assert.ok(!permissionService.isBotAdmin({ participants: [{ id: MEMBER, admin: 'admin' }] }, BOT_RAW), 'pure isBotAdmin: admin de outro usuário não conta')

    // ---- 4. getAdmins ----
    groupAuth.attach(client)
    groupAuth.invalidate(GROUP)
    const admins = await groupAuth.getAdmins(GROUP)
    assert.ok(admins.includes(groupAuth.normalizeJid(OWNER_DEVICE)), 'dono está na lista')
    assert.ok(admins.includes(groupAuth.normalizeJid(BOT_RAW)), 'bot está na lista')
    assert.ok(!admins.includes(MEMBER), 'membro não está na lista')

    // ---- 5. Invalidação limpa o cache ----
    let calls = 0
    const countingClient = {
        user: { id: BOT_RAW },
        async groupMetadata() {
            calls += 1
            return { participants: [{ id: OWNER, admin: 'admin' }] }
        }
    }
    groupAuth.attach(countingClient)
    groupAuth.invalidate(GROUP)
    await groupAuth.getGroupData(GROUP)
    await groupAuth.getGroupData(GROUP)
    assert.strictEqual(calls, 1, 'cache deve evitar busca repetida')

    // ---- 6. refresh força nova busca ----
    await groupAuth.getGroupData(GROUP, { refresh: true })
    assert.strictEqual(calls, 2, 'refresh deve buscar de novo')

    // ---- 7. bot não-admin (participante comum, sem cargo) ----
    const noAdminClientB = {
        user: { id: '639121522409:10@s.whatsapp.net' },
        async groupMetadata() {
            return { participants: [{ id: OWNER, admin: 'admin' }, { id: '639121522409@s.whatsapp.net' }] }
        }
    }
    groupAuth.attach(noAdminClientB)
    groupAuth.invalidate(GROUP)
    assert.strictEqual(await groupAuth.isBotAdmin(GROUP), false, 'bot participante comum não é admin')

    // ---- 8. sem cliente vinculado deve lançar ----
    groupAuth.attach(null)
    groupAuth.invalidate(GROUP)
    await assert.rejects(() => groupAuth.getGroupData(GROUP), /não vinculado/, 'sem cliente deve lançar')

    // ---- 9. resolveRealJid: LID -> JID real (Baileys signalRepository.lidMapping) ----
    const OWNER_LID = '22209997320394@lid'
    const realJidClient = {
        signalRepository: {
            lidMapping: {
                async getPNForLID(lid) {
                    if (lid === '22209997320394@lid') return '5511999999999:0@s.whatsapp.net'
                    if (lid === '42224477798582@lid') return '5511999997777:0@s.whatsapp.net'
                    return null
                }
            }
        }
    }

    assert.strictEqual(await groupAuth.resolveRealJid(realJidClient, '5511999999999:10@s.whatsapp.net'), '5511999999999@s.whatsapp.net', 'JID real volta normalizado, sem busca')
    assert.strictEqual(await groupAuth.resolveRealJid(realJidClient, OWNER_LID), '5511999999999@s.whatsapp.net', 'LID do dono resolve para o número real')
    assert.strictEqual(await groupAuth.resolveRealJid(realJidClient, OWNER_LID), '5511999999999@s.whatsapp.net', 'resolução com cache')
    assert.strictEqual(await groupAuth.resolveRealJid(realJidClient, '44224477798581@lid'), '44224477798581@lid', 'LID sem mapeamento mantém o LID')
    assert.strictEqual(await groupAuth.resolveRealJid(realJidClient, ''), '', 'vazio retorna vazio')

    const erringClient = {
        signalRepository: {
            lidMapping: {
                async getPNForLID() {
                    throw new Error('boom')
                }
            }
        }
    }
    assert.strictEqual(await groupAuth.resolveRealJid(erringClient, '11111111111111@lid'), '11111111111111@lid', 'erro na resolução degrada para o LID')

    // ---- 10. resolveMemberJid: alvo no namespace do grupo (LID vs PN) ----
    const LID_GROUP = '1203630000000000000@g.us'
    const GROUPLID = {
        id: LID_GROUP,
        participants: [{ id: '22209997320394@lid', admin: 'admin' }, { id: '42224477798582@lid' }]
    }
    const GROUP_PN = {
        id: GROUP,
        participants: [{ id: OWNER, admin: 'admin' }, { id: MEMBER }]
    }

    const lidRepoClient = {
        signalRepository: {
            lidMapping: {
                async getPNForLID(lid) {
                    if (lid === '22209997320394@lid') return '5511999999999:0@s.whatsapp.net'
                    if (lid === '42224477798582@lid') return '5511999997777:0@s.whatsapp.net'
                    return null
                },
                async getLIDForPN(pn) {
                    if (pn === '5511999999999') return '22209997320394@lid'
                    if (pn === '5511999997777') return '42224477798582@lid'
                    return null
                }
            }
        }
    }

    assert.strictEqual(
        await groupAuth.resolveMemberJid(lidRepoClient, '5511999999999@s.whatsapp.net', GROUPLID),
        '22209997320394@lid',
        'grupo LID + alvo real -> deve resolver para @lid'
    )
    assert.strictEqual(
        await groupAuth.resolveMemberJid(lidRepoClient, '22209997320394@lid', GROUPLID),
        '22209997320394@lid',
        'grupo LID + alvo já em @lid -> inalterado'
    )
    assert.strictEqual(
        await groupAuth.resolveMemberJid(lidRepoClient, '42224477798582@lid', GROUP_PN),
        '5511999997777@s.whatsapp.net',
        'grupo PN + alvo em @lid -> deve resolver para número real'
    )
    assert.strictEqual(
        await groupAuth.resolveMemberJid(lidRepoClient, MEMBER, GROUP_PN),
        MEMBER,
        'grupo PN + alvo real -> inalterado'
    )
    assert.strictEqual(
        await groupAuth.resolveMemberJid(lidRepoClient, '5599999999999@s.whatsapp.net', GROUPLID),
        '5599999999999@s.whatsapp.net',
        'sem mapeamento PN->LID mantém o original (não lança)'
    )
    assert.strictEqual(
        await groupAuth.resolveMemberJid(lidRepoClient, '5599999999999@s.whatsapp.net', GROUP_PN),
        '5599999999999@s.whatsapp.net',
        'grupo PN: qualquer real mantém original'
    )
    assert.strictEqual(await groupAuth.resolveMemberJid(lidRepoClient, '', GROUPLID), '', 'vazio retorna vazio')

    // ---- 10.1 fallback por participantes (sem getLIDForPN, só getPNForLID) ----
    const scanOnlyRepo = {
        signalRepository: {
            lidMapping: {
                async getPNForLID(lid) {
                    if (lid === '22209997320394@lid') return '5511999999999:0@s.whatsapp.net'
                    return null
                }
            }
        }
    }
    assert.strictEqual(
        await groupAuth.resolveMemberJid(scanOnlyRepo, '5511999999999@s.whatsapp.net', GROUPLID),
        '22209997320394@lid',
        'fallback: escaneia LIDs dos participantes via getPNForLID e acha o alvo'
    )
    assert.strictEqual(
        await groupAuth.resolveMemberJid(scanOnlyRepo, '5599999999999@s.whatsapp.net', GROUPLID),
        '5599999999999@s.whatsapp.net',
        'fallback: alvo sem participante correspondente mantém original'
    )

    console.log('✅ group-auth test: all assertions passed')
}

run().catch(err => {
    console.error('❌ group-auth test failed:', err)
    process.exit(1)
})