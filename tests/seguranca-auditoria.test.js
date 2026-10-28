process.env.NODE_ENV = 'test'

/**
 * Regressão dos achados da auditoria de segurança de 2026-09-17.
 *
 * Cada teste aqui corresponde a um buraco que existia de verdade e que um
 * usuário comum de grupo conseguia usar só mandando mensagem. Se algum voltar,
 * este arquivo acusa.
 */

const assert = require('assert')
const fs = require('fs')
const path = require('path')

let ok = 0, falhou = 0
function teste(nome, fn) {
    try { fn(); ok++; console.log(`  ✅ PASS: ${nome}`) }
    catch (err) { falhou++; console.log(`  ❌ FAIL: ${nome}\n     ${err.message}`) }
}

const raiz = path.join(__dirname, '..')
const ler = p => fs.readFileSync(path.join(raiz, p), 'utf8')

console.log('\n🧪 Segurança — regressão da auditoria...\n')

// ── 1. Desvio por link pulava todas as checagens ──────────────────
teste('link colado vira pedido normal, não atalho que pula as checagens', () => {
    const fonte = ler('src/handlers/commandDispatcher.js')
    // Só linhas de código: a explicação do bug cita a chamada antiga de propósito.
    const codigo = fonte.split('\n').filter(l => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n')
    assert.ok(!/mediaCmd\.execute\(context\)/.test(codigo),
        'o dispatcher voltou a executar o comando de mídia direto, pulando banimento, permissão, módulo, aluguel e limite')
    assert.ok(/ehLinkColado/.test(codigo), 'sumiu a checagem de link colado')
})

teste('palavra que só contém "youtu" não é tratada como link', () => {
    // A condição antiga era `commandName.includes('youtu')`: `.youtube`,
    // `.youtuber` e `.youtu` viravam download e furavam as checagens.
    const fonte = ler('src/handlers/commandDispatcher.js')
    const m = fonte.match(/function ehLinkColado\([\s\S]*?\n\}/)
    assert.ok(m, 'não achei a função ehLinkColado')
    const ehLinkColado = new Function('return ' + m[0])()
    for (const nome of ['youtube', 'youtuber', 'youtu', 'tiktokzinho', 'x']) {
        assert.strictEqual(ehLinkColado(nome), false, `"${nome}" foi tratado como link`)
    }
    for (const link of ['https://youtu.be/abc', 'http://x.com/a/status/1', 'https://vt.tiktok.com/xyz/', 'youtu.be/abc']) {
        assert.strictEqual(ehLinkColado(link), true, `"${link}" não foi reconhecido como link`)
    }
})

// ── 2. .link entregava o convite do grupo a qualquer membro ───────
teste('.link exige ser administrador do grupo', () => {
    const cmd = require('../src/commands/admin/link.js')
    assert.strictEqual(cmd.adminOnly, true, '.link voltou a ficar aberto para qualquer membro')
})

// ── 3. .regex travava o bot inteiro ───────────────────────────────
teste('padrão com repetição dentro de repetição é recusado', () => {
    const { testRegex } = require('../src/services/devService')
    const explosivos = ['(a+)+$', '(a|a)*$', '(\\d*)+$', '([a-z]+)*$', '(x{2,}){3,}']
    for (const p of explosivos) {
        assert.throws(() => testRegex(p, '', 'aaaaaaaaaaaaaaaaaaaaX'), new RegExp('repetição'), `passou: ${p}`)
    }
})

teste('expressão comum continua funcionando', () => {
    const { testRegex } = require('../src/services/devService')
    const r = testRegex('\\d+', 'g', 'tenho 3 gatos e 12 peixes')
    assert.strictEqual(r.matched, true)
    assert.deepStrictEqual(r.allMatches, ['3', '12'])
})

teste('texto de teste gigante é recusado antes de rodar a busca', () => {
    const { testRegex } = require('../src/services/devService')
    assert.throws(() => testRegex('a', '', 'x'.repeat(5000)), /longo demais/)
    assert.throws(() => testRegex('a'.repeat(500), '', 'x'), /longo demais/)
})

// ── 4. Dono reconhecido por pedaço de número ──────────────────────
teste('telefone de dono é comparado inteiro, nunca por pedaço', () => {
    const { numeroCanonico } = require('../src/services/ownerService')
    // O caso real: dono cadastrado com número curto fazia qualquer pessoa cujo
    // telefone contivesse aquela sequência virar dono.
    assert.strictEqual(numeroCanonico('97379643'), '97379643')
    assert.notStrictEqual(numeroCanonico('5535973796431'), numeroCanonico('5511997379643'),
        'dois telefones diferentes ficaram com a mesma forma canônica')
    // Mesmo número escrito de jeitos diferentes tem de bater.
    assert.strictEqual(numeroCanonico('5535973796431'), numeroCanonico('35973796431'))
    assert.strictEqual(numeroCanonico('553597379643'), numeroCanonico('3597379643'))
    assert.strictEqual(numeroCanonico('123'), null, 'número curto demais deveria ser recusado')
})

teste('cadastro de dono recusa número curto', () => {
    const fonte = ler('src/services/ownerService.js')
    assert.ok(/rawDigits\.length >= 12/.test(fonte), 'voltou a aceitar telefone curto no cadastro de dono')
})

// ── 5. Link de fora fingindo ser do Pinterest/Kwai ────────────────
teste('endereço é conferido pelo host, não por pedaço de texto', () => {
    const { ehHostDe } = require('../src/services/media/urlSeguro')
    assert.strictEqual(ehHostDe('https://servidor-do-atacante.tld/x?ref=pinterest.com', ['pinterest.com']), false)
    assert.strictEqual(ehHostDe('https://pinterest.com.atacante.tld/a', ['pinterest.com']), false)
    assert.strictEqual(ehHostDe('https://br.pinterest.com/pin/123/', ['pinterest.com']), true)
    assert.strictEqual(ehHostDe('https://www.kwai.com/video/abc', ['kwai.com']), true)
    assert.strictEqual(ehHostDe('https://meusite.tld/kwai.com/x', ['kwai.com']), false)
})

teste('endereço para dentro da própria máquina é recusado', () => {
    const { urlSegura } = require('../src/services/media/urlSeguro')
    for (const u of ['http://127.0.0.1:3000/qr', 'http://localhost/painel', 'http://169.254.169.254/latest/meta-data/', 'http://192.168.0.10/', 'file:///etc/passwd']) {
        assert.strictEqual(urlSegura(u), false, `deixou passar: ${u}`)
    }
    assert.strictEqual(urlSegura('https://www.youtube.com/watch?v=abc'), true)
})

// ── 6. Download sem fim e sem limite ──────────────────────────────
teste('downloads têm teto de saltos e de tamanho', () => {
    for (const arq of ['src/services/pinterestService.js', 'src/services/media/youtubeFallback.js']) {
        const fonte = ler(arq)
        assert.ok(/saltos/.test(fonte), `${arq} sem contador de redirecionamento`)
        assert.ok(/MAX_BYTES/.test(fonte), `${arq} sem teto de tamanho`)
    }
    const dl = ler('src/services/media/mediaDownloader.js')
    // O teto deixou de ser "2G" fixo em 2026-09-20 e passou a acompanhar o
    // destino (MEDIA_LIMITS), mas continua obrigatório e sempre finito.
    assert.ok(/'--max-filesize', String\(Math\.floor\(tetoBytes\)\)/.test(dl),
        'o yt-dlp voltou a baixar sem teto de tamanho')
    assert.ok(/MAX_DRIVE_FILE_SIZE_BYTES|MAX_FILE_SIZE_BYTES/.test(dl),
        'o teto do yt-dlp não vem mais dos limites de mídia')
    const { MEDIA_LIMITS } = require('../src/services/media/constants')
    for (const teto of [MEDIA_LIMITS.MAX_FILE_SIZE_BYTES, MEDIA_LIMITS.MAX_DRIVE_FILE_SIZE_BYTES]) {
        assert.ok(Number.isFinite(teto) && teto > 0, `teto de tamanho inválido: ${teto}`)
    }
})

// ── 7. IA respondia banido e sem limite de uso ────────────────────
teste('resposta por IA confere banimento e limite antes de gastar', () => {
    const fonte = ler('src/handlers/messageHandler.js')
    const trecho = fonte.slice(fonte.indexOf("veredito.tipo === 'pergunta'"), fonte.indexOf('askAI(cleanPrompt)'))
    assert.ok(/isUserBanned/.test(trecho), 'a resposta por IA voltou a atender quem está banido')
    assert.ok(/checkRateLimit/.test(trecho), 'a resposta por IA voltou a não ter limite de uso')
})

// ── 8. Cookie de um usuário virava o do bot inteiro ───────────────
teste('cookie pessoal não vira cookie de todo mundo', () => {
    const fonte = ler('src/services/media/mediaArgs.js')
    assert.ok(!/melhorArquivoDeUsuario/.test(fonte),
        'o bot voltou a promover o cookie de um usuário a cookie global')
})

teste('cookie salvo sai sempre no formato que o yt-dlp aceita', () => {
    const { sanitizarCookies } = require('../src/services/media/mediaArgs')
    const limpo = sanitizarCookies('global # Netscape HTTP Cookie File\n.youtube.com\tTRUE\t/\tFALSE\t1\tSID\tX\n')
    assert.ok(limpo.startsWith('# Netscape HTTP Cookie File'))
})

// ── 9. Afiliados (cotas de link) abertos a qualquer membro ─────────
// O módulo Divulgação (campanhas) foi removido em 2026-10-15; sobrou o programa de afiliados.
teste('o comando de afiliados exige administrador', () => {
    const cmd = require('../src/commands/admin/afiliado.js')
    assert.strictEqual(cmd.adminOnly, true, `.${cmd.name} está aberto para qualquer membro`)
})

// ── 10. SSRF: a lista antiga comparava texto (revisão de 2026-09-21) ──
teste('rede interna barrada por faixa de IP, não por texto', () => {
    const { urlSegura } = require('../src/services/media/urlSeguro')
    const internos = [
        'http://127.0.0.2/', 'http://[::1]/', 'http://[::ffff:127.0.0.1]/', 'http://2130706433/', 'http://0x7f.1/',
        'http://169.254.1.1/', 'http://100.64.0.1/', 'http://printer.local/',
        // Containers vizinhos na VPS: nome sem ponto, resolvido pelo DNS do Docker.
        'http://bgutil_pot_provider:4416/', 'http://goat_whisper/'
    ]
    for (const u of internos) assert.strictEqual(urlSegura(u), false, `deixou passar: ${u}`)
    for (const u of ['https://vm.tiktok.com/abc', 'https://1.1.1.1/', 'https://www.dropbox.com/s/a']) {
        assert.strictEqual(urlSegura(u), true, `barrou link público: ${u}`)
    }
})

teste('quem segue redirecionamento confere cada salto', () => {
    // .encurtador usava fetch com redirect "follow" e .curlemu o axios com até 5
    // saltos: um link público que redirecionasse para dentro da VPS passava.
    // Só código: o comentário explica o defeito citando a chamada antiga.
    const enc = ler('src/commands/adicional/encurtador.js').split('\n').filter(l => !/^\s*(\/\/|\*)/.test(l)).join('\n')
    assert.ok(/buscarComSeguranca/.test(enc) && !/redirect:\s*'follow'/.test(enc), '.encurtador voltou a seguir redirecionamento sem conferir')
    assert.ok(/maxRedirects:\s*0/.test(ler('src/commands/dev/curlemu.js')), '.curlemu voltou a seguir redirecionamento sozinho')
    const us = ler('src/services/media/urlSeguro.js')
    assert.ok(/redirect:\s*'manual'/.test(us) && /urlSeguraResolvida\(atual\)/.test(us), 'buscarComSeguranca parou de conferir cada salto')
})

teste('download e ficha de link conferem para onde o nome resolve', () => {
    assert.ok(/urlSeguraResolvida/.test(ler('src/services/media/mediaDownloader.js')), 'o download não confere o DNS')
    assert.ok(/urlSeguraResolvida/.test(ler('src/services/media/mediaResolver.js')), 'os metadados não conferem o DNS')
    assert.ok(/urlSeguraResolvida/.test(ler('src/services/media/fichaTecnica.js')), 'a ficha de link não confere o DNS')
})

teste('nenhum catch vazio no código (regra do CLAUDE.md)', () => {
    const vazios = []
    ;(function varre(d) {
        for (const e of fs.readdirSync(d, { withFileTypes: true })) {
            const p = path.join(d, e.name)
            if (e.isDirectory()) varre(p)
            else if (e.name.endsWith('.js') && /catch\s*\(\s*\w*\s*\)\s*\{\s*\}/.test(fs.readFileSync(p, 'utf8'))) vazios.push(path.relative(raiz, p))
        }
    })(path.join(raiz, 'src'))
    assert.deepStrictEqual(vazios, [], `catch vazio em: ${vazios.slice(0, 5).join(', ')}`)
})

teste('consulta ao WhatsApp tem tempo limite (senão a mídia trava para sempre)', () => {
    // defaultQueryTimeoutMs: 0 fez a conexão de mídia do Baileys esperar para
    // sempre em 2026-09-21: .dossie/.perfil paravam no ⏳ e nenhuma mídia saía.
    const fonte = ler('src/core/connection.js')
    const m = fonte.match(/defaultQueryTimeoutMs:\s*(\d+)/)
    assert.ok(m && Number(m[1]) >= 10000, `defaultQueryTimeoutMs = ${m && m[1]} (0 = espera infinita)`)
    assert.ok(/client\.end\(new Error\('conexão de mídia travada'\)\)/.test(fonte), 'sumiu a recriação do socket quando a mídia trava')
})

teste('config carrega sozinha, sem dependência circular com o logger', () => {
    // Em 2026-09-21 paths.js passou a carregar o logger, que carrega paths.js:
    // o bot subia (carrega o logger antes), mas o healthcheck do Docker carrega
    // paths.js primeiro, quebrava, e o container ficava "unhealthy".
    const { spawnSync } = require('child_process')
    for (const arq of ['src/config/paths.js', 'src/config/env.js']) {
        const r = spawnSync(process.execPath, ['-e', `require(${JSON.stringify(path.join(raiz, arq))}); require(${JSON.stringify(path.join(raiz, 'src/core/logger.js'))})`], { encoding: 'utf8', env: { ...process.env, NODE_ENV: 'production' } })
        assert.strictEqual(r.status, 0, `${arq} carregado primeiro quebra: ${(r.stderr || '').split('\n').find(l => /Error/.test(l)) || r.stderr}`)
    }
})

console.log(`\n📊 Segurança: ✅ ${ok}  ❌ ${falhou}\n`)
process.exit(falhou > 0 ? 1 : 0)
