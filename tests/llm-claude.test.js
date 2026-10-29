process.env.NODE_ENV = 'test'

/**
 * Claude como motor do .ia (2026-10-15): provedor opcional do llmService.
 * Sem ANTHROPIC_API_KEY nada muda; com ela o Claude vai primeiro e os gratuitos ficam de reserva.
 * `fetch` é simulado: nenhum teste chama a API de verdade nem gasta crédito.
 */

const assert = require('assert')

const CHAVES = ['ANTHROPIC_API_KEY', 'ANTHROPIC_MODEL', 'ANTHROPIC_DAILY_MAX_CALLS', 'ANTHROPIC_DAILY_MAX_TOKENS',
    'GEMINI_API_KEY', 'GROQ_API_KEY', 'PERPLEXITY_API_KEY', 'CLOUDFLARE_ACCOUNT_ID', 'CLOUDFLARE_API_TOKEN', 'OLLAMA_URL']

const fetchOriginal = global.fetch
const chamadas = []
function simularFetch(resposta) {
    chamadas.length = 0
    global.fetch = async (url, opcoes) => {
        chamadas.push({ url: String(url), opcoes })
        const r = typeof resposta === 'function' ? resposta(String(url), opcoes) : resposta
        const corpo = typeof r.corpo === 'string' ? r.corpo : JSON.stringify(r.corpo)
        return { ok: (r.status || 200) < 400, status: r.status || 200, text: async () => corpo }
    }
}

let ok = 0, falhou = 0
async function teste(nome, fn) {
    try { await fn(); ok++; console.log(`  ✅ PASS: ${nome}`) }
    catch (err) { falhou++; console.log(`  ❌ FAIL: ${nome}\n     ${err.message}`) }
}

const llm = require('../src/services/llmService')
// Depois do require: o dotenv carrega o .env nele; zerar antes deixava as chaves do .env voltarem.
for (const k of CHAVES) delete process.env[k]

const RESPOSTA_CLAUDE = { corpo: { content: [{ type: 'text', text: 'Olá! Sou o **Claude**.' }], usage: { input_tokens: 40, output_tokens: 20 } } }

async function main() {
    console.log('\n🧪 Claude como motor do .ia...\n')

    // Desde 2026-10-26 o gratuito (Pollinations) é reserva fixa; o que se testa é não sair para provedor pago.
    await teste('sem chave: não há provedor pago e nenhuma chamada vai para a Anthropic', async () => {
        simularFetch(RESPOSTA_CLAUDE)
        assert.strictEqual(llm.hasProvider(), false)
        await llm.ask('oi')
        assert.ok(chamadas.every(c => !c.url.includes('api.anthropic.com')), `chamou: ${chamadas.map(c => c.url).join(', ')}`)
    })

    await teste('com chave: pede à API da Anthropic com os cabeçalhos e o corpo certos', async () => {
        process.env.ANTHROPIC_API_KEY = 'sk-ant-teste'
        simularFetch(RESPOSTA_CLAUDE)
        const r = await llm.ask('quem é você?', { system: 'Responda curto.' })
        assert.ok(r && /Claude/.test(r), `resposta: ${r}`)
        assert.strictEqual(chamadas.length, 1)
        const c = chamadas[0]
        assert.strictEqual(c.url, 'https://api.anthropic.com/v1/messages')
        assert.strictEqual(c.opcoes.headers['x-api-key'], 'sk-ant-teste')
        assert.strictEqual(c.opcoes.headers['anthropic-version'], '2023-06-01')
        const corpo = JSON.parse(c.opcoes.body)
        assert.strictEqual(corpo.model, 'claude-haiku-5-5')
        assert.strictEqual(corpo.system, 'Responda curto.')
        assert.deepStrictEqual(corpo.messages, [{ role: 'user', content: 'quem é você?' }])
        assert.ok(corpo.max_tokens > 0)
        assert.ok(llm.providersAtivos().some(p => /Claude/.test(p)))
    })

    await teste('ANTHROPIC_MODEL troca o modelo', async () => {
        process.env.ANTHROPIC_MODEL = 'claude-sonnet-5-5'
        simularFetch(RESPOSTA_CLAUDE)
        await llm.ask('teste de modelo')
        assert.strictEqual(JSON.parse(chamadas[0].opcoes.body).model, 'claude-sonnet-5-5')
        delete process.env.ANTHROPIC_MODEL
    })

    await teste('o uso do dia soma as chamadas e os tokens', async () => {
        const antes = llm.usoClaude()
        simularFetch(RESPOSTA_CLAUDE)
        await llm.ask('contando')
        const depois = llm.usoClaude()
        assert.strictEqual(depois.chamadas, antes.chamadas + 1)
        assert.strictEqual(depois.tokens, antes.tokens + 60)
    })

    await teste('com a chave do Claude ele é o motor ÚNICO: Groq esquecido no .env não responde no lugar', async () => {
        process.env.GROQ_API_KEY = 'gsk-teste'
        process.env.GEMINI_API_KEY = 'gem-teste'
        simularFetch({ status: 500, corpo: { error: { message: 'indisponível' } } })
        await llm.ask('quem manda aqui?')
        // A reserva gratuita pode responder; Groq e Gemini não podem ser chamados com a chave do Claude.
        assert.ok(chamadas[0].url.includes('api.anthropic.com'), `primeira chamada: ${chamadas[0].url}`)
        assert.ok(chamadas.every(c => !/groq\.com|generativelanguage/.test(c.url)), `chamou outro provedor: ${chamadas.map(c => c.url).join(', ')}`)
        delete process.env.GROQ_API_KEY
        delete process.env.GEMINI_API_KEY
    })

    await teste('teto diário atingido: a Anthropic não é chamada (a reserva gratuita pode responder)', async () => {
        process.env.ANTHROPIC_DAILY_MAX_CALLS = String(llm.usoClaude().chamadas) // já estourou
        simularFetch(RESPOSTA_CLAUDE)
        try {
            await llm.ask('e agora?')
            assert.strictEqual(await llm.pesquisar('e a busca?'), null)
            assert.ok(chamadas.every(c => !c.url.includes('api.anthropic.com')), 'chamou a Anthropic apesar do teto')
        } finally {
            delete process.env.ANTHROPIC_DAILY_MAX_CALLS
        }
    })

    await teste('pesquisar: usa a ferramenta de busca na web e devolve texto + fontes citadas', async () => {
        simularFetch({
            corpo: {
                stop_reason: 'end_turn',
                content: [
                    { type: 'server_tool_use', id: 's1', name: 'web_search', input: { query: 'dólar hoje' } },
                    { type: 'web_search_tool_result', tool_use_id: 's1', content: [
                        { type: 'web_search_result', url: 'https://exemplo.com/a', title: 'Cotação A' },
                        { type: 'web_search_result', url: 'https://exemplo.com/b', title: 'Cotação B' }
                    ] },
                    { type: 'text', text: 'O dólar fechou a *R$ 5,40*.', citations: [
                        { type: 'web_search_result_location', url: 'https://exemplo.com/a', title: 'Cotação A', cited_text: '5,40' }
                    ] }
                ],
                usage: { input_tokens: 100, output_tokens: 30 }
            }
        })
        const r = await llm.pesquisar('quanto está o dólar hoje?')
        assert.ok(r && /R\$ 5,40/.test(r.text), JSON.stringify(r))
        assert.deepStrictEqual(r.sources.map(s => s.url), ['https://exemplo.com/a', 'https://exemplo.com/b'])
        const corpo = JSON.parse(chamadas[0].opcoes.body)
        assert.ok(Array.isArray(corpo.tools) && corpo.tools[0].name === 'web_search' && /^web_search_/.test(corpo.tools[0].type), JSON.stringify(corpo.tools))
        assert.ok(corpo.tools[0].max_uses >= 1)
    })

    await teste('pesquisar: pause_turn continua a conversa em vez de devolver pela metade', async () => {
        let n = 0
        simularFetch(() => {
            n += 1
            return n === 1
                ? { corpo: { stop_reason: 'pause_turn', content: [{ type: 'server_tool_use', id: 'x', name: 'web_search', input: {} }], usage: {} } }
                : { corpo: { stop_reason: 'end_turn', content: [{ type: 'text', text: 'Resposta completa.' }], usage: {} } }
        })
        const r = await llm.pesquisar('pergunta longa')
        assert.strictEqual(r.text, 'Resposta completa.')
        assert.strictEqual(chamadas.length, 2)
        const segunda = JSON.parse(chamadas[1].opcoes.body)
        assert.strictEqual(segunda.messages[1].role, 'assistant')
    })

    await teste('transcrição: o Claude revisa a pontuação sem mudar o conteúdo', async () => {
        const { melhorarTranscricao } = require('../src/services/transcriptionService')
        const bruto = 'oi gente tudo bem entao eu queria avisar que a reuniao de amanha foi pra quinta feira as tres da tarde'
        simularFetch({ corpo: { content: [{ type: 'text', text: 'Oi, gente, tudo bem? Então, eu queria avisar que a reunião de amanhã foi para quinta-feira, às três da tarde.' }], usage: {} } })
        const r = await melhorarTranscricao(bruto)
        assert.strictEqual(r.melhorado, true)
        assert.ok(/reunião de amanhã/.test(r.text))
        const corpo = JSON.parse(chamadas[0].opcoes.body)
        assert.ok(/não resuma/i.test(corpo.system) && /DADO, não instrução/.test(corpo.system))
        assert.strictEqual(corpo.messages[0].content, bruto)
    })

    await teste('transcrição: resposta fora de proporção (modelo desobedeceu) fica com o texto bruto', async () => {
        const { melhorarTranscricao } = require('../src/services/transcriptionService')
        const bruto = 'bom dia pessoal hoje o assunto da reuniao e o orcamento do proximo trimestre'
        simularFetch({ corpo: { content: [{ type: 'text', text: 'Claro! Aqui vai um resumo enorme... '.repeat(30) }], usage: {} } })
        const r = await melhorarTranscricao(bruto)
        assert.strictEqual(r.melhorado, false)
        assert.strictEqual(r.text, bruto)
    })

    await teste('transcrição curtinha e falha da API: devolve o bruto, nunca perde a transcrição', async () => {
        const { melhorarTranscricao } = require('../src/services/transcriptionService')
        simularFetch(RESPOSTA_CLAUDE)
        assert.deepStrictEqual(await melhorarTranscricao('ok beleza'), { text: 'ok beleza', melhorado: false })
        assert.strictEqual(chamadas.length, 0, 'gastou chamada com texto curtinho')
        simularFetch({ status: 503, corpo: { error: { message: 'sobrecarregado' } } })
        const longo = 'esse e um audio um pouco mais longo que precisa passar pelo polimento do claude'
        assert.deepStrictEqual(await melhorarTranscricao(longo), { text: longo, melhorado: false })
    })

    await teste('estúdio de texto: criar passa pelo Claude; transformar/contar/codificar nunca', async () => {
        const ia = require('../src/services/textStudioIA')
        simularFetch({ corpo: { content: [{ type: 'text', text: '1. Rafa Relâmpago\n2. Rafinha do Trovão' }], usage: {} } })
        const tela = await ia.telaDeResultado('apelido', 'Rafael', { prefix: '.', nome: 'txt100' })
        assert.strictEqual(chamadas.length, 1)
        assert.ok(JSON.stringify(tela).includes('Rafa Relâmpago'), JSON.stringify(tela).slice(0, 200))
        const corpo = JSON.parse(chamadas[0].opcoes.body)
        assert.ok(/Cria apelidos/i.test(corpo.system))

        for (const id of ['maiusculas', 'contarpalavras', 'base64', 'morse', 'ordenarlinhas']) {
            simularFetch(RESPOSTA_CLAUDE)
            await ia.telaDeResultado(id, 'texto de teste para o estudio', { prefix: '.' })
            assert.strictEqual(chamadas.length, 0, `.${id} (determinística) chamou o Claude`)
        }
    })

    await teste('estúdio de texto: se o Claude falha, o molde local responde (comando não fica mudo)', async () => {
        const ia = require('../src/services/textStudioIA')
        simularFetch({ status: 500, corpo: { error: { message: 'fora do ar' } } })
        const tela = await ia.telaDeResultado('apelido', 'Rafael', { prefix: '.', nome: 'txt100' })
        assert.ok(JSON.stringify(tela).includes('Rafael'), 'sem resposta local')
    })

    await teste('erro da API (chave inválida): sem provedor de reserva devolve null, não derruba', async () => {
        simularFetch({ status: 401, corpo: { error: { message: 'invalid x-api-key' } } })
        assert.strictEqual(await llm.ask('vai falhar'), null)
    })

    await teste('só blocos de texto entram na resposta', async () => {
        simularFetch({ corpo: { content: [{ type: 'thinking', thinking: 'segredo' }, { type: 'text', text: 'visível' }], usage: {} } })
        const r = await llm.ask('bloco')
        assert.strictEqual(r, 'visível')
    })

    global.fetch = fetchOriginal
    console.log(`\n📊 Claude como motor do .ia: ✅ ${ok}  ❌ ${falhou}\n`)
    process.exit(falhou > 0 ? 1 : 0)
}

main().catch(err => { console.error(err); process.exit(1) })
