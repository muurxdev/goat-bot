/**
 * Cartões em imagem para as telas de vitrine (perfil, dossiê, ranking, nível,
 * boas-vindas e carta de RPG).
 *
 * Desenho em SVG rasterizado pelo sharp (libvips + librsvg), sem dependência
 * nova. Só usa "Liberation Sans", que vem no container (fonts-liberation):
 * emoji não entra na imagem porque não há fonte de emoji instalada e ele sairia
 * como quadradinho. Emoji fica na legenda.
 *
 * Tudo que é texto do usuário passa por esc() e por cortar(): nick com "<" ou
 * "&" quebraria o SVG, e nick longo invadiria o resto do cartão.
 *
 * Quem chama deve tratar falha como "manda só o texto": o cartão é um extra.
 */

const sharp = require('sharp')
const logger = require('../core/logger')

const FONTE = "'Liberation Sans', 'DejaVu Sans', Arial, sans-serif"
const L = 1280
const A = 720

const TEMA = {
    fundo1: '#14100c',
    fundo2: '#2a1d12',
    painel: '#1f1812',
    borda: '#6b5234',
    ouro: '#e8b64c',
    ouroClaro: '#f7d98b',
    texto: '#f3eadb',
    suave: '#b9a88f',
    fraco: '#7d6d58',
    vida: '#d9534f',
    xp: '#e8b64c',
    azul: '#5aa9e6',
    verde: '#6cc070'
}

/** Escapa texto para SVG. */
function esc(t) {
    return String(t ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
}

/**
 * Normaliza e limpa texto para renderização segura em SVG sem perder caracteres legítimos.
 * Aplica normalização NFKC para converter fontes estilizadas (ex: ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ -> ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤).
 */
function cortar(t, max, reserva = '') {
    const normalizado = String(t ?? '').normalize('NFKC')
    const limpo = normalizado
        .replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{20E3}]/gu, '')
        .replace(/[*_~`]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    const base = limpo || reserva
    return base.length > max ? base.slice(0, max - 1).trimEnd() + '…' : base
}

function num(n) {
    return Math.round(Number(n) || 0).toLocaleString('pt-BR')
}

function fundo() {
    return `
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${TEMA.fundo2}"/>
        <stop offset="1" stop-color="${TEMA.fundo1}"/>
      </linearGradient>
      <radialGradient id="brilho" cx="0.15" cy="0.1" r="0.8">
        <stop offset="0" stop-color="${TEMA.ouro}" stop-opacity="0.18"/>
        <stop offset="1" stop-color="${TEMA.ouro}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="barraOuro" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#b8832a"/>
        <stop offset="1" stop-color="${TEMA.ouroClaro}"/>
      </linearGradient>
      <clipPath id="avatarClip"><circle cx="0" cy="0" r="1"/></clipPath>
    </defs>
    <rect width="${L}" height="${A}" fill="url(#g)"/>
    <rect width="${L}" height="${A}" fill="url(#brilho)"/>
    <rect x="18" y="18" width="${L - 36}" height="${A - 36}" rx="28" fill="none" stroke="${TEMA.borda}" stroke-width="2"/>
    <rect x="28" y="28" width="${L - 56}" height="${A - 56}" rx="22" fill="none" stroke="${TEMA.borda}" stroke-opacity="0.35" stroke-width="1"/>`
}

function texto(x, y, conteudo, { tam = 28, cor = TEMA.texto, peso = 400, ancora = 'start', espaco = 0 } = {}) {
    return `<text x="${x}" y="${y}" font-family="${FONTE}" font-size="${tam}" font-weight="${peso}" fill="${cor}" text-anchor="${ancora}" letter-spacing="${espaco}">${esc(conteudo)}</text>`
}

function barra(x, y, larg, alt, fracao, cor = 'url(#barraOuro)') {
    const f = Math.max(0, Math.min(1, Number(fracao) || 0))
    const r = alt / 2
    return `<rect x="${x}" y="${y}" width="${larg}" height="${alt}" rx="${r}" fill="#0e0b08" stroke="${TEMA.borda}" stroke-width="1.5"/>` +
        (f > 0 ? `<rect x="${x + 3}" y="${y + 3}" width="${Math.max(alt - 6, (larg - 6) * f)}" height="${alt - 6}" rx="${r - 3}" fill="${cor}"/>` : '')
}

/** Caixa de estatística: rótulo pequeno em cima, valor grande embaixo. */
function stat(x, y, larg, rotulo, valor, cor = TEMA.texto) {
    return `<rect x="${x}" y="${y}" width="${larg}" height="104" rx="16" fill="${TEMA.painel}" stroke="${TEMA.borda}" stroke-opacity="0.7"/>` +
        texto(x + 22, y + 38, rotulo.toUpperCase(), { tam: 18, cor: TEMA.suave, peso: 700, espaco: 1.5 }) +
        texto(x + 22, y + 82, valor, { tam: 36, cor, peso: 700 })
}

/** Monograma quando não há foto: círculo dourado com as iniciais. */
function monograma(cx, cy, r, nome) {
    const iniciais = cortar(nome, 40, '?').split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?'
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${TEMA.painel}" stroke="${TEMA.ouro}" stroke-width="5"/>` +
        texto(cx, cy + r * 0.3, iniciais, { tam: r * 0.85, cor: TEMA.ouro, peso: 700, ancora: 'middle' })
}

/** Foto redonda com aro dourado, pronta para compor por cima do SVG. */
async function avatarRedondo(buffer, diametro) {
    const mascara = Buffer.from(`<svg width="${diametro}" height="${diametro}"><circle cx="${diametro / 2}" cy="${diametro / 2}" r="${diametro / 2}" fill="#fff"/></svg>`)
    const foto = await sharp(buffer, { failOn: 'none' })
        .resize(diametro, diametro, { fit: 'cover' })
        .composite([{ input: mascara, blend: 'dest-in' }])
        .png()
        .toBuffer()
    return foto
}

async function renderizar(svg, camadas = []) {
    // Densidade padrão (72) rasteriza 1:1 com o viewBox; 96 aumentava 4/3 e
    // desalinhava a foto composta por cima.
    let img = sharp(Buffer.from(svg))
    if (camadas.length) {
        img = sharp(await img.png().toBuffer()).composite(camadas)
    }
    return img.jpeg({ quality: 92, mozjpeg: true, chromaSubsampling: '4:4:4' }).toBuffer()
}

/** Coloca a foto (se houver) ou o monograma no círculo indicado. */
async function comAvatar(svgSemAvatar, { cx, cy, r, foto, nome }) {
    if (foto) {
        try {
            const d = r * 2
            const redonda = await avatarRedondo(foto, d)
            const aro = `<circle cx="${cx}" cy="${cy}" r="${r + 3}" fill="none" stroke="${TEMA.ouro}" stroke-width="6"/>`
            return renderizar(svgSemAvatar.replace('<!--AVATAR-->', aro), [{ input: redonda, left: cx - r, top: cy - r }])
        } catch (err) {
            logger.warn(`[CARTAO] Foto de perfil inválida, uso o monograma: ${err.message}`)
        }
    }
    return renderizar(svgSemAvatar.replace('<!--AVATAR-->', monograma(cx, cy, r, nome)))
}

function envolver(conteudo) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${A}" viewBox="0 0 ${L} ${A}">${fundo()}${conteudo}</svg>`
}

function rodape(esquerda, direita) {
    return texto(70, A - 58, esquerda, { tam: 20, cor: TEMA.fraco, peso: 700, espaco: 3 }) +
        texto(L - 70, A - 58, direita, { tam: 20, cor: TEMA.fraco, ancora: 'end' })
}

/**
 * Perfil / dossiê.
 * @param {object} d
 * @param {string} d.nome
 * @param {string} [d.subtitulo]  patente, título ou classe
 * @param {number} d.nivel
 * @param {string} [d.rank]
 * @param {number} d.xpAtual      XP dentro do nível
 * @param {number} d.xpNecessario
 * @param {Array<[string, string|number]>} d.stats  até 6 pares rótulo/valor
 * @param {string} [d.rodape]
 * @param {Buffer} [d.foto]
 */
async function cartaoPerfil(d) {
    const nome = cortar(d.nome, 22, 'Aventureiro')
    const fracao = (Number(d.xpAtual) || 0) / Math.max(1, Number(d.xpNecessario) || 1)
    const stats = (d.stats || []).slice(0, 6)
    const col = 3
    const largStat = 368
    let grade = ''
    stats.forEach(([rot, val], i) => {
        const x = 70 + (i % col) * (largStat + 18)
        const y = 392 + Math.floor(i / col) * 118
        grade += stat(x, y, largStat, cortar(rot, 18), cortar(typeof val === 'number' ? num(val) : val, 16, '—'))
    })
    const svg = envolver(`
      <!--AVATAR-->
      ${texto(330, 150, 'FICHA DO AVENTUREIRO', { tam: 22, cor: TEMA.ouro, peso: 700, espaco: 4 })}
      ${texto(330, 214, nome, { tam: 60, peso: 700 })}
      ${texto(330, 258, cortar(d.subtitulo, 44), { tam: 28, cor: TEMA.suave })}
      <rect x="${L - 290}" y="96" width="220" height="150" rx="20" fill="${TEMA.painel}" stroke="${TEMA.ouro}" stroke-width="2"/>
      ${texto(L - 180, 142, 'NÍVEL', { tam: 22, cor: TEMA.suave, peso: 700, ancora: 'middle', espaco: 3 })}
      ${texto(L - 180, 218, num(d.nivel), { tam: 72, cor: TEMA.ouro, peso: 700, ancora: 'middle' })}
      ${texto(330, 316, `${num(d.xpAtual)} / ${num(d.xpNecessario)} XP`, { tam: 24, cor: TEMA.suave })}
      ${texto(L - 70, 316, `${Math.round(Math.min(1, fracao) * 100)}% · ${cortar(d.rank, 24)}`, { tam: 24, cor: TEMA.ouroClaro, ancora: 'end' })}
      ${barra(330, 330, L - 400, 30, fracao)}
      ${grade}
      ${rodape('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ · ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ BOT', cortar(d.rodape, 60))}
    `)
    return comAvatar(svg, { cx: 190, cy: 225, r: 115, foto: d.foto, nome })
}

/**
 * Subida de nível com dados reais, foto real e tema visual do grupo.
 * @param {object} d
 * @param {string} d.nome
 * @param {string} [d.grupo]
 * @param {number} d.nivelAntes
 * @param {number} d.nivelDepois
 * @param {Array<[string, string]>} [d.ganhos]
 * @param {number} [d.fracaoProximo]
 * @param {number|string} [d.xpFaltam]
 * @param {Buffer} [d.foto]
 */
async function cartaoNivel(d) {
    const nome = cortar(d.nome, 26, 'Craque')
    const grupo = cortar(d.grupo || 'Grupo Oficial', 30, 'Grupo Oficial')
    const ganhos = (d.ganhos || []).slice(0, 3)
    let linhas = ''
    ganhos.forEach(([rot, val], i) => {
        linhas += stat(360 + i * 290, 430, 270, cortar(rot, 14), cortar(val, 14, '—'), TEMA.verde)
    })
    const faltamTexto = d.xpFaltam ? ` · faltam ${num(d.xpFaltam)} XP` : ''
    const svg = envolver(`
      <!--AVATAR-->
      <rect x="360" y="80" width="${Math.min(500, grupo.length * 14 + 32)}" height="34" rx="8" fill="${TEMA.painel}" stroke="${TEMA.borda}" stroke-width="1.5"/>
      ${texto(376, 103, grupo.toUpperCase(), { tam: 15, cor: TEMA.ouro, peso: 700, espaco: 1.5 })}
      ${texto(360, 150, 'SUBIU DE NÍVEL', { tam: 24, cor: TEMA.ouroClaro, peso: 700, espaco: 5 })}
      ${texto(360, 214, nome, { tam: 52, peso: 700 })}
      ${texto(360, 360, num(d.nivelAntes), { tam: 110, cor: TEMA.fraco, peso: 700 })}
      ${texto(360 + String(num(d.nivelAntes)).length * 62 + 40, 345, '›', { tam: 120, cor: TEMA.ouro, peso: 700 })}
      ${texto(360 + String(num(d.nivelAntes)).length * 62 + 120, 360, num(d.nivelDepois), { tam: 140, cor: TEMA.ouroClaro, peso: 700 })}
      ${linhas}
      ${texto(360, 588, `Rumo ao nível ${num((Number(d.nivelDepois) || 0) + 1)}${faltamTexto}`, { tam: 22, cor: TEMA.suave })}
      ${barra(360, 600, L - 430, 22, d.fracaoProximo || 0)}
      ${rodape('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ · ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ BOT', grupo)}
    `)
    return comAvatar(svg, { cx: 200, cy: 330, r: 120, foto: d.foto, nome })
}

/**
 * Ranking de um grupo (até 10 linhas).
 * @param {object} d
 * @param {string} d.titulo
 * @param {string} [d.subtitulo]
 * @param {Array<{pos:number, nome:string, detalhe:string, valor:string, destaque?:boolean}>} d.linhas
 * @param {string} [d.rodape]
 */
async function cartaoRanking(d) {
    const linhas = (d.linhas || []).slice(0, 10)
    const altura = 46
    const topo = 196
    const coresPodio = ['#e8b64c', '#c9ced6', '#c98a55']
    let corpo = ''
    linhas.forEach((l, i) => {
        const coluna = i < 5 ? 0 : 1
        const x = 70 + coluna * 580
        const y = topo + (i % 5) * (altura + 42)
        const cor = coresPodio[l.pos - 1] || TEMA.suave
        corpo += `<rect x="${x}" y="${y}" width="560" height="${altura + 26}" rx="14" fill="${l.destaque ? '#3a2a18' : TEMA.painel}" stroke="${l.destaque ? TEMA.ouro : TEMA.borda}" stroke-opacity="${l.destaque ? 1 : 0.6}" stroke-width="${l.destaque ? 2.5 : 1}"/>`
        corpo += `<circle cx="${x + 42}" cy="${y + 36}" r="24" fill="none" stroke="${cor}" stroke-width="3"/>`
        corpo += texto(x + 42, y + 45, String(l.pos), { tam: 24, cor, peso: 700, ancora: 'middle' })
        corpo += texto(x + 84, y + 34, cortar(l.nome, 20, 'Craque'), { tam: 26, peso: 700 })
        corpo += texto(x + 84, y + 60, cortar(l.detalhe, 30), { tam: 18, cor: TEMA.suave })
        corpo += texto(x + 540, y + 45, cortar(l.valor, 14), { tam: 26, cor: TEMA.ouroClaro, peso: 700, ancora: 'end' })
    })
    if (!linhas.length) corpo = texto(L / 2, 380, 'Ninguém pontuou ainda', { tam: 40, cor: TEMA.suave, ancora: 'middle' })
    const svg = envolver(`
      ${texto(70, 110, cortar(d.subtitulo, 50).toUpperCase(), { tam: 22, cor: TEMA.ouro, peso: 700, espaco: 4 })}
      ${texto(70, 164, cortar(d.titulo, 38, 'Ranking'), { tam: 52, peso: 700 })}
      ${corpo}
      ${rodape('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ · ➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ BOT', cortar(d.rodape, 60))}
    `)
    return renderizar(svg)
}

/**
 * Boas-vindas ao grupo.
 * @param {object} d
 * @param {string} d.nome
 * @param {string} d.grupo
 * @param {number} [d.membros]
 * @param {Buffer} [d.foto]
 */
async function cartaoBoasVindas(d) {
    const nome = cortar(d.nome, 24, 'Novo membro')
    const svg = envolver(`
      <!--AVATAR-->
      ${texto(L / 2, 470, 'BEM-VINDO AO TIME', { tam: 28, cor: TEMA.ouro, peso: 700, ancora: 'middle', espaco: 8 })}
      ${texto(L / 2, 540, nome, { tam: 62, peso: 700, ancora: 'middle' })}
      ${texto(L / 2, 590, cortar(d.grupo, 48, 'nosso grupo'), { tam: 30, cor: TEMA.suave, ancora: 'middle' })}
      ${d.membros ? texto(L / 2, 636, `você é o membro nº ${num(d.membros)}`, { tam: 22, cor: TEMA.fraco, ancora: 'middle' }) : ''}
    `)
    return comAvatar(svg, { cx: L / 2, cy: 245, r: 150, foto: d.foto, nome })
}

/**
 * Carta de personagem do RPG.
 * @param {object} d
 * @param {string} d.nome
 * @param {string} [d.classe]
 * @param {string} [d.raridade]
 * @param {number} d.nivel
 * @param {number} d.cp
 * @param {number} d.atk
 * @param {number} d.def
 * @param {number} d.hp
 * @param {number} d.hpMax
 * @param {Array<[string, string]>} [d.equipamentos]  slot / nome
 * @param {Buffer} [d.foto]
 */
async function cartaoRpg(d) {
    const nome = cortar(d.nome, 20, 'Aventureiro')
    const equips = (d.equipamentos || []).slice(0, 6)
    let lista = ''
    equips.forEach(([slot, item], i) => {
        const y = 150 + i * 80
        lista += `<rect x="700" y="${y}" width="510" height="64" rx="12" fill="${TEMA.painel}" stroke="${TEMA.borda}" stroke-opacity="0.6"/>`
        lista += texto(722, y + 40, cortar(slot, 10).toUpperCase(), { tam: 17, cor: TEMA.suave, peso: 700, espaco: 1.5 })
        lista += texto(850, y + 42, cortar(item, 26, 'vazio'), { tam: 24, cor: item ? TEMA.texto : TEMA.fraco, peso: item ? 700 : 400 })
    })
    if (!equips.length) lista = texto(955, 400, 'Nenhum equipamento vestido', { tam: 26, cor: TEMA.fraco, ancora: 'middle' })
    const fracaoHp = (Number(d.hp) || 0) / Math.max(1, Number(d.hpMax) || 1)
    const svg = envolver(`
      <!--AVATAR-->
      ${texto(70, 84, cortar(d.raridade, 30, 'Carta de aventureiro').toUpperCase(), { tam: 20, cor: TEMA.ouro, peso: 700, espaco: 4 })}
      ${texto(290, 206, nome, { tam: 48, peso: 700 })}
      ${texto(290, 248, `${cortar(d.classe, 22, 'Aventureiro')} · nível ${num(d.nivel)}`, { tam: 26, cor: TEMA.suave })}
      ${texto(70, 356, 'PODER DE COMBATE', { tam: 20, cor: TEMA.suave, peso: 700, espaco: 3 })}
      ${texto(70, 430, num(d.cp), { tam: 78, cor: TEMA.ouroClaro, peso: 700 })}
      ${stat(70, 460, 290, 'Ataque', num(d.atk), TEMA.vida)}
      ${stat(376, 460, 290, 'Defesa', num(d.def), TEMA.azul)}
      ${texto(70, 612, `Vida ${num(d.hp)} / ${num(d.hpMax)}`, { tam: 22, cor: TEMA.suave })}
      ${barra(70, 626, 596, 24, fracaoHp, TEMA.vida)}
      ${texto(700, 120, 'EQUIPAMENTO', { tam: 22, cor: TEMA.ouro, peso: 700, espaco: 4 })}
      ${lista}
    `)
    return comAvatar(svg, { cx: 162, cy: 212, r: 86, foto: d.foto, nome })
}

/**
 * Baixa a foto de perfil do WhatsApp, se houver. Nunca lança.
 * @param {object} client socket Baileys
 * @param {string} jid
 * @returns {Promise<Buffer|null>}
 */
async function fotoDePerfil(client, jid) {
    if (!client || typeof client.profilePictureUrl !== 'function' || !jid) return null
    try {
        const url = await client.profilePictureUrl(jid, 'image')
        if (!url) return null
        const resp = await fetch(url, { signal: AbortSignal.timeout(6000) })
        if (!resp.ok) return null
        return Buffer.from(await resp.arrayBuffer())
    } catch (err) {
        // Foto privada ou inexistente é o caso comum; não é erro.
        logger.debug(`[CARTAO] Sem foto de perfil para ${String(jid).split('@')[0]}: ${err.message}`)
        return null
    }
}

/**
 * Envia o cartão com o texto. Texto de até 1024 caracteres vai como legenda;
 * maior que isso, a imagem vai sozinha e o texto logo depois. Sem imagem (ou
 * sem cliente), só o texto.
 * @param {object} o
 * @param {Function} o.gerar       async () => Buffer do cartão
 * @param {string} o.texto
 * @param {object} o.ctx           contexto do comando (client, from, info, reply)
 * @param {string[]} [o.mentions]
 */
async function enviarComCartao({ gerar, texto, ctx, mentions = [] }) {
    const { client, from, info, reply } = ctx
    let imagem = null
    if (client && typeof client.sendMessage === 'function' && from) {
        try {
            imagem = await gerar()
        } catch (err) {
            logger.warn(`[CARTAO] Cartão não saiu, mando só o texto: ${err.message}`)
        }
    }
    if (!imagem) return reply(texto, mentions)
    if (texto.length <= 1024) {
        return client.sendMessage(from, { image: imagem, caption: texto, mentions }, { quoted: info })
    }
    await client.sendMessage(from, { image: imagem, mentions }, { quoted: info })
    return reply(texto, mentions)
}

module.exports = { enviarComCartao, cartaoPerfil, cartaoNivel, cartaoRanking, cartaoBoasVindas, cartaoRpg, fotoDePerfil, cortar }
