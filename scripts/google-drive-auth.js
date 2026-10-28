#!/usr/bin/env node
/**
 * Autorização do Google Drive — RODAR UMA VEZ, na sua máquina (não na VPS).
 *
 * Gera o GDRIVE_REFRESH_TOKEN, que é o que permite o bot subir arquivos para a
 * SUA conta (e consumir os SEUS 5 TB) sem você precisar logar de novo. O refresh
 * token não expira enquanto o app não for revogado em myaccount.google.com.
 *
 * Por que não Service Account: ela tem cota própria de 15 GB e não herda o seu
 * plano — upload de arquivo grande morre com 403 storageQuotaExceeded.
 *
 * PASSO A PASSO
 * -------------
 * 1. console.cloud.google.com  ->  criar projeto (ex.: "goat-bot")
 * 2. "APIs e serviços" > "Biblioteca" > procurar "Google Drive API" > ATIVAR
 * 3. "APIs e serviços" > "Tela de permissão OAuth"
 *      - Tipo: Externo    - Preencher nome do app e seu e-mail
 *      - Em "Usuários de teste": ADICIONE O SEU PRÓPRIO E-MAIL
 *        (sem isso o Google bloqueia o login com "app não verificado")
 * 4. "Credenciais" > "Criar credenciais" > "ID do cliente OAuth"
 *      - Tipo de aplicativo: **App para computador** (Desktop app)
 *      - Copiar o Client ID e o Client Secret
 * 5. Rodar:
 *      node scripts/google-drive-auth.js SEU_CLIENT_ID SEU_CLIENT_SECRET
 *    (ou definir GDRIVE_CLIENT_ID / GDRIVE_CLIENT_SECRET no ambiente)
 *
 * O script abre o navegador, você autoriza, e ele imprime as linhas prontas
 * para colar no .env.
 */

const http = require('http')
const https = require('https')
const { exec } = require('child_process')
const { URL, URLSearchParams } = require('url')

const CLIENT_ID = process.argv[2] || process.env.GDRIVE_CLIENT_ID
const CLIENT_SECRET = process.argv[3] || process.env.GDRIVE_CLIENT_SECRET
const PORT = Number(process.env.GDRIVE_AUTH_PORT || 53682)
const REDIRECT = `http://localhost:${PORT}`

// drive.file = o app só enxerga o que ELE MESMO criou. É o escopo mínimo que
// atende o bot e não dá a ele acesso ao resto do seu Drive.
const SCOPE = 'https://www.googleapis.com/auth/drive.file'

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('\n❌ Faltam credenciais.\n')
    console.error('   Uso: node scripts/google-drive-auth.js <CLIENT_ID> <CLIENT_SECRET>\n')
    console.error('   Como obter: leia o cabeçalho deste arquivo (passos 1 a 4).\n')
    process.exit(1)
}

function postForm(url, params) {
    return new Promise((resolve, reject) => {
        const body = new URLSearchParams(params).toString()
        const u = new URL(url)
        const req = https.request({
            hostname: u.hostname,
            path: u.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(body)
            }
        }, res => {
            let d = ''
            res.on('data', c => { d += c })
            res.on('end', () => {
                try {
                    const json = JSON.parse(d)
                    if (json.error) return reject(new Error(`${json.error}: ${json.error_description || ''}`))
                    resolve(json)
                } catch (e) {
                    reject(new Error(`Resposta inválida do Google: ${d.slice(0, 200)}`))
                }
            })
        })
        req.on('error', reject)
        req.write(body)
        req.end()
    })
}

function abrirNavegador(url) {
    const cmd = process.platform === 'win32' ? `start "" "${url}"`
        : process.platform === 'darwin' ? `open "${url}"`
            : `xdg-open "${url}"`
    exec(cmd, err => {
        if (err) console.log('\n(Não consegui abrir o navegador — copie o link acima manualmente.)')
    })
}

const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT,
    response_type: 'code',
    scope: SCOPE,
    // access_type=offline + prompt=consent são OBRIGATÓRIOS para receber o
    // refresh_token. Sem eles o Google devolve só um access token de 1 hora.
    access_type: 'offline',
    prompt: 'consent'
}).toString()

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, REDIRECT)
    const code = url.searchParams.get('code')
    const erro = url.searchParams.get('error')

    if (erro) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end('<h2>Autorizacao negada</h2><p>Pode fechar esta aba.</p>')
        console.error(`\n❌ Autorização negada: ${erro}\n`)
        server.close()
        process.exit(1)
    }
    if (!code) {
        res.writeHead(404).end()
        return
    }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end('<h2>Pronto!</h2><p>Pode fechar esta aba e voltar para o terminal.</p>')
    server.close()

    try {
        console.log('\n⏳ Trocando o código pelo refresh token...')
        const tok = await postForm('https://oauth2.googleapis.com/token', {
            code,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT,
            grant_type: 'authorization_code'
        })

        if (!tok.refresh_token) {
            console.error('\n❌ O Google não devolveu refresh_token.')
            console.error('   Isso acontece quando a conta JÁ autorizou este app antes.')
            console.error('   Revogue em https://myaccount.google.com/permissions e rode de novo.\n')
            process.exit(1)
        }

        // Confirma que o token funciona e mostra o espaço real da conta.
        const about = await new Promise((resolve, reject) => {
            https.get({
                hostname: 'www.googleapis.com',
                path: '/drive/v3/about?fields=storageQuota,user',
                headers: { Authorization: `Bearer ${tok.access_token}` }
            }, r => {
                let d = ''
                r.on('data', c => { d += c })
                r.on('end', () => { try { resolve(JSON.parse(d)) } catch (e) { reject(e) } })
            }).on('error', reject)
        })

        const tb = n => (Number(n) / 1024 ** 4).toFixed(2) + ' TB'
        const quota = about.storageQuota || {}

        console.log('\n' + '='.repeat(64))
        console.log('✅ AUTORIZADO')
        console.log('='.repeat(64))
        console.log(`   Conta:  ${about.user && about.user.emailAddress}`)
        if (quota.limit) {
            console.log(`   Espaco: ${tb(quota.usage)} usados de ${tb(quota.limit)}`)
            console.log(`   Livre:  ${tb(Number(quota.limit) - Number(quota.usage))}`)
        } else {
            console.log('   Espaco: ilimitado')
        }
        console.log('\n📋 Cole no .env (e no .env da VPS):\n')
        console.log(`GDRIVE_CLIENT_ID=${CLIENT_ID}`)
        console.log(`GDRIVE_CLIENT_SECRET=${CLIENT_SECRET}`)
        console.log(`GDRIVE_REFRESH_TOKEN=${tok.refresh_token}`)
        console.log('\n   Depois rode:  node scripts/google-drive-check.js')
        console.log('   (ele cria a pasta do bot e imprime o GDRIVE_FOLDER_ID)\n')
        process.exit(0)
    } catch (e) {
        console.error(`\n❌ Falhou: ${e.message}\n`)
        process.exit(1)
    }
})

server.listen(PORT, () => {
    console.log('\n🔐 Autorização do Google Drive')
    console.log(`   Escutando em ${REDIRECT}\n`)
    console.log('   Abrindo o navegador. Se não abrir, acesse:\n')
    console.log('   ' + authUrl + '\n')
    console.log('   ⚠️  A tela "Google não verificou este app" é esperada:')
    console.log('      clique em "Avançado" > "Acessar <nome do app> (não seguro)".')
    console.log('      É o SEU app, autorizado por VOCÊ, na SUA conta.\n')
    abrirNavegador(authUrl)
})
