/**
 * Aula de português — toda a lógica da família `.port1` … `.port150`.
 *
 * DECISÕES QUE ESTE ARQUIVO CARREGA
 *
 * 1. O serviço é a única fonte de verdade. Os 150 comandos em
 *    src/commands/escola/portN.js são gerados por scripts/gen-portugues.js e só
 *    fazem três coisas: pegar o que a pessoa escreveu, chamar `telaDeResultado`
 *    e devolver com F.tela. Quem conserta uma regra conserta aqui, uma vez.
 *
 * 2. Nada de rede, nada de banco. Texto entra, explicação sai. A família toda
 *    roda sem subir o bot e sem tocar em data/database.sqlite.
 *
 * 3. `\b` de regex NÃO serve para português: ele trata "ç", "ã" e "é" como
 *    limite de palavra, então /\bmal\b/ casa dentro de "malícia" pela borda
 *    errada e /\bpais\b/ não distingue "país". Onde preciso de borda de palavra
 *    uso BORDA_ESQ/BORDA_DIR, feitos de \p{L} e \p{N}, que enxergam acento.
 *
 * 4. A comparação de palavras é feita em forma NORMALIZADA (minúscula, sem
 *    acento) só para PROCURAR; o que volta para a pessoa é sempre o texto
 *    original, com acento, porque a resposta é aula de português.
 *
 * 5. Nada de quantificador aninhado. Texto de usuário pode ser adversário:
 *    todas as expressões daqui são de classe simples com um quantificador só, e
 *    a entrada é cortada em LIMITE_ENTRADA antes de qualquer processamento.
 *
 * 6. Onde a gramática admite mais de uma análise (separação de "piano",
 *    colocação pronominal opcional, vírgula facultativa), a resposta diz isso
 *    em vez de fingir certeza. Professor honesto vale mais que professor certo.
 *
 * 7. As tabelas de verbos irregulares, escolas literárias e obras foram
 *    escritas à mão, uma a uma. Nenhuma foi inventada por padrão: verbo
 *    irregular não sai de algoritmo, sai de tabela conferida.
 */

const F = require('../utils/formato')

// ── Limites ────────────────────────────────────────────────────────────────
const LIMITE_ENTRADA = 4000
const LIMITE_SAIDA = 3000
const LIMITE_TELA = 3800
const MAX_LINHAS = 120

// ── Bordas de palavra que respeitam acento ─────────────────────────────────
const BORDA_ESQ = '(?<![\\p{L}\\p{N}])'
const BORDA_DIR = '(?![\\p{L}\\p{N}])'

const PESSOAS = ['eu', 'tu', 'ele/ela', 'nós', 'vós', 'eles/elas']

// ── Helpers de texto ───────────────────────────────────────────────────────

/** Normaliza e corta a entrada. Tudo que vem da pessoa passa por aqui. */
function limitarEntrada(bruto) {
    const s = String(bruto ?? '').replace(/\r\n?/g, '\n')
    return s.length > LIMITE_ENTRADA ? s.slice(0, LIMITE_ENTRADA) : s
}

/** Corta a saída no limite de mensagem, avisando que cortou. */
function cortarSaida(texto, limite = LIMITE_SAIDA) {
    const s = String(texto ?? '')
    if (!s.trim()) return 'Não achei nada desse tipo no que você escreveu.'
    if (s.length <= limite) return s
    return s.slice(0, limite) + '\n\n[cortei aqui: o resto não cabe numa mensagem]'
}

/** Recorta um pedaço de texto com reticência, sem partir emoji ao meio. */
function recortar(s, max) {
    const t = String(s ?? '')
    if (max < 2) return t.slice(0, Math.max(0, max))
    if (t.length <= max) return t
    return Array.from(t).slice(0, max - 1).join('').trimEnd() + '…'
}

/** Tira acento para comparar (nunca para exibir). */
function tirarAcento(s) {
    return String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '')
}

/** Forma de comparação: minúscula, sem acento, sem espaço nas pontas. */
function normal(s) {
    return tirarAcento(String(s ?? '')).toLowerCase().trim()
}

/** Palavras do texto, com acento e hífen preservados. */
function palavrasDe(texto) {
    return String(texto ?? '').match(/[\p{L}\p{N}]+(?:[-'’][\p{L}\p{N}]+)*/gu) || []
}

/** Frases do texto, cortando em . ! ? … e mantendo o que veio antes. */
function frasesDe(texto) {
    return String(texto ?? '')
        .split(/(?<=[.!?…])\s+/)
        .map(f => f.trim())
        .filter(Boolean)
}

/** Escapa o que vai virar regex. */
function escapar(s) {
    return String(s ?? '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Regex de palavra inteira que não quebra com acento. */
function regexPalavra(palavra, flags = 'giu') {
    return new RegExp(BORDA_ESQ + escapar(palavra) + BORDA_DIR, flags)
}

/** Primeira palavra da entrada (usada pelos comandos de palavra única). */
function primeiraPalavra(texto) {
    const ps = palavrasDe(texto)
    return ps.length ? ps[0] : ''
}

/** Deixa a primeira letra maiúscula sem mexer no resto. */
function maiuscula(s) {
    const t = String(s ?? '')
    return t.charAt(0).toUpperCase() + t.slice(1)
}

/** Junta linhas respeitando o teto. */
function juntarLinhas(linhas) {
    const ls = (linhas || []).filter(l => l !== null && l !== undefined && String(l).trim() !== '')
    const cortadas = ls.slice(0, MAX_LINHAS)
    const sobra = ls.length - cortadas.length
    return cortadas.join('\n') + (sobra > 0 ? `\n… e mais ${sobra} linha(s).` : '')
}

/** Aplica o teto de tamanho na tela inteira, seção por seção. */
function limitarTela(tela) {
    tela.intro = recortar(tela.intro, 350)
    tela.dica = recortar(tela.dica, 250)
    let usado = String(tela.titulo || '').length + String(tela.intro || '').length + String(tela.dica || '').length + 40
    const secoes = []
    for (const s of (tela.secoes || [])) {
        if (!s || usado >= LIMITE_TELA) break
        const linhas = []
        for (const l of (s.linhas || [])) {
            if (usado >= LIMITE_TELA) { linhas.push('[cortei aqui: o resto não cabe numa mensagem]'); break }
            const corte = recortar(String(l ?? ''), LIMITE_TELA - usado)
            linhas.push(corte)
            usado += corte.length + 1
        }
        usado += String(s.titulo || '').length + 4
        secoes.push({ emoji: s.emoji, titulo: s.titulo, linhas })
    }
    tela.secoes = secoes
    return tela
}

// ═══════════════════════════════════════════════════════════════════════════
// FONÉTICA: sílaba, tonicidade, acento
// ═══════════════════════════════════════════════════════════════════════════

const VOGAIS = 'aeiouáéíóúâêôàãõü'
const FORTES = 'aeoáéóâêôàã'
const FRACAS = 'iuü'
const FRACAS_ACENTUADAS = 'íú'
const ACENTO_GRAFICO = /[áéíóúâêôà]/

function ehVogal(c) { return VOGAIS.includes(c) }
function ehForte(c) { return FORTES.includes(c) || c === 'õ' }
function ehFraca(c) { return FRACAS.includes(c) }

/**
 * Quebra a palavra em unidades: cada unidade é uma vogal ou um bloco
 * consonantal que não se separa (ch, lh, nh, gu/qu antes de e/i).
 */
function unidadesDe(palavra) {
    const s = String(palavra).toLowerCase()
    const out = []
    let i = 0
    while (i < s.length) {
        const c = s[i], c2 = s[i + 1], c3 = s[i + 2]
        if ((c === 'q' || c === 'g') && c2 === 'u' && c3 && 'eiéêí'.includes(c3)) {
            out.push({ tipo: 'c', v: c + c2 }); i += 2; continue
        }
        if ((c === 'c' && c2 === 'h') || (c === 'l' && c2 === 'h') || (c === 'n' && c2 === 'h')) {
            out.push({ tipo: 'c', v: c + c2 }); i += 2; continue
        }
        out.push({ tipo: ehVogal(c) ? 'v' : 'c', v: c })
        i++
    }
    return out
}

/**
 * Duas vogais vizinhas ficam na mesma sílaba?
 * @param {string} a primeira vogal
 * @param {string} b segunda vogal
 * @param {boolean} fimDaPalavra o par encerra a palavra
 * @param {boolean} temAcento a palavra tem acento gráfico em outro lugar
 */
function mesmaSilaba(a, b, fimDaPalavra, temAcento) {
    if (FRACAS_ACENTUADAS.includes(b)) return false          // sa-í-da, ba-ú, pa-ís
    if ('ãõ'.includes(a)) return true                        // ão, ãe, õe: o til puxa a vogal seguinte
    if (ehForte(a) && ehFraca(b)) return true                // pai, céu, mãe, pão
    if (ehFraca(a) && ehFraca(b)) return true                // viu, fui
    if (ehFraca(a) && ehForte(b)) {
        if (ACENTO_GRAFICO.test(b) || 'ãõ'.includes(b)) return false  // ci-ên-cia
        if (fimDaPalavra && !temAcento) return false                  // e-ner-gi-a, na-vi-o
        return true                                                   // his-tó-ria, sé-rie
    }
    return false                                             // duas fortes: hiato
}

/** Blocos consonantais que atravessam a fronteira de sílaba juntos. */
function blocoInseparavel(c1, c2) {
    if (!c1 || !c2) return false
    if (c1.length > 1) return false
    return 'bcdfgptv'.includes(c1) && (c2 === 'l' || c2 === 'r')
}

/**
 * Separa a palavra em sílabas.
 * Algoritmo: acha os núcleos vocálicos e distribui as consoantes entre eles —
 * a última consoante (ou o bloco inseparável) vai para a sílaba seguinte.
 * @returns {string[]}
 */
function silabasDe(palavra) {
    const bruta = String(palavra ?? '').trim()
    if (!bruta) return []
    if (bruta.includes('-')) {
        return bruta.split('-').filter(Boolean).flatMap(p => silabasDe(p))
    }
    const us = unidadesDe(bruta)
    if (!us.length) return []
    const temAcento = ACENTO_GRAFICO.test(bruta.toLowerCase())

    // 1. Núcleos: grupos de vogais já divididos por ditongo/hiato
    const nucleos = []   // [{ini, fim}] em índices de unidade
    let i = 0
    while (i < us.length) {
        if (us[i].tipo !== 'v') { i++; continue }
        let j = i
        while (j + 1 < us.length && us[j + 1].tipo === 'v') j++
        // divide o grupo [i..j]
        let k = i
        while (k <= j) {
            const a = us[k].v, b = us[k + 1] && us[k + 1].tipo === 'v' ? us[k + 1].v : null
            const c = us[k + 2] && us[k + 2].tipo === 'v' ? us[k + 2].v : null
            const fim = (k + 1 >= j) || (k + 2 > j)
            const fimPalavra = j === us.length - 1
            if (b && c && ehFraca(a) && ehForte(b) && ehFraca(c) && !FRACAS_ACENTUADAS.includes(c)) {
                nucleos.push({ ini: k, fim: k + 2 }); k += 3; continue
            }
            if (b && mesmaSilaba(a, b, fimPalavra && (k + 1 === j) && fim, temAcento)) {
                nucleos.push({ ini: k, fim: k + 1 }); k += 2; continue
            }
            nucleos.push({ ini: k, fim: k }); k++
        }
        i = j + 1
    }
    if (!nucleos.length) return [bruta]

    // 2. Fronteiras: onde cada sílaba começa (em índice de unidade)
    const inicios = [0]
    for (let n = 1; n < nucleos.length; n++) {
        const fimAnterior = nucleos[n - 1].fim
        const iniAtual = nucleos[n].ini
        const cons = []
        for (let x = fimAnterior + 1; x < iniAtual; x++) cons.push(us[x])
        let corte
        if (cons.length === 0) corte = iniAtual
        else if (cons.length === 1) corte = iniAtual - 1
        else {
            const p = cons[cons.length - 2], u = cons[cons.length - 1]
            const juntos = p.v.length > 1 ? false : blocoInseparavel(p.v, u.v)
            corte = juntos ? iniAtual - 2 : iniAtual - 1
        }
        inicios.push(corte)
    }

    // 3. Monta as sílabas
    const silabas = []
    for (let n = 0; n < inicios.length; n++) {
        const de = inicios[n]
        const ate = n + 1 < inicios.length ? inicios[n + 1] : us.length
        silabas.push(us.slice(de, ate).map(u => u.v).join(''))
    }
    return silabas.filter(Boolean)
}

/** Índice (base 0) da sílaba tônica. */
function indiceTonica(silabas) {
    if (!silabas.length) return -1
    if (silabas.length === 1) return 0
    for (let i = 0; i < silabas.length; i++) if (ACENTO_GRAFICO.test(silabas[i])) return i
    for (let i = silabas.length - 1; i >= 0; i--) if (/[ãõ]/.test(silabas[i])) return i
    const ultima = silabas[silabas.length - 1]
    if (/(a|e|o|as|es|os|am|em|ens)$/.test(ultima)) return silabas.length - 2
    return silabas.length - 1
}

/** Oxítona, paroxítona, proparoxítona ou monossílabo. */
function classificarTonica(palavra) {
    const s = silabasDe(palavra)
    if (!s.length) return null
    const t = indiceTonica(s)
    const doFim = s.length - 1 - t
    let classe = 'monossílabo'
    if (s.length > 1) classe = doFim === 0 ? 'oxítona' : doFim === 1 ? 'paroxítona' : 'proparoxítona'
    return { silabas: s, indice: t, tonica: s[t], classe, posicaoDoFim: doFim }
}

/** Tipo de encontro vocálico de cada sílaba: ditongo, tritongo ou hiato. */
function encontrosVocalicos(palavra) {
    const s = silabasDe(palavra)
    const achados = []
    for (const sil of s) {
        const vs = Array.from(sil).filter(ehVogal)
        if (vs.length === 3) achados.push({ silaba: sil, tipo: 'tritongo', letras: vs.join('') })
        else if (vs.length === 2) {
            const [a, b] = vs
            const tipo = ehForte(a) && ehFraca(b) ? 'ditongo decrescente'
                : ehFraca(a) && ehForte(b) ? 'ditongo crescente' : 'ditongo'
            achados.push({ silaba: sil, tipo, letras: a + b })
        }
    }
    // hiato: vogais em sílabas vizinhas
    for (let i = 0; i + 1 < s.length; i++) {
        const fim = s[i].slice(-1), ini = s[i + 1].charAt(0)
        if (ehVogal(fim) && ehVogal(ini)) {
            achados.push({ silaba: s[i] + '-' + s[i + 1], tipo: 'hiato', letras: fim + ini })
        }
    }
    return { silabas: s, achados }
}

const DIGRAFOS = [
    ['ch', 'som de X, uma letra só no som'], ['lh', 'som molhado do L'], ['nh', 'som molhado do N'],
    ['rr', 'R forte entre vogais, separa na sílaba'], ['ss', 'S forte entre vogais, separa na sílaba'],
    ['sc', 'separa na sílaba: nas-cer'], ['sç', 'separa na sílaba: des-ça'], ['xc', 'separa na sílaba: ex-ce-to'],
    ['qu', 'antes de E ou I costuma ser dígrafo'], ['gu', 'antes de E ou I costuma ser dígrafo'],
    ['am', 'dígrafo nasal'], ['an', 'dígrafo nasal'], ['em', 'dígrafo nasal'], ['en', 'dígrafo nasal'],
    ['im', 'dígrafo nasal'], ['in', 'dígrafo nasal'], ['om', 'dígrafo nasal'], ['on', 'dígrafo nasal'],
    ['um', 'dígrafo nasal'], ['un', 'dígrafo nasal']
]

const GRUPOS_CONSONANTAIS = ['bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'tl', 'tr', 'vl', 'vr']

/** Encontros consonantais e dígrafos da palavra. */
function encontrosConsonantais(palavra) {
    const p = String(palavra ?? '').toLowerCase()
    const digrafos = []
    for (const [d, oque] of DIGRAFOS) {
        if (p.includes(d)) {
            const nasal = oque.includes('nasal')
            if (nasal) {
                // só conta nasal se a letra seguinte for consoante ou fim de palavra
                const idx = p.indexOf(d)
                const seg = p[idx + 2]
                if (seg && ehVogal(seg)) continue
            }
            digrafos.push({ letras: d, oque })
        }
    }
    const grupos = []
    for (const g of GRUPOS_CONSONANTAIS) if (p.includes(g)) grupos.push(g)
    const separados = []
    const sil = silabasDe(p)
    for (let i = 0; i + 1 < sil.length; i++) {
        const fim = sil[i].slice(-1), ini = sil[i + 1].charAt(0)
        if (!ehVogal(fim) && !ehVogal(ini)) separados.push(fim + ini + ' (em ' + sil[i] + '-' + sil[i + 1] + ')')
    }
    return { digrafos, grupos, separados, silabas: sil }
}

/**
 * Explica a acentuação da palavra: classe, regra que se aplica e se o acento
 * escrito combina com a regra.
 */
function regraDeAcento(palavra) {
    const c = classificarTonica(palavra)
    if (!c) return null
    const p = String(palavra).toLowerCase()
    const temAcento = ACENTO_GRAFICO.test(p) || /[ãõ]/.test(p)
    const fim = p.replace(/[^\p{L}]/gu, '')
    const regras = []

    if (c.classe === 'proparoxítona') {
        regras.push('Proparoxítona (tônica na antepenúltima sílaba): TODA proparoxítona leva acento, sem exceção.')
    } else if (c.classe === 'oxítona') {
        if (/(a|e|o|as|es|os|em|ens)$/.test(fim)) {
            regras.push('Oxítona terminada em A, E, O, EM ou ENS (com ou sem S) leva acento: sofá, café, cipó, também.')
        } else {
            regras.push('Oxítona terminada em I, U, R, L, Z, M ou ditongo não leva acento por essa regra: rapaz, papel, ali.')
        }
    } else if (c.classe === 'paroxítona') {
        if (/(a|e|o|as|es|os|am|em|ens)$/.test(fim)) {
            regras.push('Paroxítona terminada em A, E, O, AM, EM ou ENS não leva acento: casa, pente, livro, jovem.')
        } else {
            regras.push('Paroxítona que NÃO termina em A, E, O, AM, EM ou ENS leva acento: fácil, táxi, ímã, órfão, tórax.')
        }
    } else {
        regras.push('Monossílabo tônico terminado em A, E ou O (com ou sem S) leva acento: pá, pé, pó, más.')
    }

    // Regra do hiato: í e ú sozinhos na sílaba
    for (let i = 0; i < c.silabas.length; i++) {
        const s = c.silabas[i]
        if (/^[íú]s?$/.test(s) && i > 0) {
            regras.push('Regra do hiato: I e U tônicos sozinhos na sílaba (ou só com S) levam acento: sa-í-da, pa-ís, ba-ú.')
            break
        }
    }
    if (/(éi|éu|ói)/.test(p) && c.classe !== 'paroxítona') {
        regras.push('Ditongo aberto ÉI, ÉU ou ÓI em oxítona ou monossílabo leva acento: herói, céu, chapéu.')
    }
    if (/(ei|oi)/.test(p) && c.classe === 'paroxítona' && !temAcento) {
        regras.push('Desde o Acordo de 2009, paroxítona com ditongo aberto perdeu o acento: ideia, heroico, jiboia.')
    }
    return { ...c, temAcento, regras }
}

// ═══════════════════════════════════════════════════════════════════════════
// MORFOLOGIA: plural, feminino, grau
// ═══════════════════════════════════════════════════════════════════════════

const PLURAL_AO_AES = ['pao', 'cao', 'alemao', 'capitao', 'capelao', 'escrivao', 'tabeliao', 'charlatao', 'sacristao', 'catalao', 'guardiao']
const PLURAL_AO_AOS = ['irmao', 'cidadao', 'cristao', 'mao', 'grao', 'orgao', 'sotao', 'chao', 'pagao', 'bencao', 'orfao', 'acordao', 'artesao', 'desvao', 'refrao', 'vao', 'corticao']
const PLURAL_IRREGULAR = new Map([
    ['mal', 'males'], ['cônsul', 'cônsules'], ['mel', 'méis (ou meles)'], ['fel', 'féis (ou feles)'],
    ['cal', 'cais (ou cales)'], ['caráter', 'caracteres'], ['júnior', 'juniores'], ['sênior', 'seniores'],
    ['qualquer', 'quaisquer'], ['ovo', 'ovos (o O do plural é aberto: óvos)']
])

/** Plural da palavra, com a regra que justifica. */
function pluralDe(palavra) {
    const orig = String(palavra ?? '').trim()
    if (!orig) return null
    const p = orig.toLowerCase()
    const n = normal(p)
    if (PLURAL_IRREGULAR.has(p)) return { plural: PLURAL_IRREGULAR.get(p), regra: 'Caso especial: a língua guardou uma forma própria, não sai de regra.' }

    if (p.includes('-')) {
        return { plural: pluralComposto(p).plural, regra: pluralComposto(p).regra }
    }
    if (/ão$/.test(p)) {
        if (PLURAL_AO_AES.includes(n)) return { plural: p.replace(/ão$/, 'ães'), regra: 'Terminada em ÃO do grupo de "pão, cão, alemão": o plural faz ÃES.' }
        if (PLURAL_AO_AOS.includes(n)) return { plural: p.replace(/ão$/, 'ãos'), regra: 'Terminada em ÃO do grupo de "irmão, mão, cidadão": o plural faz ÃOS.' }
        return { plural: p.replace(/ão$/, 'ões'), regra: 'Terminada em ÃO: o plural mais comum é ÕES (coração, corações). Alguns fazem ÃES ou ÃOS.' }
    }
    if (/[aeiouáéíóúâêôãõ]$/.test(p)) return { plural: p + 's', regra: 'Terminada em vogal: é só acrescentar S.' }
    if (/m$/.test(p)) return { plural: p.replace(/m$/, 'ns'), regra: 'Terminada em M: o M vira NS (homem, homens).' }
    if (/[au]l$/.test(p)) return { plural: p.replace(/l$/, 'is'), regra: 'Terminada em AL ou UL: o L vira IS (animal, animais).' }
    if (/el$/.test(p)) {
        const c = classificarTonica(p)
        if (c && c.classe === 'oxítona') return { plural: p.replace(/el$/, 'éis'), regra: 'Oxítona em EL: fica ÉIS (papel, papéis).' }
        return { plural: p.replace(/el$/, 'eis'), regra: 'Paroxítona em EL: fica EIS (fóssil é IL, mas nível faz níveis).' }
    }
    if (/ol$/.test(p)) return { plural: p.replace(/ol$/, 'óis'), regra: 'Terminada em OL: fica ÓIS (farol, faróis).' }
    if (/il$/.test(p)) {
        const c = classificarTonica(p)
        if (c && c.classe === 'oxítona') return { plural: p.replace(/il$/, 'is'), regra: 'Oxítona em IL: o L vira S (funil, funis).' }
        return { plural: p.replace(/il$/, 'eis'), regra: 'Paroxítona em IL: fica EIS (fóssil, fósseis; réptil, répteis).' }
    }
    if (/[rz]$/.test(p)) return { plural: p + 'es', regra: 'Terminada em R ou Z: acrescenta ES (mar, mares; luz, luzes).' }
    if (/n$/.test(p)) {
        // hífen vira hifens: no plural a paroxítona em N perde o acento gráfico.
        return { plural: tirarAcento(p) + 's', regra: 'Terminada em N: acrescenta S e a paroxítona perde o acento (hífen, hifens; abdômen, abdomens).' }
    }
    if (/s$/.test(p)) {
        const c = classificarTonica(p)
        if (c && c.classe === 'oxítona') return { plural: p + 'es', regra: 'Oxítona em S: acrescenta ES (país, países; freguês, fregueses).' }
        return { plural: p + ' (não muda)', regra: 'Paroxítona ou proparoxítona em S não muda no plural: o lápis, os lápis.' }
    }
    if (/x$/.test(p)) return { plural: p + ' (não muda)', regra: 'Terminada em X não muda: o tórax, os tórax.' }
    return { plural: p + 's', regra: 'Sem terminação especial: acrescente S e confira no dicionário.' }
}

/** Plural de palavra composta com hífen. */
function pluralComposto(palavra) {
    const p = String(palavra ?? '').toLowerCase().trim()
    const partes = p.split('-').filter(Boolean)
    if (partes.length < 2) {
        const r = pluralDe(p)
        return { plural: r ? r.plural : p + 's', regra: 'Não tem hífen: vale a regra do plural simples.' }
    }
    const [a, b] = partes
    const invariaveis = ['guarda-chuva']
    if (normal(a) === 'guarda' && !invariaveis.includes(p)) {
        return { plural: a + 's-' + (pluralDe(b) || {}).plural, regra: 'Verbo + substantivo: alguns flexionam os dois (guarda-civil, guardas-civis); com objeto, só o segundo vai ao plural (guarda-chuvas).' }
    }
    if (/^(sempre|beija|porta|quebra|conta|para|arranha|bate|guarda)$/.test(normal(a))) {
        const r = pluralDe(b)
        return { plural: a + '-' + (r ? r.plural : b + 's'), regra: 'Verbo + substantivo: o verbo não muda, só o substantivo vai para o plural (beija-flores, guarda-chuvas).' }
    }
    if (partes.length >= 3 || /^(de|da|do|em)$/.test(normal(partes[1]))) {
        const r = pluralDe(a)
        return { plural: (r ? r.plural : a + 's') + '-' + partes.slice(1).join('-'), regra: 'Ligadas por preposição: só o primeiro elemento vai ao plural (pés de moleque, pães de queijo).' }
    }
    const ra = pluralDe(a), rb = pluralDe(b)
    return {
        plural: (ra ? ra.plural : a + 's') + '-' + (rb ? rb.plural : b + 's'),
        regra: 'Substantivo + substantivo ou substantivo + adjetivo: os dois vão para o plural (couves-flores, amores-perfeitos).'
    }
}

const FEMININO_PROPRIO = new Map([
    ['homem', 'mulher'], ['boi', 'vaca'], ['cavalo', 'égua'], ['pai', 'mãe'], ['genro', 'nora'],
    ['padrinho', 'madrinha'], ['bode', 'cabra'], ['carneiro', 'ovelha'], ['frade', 'freira'],
    ['rei', 'rainha'], ['herói', 'heroína'], ['czar', 'czarina'], ['réu', 'ré'], ['ator', 'atriz'],
    ['imperador', 'imperatriz'], ['cão', 'cadela'], ['zangão', 'abelha'], ['cavalheiro', 'dama'],
    ['judeu', 'judia'], ['ladrão', 'ladra'], ['embaixador', 'embaixatriz (esposa) ou embaixadora (cargo)'],
    ['poeta', 'poetisa'], ['profeta', 'profetisa'], ['maestro', 'maestrina'], ['avô', 'avó'],
    ['conde', 'condessa'], ['barão', 'baronesa'], ['monge', 'monja'], ['mestre', 'mestra'],
    ['prefeito', 'prefeita'], ['sacerdote', 'sacerdotisa'], ['cônsul', 'consulesa']
])
const MASCULINO_PROPRIO = new Map(Array.from(FEMININO_PROPRIO.entries()).map(([m, f]) => [normal(f.split(' ')[0]), m]))

/** Feminino da palavra, com a regra. */
function femininoDe(palavra) {
    const p = String(palavra ?? '').toLowerCase().trim()
    if (!p) return null
    if (FEMININO_PROPRIO.has(p)) return { feminino: FEMININO_PROPRIO.get(p), regra: 'Heterônimo: o feminino é outra palavra, não uma terminação. Isso se decora.' }
    if (/o$/.test(p)) return { feminino: p.replace(/o$/, 'a'), regra: 'Terminado em O: troca por A (menino, menina).' }
    if (/ês$/.test(p)) return { feminino: p.replace(/ês$/, 'esa'), regra: 'Terminado em ÊS: vira ESA (português, portuguesa).' }
    if (/or$/.test(p)) return { feminino: p.replace(/or$/, 'ora'), regra: 'Terminado em OR: em geral vira ORA (professor, professora). Alguns fazem TRIZ: ator, atriz.' }
    if (/ão$/.test(p)) return { feminino: p.replace(/ão$/, 'ã') + ' (ou ' + p.replace(/ão$/, 'ona') + ')', regra: 'Terminado em ÃO: vira Ã, OA ou ONA (irmão/irmã, leão/leoa, valentão/valentona).' }
    if (/eu$/.test(p)) return { feminino: p.replace(/eu$/, 'eia'), regra: 'Terminado em EU: vira EIA (europeu, europeia). Judeu é exceção: judia.' }
    if (/[ei]$/.test(p)) return { feminino: p + ' (mesma forma, muda o artigo)', regra: 'Comum de dois gêneros: a palavra não muda, muda o artigo (o estudante, a estudante).' }
    if (/l$/.test(p)) return { feminino: p + ' (mesma forma, muda o artigo)', regra: 'Comum de dois gêneros: o profissional, a profissional.' }
    return { feminino: p + 'a', regra: 'Sem terminação especial: costuma acrescentar A. Confira no dicionário.' }
}

/** Masculino a partir do feminino. */
function masculinoDe(palavra) {
    const p = String(palavra ?? '').toLowerCase().trim()
    if (!p) return null
    if (MASCULINO_PROPRIO.has(normal(p))) return { masculino: MASCULINO_PROPRIO.get(normal(p)), regra: 'Heterônimo: o par é outra palavra inteira.' }
    if (/triz$/.test(p)) return { masculino: p.replace(/triz$/, 'tor'), regra: 'Terminado em TRIZ: o masculino faz TOR (atriz, ator).' }
    if (/esa$/.test(p)) return { masculino: p.replace(/esa$/, 'ês'), regra: 'Terminado em ESA: o masculino faz ÊS (francesa, francês).' }
    if (/ora$/.test(p)) return { masculino: p.replace(/ora$/, 'or'), regra: 'Terminado em ORA: o masculino faz OR (doutora, doutor).' }
    if (/ona$/.test(p)) return { masculino: p.replace(/ona$/, 'ão'), regra: 'Terminado em ONA: o masculino faz ÃO (chorona, chorão).' }
    if (/a$/.test(p)) return { masculino: p.replace(/a$/, 'o'), regra: 'Terminado em A: troca por O (menina, menino).' }
    return { masculino: p + ' (mesma forma, muda o artigo)', regra: 'Comum de dois gêneros: muda só o artigo.' }
}

const DIMINUTIVO_PROPRIO = new Map([
    ['cão', 'cãozinho'], ['pé', 'pezinho'], ['café', 'cafezinho'], ['homem', 'homenzinho'],
    ['mulher', 'mulherzinha'], ['flor', 'florzinha'], ['pai', 'paizinho'], ['mãe', 'mãezinha'],
    ['casa', 'casinha (ou casebre)'], ['rio', 'riacho'], ['livro', 'livrinho (ou libreto)'],
    ['rapaz', 'rapazinho'], ['papel', 'papelzinho'], ['sol', 'solzinho'], ['jardim', 'jardinzinho']
])
const AUMENTATIVO_PROPRIO = new Map([
    ['casa', 'casarão'], ['homem', 'homenzarrão'], ['nariz', 'narigão'], ['boca', 'bocarra'],
    ['corpo', 'corpanzil'], ['cabeça', 'cabeçorra'], ['cão', 'canzarrão'], ['muro', 'muralha'],
    ['faca', 'facão'], ['sala', 'salão'], ['rico', 'ricaço'], ['pé', 'pezão'], ['forte', 'fortaleza'],
    ['drama', 'dramalhão'], ['vidro', 'vidraça']
])

/** Tira o acento só da última vogal: café + zinho = cafezinho. */
function semAcentoFinal(s) {
    const t = String(s ?? '')
    if (!t) return t
    const ultima = t.slice(-1)
    if (/[áéíóúâêôà]/.test(ultima)) return t.slice(0, -1) + tirarAcento(ultima)
    return t
}

/** Diminutivo com a regra do -INHO x -ZINHO. */
function diminutivoDe(palavra) {
    const p = String(palavra ?? '').toLowerCase().trim()
    if (!p) return null
    if (DIMINUTIVO_PROPRIO.has(p)) return { forma: DIMINUTIVO_PROPRIO.get(p), regra: 'Forma consagrada pelo uso: a língua já tinha uma pronta.' }
    const fem = /a$/.test(p)
    const c = classificarTonica(p)
    const oxitonaOuConsoante = !/[aeiou]$/.test(p) || (c && c.classe === 'oxítona') || /[ãõ]/.test(p)
    if (oxitonaOuConsoante) {
        const base = semAcentoFinal(p).replace(/m$/, 'n')
        return { forma: base + (fem ? 'zinha' : 'zinho'), regra: 'Palavra terminada em consoante, em vogal tônica ou nasal recebe ZINHO/ZINHA: café, cafezinho.' }
    }
    return { forma: p.slice(0, -1) + (fem ? 'inha' : 'inho'), regra: 'Palavra terminada em vogal átona troca a vogal por INHO/INHA: casa, casinha.' }
}

/** Aumentativo com a regra. */
function aumentativoDe(palavra) {
    const p = String(palavra ?? '').toLowerCase().trim()
    if (!p) return null
    if (AUMENTATIVO_PROPRIO.has(p)) return { forma: AUMENTATIVO_PROPRIO.get(p), regra: 'Forma consagrada pelo uso, fora do molde comum.' }
    const fem = /a$/.test(p)
    if (/[aeiou]$/.test(p)) {
        return { forma: p.slice(0, -1) + (fem ? 'ona' : 'ão'), regra: 'Terminada em vogal átona: troca a vogal por ÃO (no feminino, ONA).' }
    }
    const base = semAcentoFinal(p).replace(/m$/, 'n')
    return { forma: base + (fem ? 'zona' : 'zão'), regra: 'Terminada em consoante: entra o Z antes do ÃO (mulher, mulherzona).' }
}

const GRAU_IRREGULAR = new Map([
    ['bom', { comparativo: 'melhor', superlativo: 'ótimo (absoluto sintético)' }],
    ['mau', { comparativo: 'pior', superlativo: 'péssimo' }],
    ['grande', { comparativo: 'maior', superlativo: 'máximo' }],
    ['pequeno', { comparativo: 'menor', superlativo: 'mínimo' }],
    ['alto', { comparativo: 'superior', superlativo: 'supremo (ou sumo)' }],
    ['baixo', { comparativo: 'inferior', superlativo: 'ínfimo' }]
])
const SUPERLATIVO_ERUDITO = new Map([
    ['fácil', 'facílimo'], ['difícil', 'dificílimo'], ['fiel', 'fidelíssimo'], ['amigo', 'amicíssimo'],
    ['cruel', 'crudelíssimo'], ['pobre', 'paupérrimo'], ['nobre', 'nobilíssimo'], ['sábio', 'sapientíssimo'],
    ['antigo', 'antiquíssimo'], ['livre', 'libérrimo'], ['doce', 'dulcíssimo'], ['magro', 'macérrimo'],
    ['negro', 'nigérrimo'], ['simples', 'simplicíssimo'], ['geral', 'generalíssimo'], ['feroz', 'ferocíssimo']
])

/** Graus do adjetivo: comparativo e superlativo. */
function grausDe(adjetivo) {
    const p = String(adjetivo ?? '').toLowerCase().trim()
    if (!p) return null
    const irr = GRAU_IRREGULAR.get(p)
    let sintetico
    if (SUPERLATIVO_ERUDITO.has(p)) sintetico = SUPERLATIVO_ERUDITO.get(p)
    else if (/[aeiou]$/.test(p)) sintetico = p.slice(0, -1) + 'íssimo'
    else if (/z$/.test(p)) sintetico = p.slice(0, -1) + 'císsimo'
    else if (/l$/.test(p)) sintetico = p + 'íssimo'
    else if (/m$/.test(p)) sintetico = p.replace(/m$/, 'níssimo')
    else sintetico = p + 'íssimo'
    return {
        adjetivo: p,
        igualdade: 'tão ' + p + ' quanto',
        superioridade: irr ? irr.comparativo + ' que' : 'mais ' + p + ' que',
        inferioridade: 'menos ' + p + ' que',
        relativoMaior: irr ? 'o ' + irr.comparativo + ' de todos' : 'o mais ' + p + ' de todos',
        relativoMenor: 'o menos ' + p + ' de todos',
        absolutoAnalitico: 'muito ' + p,
        absolutoSintetico: sintetico,
        eruditoObs: irr ? 'Esse adjetivo tem forma própria de comparativo: ' + irr.comparativo + '.' : ''
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// VERBOS: conjugação regular por algoritmo, irregular por tabela conferida
// ═══════════════════════════════════════════════════════════════════════════

const TERMINACOES = {
    ar: {
        presente: ['o', 'as', 'a', 'amos', 'ais', 'am'],
        perfeito: ['ei', 'aste', 'ou', 'amos', 'astes', 'aram'],
        imperfeito: ['ava', 'avas', 'ava', 'ávamos', 'áveis', 'avam'],
        maisQuePerfeito: ['ara', 'aras', 'ara', 'áramos', 'áreis', 'aram'],
        subjPresente: ['e', 'es', 'e', 'emos', 'eis', 'em'],
        subjImperfeito: ['asse', 'asses', 'asse', 'ássemos', 'ásseis', 'assem'],
        subjFuturo: ['ar', 'ares', 'ar', 'armos', 'ardes', 'arem'],
        gerundio: 'ando', participio: 'ado', vos: 'ai'
    },
    er: {
        presente: ['o', 'es', 'e', 'emos', 'eis', 'em'],
        perfeito: ['i', 'este', 'eu', 'emos', 'estes', 'eram'],
        imperfeito: ['ia', 'ias', 'ia', 'íamos', 'íeis', 'iam'],
        maisQuePerfeito: ['era', 'eras', 'era', 'êramos', 'êreis', 'eram'],
        subjPresente: ['a', 'as', 'a', 'amos', 'ais', 'am'],
        subjImperfeito: ['esse', 'esses', 'esse', 'êssemos', 'êsseis', 'essem'],
        subjFuturo: ['er', 'eres', 'er', 'ermos', 'erdes', 'erem'],
        gerundio: 'endo', participio: 'ido', vos: 'ei'
    },
    ir: {
        presente: ['o', 'es', 'e', 'imos', 'is', 'em'],
        perfeito: ['i', 'iste', 'iu', 'imos', 'istes', 'iram'],
        imperfeito: ['ia', 'ias', 'ia', 'íamos', 'íeis', 'iam'],
        maisQuePerfeito: ['ira', 'iras', 'ira', 'íramos', 'íreis', 'iram'],
        subjPresente: ['a', 'as', 'a', 'amos', 'ais', 'am'],
        subjImperfeito: ['isse', 'isses', 'isse', 'íssemos', 'ísseis', 'issem'],
        subjFuturo: ['ir', 'ires', 'ir', 'irmos', 'irdes', 'irem'],
        gerundio: 'indo', participio: 'ido', vos: 'i'
    }
}

/**
 * Ajuste ortográfico do radical: ficar vira fique, pagar vira pague,
 * começar vira comece, conhecer vira conheço, dirigir vira dirijo.
 * Sem isto o algoritmo devolveria "fice" e "conheco", que ninguém escreve.
 */
function ajustarRadical(raiz, terminacao, infinitivo) {
    const t = terminacao.charAt(0)
    const inf = infinitivo.toLowerCase()
    if (/car$/.test(inf) && 'eé'.includes(t)) return raiz.replace(/c$/, 'qu')
    if (/gar$/.test(inf) && 'eé'.includes(t)) return raiz.replace(/g$/, 'gu')
    if (/çar$/.test(inf) && 'eé'.includes(t)) return raiz.replace(/ç$/, 'c')
    if (/(cer|cir)$/.test(inf) && 'aáo'.includes(t)) return raiz.replace(/c$/, 'ç')
    if (/(ger|gir)$/.test(inf) && 'aáo'.includes(t)) return raiz.replace(/g$/, 'j')
    if (/(guer|guir)$/.test(inf) && 'aáo'.includes(t)) return raiz.replace(/gu$/, 'g')
    return raiz
}

/** Aplica as seis terminações de um tempo ao radical. */
function serie(raiz, terminacoes, infinitivo) {
    return terminacoes.map(t => ajustarRadical(raiz, t, infinitivo) + t)
}

const PARTICIPIO_IRREGULAR = new Map([
    ['abrir', 'aberto'], ['cobrir', 'coberto'], ['descobrir', 'descoberto'], ['escrever', 'escrito'],
    ['ganhar', 'ganho (ou ganhado)'], ['gastar', 'gasto (ou gastado)'], ['pagar', 'pago (ou pagado)'],
    ['aceitar', 'aceito (ou aceitado)'], ['entregar', 'entregue'], ['expressar', 'expresso'],
    ['imprimir', 'impresso (ou imprimido)'], ['morrer', 'morto'], ['matar', 'morto'],
    ['prender', 'preso'], ['eleger', 'eleito'], ['extinguir', 'extinto'], ['salvar', 'salvo'],
    ['soltar', 'solto'], ['acender', 'aceso'], ['limpar', 'limpo'], ['suspender', 'suspenso'],
    ['romper', 'roto (ou rompido)'], ['enxugar', 'enxuto'], ['submergir', 'submerso']
])

/**
 * Tabela dos irregulares mais usados. Cada tempo tem as seis pessoas na ordem
 * eu, tu, ele, nós, vós, eles. Escritas à mão e conferidas uma a uma: verbo
 * irregular não sai de algoritmo.
 */
const IRREGULARES = {
    ser: {
        presente: ['sou', 'és', 'é', 'somos', 'sois', 'são'],
        perfeito: ['fui', 'foste', 'foi', 'fomos', 'fostes', 'foram'],
        imperfeito: ['era', 'eras', 'era', 'éramos', 'éreis', 'eram'],
        maisQuePerfeito: ['fora', 'foras', 'fora', 'fôramos', 'fôreis', 'foram'],
        subjPresente: ['seja', 'sejas', 'seja', 'sejamos', 'sejais', 'sejam'],
        subjImperfeito: ['fosse', 'fosses', 'fosse', 'fôssemos', 'fôsseis', 'fossem'],
        subjFuturo: ['for', 'fores', 'for', 'formos', 'fordes', 'forem'],
        imperativo: ['—', 'sê', 'seja', 'sejamos', 'sede', 'sejam'],
        gerundio: 'sendo', participio: 'sido'
    },
    estar: {
        presente: ['estou', 'estás', 'está', 'estamos', 'estais', 'estão'],
        perfeito: ['estive', 'estiveste', 'esteve', 'estivemos', 'estivestes', 'estiveram'],
        imperfeito: ['estava', 'estavas', 'estava', 'estávamos', 'estáveis', 'estavam'],
        maisQuePerfeito: ['estivera', 'estiveras', 'estivera', 'estivéramos', 'estivéreis', 'estiveram'],
        subjPresente: ['esteja', 'estejas', 'esteja', 'estejamos', 'estejais', 'estejam'],
        subjImperfeito: ['estivesse', 'estivesses', 'estivesse', 'estivéssemos', 'estivésseis', 'estivessem'],
        subjFuturo: ['estiver', 'estiveres', 'estiver', 'estivermos', 'estiverdes', 'estiverem'],
        imperativo: ['—', 'está', 'esteja', 'estejamos', 'estai', 'estejam'],
        gerundio: 'estando', participio: 'estado'
    },
    ir: {
        presente: ['vou', 'vais', 'vai', 'vamos', 'ides', 'vão'],
        perfeito: ['fui', 'foste', 'foi', 'fomos', 'fostes', 'foram'],
        imperfeito: ['ia', 'ias', 'ia', 'íamos', 'íeis', 'iam'],
        maisQuePerfeito: ['fora', 'foras', 'fora', 'fôramos', 'fôreis', 'foram'],
        subjPresente: ['vá', 'vás', 'vá', 'vamos', 'vades', 'vão'],
        subjImperfeito: ['fosse', 'fosses', 'fosse', 'fôssemos', 'fôsseis', 'fossem'],
        subjFuturo: ['for', 'fores', 'for', 'formos', 'fordes', 'forem'],
        imperativo: ['—', 'vai', 'vá', 'vamos', 'ide', 'vão'],
        gerundio: 'indo', participio: 'ido'
    },
    vir: {
        presente: ['venho', 'vens', 'vem', 'vimos', 'vindes', 'vêm'],
        perfeito: ['vim', 'vieste', 'veio', 'viemos', 'viestes', 'vieram'],
        imperfeito: ['vinha', 'vinhas', 'vinha', 'vínhamos', 'vínheis', 'vinham'],
        maisQuePerfeito: ['viera', 'vieras', 'viera', 'viéramos', 'viéreis', 'vieram'],
        subjPresente: ['venha', 'venhas', 'venha', 'venhamos', 'venhais', 'venham'],
        subjImperfeito: ['viesse', 'viesses', 'viesse', 'viéssemos', 'viésseis', 'viessem'],
        subjFuturo: ['vier', 'vieres', 'vier', 'viermos', 'vierdes', 'vierem'],
        imperativo: ['—', 'vem', 'venha', 'venhamos', 'vinde', 'venham'],
        gerundio: 'vindo', participio: 'vindo'
    },
    ter: {
        presente: ['tenho', 'tens', 'tem', 'temos', 'tendes', 'têm'],
        perfeito: ['tive', 'tiveste', 'teve', 'tivemos', 'tivestes', 'tiveram'],
        imperfeito: ['tinha', 'tinhas', 'tinha', 'tínhamos', 'tínheis', 'tinham'],
        maisQuePerfeito: ['tivera', 'tiveras', 'tivera', 'tivéramos', 'tivéreis', 'tiveram'],
        subjPresente: ['tenha', 'tenhas', 'tenha', 'tenhamos', 'tenhais', 'tenham'],
        subjImperfeito: ['tivesse', 'tivesses', 'tivesse', 'tivéssemos', 'tivésseis', 'tivessem'],
        subjFuturo: ['tiver', 'tiveres', 'tiver', 'tivermos', 'tiverdes', 'tiverem'],
        imperativo: ['—', 'tem', 'tenha', 'tenhamos', 'tende', 'tenham'],
        gerundio: 'tendo', participio: 'tido'
    },
    haver: {
        presente: ['hei', 'hás', 'há', 'havemos', 'haveis', 'hão'],
        perfeito: ['houve', 'houveste', 'houve', 'houvemos', 'houvestes', 'houveram'],
        imperfeito: ['havia', 'havias', 'havia', 'havíamos', 'havíeis', 'haviam'],
        maisQuePerfeito: ['houvera', 'houveras', 'houvera', 'houvéramos', 'houvéreis', 'houveram'],
        subjPresente: ['haja', 'hajas', 'haja', 'hajamos', 'hajais', 'hajam'],
        subjImperfeito: ['houvesse', 'houvesses', 'houvesse', 'houvéssemos', 'houvésseis', 'houvessem'],
        subjFuturo: ['houver', 'houveres', 'houver', 'houvermos', 'houverdes', 'houverem'],
        imperativo: ['—', 'há', 'haja', 'hajamos', 'havei', 'hajam'],
        gerundio: 'havendo', participio: 'havido'
    },
    fazer: {
        presente: ['faço', 'fazes', 'faz', 'fazemos', 'fazeis', 'fazem'],
        perfeito: ['fiz', 'fizeste', 'fez', 'fizemos', 'fizestes', 'fizeram'],
        imperfeito: ['fazia', 'fazias', 'fazia', 'fazíamos', 'fazíeis', 'faziam'],
        maisQuePerfeito: ['fizera', 'fizeras', 'fizera', 'fizéramos', 'fizéreis', 'fizeram'],
        futuroPresente: ['farei', 'farás', 'fará', 'faremos', 'fareis', 'farão'],
        futuroPreterito: ['faria', 'farias', 'faria', 'faríamos', 'faríeis', 'fariam'],
        subjPresente: ['faça', 'faças', 'faça', 'façamos', 'façais', 'façam'],
        subjImperfeito: ['fizesse', 'fizesses', 'fizesse', 'fizéssemos', 'fizésseis', 'fizessem'],
        subjFuturo: ['fizer', 'fizeres', 'fizer', 'fizermos', 'fizerdes', 'fizerem'],
        imperativo: ['—', 'faze (ou faz)', 'faça', 'façamos', 'fazei', 'façam'],
        gerundio: 'fazendo', participio: 'feito'
    },
    dizer: {
        presente: ['digo', 'dizes', 'diz', 'dizemos', 'dizeis', 'dizem'],
        perfeito: ['disse', 'disseste', 'disse', 'dissemos', 'dissestes', 'disseram'],
        imperfeito: ['dizia', 'dizias', 'dizia', 'dizíamos', 'dizíeis', 'diziam'],
        maisQuePerfeito: ['dissera', 'disseras', 'dissera', 'disséramos', 'disséreis', 'disseram'],
        futuroPresente: ['direi', 'dirás', 'dirá', 'diremos', 'direis', 'dirão'],
        futuroPreterito: ['diria', 'dirias', 'diria', 'diríamos', 'diríeis', 'diriam'],
        subjPresente: ['diga', 'digas', 'diga', 'digamos', 'digais', 'digam'],
        subjImperfeito: ['dissesse', 'dissesses', 'dissesse', 'disséssemos', 'dissésseis', 'dissessem'],
        subjFuturo: ['disser', 'disseres', 'disser', 'dissermos', 'disserdes', 'disserem'],
        imperativo: ['—', 'dize (ou diz)', 'diga', 'digamos', 'dizei', 'digam'],
        gerundio: 'dizendo', participio: 'dito'
    },
    poder: {
        presente: ['posso', 'podes', 'pode', 'podemos', 'podeis', 'podem'],
        perfeito: ['pude', 'pudeste', 'pôde', 'pudemos', 'pudestes', 'puderam'],
        imperfeito: ['podia', 'podias', 'podia', 'podíamos', 'podíeis', 'podiam'],
        maisQuePerfeito: ['pudera', 'puderas', 'pudera', 'pudéramos', 'pudéreis', 'puderam'],
        subjPresente: ['possa', 'possas', 'possa', 'possamos', 'possais', 'possam'],
        subjImperfeito: ['pudesse', 'pudesses', 'pudesse', 'pudéssemos', 'pudésseis', 'pudessem'],
        subjFuturo: ['puder', 'puderes', 'puder', 'pudermos', 'puderdes', 'puderem'],
        imperativo: ['—', '—', '—', '—', '—', '—'],
        gerundio: 'podendo', participio: 'podido',
        observacao: 'Poder não tem imperativo em uso: ninguém manda alguém poder. Note o acento de "ele pôde" (passado) contra "ele pode" (presente).'
    },
    querer: {
        presente: ['quero', 'queres', 'quer', 'queremos', 'quereis', 'querem'],
        perfeito: ['quis', 'quiseste', 'quis', 'quisemos', 'quisestes', 'quiseram'],
        imperfeito: ['queria', 'querias', 'queria', 'queríamos', 'queríeis', 'queriam'],
        maisQuePerfeito: ['quisera', 'quiseras', 'quisera', 'quiséramos', 'quiséreis', 'quiseram'],
        subjPresente: ['queira', 'queiras', 'queira', 'queiramos', 'queirais', 'queiram'],
        subjImperfeito: ['quisesse', 'quisesses', 'quisesse', 'quiséssemos', 'quisésseis', 'quisessem'],
        subjFuturo: ['quiser', 'quiseres', 'quiser', 'quisermos', 'quiserdes', 'quiserem'],
        imperativo: ['—', 'quer (ou quere)', 'queira', 'queiramos', 'querei', 'queiram'],
        gerundio: 'querendo', participio: 'querido',
        observacao: 'A terceira pessoa é "ele quer", sem E final. "Ele quere" não existe na língua de hoje.'
    },
    saber: {
        presente: ['sei', 'sabes', 'sabe', 'sabemos', 'sabeis', 'sabem'],
        perfeito: ['soube', 'soubeste', 'soube', 'soubemos', 'soubestes', 'souberam'],
        imperfeito: ['sabia', 'sabias', 'sabia', 'sabíamos', 'sabíeis', 'sabiam'],
        maisQuePerfeito: ['soubera', 'souberas', 'soubera', 'soubéramos', 'soubéreis', 'souberam'],
        subjPresente: ['saiba', 'saibas', 'saiba', 'saibamos', 'saibais', 'saibam'],
        subjImperfeito: ['soubesse', 'soubesses', 'soubesse', 'soubéssemos', 'soubésseis', 'soubessem'],
        subjFuturo: ['souber', 'souberes', 'souber', 'soubermos', 'souberdes', 'souberem'],
        imperativo: ['—', 'sabe', 'saiba', 'saibamos', 'sabei', 'saibam'],
        gerundio: 'sabendo', participio: 'sabido'
    },
    ver: {
        presente: ['vejo', 'vês', 'vê', 'vemos', 'vedes', 'veem'],
        perfeito: ['vi', 'viste', 'viu', 'vimos', 'vistes', 'viram'],
        imperfeito: ['via', 'vias', 'via', 'víamos', 'víeis', 'viam'],
        maisQuePerfeito: ['vira', 'viras', 'vira', 'víramos', 'víreis', 'viram'],
        subjPresente: ['veja', 'vejas', 'veja', 'vejamos', 'vejais', 'vejam'],
        subjImperfeito: ['visse', 'visses', 'visse', 'víssemos', 'vísseis', 'vissem'],
        subjFuturo: ['vir', 'vires', 'vir', 'virmos', 'virdes', 'virem'],
        imperativo: ['—', 'vê', 'veja', 'vejamos', 'vede', 'vejam'],
        gerundio: 'vendo', participio: 'visto',
        observacao: 'O futuro do subjuntivo de VER é igual ao infinitivo de VIR: "quando eu vir" é de ver; "se eu vier" é de vir.'
    },
    'pôr': {
        presente: ['ponho', 'pões', 'põe', 'pomos', 'pondes', 'põem'],
        perfeito: ['pus', 'puseste', 'pôs', 'pusemos', 'pusestes', 'puseram'],
        imperfeito: ['punha', 'punhas', 'punha', 'púnhamos', 'púnheis', 'punham'],
        maisQuePerfeito: ['pusera', 'puseras', 'pusera', 'puséramos', 'puséreis', 'puseram'],
        futuroPresente: ['porei', 'porás', 'porá', 'poremos', 'poreis', 'porão'],
        futuroPreterito: ['poria', 'porias', 'poria', 'poríamos', 'poríeis', 'poriam'],
        subjPresente: ['ponha', 'ponhas', 'ponha', 'ponhamos', 'ponhais', 'ponham'],
        subjImperfeito: ['pusesse', 'pusesses', 'pusesse', 'puséssemos', 'pusésseis', 'pusessem'],
        subjFuturo: ['puser', 'puseres', 'puser', 'pusermos', 'puserdes', 'puserem'],
        imperativo: ['—', 'põe', 'ponha', 'ponhamos', 'ponde', 'ponham'],
        gerundio: 'pondo', participio: 'posto',
        observacao: 'PÔR leva acento para não se confundir com a preposição POR. Os derivados (compor, dispor, supor) seguem o mesmo molde, sem acento.'
    },
    trazer: {
        presente: ['trago', 'trazes', 'traz', 'trazemos', 'trazeis', 'trazem'],
        perfeito: ['trouxe', 'trouxeste', 'trouxe', 'trouxemos', 'trouxestes', 'trouxeram'],
        imperfeito: ['trazia', 'trazias', 'trazia', 'trazíamos', 'trazíeis', 'traziam'],
        maisQuePerfeito: ['trouxera', 'trouxeras', 'trouxera', 'trouxéramos', 'trouxéreis', 'trouxeram'],
        futuroPresente: ['trarei', 'trarás', 'trará', 'traremos', 'trareis', 'trarão'],
        futuroPreterito: ['traria', 'trarias', 'traria', 'traríamos', 'traríeis', 'trariam'],
        subjPresente: ['traga', 'tragas', 'traga', 'tragamos', 'tragais', 'tragam'],
        subjImperfeito: ['trouxesse', 'trouxesses', 'trouxesse', 'trouxéssemos', 'trouxésseis', 'trouxessem'],
        subjFuturo: ['trouxer', 'trouxeres', 'trouxer', 'trouxermos', 'trouxerdes', 'trouxerem'],
        imperativo: ['—', 'traze (ou traz)', 'traga', 'tragamos', 'trazei', 'tragam'],
        gerundio: 'trazendo', participio: 'trazido',
        observacao: 'É "trouxe", com X, e não "trousse". O futuro é "trarei", não "trazerei".'
    },
    dar: {
        presente: ['dou', 'dás', 'dá', 'damos', 'dais', 'dão'],
        perfeito: ['dei', 'deste', 'deu', 'demos', 'destes', 'deram'],
        imperfeito: ['dava', 'davas', 'dava', 'dávamos', 'dáveis', 'davam'],
        maisQuePerfeito: ['dera', 'deras', 'dera', 'déramos', 'déreis', 'deram'],
        subjPresente: ['dê', 'dês', 'dê', 'demos', 'deis', 'deem'],
        subjImperfeito: ['desse', 'desses', 'desse', 'déssemos', 'désseis', 'dessem'],
        subjFuturo: ['der', 'deres', 'der', 'dermos', 'derdes', 'derem'],
        imperativo: ['—', 'dá', 'dê', 'demos', 'dai', 'deem'],
        gerundio: 'dando', participio: 'dado'
    }
}

/** Verbos irregulares que a tabela não cobre — a resposta avisa em vez de mentir. */
const IRREGULARES_SEM_TABELA = ['caber', 'valer', 'ouvir', 'pedir', 'perder', 'medir', 'dormir',
    'servir', 'sentir', 'subir', 'cair', 'sair', 'ler', 'crer', 'rir', 'construir', 'destruir',
    'possuir', 'odiar', 'mediar', 'ansiar', 'remediar', 'passear', 'requerer', 'prover', 'reaver',
    'precaver', 'aderir', 'preferir', 'ferir', 'seguir', 'conseguir', 'vestir', 'repetir', 'agredir']

/**
 * Conjuga o verbo. Irregular sai da tabela; regular sai do algoritmo, com os
 * ajustes ortográficos. Sempre volta de que jeito a resposta foi montada.
 * @param {string} bruto verbo no infinitivo (aceita com espaços em volta)
 */
function conjugar(bruto) {
    const v = String(bruto ?? '').trim().toLowerCase().replace(/[^\p{L}]/gu, '')
    if (!v) return null
    if (!/(ar|er|ir|or|ôr)$/.test(v) || v.length < 2) {
        return { erro: 'naoInfinitivo', verbo: v }
    }
    const chave = v === 'por' ? 'pôr' : v
    const tab = IRREGULARES[chave]
    const tipo = /ar$/.test(chave) ? 'ar' : /ir$/.test(chave) ? 'ir' : 'er'
    const raiz = chave.slice(0, -2)
    const term = TERMINACOES[tipo]

    if (tab) {
        const inf = chave
        const futuroPresente = tab.futuroPresente || ['ei', 'ás', 'á', 'emos', 'eis', 'ão'].map(t => inf + t)
        const futuroPreterito = tab.futuroPreterito || ['ia', 'ias', 'ia', 'íamos', 'íeis', 'iam'].map(t => inf + t)
        return {
            verbo: inf, irregular: true, tipo,
            presente: tab.presente, perfeito: tab.perfeito, imperfeito: tab.imperfeito,
            maisQuePerfeito: tab.maisQuePerfeito, futuroPresente, futuroPreterito,
            subjPresente: tab.subjPresente, subjImperfeito: tab.subjImperfeito, subjFuturo: tab.subjFuturo,
            imperativoAfirmativo: tab.imperativo,
            imperativoNegativo: ['—', 'não ' + tab.subjPresente[1], 'não ' + tab.subjPresente[2],
                'não ' + tab.subjPresente[3], 'não ' + tab.subjPresente[4], 'não ' + tab.subjPresente[5]],
            infinitivoPessoal: ['', 'es', '', 'mos', 'des', 'em'].map(t => inf + t),
            gerundio: tab.gerundio, participio: tab.participio,
            observacao: tab.observacao || 'Este verbo é irregular: a tabela acima foi escrita à mão, não saiu de regra.'
        }
    }

    const presente = serie(raiz, term.presente, chave)
    const subjPresente = serie(raiz, term.subjPresente, chave)
    const participio = PARTICIPIO_IRREGULAR.get(chave) || (raiz + term.participio)
    const irregularConhecido = IRREGULARES_SEM_TABELA.includes(chave)
    return {
        verbo: chave, irregular: false, tipo,
        presente,
        perfeito: serie(raiz, term.perfeito, chave),
        imperfeito: serie(raiz, term.imperfeito, chave),
        maisQuePerfeito: serie(raiz, term.maisQuePerfeito, chave),
        futuroPresente: ['ei', 'ás', 'á', 'emos', 'eis', 'ão'].map(t => chave + t),
        futuroPreterito: ['ia', 'ias', 'ia', 'íamos', 'íeis', 'iam'].map(t => chave + t),
        subjPresente,
        subjImperfeito: serie(raiz, term.subjImperfeito, chave),
        subjFuturo: serie(raiz, term.subjFuturo, chave),
        imperativoAfirmativo: ['—', presente[1].replace(/s$/, ''), subjPresente[2], subjPresente[3], raiz + term.vos, subjPresente[5]],
        imperativoNegativo: ['—', 'não ' + subjPresente[1], 'não ' + subjPresente[2], 'não ' + subjPresente[3],
            'não ' + subjPresente[4], 'não ' + subjPresente[5]],
        infinitivoPessoal: ['', 'es', '', 'mos', 'des', 'em'].map(t => chave + t),
        gerundio: raiz + term.gerundio,
        participio,
        avisoIrregular: irregularConhecido,
        observacao: irregularConhecido
            ? 'Atenção: ' + chave + ' é irregular e não está na minha tabela conferida. O que mostrei é o molde regular, que serve de referência mas tem formas trocadas. Confira num dicionário antes de usar na prova.'
            : 'Verbo regular da ' + (tipo === 'ar' ? 'primeira' : tipo === 'er' ? 'segunda' : 'terceira') + ' conjugação: segue o molde de ' + (tipo === 'ar' ? 'cantar' : tipo === 'er' ? 'vender' : 'partir') + '.'
    }
}

/** Monta as seis linhas "eu canto / tu cantas" de um tempo. */
function linhasDeTempo(formas, pronomes = PESSOAS) {
    if (!formas) return []
    return formas.map((f, i) => '*' + pronomes[i] + ':* ' + f)
}

/** Diz se o verbo é regular, irregular com tabela ou irregular sem tabela. */
function tipoDeVerbo(bruto) {
    const c = conjugar(bruto)
    if (!c || c.erro) return null
    if (c.irregular) return { verbo: c.verbo, situacao: 'irregular', detalhe: 'Está na minha tabela conferida, com todas as formas escritas à mão.' }
    if (c.avisoIrregular) return { verbo: c.verbo, situacao: 'irregular', detalhe: 'É irregular, mas ainda não entrou na tabela: confira as formas no dicionário.' }
    return { verbo: c.verbo, situacao: 'regular', detalhe: 'Segue o molde da ' + (c.tipo === 'ar' ? 'primeira' : c.tipo === 'er' ? 'segunda' : 'terceira') + ' conjugação do começo ao fim.' }
}

// ═══════════════════════════════════════════════════════════════════════════
// CLASSES DE PALAVRAS: léxicos fechados + leitura morfológica
// ═══════════════════════════════════════════════════════════════════════════

const ARTIGOS = new Set(['o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas'])
const PREPOSICOES = new Set(['a', 'ante', 'apos', 'ate', 'com', 'contra', 'de', 'desde', 'em', 'entre',
    'para', 'perante', 'por', 'sem', 'sob', 'sobre', 'tras', 'durante', 'mediante', 'salvo', 'exceto', 'via'])
const CONTRACOES = new Set(['do', 'da', 'dos', 'das', 'no', 'na', 'nos', 'nas', 'ao', 'aos', 'a', 'as',
    'pelo', 'pela', 'pelos', 'pelas', 'num', 'numa', 'nuns', 'numas', 'dum', 'duma', 'neste', 'nesta',
    'nisso', 'disso', 'deste', 'desta', 'daquele', 'daquela', 'aquele', 'naquele', 'nele', 'nela',
    'dele', 'dela', 'deles', 'delas', 'pro', 'pra', 'donde', 'aonde'])
const CONJUNCOES = new Set(['e', 'mas', 'porem', 'todavia', 'contudo', 'entretanto', 'ou', 'nem',
    'porque', 'pois', 'portanto', 'logo', 'entao', 'que', 'se', 'quando', 'enquanto', 'embora',
    'conquanto', 'caso', 'conforme', 'porquanto', 'ora', 'quer', 'seja'])
const PRONOMES = new Set(['eu', 'tu', 'ele', 'ela', 'nos', 'vos', 'eles', 'elas', 'me', 'te', 'se',
    'lhe', 'lhes', 'mim', 'ti', 'si', 'comigo', 'contigo', 'conosco', 'convosco', 'consigo',
    'meu', 'minha', 'meus', 'minhas', 'teu', 'tua', 'teus', 'tuas', 'seu', 'sua', 'seus', 'suas',
    'nosso', 'nossa', 'nossos', 'nossas', 'vosso', 'vossa', 'este', 'esta', 'estes', 'estas', 'isto',
    'esse', 'essa', 'esses', 'essas', 'isso', 'aquele', 'aquela', 'aqueles', 'aquelas', 'aquilo',
    'quem', 'qual', 'quais', 'cujo', 'cuja', 'cujos', 'cujas', 'quanto', 'quanta', 'algum', 'alguma',
    'alguns', 'algumas', 'nenhum', 'nenhuma', 'todo', 'toda', 'todos', 'todas', 'outro', 'outra',
    'outros', 'outras', 'muitos', 'muitas', 'varios', 'varias', 'certo', 'certa', 'qualquer',
    'quaisquer', 'cada', 'alguem', 'ninguem', 'tudo', 'nada', 'algo', 'voce', 'voces', 'lhe'])
const ADVERBIOS = new Set(['nao', 'sim', 'muito', 'pouco', 'bem', 'mal', 'ja', 'ainda', 'sempre',
    'nunca', 'jamais', 'talvez', 'aqui', 'ali', 'la', 'ai', 'acola', 'hoje', 'ontem', 'amanha',
    'agora', 'depois', 'antes', 'cedo', 'tarde', 'assim', 'devagar', 'demais', 'bastante', 'quase',
    'apenas', 'somente', 'so', 'tambem', 'certamente', 'realmente', 'onde', 'como', 'melhor', 'pior',
    'perto', 'longe', 'dentro', 'fora', 'acima', 'abaixo', 'atras', 'adiante', 'sobretudo', 'alias'])
const NUMERAIS = new Set(['um', 'dois', 'duas', 'tres', 'quatro', 'cinco', 'seis', 'sete', 'oito',
    'nove', 'dez', 'onze', 'doze', 'treze', 'catorze', 'quatorze', 'quinze', 'dezesseis', 'dezessete',
    'dezoito', 'dezenove', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta',
    'oitenta', 'noventa', 'cem', 'cento', 'mil', 'milhao', 'bilhao', 'primeiro', 'segundo', 'terceiro',
    'quarto', 'quinto', 'sexto', 'setimo', 'oitavo', 'nono', 'decimo', 'dobro', 'triplo', 'metade', 'terco'])
const INTERJEICOES = new Set(['ah', 'oh', 'ai', 'ei', 'ui', 'oba', 'opa', 'ora', 'puxa', 'nossa',
    'caramba', 'psiu', 'eba', 'oxe', 'uau', 'socorro', 'viva', 'alo', 'ola'])

/** Verbos de ligação: quem tem eles no meio faz predicado nominal. */
const VERBOS_LIGACAO = new Set(['ser', 'estar', 'parecer', 'ficar', 'permanecer', 'continuar',
    'andar', 'tornar', 'virar', 'seguir', 'acabar'])
const FORMAS_LIGACAO = new Set(['é', 'são', 'sou', 'somos', 'era', 'eram', 'foi', 'foram', 'será',
    'serão', 'seja', 'sejam', 'está', 'estão', 'estou', 'estamos', 'estava', 'estavam', 'esteve',
    'parece', 'parecem', 'pareceu', 'fica', 'ficam', 'ficou', 'ficaram', 'permanece', 'continua',
    'anda', 'virou', 'tornou-se', 'tornaram-se', 'continuam'])

/** Auxiliares das locuções verbais (tinha feito, vai chegar, foi visto). */
const AUXILIARES = new Set(['ter', 'haver', 'ser', 'estar', 'ir', 'vir', 'poder', 'dever', 'querer',
    'começar', 'acabar', 'continuar', 'costumar', 'precisar'])

/** Formas verbais frequentes que a morfologia sozinha erraria. */
const FORMAS_VERBAIS = new Set(['é', 'são', 'sou', 'somos', 'sois', 'és', 'foi', 'foram', 'fui',
    'fomos', 'era', 'eram', 'será', 'serão', 'seja', 'sejam', 'fosse', 'fossem', 'for', 'forem',
    'está', 'estão', 'estou', 'estamos', 'estava', 'estavam', 'esteve', 'estive', 'estiveram',
    'tem', 'têm', 'tenho', 'temos', 'tinha', 'tinham', 'teve', 'tive', 'tiveram', 'terá', 'terão',
    'tenha', 'tenham', 'há', 'havia', 'houve', 'houver', 'haja', 'hão', 'hei', 'haverá',
    'vai', 'vou', 'vamos', 'vão', 'ia', 'iam', 'irá', 'irão', 'vá', 'vão', 'foste',
    'vem', 'vêm', 'venho', 'vimos', 'veio', 'vieram', 'virá', 'venha', 'venham', 'vinha',
    'faz', 'faço', 'fazem', 'fez', 'fizeram', 'fará', 'faça', 'façam', 'fazia', 'faziam',
    'diz', 'digo', 'dizem', 'disse', 'disseram', 'dirá', 'diga', 'digam', 'dizia',
    'pode', 'posso', 'podem', 'pôde', 'puderam', 'poderá', 'possa', 'possam', 'podia', 'podiam',
    'quer', 'quero', 'querem', 'quis', 'quiseram', 'queira', 'queiram', 'queria', 'queriam',
    'sabe', 'sei', 'sabem', 'soube', 'souberam', 'saiba', 'saibam', 'sabia', 'sabiam',
    'vê', 'vejo', 'veem', 'vê', 'viu', 'viram', 'vi', 'verá', 'veja', 'vejam', 'via', 'viam',
    'põe', 'ponho', 'põem', 'pôs', 'puseram', 'porá', 'ponha', 'ponham', 'punha',
    'traz', 'trago', 'trazem', 'trouxe', 'trouxeram', 'trará', 'traga', 'tragam',
    'dá', 'dou', 'dão', 'deu', 'deram', 'dei', 'dará', 'dê', 'deem', 'dava',
    'diz-se', 'gosta', 'gostam', 'gostei', 'chega', 'chegou', 'chegaram', 'sai', 'saiu', 'saíram',
    'lê', 'leio', 'leem', 'leu', 'leram', 'ouve', 'ouço', 'ouvem', 'ouviu', 'pede', 'peço', 'pediu',
    'perde', 'perco', 'perdeu', 'dorme', 'durmo', 'dormiu', 'sente', 'sinto', 'sentiu',
    'cai', 'caiu', 'caíram', 'ri', 'riu', 'creio', 'crê', 'sobe', 'subiu', 'serve', 'serviu'])

/** Palavras terminadas em -ar/-er/-ir que NÃO são verbo. */
const NAO_VERBO = new Set(['lugar', 'altar', 'acucar', 'bar', 'mar', 'par', 'impar', 'celular',
    'militar', 'familiar', 'escolar', 'particular', 'popular', 'singular', 'circular', 'auxiliar',
    'colar', 'pilar', 'olhar', 'jantar', 'poder', 'dever', 'prazer', 'saber', 'ser', 'ter', 'ver',
    'mulher', 'talher', 'qualquer', 'ninguem', 'alguem', 'porvir', 'nadir', 'elixir', 'sir',
    'ar', 'lar', 'dolar', 'hospitalar', 'exemplar', 'titular', 'nuclear', 'linear', 'maior', 'menor',
    'melhor', 'pior', 'amor', 'calor', 'cor', 'dor', 'flor', 'valor', 'senhor', 'professor', 'doutor',
    'ator', 'motor', 'setor', 'autor', 'favor', 'humor', 'sabor', 'suor', 'temor', 'terror', 'vapor'])

/** Sufixos que denunciam adjetivo. */
const SUFIXOS_ADJETIVO = /(oso|osa|osos|osas|ável|ível|áveis|íveis|ante|ente|inte|ico|ica|icos|icas|ivo|iva|ivos|ivas|al|ais|ense|ês|esa|ista|udo|uda|ento|enta|onho|onha)$/
const ADJETIVOS_COMUNS = new Set(['bom', 'boa', 'bons', 'boas', 'mau', 'ma', 'maus', 'mas', 'grande',
    'grandes', 'pequeno', 'pequena', 'novo', 'nova', 'velho', 'velha', 'jovem', 'alto', 'alta',
    'baixo', 'baixa', 'longo', 'longa', 'curto', 'curta', 'forte', 'fraco', 'fraca', 'rico', 'rica',
    'pobre', 'feliz', 'triste', 'bonito', 'bonita', 'feio', 'feia', 'limpo', 'limpa', 'sujo', 'suja',
    'certo', 'errado', 'facil', 'dificil', 'caro', 'cara', 'barato', 'barata', 'claro', 'escuro',
    'quente', 'frio', 'fria', 'doce', 'amargo', 'lento', 'rapido', 'rapida', 'simples', 'complexo',
    'antigo', 'moderno', 'publico', 'privado', 'nacional', 'social', 'legal', 'ruim', 'otimo', 'pessimo'])

const SUBSTANTIVOS_COMUNS = new Set(['casa', 'carro', 'livro', 'mesa', 'cadeira', 'escola', 'aluno',
    'professor', 'menino', 'menina', 'homem', 'mulher', 'crianca', 'cidade', 'pais', 'rua', 'dia',
    'noite', 'tarde', 'manha', 'hora', 'ano', 'mes', 'semana', 'tempo', 'vida', 'morte', 'amor',
    'trabalho', 'dinheiro', 'agua', 'comida', 'festa', 'prova', 'texto', 'palavra', 'frase', 'bolo',
    'cachorro', 'gato', 'porta', 'janela', 'cidade', 'praia', 'campo', 'rio', 'mar', 'sol', 'lua'])

/**
 * Infinitivos frequentes. Serve de peneira: sem esta lista, "Maria" virava
 * verbo (por causa do -IA) e "gosto" ficava substantivo para sempre.
 */
const VERBOS_INF = new Set(['falar', 'andar', 'cantar', 'comprar', 'gostar', 'chegar', 'ficar',
    'olhar', 'achar', 'passar', 'deixar', 'começar', 'trabalhar', 'estudar', 'morar', 'jogar',
    'pensar', 'lembrar', 'esperar', 'contar', 'tomar', 'ajudar', 'levar', 'chamar', 'entrar',
    'acabar', 'mudar', 'tentar', 'pagar', 'usar', 'criar', 'buscar', 'guardar', 'mandar', 'parar',
    'precisar', 'mostrar', 'apoiar', 'melhorar', 'aumentar', 'garantir', 'ensinar', 'ligar',
    'brincar', 'conversar', 'explicar', 'marcar', 'organizar', 'realizar', 'causar', 'gerar',
    'provocar', 'tratar', 'cuidar', 'lavar', 'limpar', 'cozinhar', 'viajar', 'namorar', 'amar',
    'comer', 'beber', 'correr', 'vender', 'aprender', 'entender', 'escrever', 'ler', 'viver',
    'morrer', 'nascer', 'crescer', 'conhecer', 'esquecer', 'receber', 'resolver', 'responder',
    'acontecer', 'perder', 'vencer', 'defender', 'oferecer', 'merecer', 'sofrer', 'mexer',
    'bater', 'meter', 'prometer', 'escolher', 'proteger', 'devolver', 'dever', 'valer', 'caber',
    'partir', 'sair', 'abrir', 'cair', 'subir', 'sentir', 'dormir', 'servir', 'seguir', 'conseguir',
    'pedir', 'ouvir', 'dividir', 'decidir', 'permitir', 'existir', 'insistir', 'assistir',
    'discutir', 'construir', 'destruir', 'produzir', 'reduzir', 'conduzir', 'cumprir', 'imprimir',
    'garantir', 'preferir', 'sugerir', 'repetir', 'vestir', 'competir', 'agir', 'dirigir', 'fugir'])

/**
 * Candidatos a infinitivo de uma forma qualquer.
 * O corte em 4 letras não é enfeite: sem ele, o radical "m" de "Maria" gerava
 * o candidato "ir", que existe, e o nome virava verbo.
 */
function candidatosInfinitivo(n) {
    const sem = n.slice(0, -1)
    return [n + 'r', sem + 'ar', sem + 'er', sem + 'ir', n + 'ar', n + 'er', n + 'ir']
        .filter(c => c.length >= 4)
}

/** O infinitivo é conhecido, seja da lista comum, seja da tabela dos irregulares? */
function verboConhecido(inf) {
    const i = String(inf ?? '').toLowerCase()
    return VERBOS_INF.has(i) || Object.prototype.hasOwnProperty.call(IRREGULARES, i)
}

/** O radical desta forma pertence a um verbo conhecido? */
function radicalDeVerbo(n) {
    if (!n || n.length < 3) return false
    return candidatosInfinitivo(n).some(verboConhecido)
}

/** O texto parece uma forma verbal? Conservador de propósito. */
function pareceVerbo(palavra) {
    const p = String(palavra ?? '').toLowerCase()
    const n = normal(p)
    if (!n) return false
    if (FORMAS_VERBAIS.has(p)) return true
    if (NAO_VERBO.has(n)) return false
    if (/(ando|endo|indo)$/.test(n) && n.length > 5) return true
    if (/(ou|eu|iu)$/.test(n) && n.length > 3) return true
    if (/(aram|eram|iram|arao|erao|irao)$/.test(n)) return true
    if (/(ava|avam|avamos)$/.test(n) && n.length > 4) return true
    // -aria também é sufixo de substantivo (padaria, livraria, Maria): só aceito
    // quando o radical pertence a um verbo conhecido.
    if (/(ara|era|ira|aria|eria|iria|ariam|eriam|iriam)$/.test(n) && n.length > 4) {
        return radicalDeVerbo(n.replace(/(ariam|eriam|iriam|aria|eria|iria|ara|era|ira)$/, ''))
    }
    if (/(asse|esse|isse|assem|essem|issem)$/.test(n)) return true
    if (/(amos|emos|imos)$/.test(n) && n.length > 5) return true
    // Futuro: canta+rei, vende+rá, parti+ria. Confiro o infinitivo para não
    // engolir "Maria" (que termina em -ria) como forma verbal.
    const fut = p.match(/^(.+?)(rei|rás|rá|remos|reis|rão|ria|rias|ríamos|ríeis|riam)$/)
    if (fut && verboConhecido(fut[1] + 'r')) return true
    if (/i$/.test(n) && n.length > 3) return radicalDeVerbo(n)   // dormi, parti, sorri
    if (/(ia|iam|iamos)$/.test(n) && n.length > 3) return radicalDeVerbo(n.replace(/(iamos|iam|ia)$/, ''))
    if (/(ar|er|ir)$/.test(n) && n.length > 3) return true   // infinitivo
    return false
}

/**
 * Formas que só o vizinho denuncia: "gosto" é substantivo em "o gosto" e verbo
 * em "eu gosto". Só aceito quando vem pronome, negação ou advérbio antes.
 */
const GATILHOS_DE_VERBO = new Set(['eu', 'tu', 'ele', 'ela', 'nos', 'voce', 'voces', 'eles', 'elas',
    'nao', 'se', 'me', 'te', 'lhe', 'ja', 'sempre', 'nunca', 'tambem', 'quem', 'que', 'so', 'ainda'])

function pareceVerboNoContexto(palavra, anterior) {
    const n = normal(palavra)
    if (!n || !GATILHOS_DE_VERBO.has(normal(anterior))) return false
    if (SUBSTANTIVOS_COMUNS.has(n)) return false
    return radicalDeVerbo(n)
}

/** O texto parece adjetivo? */
function pareceAdjetivo(palavra) {
    const p = String(palavra ?? '').toLowerCase()
    if (ADJETIVOS_COMUNS.has(normal(p))) return true
    if (SUFIXOS_ADJETIVO.test(p) && p.length > 4) return true
    return false
}

/**
 * Classifica uma palavra dentro da frase. Leva o vizinho em conta: sem isso,
 * "a" seria sempre artigo e "que" seria sempre conjunção.
 */
function classificarPalavra(palavra, anterior = '', seguinte = '') {
    const p = String(palavra ?? '').toLowerCase()
    const n = normal(p)
    const seg = normal(seguinte)
    if (/^\d+$/.test(p)) return { classe: 'numeral', nota: 'número escrito em algarismo' }
    if (INTERJEICOES.has(n)) return { classe: 'interjeição', nota: 'expressa emoção, vem sozinha' }
    if (ARTIGOS.has(n) && (pareceVerbo(seguinte) === false || !seg)) {
        if (n === 'a' && pareceVerbo(seguinte)) return { classe: 'preposição', nota: 'antes de verbo, o A é preposição' }
        return { classe: 'artigo', nota: ['o', 'a', 'os', 'as'].includes(n) ? 'artigo definido' : 'artigo indefinido' }
    }
    if (NUMERAIS.has(n)) return { classe: 'numeral', nota: 'indica quantidade ou ordem' }
    if (PRONOMES.has(n)) return { classe: 'pronome', nota: 'substitui ou acompanha o substantivo' }
    if (ADVERBIOS.has(n) || /mente$/.test(p)) return { classe: 'advérbio', nota: 'modifica verbo, adjetivo ou outro advérbio' }
    if (CONJUNCOES.has(n)) return { classe: 'conjunção', nota: 'liga orações ou termos' }
    if (PREPOSICOES.has(n) || CONTRACOES.has(n)) return { classe: 'preposição', nota: 'liga duas palavras, uma pedindo a outra' }
    if (pareceVerboNoContexto(p, anterior)) return { classe: 'verbo', nota: 'aqui é verbo por causa da palavra que vem antes' }
    if (SUBSTANTIVOS_COMUNS.has(n)) return { classe: 'substantivo', nota: 'nomeia ser, coisa, lugar ou ideia' }
    if (pareceVerbo(p)) return { classe: 'verbo', nota: 'indica ação, estado ou fenômeno' }
    if (pareceAdjetivo(p)) return { classe: 'adjetivo', nota: 'caracteriza o substantivo' }
    return { classe: 'substantivo', nota: 'nomeia ser, coisa, lugar ou ideia' }
}

/** Classifica todas as palavras da frase. */
function classesDaFrase(frase) {
    const ps = palavrasDe(frase)
    return ps.map((p, i) => ({
        palavra: p,
        ...classificarPalavra(p, ps[i - 1] || '', ps[i + 1] || '')
    }))
}

// ── Índice reverso: forma conjugada volta ao infinitivo ────────────────────
const FORMA_PARA_INFINITIVO = new Map()
for (const [inf, tab] of Object.entries(IRREGULARES)) {
    for (const campo of ['presente', 'perfeito', 'imperfeito', 'maisQuePerfeito', 'futuroPresente',
        'futuroPreterito', 'subjPresente', 'subjImperfeito', 'subjFuturo']) {
        for (const f of (tab[campo] || [])) {
            if (!FORMA_PARA_INFINITIVO.has(f)) FORMA_PARA_INFINITIVO.set(f, inf)
        }
    }
}

/** Tenta descobrir o infinitivo de uma forma conjugada. */
function infinitivoDe(forma) {
    const f = String(forma ?? '').toLowerCase()
    if (!f) return null
    if (FORMA_PARA_INFINITIVO.has(f)) return FORMA_PARA_INFINITIVO.get(f)
    if (/(ar|er|ir)$/.test(f)) return f
    const n = f
    const regras = [
        [/aram$/, 'ar'], [/eram$/, 'er'], [/iram$/, 'ir'],
        [/ou$/, 'ar'], [/eu$/, 'er'], [/iu$/, 'ir'],
        [/ava(m|)$/, 'ar'], [/ará$/, 'ar'], [/erá$/, 'er'], [/irá$/, 'ir'],
        [/ando$/, 'ar'], [/endo$/, 'er'], [/indo$/, 'ir'],
        [/ado(s|)$/, 'ar'], [/ido(s|)$/, 'ir'],
        [/aria$/, 'ar'], [/eria$/, 'er'], [/iria$/, 'ir'],
        [/asse$/, 'ar'], [/esse$/, 'er'], [/isse$/, 'ir'],
        [/amos$/, 'ar'], [/emos$/, 'er'], [/imos$/, 'ir'],
        [/am$/, 'ar'], [/em$/, 'er']
    ]
    for (const [re, term] of regras) {
        if (re.test(n)) return n.replace(re, '') + term
    }
    if (/a$/.test(n)) return n.slice(0, -1) + 'ar'
    if (/e$/.test(n)) return n.slice(0, -1) + 'er'
    return null
}

// ═══════════════════════════════════════════════════════════════════════════
// SINTAXE: sujeito, predicado, termos, vozes, período
// ═══════════════════════════════════════════════════════════════════════════

const VERBOS_IMPESSOAIS = ['haver', 'fazer', 'chover', 'nevar', 'trovejar', 'amanhecer', 'anoitecer']

/**
 * Análise sintática de frase simples. É uma leitura, não um laudo: onde a
 * frase admitir outra análise, a resposta diz isso.
 */
function analiseSintatica(frase) {
    const tokens = classesDaFrase(frase)
    if (!tokens.length) return null
    const iVerbo = tokens.findIndex(t => t.classe === 'verbo')
    if (iVerbo < 0) {
        return { tokens, erro: 'semVerbo', aviso: 'Não achei verbo nessa frase. Sem verbo não há oração: pode ser uma frase nominal, como "Que dia lindo!".' }
    }
    const verbo = tokens[iVerbo].palavra
    const inf = infinitivoDe(verbo)
    const antes = tokens.slice(0, iVerbo)
    const depois = tokens.slice(iVerbo + 1)

    const impessoal = VERBOS_IMPESSOAIS.includes(inf) && antes.length === 0
    let sujeito, tipoSujeito
    if (impessoal) {
        sujeito = '(não tem)'
        tipoSujeito = 'oração sem sujeito: o verbo é impessoal e fica sempre na 3ª pessoa do singular'
    } else if (!antes.length) {
        sujeito = '(está subentendido)'
        tipoSujeito = 'sujeito oculto (ou desinencial): a terminação do verbo já diz quem é'
    } else {
        // Advérbio e negação não fazem parte do sujeito: "Eu não gosto" tem
        // sujeito "eu", e o "não" é adjunto adverbial dentro do predicado.
        const semAdv = antes.filter(t => t.classe !== 'advérbio')
        sujeito = (semAdv.length ? semAdv : antes).map(t => t.palavra).join(' ')
        const nucleos = semAdv.filter(t => t.classe === 'substantivo' || t.classe === 'pronome')
        const plural = /s$/.test(nucleos.length ? nucleos[nucleos.length - 1].palavra : '') || semAdv.some(t => normal(t.palavra) === 'e')
        tipoSujeito = nucleos.length > 1 && semAdv.some(t => normal(t.palavra) === 'e')
            ? 'sujeito composto: tem mais de um núcleo'
            : 'sujeito simples: um núcleo só' + (plural ? ', no plural' : '')
    }
    const nucleoSujeito = (antes.filter(t => t.classe === 'substantivo' || t.classe === 'pronome').slice(-1)[0] || {}).palavra || '—'

    const ligacao = VERBOS_LIGACAO.has(inf) || FORMAS_LIGACAO.has(verbo.toLowerCase())
    const predicado = tokens.slice(iVerbo).map(t => t.palavra).join(' ')
    const complemento = depois.map(t => t.palavra).join(' ')
    const preposicionado = depois.length && (depois[0].classe === 'preposição')

    const semAdverbios = depois.filter(t => t.classe !== 'advérbio')
    const objeto = semAdverbios.map(t => t.palavra).join(' ')
    const termos = []
    if (ligacao) {
        termos.push('*Predicativo do sujeito:* ' + (complemento || '—') + ' — é o que se diz do sujeito')
    } else if (objeto) {
        if (preposicionado) termos.push('*Objeto indireto:* ' + objeto + ' — vem preso a uma preposição')
        else termos.push('*Objeto direto:* ' + objeto + ' — completa o verbo sem preposição')
    }
    const adverbios = depois.filter(t => t.classe === 'advérbio').map(t => t.palavra)
    if (adverbios.length) termos.push('*Adjunto adverbial:* ' + adverbios.join(', ') + ' — diz quando, onde, como ou por quê')

    return {
        tokens, verbo, infinitivo: inf, sujeito, tipoSujeito, nucleoSujeito, objeto, impessoal,
        predicado,
        tipoPredicado: ligacao ? 'predicado nominal: o verbo é de ligação e o peso está no predicativo'
            : 'predicado verbal: o peso da informação está no próprio verbo',
        termos,
        aviso: 'Esta é a leitura mais provável da frase. Frase com inversão ou com oração encaixada pode pedir outra análise.'
    }
}

/** Período simples ou composto, com a conta das orações. */
function analisarPeriodo(frase) {
    const tokens = classesDaFrase(frase)
    const verbos = tokens.filter(t => t.classe === 'verbo').map(t => t.palavra)
    const conectivos = tokens.filter(t => t.classe === 'conjunção').map(t => t.palavra)
    const n = verbos.length
    let tipo
    if (n <= 1) tipo = 'período simples: uma oração só, chamada de oração absoluta'
    else tipo = 'período composto: ' + n + ' orações, uma para cada verbo'
    const subordinativas = ['que', 'porque', 'se', 'quando', 'embora', 'como', 'conforme', 'enquanto', 'caso', 'para que']
    const temSubordinada = conectivos.some(c => subordinativas.includes(normal(c)))
    const coordenativas = ['e', 'mas', 'ou', 'nem', 'porém', 'portanto', 'logo', 'contudo', 'todavia', 'entretanto', 'pois']
    const temCoordenada = conectivos.some(c => coordenativas.includes(normal(c)))
    const notas = []
    if (n > 1 && temSubordinada) notas.push('Tem conectivo subordinativo: uma oração é termo da outra, ela não vive sozinha.')
    if (n > 1 && temCoordenada) notas.push('Tem conectivo coordenativo: as orações são independentes, cada uma tem sentido completo.')
    if (n > 1 && !conectivos.length) notas.push('Sem conectivo à vista: se as orações estão separadas só por vírgula, são assindéticas.')
    return { tipo, verbos, conectivos, notas, quantidade: n }
}

/** Faz o particípio concordar com o novo sujeito: corrigido, corrigidas. */
function concordarParticipio(participio, sujeito) {
    const base = String(participio ?? '')
    if (!/o$/.test(base)) return base
    const ps = palavrasDe(sujeito)
    const artigo = normal(ps[0] || '')
    const nucleo = normal(ps[ps.length - 1] || '')
    const feminino = ['a', 'as', 'uma', 'umas'].includes(artigo) || /a$/.test(nucleo)
    const plural = ['as', 'os', 'umas', 'uns'].includes(artigo) || /s$/.test(nucleo)
    let fim = feminino ? 'a' : 'o'
    if (plural) fim += 's'
    return base.slice(0, -1) + fim
}

/** por + o = pelo. Sem isto a passiva sai "por o menino". */
function contrairPor(sujeito) {
    const s = String(sujeito ?? '').trim()
    const ps = s.split(/\s+/)
    const primeira = normal(ps[0] || '')
    const resto = ps.slice(1).join(' ')
    const mapa = { o: 'pelo', a: 'pela', os: 'pelos', as: 'pelas' }
    if (mapa[primeira] && resto) return mapa[primeira] + ' ' + resto
    // Nome próprio continua com maiúscula: "por Maria", não "por maria".
    const comum = PRONOMES.has(primeira) || SUBSTANTIVOS_COMUNS.has(primeira)
    return 'por ' + (comum ? s.charAt(0).toLowerCase() + s.slice(1) : s)
}

/** Passa a frase da voz ativa para a passiva. */
function paraVozPassiva(frase) {
    const a = analiseSintatica(frase)
    if (!a || a.erro) return { erro: 'semVerbo' }
    const inf = a.infinitivo
    if (!inf) return { erro: 'semVerbo' }
    if (VERBOS_LIGACAO.has(inf)) {
        return { erro: 'ligacao', explicacao: 'Verbo de ligação não tem voz passiva: só verbo transitivo direto passa para a passiva.' }
    }
    if (a.impessoal) {
        return { erro: 'impessoal', explicacao: 'Verbo impessoal não tem sujeito nem objeto direto, então não existe passiva para ele.' }
    }
    const objeto = String(a.objeto || '').trim()
    if (!objeto) return { erro: 'semObjeto', explicacao: 'Sem objeto direto não dá para virar a frase: só verbo transitivo direto vira passiva.' }
    const c = conjugar(inf)
    const participioCru = c && !c.erro ? String(c.participio).split(' ')[0] : null
    if (!participioCru) return { erro: 'semParticipio' }
    const participio = concordarParticipio(participioCru, objeto)
    const forma = normal(a.verbo)
    const ps = palavrasDe(objeto)
    const plural = ['os', 'as', 'uns', 'umas'].includes(normal(ps[0] || '')) || /s$/.test(normal(ps[ps.length - 1] || ''))
    let ser
    if (/(ra|rao)$/.test(forma) && /(rá|rão)$/.test(a.verbo)) ser = plural ? 'serão' : 'será'
    else if (/(ava|avam|ia|iam)$/.test(forma)) ser = plural ? 'era' : 'era'
    else if (/(ou|eu|iu)$/.test(forma) || ['foi', 'fez', 'disse', 'trouxe', 'pos', 'deu', 'viu', 'teve', 'veio'].includes(forma)) ser = plural ? 'foram' : 'foi'
    else ser = plural ? 'são' : 'é'
    if (/(ava|avam|ia|iam)$/.test(forma)) ser = plural ? 'eram' : 'era'
    const agente = a.sujeito.startsWith('(') ? '' : ' ' + contrairPor(a.sujeito)
    return {
        ativa: String(frase).trim().replace(/[.!?]+$/, '') + '.',
        passiva: maiuscula(objeto) + ' ' + ser + ' ' + participio + agente + '.',
        sujeitoNovo: objeto,
        agente: a.sujeito,
        explicacao: 'Na passiva quem sofria a ação vira sujeito, o verbo ganha o auxiliar SER mais o particípio e o antigo sujeito vira agente da passiva, preso ao "por".'
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// OCORRÊNCIAS: achar uma forma na frase com o vizinho de cada lado
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Acha cada ocorrência das formas na frase, com a palavra de antes e a de
 * depois. Usa BORDA_ESQ/BORDA_DIR: com \b, "à" no começo da frase não casava.
 */
function ocorrenciasDe(frase, formas) {
    const texto = String(frase ?? '')
    const achados = []
    for (const forma of formas) {
        const re = regexPalavra(forma, 'giu')
        let m
        while ((m = re.exec(texto)) !== null) {
            const ini = m.index
            const fim = ini + m[0].length
            const antes = (texto.slice(0, ini).match(/([\p{L}\p{N}]+)[^\p{L}\p{N}]*$/u) || [])[1] || ''
            const sobra = texto.slice(fim)
            const depois = (sobra.match(/^[^\p{L}\p{N}]*([\p{L}\p{N}]+)/u) || [])[1] || ''
            achados.push({
                forma: m[0], chave: normal(forma), indice: ini, antes, depois,
                pontuacao: /^\s*[.,;:!?…]/.test(sobra) || sobra.trim() === '',
                comecoDeFrase: !/[\p{L}\p{N}]/u.test(texto.slice(0, ini)) || /[.!?]\s*$/.test(texto.slice(0, ini)),
                interrogativa: /\?/.test(texto)
            })
            if (re.lastIndex === m.index) re.lastIndex++
        }
    }
    return achados.sort((a, b) => a.indice - b.indice)
}

// ═══════════════════════════════════════════════════════════════════════════
// CRASE
// ═══════════════════════════════════════════════════════════════════════════

const LOCUCOES_CRASE = ['às vezes', 'à noite', 'à tarde', 'à toa', 'à vontade', 'à direita',
    'à esquerda', 'à mão', 'à risca', 'à venda', 'à vista', 'às pressas', 'às escondidas',
    'à beça', 'à frente', 'à distância', 'à medida que', 'à proporção que', 'à procura de',
    'à espera de', 'à moda de', 'às claras', 'à força', 'à revelia', 'à disposição', 'às ocultas',
    'à custa de', 'à beira de', 'à luz de', 'às ordens', 'à vera', 'à queima-roupa']
const PALAVRAS_SEM_CRASE = ['ela', 'você', 'voce', 'vocês', 'voces', 'esta', 'essa', 'estas', 'essas',
    'quem', 'cuja', 'cujas', 'alguma', 'nenhuma', 'qualquer', 'mim', 'ti', 'si', 'ninguém', 'ninguem',
    'casa', 'terra', 'sua', 'minha', 'nossa', 'vossa', 'dona', 'madame', 'senhorita']
const FEMININOS_COMUNS = new Set(['escola', 'igreja', 'praia', 'cidade', 'festa', 'feira', 'aula',
    'reunião', 'reuniao', 'faculdade', 'padaria', 'farmácia', 'farmacia', 'praça', 'praca', 'rua',
    'avenida', 'porta', 'janela', 'mesa', 'cozinha', 'sala', 'biblioteca', 'secretaria', 'diretoria',
    'delegacia', 'prefeitura', 'universidade', 'lanchonete', 'quadra', 'piscina', 'academia',
    'professora', 'diretora', 'menina', 'mulher', 'mãe', 'mae', 'avó', 'avo', 'tia', 'namorada',
    'vida', 'morte', 'verdade', 'justiça', 'justica', 'paz', 'guerra', 'natureza', 'música', 'musica'])

/**
 * Explica a crase de cada A/AS/À/ÀS da frase.
 * A regra de ouro fica na resposta: crase é a soma da preposição A com o
 * artigo A. Se não houver os dois, não há crase.
 */
function analisarCrase(frase) {
    const texto = String(frase ?? '').trim()
    const baixo = ' ' + normal(texto) + ' '
    const casos = []
    // Trechos já explicados como locução: o A dentro deles não é analisado de
    // novo, senão "às vezes" apareceria duas vezes com vereditos diferentes.
    const cobertos = []

    for (const loc of LOCUCOES_CRASE) {
        const re = new RegExp(BORDA_ESQ + escapar(normal(loc)).replace(/ /g, '\\s+') + BORDA_DIR, 'giu')
        let m
        const alvo = tirarAcento(texto).toLowerCase()
        while ((m = re.exec(alvo)) !== null) {
            cobertos.push([m.index, m.index + m[0].length])
            casos.push({
                trecho: loc, veredito: 'tem crase',
                porque: 'É locução adverbial feminina. Locução feminina de tempo, modo ou lugar leva crase sempre: ' + loc + '.'
            })
            if (re.lastIndex === m.index) re.lastIndex++
        }
    }

    const ocs = ocorrenciasDe(texto, ['a', 'as', 'à', 'às', 'aquela', 'aquelas', 'aquele', 'aquilo', 'àquela', 'àquele', 'àquilo'])
    for (const oc of ocs) {
        if (cobertos.some(([ini, fim]) => oc.indice >= ini && oc.indice < fim)) continue
        const d = normal(oc.depois)
        const forma = oc.forma.toLowerCase()
        const jaTemCrase = /[àÀ]/.test(oc.forma)
        const trecho = oc.forma + (oc.depois ? ' ' + oc.depois : '')
        if (/^aquel|^aquilo/.test(normal(forma))) {
            casos.push({
                trecho,
                veredito: jaTemCrase ? 'tem crase' : 'depende do verbo',
                porque: 'Com AQUELE, AQUELA e AQUILO a crase aparece quando o verbo ou o nome antes pede a preposição A: "Refiro-me àquele caso", mas "Vi aquele caso".'
            })
            continue
        }
        if (!oc.depois) continue
        if (pareceVerbo(oc.depois) && /(ar|er|ir)$/.test(d)) {
            casos.push({ trecho, veredito: 'não tem crase', porque: 'Antes de verbo nunca tem crase: verbo não aceita artigo. "Começou a estudar".' })
            continue
        }
        if (PALAVRAS_SEM_CRASE.includes(d)) {
            casos.push({
                trecho, veredito: 'não tem crase',
                porque: d === 'casa' || d === 'terra'
                    ? 'Diante de CASA (a sua) e TERRA (firme) não há artigo, então não há crase. Se vier especificação, volta: "à casa de meus pais".'
                    : 'Diante de pronome como ' + oc.depois + ' não cabe artigo, e sem artigo não há crase.'
            })
            continue
        }
        if (/^\d+$/.test(oc.depois) || /^(uma|duas|três|tres|quatro|cinco|seis|sete|oito|nove|dez|onze|doze)$/.test(d)) {
            const hora = /hora/.test(baixo)
            casos.push({
                trecho, veredito: hora || /^(as|às)$/.test(normal(forma)) ? 'tem crase' : 'não tem crase',
                porque: hora ? 'Em hora certa a crase aparece: "Chego às 8 horas", porque está subentendido "à hora".'
                    : 'Antes de número comum não há crase, a não ser em hora certa: "às 8h".'
            })
            continue
        }
        if (/^[A-ZÁÉÍÓÚÂÊÔÃÕ]/.test(oc.depois)) {
            casos.push({
                trecho, veredito: 'depende do nome',
                porque: 'Nome de lugar pede teste: diga "volto DA ' + oc.depois + '" ou "volto DE ' + oc.depois + '". ' +
                    'Se for DA, tem crase (vou à Bahia); se for DE, não tem (vou a Portugal).'
            })
            continue
        }
        const feminino = FEMININOS_COMUNS.has(d) || (/a$/.test(d) && !PALAVRAS_SEM_CRASE.includes(d))
        if (feminino) {
            const plural = /^(as|às)$/.test(normal(forma))
            casos.push({
                trecho,
                veredito: 'tem crase',
                porque: 'Palavra feminina que aceita artigo. Faça o teste: troque por uma palavra masculina. Se aparecer AO, ' +
                    'tem crase — "Vou à escola" vira "Vou ao colégio".' + (plural ? ' No plural, ÀS.' : '')
            })
            continue
        }
        casos.push({
            trecho, veredito: 'não tem crase',
            porque: 'A palavra seguinte parece masculina. Diante de palavra masculina não há crase, salvo em "à moda de": "Bife à moda da casa".'
        })
    }
    return { frase: texto, casos }
}

// ═══════════════════════════════════════════════════════════════════════════
// PORQUÊ: as quatro formas
// ═══════════════════════════════════════════════════════════════════════════

const DETERMINANTES = ['o', 'um', 'seu', 'esse', 'este', 'aquele', 'do', 'no', 'meu', 'nosso', 'todo', 'qual']

/** Analisa cada por que / porque / por quê / porquê da frase. */
function analisarPorque(frase) {
    const texto = String(frase ?? '').trim()
    const casos = []
    const re = /(por\s+qu[eê]|porqu[eê])/giu
    let m
    while ((m = re.exec(texto)) !== null) {
        const bruto = m[0]
        const forma = normal(bruto).replace(/\s+/g, ' ')
        const sobra = texto.slice(m.index + bruto.length)
        const antes = (texto.slice(0, m.index).match(/([\p{L}\p{N}]+)[^\p{L}\p{N}]*$/u) || [])[1] || ''
        const fimDeFrase = /^\s*[.?!]/.test(sobra) || sobra.trim() === ''
        const temInterrogacao = /\?/.test(texto)
        const comAcento = /ê/i.test(bruto)
        const separado = /\s/.test(bruto)
        let certo, deveriaSer, porque

        if (separado && comAcento) {          // por quê
            certo = fimDeFrase
            deveriaSer = 'por que'
            porque = certo
                ? 'POR QUÊ separado e com acento é o certo no fim da frase ou antes de ponto: "Você saiu por quê?".'
                : 'POR QUÊ só vale no fim da frase ou antes de pontuação. No meio, escreva POR QUE separado e sem acento.'
        } else if (separado) {                // por que
            certo = !fimDeFrase
            deveriaSer = 'por quê'
            porque = certo
                ? (temInterrogacao
                    ? 'POR QUE separado e sem acento é o certo em pergunta: equivale a "por qual motivo".'
                    : 'POR QUE separado e sem acento também vale fora de pergunta, quando equivale a "pelo qual": "Este é o caminho por que passei".')
                : 'No fim da frase o QUE fica tônico e ganha acento: escreva POR QUÊ.'
        } else if (comAcento) {               // porquê
            certo = DETERMINANTES.includes(normal(antes))
            deveriaSer = temInterrogacao ? 'por que' : 'porque'
            porque = certo
                ? 'PORQUÊ junto e com acento é substantivo: vem depois de artigo e pode ir para o plural — "o porquê", "os porquês".'
                : 'PORQUÊ junto e com acento só existe como substantivo, precedido de artigo ("o porquê da briga"). Aqui não é o caso.'
        } else {                              // porque
            certo = !temInterrogacao || !fimDeFrase
            deveriaSer = 'por que'
            porque = certo
                ? 'PORQUE junto e sem acento é conjunção de causa ou explicação: troque por POIS e a frase continua de pé.'
                : 'Em pergunta use POR QUE separado. PORQUE junto serve para responder, não para perguntar.'
        }
        casos.push({ trecho: bruto, certo, deveriaSer, porque })
    }
    return { frase: texto, casos }
}

// ═══════════════════════════════════════════════════════════════════════════
// PARES QUE CONFUNDEM
// ═══════════════════════════════════════════════════════════════════════════

const VERBOS_MOVIMENTO = ['ir', 'chegar', 'levar', 'vir', 'voltar', 'retornar', 'dirigir', 'recorrer', 'comparecer']
const VERBOS_ESTATICOS = ['estar', 'ser', 'ficar', 'morar', 'residir', 'haver', 'permanecer', 'trabalhar', 'nascer']

/**
 * Tabela dos pares que mais derrubam gente. Cada um sabe se explicar e sabe
 * julgar a frase que a pessoa mandar.
 */
const PARES = {
    maumal: {
        titulo: 'Mau ou mal', emoji: '⚖️',
        formas: ['mau', 'maus', 'mal', 'males'],
        resumo: 'MAU é o contrário de BOM. MAL é o contrário de BEM.',
        ficha: [
            '*mau* — adjetivo, acompanha substantivo: um mau exemplo, mau humor.',
            '*mal* — advérbio, acompanha verbo: ele dirige mal, dormi mal.',
            '*mal* — também é substantivo com artigo: o mal venceu, os males do mundo.',
            '*Teste:* troque por BOM. Se couber, é MAU. Se couber BEM, é MAL.'
        ],
        julgar: (oc) => {
            const ehMau = normal(oc.forma).startsWith('mau') || normal(oc.forma) === 'maus'
            const antesVerbo = pareceVerbo(oc.antes)
            const depoisVerbo = pareceVerbo(oc.depois)
            const antesArtigo = ARTIGOS.has(normal(oc.antes))
            if (ehMau) {
                if (antesVerbo && !oc.depois) return { ok: false, porque: 'Depois de verbo, o certo costuma ser MAL (advérbio): "Ele dorme mal".' }
                return { ok: true, porque: 'MAU está acompanhando um substantivo, como adjetivo. Troque por BOM e confira: "um bom exemplo".' }
            }
            if (antesArtigo) return { ok: true, porque: 'Com artigo na frente, MAL é substantivo: "o mal", "os males".' }
            if (depoisVerbo || antesVerbo) return { ok: true, porque: 'MAL está ligado a um verbo, como advérbio. Troque por BEM e confira.' }
            return { ok: null, porque: 'Confira pelo teste: se cabe BOM, escreva MAU; se cabe BEM, escreva MAL.' }
        }
    },
    masmais: {
        titulo: 'Mas ou mais', emoji: '🔀',
        formas: ['mas', 'mais'],
        resumo: 'MAS é oposição (troque por PORÉM). MAIS é quantidade (o contrário de MENOS).',
        ficha: [
            '*mas* — conjunção de oposição: estudei, mas não passei.',
            '*mais* — advérbio de quantidade: quero mais tempo.',
            '*Teste:* se couber PORÉM, é MAS. Se couber MENOS, é MAIS.'
        ],
        julgar: (oc) => {
            const ehMas = normal(oc.forma) === 'mas'
            if (ehMas) {
                if (/^(de|do|da|que|ou)$/.test(normal(oc.depois))) return { ok: false, porque: 'Aqui parece quantidade ("mais de", "mais que"): escreva MAIS com I.' }
                return { ok: true, porque: 'MAS ligando ideias opostas. Troque por PORÉM e a frase continua de pé.' }
            }
            return { ok: true, porque: 'MAIS indicando quantidade ou intensidade. O contrário dele é MENOS.' }
        }
    },
    haa: {
        titulo: 'Há ou a', emoji: '⏳',
        formas: ['há', 'a'],
        resumo: 'HÁ é tempo que já passou (troque por FAZ). A é tempo que ainda vem ou distância.',
        ficha: [
            '*há* — verbo haver, tempo passado: há dois anos não o vejo (faz dois anos).',
            '*a* — preposição, tempo futuro ou distância: daqui a dois anos; a dez metros.',
            '*Nunca* escreva "há dois anos atrás": HÁ já diz que passou, ATRÁS repete.'
        ],
        julgar: (oc, frase) => {
            const ehHa = /há/i.test(oc.forma)
            const temAtras = /atr[áa]s/i.test(String(frase))
            if (ehHa && temAtras) return { ok: false, porque: 'HÁ + ATRÁS é pleonasmo: escolha um dos dois. "Há dois anos" ou "dois anos atrás".' }
            if (ehHa) return { ok: true, porque: 'HÁ no sentido de tempo passado. Troque por FAZ: "faz dois anos".' }
            return { ok: null, porque: 'Se o tempo ainda vai acontecer, o A sem acento está certo: "daqui a duas horas".' }
        }
    },
    ondeaonde: {
        titulo: 'Onde ou aonde', emoji: '🧭',
        formas: ['onde', 'aonde'],
        resumo: 'ONDE é lugar parado. AONDE é lugar para onde se vai (tem movimento).',
        ficha: [
            '*onde* — com verbo de permanência: onde você mora? onde fica a escola?',
            '*aonde* — com verbo de movimento que pede A: aonde você vai? aonde chegamos?',
            '*Teste:* se a resposta começa com A ou PARA, use AONDE.'
        ],
        julgar: (oc, frase) => {
            const ehAonde = normal(oc.forma) === 'aonde'
            // Aqui a peneira de verbo é mais larga de propósito: "mora" e "vai"
            // não passam em pareceVerbo sozinhas, mas o infinitivo delas está
            // nas duas listas que interessam.
            const verbos = palavrasDe(frase).map(v => infinitivoDe(v)).filter(Boolean)
            const temMovimento = verbos.some(v => VERBOS_MOVIMENTO.includes(v))
            const temEstatico = verbos.some(v => VERBOS_ESTATICOS.includes(v))
            if (ehAonde && temEstatico && !temMovimento) return { ok: false, porque: 'O verbo aqui é de permanência: o certo é ONDE, sem o A.' }
            if (!ehAonde && temMovimento && !temEstatico) return { ok: false, porque: 'O verbo aqui é de movimento e pede a preposição A: escreva AONDE.' }
            if (ehAonde && temMovimento) return { ok: true, porque: 'AONDE com verbo de movimento está certo.' }
            if (!ehAonde && temEstatico) return { ok: true, porque: 'ONDE com verbo de permanência está certo.' }
            return { ok: null, porque: 'Não identifiquei o verbo com segurança. Olhe a resposta: se ela começa com A ou PARA, use AONDE; se for lugar parado, use ONDE.' }
        }
    },
    senaose: {
        titulo: 'Senão ou se não', emoji: '🔗',
        formas: ['senão', 'senao', 'se não', 'se nao'],
        resumo: 'SENÃO junto significa "caso contrário" ou "a não ser". SE NÃO separado é condição negativa.',
        ficha: [
            '*senão* — caso contrário: corra, senão perderá a hora.',
            '*senão* — a não ser: não fazia nada senão reclamar.',
            '*se não* — condição negativa, troque por CASO NÃO: se não chover, vamos.',
            '*Teste:* se couber CASO NÃO, escreva separado.'
        ],
        julgar: (oc) => {
            const junto = !/\s/.test(oc.forma)
            return junto
                ? { ok: null, porque: 'SENÃO junto vale para "caso contrário" e "a não ser". Se a ideia for condição, separe: SE NÃO.' }
                : { ok: null, porque: 'SE NÃO separado vale quando cabe CASO NÃO. Se a ideia for "caso contrário", junte: SENÃO.' }
        }
    },
    afimfim: {
        titulo: 'A fim ou afim', emoji: '🎯',
        formas: ['afim', 'afins', 'a fim'],
        resumo: 'A FIM DE é finalidade. AFIM é semelhante, parecido.',
        ficha: [
            '*a fim de* — para, com o objetivo de: estudo a fim de passar.',
            '*afim* — semelhante: são áreas afins; almas afins.',
            '*Teste:* se couber PARA, escreva separado.'
        ],
        julgar: (oc) => {
            const junto = !/\s/.test(oc.forma)
            if (junto && normal(oc.depois) === 'de') return { ok: false, porque: 'Com sentido de finalidade escreve-se separado: A FIM DE.' }
            return { ok: true, porque: junto ? 'AFIM junto significa semelhante, parecido.' : 'A FIM DE separado indica finalidade.' }
        }
    },
    demais: {
        titulo: 'Demais ou de mais', emoji: '➕',
        formas: ['demais', 'de mais'],
        resumo: 'DEMAIS é advérbio (muito) ou "os outros". DE MAIS é o contrário de DE MENOS.',
        ficha: [
            '*demais* — advérbio: você fala demais.',
            '*demais* — os outros: os demais alunos chegaram.',
            '*de mais* — contrário de DE MENOS: não vi nada de mais nisso.',
            '*Teste:* se couber DE MENOS, escreva separado.'
        ],
        julgar: (oc) => ({
            ok: null,
            porque: /\s/.test(oc.forma)
                ? 'DE MAIS separado só quando cabe DE MENOS no lugar.'
                : 'DEMAIS junto vale para "muito" e para "os outros".'
        })
    },
    acercade: {
        titulo: 'Acerca de, a cerca de, há cerca de', emoji: '📏',
        formas: ['acerca', 'cerca'],
        resumo: 'São três coisas diferentes: assunto, aproximação e tempo passado.',
        ficha: [
            '*acerca de* — sobre, a respeito de: falamos acerca do projeto.',
            '*a cerca de* — aproximadamente (distância ou quantidade): fica a cerca de 10 km.',
            '*há cerca de* — tempo que já passou: há cerca de dois anos.',
            '*Teste:* cabe SOBRE? junto. Cabe APROXIMADAMENTE? a cerca de. Cabe FAZ? há cerca de.'
        ],
        julgar: () => ({ ok: null, porque: 'Escolha pelo sentido: assunto (acerca de), aproximação (a cerca de) ou tempo passado (há cerca de).' })
    },
    emvez: {
        titulo: 'Em vez de ou ao invés de', emoji: '🔁',
        formas: ['vez', 'invés', 'inves'],
        resumo: 'EM VEZ DE é "no lugar de". AO INVÉS DE é "ao contrário de", só para opostos.',
        ficha: [
            '*em vez de* — no lugar de: em vez de café, tomei chá.',
            '*ao invés de* — ao contrário de: ao invés de subir, desceu.',
            '*Dica:* EM VEZ DE serve sempre; AO INVÉS DE só quando há oposição de verdade.'
        ],
        julgar: () => ({ ok: null, porque: 'Se as duas coisas não forem opostas, prefira EM VEZ DE: ele cabe em qualquer troca.' })
    },
    aopar: {
        titulo: 'A par ou ao par', emoji: '📰',
        formas: ['par'],
        resumo: 'A PAR é estar informado. AO PAR é câmbio equivalente.',
        ficha: [
            '*a par* — informado, ciente: estou a par do assunto.',
            '*ao par* — de valor equivalente (moeda): o dólar estava ao par do euro.',
            '*Na dúvida:* se o assunto é informação, é A PAR.'
        ],
        julgar: () => ({ ok: null, porque: 'Se a ideia é saber de alguma coisa, escreva A PAR. AO PAR é termo de câmbio.' })
    },
    tampouco: {
        titulo: 'Tampouco ou tão pouco', emoji: '🔇',
        formas: ['tampouco', 'tão pouco', 'tao pouco'],
        resumo: 'TAMPOUCO é "também não". TÃO POUCO é quantidade muito pequena.',
        ficha: [
            '*tampouco* — também não: não estudou, tampouco leu.',
            '*tão pouco* — quantidade mínima: dormi tão pouco que estou zonzo.',
            '*Teste:* se couber TAMBÉM NÃO, é junto.'
        ],
        julgar: (oc) => ({
            ok: null,
            porque: /\s/.test(oc.forma) ? 'TÃO POUCO separado é quantidade: cabe MUITO POUCO no lugar.' : 'TAMPOUCO junto é "também não".'
        })
    },
    esteesse: {
        titulo: 'Este, esse e aquele', emoji: '👉',
        formas: ['este', 'esta', 'esse', 'essa', 'aquele', 'aquela', 'isto', 'isso', 'aquilo'],
        resumo: 'ESTE é perto de quem fala; ESSE é perto de quem ouve; AQUELE é longe dos dois.',
        ficha: [
            '*este/isto* — o que está comigo ou o que vou dizer: este livro aqui; diga isto.',
            '*esse/isso* — o que está com você ou o que já foi dito: esse livro aí; isso que você falou.',
            '*aquele/aquilo* — longe dos dois ou tempo remoto: aquele dia; aquilo que fizeram.',
            '*No texto:* ESTE anuncia o que vem; ESSE retoma o que veio.'
        ],
        julgar: (oc) => {
            const n = normal(oc.forma)
            if (n.startsWith('est') || n === 'isto') return { ok: null, porque: 'ESTE/ISTO aponta para o que está perto de quem fala ou para o que ainda vai ser dito.' }
            if (n.startsWith('ess') || n === 'isso') return { ok: null, porque: 'ESSE/ISSO aponta para o que está perto de quem ouve ou retoma o que já foi dito.' }
            return { ok: null, porque: 'AQUELE/AQUILO aponta para o que está longe dos dois, no espaço ou no tempo.' }
        }
    },
    mimeu: {
        titulo: 'Para mim ou para eu', emoji: '🙋',
        formas: ['mim', 'eu'],
        resumo: 'MIM não faz nada: se vier verbo depois, o certo é EU.',
        ficha: [
            '*para mim* — quando não há verbo depois: este bolo é para mim.',
            '*para eu* — quando vem verbo no infinitivo: este bolo é para eu comer.',
            '*Errado:* "para mim fazer". MIM não conjuga verbo, ele não é sujeito.'
        ],
        julgar: (oc) => {
            const n = normal(oc.forma)
            const depoisVerbo = pareceVerbo(oc.depois) && /(ar|er|ir)$/.test(normal(oc.depois))
            if (n === 'mim' && depoisVerbo) return { ok: false, porque: 'Tem verbo logo depois: troque por EU. "Para eu ' + oc.depois + '".' }
            if (n === 'eu' && !depoisVerbo && normal(oc.antes) === 'para') return { ok: false, porque: 'Sem verbo depois, o certo é MIM: "para mim".' }
            return { ok: true, porque: n === 'mim' ? 'MIM sem verbo depois está certo.' : 'EU com verbo depois está certo: ele é o sujeito do infinitivo.' }
        }
    },
    encontro: {
        titulo: 'Ao encontro de ou de encontro a', emoji: '🤝',
        formas: ['encontro'],
        resumo: 'AO ENCONTRO DE é a favor. DE ENCONTRO A é contra.',
        ficha: [
            '*ao encontro de* — concordar, favorecer: a proposta veio ao encontro do que queríamos.',
            '*de encontro a* — chocar-se, contrariar: o carro foi de encontro ao muro.',
            '*Memorize:* de encontro a = colisão.'
        ],
        julgar: () => ({ ok: null, porque: 'A favor: AO ENCONTRO DE. Contra: DE ENCONTRO A.' })
    },
    meiomeia: {
        titulo: 'Meio ou meia', emoji: '½',
        formas: ['meio', 'meia'],
        resumo: 'MEIO advérbio não muda. MEIA numeral concorda.',
        ficha: [
            '*meio* — advérbio, invariável: ela está meio cansada (um pouco cansada).',
            '*meia* — numeral, concorda: meia hora, meia dúzia.',
            '*Cuidado:* "meio-dia e meia" — a meia se refere à hora, não ao dia.'
        ],
        julgar: (oc) => {
            const n = normal(oc.forma)
            const depoisAdjetivo = pareceAdjetivo(oc.depois)
            if (n === 'meia' && depoisAdjetivo) return { ok: false, porque: 'Antes de adjetivo, MEIO é advérbio e não muda: "meio cansada".' }
            return { ok: true, porque: n === 'meio' ? 'MEIO como advérbio fica invariável.' : 'MEIA como numeral concorda com o substantivo.' }
        }
    },
    anexo: {
        titulo: 'Anexo, em anexo', emoji: '📎',
        formas: ['anexo', 'anexa', 'anexos', 'anexas'],
        resumo: 'ANEXO é adjetivo e concorda com o que está anexado.',
        ficha: [
            '*Segue anexa a nota fiscal.* — concorda com nota (feminino).',
            '*Seguem anexos os documentos.* — concorda com documentos (masculino plural).',
            '*em anexo* — locução invariável, aceita mas menos elegante na escrita formal.',
            '*Nunca:* "segue anexo a planilha".'
        ],
        julgar: (oc) => ({ ok: null, porque: 'ANEXO concorda em gênero e número com o que está sendo anexado. Confira a palavra que vem junto: ' + (oc.depois || 'o documento') + '.' })
    },
    obrigado: {
        titulo: 'Obrigado ou obrigada', emoji: '🙏',
        formas: ['obrigado', 'obrigada', 'obrigados', 'obrigadas'],
        resumo: 'Quem agradece concorda consigo mesmo: homem diz obrigado, mulher diz obrigada.',
        ficha: [
            '*obrigado* — dito por homem: Obrigado pela ajuda.',
            '*obrigada* — dito por mulher: Obrigada pela ajuda.',
            '*obrigados/obrigadas* — grupo falando: Obrigados pela força.',
            '*Por quê:* a palavra é adjetivo (eu fico obrigado a você), então concorda com quem fala.'
        ],
        julgar: () => ({ ok: null, porque: 'A palavra concorda com quem agradece, não com quem recebe o agradecimento.' })
    }
}

/** Roda a análise de um par sobre a frase da pessoa. */
function analisarPar(id, frase) {
    const par = PARES[id]
    if (!par) return null
    const texto = String(frase ?? '').trim()
    const ocs = ocorrenciasDe(texto, par.formas)
    const casos = ocs.map(oc => {
        const r = par.julgar(oc, texto) || {}
        return { trecho: oc.forma, ok: r.ok, porque: r.porque }
    })
    return { par, frase: texto, casos }
}

// ═══════════════════════════════════════════════════════════════════════════
// CONCORDÂNCIA
// ═══════════════════════════════════════════════════════════════════════════

/** Armadilhas de concordância verbal que caem em toda prova. */
const ARMADILHAS_VERBAIS = [
    {
        re: /fazem\s+(\d+|dois|três|tres|quatro|cinco|dez|vinte|muitos|alguns)\s+(anos|meses|dias|semanas|horas|minutos)/giu,
        erro: 'fazem', certo: 'faz',
        porque: 'FAZER indicando tempo é impessoal: não tem sujeito e fica sempre no singular. "Faz dois anos".'
    },
    {
        re: /houveram/giu, erro: 'houveram', certo: 'houve',
        porque: 'HAVER no sentido de existir é impessoal: fica sempre no singular. "Houve muitos problemas".'
    },
    {
        re: /haviam\s+(muitos|muitas|várias|varias|vários|varios|alguns|algumas|duas|dois|\d+)/giu,
        erro: 'haviam', certo: 'havia',
        porque: 'HAVER de existência não vai ao plural: "Havia muitas pessoas".'
    },
    {
        re: /existe\s+(muitos|muitas|várias|varias|vários|varios|alguns|algumas)/giu,
        erro: 'existe', certo: 'existem',
        porque: 'EXISTIR tem sujeito e concorda com ele: "Existem muitas pessoas". Quem não concorda é HAVER.'
    },
    {
        re: new RegExp(BORDA_ESQ + 'a\\s+gente\\s+(vamos|fomos|somos|estamos|temos|queremos|iremos)' + BORDA_DIR, 'giu'),
        erro: 'a gente + nós', certo: 'a gente vai, a gente foi, a gente é',
        porque: 'A GENTE é 3ª pessoa do singular: "a gente vai", nunca "a gente vamos".'
    },
    {
        re: new RegExp(BORDA_ESQ + 'menas' + BORDA_DIR, 'giu'),
        erro: 'menas', certo: 'menos',
        porque: 'MENOS é invariável: não existe "menas" em nenhuma situação.'
    },
    {
        re: new RegExp(BORDA_ESQ + '(tinha|tinham)\\s+(muitas|muitos|várias|varias|vários|varios)' + BORDA_DIR, 'giu'),
        erro: 'tinha (existir)', certo: 'havia',
        porque: 'Na escrita formal, "existir" se diz com HAVER: "Havia muitas pessoas", não "tinha muitas pessoas".'
    },
    {
        re: /vendem-se|aluga-se\s+casas|vende-se\s+casas/giu,
        erro: 'vende-se casas', certo: 'vendem-se casas',
        porque: 'Na passiva sintética o verbo concorda com o sujeito: "Vendem-se casas" (casas são vendidas).'
    }
]

/** Diz se a forma verbal está no plural. */
function verboNoPlural(forma) {
    const f = String(forma ?? '').toLowerCase()
    if (['têm', 'vêm', 'são', 'estão', 'vão', 'foram', 'eram', 'serão', 'deem', 'veem'].includes(f)) return true
    if (['tem', 'vem', 'é', 'está', 'vai', 'foi', 'era', 'será'].includes(f)) return false
    return /(m|ão|ões)$/.test(normal(f)) || /mos$/.test(normal(f))
}

/** Analisa a concordância verbal da frase. */
function analisarConcordanciaVerbal(frase) {
    const texto = String(frase ?? '').trim()
    const problemas = []
    for (const a of ARMADILHAS_VERBAIS) {
        a.re.lastIndex = 0
        const m = a.re.exec(texto)
        if (m) problemas.push({ trecho: m[0], certo: a.certo, porque: a.porque })
    }
    const s = analiseSintatica(texto)
    const observacoes = []
    if (s && !s.erro) {
        const nucleo = s.nucleoSujeito
        // O determinante também denuncia o número: em "os menino saiu", o
        // núcleo está no singular mas o "os" mostra que o sujeito é plural.
        const determinante = normal(palavrasDe(s.sujeito)[0] || '')
        const determinantePlural = ['os', 'as', 'uns', 'umas', 'esses', 'essas', 'estes', 'estas',
            'aqueles', 'aquelas', 'meus', 'minhas', 'seus', 'suas', 'muitos', 'muitas', 'varios', 'varias'].includes(determinante)
        const sujeitoPlural = determinantePlural
            || (/s$/.test(normal(nucleo)) && !['mais', 'menos', 'pois', 'lápis'].includes(normal(nucleo)))
        const composto = /composto/.test(s.tipoSujeito)
        const vPlural = verboNoPlural(s.verbo)
        if ((sujeitoPlural || composto) && !vPlural) {
            problemas.push({
                trecho: nucleo + ' ' + s.verbo,
                certo: 'o verbo no plural',
                porque: 'O sujeito está no plural' + (composto ? ' (sujeito composto)' : '') + ', então o verbo vai para o plural também.'
            })
        } else if (!sujeitoPlural && !composto && vPlural && !s.sujeito.startsWith('(')) {
            observacoes.push('O verbo está no plural e o núcleo do sujeito parece singular. Confira se o sujeito não é composto ou coletivo.')
        } else {
            observacoes.push('Sujeito "' + s.sujeito + '" e verbo "' + s.verbo + '" combinando: a regra básica é o verbo concordar em número e pessoa com o sujeito.')
        }
    }
    return { frase: texto, problemas, observacoes }
}

const REGRAS_NOMINAIS = [
    'O adjetivo concorda em gênero e número com o substantivo: "casas bonitas", "livro novo".',
    'Adjetivo depois de dois substantivos de gêneros diferentes vai para o masculino plural: "pai e mãe zelosos".',
    'Adjetivo antes de dois substantivos concorda com o mais próximo: "belas casas e jardins".',
    'BASTANTE varia quando é adjetivo ("bastantes motivos") e não varia quando é advérbio ("comeu bastante").',
    'MEIO não varia como advérbio ("meio cansada") e varia como numeral ("meia hora").',
    'ANEXO, INCLUSO e OBRIGADO concordam com a palavra a que se referem.',
    'MENOS, ALERTA e SALVO nunca variam: "menas" não existe.',
    'É PROIBIDO fica invariável sem artigo ("é proibido entrada") e concorda com artigo ("é proibida a entrada").'
]

/** Concordância nominal: confere número entre determinante, núcleo e adjetivo. */
function analisarConcordanciaNominal(frase) {
    const tokens = classesDaFrase(frase)
    const problemas = []
    for (let i = 0; i < tokens.length - 1; i++) {
        const a = tokens[i], b = tokens[i + 1]
        if (a.classe === 'artigo' && b.classe === 'substantivo') {
            const artPlural = /s$/.test(normal(a.palavra))
            const subPlural = /s$/.test(normal(b.palavra))
            if (artPlural !== subPlural) {
                problemas.push({
                    trecho: a.palavra + ' ' + b.palavra,
                    porque: 'Artigo e substantivo têm de estar no mesmo número: ou os dois no singular, ou os dois no plural.'
                })
            }
        }
        if (a.classe === 'substantivo' && b.classe === 'adjetivo') {
            const subPlural = /s$/.test(normal(a.palavra))
            const adjPlural = /s$/.test(normal(b.palavra))
            if (subPlural !== adjPlural) {
                problemas.push({
                    trecho: a.palavra + ' ' + b.palavra,
                    porque: 'O adjetivo concorda com o substantivo em gênero e número.'
                })
            }
        }
    }
    const invariaveis = []
    if (/menas/i.test(frase)) invariaveis.push('MENOS é invariável: "menas" não existe.')
    if (/meia\s+(cansad|nervos|preocupad|irritad)/i.test(frase)) invariaveis.push('Antes de adjetivo, MEIO é advérbio e não varia: "meio cansada".')
    if (/bastantes\s+(cansad|nervos)/i.test(frase)) invariaveis.push('Como advérbio, BASTANTE não varia: "ficou bastante cansado".')
    return { frase: String(frase).trim(), problemas, invariaveis, regras: REGRAS_NOMINAIS }
}

// ═══════════════════════════════════════════════════════════════════════════
// REGÊNCIA
// ═══════════════════════════════════════════════════════════════════════════

const REGENCIA_VERBAL = new Map([
    ['assistir', 'A (ver): assisti AO filme. Sem preposição quando é ajudar: o médico assistiu o doente.'],
    ['aspirar', 'A (desejar): aspiro AO cargo. Sem preposição quando é sorver: aspirou o perfume.'],
    ['visar', 'A (almejar): visa AO lucro. Sem preposição quando é mirar ou dar visto: visou o cheque.'],
    ['chegar', 'A: cheguei A casa, cheguei AO trabalho. "Chegar em" é fala, não escrita formal.'],
    ['ir', 'A ou PARA: vou AO mercado, vou PARA casa. "Ir em" não é norma culta.'],
    ['obedecer', 'A: obedeça AOS pais. O mesmo vale para desobedecer.'],
    ['pagar', 'algo A alguém: paguei a conta AO garçom.'],
    ['perdoar', 'algo A alguém: perdoei a dívida AO amigo.'],
    ['preferir', 'algo A algo: prefiro chá A café. Nunca "prefiro mais do que".'],
    ['simpatizar', 'COM: simpatizo COM a ideia. E não é pronominal: não existe "me simpatizei".'],
    ['implicar', 'sem preposição no sentido de acarretar: o atraso implicou prejuízo.'],
    ['namorar', 'sem preposição: namoro Ana, e não "namoro com Ana".'],
    ['esquecer', 'sem preposição quando não é pronominal: esqueci o nome. Com pronome, pede DE: esqueci-me DO nome.'],
    ['lembrar', 'sem preposição: lembrei o compromisso. Com pronome: lembrei-me DO compromisso.'],
    ['informar', 'algo A alguém, ou alguém DE algo: informei o resultado AOS alunos.'],
    ['custar', 'A alguém: custou-me acreditar. O sujeito é a coisa custosa, não a pessoa.'],
    ['proceder', 'A (dar início): procedeu À leitura. DE (vir de): procede DE boa família.'],
    ['responder', 'A: respondi AO e-mail.'],
    ['agradar', 'A (satisfazer): o show agradou AO público. Sem preposição é acariciar: agradou o gato.'],
    ['morar', 'EM: moro EM São Paulo, moro NA rua tal.'],
    ['gostar', 'DE: gosto DE música.'],
    ['precisar', 'DE: preciso DE ajuda. Sem preposição quando é especificar: precisou o valor.'],
    ['necessitar', 'DE: necessito DE apoio.'],
    ['depender', 'DE: depende DE você.'],
    ['duvidar', 'DE: duvido DA notícia.'],
    ['participar', 'DE (tomar parte): participei DA reunião. A alguém (comunicar): participou o casamento aos amigos.'],
    ['consistir', 'EM: o trabalho consiste EM ler e resumir.'],
    ['acreditar', 'EM: acredito EM você.'],
    ['assistir', 'A (ver): assisti AO jogo.'],
    ['chamar', 'sem preposição (convocar) ou A (apelidar): chamou-o DE herói também é aceito.'],
    ['querer', 'sem preposição (desejar) ou A (amar): quero A meus filhos.'],
    ['sobressair', 'sem pronome: ele sobressaiu no teste, e não "se sobressaiu".'],
    ['namorar', 'sem preposição: namoro Ana.'],
    ['ensinar', 'algo A alguém: ensinei o conteúdo AOS alunos.'],
    ['obedecer', 'A: obedeço AO regulamento.'],
    ['assistir', 'A: assisti AO filme.']
])

const ERROS_REGENCIA = [
    { re: /assist(i|iu|imos|iram|indo)\s+o\s/giu, certo: 'assistir AO', porque: 'ASSISTIR no sentido de ver pede a preposição A: "assisti ao filme".' },
    { re: /cheg(uei|ou|amos|aram)\s+em\s/giu, certo: 'chegar A', porque: 'CHEGAR pede A: "cheguei a casa", "cheguei ao trabalho".' },
    { re: /prefiro\s+.{1,30}\s+do\s+que\s/giu, certo: 'preferir algo A algo', porque: 'PREFERIR já carrega a ideia de superioridade: "prefiro chá a café".' },
    { re: /namor(o|a|ando)\s+com\s/giu, certo: 'namorar alguém', porque: 'NAMORAR não pede preposição: "namoro Ana".' },
    { re: /implic(a|ou|am)\s+em\s/giu, certo: 'implicar algo', porque: 'IMPLICAR no sentido de acarretar não pede EM: "o atraso implicou prejuízo".' },
    { re: /me\s+simpatiz/giu, certo: 'simpatizar com', porque: 'SIMPATIZAR não é pronominal: "simpatizo com ele".' },
    { re: /vou\s+em\s/giu, certo: 'ir a / ir para', porque: 'IR pede A ou PARA: "vou ao mercado".' },
    { re: /obedec(er|i|eu|em)\s+o\s/giu, certo: 'obedecer AO', porque: 'OBEDECER pede A: "obedeça ao regulamento".' }
]

/** Regência verbal: ficha do verbo ou conferência da frase. */
function analisarRegenciaVerbal(entrada) {
    const texto = String(entrada ?? '').trim()
    const uma = palavrasDe(texto).length === 1
    if (uma) {
        const v = normal(texto)
        const chave = [...REGENCIA_VERBAL.keys()].find(k => normal(k) === v || normal(k) === normal(infinitivoDe(v) || ''))
        if (chave) return { tipo: 'ficha', verbo: chave, regencia: REGENCIA_VERBAL.get(chave) }
        return { tipo: 'semFicha', verbo: texto }
    }
    const achados = []
    for (const e of ERROS_REGENCIA) {
        e.re.lastIndex = 0
        const m = e.re.exec(texto)
        if (m) achados.push({ trecho: m[0].trim(), certo: e.certo, porque: e.porque })
    }
    return { tipo: 'frase', frase: texto, achados }
}

const REGENCIA_NOMINAL = [
    'acesso A', 'alusão A', 'atentado CONTRA', 'aversão A ou POR', 'capacidade DE ou PARA',
    'devoção A, POR ou PARA COM', 'dúvida ACERCA DE, EM ou SOBRE', 'horror A', 'medo DE',
    'obediência A', 'respeito A, COM, PARA COM ou POR', 'acostumado A ou COM', 'ansioso DE, PARA ou POR',
    'apto A ou PARA', 'compatível COM', 'contemporâneo A ou DE', 'entendido EM', 'essencial A ou PARA',
    'fiel A', 'grato A alguém POR algo', 'necessário A', 'preferível A', 'propenso A ou PARA',
    'relacionado COM', 'satisfeito COM, DE, EM ou POR', 'semelhante A', 'último A'
]

// ═══════════════════════════════════════════════════════════════════════════
// COLOCAÇÃO PRONOMINAL
// ═══════════════════════════════════════════════════════════════════════════

const PRONOMES_ATONOS = ['me', 'te', 'se', 'nos', 'vos', 'lhe', 'lhes', 'o', 'a', 'os', 'as']
const ATRATIVAS = {
    negação: ['não', 'nunca', 'jamais', 'nada', 'ninguém', 'nenhum', 'nem'],
    advérbio: ['sempre', 'talvez', 'já', 'aqui', 'ali', 'agora', 'só', 'apenas', 'bem', 'mal', 'ainda', 'também', 'quase'],
    'pronome relativo, indefinido ou demonstrativo': ['que', 'quem', 'qual', 'quanto', 'tudo', 'todos', 'alguém', 'isso', 'aquilo', 'ambos'],
    'conjunção subordinativa': ['quando', 'se', 'porque', 'embora', 'conforme', 'caso', 'como', 'enquanto', 'logo que', 'desde que']
}

/** Próclise, mesóclise ou ênclise: o que a frase pede. */
function analisarColocacao(frase) {
    const texto = String(frase ?? '').trim()
    const tokens = palavrasDe(texto)
    const achados = []
    const comHifen = texto.match(/[\p{L}]+-(me|te|se|nos|vos|lhe|lhes|o|a|os|as)\b/giu) || []

    let atrativa = null, motivo = null
    for (const [tipo, lista] of Object.entries(ATRATIVAS)) {
        for (const p of lista) {
            const ocs = ocorrenciasDe(texto, [p])
            // "se" só conta como conjunção quando abre a oração: em
            // "Sentou-se na cadeira" ele é o próprio pronome, não atrativa.
            const vale = p === 'se' ? ocs.some(o => o.comecoDeFrase) : ocs.length > 0
            if (vale) { atrativa = p; motivo = tipo; break }
        }
        if (atrativa) break
    }
    const temFuturo = tokens.some(t => pareceVerbo(t) && /(rei|rás|rá|remos|reis|rão|ria|rias|ríamos|riam)$/.test(t.toLowerCase()))
    const pronomeSolto = tokens.find((t, i) => PRONOMES_ATONOS.includes(normal(t)) && i > 0 && ['me', 'te', 'se', 'lhe', 'nos'].includes(normal(t)))
    const comecaComPronome = ['me', 'te', 'se', 'lhe', 'nos'].includes(normal(tokens[0] || ''))

    if (comecaComPronome) {
        achados.push({
            regra: 'nunca comece a frase com pronome átono',
            oque: 'Na fala todo mundo diz "Me empresta o livro", e ninguém corrige. Na escrita formal, escreva "Empresta-me o livro".'
        })
    }
    if (atrativa) {
        achados.push({
            regra: 'próclise (pronome antes do verbo)',
            oque: 'A palavra "' + atrativa + '" é atrativa (' + motivo + '). Ela puxa o pronome para antes do verbo: "Não me diga", "Sempre se lembrava".'
        })
    } else if (temFuturo) {
        achados.push({
            regra: 'mesóclise (pronome no meio do verbo)',
            oque: 'Verbo no futuro sem palavra atrativa pede o pronome no meio: "dar-te-ei", "far-se-á". É formal e cada vez mais raro.'
        })
    } else {
        achados.push({
            regra: 'ênclise (pronome depois do verbo)',
            oque: 'Sem palavra atrativa e sem futuro, o pronome fica depois do verbo, com hífen: "Diga-me", "Sentou-se".'
        })
    }
    return { frase: texto, achados, comHifen, pronomeSolto: pronomeSolto || null, atrativa, motivo }
}

// ═══════════════════════════════════════════════════════════════════════════
// PONTUAÇÃO
// ═══════════════════════════════════════════════════════════════════════════

const REGRAS_VIRGULA = [
    'Separa itens de uma enumeração: comprei pão, leite e café.',
    'Isola o vocativo (a quem se fala): Maria, venha aqui.',
    'Isola o aposto (explicação): Machado de Assis, autor de Dom Casmurro, nasceu no Rio.',
    'Marca o adjunto adverbial deslocado para o começo: Ontem, choveu muito.',
    'Vem antes de MAS, PORÉM, CONTUDO, TODAVIA e ENTRETANTO.',
    'Isola a oração explicativa introduzida por POIS, PORQUE ou QUE.',
    'Marca a omissão do verbo: Ele quer café; ela, chá.'
]
const PROIBICOES_VIRGULA = [
    'Nunca separe o sujeito do verbo: "Os alunos, chegaram" está errado.',
    'Nunca separe o verbo do objeto direto: "Comprei, um livro" está errado.',
    'Nunca ponha vírgula antes de E quando os sujeitos forem os mesmos, salvo em enumeração.'
]

/** Onde cabe vírgula na frase e onde ela é proibida. */
function analisarVirgula(frase) {
    const texto = String(frase ?? '').trim()
    const achados = []
    const alertas = []

    const vocativo = texto.match(/^([\p{Lu}][\p{L}]+),/u)
    const partes = texto.split(',')
    if (partes.length > 1 && !vocativo) {
        // Vírgula entre sujeito e verbo: primeira parte curta sem verbo, segunda
        // começando com verbo. Um vocativo isolado ("Maria, venha") não conta:
        // ali a vírgula é obrigatória.
        const primeira = palavrasDe(partes[0])
        const segunda = palavrasDe(partes[1] || '')
        const primeiraSemVerbo = primeira.length >= 2 && !primeira.some(pareceVerbo)
        const segundaComecaVerbo = segunda.length && pareceVerbo(segunda[0])
        if (primeiraSemVerbo && segundaComecaVerbo && partes.length === 2 && primeira.length <= 4) {
            alertas.push('A vírgula depois de "' + partes[0].trim() + '" está separando o sujeito do verbo. Essa vírgula não existe: tire.')
        }
    }
    if (/,\s*(mas|porém|porem|contudo|todavia|entretanto)/i.test(texto)) {
        achados.push('Vírgula antes da conjunção adversativa: certo, é a regra.')
    } else if (/\s(mas|porém|contudo|todavia|entretanto)\s/i.test(texto)) {
        alertas.push('Falta a vírgula antes da conjunção adversativa: "estudei, mas não passei".')
    }
    if (vocativo) achados.push('"' + vocativo[1] + '," no começo está isolado como vocativo: certo.')
    const enumeracao = (texto.match(/,/g) || []).length >= 2 && /\se\s/.test(texto)
    if (enumeracao) achados.push('Parece enumeração: vírgula entre os itens e E antes do último.')
    const comecaAdverbio = /^(ontem|hoje|amanhã|depois|antes|logo|então|assim|naquele|no ano|em \d{4}|durante|apesar|quando|se)\b/i.test(texto)
    if (comecaAdverbio && !/^[^,]{0,40},/.test(texto)) {
        alertas.push('A frase começa com uma expressão deslocada: costuma pedir vírgula depois dela.')
    }
    if (!achados.length && !alertas.length) achados.push('Não vi nenhuma vírgula obrigatória faltando nem sobrando nessa frase.')
    return { frase: texto, achados, alertas, regras: REGRAS_VIRGULA, proibicoes: PROIBICOES_VIRGULA }
}

const SINAIS_PONTUACAO = [
    ['. ponto final', 'fecha a frase declarativa e marca abreviatura'],
    [', vírgula', 'marca pausa curta e separa termos de mesma função'],
    ['; ponto e vírgula', 'separa itens longos que já têm vírgula dentro'],
    [': dois-pontos', 'anuncia enumeração, explicação ou fala'],
    ['? ponto de interrogação', 'fecha pergunta direta'],
    ['! ponto de exclamação', 'marca emoção, ordem ou apelo'],
    ['… reticências', 'indica interrupção ou continuidade'],
    ['— travessão', 'marca fala no diálogo e isola comentário'],
    ['() parênteses', 'guarda informação acessória'],
    ['"" aspas', 'marca citação, título ou sentido especial']
]

// ═══════════════════════════════════════════════════════════════════════════
// VOCABULÁRIO: sinônimos, antônimos, coletivos, parônimos
// ═══════════════════════════════════════════════════════════════════════════

const VOCABULARIO = new Map([
    ['bonito', { sin: ['belo', 'lindo', 'formoso', 'atraente'], ant: ['feio', 'horrendo'] }],
    ['feio', { sin: ['horrendo', 'medonho', 'disforme'], ant: ['bonito', 'belo'] }],
    ['grande', { sin: ['enorme', 'vasto', 'amplo', 'imenso'], ant: ['pequeno', 'diminuto'] }],
    ['pequeno', { sin: ['diminuto', 'miúdo', 'reduzido'], ant: ['grande', 'imenso'] }],
    ['feliz', { sin: ['alegre', 'contente', 'satisfeito', 'radiante'], ant: ['triste', 'infeliz'] }],
    ['triste', { sin: ['abatido', 'melancólico', 'desanimado'], ant: ['feliz', 'alegre'] }],
    ['rápido', { sin: ['veloz', 'ligeiro', 'ágil'], ant: ['lento', 'vagaroso'] }],
    ['lento', { sin: ['vagaroso', 'moroso', 'demorado'], ant: ['rápido', 'veloz'] }],
    ['forte', { sin: ['robusto', 'vigoroso', 'potente'], ant: ['fraco', 'frágil'] }],
    ['fraco', { sin: ['frágil', 'débil', 'tênue'], ant: ['forte', 'robusto'] }],
    ['rico', { sin: ['abastado', 'próspero', 'endinheirado'], ant: ['pobre', 'miserável'] }],
    ['pobre', { sin: ['carente', 'necessitado', 'humilde'], ant: ['rico', 'abastado'] }],
    ['difícil', { sin: ['árduo', 'complexo', 'penoso'], ant: ['fácil', 'simples'] }],
    ['fácil', { sin: ['simples', 'descomplicado', 'acessível'], ant: ['difícil', 'árduo'] }],
    ['importante', { sin: ['relevante', 'essencial', 'fundamental'], ant: ['irrelevante', 'dispensável'] }],
    ['problema', { sin: ['dificuldade', 'entrave', 'obstáculo'], ant: ['solução', 'saída'] }],
    ['solução', { sin: ['saída', 'resolução', 'remédio'], ant: ['problema', 'impasse'] }],
    ['começar', { sin: ['iniciar', 'principiar', 'inaugurar'], ant: ['terminar', 'encerrar'] }],
    ['terminar', { sin: ['encerrar', 'concluir', 'finalizar'], ant: ['começar', 'iniciar'] }],
    ['falar', { sin: ['dizer', 'expressar', 'pronunciar', 'discorrer'], ant: ['calar', 'silenciar'] }],
    ['mostrar', { sin: ['exibir', 'revelar', 'apontar', 'demonstrar'], ant: ['esconder', 'ocultar'] }],
    ['esconder', { sin: ['ocultar', 'dissimular', 'encobrir'], ant: ['mostrar', 'revelar'] }],
    ['aumentar', { sin: ['ampliar', 'elevar', 'acrescer'], ant: ['diminuir', 'reduzir'] }],
    ['diminuir', { sin: ['reduzir', 'encolher', 'minguar'], ant: ['aumentar', 'ampliar'] }],
    ['bom', { sin: ['ótimo', 'excelente', 'benéfico'], ant: ['mau', 'ruim', 'péssimo'] }],
    ['ruim', { sin: ['mau', 'péssimo', 'inferior'], ant: ['bom', 'ótimo'] }],
    ['velho', { sin: ['antigo', 'idoso', 'vetusto'], ant: ['novo', 'jovem'] }],
    ['novo', { sin: ['recente', 'moderno', 'inédito'], ant: ['velho', 'antigo'] }],
    ['medo', { sin: ['receio', 'temor', 'pavor'], ant: ['coragem', 'destemor'] }],
    ['coragem', { sin: ['bravura', 'ousadia', 'destemor'], ant: ['medo', 'covardia'] }],
    ['verdade', { sin: ['veracidade', 'realidade', 'certeza'], ant: ['mentira', 'falsidade'] }],
    ['mentira', { sin: ['falsidade', 'inverdade', 'lorota'], ant: ['verdade', 'honestidade'] }],
    ['trabalho', { sin: ['labuta', 'ofício', 'serviço', 'emprego'], ant: ['ócio', 'descanso'] }],
    ['casa', { sin: ['lar', 'moradia', 'residência', 'domicílio'], ant: ['rua'] }],
    ['caminho', { sin: ['trajeto', 'rota', 'percurso', 'via'], ant: ['desvio'] }],
    ['luta', { sin: ['combate', 'embate', 'briga', 'disputa'], ant: ['paz', 'trégua'] }],
    ['paz', { sin: ['tranquilidade', 'serenidade', 'harmonia'], ant: ['guerra', 'conflito'] }],
    ['liberdade', { sin: ['autonomia', 'independência', 'soltura'], ant: ['prisão', 'opressão'] }],
    ['medroso', { sin: ['covarde', 'temeroso', 'apreensivo'], ant: ['corajoso', 'destemido'] }],
    ['inteligente', { sin: ['esperto', 'perspicaz', 'sagaz'], ant: ['tolo', 'ingênuo'] }],
    ['barato', { sin: ['acessível', 'em conta', 'módico'], ant: ['caro', 'custoso'] }],
    ['caro', { sin: ['custoso', 'dispendioso', 'salgado'], ant: ['barato', 'módico'] }],
    ['limpo', { sin: ['asseado', 'higienizado', 'imaculado'], ant: ['sujo', 'imundo'] }],
    ['sujo', { sin: ['imundo', 'encardido', 'poluído'], ant: ['limpo', 'asseado'] }],
    ['claro', { sin: ['nítido', 'evidente', 'luminoso'], ant: ['escuro', 'obscuro'] }],
    ['escuro', { sin: ['sombrio', 'tenebroso', 'obscuro'], ant: ['claro', 'iluminado'] }],
    ['calor', { sin: ['mormaço', 'canícula', 'ardor'], ant: ['frio', 'gelo'] }],
    ['frio', { sin: ['gélido', 'glacial', 'friagem'], ant: ['calor', 'quente'] }],
    ['amigo', { sin: ['companheiro', 'camarada', 'parceiro'], ant: ['inimigo', 'adversário'] }],
    ['inimigo', { sin: ['adversário', 'oponente', 'rival'], ant: ['amigo', 'aliado'] }],
    ['guerra', { sin: ['conflito', 'batalha', 'beligerância'], ant: ['paz', 'concórdia'] }],
    ['saúde', { sin: ['bem-estar', 'vigor', 'higidez'], ant: ['doença', 'enfermidade'] }],
    ['doença', { sin: ['enfermidade', 'moléstia', 'mal'], ant: ['saúde', 'cura'] }],
    ['crescer', { sin: ['desenvolver', 'progredir', 'expandir'], ant: ['encolher', 'regredir'] }],
    ['ajudar', { sin: ['auxiliar', 'socorrer', 'apoiar'], ant: ['atrapalhar', 'prejudicar'] }],
    ['prejudicar', { sin: ['lesar', 'danificar', 'atrapalhar'], ant: ['ajudar', 'beneficiar'] }],
    ['estudar', { sin: ['aprender', 'pesquisar', 'examinar'], ant: ['ignorar'] }],
    ['ganhar', { sin: ['conquistar', 'obter', 'vencer'], ant: ['perder'] }],
    ['perder', { sin: ['extraviar', 'sucumbir', 'fracassar'], ant: ['ganhar', 'achar'] }],
    ['bonita', { sin: ['bela', 'linda', 'formosa'], ant: ['feia'] }],
    ['barulho', { sin: ['ruído', 'estrondo', 'algazarra'], ant: ['silêncio', 'quietude'] }],
    ['silêncio', { sin: ['quietude', 'mudez', 'calmaria'], ant: ['barulho', 'ruído'] }],
    ['justiça', { sin: ['equidade', 'retidão', 'imparcialidade'], ant: ['injustiça', 'arbítrio'] }],
    ['cidade', { sin: ['município', 'urbe', 'localidade'], ant: ['campo', 'roça'] }],
    ['dinheiro', { sin: ['grana', 'recurso', 'numerário', 'capital'], ant: ['dívida'] }],
    ['vida', { sin: ['existência', 'vivência'], ant: ['morte'] }],
    ['morte', { sin: ['falecimento', 'óbito', 'fim'], ant: ['vida', 'nascimento'] }],
    ['medroso', { sin: ['covarde', 'tímido'], ant: ['valente'] }],
    ['humilde', { sin: ['modesto', 'simples', 'despretensioso'], ant: ['soberbo', 'arrogante'] }],
    ['arrogante', { sin: ['soberbo', 'presunçoso', 'petulante'], ant: ['humilde', 'modesto'] }],
    ['antigo', { sin: ['remoto', 'arcaico', 'ancestral'], ant: ['recente', 'atual'] }],
    ['moderno', { sin: ['atual', 'contemporâneo', 'inovador'], ant: ['antiquado', 'ultrapassado'] }],
    ['necessário', { sin: ['imprescindível', 'indispensável', 'preciso'], ant: ['dispensável', 'supérfluo'] }],
    ['possível', { sin: ['viável', 'exequível', 'factível'], ant: ['impossível', 'inviável'] }],
    ['certo', { sin: ['correto', 'exato', 'acertado'], ant: ['errado', 'equivocado'] }],
    ['errado', { sin: ['equivocado', 'incorreto', 'falho'], ant: ['certo', 'correto'] }]
])

const COLETIVOS = new Map([
    ['abelha', 'enxame (voando) ou colmeia (na casa)'], ['ave', 'bando ou revoada'],
    ['aluno', 'classe ou turma'], ['animal', 'manada, rebanho ou alcateia, conforme a espécie'],
    ['artista', 'elenco'], ['árvore', 'floresta, bosque ou mata'], ['banana', 'cacho ou penca'],
    ['boi', 'boiada ou manada'], ['cabra', 'fato ou rebanho'], ['cachorro', 'matilha'],
    ['camelo', 'cáfila'], ['cantor', 'coral ou coro'], ['cão', 'matilha'], ['carro', 'frota'],
    ['chave', 'molho'], ['cordeiro', 'rebanho'], ['deputado', 'câmara'], ['disco', 'discoteca'],
    ['elefante', 'manada'], ['embarcação', 'frota ou esquadra'], ['erva', 'ervanário'],
    ['estrela', 'constelação'], ['flor', 'buquê, ramalhete ou coroa'], ['formiga', 'formigueiro'],
    ['fruta', 'cesta ou penca'], ['gato', 'gataria'], ['gente', 'multidão, povo ou turba'],
    ['ilha', 'arquipélago'], ['jogador', 'time, equipe ou esquadrão'], ['jurado', 'júri'],
    ['ladrão', 'quadrilha ou bando'], ['leão', 'alcateia'], ['livro', 'biblioteca ou coleção'],
    ['lobo', 'alcateia'], ['macaco', 'bando'], ['mapa', 'atlas'], ['músico', 'orquestra ou banda'],
    ['navio', 'esquadra, frota ou armada'], ['ovelha', 'rebanho'], ['palavra', 'vocabulário ou léxico'],
    ['papel', 'resma (quinhentas folhas)'], ['peixe', 'cardume'], ['pássaro', 'bando'],
    ['porco', 'vara'], ['professor', 'corpo docente'], ['recruta', 'pelotão'], ['soldado', 'tropa ou exército'],
    ['turista', 'caravana ou excursão'], ['uva', 'cacho'], ['vaca', 'manada'], ['inseto', 'nuvem ou praga'],
    ['cavalo', 'tropa ou cavalhada'], ['cebola', 'réstia'], ['estudante', 'turma'],
    ['ilha', 'arquipélago'], ['ladrilho', 'lajedo'], ['pedra', 'pedregulho ou cascalho'],
    ['assassino', 'horda'], ['bandido', 'quadrilha'], ['abutre', 'bando'], ['anjo', 'coro ou legião'],
    ['aplauso', 'salva'], ['bala', 'saraivada ou rajada'], ['cardeal', 'colégio ou conclave'],
    ['discípulo', 'grei'], ['documento', 'dossiê ou arquivo'], ['espectador', 'plateia ou audiência'],
    ['ferramenta', 'kit ou jogo'], ['ilhas', 'arquipélago'], ['lei', 'código ou legislação'],
    ['marinheiro', 'tripulação ou maruja'], ['médico', 'junta'], ['montanha', 'cordilheira ou serra'],
    ['peregrino', 'romaria'], ['pintinho', 'ninhada'], ['roupa', 'enxoval ou muda'],
    ['selo', 'coleção ou álbum'], ['testemunha', 'junta'], ['touro', 'manada']
])

const PARONIMOS = [
    ['sessão', 'reunião, período de tempo: sessão de cinema'],
    ['seção', 'divisão, parte: seção de brinquedos'],
    ['cessão', 'ato de ceder: cessão de direitos'],
    ['mandado', 'ordem judicial: mandado de prisão'],
    ['mandato', 'período de um cargo: mandato de quatro anos'],
    ['tráfego', 'movimento de veículos: tráfego intenso'],
    ['tráfico', 'comércio ilegal: tráfico de drogas'],
    ['descrição', 'detalhar como é: descrição do lugar'],
    ['discrição', 'ser discreto: agiu com discrição'],
    ['eminente', 'ilustre, notável: eminente professor'],
    ['iminente', 'prestes a acontecer: perigo iminente'],
    ['ratificar', 'confirmar: ratificou o acordo'],
    ['retificar', 'corrigir: retificou o erro'],
    ['comprimento', 'extensão: comprimento da mesa'],
    ['cumprimento', 'saudação ou ato de cumprir: cumprimento da meta'],
    ['infligir', 'aplicar castigo: infligiu a pena'],
    ['infringir', 'desrespeitar: infringiu a lei'],
    ['emigrar', 'sair do próprio país'],
    ['imigrar', 'entrar em outro país'],
    ['flagrante', 'evidente, no ato: prisão em flagrante'],
    ['fragrante', 'perfumado: flor fragrante'],
    ['despensa', 'lugar de guardar comida'],
    ['dispensa', 'ato de dispensar'],
    ['absolver', 'inocentar: o júri absolveu o réu'],
    ['absorver', 'sugar: a esponja absorve água'],
    ['deferir', 'conceder: deferiu o pedido'],
    ['diferir', 'ser diferente ou adiar']
]

const HOMONIMOS = [
    ['concerto', 'apresentação musical'], ['conserto', 'reparo'],
    ['acender', 'pôr fogo, ligar'], ['ascender', 'subir'],
    ['cela', 'pequeno quarto de prisão'], ['sela', 'assento do cavalo'],
    ['censo', 'recenseamento'], ['senso', 'juízo, bom senso'],
    ['cheque', 'papel do banco'], ['xeque', 'lance do xadrez, contratempo'],
    ['espectador', 'quem assiste'], ['expectador', 'quem tem expectativa'],
    ['paço', 'palácio'], ['passo', 'movimento do pé'],
    ['taxa', 'valor cobrado'], ['tacha', 'prego pequeno ou defeito'],
    ['cerrar', 'fechar'], ['serrar', 'cortar com serra'],
    ['caçar', 'perseguir animais'], ['cassar', 'anular'],
    ['conjectura', 'suposição'], ['conjuntura', 'situação do momento']
]

// ═══════════════════════════════════════════════════════════════════════════
// ORTOGRAFIA, HÍFEN E NÚMEROS
// ═══════════════════════════════════════════════════════════════════════════

const ERROS_ORTOGRAFIA = new Map([
    ['concerteza', 'com certeza'], ['derrepente', 'de repente'], ['apartir', 'a partir'],
    ['menas', 'menos'], ['seje', 'seja'], ['previlegio', 'privilégio'], ['mendingo', 'mendigo'],
    ['cabeleileiro', 'cabeleireiro'], ['beneficiente', 'beneficente'], ['excessao', 'exceção'],
    ['impecilho', 'empecilho'], ['asteristico', 'asterisco'], ['frustado', 'frustrado'],
    ['estrupo', 'estupro'], ['hajavisto', 'haja vista'], ['atravez', 'através'],
    ['aonde esta', 'onde está'], ['enteligente', 'inteligente'], ['pobrema', 'problema'],
    ['adevogado', 'advogado'], ['prostar', 'prostrar'], ['rucho', 'rouxinol'],
    ['quizer', 'quiser'], ['trousse', 'trouxe'], ['fazendo com que', 'que (evite o rodeio)'],
    ['a nivel de', 'em nível de'], ['en vez', 'em vez'], ['por causo', 'por causa'],
    ['despois', 'depois'], ['pissina', 'piscina'], ['bassoura', 'vassoura'],
    ['caza', 'casa'], ['xicara', 'xícara'], ['geito', 'jeito'], ['viagem para viajar', 'viajem (verbo) e viagem (substantivo)'],
    ['a onde', 'aonde'], ['de baixo', 'debaixo'], ['a traz', 'atrás'], ['pra mim fazer', 'para eu fazer']
])

/** Procura erros de escrita conhecidos no texto. */
function corrigirOrtografia(texto) {
    const t = String(texto ?? '')
    const achados = []
    for (const [errado, certo] of ERROS_ORTOGRAFIA) {
        const re = new RegExp(BORDA_ESQ + escapar(errado).replace(/\\?\s+/g, '\\s+') + BORDA_DIR, 'giu')
        const alvo = tirarAcento(t).toLowerCase()
        if (re.test(alvo)) achados.push({ errado, certo })
    }
    return { texto: t, achados }
}

const REGRAS_HIFEN = [
    'Prefixo terminado na MESMA letra que começa a palavra: com hífen — micro-ondas, anti-inflamatório, super-resistente.',
    'Prefixo terminado em letra DIFERENTE: sem hífen — autoescola, antiaéreo, coautor, extraoficial.',
    'Antes de H, sempre com hífen: super-homem, anti-higiênico, sub-hepático.',
    'Prefixos SUB, AB e OB antes de R: com hífen — sub-região, ab-rogar.',
    'Prefixos EX, VICE, RECÉM, SEM, ALÉM, AQUÉM, PÓS, PRÉ e PRÓ: sempre com hífen — ex-aluno, vice-diretor, recém-nascido.',
    'Palavras compostas sem elemento de ligação: com hífen — guarda-chuva, beija-flor, segunda-feira.',
    'Com elemento de ligação: sem hífen — pé de moleque, dia a dia, fim de semana.',
    'NÃO e QUASE como prefixo: sem hífen — não agressão, quase delito.'
]

/** Confere o hífen da palavra segundo as regras do Acordo de 2009. */
function analisarHifen(palavra) {
    const p = String(palavra ?? '').trim().toLowerCase()
    if (!p) return null
    const prefixosSempre = ['ex', 'vice', 'recém', 'recem', 'sem', 'além', 'alem', 'aquém', 'aquem', 'pós', 'pos', 'pré', 'pre', 'pró', 'pro']
    const partes = p.split('-')
    if (partes.length >= 2) {
        const [pre, resto] = partes
        if (prefixosSempre.includes(normal(pre))) return { forma: p, veredito: 'com hífen, certo', porque: 'O prefixo ' + pre.toUpperCase() + ' pede hífen sempre.' }
        if (resto && pre.slice(-1) === resto.charAt(0)) return { forma: p, veredito: 'com hífen, certo', porque: 'O prefixo termina com a mesma letra que começa a segunda parte, então entra o hífen.' }
        if (resto && resto.charAt(0) === 'h') return { forma: p, veredito: 'com hífen, certo', porque: 'Antes de H o hífen é obrigatório.' }
        if (['sub', 'ab', 'ob'].includes(normal(pre)) && resto.charAt(0) === 'r') return { forma: p, veredito: 'com hífen, certo', porque: 'SUB, AB e OB pedem hífen antes de R.' }
        return { forma: p, veredito: 'confira', porque: 'Se as letras vizinhas forem diferentes e não houver H, o Acordo manda juntar: ' + pre + resto + '.' }
    }
    return { forma: p, veredito: 'sem hífen', porque: 'Sem hífen à vista. Veja as regras abaixo para saber se essa palavra precisaria de um.' }
}

const UNIDADES = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove',
    'dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove']
const DEZENAS = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa']
const CENTENAS = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos',
    'setecentos', 'oitocentos', 'novecentos']
const ORDINAIS_UNIDADE = ['', 'primeiro', 'segundo', 'terceiro', 'quarto', 'quinto', 'sexto', 'sétimo', 'oitavo', 'nono']
const ORDINAIS_DEZENA = ['', 'décimo', 'vigésimo', 'trigésimo', 'quadragésimo', 'quinquagésimo',
    'sexagésimo', 'septuagésimo', 'octogésimo', 'nonagésimo']
const ORDINAIS_CENTENA = ['', 'centésimo', 'ducentésimo', 'trecentésimo', 'quadringentésimo',
    'quingentésimo', 'sexcentésimo', 'septingentésimo', 'octingentésimo', 'noningentésimo']

/** Número por extenso, de 0 a 999.999.999. */
function porExtenso(n) {
    const num = Math.trunc(Math.abs(Number(n)))
    if (!Number.isFinite(num)) return null
    if (num === 0) return 'zero'
    if (num > 999999999) return null
    const tresDigitos = (v) => {
        if (v === 0) return ''
        if (v === 100) return 'cem'
        const c = Math.floor(v / 100), d = Math.floor((v % 100) / 10), u = v % 10
        const partes = []
        if (c) partes.push(CENTENAS[c])
        const resto = v % 100
        if (resto) {
            if (resto < 20) partes.push(UNIDADES[resto])
            else {
                partes.push(DEZENAS[d] + (u ? ' e ' + UNIDADES[u] : ''))
            }
        }
        return partes.join(' e ')
    }
    const milhoes = Math.floor(num / 1000000)
    const milhares = Math.floor((num % 1000000) / 1000)
    const resto = num % 1000
    const partes = []
    if (milhoes) partes.push(milhoes === 1 ? 'um milhão' : tresDigitos(milhoes) + ' milhões')
    if (milhares) partes.push(milhares === 1 ? 'mil' : tresDigitos(milhares) + ' mil')
    if (resto) partes.push(tresDigitos(resto))
    if (partes.length === 1) return partes[0]
    // "E" só antes do último pedaço quando ele é menor que cem ou é centena
    // redonda: quinze mil trezentos e vinte, mas dois mil e quinhentos.
    const ligaComE = resto === 0 || resto < 100 || resto % 100 === 0
    const inicio = partes.slice(0, -1).join(' ')
    return inicio + (ligaComE ? ' e ' : ' ') + partes[partes.length - 1]
}

/** Numeral ordinal por extenso, de 1 a 999. */
function ordinalPorExtenso(n) {
    const num = Math.trunc(Math.abs(Number(n)))
    if (!num || num > 999) return null
    const c = Math.floor(num / 100), d = Math.floor((num % 100) / 10), u = num % 10
    return [ORDINAIS_CENTENA[c], ORDINAIS_DEZENA[d], ORDINAIS_UNIDADE[u]].filter(Boolean).join(' ')
}

// ═══════════════════════════════════════════════════════════════════════════
// FIGURAS DE LINGUAGEM E VÍCIOS
// ═══════════════════════════════════════════════════════════════════════════

const FIGURAS = [
    { nome: 'metáfora', grupo: 'palavra', oque: 'Compara sem usar conectivo: uma coisa É a outra.', exemplo: 'Meu coração é um deserto.' },
    { nome: 'comparação', grupo: 'palavra', oque: 'Compara com conectivo: como, tal qual, que nem.', exemplo: 'Ele é forte como um touro.' },
    { nome: 'metonímia', grupo: 'palavra', oque: 'Troca uma palavra por outra que tem relação de proximidade.', exemplo: 'Li Machado de Assis (a obra pelo autor).' },
    { nome: 'catacrese', grupo: 'palavra', oque: 'Metáfora tão gasta que virou o nome da coisa.', exemplo: 'Pé da mesa, braço da cadeira.' },
    { nome: 'sinestesia', grupo: 'palavra', oque: 'Mistura sensações de sentidos diferentes.', exemplo: 'Um som áspero, uma cor quente.' },
    { nome: 'antítese', grupo: 'pensamento', oque: 'Põe lado a lado ideias opostas.', exemplo: 'O amor e o ódio moram perto.' },
    { nome: 'paradoxo', grupo: 'pensamento', oque: 'Junta ideias contrárias na mesma afirmação.', exemplo: 'É um silêncio ensurdecedor.' },
    { nome: 'ironia', grupo: 'pensamento', oque: 'Diz o contrário do que se quer dizer.', exemplo: 'Que bela hora de chegar, só três horas atrasado.' },
    { nome: 'eufemismo', grupo: 'pensamento', oque: 'Suaviza uma ideia dura.', exemplo: 'Ele partiu desta para melhor.' },
    { nome: 'hipérbole', grupo: 'pensamento', oque: 'Exagera de propósito.', exemplo: 'Estou morrendo de fome.' },
    { nome: 'prosopopeia', grupo: 'pensamento', oque: 'Dá ação humana a coisa ou bicho. Também se chama personificação.', exemplo: 'O vento sussurrou meu nome.' },
    { nome: 'gradação', grupo: 'pensamento', oque: 'Enfileira ideias em escala crescente ou decrescente.', exemplo: 'Chegou, viu, venceu.' },
    { nome: 'apóstrofe', grupo: 'pensamento', oque: 'Chama alguém ou alguma coisa no meio do texto.', exemplo: 'Ó Deus, escuta-me!' },
    { nome: 'aliteração', grupo: 'som', oque: 'Repete o mesmo som de consoante.', exemplo: 'O rato roeu a roupa do rei de Roma.' },
    { nome: 'assonância', grupo: 'som', oque: 'Repete o mesmo som de vogal.', exemplo: 'Sou um mulato nato no sentido lato.' },
    { nome: 'onomatopeia', grupo: 'som', oque: 'Imita um som com a palavra.', exemplo: 'Tic-tac, miau, zum-zum.' },
    { nome: 'paronomásia', grupo: 'som', oque: 'Aproxima palavras parecidas no som e diferentes no sentido.', exemplo: 'Conheço o meu lugar e o lugar-comum.' },
    { nome: 'elipse', grupo: 'construção', oque: 'Omite um termo que se entende pelo contexto.', exemplo: 'Na sala, apenas três pessoas. (havia)' },
    { nome: 'zeugma', grupo: 'construção', oque: 'Omite um termo já dito antes.', exemplo: 'Ele gosta de café; ela, de chá.' },
    { nome: 'pleonasmo', grupo: 'construção', oque: 'Repete uma ideia de propósito, para reforçar.', exemplo: 'Vi com estes olhos que a terra há de comer.' },
    { nome: 'polissíndeto', grupo: 'construção', oque: 'Repete o conectivo muitas vezes.', exemplo: 'E corre, e grita, e chora, e ri.' },
    { nome: 'assíndeto', grupo: 'construção', oque: 'Tira os conectivos e usa só vírgula.', exemplo: 'Chegou, sentou, comeu, saiu.' },
    { nome: 'anáfora', grupo: 'construção', oque: 'Repete a mesma palavra no começo de versos ou frases.', exemplo: 'Tudo passa, tudo cansa, tudo fica.' },
    { nome: 'hipérbato', grupo: 'construção', oque: 'Inverte a ordem natural da frase.', exemplo: 'Dos filhos deste solo és mãe gentil.' },
    { nome: 'silepse', grupo: 'construção', oque: 'A concordância vai pela ideia, não pela palavra.', exemplo: 'Os brasileiros somos otimistas.' },
    { nome: 'anacoluto', grupo: 'construção', oque: 'Começa de um jeito e termina de outro, deixando um termo solto.', exemplo: 'A vida, eu já não sei o que fazer dela.' }
]
const FIGURA_POR_NOME = new Map(FIGURAS.map(f => [normal(f.nome), f]))

const OPOSTOS = [['amor', 'ódio'], ['vida', 'morte'], ['alegria', 'tristeza'], ['bem', 'mal'],
    ['céu', 'inferno'], ['dia', 'noite'], ['guerra', 'paz'], ['rico', 'pobre'], ['claro', 'escuro'],
    ['calor', 'frio'], ['cedo', 'tarde'], ['fraco', 'forte'], ['começo', 'fim']]
const ONOMATOPEIAS = ['tic', 'tac', 'miau', 'au', 'zum', 'plaft', 'buá', 'crash', 'bum', 'toc', 'pá', 'blim']

/** Procura figuras de linguagem na frase da pessoa. */
function acharFiguras(frase) {
    const texto = String(frase ?? '').trim()
    const baixo = normal(texto)
    const ps = palavrasDe(texto)
    const achadas = []
    const marca = (nome, porque) => {
        if (!achadas.some(a => a.nome === nome)) achadas.push({ nome, porque, ficha: FIGURA_POR_NOME.get(normal(nome)) })
    }

    // Tudo é comparado SEM acento, dos dois lados: "é" contra "e", "ódio"
    // contra "odio". Comparar texto normalizado com padrão acentuado foi o
    // erro que fez a metáfora e a antítese não aparecerem.
    const tem = (...formas) => formas.some(f => regexPalavra(normal(f), 'iu').test(baixo))
    if (tem('como', 'tal qual', 'que nem', 'feito')) marca('comparação', 'Achei um conectivo de comparação ligando duas coisas.')
    // Aqui a comparação é feita no texto ORIGINAL, com acento: "é" não pode
    // virar "e", senão todo "e o" da vida vira metáfora.
    else if (/(^|[^\p{L}])(é|era|são|eram)\s+(um|uma|o|a)([^\p{L}]|$)/iu.test(texto)) marca('metáfora', 'Uma coisa está sendo dita como se fosse outra, sem conectivo.')
    if (/(morrendo de|mil vezes|um milhao|chorar rios|seculos|infinitas)/i.test(baixo)) marca('hipérbole', 'Tem exagero declarado, daqueles que ninguém entende ao pé da letra.')
    if (/(partiu desta para melhor|descansou em paz|nos deixou|faltou com a verdade)/i.test(baixo)) marca('eufemismo', 'A ideia dura está suavizada por uma expressão mais macia.')
    for (const [a, b] of OPOSTOS) {
        if (regexPalavra(normal(a), 'iu').test(baixo) && regexPalavra(normal(b), 'iu').test(baixo)) {
            marca('antítese', 'As palavras "' + a + '" e "' + b + '" são opostas e estão na mesma frase.')
            break
        }
    }
    if (ONOMATOPEIAS.some(o => regexPalavra(normal(o), 'iu').test(baixo))) marca('onomatopeia', 'Tem palavra que imita som.')
    const iniciais = ps.map(p => normal(p).charAt(0)).filter(Boolean)
    const conta = {}
    for (const i of iniciais) conta[i] = (conta[i] || 0) + 1
    const repetida = Object.entries(conta).find(([l, q]) => q >= 3 && !'aeiou'.includes(l))
    if (repetida && ps.length >= 4) marca('aliteração', 'A consoante "' + repetida[0].toUpperCase() + '" abre ' + repetida[1] + ' palavras seguidas.')
    const naturezas = ['vento', 'sol', 'lua', 'chuva', 'mar', 'noite', 'cidade', 'tempo', 'coração', 'estrela', 'flor']
    const acoesHumanas = ['sussurr', 'chor', 'ri', 'grit', 'cant', 'abraç', 'convers', 'dorm', 'acord', 'olh']
    if (naturezas.some(nat => regexPalavra(normal(nat), 'iu').test(baixo)) && acoesHumanas.some(a => baixo.includes(normal(a)))) {
        marca('prosopopeia', 'Uma coisa sem vida está fazendo o que só gente faz.')
    }
    if ((baixo.match(/(^|\s)e(\s|$)/g) || []).length >= 3) marca('polissíndeto', 'O conectivo E aparece repetido de propósito.')
    const primeiras = frasesDe(texto).map(f => normal(palavrasDe(f)[0] || ''))
    if (primeiras.length >= 2 && primeiras[0] && primeiras[0] === primeiras[1]) marca('anáfora', 'As frases começam com a mesma palavra.')
    return { frase: texto, achadas }
}

const VICIOS = [
    { nome: 'pleonasmo vicioso', oque: 'Repete a ideia sem precisar.', exemplos: ['subir para cima', 'entrar para dentro', 'elo de ligação', 'certeza absoluta', 'há anos atrás', 'sair para fora', 'monopólio exclusivo', 'planos para o futuro', 'surpresa inesperada', 'todos foram unânimes', 'detalhes minuciosos', 'principal protagonista', 'comparecer em pessoa', 'conviver junto', 'repetir de novo', 'criar um novo', 'encarar de frente'] },
    { nome: 'barbarismo', oque: 'Erra a forma da palavra.', exemplos: ['menas', 'seje', 'mendingo', 'previlégio', 'frustado', 'cabeleileiro', 'asteristico', 'rúbrica'] },
    { nome: 'solecismo', oque: 'Erra a construção da frase.', exemplos: ['fazem dois anos', 'houveram problemas', 'vende-se casas', 'a gente vamos', 'me empresta'] },
    { nome: 'ambiguidade', oque: 'A frase permite duas leituras.', exemplos: ['o filho de João disse que seu carro quebrou', 'encontrei a irmã dela na casa dela'] },
    { nome: 'cacofonia', oque: 'Junção de palavras que forma som ruim.', exemplos: ['por cada', 'boca dela', 'ela tinha', 'vou-me já', 'nunca gostei dela'] },
    { nome: 'eco', oque: 'Terminações iguais em sequência.', exemplos: ['a distribuição da produção da instituição', 'realmente, totalmente, naturalmente'] },
    { nome: 'gerundismo', oque: 'Futuro dito com gerúndio sem necessidade.', exemplos: ['vou estar enviando', 'vamos estar verificando', 'vou estar transferindo'] },
    { nome: 'estrangeirismo', oque: 'Palavra estrangeira onde existe uma nossa.', exemplos: ['deletar (apagar)', 'printar (imprimir)', 'feedback (retorno)', 'deadline (prazo)'] }
]

/** Procura vícios de linguagem no texto. */
function acharVicios(texto) {
    const t = String(texto ?? '')
    const alvo = tirarAcento(t).toLowerCase()
    const achados = []
    for (const vicio of VICIOS) {
        for (const ex of vicio.exemplos) {
            const chave = tirarAcento(ex.split(' (')[0]).toLowerCase()
            const re = new RegExp(BORDA_ESQ + escapar(chave).replace(/\s+/g, '\\s+') + BORDA_DIR, 'iu')
            if (re.test(alvo)) {
                achados.push({ vicio: vicio.nome, trecho: ex, oque: vicio.oque })
                break
            }
        }
    }
    if (/\b(vou|vamos|vai|vão)\s+estar\s+\w+ndo\b/i.test(t)) {
        if (!achados.some(a => a.vicio === 'gerundismo')) achados.push({ vicio: 'gerundismo', trecho: 'vou estar fazendo', oque: 'Futuro dito com gerúndio sem necessidade.' })
    }
    if (/h[aá]\s+[\p{L}\p{N}]{1,12}\s+(anos|meses|dias|semanas)\s+atr[aá]s/iu.test(t)) {
        achados.push({ vicio: 'pleonasmo vicioso', trecho: 'há ... atrás', oque: 'HÁ já diz que o tempo passou; ATRÁS repete a mesma ideia.' })
    }
    const mentes = (t.match(/mente(\s|[.,;:!?]|$)/gi) || []).length
    if (mentes >= 2) achados.push({ vicio: 'eco', trecho: mentes + ' palavras terminadas em -MENTE', oque: 'Terminações iguais em sequência cansam quem lê.' })
    return { texto: t, achados }
}

// ═══════════════════════════════════════════════════════════════════════════
// REDAÇÃO
// ═══════════════════════════════════════════════════════════════════════════

const COMPETENCIAS = [
    {
        n: 1, nome: 'Domínio da norma culta',
        oque: 'Escrever de acordo com a gramática da escrita formal: ortografia, concordância, regência, pontuação e crase.',
        ganha: ['Frases curtas e claras: período longo é onde o erro se esconde.',
            'Ponto final no lugar de vírgula quando a ideia terminou.',
            'Releia trocando cada "que" por um ponto: se a frase continuar de pé, ganhou clareza.'],
        perde: ['Vírgula entre sujeito e verbo.', 'Crase antes de palavra masculina ou de verbo.',
            'Concordância pelo som ("fazem dois anos", "houveram problemas").', 'Marca de oralidade: "pra", "né", "tipo", "a gente".']
    },
    {
        n: 2, nome: 'Compreender a proposta e o tema',
        oque: 'Escrever dissertação argumentativa sobre o tema dado, sem fugir e sem tangenciar, usando repertório de outras áreas.',
        ganha: ['Repita palavras-chave do tema no primeiro e no último parágrafo.',
            'Traga repertório legitimado: lei, dado oficial, filósofo, obra, fato histórico.',
            'Diga de que jeito o repertório se liga ao tema, em uma frase.'],
        perde: ['Fugir do tema: zero na redação inteira.', 'Tangenciar: falar do assunto geral e não do recorte pedido.',
            'Repertório solto, citado e abandonado.', 'Escrever poema, carta ou narrativa em vez de dissertação.']
    },
    {
        n: 3, nome: 'Selecionar e organizar argumentos',
        oque: 'Defender um ponto de vista com argumentos organizados, sem contradição e sem repetir a mesma ideia.',
        ganha: ['Um argumento por parágrafo, anunciado na primeira frase.',
            'Ligue causa e consequência de forma explícita.',
            'Feche cada parágrafo retomando a tese.'],
        perde: ['Dois parágrafos dizendo a mesma coisa com outras palavras.',
            'Argumento de senso comum sem nenhuma prova.', 'Contradizer no terceiro parágrafo o que disse no primeiro.']
    },
    {
        n: 4, nome: 'Coesão: amarrar o texto',
        oque: 'Usar conectivos e retomadas para que um parágrafo puxe o outro e uma frase puxe a seguinte.',
        ganha: ['Comece cada parágrafo com um conectivo diferente.',
            'Troque a repetição da palavra por sinônimo, pronome ou expressão que retome.',
            'Use conectivo dentro do parágrafo, não só no começo.'],
        perde: ['Começar três parágrafos com "Além disso".', 'Repetir o mesmo substantivo cinco vezes no parágrafo.',
            'Conectivo trocado: usar "portanto" onde a ideia é de oposição.']
    },
    {
        n: 5, nome: 'Proposta de intervenção',
        oque: 'Propor uma solução para o problema com agente, ação, meio, finalidade e detalhamento, respeitando os direitos humanos.',
        ganha: ['Cinco elementos completos, em uma ou duas frases bem construídas.',
            'Agente concreto: Ministério da Educação, escolas, mídia, famílias.',
            'Detalhamento é o "como exatamente": explique um dos elementos.'],
        perde: ['Proposta genérica: "o governo deve investir mais".',
            'Faltar um elemento: cada um que falta derruba a nota.',
            'Ferir direitos humanos: pena de morte, tortura, castigo físico.']
    }
]

const CONECTIVOS = {
    adição: ['além disso', 'ademais', 'outrossim', 'ainda', 'não só... mas também', 'em segundo lugar', 'igualmente'],
    oposição: ['entretanto', 'no entanto', 'todavia', 'contudo', 'porém', 'em contrapartida', 'por outro lado', 'apesar disso'],
    causa: ['porque', 'visto que', 'uma vez que', 'já que', 'em virtude de', 'devido a', 'por conta de'],
    consequência: ['por isso', 'de modo que', 'de forma que', 'tanto que', 'consequentemente', 'como resultado'],
    conclusão: ['portanto', 'logo', 'assim', 'dessa forma', 'diante do exposto', 'em suma', 'por conseguinte'],
    explicação: ['ou seja', 'isto é', 'em outras palavras', 'a saber', 'vale dizer'],
    comparação: ['assim como', 'da mesma forma', 'tal qual', 'analogamente', 'mais do que', 'menos do que'],
    tempo: ['atualmente', 'hodiernamente', 'outrora', 'em seguida', 'posteriormente', 'desde então', 'enquanto isso'],
    condição: ['se', 'caso', 'desde que', 'contanto que', 'a menos que', 'salvo se'],
    finalidade: ['para que', 'a fim de que', 'com o intuito de', 'com o propósito de', 'visando a'],
    exemplificação: ['por exemplo', 'a título de exemplo', 'como é o caso de', 'a exemplo de', 'tal como'],
    ênfase: ['sobretudo', 'principalmente', 'em especial', 'acima de tudo', 'de fato', 'com efeito']
}

const REPERTORIOS = {
    educação: [
        'Constituição de 1988, artigo 205: a educação é direito de todos e dever do Estado e da família.',
        'Paulo Freire, em Pedagogia do Oprimido: educação como prática da liberdade, não como depósito de conteúdo.',
        'Lei de Diretrizes e Bases da Educação (Lei 9.394/1996), que organiza a educação básica no país.',
        'Dados do Censo Escolar (INEP) sobre evasão no ensino médio.'
    ],
    'meio ambiente': [
        'Acordo de Paris (2015): compromisso de conter o aquecimento abaixo de 2 graus.',
        'Constituição de 1988, artigo 225: todos têm direito ao meio ambiente ecologicamente equilibrado.',
        'Conferência Rio-92 e a ideia de desenvolvimento sustentável.',
        'Relatórios do IPCC sobre mudanças climáticas.'
    ],
    saúde: [
        'Constituição de 1988, artigo 196: saúde é direito de todos e dever do Estado, o que funda o SUS.',
        'Organização Mundial da Saúde: saúde é bem-estar físico, mental e social, e não só ausência de doença.',
        'Lei 10.216/2001, da reforma psiquiátrica, no debate sobre saúde mental.',
        'Dados do Ministério da Saúde sobre cobertura vacinal.'
    ],
    tecnologia: [
        'Zygmunt Bauman e a ideia de modernidade líquida: relações rápidas e frágeis.',
        'Lei Geral de Proteção de Dados (Lei 13.709/2018).',
        'O documentário O Dilema das Redes, sobre algoritmos e atenção.',
        'Marco Civil da Internet (Lei 12.965/2014).'
    ],
    violência: [
        'Lei Maria da Penha (Lei 11.340/2006), no debate sobre violência doméstica.',
        'Anuário Brasileiro de Segurança Pública, com dados anuais de homicídio.',
        'Michel Foucault, em Vigiar e Punir: a punição como espetáculo e como controle.',
        'Estatuto do Desarmamento (Lei 10.826/2003).'
    ],
    trabalho: [
        'Consolidação das Leis do Trabalho (CLT), de 1943.',
        'Karl Marx e a ideia de alienação do trabalhador em relação ao que produz.',
        'Dados do IBGE sobre desemprego e informalidade (PNAD Contínua).',
        'Convenção 190 da OIT, sobre assédio no trabalho.'
    ],
    cultura: [
        'Constituição de 1988, artigo 215: o Estado garante o acesso às fontes da cultura nacional.',
        'Semana de Arte Moderna de 1922 e a busca de uma identidade brasileira.',
        'Lei Rouanet (Lei 8.313/1991), de incentivo à cultura.',
        'Darcy Ribeiro, em O Povo Brasileiro, sobre a formação da nossa identidade.'
    ],
    'direitos humanos': [
        'Declaração Universal dos Direitos Humanos (ONU, 1948), artigo 1: todos nascem livres e iguais.',
        'Constituição de 1988, artigo 5: todos são iguais perante a lei.',
        'Hannah Arendt e a ideia de "direito a ter direitos".',
        'Estatuto da Criança e do Adolescente (Lei 8.069/1990).'
    ],
    cidadania: [
        'José Murilo de Carvalho, em Cidadania no Brasil, sobre a cidadania que veio de cima para baixo.',
        'Constituição de 1988, chamada de Constituição Cidadã.',
        'Estatuto da Pessoa com Deficiência (Lei 13.146/2015).',
        'Estatuto do Idoso (Lei 10.741/2003).'
    ],
    mídia: [
        'Pierre Bourdieu, em Sobre a Televisão, sobre o que a mídia escolhe mostrar.',
        'Constituição de 1988, artigo 220: liberdade de informação jornalística.',
        'O conceito de aldeia global, de Marshall McLuhan.',
        'Pesquisa TIC Domicílios, sobre acesso à internet no Brasil.'
    ]
}

const ORALIDADE = ['né', 'tipo', 'daí', 'pra', 'pro', 'a gente', 'cara', 'meio que', 'tá', 'ok',
    'kkk', 'vc', 'pq', 'mano', 'coisa', 'negócio', 'galera', 'muito louco']
const CLICHES = ['desde os primórdios', 'nos dias de hoje', 'o mundo em que vivemos', 'com o advento',
    'é notório', 'infelizmente', 'nos dias atuais', 'desde o início dos tempos', 'a sociedade atual',
    'o ser humano sempre', 'vivemos em um mundo', 'atualmente no brasil']
const PRIMEIRA_PESSOA = ['eu acho', 'eu penso', 'na minha opinião', 'eu acredito', 'acho que', 'no meu ver', 'a meu ver']

/**
 * Raio X do parágrafo: conta, mede e aponta o que costuma tirar nota.
 * Tudo aqui é medida, não opinião — quem decide o que mudar é quem escreveu.
 */
function analisarParagrafo(texto) {
    const t = String(texto ?? '').trim()
    const palavras = palavrasDe(t)
    const frases = frasesDe(t)
    const caracteres = t.length
    const linhas = Math.max(1, Math.ceil(caracteres / 45))
    const longas = frases
        .map(f => ({ frase: f, n: palavrasDe(f).length }))
        .filter(f => f.n > 25)

    const vazias = new Set(['de', 'da', 'do', 'das', 'dos', 'a', 'o', 'as', 'os', 'e', 'em', 'no', 'na',
        'nos', 'nas', 'que', 'por', 'para', 'com', 'um', 'uma', 'se', 'ao', 'aos', 'mais', 'como',
        'ser', 'ter', 'é', 'não', 'sua', 'seu', 'isso', 'ou', 'the', 'à', 'às', 'pelo', 'pela'])
    const conta = new Map()
    for (const p of palavras) {
        const k = normal(p)
        if (k.length < 4 || vazias.has(k)) continue
        const atual = conta.get(k) || { palavra: p, n: 0 }
        atual.n++
        conta.set(k, atual)
    }
    const repetidas = [...conta.values()].filter(r => r.n >= 3).sort((a, b) => b.n - a.n).slice(0, 6)

    // Tudo com borda de palavra: sem isso "professor" acusava a gíria "pro" e
    // "sem" acusava o conectivo "se".
    const alvo = normal(t)
    const contem = (m) => new RegExp(BORDA_ESQ + escapar(normal(m)).replace(/\s+/g, '\\s+') + BORDA_DIR, 'iu').test(alvo)
    const achar = (lista) => lista.filter(contem)
    const oralidade = achar(ORALIDADE)
    const cliches = achar(CLICHES)
    const pessoal = achar(PRIMEIRA_PESSOA)

    const usados = []
    for (const [funcao, lista] of Object.entries(CONECTIVOS)) {
        for (const c of lista) {
            if (contem(c)) { usados.push(funcao + ': ' + c); break }
        }
    }
    return {
        texto: t, palavras: palavras.length, frases: frases.length, caracteres, linhas,
        mediaPorFrase: frases.length ? Math.round(palavras.length / frases.length) : 0,
        longas, repetidas, oralidade, cliches, pessoal, conectivos: usados
    }
}

/** Monta uma tese possível a partir do tema digitado. */
function montarTese(tema) {
    const t = String(tema ?? '').trim().replace(/[.:;]+$/, '')
    const limpo = t.replace(/^(o|a|os|as)\s+/i, '')
    return {
        tema: t,
        tese: 'O problema de ' + limpo + ' persiste no Brasil porque a ação do poder público é insuficiente e a cultura reproduz o mesmo padrão.',
        formula: 'TEMA + POSIÇÃO + DOIS MOTIVOS. Os dois motivos viram os dois parágrafos de desenvolvimento.',
        passos: [
            '1. Escreva o tema numa frase só, sem enfeite.',
            '2. Responda: isso é um problema? por quê?',
            '3. Liste dois motivos de naturezas diferentes (um estrutural, um cultural).',
            '4. Junte tudo numa frase de até três linhas e ponha no fim da introdução.'
        ],
        erro: 'Tese não é pergunta nem é o tema repetido. Se der para alguém discordar, é tese; se ninguém discorda, é só constatação.'
    }
}

/** Monta o esqueleto de um argumento com o repertório de um tema conhecido. */
function montarArgumento(tema) {
    const t = normal(tema)
    const chave = Object.keys(REPERTORIOS).find(k => t.includes(normal(k))) || null
    const repertorio = chave ? REPERTORIOS[chave] : null
    return {
        tema: String(tema ?? '').trim(), area: chave, repertorio,
        esqueleto: [
            '*1. Tópico frasal:* anuncie o argumento na primeira frase do parágrafo.',
            '*2. Repertório:* lei, dado, autor ou fato histórico que sustenta a ideia.',
            '*3. Costura:* uma frase explicando o que aquele repertório prova.',
            '*4. Consequência:* o que acontece no mundo real por causa disso.',
            '*5. Fechamento:* retome a tese em uma frase.'
        ]
    }
}

/** Monta a proposta de intervenção com os cinco elementos. */
function montarIntervencao(tema) {
    const t = String(tema ?? '').trim().replace(/[.:;]+$/, '') || 'o problema discutido'
    return {
        tema: t,
        elementos: [
            ['Agente', 'quem faz — Ministério da Educação, escolas, mídia, famílias, Congresso'],
            ['Ação', 'o que faz — criar, ampliar, fiscalizar, promover campanhas'],
            ['Meio ou modo', 'como faz — por meio de verba, de aulas, de mídia, de parceria'],
            ['Finalidade', 'para quê — a fim de reduzir, garantir, conscientizar'],
            ['Detalhamento', 'o "como exatamente" de um dos elementos acima']
        ],
        modelo: 'O Ministério da Educação, portanto, deve promover campanhas sobre ' + t +
            ', por meio de oficinas nas escolas públicas, a fim de formar cidadãos capazes de reconhecer o problema; ' +
            'as oficinas seriam dadas por professores da própria rede, com material produzido por universidades parceiras.',
        conferencia: 'Passe o dedo: agente? ação? meio? finalidade? detalhamento? Faltou um, perdeu nota.'
    }
}

const MODELOS_TEXTO = {
    carta: {
        titulo: 'Carta argumentativa',
        partes: ['Local e data, no alto à direita.', 'Vocativo: a quem você escreve (Prezado Senhor Diretor,).',
            'Introdução: quem é você e por que escreve.', 'Desenvolvimento: dois parágrafos com argumentos.',
            'Pedido claro: o que você quer que aconteça.', 'Despedida formal e assinatura.'],
        dica: 'Carta pede tratamento formal do começo ao fim: nada de "oi" nem de emoji.'
    },
    email: {
        titulo: 'E-mail formal',
        partes: ['Assunto curto e específico, em até oito palavras.', 'Saudação: Prezado(a) [nome],',
            'Primeiro parágrafo: o motivo do e-mail em uma frase.', 'Segundo parágrafo: o detalhe necessário.',
            'Pedido ou próximo passo, com prazo.', 'Fechamento: Atenciosamente, seu nome e contato.'],
        dica: 'Quem lê decide em dez segundos: ponha o pedido no primeiro parágrafo, não no último.'
    },
    resumo: {
        titulo: 'Resumo',
        partes: ['Leia inteiro antes de escrever uma linha.', 'Marque a ideia principal de cada parágrafo.',
            'Escreva com suas palavras, sem copiar frases.', 'Mantenha a ordem das ideias do original.',
            'Não opine: resumo não julga.', 'Feche com o ponto de chegada do autor.'],
        dica: 'Resumo bom cabe em um quinto do original e ainda faz sentido para quem não leu o texto.'
    },
    resenha: {
        titulo: 'Resenha crítica',
        partes: ['Ficha: autor, título, editora, ano.', 'Resumo curto da obra, sem entregar o final.',
            'Contexto: onde essa obra se encaixa.', 'Análise: o que funciona e o que não funciona, com exemplos.',
            'Julgamento fundamentado.', 'Indicação: para quem serve.'],
        dica: 'Resenha é resumo mais opinião com prova. Opinião sem exemplo é só gosto pessoal.'
    },
    relatorio: {
        titulo: 'Relatório',
        partes: ['Capa ou cabeçalho: título, autor, data, destinatário.', 'Objetivo: por que o relatório existe.',
            'Metodologia: o que foi feito, como e quando.', 'Resultados: os dados, em ordem.',
            'Discussão: o que os dados querem dizer.', 'Conclusão e recomendações.'],
        dica: 'Relatório se escreve em terceira pessoa e no passado: "foram coletadas 40 amostras".'
    },
    requerimento: {
        titulo: 'Requerimento',
        partes: ['Vocativo com o cargo da autoridade (Ilustríssimo Senhor Diretor,).',
            'Identificação completa de quem pede.', 'O pedido, começando por "vem requerer".',
            'A justificativa e a base legal, se houver.', 'Fecho: "Nestes termos, pede deferimento."',
            'Local, data e assinatura.'],
        dica: 'Requerimento é documento: uma folha, uma página, sem adjetivo.'
    },
    artigo: {
        titulo: 'Artigo de opinião',
        partes: ['Título que já revela a posição.', 'Abertura com fato recente ou dado que cria urgência.',
            'Tese explícita no primeiro ou segundo parágrafo.', 'Dois ou três argumentos com prova.',
            'Contra-argumento reconhecido e respondido.', 'Fechamento com um chamado.'],
        dica: 'Artigo de opinião assume o "eu" com tranquilidade, ao contrário da dissertação do ENEM.'
    },
    cronica: {
        titulo: 'Crônica',
        partes: ['Uma cena pequena do dia a dia.', 'Narrador em primeira pessoa, tom de conversa.',
            'Um detalhe observado que ninguém repara.', 'Uma virada ou uma ironia no meio.',
            'Fechamento curto que abre uma reflexão.'],
        dica: 'Crônica é curta por natureza: se passou de uma página, virou conto.'
    }
}

const ERROS_QUE_TIRAM_NOTA = [
    'Fuga do tema: zera a redação inteira, mesmo que o texto seja bonito.',
    'Texto com menos de sete linhas: recebe nota zero por insuficiência.',
    'Cópia dos textos motivadores sem nada de seu: os trechos copiados são descontados.',
    'Proposta de intervenção incompleta ou ausente: perde até 200 pontos.',
    'Desrespeito aos direitos humanos na proposta: zera a competência 5.',
    'Texto em forma de poema, carta ou narrativa: fere o gênero pedido.',
    'Marca de oralidade e gíria: derruba a competência 1.',
    'Repetir "além disso" no começo de todos os parágrafos: derruba a competência 4.',
    'Argumento de senso comum sem repertório: derruba a competência 2.',
    'Letra ilegível: o corretor não adivinha o que não consegue ler.'
]

const CRONOGRAMA_REDACAO = [
    ['5 minutos', 'ler a proposta e os textos motivadores, sublinhando o recorte do tema'],
    ['5 minutos', 'escolher a tese e os dois argumentos, em tópicos'],
    ['5 minutos', 'escolher o repertório de cada argumento'],
    ['25 minutos', 'escrever o rascunho inteiro, sem parar para revisar'],
    ['10 minutos', 'revisar caçando erro de concordância, crase e vírgula'],
    ['10 minutos', 'passar a limpo com letra legível']
]

// ═══════════════════════════════════════════════════════════════════════════
// LITERATURA
// ═══════════════════════════════════════════════════════════════════════════

const ESCOLAS = {
    trovadorismo: {
        nome: 'Trovadorismo', periodo: '1189 a 1418, em Portugal',
        marco: 'A Cantiga da Ribeirinha, de Paio Soares de Taveirós, por volta de 1198.',
        contexto: 'Idade Média, feudalismo e teocentrismo. A poesia nasce cantada, com música.',
        caracteristicas: ['Poesia para ser cantada, não lida.', 'Quatro tipos de cantiga: de amor, de amigo, de escárnio e de maldizer.',
            'Na cantiga de amor, quem fala é o homem, e a mulher é inalcançável.', 'Na cantiga de amigo, quem fala é a mulher, em linguagem simples.',
            'Escárnio é crítica indireta; maldizer é crítica direta, com nome.'],
        autores: ['Paio Soares de Taveirós', 'Dom Dinis', 'Martim Codax', 'João Garcia de Guilhade'],
        obras: ['Cantiga da Ribeirinha', 'Cantigas de Santa Maria', 'Ondas do mar de Vigo']
    },
    humanismo: {
        nome: 'Humanismo', periodo: '1418 a 1527, em Portugal',
        marco: 'Fernão Lopes vira cronista-mor da Torre do Tombo, em 1418.',
        contexto: 'Transição da Idade Média para o Renascimento. O homem passa a ocupar o centro.',
        caracteristicas: ['Prosa histórica com Fernão Lopes.', 'Poesia palaciana, reunida no Cancioneiro Geral de Garcia de Resende (1516).',
            'Teatro de Gil Vicente: crítica social por meio da alegoria.', 'Antropocentrismo convivendo com a fé.'],
        autores: ['Fernão Lopes', 'Gil Vicente', 'Garcia de Resende'],
        obras: ['Auto da Barca do Inferno (1517)', 'Crônica de D. João I', 'Cancioneiro Geral']
    },
    classicismo: {
        nome: 'Classicismo', periodo: '1527 a 1580, em Portugal',
        marco: 'Sá de Miranda volta da Itália trazendo o soneto, em 1527.',
        contexto: 'Renascimento: razão, equilíbrio e volta aos modelos greco-latinos.',
        caracteristicas: ['Soneto decassílabo como forma preferida.', 'Racionalismo e busca da perfeição formal.',
            'Mitologia clássica e temas universais.', 'O amor é medida e conflito, não só sofrimento.'],
        autores: ['Luís de Camões', 'Sá de Miranda', 'Bernardim Ribeiro'],
        obras: ['Os Lusíadas (1572)', 'Sonetos de Camões', 'Menina e Moça']
    },
    quinhentismo: {
        nome: 'Quinhentismo', periodo: '1500 a 1601, no Brasil',
        marco: 'A Carta de Pero Vaz de Caminha, de 1º de maio de 1500.',
        contexto: 'Colonização: não há ainda literatura brasileira, e sim literatura sobre o Brasil.',
        caracteristicas: ['Literatura de informação: relatos do que os portugueses viam.',
            'Literatura de catequese: teatro e poesia para converter os indígenas.',
            'Olhar europeu sobre a terra e sobre quem já morava aqui.'],
        autores: ['Pero Vaz de Caminha', 'José de Anchieta', 'Manuel da Nóbrega'],
        obras: ['Carta a El-Rei D. Manuel', 'Auto de São Lourenço', 'Diálogo sobre a Conversão do Gentio']
    },
    barroco: {
        nome: 'Barroco', periodo: '1601 a 1768, no Brasil',
        marco: 'Prosopopeia, de Bento Teixeira, publicada em 1601.',
        contexto: 'Contrarreforma: o homem dividido entre o prazer da carne e o medo do pecado.',
        caracteristicas: ['Conflito permanente: céu e terra, corpo e alma, pecado e perdão.',
            'Cultismo: jogo de palavras e imagens rebuscadas (culto a Góngora).',
            'Conceptismo: jogo de ideias e raciocínio (a marca de Vieira).',
            'Figuras prediletas: antítese, paradoxo, hipérbole e metáfora.'],
        autores: ['Gregório de Matos', 'Padre Antônio Vieira', 'Bento Teixeira'],
        obras: ['Sermão da Sexagésima', 'Poemas satíricos de Gregório de Matos', 'Sermão de Santo Antônio aos Peixes']
    },
    arcadismo: {
        nome: 'Arcadismo', periodo: '1768 a 1836, no Brasil',
        marco: 'Obras Poéticas, de Cláudio Manuel da Costa, em 1768.',
        contexto: 'Iluminismo e Inconfidência Mineira: simplicidade contra o exagero barroco.',
        caracteristicas: ['Fugere urbem: fugir da cidade e viver no campo.', 'Carpe diem: aproveitar o dia de hoje.',
            'Locus amoenus: o lugar ameno, o campo idealizado.', 'Inutilia truncat: cortar o inútil, escrever simples.',
            'Pastores e pastoras como personagens, com nomes gregos.'],
        autores: ['Cláudio Manuel da Costa', 'Tomás Antônio Gonzaga', 'Basílio da Gama', 'Santa Rita Durão'],
        obras: ['Marília de Dirceu (1792)', 'O Uraguai', 'Caramuru']
    },
    romantismo1: {
        nome: 'Romantismo, primeira geração', periodo: '1836 a 1850, no Brasil',
        marco: 'Suspiros Poéticos e Saudades, de Gonçalves de Magalhães, em 1836.',
        contexto: 'Independência recente: era preciso inventar um herói nacional, e ele foi o indígena.',
        caracteristicas: ['Indianismo: o indígena no lugar do cavaleiro medieval europeu.',
            'Nacionalismo ufanista: a natureza brasileira como personagem.', 'Saudade da terra e idealização do passado.',
            'Sentimento acima da razão.'],
        autores: ['Gonçalves Dias', 'José de Alencar', 'Gonçalves de Magalhães'],
        obras: ['Canção do Exílio', 'I-Juca-Pirama', 'O Guarani (1857)', 'Iracema (1865)']
    },
    romantismo2: {
        nome: 'Romantismo, segunda geração', periodo: '1850 a 1860, no Brasil',
        marco: 'Lira dos Vinte Anos, de Álvares de Azevedo, em 1853.',
        contexto: 'Geração byroniana: jovens que morriam cedo e escreviam sobre isso.',
        caracteristicas: ['Mal do século: tédio, angústia e desejo de morte.', 'Egocentrismo e fuga da realidade.',
            'Amor idealizado e nunca realizado.', 'Noite, morte e sonho como cenário.'],
        autores: ['Álvares de Azevedo', 'Casimiro de Abreu', 'Junqueira Freire', 'Fagundes Varela'],
        obras: ['Lira dos Vinte Anos', 'Noite na Taverna', 'Meus Oito Anos']
    },
    romantismo3: {
        nome: 'Romantismo, terceira geração', periodo: '1860 a 1880, no Brasil',
        marco: 'Espumas Flutuantes, de Castro Alves, em 1870.',
        contexto: 'Campanha abolicionista e republicana: a poesia desce da torre e vai para a praça.',
        caracteristicas: ['Poesia condoreira: o condor voa alto e enxerga longe.', 'Denúncia da escravidão.',
            'Tom de discurso, feito para ser declamado.', 'Amor mais sensual e menos idealizado.'],
        autores: ['Castro Alves', 'Tobias Barreto', 'Sousândrade'],
        obras: ['O Navio Negreiro', 'Espumas Flutuantes', 'Vozes d’África']
    },
    realismo: {
        nome: 'Realismo', periodo: 'a partir de 1881, no Brasil',
        marco: 'Memórias Póstumas de Brás Cubas, de Machado de Assis, em 1881.',
        contexto: 'Reação ao Romantismo: a lupa se volta para a hipocrisia da elite.',
        caracteristicas: ['Análise psicológica funda das personagens.', 'Ironia e narrador que conversa com quem lê.',
            'Crítica ao casamento por interesse e à vaidade burguesa.', 'Objetividade: as personagens não são santas nem monstros.'],
        autores: ['Machado de Assis', 'Raul Pompeia', 'Eça de Queirós (Portugal)'],
        obras: ['Memórias Póstumas de Brás Cubas', 'Dom Casmurro (1899)', 'Quincas Borba', 'O Ateneu', 'Os Maias']
    },
    naturalismo: {
        nome: 'Naturalismo', periodo: 'a partir de 1881, no Brasil',
        marco: 'O Mulato, de Aluísio Azevedo, em 1881.',
        contexto: 'Ciência e determinismo: o homem explicado pelo meio, pela raça e pelo momento.',
        caracteristicas: ['Determinismo: o ambiente decide o destino da personagem.',
            'Zoomorfização: gente descrita como bicho.', 'Personagem coletiva: o cortiço inteiro age como um corpo.',
            'Temas que o Romantismo escondia: sexo, doença, miséria.'],
        autores: ['Aluísio Azevedo', 'Adolfo Caminha', 'Júlio Ribeiro'],
        obras: ['O Cortiço (1890)', 'O Mulato', 'Bom-Crioulo']
    },
    parnasianismo: {
        nome: 'Parnasianismo', periodo: '1882 a 1893, no Brasil',
        marco: 'Fanfarras, de Teófilo Dias, em 1882.',
        contexto: 'Poesia de rigor formal, em reação ao derramamento romântico.',
        caracteristicas: ['Arte pela arte: o poema não precisa servir a nada.', 'Culto ao soneto e à rima rica.',
            'Descrição detalhada de objetos e cenas.', 'Vocabulário difícil e mitologia clássica.'],
        autores: ['Olavo Bilac', 'Alberto de Oliveira', 'Raimundo Correia'],
        obras: ['Via Láctea', 'Profissão de Fé', 'As Pombas']
    },
    simbolismo: {
        nome: 'Simbolismo', periodo: '1893 a 1902, no Brasil',
        marco: 'Missal e Broquéis, de Cruz e Sousa, em 1893.',
        contexto: 'Contra o materialismo científico: volta do mistério e do inconsciente.',
        caracteristicas: ['Musicalidade: aliteração e assonância em toda parte.', 'Sinestesia: cruzamento de sensações.',
            'Misticismo e busca do transcendente.', 'Cor branca, névoa e vocabulário vago.'],
        autores: ['Cruz e Sousa', 'Alphonsus de Guimaraens'],
        obras: ['Broquéis', 'Faróis', 'Ismália']
    },
    premodernismo: {
        nome: 'Pré-modernismo', periodo: '1902 a 1922, no Brasil',
        marco: 'Os Sertões, de Euclides da Cunha, e Canaã, de Graça Aranha, ambos de 1902.',
        contexto: 'República velha: o país real aparece na literatura, feio e desigual.',
        caracteristicas: ['Não é escola, é período de transição com autores muito diferentes entre si.',
            'Denúncia social e retrato do Brasil esquecido.', 'Linguagem ainda presa ao passado, temas já modernos.',
            'Personagens marginalizados como protagonistas.'],
        autores: ['Euclides da Cunha', 'Lima Barreto', 'Monteiro Lobato', 'Augusto dos Anjos'],
        obras: ['Os Sertões', 'Triste Fim de Policarpo Quaresma (1915)', 'Urupês', 'Eu (1912)']
    },
    modernismo1: {
        nome: 'Modernismo, primeira fase', periodo: '1922 a 1930, no Brasil',
        marco: 'Semana de Arte Moderna, no Teatro Municipal de São Paulo, em fevereiro de 1922.',
        contexto: 'Centenário da Independência: ruptura barulhenta com o passado.',
        caracteristicas: ['Verso livre, sem métrica nem rima obrigatória.', 'Linguagem coloquial, do jeito que o brasileiro fala.',
            'Humor, paródia e provocação.', 'Antropofagia: engolir a cultura estrangeira e devolver algo nosso.',
            'Busca de uma identidade nacional sem idealização.'],
        autores: ['Mário de Andrade', 'Oswald de Andrade', 'Manuel Bandeira'],
        obras: ['Paulicéia Desvairada (1922)', 'Macunaíma (1928)', 'Manifesto Antropófago (1928)', 'Libertinagem (1930)']
    },
    modernismo2: {
        nome: 'Modernismo, segunda fase', periodo: '1930 a 1945, no Brasil',
        marco: 'O Quinze, de Rachel de Queiroz, e Alguma Poesia, de Drummond, ambos de 1930.',
        contexto: 'Era Vargas, crise de 1929 e Segunda Guerra: a literatura vira denúncia social.',
        caracteristicas: ['Romance de 30: seca, cana-de-açúcar, miséria e migração.', 'Regionalismo sem pitoresco: a dureza sem enfeite.',
            'Poesia madura e reflexiva, com Drummond e Cecília.', 'Personagens reduzidos à condição animal pela fome.'],
        autores: ['Graciliano Ramos', 'Jorge Amado', 'Rachel de Queiroz', 'José Lins do Rego', 'Carlos Drummond de Andrade', 'Cecília Meireles'],
        obras: ['Vidas Secas (1938)', 'São Bernardo (1934)', 'Capitães da Areia (1937)', 'Menino de Engenho', 'Romanceiro da Inconfidência']
    },
    modernismo3: {
        nome: 'Modernismo, terceira fase', periodo: '1945 a 1960, no Brasil',
        marco: 'A geração de 45 e, em 1956, Grande Sertão: Veredas.',
        contexto: 'Depois da guerra: volta do rigor formal e experimentação com a linguagem.',
        caracteristicas: ['Poesia de construção, com João Cabral: o poema como engenharia.',
            'Prosa intimista de Clarice: o que acontece por dentro.', 'Invenção de linguagem em Guimarães Rosa.',
            'Fim da fase de ruptura: a modernidade já está dentro de casa.'],
        autores: ['João Cabral de Melo Neto', 'Clarice Lispector', 'Guimarães Rosa'],
        obras: ['Morte e Vida Severina (1955)', 'Grande Sertão: Veredas (1956)', 'A Hora da Estrela (1977)']
    },
    contemporanea: {
        nome: 'Literatura contemporânea', periodo: 'de 1960 até hoje',
        marco: 'A poesia concreta do grupo Noigandres e, depois, a poesia marginal dos anos 1970.',
        contexto: 'Ditadura, redemocratização e internet: muitas vozes ao mesmo tempo, sem escola única.',
        caracteristicas: ['Pluralidade: não há um estilo dominante.', 'Poesia visual e concretismo.',
            'Literatura urbana e violenta, com Rubem Fonseca.', 'Vozes antes silenciadas ganham espaço: periferia, mulheres, autores negros e indígenas.'],
        autores: ['Ferreira Gullar', 'Rubem Fonseca', 'Lygia Fagundes Telles', 'Conceição Evaristo', 'Milton Hatoum', 'Itamar Vieira Junior'],
        obras: ['Poema Sujo', 'Feliz Ano Novo', 'Becos da Memória', 'Dois Irmãos', 'Torto Arado (2019)']
    },
    realismoportugues: {
        nome: 'Realismo português', periodo: '1865 a 1890, em Portugal',
        marco: 'A Questão Coimbrã, em 1865, e as Conferências do Cassino, em 1871.',
        contexto: 'Geração de 70: um grupo de intelectuais decide sacudir Portugal.',
        caracteristicas: ['Crítica feroz ao clero, à nobreza e à burguesia.', 'Ironia fina de Eça de Queirós.',
            'Retrato da decadência de uma família como retrato do país.', 'Personagens que se enganam e se traem.'],
        autores: ['Eça de Queirós', 'Antero de Quental', 'Ramalho Ortigão'],
        obras: ['O Primo Basílio (1878)', 'Os Maias (1888)', 'O Crime do Padre Amaro']
    },
    modernismoportugues: {
        nome: 'Modernismo português', periodo: 'a partir de 1915, em Portugal',
        marco: 'A revista Orpheu, de 1915.',
        contexto: 'Fernando Pessoa e os heterônimos mudam o que se entende por autor.',
        caracteristicas: ['Heterônimos: Alberto Caeiro, Ricardo Reis, Álvaro de Campos, cada um com estilo próprio.',
            'Fingimento poético: "O poeta é um fingidor".', 'Sensacionismo e verso livre.',
            'Mensagem (1934) retoma o mito de Portugal.'],
        autores: ['Fernando Pessoa', 'Mário de Sá-Carneiro', 'Almada Negreiros'],
        obras: ['Mensagem (1934)', 'Orpheu', 'A Confissão de Lúcio']
    }
}

const OBRAS = {
    domcasmurro: {
        titulo: 'Dom Casmurro', autor: 'Machado de Assis', ano: 1899, escola: 'Realismo', genero: 'Romance',
        enredo: 'Bento Santiago, já velho, escreve a própria história para "atar as duas pontas da vida". Conta o amor de infância com Capitu, o seminário, o casamento e a suspeita de traição com o amigo Escobar.',
        personagens: ['Bentinho (Dom Casmurro), o narrador', 'Capitu, dos olhos de ressaca', 'Escobar, o amigo', 'José Dias, o agregado', 'Dona Glória, a mãe que fez a promessa'],
        temas: ['ciúme', 'narrador não confiável', 'memória', 'hipocrisia social'],
        porqueCai: 'O ponto da prova nunca é se Capitu traiu: é que só temos a versão de Bentinho. O narrador é advogado, parte interessada e juiz do próprio caso.'
    },
    memoriaspostumas: {
        titulo: 'Memórias Póstumas de Brás Cubas', autor: 'Machado de Assis', ano: 1881, escola: 'Realismo', genero: 'Romance',
        enredo: 'Brás Cubas escreve as memórias depois de morto. Conta a vida inteira sem nenhuma conquista real: o amor com Virgília, a política que não deu certo, o emplasto que nunca inventou.',
        personagens: ['Brás Cubas, o defunto autor', 'Virgília, o amor adúltero', 'Quincas Borba, o filósofo do Humanitismo', 'Marcela, que o amou por quinze meses e onze contos de réis'],
        temas: ['ironia', 'vaidade', 'morte', 'crítica à elite escravocrata'],
        porqueCai: 'É o marco do Realismo no Brasil. O último capítulo, com o balanço de "não tive filhos, não transmiti a nenhuma criatura o legado da nossa miséria", é cobrado direto.'
    },
    ocortico: {
        titulo: 'O Cortiço', autor: 'Aluísio Azevedo', ano: 1890, escola: 'Naturalismo', genero: 'Romance',
        enredo: 'João Romão enriquece explorando o cortiço que construiu. O cortiço cresce, vira São Romão e engole quem mora nele. Jerônimo, português trabalhador, se degrada ao se envolver com Rita Baiana.',
        personagens: ['João Romão, o dono ganancioso', 'Bertoleza, a escrava explorada', 'Jerônimo e Piedade', 'Rita Baiana', 'Pombinha', 'Firmo'],
        temas: ['determinismo do meio', 'exploração', 'personagem coletiva', 'zoomorfização'],
        porqueCai: 'O cortiço é o verdadeiro protagonista: ele nasce, cresce e devora. É o exemplo de manual de personagem coletiva e de determinismo.'
    },
    iracema: {
        titulo: 'Iracema', autor: 'José de Alencar', ano: 1865, escola: 'Romantismo indianista', genero: 'Romance-poema',
        enredo: 'Iracema, a virgem dos lábios de mel, se apaixona pelo português Martim. Do encontro nasce Moacir, o primeiro cearense, "filho do sofrimento".',
        personagens: ['Iracema', 'Martim', 'Poti, o amigo indígena', 'Moacir, o filho'],
        temas: ['mito de fundação', 'anagrama de América', 'natureza como personagem'],
        porqueCai: 'Iracema é anagrama de América e Moacir representa o brasileiro nascido do encontro entre dois povos. A prosa é poética, quase em verso.'
    },
    oguarani: {
        titulo: 'O Guarani', autor: 'José de Alencar', ano: 1857, escola: 'Romantismo indianista', genero: 'Romance',
        enredo: 'Peri, indígena goitacá, dedica a vida a proteger Cecília, filha do fidalgo português Dom Antônio de Mariz. O cerco dos aimorés e a explosão da casa levam os dois para o rio.',
        personagens: ['Peri', 'Cecília (Ceci)', 'Dom Antônio de Mariz', 'Isabel', 'Loredano, o vilão'],
        temas: ['herói indígena idealizado', 'natureza brasileira', 'lealdade'],
        porqueCai: 'Peri é o cavaleiro medieval vestido de indígena: fiel, casto e sobre-humano. Isso define o indianismo da primeira geração romântica.'
    },
    senhora: {
        titulo: 'Senhora', autor: 'José de Alencar', ano: 1875, escola: 'Romantismo urbano', genero: 'Romance',
        enredo: 'Aurélia herda uma fortuna e compra, sem que ele saiba, o casamento com Fernando Seixas, que a havia trocado por um dote maior. O romance é dividido em Preço, Quitação, Posse e Resgate.',
        personagens: ['Aurélia Camargo', 'Fernando Seixas', 'Lemos, o tutor'],
        temas: ['casamento por interesse', 'dinheiro', 'orgulho ferido'],
        porqueCai: 'É crítica ao casamento como negócio, escrita ainda dentro do Romantismo. Os quatro títulos das partes são vocabulário de compra e venda.'
    },
    memoriassargento: {
        titulo: 'Memórias de um Sargento de Milícias', autor: 'Manuel Antônio de Almeida', ano: 1854, escola: 'Romantismo', genero: 'Romance de costumes',
        enredo: 'Leonardo, filho de uma pisadela e de um beliscão, cresce fazendo travessuras no Rio de D. João VI, entre malandragem e proteção de padrinhos.',
        personagens: ['Leonardo Filho', 'Leonardo Pataca', 'Major Vidigal', 'a Comadre'],
        temas: ['malandragem', 'costumes do Rio colonial', 'ordem e desordem'],
        porqueCai: 'É o primeiro romance malandro da nossa literatura, sem herói idealizado. Antonio Candido estudou nele a dialética da ordem e da desordem.'
    },
    vidassecas: {
        titulo: 'Vidas Secas', autor: 'Graciliano Ramos', ano: 1938, escola: 'Modernismo, segunda fase', genero: 'Romance',
        enredo: 'Fabiano, Sinha Vitória, os dois filhos e a cachorra Baleia fogem da seca. Treze capítulos que podem ser lidos em qualquer ordem, num ciclo que começa e termina em retirada.',
        personagens: ['Fabiano', 'Sinha Vitória', 'o menino mais velho', 'o menino mais novo', 'Baleia', 'Soldado amarelo'],
        temas: ['seca', 'migração', 'linguagem negada', 'animalização'],
        porqueCai: 'A cachorra Baleia é a personagem mais humana do livro, e Fabiano se compara a um bicho. A estrutura circular mostra que a seca não tem fim.'
    },
    saobernardo: {
        titulo: 'São Bernardo', autor: 'Graciliano Ramos', ano: 1934, escola: 'Modernismo, segunda fase', genero: 'Romance',
        enredo: 'Paulo Honório conta como conquistou a fazenda São Bernardo e como destruiu o casamento com Madalena pelo ciúme e pela mania de posse.',
        personagens: ['Paulo Honório', 'Madalena', 'Casimiro Lopes', 'Padilha'],
        temas: ['propriedade', 'coisificação das pessoas', 'narrador em primeira pessoa'],
        porqueCai: 'Paulo Honório trata gente como mercadoria, inclusive a mulher. O livro é a tentativa dele de entender o próprio fracasso.'
    },
    capitaesdaareia: {
        titulo: 'Capitães da Areia', autor: 'Jorge Amado', ano: 1937, escola: 'Modernismo, segunda fase', genero: 'Romance',
        enredo: 'Um grupo de meninos abandonados vive num trapiche em Salvador, entre pequenos furtos e afeto. Pedro Bala lidera; cada um segue um destino diferente.',
        personagens: ['Pedro Bala', 'Professor', 'Gato', 'Sem-Pernas', 'Dora', 'Padre José Pedro'],
        temas: ['infância abandonada', 'desigualdade', 'solidariedade'],
        porqueCai: 'O livro foi queimado em praça pública em 1937. A denúncia social é o centro, e cada menino representa um caminho possível.'
    },
    macunaima: {
        titulo: 'Macunaíma', autor: 'Mário de Andrade', ano: 1928, escola: 'Modernismo, primeira fase', genero: 'Rapsódia',
        enredo: 'Macunaíma, "o herói sem nenhum caráter", nasce no Amazonas, perde a muiraquitã, vai a São Paulo atrás dela e volta para a floresta, virando a constelação da Ursa Maior.',
        personagens: ['Macunaíma', 'Ci, a Mãe do Mato', 'Piaimã (o gigante Venceslau Pietro Pietra)', 'Maanape e Jiguê, os irmãos'],
        temas: ['identidade nacional', 'folclore', 'antropofagia cultural'],
        porqueCai: 'É a síntese do projeto modernista: junta lendas indígenas, provérbios e fala coloquial para desenhar um brasileiro feito de misturas.'
    },
    grandesertao: {
        titulo: 'Grande Sertão: Veredas', autor: 'Guimarães Rosa', ano: 1956, escola: 'Modernismo, terceira fase', genero: 'Romance',
        enredo: 'Riobaldo, jagunço velho, narra em monólogo a vida no sertão, a guerra entre bandos, o suposto pacto com o diabo e o amor por Diadorim, cujo segredo só se revela no fim.',
        personagens: ['Riobaldo', 'Diadorim', 'Joca Ramiro', 'Hermógenes'],
        temas: ['o bem e o mal', 'travessia', 'amor', 'invenção de linguagem'],
        porqueCai: 'A frase "o diabo não há! é o que eu digo... existe é homem humano" resume o livro. A linguagem inventada é o assunto principal da prova.'
    },
    horadaestrela: {
        titulo: 'A Hora da Estrela', autor: 'Clarice Lispector', ano: 1977, escola: 'Modernismo, terceira fase', genero: 'Novela',
        enredo: 'O narrador Rodrigo S.M. conta a vida de Macabéa, nordestina pobre e datilógrafa no Rio, que come cachorro-quente, ouve Rádio Relógio e é atropelada ao sair da cartomante.',
        personagens: ['Macabéa', 'Rodrigo S.M., o narrador', 'Olímpico de Jesus', 'Glória', 'Madama Carlota'],
        temas: ['invisibilidade social', 'narrador que se expõe', 'pobreza sem heroísmo'],
        porqueCai: 'É o último livro de Clarice e o mais social. O narrador homem, criado por uma autora mulher, discute o direito de contar a história de alguém.'
    },
    mortevidasevernina: {
        titulo: 'Morte e Vida Severina', autor: 'João Cabral de Melo Neto', ano: 1955, escola: 'Modernismo, terceira fase', genero: 'Auto de Natal pernambucano',
        enredo: 'Severino desce o rio Capibaribe fugindo da seca, em direção ao Recife. No caminho encontra só morte, até que o nascimento de uma criança devolve algum sentido.',
        personagens: ['Severino, o retirante', 'José, mestre carpina', 'os enterradores'],
        temas: ['migração', 'morte severina', 'esperança mínima'],
        porqueCai: 'O verso é curto, seco e regular, imitando a aridez do tema. O poema usa a redondilha maior, de sete sílabas, a mesma do cordel.'
    },
    ossertoes: {
        titulo: 'Os Sertões', autor: 'Euclides da Cunha', ano: 1902, escola: 'Pré-modernismo', genero: 'Ensaio e reportagem',
        enredo: 'Relato da Guerra de Canudos em três partes: A Terra, O Homem e A Luta. Euclides foi como repórter defender a República e voltou denunciando um massacre.',
        personagens: ['Antônio Conselheiro', 'o sertanejo', 'o exército'],
        temas: ['determinismo', 'Canudos', 'crime da nacionalidade'],
        porqueCai: 'A frase "O sertanejo é, antes de tudo, um forte" é a mais citada da literatura brasileira. O livro mostra um autor mudando de opinião enquanto escreve.'
    },
    policarpo: {
        titulo: 'Triste Fim de Policarpo Quaresma', autor: 'Lima Barreto', ano: 1915, escola: 'Pré-modernismo', genero: 'Romance',
        enredo: 'Policarpo é um patriota ingênuo que quer salvar o Brasil: propõe o tupi como língua oficial, tenta a agricultura e apoia Floriano Peixoto. Acaba preso e fuzilado pela República que defendeu.',
        personagens: ['Policarpo Quaresma', 'Ricardo Coração dos Outros', 'Olga', 'General Albernaz'],
        temas: ['nacionalismo ingênuo', 'crítica à República', 'burocracia'],
        porqueCai: 'É a ironia de um patriota morto pela pátria. Lima Barreto escreve em linguagem simples de propósito, contra o rebuscamento parnasiano.'
    },
    oslusiadas: {
        titulo: 'Os Lusíadas', autor: 'Luís de Camões', ano: 1572, escola: 'Classicismo', genero: 'Epopeia',
        enredo: 'A viagem de Vasco da Gama às Índias serve de fio para contar a história de Portugal, com deuses do Olimpo interferindo na rota.',
        personagens: ['Vasco da Gama', 'Velho do Restelo', 'Adamastor', 'Inês de Castro'],
        temas: ['navegações', 'glória e custo do império', 'mitologia'],
        porqueCai: 'Dez cantos em oitava rima e decassílabos. O Velho do Restelo é a voz que critica a aventura marítima: a autocrítica dentro do próprio elogio.'
    },
    autodabarca: {
        titulo: 'Auto da Barca do Inferno', autor: 'Gil Vicente', ano: 1517, escola: 'Humanismo', genero: 'Teatro alegórico',
        enredo: 'Personagens mortos chegam a um cais e precisam escolher entre a barca do Anjo e a do Diabo. Cada uma representa um vício da sociedade portuguesa.',
        personagens: ['Anjo', 'Diabo', 'Fidalgo', 'Onzeneiro', 'Sapateiro', 'Frade', 'Brísida Vaz', 'Parvo', 'os Cavaleiros'],
        temas: ['crítica social', 'alegoria', 'moral religiosa'],
        porqueCai: 'Só o Parvo e os Cavaleiros se salvam: a inocência e a fé sincera valem mais que o cargo. É a crítica ao clero e à nobreza dentro de uma peça religiosa.'
    },
    osmaias: {
        titulo: 'Os Maias', autor: 'Eça de Queirós', ano: 1888, escola: 'Realismo português', genero: 'Romance',
        enredo: 'Três gerações da família Maia. Carlos da Maia volta a Lisboa cheio de planos e se apaixona por Maria Eduarda, sem saber que ela é sua irmã.',
        personagens: ['Carlos da Maia', 'Afonso da Maia', 'Maria Eduarda', 'João da Ega', 'Pedro da Maia'],
        temas: ['decadência', 'incesto', 'crítica a Portugal', 'diletantismo'],
        porqueCai: 'A queda dos Maias é a queda de Portugal: gente brilhante que não termina nada. A frase final, "não chegámos a tempo", resume o livro.'
    },
    mensagem: {
        titulo: 'Mensagem', autor: 'Fernando Pessoa', ano: 1934, escola: 'Modernismo português', genero: 'Poesia épico-lírica',
        enredo: 'Único livro em português publicado por Pessoa em vida. Em três partes (Brasão, Mar Português, O Encoberto), reconta o mito de Portugal e sonha um Quinto Império.',
        personagens: ['D. Sebastião', 'Ulisses', 'Infante D. Henrique'],
        temas: ['mito nacional', 'saudosismo', 'sebastianismo'],
        porqueCai: 'O verso "Tudo vale a pena se a alma não é pequena" sai daqui, do poema Mar Português.'
    },
    mariliadedirceu: {
        titulo: 'Marília de Dirceu', autor: 'Tomás Antônio Gonzaga', ano: 1792, escola: 'Arcadismo', genero: 'Lírica',
        enredo: 'O pastor Dirceu canta o amor por Marília e, depois da prisão pela Inconfidência, a saudade e a perda da liberdade.',
        personagens: ['Dirceu (o próprio poeta)', 'Marília (Maria Dorotéia Joaquina de Seixas)'],
        temas: ['carpe diem', 'vida simples', 'amor e prisão'],
        porqueCai: 'É o livro mais lido do Arcadismo brasileiro e traz todos os lemas árcades: fugere urbem, carpe diem, inutilia truncat.'
    },
    navionegreiro: {
        titulo: 'O Navio Negreiro', autor: 'Castro Alves', ano: 1869, escola: 'Romantismo, terceira geração', genero: 'Poema',
        enredo: 'O eu lírico sobrevoa o mar e vê, de longe, um navio bonito. Ao se aproximar, descobre o porão cheio de pessoas escravizadas e muda o tom de encanto para horror.',
        personagens: ['o eu lírico', 'as pessoas escravizadas', 'o capitão'],
        temas: ['abolicionismo', 'denúncia', 'poesia condoreira'],
        porqueCai: 'A mudança de ritmo do poema acompanha a descoberta: versos longos e leves no começo, curtos e cortantes no porão.'
    },
    quartodedespejo: {
        titulo: 'Quarto de Despejo', autor: 'Carolina Maria de Jesus', ano: 1960, escola: 'Literatura contemporânea', genero: 'Diário',
        enredo: 'Diário de uma catadora de papel moradora da favela do Canindé, em São Paulo, escrito em cadernos achados no lixo entre 1955 e 1960.',
        personagens: ['Carolina Maria de Jesus', 'os filhos João, José Carlos e Vera'],
        temas: ['fome', 'favela', 'escrita de quem não era lida'],
        porqueCai: 'A imagem do título organiza o livro: a cidade é a sala de visita e a favela é o quarto de despejo. É documento e literatura ao mesmo tempo.'
    },
    tortoarado: {
        titulo: 'Torto Arado', autor: 'Itamar Vieira Junior', ano: 2019, escola: 'Literatura contemporânea', genero: 'Romance',
        enredo: 'As irmãs Bibiana e Belonísia encontram uma faca escondida; o acidente que se segue marca as duas para sempre. A história atravessa gerações de trabalhadores da Fazenda Água Negra.',
        personagens: ['Bibiana', 'Belonísia', 'Zeca Chapéu Grande', 'Santa Rita Pescadeira'],
        temas: ['trabalho análogo à escravidão', 'jarê', 'terra', 'vozes femininas'],
        porqueCai: 'Mostra que a escravidão não terminou em 1888 no campo brasileiro. A narração muda de voz em cada parte, inclusive para uma entidade.'
    }
}

const GLOSSARIO_LITERARIO = [
    ['eu lírico', 'a voz que fala no poema; não é o autor, é uma criação dele'],
    ['narrador onisciente', 'sabe tudo, inclusive o que as personagens pensam'],
    ['narrador observador', 'conta de fora, só o que dá para ver'],
    ['narrador personagem', 'participa da história e conta em primeira pessoa'],
    ['foco narrativo', 'de que ponto a história é contada'],
    ['verso', 'cada linha do poema'],
    ['estrofe', 'grupo de versos separado por espaço'],
    ['rima rica', 'rima entre palavras de classes diferentes'],
    ['rima pobre', 'rima entre palavras da mesma classe'],
    ['rima toante', 'só as vogais coincidem'],
    ['rima consoante', 'vogais e consoantes coincidem'],
    ['soneto', 'poema de catorze versos: dois quartetos e dois tercetos'],
    ['redondilha maior', 'verso de sete sílabas poéticas, o verso do cordel'],
    ['decassílabo', 'verso de dez sílabas poéticas, o verso da epopeia'],
    ['escansão', 'contagem das sílabas poéticas até a última tônica'],
    ['enjambement', 'o sentido do verso continua no verso seguinte'],
    ['prosa', 'texto corrido, sem divisão em versos'],
    ['conto', 'narrativa curta, um conflito só'],
    ['novela', 'narrativa média, vários núcleos em sequência'],
    ['romance', 'narrativa longa, vários conflitos ao mesmo tempo'],
    ['crônica', 'texto curto sobre o cotidiano, entre o jornal e a literatura'],
    ['epopeia', 'poema longo sobre feitos heroicos de um povo'],
    ['clímax', 'o ponto mais tenso da narrativa'],
    ['desfecho', 'como a história se resolve'],
    ['flashback', 'volta ao passado no meio da narrativa'],
    ['in medias res', 'começar a história pelo meio'],
    ['intertextualidade', 'um texto conversando com outro'],
    ['paródia', 'retomada de um texto para subverter o sentido'],
    ['paráfrase', 'retomada de um texto mantendo o sentido'],
    ['epígrafe', 'citação no começo do texto'],
    ['protagonista', 'quem conduz a ação'],
    ['antagonista', 'quem se opõe ao protagonista'],
    ['personagem plana', 'não muda do começo ao fim'],
    ['personagem redonda', 'muda e surpreende'],
    ['tempo cronológico', 'o tempo do relógio e do calendário'],
    ['tempo psicológico', 'o tempo de dentro da personagem, que estica e encolhe'],
    ['espaço', 'o lugar físico onde a história acontece'],
    ['ambiente', 'o espaço mais o clima social e emocional'],
    ['discurso direto', 'a fala da personagem entre travessões ou aspas'],
    ['discurso indireto', 'o narrador conta o que a personagem disse'],
    ['discurso indireto livre', 'a voz do narrador e a da personagem se misturam sem aviso'],
    ['monólogo interior', 'o pensamento da personagem exposto direto'],
    ['fluxo de consciência', 'pensamento sem ordem lógica, como acontece na cabeça'],
    ['estilo de época', 'o conjunto de traços que uma geração de autores compartilha'],
    ['verossimilhança', 'coerência interna: a história tem de fazer sentido no mundo dela'],
    ['catarse', 'a descarga emocional de quem lê ou assiste'],
    ['regionalismo', 'literatura que toma a região como assunto e como linguagem']
]

// ═══════════════════════════════════════════════════════════════════════════
// CATÁLOGO DE OPERAÇÕES
// Cada item vira um comando .portN. A ordem daqui é a numeração lá.
// ═══════════════════════════════════════════════════════════════════════════

/** Atalho para montar uma seção da tela. */
function B(emoji, titulo, linhas) {
    return { emoji, titulo, linhas: (Array.isArray(linhas) ? linhas : [linhas]).filter(Boolean) }
}

/** Mensagem padrão de quando a pessoa manda algo que não dá para analisar. */
function semJeito(oque, exemplo) {
    return B('🤔', 'Não consegui trabalhar isso', [
        'O que você mandou não parece ' + oque + '.',
        'Tente assim: ' + exemplo
    ])
}

const CONJ_TEMPOS = [
    ['presente', 'Presente do indicativo', '🕐'],
    ['perfeito', 'Pretérito perfeito', '⏪'],
    ['imperfeito', 'Pretérito imperfeito', '🔄'],
    ['maisQuePerfeito', 'Pretérito mais-que-perfeito', '⏮️'],
    ['futuroPresente', 'Futuro do presente', '⏩'],
    ['futuroPreterito', 'Futuro do pretérito', '🔮'],
    ['subjPresente', 'Presente do subjuntivo', '🌙'],
    ['subjImperfeito', 'Pretérito imperfeito do subjuntivo', '🌘'],
    ['subjFuturo', 'Futuro do subjuntivo', '🌑']
]

/** Monta a tela de conjugação com os tempos escolhidos. */
function telaConjugacao(entrada, tempos, intro) {
    const c = conjugar(entrada)
    if (!c) return { blocos: [semJeito('um verbo', 'escreva o verbo no infinitivo, como "correr"')] }
    if (c.erro) {
        return {
            intro: 'Preciso do verbo no infinitivo para conjugar.',
            blocos: [semJeito('um verbo no infinitivo', '"' + String(entrada).trim() + '" não termina em AR, ER, IR ou ÔR. Tente "cantar", "vender", "partir" ou "pôr".')]
        }
    }
    const blocos = []
    for (const [campo, nome, emoji] of CONJ_TEMPOS) {
        if (!tempos.includes(campo)) continue
        blocos.push(B(emoji, nome, linhasDeTempo(c[campo])))
    }
    blocos.push(B('📌', 'Sobre este verbo', [c.observacao]))
    return { intro: intro(c), blocos, verbo: c.verbo }
}

const OPS_PORTUGUES = [
    // ── Verbos ────────────────────────────────────────────────────────────
    {
        id: 'conjugar', sub: 'Português', emoji: '🔤', titulo: 'Conjugar um verbo',
        descricao: 'Conjuga o verbo nos tempos que mais caem',
        ajuda: 'Mande um verbo no infinitivo e eu devolvo os tempos principais do indicativo.',
        usage: '<verbo no infinitivo>', examples: ['correr — mostra os tempos do indicativo', 'ser — sai da tabela dos irregulares'],
        run: (t) => telaConjugacao(t, ['presente', 'perfeito', 'imperfeito', 'futuroPresente'],
            c => 'Verbo ' + c.verbo.toUpperCase() + ', ' + (c.irregular ? 'irregular' : 'regular') + ', da ' +
                (c.tipo === 'ar' ? 'primeira' : c.tipo === 'er' ? 'segunda' : 'terceira') + ' conjugação.')
    },
    {
        id: 'conjpresente', sub: 'Português', emoji: '🕐', titulo: 'Presente do indicativo',
        descricao: 'Mostra o presente do indicativo do verbo',
        ajuda: 'O presente do indicativo é o tempo do que acontece agora ou sempre.',
        usage: '<verbo>', examples: ['fazer — eu faço, tu fazes, ele faz'],
        dica: 'Na terceira pessoa do singular mora a maior parte das pegadinhas: "ele quer", "ele tem", "ele vem".',
        run: (t) => telaConjugacao(t, ['presente'], c => 'Presente do indicativo de ' + c.verbo.toUpperCase() + ': o que acontece agora, ou sempre.')
    },
    {
        id: 'conjpassado', sub: 'Português', emoji: '⏪', titulo: 'Os passados do verbo',
        descricao: 'Mostra perfeito, imperfeito e mais-que-perfeito',
        ajuda: 'Português tem três passados, e cada um conta uma coisa diferente.',
        usage: '<verbo>', examples: ['cantar — eu cantei, eu cantava, eu cantara'],
        dica: 'Perfeito é ação acabada (cantei). Imperfeito é ação que durava (cantava). Mais-que-perfeito é passado antes do passado (cantara).',
        run: (t) => telaConjugacao(t, ['perfeito', 'imperfeito', 'maisQuePerfeito'], c => 'Os três passados de ' + c.verbo.toUpperCase() + ', um por um.')
    },
    {
        id: 'conjfuturo', sub: 'Português', emoji: '⏩', titulo: 'Os futuros do verbo',
        descricao: 'Mostra futuro do presente e do pretérito',
        ajuda: 'O futuro do presente é o que vai acontecer; o do pretérito é o que aconteceria.',
        usage: '<verbo>', examples: ['viajar — eu viajarei, eu viajaria'],
        run: (t) => telaConjugacao(t, ['futuroPresente', 'futuroPreterito'], c => 'Os dois futuros de ' + c.verbo.toUpperCase() + '.')
    },
    {
        id: 'conjsubjuntivo', sub: 'Português', emoji: '🌙', titulo: 'Modo subjuntivo',
        descricao: 'Conjuga o verbo nos três tempos do subjuntivo',
        ajuda: 'O subjuntivo é o modo da dúvida, do desejo e da hipótese.',
        usage: '<verbo>', examples: ['ter — que eu tenha, se eu tivesse, quando eu tiver'],
        dica: 'Teste rápido: "que eu ..." é presente, "se eu ..." é imperfeito, "quando eu ..." é futuro.',
        run: (t) => telaConjugacao(t, ['subjPresente', 'subjImperfeito', 'subjFuturo'], c => 'Subjuntivo de ' + c.verbo.toUpperCase() + ': o modo do que ainda não é certo.')
    },
    {
        id: 'conjimperativo', sub: 'Português', emoji: '📣', titulo: 'Modo imperativo',
        descricao: 'Mostra o imperativo afirmativo e o negativo',
        ajuda: 'O imperativo é o modo da ordem, do pedido e do conselho.',
        usage: '<verbo>', examples: ['falar — fala tu, fale você, não fales tu'],
        run: (t) => {
            const c = conjugar(t)
            if (!c || c.erro) return { blocos: [semJeito('um verbo no infinitivo', 'tente "falar", "vir" ou "fazer"')] }
            return {
                intro: 'Imperativo de ' + c.verbo.toUpperCase() + '. Repare que a primeira pessoa não existe: ninguém manda em si mesmo.',
                blocos: [
                    B('✅', 'Imperativo afirmativo', linhasDeTempo(c.imperativoAfirmativo)),
                    B('🚫', 'Imperativo negativo', linhasDeTempo(c.imperativoNegativo)),
                    B('📌', 'Como se forma', [
                        'O afirmativo de TU e VÓS vem do presente do indicativo, sem o S final.',
                        'Todas as outras pessoas vêm do presente do subjuntivo.',
                        'O negativo é todo do subjuntivo, com NÃO na frente.'
                    ])
                ]
            }
        }
    },
    {
        id: 'formasnominais', sub: 'Português', emoji: '🧩', titulo: 'Infinitivo, gerúndio e particípio',
        descricao: 'Mostra as três formas nominais do verbo',
        ajuda: 'As formas nominais não têm pessoa nem tempo: elas funcionam como nome, advérbio ou adjetivo.',
        usage: '<verbo>', examples: ['fazer — fazer, fazendo, feito'],
        run: (t) => {
            const c = conjugar(t)
            if (!c || c.erro) return { blocos: [semJeito('um verbo no infinitivo', 'tente "abrir", "ganhar" ou "escrever"')] }
            return {
                intro: 'Formas nominais de ' + c.verbo.toUpperCase() + '.',
                blocos: [
                    B('📐', 'As três formas', [
                        '*Infinitivo:* ' + c.verbo + ' — funciona como substantivo: "correr faz bem".',
                        '*Gerúndio:* ' + c.gerundio + ' — funciona como advérbio: "saiu correndo".',
                        '*Particípio:* ' + c.participio + ' — funciona como adjetivo: "problema resolvido".'
                    ]),
                    B('⚠️', 'Onde se erra', [
                        'Particípio com TER e HAVER fica invariável: "tinha ganhado".',
                        'Particípio com SER e ESTAR concorda: "foi ganho", "está ganha".',
                        'Alguns verbos têm dois particípios, um regular e um irregular.'
                    ])
                ]
            }
        }
    },
    {
        id: 'infinitivopessoal', sub: 'Português', emoji: '👥', titulo: 'Infinitivo pessoal',
        descricao: 'Mostra o infinitivo flexionado por pessoa',
        ajuda: 'O português tem um infinitivo que se flexiona: "para eu fazer", "para nós fazermos".',
        usage: '<verbo>', examples: ['fazer — para eu fazer, para nós fazermos'],
        dica: 'Flexione quando o sujeito do infinitivo for diferente do sujeito da oração principal.',
        run: (t) => {
            const c = conjugar(t)
            if (!c || c.erro) return { blocos: [semJeito('um verbo no infinitivo', 'tente "chegar" ou "partir"')] }
            return {
                intro: 'Infinitivo pessoal de ' + c.verbo.toUpperCase() + ': é uma marca do português, quase nenhuma língua tem.',
                blocos: [
                    B('👥', 'Flexionado', linhasDeTempo(c.infinitivoPessoal)),
                    B('📌', 'Quando flexionar', [
                        'Quando o infinitivo tem sujeito próprio: "É hora de nós irmos".',
                        'Quando quiser deixar claro quem faz a ação: "Mandei os alunos saírem".',
                        'Não flexione quando o verbo forma locução: "vamos sair", nunca "vamos sairmos".'
                    ])
                ]
            }
        }
    },
    {
        id: 'verbotipo', sub: 'Português', emoji: '🔍', titulo: 'Verbo regular ou irregular',
        descricao: 'Diz se o verbo é regular ou irregular',
        ajuda: 'Verbo regular segue o molde do começo ao fim; irregular muda o radical no caminho.',
        usage: '<verbo>', examples: ['cantar — regular', 'trazer — irregular'],
        run: (t) => {
            const r = tipoDeVerbo(t)
            if (!r) return { blocos: [semJeito('um verbo no infinitivo', 'tente "andar", "perder" ou "pôr"')] }
            const c = conjugar(t)
            return {
                intro: 'O verbo ' + r.verbo.toUpperCase() + ' é ' + r.situacao + '.',
                blocos: [
                    B('📖', 'Por quê', [r.detalhe]),
                    B('🔤', 'Presente do indicativo', linhasDeTempo(c.presente)),
                    B('💡', 'Como reconhecer', [
                        'Conjugue o presente: se o radical muda (eu faço, tu fazes), é irregular.',
                        'Conjugue o pretérito perfeito: "fiz" contra "fazi" mostra a irregularidade na hora.'
                    ])
                ]
            }
        }
    },

    // ── Sílaba, tonicidade e acento ───────────────────────────────────────
    {
        id: 'silabas', sub: 'Português', emoji: '✂️', titulo: 'Separar em sílabas',
        descricao: 'Separa a palavra em sílabas, com a regra',
        ajuda: 'Mande uma palavra e eu separo, mostrando onde cada sílaba começa.',
        usage: '<palavra>', examples: ['coração — co-ra-ção', 'psicologia — psi-co-lo-gi-a'],
        run: (t) => {
            const p = primeiraPalavra(t)
            const s = silabasDe(p)
            if (!s.length) return { blocos: [semJeito('uma palavra', 'mande uma palavra só, como "abacaxi"')] }
            const e = encontrosConsonantais(p)
            return {
                intro: p + ' se separa assim: *' + s.join('-') + '* (' + s.length + ' sílaba' + (s.length > 1 ? 's' : '') + ').',
                blocos: [
                    B('📏', 'Sílaba por sílaba', s.map((x, i) => (i + 1) + '. ' + x)),
                    B('📖', 'Regras que valem aqui', [
                        'Nunca separe os dígrafos CH, LH e NH: bo-lha, ba-nho.',
                        'Separe RR, SS, SC, SÇ e XC: car-ro, nas-cer.',
                        'Não separe os grupos com L e R: pa-tro-a, du-plo.',
                        'Ditongo fica junto; hiato separa: cai-xa, sa-í-da.'
                    ]),
                    e.digrafos.length ? B('🔗', 'Dígrafos nesta palavra', e.digrafos.map(d => '*' + d.letras + '* — ' + d.oque)) : null
                ].filter(Boolean)
            }
        }
    },
    {
        id: 'contarsilabas', sub: 'Português', emoji: '🔢', titulo: 'Contar sílabas',
        descricao: 'Conta as sílabas e classifica pelo número',
        ajuda: 'Conto as sílabas e digo se a palavra é monossílaba, dissílaba, trissílaba ou polissílaba.',
        usage: '<palavra>', examples: ['abacaxi — 4 sílabas, polissílaba'],
        run: (t) => {
            const p = primeiraPalavra(t)
            const s = silabasDe(p)
            if (!s.length) return { blocos: [semJeito('uma palavra', 'mande uma palavra só, como "janela"')] }
            const nomes = ['', 'monossílaba', 'dissílaba', 'trissílaba']
            const classe = s.length >= 4 ? 'polissílaba' : nomes[s.length]
            return {
                intro: p + ' tem *' + s.length + '* sílaba' + (s.length > 1 ? 's' : '') + ': ' + s.join('-') + '. É uma palavra ' + classe + '.',
                blocos: [
                    B('📚', 'A classificação inteira', [
                        '*1 sílaba:* monossílaba — pé, mar, sol.',
                        '*2 sílabas:* dissílaba — ca-sa, ja-nela.',
                        '*3 sílabas:* trissílaba — ca-der-no.',
                        '*4 ou mais:* polissílaba — bi-bli-o-te-ca.'
                    ])
                ]
            }
        }
    },
    {
        id: 'tonica', sub: 'Português', emoji: '🔊', titulo: 'Achar a sílaba tônica',
        descricao: 'Mostra qual sílaba é a mais forte da palavra',
        ajuda: 'A sílaba tônica é a que você fala mais forte. Ela decide o acento.',
        usage: '<palavra>', examples: ['abacate — a sílaba forte é CA'],
        dica: 'Chame a palavra como se estivesse gritando de longe: a sílaba que sai mais forte é a tônica.',
        run: (t) => {
            const p = primeiraPalavra(t)
            const c = classificarTonica(p)
            if (!c) return { blocos: [semJeito('uma palavra', 'mande uma palavra só, como "cadeira"')] }
            const marcada = c.silabas.map((s, i) => i === c.indice ? s.toUpperCase() : s).join('-')
            return {
                intro: 'Em ' + p + ', a sílaba tônica é *' + c.tonica + '*: ' + marcada + '.',
                blocos: [
                    B('📐', 'Como cheguei aí', [
                        c.silabas.length === 1 ? 'A palavra tem uma sílaba só, então ela é a tônica.'
                            : ACENTO_GRAFICO.test(p) ? 'A palavra tem acento gráfico, e o acento sempre marca a sílaba tônica.'
                                : 'Sem acento gráfico, vale a regra: palavra terminada em A, E, O, AM, EM ou ENS é paroxítona; as outras são oxítonas.',
                        'Ela é ' + c.classe + '.'
                    ]),
                    B('💡', 'Para que serve saber isso', [
                        'A regra de acentuação depende inteirinha da sílaba tônica.',
                        'Na poesia, a escansão conta as sílabas até a última tônica.'
                    ])
                ]
            }
        }
    },
    {
        id: 'classetonica', sub: 'Português', emoji: '🏷️', titulo: 'Oxítona, paroxítona ou proparoxítona',
        descricao: 'Classifica a palavra pela posição da tônica',
        ajuda: 'A posição da sílaba forte dá nome à palavra.',
        usage: '<palavra>', examples: ['médico — proparoxítona', 'café — oxítona'],
        run: (t) => {
            const p = primeiraPalavra(t)
            const c = classificarTonica(p)
            if (!c) return { blocos: [semJeito('uma palavra', 'mande uma palavra só, como "árvore"')] }
            return {
                intro: p + ' é *' + c.classe + '*: a sílaba forte é ' + c.tonica + '.',
                blocos: [
                    B('📚', 'As quatro possibilidades', [
                        '*Oxítona:* força na última sílaba — ca-FÉ, ur-u-BU.',
                        '*Paroxítona:* força na penúltima — CA-sa, ca-DEI-ra.',
                        '*Proparoxítona:* força na antepenúltima — MÉ-di-co, LÂM-pa-da.',
                        '*Monossílabo tônico:* uma sílaba só e forte — pé, mar.'
                    ]),
                    B('✂️', 'Separada', [c.silabas.join('-')])
                ]
            }
        }
    },
    {
        id: 'acentuacao', sub: 'Português', emoji: '📝', titulo: 'Por que essa palavra leva acento',
        descricao: 'Explica a regra de acento da palavra digitada',
        ajuda: 'Mande a palavra e eu digo qual regra de acentuação se aplica a ela.',
        usage: '<palavra>', examples: ['fácil — paroxítona terminada em L', 'saída — regra do hiato'],
        run: (t) => {
            const p = primeiraPalavra(t)
            const r = regraDeAcento(p)
            if (!r) return { blocos: [semJeito('uma palavra', 'mande uma palavra só, como "pássaro"')] }
            return {
                intro: p + ' é ' + r.classe + ' e ' + (r.temAcento ? 'leva acento gráfico' : 'não leva acento gráfico') + '.',
                blocos: [
                    B('📖', 'A regra que manda aqui', r.regras),
                    B('✂️', 'Sílabas', [r.silabas.join('-') + ' — a forte é ' + r.tonica]),
                    B('💡', 'Para guardar', [
                        'Proparoxítona: todas levam acento, sem exceção.',
                        'Oxítona: acentua em A, E, O, EM e ENS.',
                        'Paroxítona: acentua quando NÃO termina em A, E, O, AM, EM e ENS.'
                    ])
                ]
            }
        }
    },
    {
        id: 'encontrosvocalicos', sub: 'Português', emoji: '🎵', titulo: 'Ditongo, tritongo e hiato',
        descricao: 'Aponta os encontros vocálicos da palavra',
        ajuda: 'Duas vogais juntas na mesma sílaba formam ditongo; separadas, hiato.',
        usage: '<palavra>', examples: ['saudade — ditongo AU', 'saída — hiato A-Í'],
        run: (t) => {
            const p = primeiraPalavra(t)
            const r = encontrosVocalicos(p)
            if (!r.silabas.length) return { blocos: [semJeito('uma palavra', 'mande uma palavra só, como "herói"')] }
            return {
                intro: p + ' se separa em ' + r.silabas.join('-') + '.',
                blocos: [
                    r.achados.length
                        ? B('🎵', 'Encontros vocálicos', r.achados.map(a => '*' + a.letras + '* em ' + a.silaba + ' — ' + a.tipo))
                        : B('🎵', 'Encontros vocálicos', ['Não achei duas vogais vizinhas nessa palavra.']),
                    B('📚', 'O que é cada um', [
                        '*Ditongo:* duas vogais na mesma sílaba — pai, céu, mãe.',
                        '*Tritongo:* três vogais na mesma sílaba — Pa-ra-guai, sa-guão.',
                        '*Hiato:* duas vogais em sílabas diferentes — sa-í-da, po-e-ta.'
                    ])
                ]
            }
        }
    },
    {
        id: 'encontrosconsonantais', sub: 'Português', emoji: '🧱', titulo: 'Encontros consonantais e dígrafos',
        descricao: 'Mostra dígrafos e grupos de consoantes',
        ajuda: 'Dígrafo é duas letras com um som só; encontro consonantal é duas consoantes com dois sons.',
        usage: '<palavra>', examples: ['chuva — dígrafo CH', 'prato — encontro PR'],
        run: (t) => {
            const p = primeiraPalavra(t)
            const r = encontrosConsonantais(p)
            if (!r.silabas.length) return { blocos: [semJeito('uma palavra', 'mande uma palavra só, como "planta"')] }
            return {
                intro: p + ' se separa em ' + r.silabas.join('-') + '.',
                blocos: [
                    r.digrafos.length ? B('🔗', 'Dígrafos', r.digrafos.map(d => '*' + d.letras + '* — ' + d.oque)) : null,
                    r.grupos.length ? B('🧱', 'Encontros consonantais perfeitos', r.grupos.map(g => '*' + g + '* — não se separa na sílaba')) : null,
                    r.separados.length ? B('✂️', 'Consoantes que se separam', r.separados) : null,
                    B('📚', 'A diferença', [
                        'Dígrafo: duas letras, um som só — CH, LH, NH, RR, SS.',
                        'Encontro consonantal: duas letras, dois sons — PR, BL, TR.',
                        'Cuidado: RR e SS são dígrafos, mas se separam na sílaba.'
                    ])
                ].filter(Boolean)
            }
        }
    },
    {
        id: 'regrahiato', sub: 'Português', emoji: '🪝', titulo: 'Regra do hiato',
        descricao: 'Explica o acento de I e U tônicos no hiato',
        ajuda: 'I e U sozinhos na sílaba, depois de outra vogal, levam acento.',
        usage: '<palavra>', examples: ['saude — vira saúde', 'pais — vira país, se for nação'],
        run: (t) => {
            const p = primeiraPalavra(t)
            const s = silabasDe(p)
            const c = classificarTonica(p)
            const temHiato = s.some((sil, i) => i > 0 && /^[íúiu]s?$/.test(sil))
            return {
                intro: p ? p + ' se separa em ' + s.join('-') + '.' : 'A regra do hiato em duas linhas.',
                blocos: [
                    B('📖', 'A regra', [
                        'I e U tônicos, sozinhos na sílaba (ou só com S), levam acento: sa-í-da, ba-ú, pa-ís, ju-í-za.',
                        'Não acentua se vier NH depois: rai-nha, mo-i-nho.',
                        'Não acentua se o I ou U formar ditongo com a vogal seguinte: fei-u-ra.'
                    ]),
                    p ? B('🔍', 'Nesta palavra', [
                        temHiato ? 'Tem uma sílaba com I ou U sozinho depois de vogal: a regra do hiato se aplica.'
                            : 'Não vi I nem U sozinho em sílaba depois de vogal, então a regra do hiato não entra aqui.',
                        c ? 'Classificação: ' + c.classe + ', tônica em ' + c.tonica + '.' : ''
                    ].filter(Boolean)) : null
                ].filter(Boolean)
            }
        }
    },
    {
        id: 'fichapalavra', sub: 'Português', emoji: '🗂️', titulo: 'Ficha completa da palavra',
        descricao: 'Analisa sílaba, tônica, acento, plural e classe',
        ajuda: 'Mande uma palavra e eu faço a análise inteira dela de uma vez.',
        usage: '<palavra>', examples: ['professor — sílabas, tônica, plural, feminino e classe'],
        run: (t) => {
            const p = primeiraPalavra(t)
            if (!p) return { blocos: [semJeito('uma palavra', 'mande uma palavra só, como "coração"')] }
            const c = classificarTonica(p)
            const r = regraDeAcento(p)
            const pl = pluralDe(p)
            const fem = femininoDe(p)
            const classe = classificarPalavra(p)
            return {
                intro: 'Ficha completa de *' + p + '*.',
                blocos: [
                    B('✂️', 'Forma', [
                        '*Sílabas:* ' + c.silabas.join('-') + ' (' + c.silabas.length + ')',
                        '*Tônica:* ' + c.tonica,
                        '*Classificação:* ' + c.classe
                    ]),
                    B('📝', 'Acento', r.regras.slice(0, 2)),
                    B('🔁', 'Flexão', [
                        '*Plural:* ' + pl.plural,
                        '*Feminino:* ' + fem.feminino,
                        '*Diminutivo:* ' + diminutivoDe(p).forma,
                        '*Aumentativo:* ' + aumentativoDe(p).forma
                    ]),
                    B('🏷️', 'Classe provável', [classe.classe + ' — ' + classe.nota,
                        'Fora de frase, a classe é um palpite: a mesma palavra muda de classe conforme o vizinho.'])
                ]
            }
        }
    },

    // ── Flexão ────────────────────────────────────────────────────────────
    {
        id: 'plural', sub: 'Português', emoji: '➕', titulo: 'Plural da palavra',
        descricao: 'Põe a palavra no plural e explica a regra',
        ajuda: 'Mande uma palavra no singular e eu devolvo o plural com a regra que vale.',
        usage: '<palavra>', examples: ['pão — pães', 'fóssil — fósseis'],
        run: (t) => {
            const p = primeiraPalavra(t)
            const r = pluralDe(p)
            if (!r) return { blocos: [semJeito('uma palavra', 'mande uma palavra só, como "animal"')] }
            return {
                intro: 'O plural de *' + p + '* é *' + r.plural + '*.',
                blocos: [
                    B('📖', 'Por quê', [r.regra]),
                    B('📚', 'As regras principais', [
                        'Vogal: acrescenta S — casa, casas.',
                        'ÃO: faz ÕES, ÃES ou ÃOS — corações, pães, irmãos.',
                        'M: vira NS — homem, homens.',
                        'AL, EL, OL, UL: o L vira IS — animal, animais.',
                        'IL oxítona: vira IS; IL paroxítona: vira EIS — funis, fósseis.',
                        'R e Z: acrescenta ES — mares, luzes.'
                    ])
                ]
            }
        }
    },
    {
        id: 'pluralcomposto', sub: 'Português', emoji: '🧷', titulo: 'Plural de palavra composta',
        descricao: 'Faz o plural de palavra com hífen',
        ajuda: 'Palavra composta tem regra própria: às vezes as duas partes vão ao plural, às vezes só uma.',
        usage: '<palavra composta>', examples: ['couve-flor — couves-flores', 'guarda-chuva — guarda-chuvas'],
        run: (t) => {
            const p = primeiraPalavra(t) || String(t).trim().split(/\s+/)[0]
            const r = pluralComposto(p)
            return {
                intro: 'O plural de *' + p + '* é *' + r.plural + '*.',
                blocos: [
                    B('📖', 'Por quê', [r.regra]),
                    B('📚', 'As regras', [
                        'Substantivo + substantivo ou + adjetivo: os dois variam — couves-flores.',
                        'Verbo + substantivo: só o substantivo varia — guarda-chuvas, beija-flores.',
                        'Ligadas por preposição: só a primeira varia — pés de moleque.',
                        'Palavras repetidas: só a segunda varia — reco-recos.',
                        'Com palavra invariável: só a variável muda — sempre-vivas.'
                    ])
                ]
            }
        }
    },
    {
        id: 'feminino', sub: 'Português', emoji: '♀️', titulo: 'Feminino da palavra',
        descricao: 'Passa a palavra para o feminino com a regra',
        ajuda: 'Mande a palavra no masculino e eu devolvo o feminino.',
        usage: '<palavra>', examples: ['ator — atriz', 'irmão — irmã'],
        run: (t) => {
            const p = primeiraPalavra(t)
            const r = femininoDe(p)
            if (!r) return { blocos: [semJeito('uma palavra', 'mande uma palavra só, como "professor"')] }
            return {
                intro: 'O feminino de *' + p + '* é *' + r.feminino + '*.',
                blocos: [
                    B('📖', 'Por quê', [r.regra]),
                    B('📚', 'Os três caminhos', [
                        '*Terminação:* muda a letra final — menino, menina.',
                        '*Palavra própria:* o par é outra palavra — homem, mulher; boi, vaca.',
                        '*Dois gêneros:* a palavra não muda, muda o artigo — o dentista, a dentista.'
                    ])
                ]
            }
        }
    },
    {
        id: 'masculino', sub: 'Português', emoji: '♂️', titulo: 'Masculino da palavra',
        descricao: 'Passa a palavra do feminino para o masculino',
        ajuda: 'O caminho contrário: mande no feminino e eu devolvo o masculino.',
        usage: '<palavra>', examples: ['atriz — ator', 'madrinha — padrinho'],
        run: (t) => {
            const p = primeiraPalavra(t)
            const r = masculinoDe(p)
            if (!r) return { blocos: [semJeito('uma palavra', 'mande uma palavra só, como "rainha"')] }
            return {
                intro: 'O masculino de *' + p + '* é *' + r.masculino + '*.',
                blocos: [
                    B('📖', 'Por quê', [r.regra]),
                    B('⚠️', 'Cuidado', [
                        'Alguns pares não têm masculino: baleia, cobra, borboleta valem para os dois sexos.',
                        'Nesses casos usa-se macho e fêmea: a cobra macho, a baleia fêmea.'
                    ])
                ]
            }
        }
    },
    {
        id: 'aumentativo', sub: 'Português', emoji: '🔺', titulo: 'Aumentativo',
        descricao: 'Forma o aumentativo e explica a construção',
        ajuda: 'O aumentativo aumenta o tamanho, mas também pode ser carinho ou deboche.',
        usage: '<palavra>', examples: ['casa — casarão', 'nariz — narigão'],
        run: (t) => {
            const p = primeiraPalavra(t)
            const r = aumentativoDe(p)
            if (!r) return { blocos: [semJeito('uma palavra', 'mande uma palavra só, como "livro"')] }
            return {
                intro: 'O aumentativo de *' + p + '* é *' + r.forma + '*.',
                blocos: [
                    B('📖', 'Por quê', [r.regra]),
                    B('🎭', 'Além do tamanho', [
                        'Pode ser elogio: um golaço.',
                        'Pode ser deboche: um poetastro, um advogadão.',
                        'Alguns aumentativos viraram outra palavra: cartão, portão, sabão.'
                    ])
                ]
            }
        }
    },
    {
        id: 'diminutivo', sub: 'Português', emoji: '🔻', titulo: 'Diminutivo',
        descricao: 'Forma o diminutivo e explica INHO x ZINHO',
        ajuda: 'A dúvida é sempre a mesma: INHO ou ZINHO? A terminação da palavra decide.',
        usage: '<palavra>', examples: ['casa — casinha', 'café — cafezinho'],
        run: (t) => {
            const p = primeiraPalavra(t)
            const r = diminutivoDe(p)
            if (!r) return { blocos: [semJeito('uma palavra', 'mande uma palavra só, como "flor"')] }
            return {
                intro: 'O diminutivo de *' + p + '* é *' + r.forma + '*.',
                blocos: [
                    B('📖', 'Por quê', [r.regra]),
                    B('📏', 'A regra em duas linhas', [
                        'Termina em vogal átona: troca a vogal por INHO ou INHA — casa, casinha.',
                        'Termina em consoante, vogal tônica ou nasal: entra o Z — café, cafezinho; flor, florzinha.'
                    ]),
                    B('🎭', 'Além do tamanho', [
                        'Pode ser carinho: um cafezinho, um beijinho.',
                        'Pode ser desprezo: um jornalzinho, um textinho.'
                    ])
                ]
            }
        }
    },
    {
        id: 'grau', sub: 'Português', emoji: '📊', titulo: 'Graus do adjetivo',
        descricao: 'Mostra comparativo e superlativo do adjetivo',
        ajuda: 'O adjetivo tem grau comparativo (compara dois) e superlativo (leva ao extremo).',
        usage: '<adjetivo>', examples: ['bonito — mais bonito que, boniíssimo', 'bom — melhor, ótimo'],
        run: (t) => {
            const p = primeiraPalavra(t)
            const g = grausDe(p)
            if (!g) return { blocos: [semJeito('um adjetivo', 'mande um adjetivo só, como "forte"')] }
            return {
                intro: 'Os graus de *' + g.adjetivo + '*.',
                blocos: [
                    B('⚖️', 'Comparativo', [
                        '*Igualdade:* ' + g.igualdade,
                        '*Superioridade:* ' + g.superioridade,
                        '*Inferioridade:* ' + g.inferioridade
                    ]),
                    B('🏆', 'Superlativo relativo', [
                        '*De superioridade:* ' + g.relativoMaior,
                        '*De inferioridade:* ' + g.relativoMenor
                    ]),
                    B('💥', 'Superlativo absoluto', [
                        '*Analítico:* ' + g.absolutoAnalitico,
                        '*Sintético:* ' + g.absolutoSintetico,
                        g.eruditoObs
                    ].filter(Boolean))
                ]
            }
        }
    },

    // ── Crase ─────────────────────────────────────────────────────────────
    {
        id: 'crase', sub: 'Português', emoji: '🪄', titulo: 'Crase na sua frase',
        descricao: 'Analisa a crase na frase que você escrever',
        ajuda: 'Mande a frase inteira e eu olho cada A, dizendo se tem crase e por quê.',
        usage: '<frase>', examples: ['Vou a escola amanhã — explica o caso', 'Entreguei o livro a professora'],
        dica: 'Regra de ouro: crase é preposição A mais artigo A. Se não houver os dois, não há crase.',
        run: (t) => {
            const r = analisarCrase(t)
            if (!r.casos.length) {
                return {
                    intro: 'Não achei nenhum A para analisar nessa frase.',
                    blocos: [B('📖', 'Como funciona a crase', [
                        'Crase é o encontro da preposição A com o artigo A.',
                        'Teste: troque a palavra feminina por uma masculina. Se virar AO, tem crase.'
                    ])]
                }
            }
            return {
                intro: 'Olhei cada A da sua frase.',
                blocos: [
                    B('🔍', 'Caso a caso', r.casos.map(c => '*' + c.trecho + ':* ' + c.veredito + ' — ' + c.porque)),
                    B('💡', 'O teste que nunca falha', [
                        'Troque a palavra feminina por uma masculina equivalente.',
                        'Se aparecer AO, tem crase. Se aparecer O, não tem.',
                        'Vou à escola vira vou ao colégio: tem crase.'
                    ])
                ]
            }
        }
    },
    {
        id: 'crasesim', sub: 'Português', emoji: '✅', titulo: 'Quando a crase é obrigatória',
        descricao: 'Lista os casos em que a crase é obrigatória',
        ajuda: 'Os casos em que o acento grave tem de estar lá, sem discussão.',
        usage: '[palavra para procurar]', examples: ['sem nada — mostra a lista', 'hora — procura o caso das horas'],
        run: (t) => {
            const filtro = normal(t)
            const casos = [
                '*Palavra feminina determinada:* Vou à escola, refiro-me à professora.',
                '*Locução adverbial feminina:* às vezes, à noite, à vontade, às pressas.',
                '*Locução prepositiva feminina:* à procura de, à espera de, à custa de.',
                '*Locução conjuntiva feminina:* à medida que, à proporção que.',
                '*Hora certa:* Chego às 8 horas. Saímos à uma da tarde.',
                '*À moda de, mesmo com palavra masculina:* bife à milanesa, gol à Pelé.',
                '*Aquele, aquela e aquilo quando o verbo pede A:* Refiro-me àquele caso.',
                '*A qual e as quais quando o verbo pede A:* a pessoa à qual me referi.'
            ]
            const achados = filtro ? casos.filter(c => normal(c).includes(filtro)) : casos
            return {
                intro: filtro ? 'Casos de crase obrigatória com "' + String(t).trim() + '".' : 'Onde a crase é obrigatória.',
                blocos: [
                    B('✅', 'Crase obrigatória', achados.length ? achados : ['Não achei esse caso na lista. Veja a lista inteira chamando o comando sem palavra nenhuma.']),
                    B('💡', 'Lembre', ['Crase não é acento de palavra bonita: é a soma de duas palavrinhas, a preposição e o artigo.'])
                ]
            }
        }
    },
    {
        id: 'crasenao', sub: 'Português', emoji: '🚫', titulo: 'Quando a crase é proibida',
        descricao: 'Lista os casos em que não pode haver crase',
        ajuda: 'Os casos em que o acento grave está sempre errado.',
        usage: '[palavra para procurar]', examples: ['sem nada — mostra a lista', 'verbo — procura o caso do verbo'],
        run: (t) => {
            const filtro = normal(t)
            const casos = [
                '*Antes de palavra masculina:* Vou a pé, andei a cavalo, escrevi a lápis.',
                '*Antes de verbo:* Começou a estudar, voltei a correr.',
                '*Antes de pronome pessoal:* Falei a ela, entreguei a você.',
                '*Antes da maioria dos pronomes:* a esta, a essa, a qualquer, a ninguém, a mim.',
                '*Entre palavras repetidas:* cara a cara, gota a gota, dia a dia.',
                '*Antes de nome de cidade sem especificação:* Vou a Salvador. Mas: Vou à Salvador de todos os santos.',
                '*Antes de CASA (a sua) e TERRA (firme):* Cheguei a casa, o marinheiro desceu a terra.',
                '*Antes de numeral:* de segunda a sexta, de 10 a 20 reais.'
            ]
            const achados = filtro ? casos.filter(c => normal(c).includes(filtro)) : casos
            return {
                intro: filtro ? 'Casos de crase proibida com "' + String(t).trim() + '".' : 'Onde a crase nunca aparece.',
                blocos: [
                    B('🚫', 'Crase proibida', achados.length ? achados : ['Não achei esse caso na lista. Chame o comando sem palavra nenhuma para ver tudo.']),
                    B('💡', 'Por trás disso', ['Todos esses casos têm a mesma explicação: falta o artigo A. Sem artigo, não há o que fundir com a preposição.'])
                ]
            }
        }
    },
    {
        id: 'porque', sub: 'Português', emoji: '❓', titulo: 'Porque, por que, porquê e por quê',
        descricao: 'Analisa qual das quatro formas cabe na frase',
        ajuda: 'Mande a frase com a forma que você usou e eu digo se está certa.',
        usage: '<frase>', examples: ['Por que você saiu? — confere a forma', 'Você saiu por que?'],
        run: (t) => {
            const r = analisarPorque(t)
            const referencia = B('📚', 'As quatro formas', [
                '*por que* (separado, sem acento) — pergunta ou "pelo qual": Por que choras? O caminho por que passei.',
                '*por quê* (separado, com acento) — no fim da frase: Você chorou por quê?',
                '*porque* (junto, sem acento) — resposta, causa: Chorei porque doeu.',
                '*porquê* (junto, com acento) — substantivo, vem com artigo: Não sei o porquê.'
            ])
            if (!r.casos.length) {
                return { intro: 'Não achei nenhum "porque" na frase, então segue a referência.', blocos: [referencia] }
            }
            return {
                intro: 'Conferi cada ocorrência da sua frase.',
                blocos: [
                    B('🔍', 'Caso a caso', r.casos.map(c =>
                        (c.certo ? '✅ ' : '❌ ') + '*' + c.trecho + '* — ' + c.porque + (c.certo ? '' : ' O certo aqui seria ' + c.deveriaSer + '.'))),
                    referencia
                ]
            }
        }
    },

    // ── Vocabulário que confunde ──────────────────────────────────────────
    {
        id: 'paronimos', sub: 'Português', emoji: '👯', titulo: 'Parônimos',
        descricao: 'Distingue palavras parecidas de sentido diferente',
        ajuda: 'Parônimos são palavras parecidas na escrita e no som, com sentidos diferentes.',
        usage: '<palavra ou frase>', examples: ['mandato — mostra mandado e mandato', 'tráfego'],
        run: (t) => {
            const filtro = normal(t)
            const achados = PARONIMOS.filter(([p]) => filtro.includes(normal(p)) || normal(p).includes(filtro))
            const lista = (achados.length ? achados : PARONIMOS.slice(0, 12))
                .map(([p, oque]) => '*' + p + ':* ' + oque)
            return {
                intro: achados.length ? 'Achei estes parônimos no que você mandou.' : 'Os parônimos que mais caem em prova.',
                blocos: [
                    B('👯', 'Parônimos', lista),
                    B('💡', 'Como não errar', ['Troque a palavra pela definição inteira dentro da frase. Se a frase continuar fazendo sentido, é a palavra certa.'])
                ]
            }
        }
    },
    {
        id: 'homonimos', sub: 'Português', emoji: '🎭', titulo: 'Homônimos',
        descricao: 'Distingue palavras iguais no som e diferentes',
        ajuda: 'Homônimos soam igual (ou se escrevem igual) e querem dizer coisas diferentes.',
        usage: '<palavra ou frase>', examples: ['conserto — mostra concerto e conserto', 'cela'],
        run: (t) => {
            const filtro = normal(t)
            const achados = HOMONIMOS.filter(([p]) => filtro.includes(normal(p)) || normal(p).includes(filtro))
            const lista = (achados.length ? achados : HOMONIMOS).map(([p, oque]) => '*' + p + ':* ' + oque)
            return {
                intro: achados.length ? 'Achei estes homônimos no que você mandou.' : 'Homônimos que vivem trocados.',
                blocos: [
                    B('🎭', 'Homônimos', lista),
                    B('📚', 'Os tipos', [
                        '*Homônimos homófonos:* som igual, escrita diferente — cela e sela.',
                        '*Homônimos homógrafos:* escrita igual, som diferente — colher (talher) e colher (verbo).',
                        '*Homônimos perfeitos:* som e escrita iguais — cedo (advérbio) e cedo (verbo ceder).'
                    ])
                ]
            }
        }
    },

    // ── Sintaxe e concordância ────────────────────────────────────────────
    {
        id: 'concordanciaverbal', sub: 'Português', emoji: '🤝', titulo: 'Concordância verbal',
        descricao: 'Confere se o verbo combina com o sujeito',
        ajuda: 'Mande a frase e eu vejo se o verbo está combinando com o sujeito.',
        usage: '<frase>', examples: ['Fazem dois anos que estudo aqui', 'Houveram muitos problemas'],
        run: (t) => {
            const r = analisarConcordanciaVerbal(t)
            return {
                intro: r.problemas.length ? 'Achei ' + r.problemas.length + ' ponto(s) para arrumar.' : 'Não achei erro de concordância verbal nessa frase.',
                blocos: [
                    r.problemas.length ? B('❌', 'Para arrumar', r.problemas.map(p => '*' + p.trecho + '* → ' + p.certo + '\n   ' + p.porque)) : null,
                    r.observacoes.length ? B('🔍', 'Leitura da frase', r.observacoes) : null,
                    B('📚', 'As regras que mais caem', [
                        'O verbo concorda com o sujeito em número e pessoa.',
                        'HAVER de existir é impessoal: fica no singular sempre.',
                        'FAZER de tempo é impessoal: faz dois anos.',
                        'Sujeito composto antes do verbo: verbo no plural.',
                        'A GENTE pede verbo na 3ª pessoa do singular.'
                    ])
                ].filter(Boolean)
            }
        }
    },
    {
        id: 'concordancianominal', sub: 'Português', emoji: '🧵', titulo: 'Concordância nominal',
        descricao: 'Confere artigo, substantivo e adjetivo na frase',
        ajuda: 'Mande a frase e eu vejo se as palavras estão combinando em gênero e número.',
        usage: '<frase>', examples: ['Os menino bonito chegou', 'Seguem anexo as notas'],
        run: (t) => {
            const r = analisarConcordanciaNominal(t)
            return {
                intro: r.problemas.length ? 'Achei ' + r.problemas.length + ' desencontro(s) na frase.' : 'As palavras da frase parecem combinando.',
                blocos: [
                    r.problemas.length ? B('❌', 'Para arrumar', r.problemas.map(p => '*' + p.trecho + '* — ' + p.porque)) : null,
                    r.invariaveis.length ? B('⚠️', 'Palavras invariáveis', r.invariaveis) : null,
                    B('📚', 'As regras', r.regras)
                ].filter(Boolean)
            }
        }
    },
    {
        id: 'regenciaverbal', sub: 'Português', emoji: '🔌', titulo: 'Regência verbal',
        descricao: 'Diz qual preposição o verbo pede',
        ajuda: 'Mande um verbo para ver a regência, ou uma frase para eu conferir.',
        usage: '<verbo ou frase>', examples: ['assistir — mostra a regência', 'Eu assisti o filme ontem'],
        run: (t) => {
            const r = analisarRegenciaVerbal(t)
            if (r.tipo === 'ficha') {
                return {
                    intro: 'Regência de *' + r.verbo + '*.',
                    blocos: [
                        B('🔌', 'Como se usa', [r.regencia]),
                        B('💡', 'Por que isso cai tanto', ['A preposição muda o sentido do verbo. Trocar a preposição é trocar o que a frase diz.'])
                    ]
                }
            }
            if (r.tipo === 'semFicha') {
                const verbos = [...REGENCIA_VERBAL.keys()].slice(0, 16).join(', ')
                return {
                    intro: 'Não tenho ficha de regência para "' + r.verbo + '".',
                    blocos: [B('📚', 'Tenho ficha destes', [verbos + ' e outros.']),
                    B('💡', 'Outra saída', ['Mande a frase inteira que eu procuro erros de regência conhecidos nela.'])]
                }
            }
            return {
                intro: r.achados.length ? 'Achei ' + r.achados.length + ' problema(s) de regência.' : 'Não achei erro de regência conhecido nessa frase.',
                blocos: [
                    r.achados.length ? B('❌', 'Para arrumar', r.achados.map(a => '*' + a.trecho + '* → ' + a.certo + '\n   ' + a.porque)) : null,
                    B('📚', 'Os campeões de erro', [
                        'assistir AO filme (ver), não "assistir o filme".',
                        'chegar A casa, não "chegar em casa".',
                        'preferir isto A aquilo, não "preferir mais do que".',
                        'namorar alguém, sem COM.',
                        'obedecer AO combinado.'
                    ])
                ].filter(Boolean)
            }
        }
    },
    {
        id: 'regencianominal', sub: 'Português', emoji: '🔗', titulo: 'Regência nominal',
        descricao: 'Mostra a preposição que cada nome exige',
        ajuda: 'Substantivos e adjetivos também pedem preposição: acesso A, medo DE, fiel A.',
        usage: '[palavra]', examples: ['medo — mostra a regência de medo', 'sem nada — mostra a lista'],
        run: (t) => {
            const filtro = normal(t)
            const achados = filtro ? REGENCIA_NOMINAL.filter(r => normal(r).includes(filtro)) : REGENCIA_NOMINAL
            return {
                intro: filtro ? 'Regência nominal com "' + String(t).trim() + '".' : 'As regências nominais que mais aparecem.',
                blocos: [
                    B('🔗', 'Nome e preposição', achados.length ? achados : ['Não achei essa palavra na lista. Chame o comando sem nada para ver tudo.']),
                    B('💡', 'Como estudar', ['Decore em bloco: "grato A alguém POR alguma coisa". Preposição solta não gruda na memória.'])
                ]
            }
        }
    },
    {
        id: 'colocacao', sub: 'Português', emoji: '📍', titulo: 'Colocação pronominal',
        descricao: 'Diz se cabe próclise, mesóclise ou ênclise',
        ajuda: 'Mande a frase com o pronome e eu digo onde ele deveria ficar.',
        usage: '<frase>', examples: ['Me empresta o livro', 'Não me diga isso'],
        run: (t) => {
            const r = analisarColocacao(t)
            return {
                intro: 'Colocação do pronome na sua frase.',
                blocos: [
                    B('📍', 'O que a frase pede', r.achados.map(a => '*' + a.regra + '* — ' + a.oque)),
                    B('🧲', 'Palavras que puxam o pronome para antes', [
                        '*Negação:* não, nunca, jamais, ninguém, nada.',
                        '*Advérbio:* sempre, talvez, já, aqui, só, ainda.',
                        '*Pronome relativo, indefinido ou demonstrativo:* que, quem, tudo, isso.',
                        '*Conjunção subordinativa:* quando, se, porque, embora, como.'
                    ]),
                    B('💡', 'Na prática', [
                        'Na fala do dia a dia, o brasileiro usa próclise em quase tudo, e isso não é erro de português: é outro registro.',
                        'Na prova e no texto formal, vale a regra acima.'
                    ])
                ]
            }
        }
    },
    {
        id: 'virgula', sub: 'Português', emoji: '🔸', titulo: 'Vírgula na sua frase',
        descricao: 'Aponta vírgula faltando ou sobrando na frase',
        ajuda: 'Mande a frase e eu olho as vírgulas dela, uma a uma.',
        usage: '<frase>', examples: ['Os alunos, chegaram cedo', 'Maria venha aqui'],
        run: (t) => {
            const r = analisarVirgula(t)
            return {
                intro: 'Olhei a pontuação da sua frase.',
                blocos: [
                    r.alertas.length ? B('❌', 'Para arrumar', r.alertas) : null,
                    r.achados.length ? B('✅', 'O que está certo', r.achados) : null,
                    B('📚', 'Onde a vírgula entra', r.regras),
                    B('🚫', 'Onde ela nunca entra', r.proibicoes)
                ].filter(Boolean)
            }
        }
    },
    {
        id: 'pontuacao', sub: 'Português', emoji: '❗', titulo: 'Sinais de pontuação',
        descricao: 'Explica para que serve cada sinal de pontuação',
        ajuda: 'Mande um sinal ou uma frase e eu explico o que cada marca faz.',
        usage: '[sinal ou frase]', examples: ['ponto e vírgula — explica o sinal', 'sem nada — mostra todos'],
        run: (t) => {
            const filtro = normal(t)
            const achados = filtro ? SINAIS_PONTUACAO.filter(([s, o]) => normal(s).includes(filtro) || normal(o).includes(filtro)) : SINAIS_PONTUACAO
            const frase = String(t).trim()
            const usados = frase ? SINAIS_PONTUACAO.filter(([s]) => frase.includes(s.charAt(0))) : []
            return {
                intro: 'Os sinais de pontuação e o trabalho de cada um.',
                blocos: [
                    B('❗', 'Cada sinal', (achados.length ? achados : SINAIS_PONTUACAO).map(([s, o]) => '*' + s + '* — ' + o)),
                    usados.length ? B('🔍', 'Na sua frase', usados.map(([s, o]) => 'Você usou ' + s + ': ' + o)) : null
                ].filter(Boolean)
            }
        }
    },
    {
        id: 'classes', sub: 'Português', emoji: '🏷️', titulo: 'Classes das palavras da frase',
        descricao: 'Classifica cada palavra da frase que você mandar',
        ajuda: 'Mande a frase e eu digo a classe gramatical de cada palavra.',
        usage: '<frase>', examples: ['O menino comeu o bolo — classifica tudo'],
        run: (t) => {
            const tokens = classesDaFrase(t)
            if (!tokens.length) return { blocos: [semJeito('uma frase', 'mande uma frase, como "A menina leu o livro"')] }
            const resumo = {}
            for (const tk of tokens) resumo[tk.classe] = (resumo[tk.classe] || 0) + 1
            return {
                intro: 'Classifiquei as ' + tokens.length + ' palavras da sua frase.',
                blocos: [
                    B('🏷️', 'Palavra por palavra', tokens.map(tk => '*' + tk.palavra + ':* ' + tk.classe)),
                    B('📊', 'Resumo', Object.entries(resumo).map(([c, n]) => '*' + c + ':* ' + n)),
                    B('⚠️', 'Aviso honesto', ['Classe de palavra depende do contexto. Onde a frase for ambígua, minha leitura pode não ser a única possível.'])
                ]
            }
        }
    },
    {
        id: 'sintaxe', sub: 'Português', emoji: '🪚', titulo: 'Sujeito e predicado',
        descricao: 'Separa sujeito e predicado da frase simples',
        ajuda: 'Mande uma frase simples e eu separo sujeito, predicado e os complementos.',
        usage: '<frase>', examples: ['O menino comeu o bolo', 'Os alunos estão felizes'],
        run: (t) => {
            const a = analiseSintatica(t)
            if (!a) return { blocos: [semJeito('uma frase', 'mande uma frase, como "O gato subiu no telhado"')] }
            if (a.erro) return { intro: 'Sem verbo não há oração.', blocos: [B('🤔', 'O que achei', [a.aviso])] }
            return {
                intro: 'Análise sintática da sua frase.',
                blocos: [
                    B('🧍', 'Sujeito', ['*Sujeito:* ' + a.sujeito, '*Núcleo:* ' + a.nucleoSujeito, '*Tipo:* ' + a.tipoSujeito]),
                    B('🏃', 'Predicado', ['*Predicado:* ' + a.predicado, '*Verbo:* ' + a.verbo + (a.infinitivo ? ' (de ' + a.infinitivo + ')' : ''), '*Tipo:* ' + a.tipoPredicado]),
                    a.termos.length ? B('🧩', 'Termos do predicado', a.termos) : null,
                    B('⚠️', 'Aviso', [a.aviso])
                ].filter(Boolean)
            }
        }
    },
    {
        id: 'periodo', sub: 'Português', emoji: '🧮', titulo: 'Período simples ou composto',
        descricao: 'Conta as orações e classifica o período',
        ajuda: 'Cada verbo é uma oração: conto os verbos e digo que tipo de período é.',
        usage: '<frase>', examples: ['Estudei muito, mas não passei — período composto'],
        run: (t) => {
            const r = analisarPeriodo(t)
            return {
                intro: r.tipo + '.',
                blocos: [
                    B('🔢', 'O que achei', [
                        '*Verbos:* ' + (r.verbos.length ? r.verbos.join(', ') : 'nenhum'),
                        '*Conectivos:* ' + (r.conectivos.length ? r.conectivos.join(', ') : 'nenhum')
                    ]),
                    r.notas.length ? B('📖', 'Leitura', r.notas) : null,
                    B('📚', 'Os tipos', [
                        '*Período simples:* uma oração, chamada de absoluta.',
                        '*Composto por coordenação:* orações independentes — "Cheguei e sentei".',
                        '*Composto por subordinação:* uma oração é termo da outra — "Quero que você venha".',
                        '*Misto:* tem os dois no mesmo período.'
                    ])
                ].filter(Boolean)
            }
        }
    },
    {
        id: 'vozes', sub: 'Português', emoji: '🔄', titulo: 'Voz ativa e voz passiva',
        descricao: 'Passa a frase da voz ativa para a passiva',
        ajuda: 'Mande a frase na voz ativa e eu devolvo na passiva, explicando a troca.',
        usage: '<frase na voz ativa>', examples: ['O menino comeu o bolo — O bolo foi comido pelo menino'],
        run: (t) => {
            const r = paraVozPassiva(t)
            if (r.erro) {
                return {
                    intro: 'Não deu para virar essa frase.',
                    blocos: [
                        B('🤔', 'Por quê', [r.explicacao || 'Preciso de uma frase com sujeito, verbo transitivo direto e objeto direto.']),
                        B('💡', 'Tente assim', ['"A professora corrigiu as provas" vira "As provas foram corrigidas pela professora".'])
                    ]
                }
            }
            return {
                intro: 'Sua frase nas duas vozes.',
                blocos: [
                    B('🏃', 'Voz ativa', [r.ativa]),
                    B('🎯', 'Voz passiva', [r.passiva]),
                    B('📖', 'O que mudou', [
                        r.explicacao,
                        '*Novo sujeito:* ' + r.sujeitoNovo,
                        '*Agente da passiva:* ' + r.agente
                    ]),
                    B('📚', 'As três vozes', [
                        '*Ativa:* o sujeito pratica — João leu o livro.',
                        '*Passiva:* o sujeito sofre — O livro foi lido por João.',
                        '*Reflexiva:* o sujeito pratica e sofre — João se feriu.'
                    ])
                ]
            }
        }
    },

    // ── Vocabulário ───────────────────────────────────────────────────────
    {
        id: 'sinonimos', sub: 'Português', emoji: '🔁', titulo: 'Sinônimos',
        descricao: 'Dá sinônimos da palavra que você mandar',
        ajuda: 'Sinônimo é palavra de sentido próximo, boa para não repetir na redação.',
        usage: '<palavra>', examples: ['bonito — belo, lindo, formoso'],
        run: (t) => {
            const p = normal(primeiraPalavra(t))
            const chave = [...VOCABULARIO.keys()].find(k => normal(k) === p)
            if (!chave) {
                return {
                    intro: 'Não tenho "' + String(t).trim() + '" no meu dicionário de sinônimos.',
                    blocos: [
                        B('📚', 'Tenho estas, por exemplo', [[...VOCABULARIO.keys()].slice(0, 20).join(', ') + '.']),
                        B('💡', 'Enquanto isso', ['Na redação, em vez de procurar sinônimo difícil, troque a palavra repetida por um pronome ou por uma expressão que retome: "o problema" vira "tal questão".'])
                    ]
                }
            }
            const v = VOCABULARIO.get(chave)
            return {
                intro: 'Sinônimos de *' + chave + '*.',
                blocos: [
                    B('🔁', 'Pode trocar por', v.sin.map(s => '• ' + s)),
                    v.ant && v.ant.length ? B('↔️', 'O contrário', [v.ant.join(', ')]) : null,
                    B('⚠️', 'Cuidado', ['Sinônimo perfeito quase não existe. Troque sempre lendo a frase inteira depois.'])
                ].filter(Boolean)
            }
        }
    },
    {
        id: 'antonimos', sub: 'Português', emoji: '↔️', titulo: 'Antônimos',
        descricao: 'Dá o contrário da palavra que você mandar',
        ajuda: 'Antônimo é palavra de sentido contrário.',
        usage: '<palavra>', examples: ['forte — fraco, frágil'],
        run: (t) => {
            const p = normal(primeiraPalavra(t))
            const chave = [...VOCABULARIO.keys()].find(k => normal(k) === p)
            if (!chave) {
                return {
                    intro: 'Não tenho "' + String(t).trim() + '" no meu dicionário de antônimos.',
                    blocos: [
                        B('📚', 'Tenho estas, por exemplo', [[...VOCABULARIO.keys()].slice(20, 40).join(', ') + '.']),
                        B('💡', 'Dica de formação', ['Muitos antônimos nascem de prefixo: feliz e infeliz, legal e ilegal, fazer e desfazer.'])
                    ]
                }
            }
            const v = VOCABULARIO.get(chave)
            return {
                intro: 'Antônimos de *' + chave + '*.',
                blocos: [
                    B('↔️', 'O contrário é', (v.ant || []).map(s => '• ' + s)),
                    B('🔁', 'Sinônimos', [v.sin.join(', ')]),
                    B('📚', 'Prefixos que invertem', ['in-, im-, i-: incapaz, impossível, ilegal.', 'des-: desfazer, desonesto.', 'anti-: antiaéreo, antivírus.'])
                ]
            }
        }
    },
    {
        id: 'coletivos', sub: 'Português', emoji: '👨‍👩‍👧‍👦', titulo: 'Substantivos coletivos',
        descricao: 'Diz o coletivo da palavra que você mandar',
        ajuda: 'Coletivo é o substantivo que já vem no singular indicando um conjunto.',
        usage: '<palavra>', examples: ['abelha — enxame', 'peixe — cardume'],
        run: (t) => {
            const p = normal(primeiraPalavra(t)).replace(/s$/, '')
            const chave = [...COLETIVOS.keys()].find(k => normal(k) === p)
            if (!chave) {
                const amostra = [...COLETIVOS.entries()].slice(0, 14).map(([k, v]) => '*' + k + ':* ' + v)
                return {
                    intro: 'Não tenho o coletivo de "' + String(t).trim() + '".',
                    blocos: [B('👨‍👩‍👧‍👦', 'Alguns que eu sei', amostra)]
                }
            }
            return {
                intro: 'O coletivo de *' + chave + '* é *' + COLETIVOS.get(chave) + '*.',
                blocos: [
                    B('📖', 'Como funciona', ['Coletivo é singular na forma e plural no sentido: um enxame são muitas abelhas.']),
                    B('⚠️', 'Concordância', ['O verbo concorda com o coletivo, não com o que ele reúne: "O bando voou", não "O bando voaram".'])
                ]
            }
        }
    },

    // ── Estilo ────────────────────────────────────────────────────────────
    {
        id: 'figuras', sub: 'Português', emoji: '🎨', titulo: 'Figuras na sua frase',
        descricao: 'Procura figuras de linguagem na frase',
        ajuda: 'Mande a frase e eu digo que figuras de linguagem aparecem nela.',
        usage: '<frase>', examples: ['Meu coração é um deserto — metáfora', 'Estou morrendo de fome'],
        run: (t) => {
            const r = acharFiguras(t)
            if (!r.achadas.length) {
                return {
                    intro: 'Não reconheci figura de linguagem nessa frase.',
                    blocos: [
                        B('💡', 'Isso não quer dizer que não tenha', ['Meu olho pega os padrões mais comuns. Ironia e metonímia, por exemplo, dependem do contexto e eu não enxergo.']),
                        B('🎨', 'Experimente com', ['"Meu coração é um deserto" (metáfora)', '"Estou morrendo de fome" (hipérbole)', '"O vento sussurrou" (prosopopeia)'])
                    ]
                }
            }
            return {
                intro: 'Achei ' + r.achadas.length + ' figura(s) na sua frase.',
                blocos: [
                    B('🎨', 'O que achei', r.achadas.map(a => '*' + a.nome + '* — ' + a.porque)),
                    B('📖', 'O que cada uma é', r.achadas.filter(a => a.ficha).map(a => '*' + a.nome + ':* ' + a.ficha.oque + ' Exemplo: ' + a.ficha.exemplo))
                ]
            }
        }
    },
    {
        id: 'fichafigura', sub: 'Português', emoji: '📕', titulo: 'Ficha de uma figura de linguagem',
        descricao: 'Explica uma figura de linguagem pelo nome',
        ajuda: 'Mande o nome da figura e eu explico com exemplo.',
        usage: '<nome da figura>', examples: ['metonímia — explica e dá exemplo', 'sem nada — lista todas'],
        run: (t) => {
            const p = normal(t)
            const achada = FIGURAS.find(f => normal(f.nome) === p) || FIGURAS.find(f => p && normal(f.nome).includes(p))
            if (!achada) {
                const porGrupo = {}
                for (const f of FIGURAS) (porGrupo[f.grupo] = porGrupo[f.grupo] || []).push(f.nome)
                return {
                    intro: p ? 'Não tenho ficha de "' + String(t).trim() + '".' : 'As figuras de linguagem, por grupo.',
                    blocos: Object.entries(porGrupo).map(([g, nomes]) => B('🎨', 'Figuras de ' + g, [nomes.join(', ') + '.']))
                }
            }
            return {
                intro: '*' + maiuscula(achada.nome) + '* — figura de ' + achada.grupo + '.',
                blocos: [
                    B('📖', 'O que é', [achada.oque]),
                    B('✍️', 'Exemplo', [achada.exemplo]),
                    B('🧭', 'Onde encontrar', ['Figuras de ' + achada.grupo + ': ' + FIGURAS.filter(f => f.grupo === achada.grupo).map(f => f.nome).join(', ') + '.'])
                ]
            }
        }
    },
    {
        id: 'vicios', sub: 'Português', emoji: '🚧', titulo: 'Vícios de linguagem',
        descricao: 'Procura vícios de linguagem no seu texto',
        ajuda: 'Vício de linguagem é o desvio que atrapalha quem lê, sem ser recurso de estilo.',
        usage: '<frase ou texto>', examples: ['Vou subir para cima agora', 'Vou estar enviando o arquivo'],
        run: (t) => {
            const r = acharVicios(t)
            return {
                intro: r.achados.length ? 'Achei ' + r.achados.length + ' vício(s) no seu texto.' : 'Não achei vício de linguagem conhecido nesse texto.',
                blocos: [
                    r.achados.length ? B('🚧', 'O que achei', r.achados.map(a => '*' + a.vicio + ':* "' + a.trecho + '" — ' + a.oque)) : null,
                    B('📚', 'Os principais vícios', VICIOS.map(v => '*' + v.nome + ':* ' + v.oque + ' Ex.: ' + v.exemplos[0] + '.'))
                ].filter(Boolean)
            }
        }
    },
    {
        id: 'pleonasmo', sub: 'Português', emoji: '♻️', titulo: 'Pleonasmo',
        descricao: 'Separa pleonasmo vicioso de pleonasmo literário',
        ajuda: 'Repetir ideia pode ser erro ou pode ser recurso: depende da intenção.',
        usage: '<frase>', examples: ['Subi para cima do telhado', 'Vi com estes olhos'],
        run: (t) => {
            const r = acharVicios(t)
            const pleonasmos = r.achados.filter(a => a.vicio === 'pleonasmo vicioso')
            return {
                intro: pleonasmos.length ? 'Achei repetição de ideia na sua frase.' : 'Não achei pleonasmo vicioso conhecido nessa frase.',
                blocos: [
                    pleonasmos.length ? B('❌', 'Pleonasmo vicioso', pleonasmos.map(p => '"' + p.trecho + '" — corte uma das partes.')) : null,
                    B('📚', 'Os dois tipos', [
                        '*Vicioso:* repete sem precisar — subir para cima, entrar para dentro, elo de ligação.',
                        '*Literário:* repete de propósito, para reforçar — "Vi com estes olhos que a terra há de comer".'
                    ]),
                    B('🧾', 'Lista dos viciosos mais comuns', [VICIOS[0].exemplos.slice(0, 10).join('; ') + '.'])
                ].filter(Boolean)
            }
        }
    },

    // ── Escrita correta ───────────────────────────────────────────────────
    {
        id: 'ortografia', sub: 'Português', emoji: '🔤', titulo: 'Erros de escrita',
        descricao: 'Procura erros de escrita conhecidos no texto',
        ajuda: 'Mande o texto e eu procuro os erros de escrita que mais aparecem.',
        usage: '<texto>', examples: ['Concerteza vou apartir de amanhã'],
        run: (t) => {
            const r = corrigirOrtografia(t)
            return {
                intro: r.achados.length ? 'Achei ' + r.achados.length + ' escorregão.' : 'Não achei nenhum dos erros de escrita da minha lista.',
                blocos: [
                    r.achados.length ? B('❌', 'Para trocar', r.achados.map(a => '*' + a.errado + '* → ' + a.certo)) : null,
                    B('📚', 'Os que mais aparecem', [
                        'concerteza → com certeza', 'derrepente → de repente', 'apartir → a partir',
                        'menas → menos', 'previlégio → privilégio', 'frustado → frustrado',
                        'a nível de → em nível de', 'haja visto → haja vista'
                    ]),
                    B('⚠️', 'Aviso', ['Minha lista é de erros conhecidos, não é corretor completo. Texto sem aviso não quer dizer texto sem erro.'])
                ].filter(Boolean)
            }
        }
    },
    {
        id: 'hifen', sub: 'Português', emoji: '➖', titulo: 'Hífen',
        descricao: 'Confere o hífen da palavra pelo Acordo de 2009',
        ajuda: 'Mande a palavra e eu digo se o hífen entra ali.',
        usage: '<palavra>', examples: ['micro-ondas — leva hífen', 'autoescola — não leva'],
        run: (t) => {
            const p = String(t).trim().split(/\s+/)[0]
            const r = analisarHifen(p)
            if (!r) return { blocos: [semJeito('uma palavra', 'mande uma palavra só, como "anti-inflamatório"')] }
            return {
                intro: '*' + r.forma + '*: ' + r.veredito + '.',
                blocos: [
                    B('📖', 'Por quê', [r.porque]),
                    B('📚', 'As regras do Acordo', REGRAS_HIFEN)
                ]
            }
        }
    },
    {
        id: 'numeroextenso', sub: 'Português', emoji: '🔢', titulo: 'Número por extenso',
        descricao: 'Escreve o número por extenso em português',
        ajuda: 'Mande o número e eu escrevo por extenso, do jeito certo.',
        usage: '<número>', examples: ['1547 — mil quinhentos e quarenta e sete'],
        run: (t) => {
            const bruto = String(t).replace(/[^\d]/g, '')
            const n = parseInt(bruto, 10)
            if (!bruto || !Number.isFinite(n)) return { blocos: [semJeito('um número', 'mande só os algarismos, como 2026')] }
            const ext = porExtenso(n)
            if (!ext) return { blocos: [semJeito('um número dentro do meu alcance', 'sei escrever de 0 até 999.999.999')] }
            return {
                intro: '*' + n.toLocaleString('pt-BR') + '* por extenso é *' + ext + '*.',
                blocos: [
                    B('📚', 'Regras de escrita', [
                        'Use E entre centena e dezena, e entre dezena e unidade: cento e vinte e três.',
                        'Não use E entre milhar e centena quando a centena for cheia: dois mil trezentos e vinte.',
                        'CEM é sozinho; com companhia vira CENTO: cem reais, cento e um reais.',
                        'Milhão e bilhão vão ao plural: dois milhões.'
                    ])
                ]
            }
        }
    },
    {
        id: 'ordinal', sub: 'Português', emoji: '🥇', titulo: 'Numeral ordinal',
        descricao: 'Escreve o ordinal do número por extenso',
        ajuda: 'Mande o número e eu digo o ordinal: 1 é primeiro, 40 é quadragésimo.',
        usage: '<número de 1 a 999>', examples: ['42 — quadragésimo segundo'],
        run: (t) => {
            const n = parseInt(String(t).replace(/[^\d]/g, ''), 10)
            const ord = ordinalPorExtenso(n)
            if (!ord) return { blocos: [semJeito('um número de 1 a 999', 'mande só os algarismos, como 21')] }
            return {
                intro: 'O ordinal de *' + n + '* é *' + ord + '*.',
                blocos: [
                    B('📚', 'Os que mais caem', [
                        '1º primeiro, 2º segundo, 3º terceiro, 4º quarto, 5º quinto.',
                        '10º décimo, 20º vigésimo, 30º trigésimo, 40º quadragésimo.',
                        '50º quinquagésimo, 60º sexagésimo, 70º septuagésimo.',
                        '80º octogésimo, 90º nonagésimo, 100º centésimo, 1000º milésimo.'
                    ]),
                    B('⚠️', 'Cuidado', ['Ordinal concorda com o substantivo: a quinta aula, o quinto ano.'])
                ]
            }
        }
    }
]

// Pares que confundem: um comando para cada, todos com a mesma casca.
for (const [id, par] of Object.entries(PARES)) {
    OPS_PORTUGUES.push({
        id: 'par_' + id, sub: 'Português', emoji: par.emoji, titulo: par.titulo,
        descricao: 'Quando usar ' + par.titulo.toLowerCase(),
        ajuda: par.resumo + ' Mande a frase e eu confiro o uso.',
        usage: '<frase>', examples: [par.formas[0] + ' ... — mande a frase inteira que eu analiso'],
        run: (t) => {
            const r = analisarPar(id, t)
            const ficha = B('📚', 'A regra', par.ficha)
            if (!r || !r.casos.length) {
                return {
                    intro: par.resumo,
                    blocos: [ficha, B('💡', 'Quer que eu confira?', ['Mande uma frase usando uma das formas e eu digo se está certa.'])]
                }
            }
            return {
                intro: par.resumo,
                blocos: [
                    B('🔍', 'Na sua frase', r.casos.map(c =>
                        (c.ok === true ? '✅ ' : c.ok === false ? '❌ ' : '🔎 ') + '*' + c.trecho + '* — ' + c.porque)),
                    ficha
                ]
            }
        }
    })
}

// ═══════════════════════════════════════════════════════════════════════════
// REDAÇÃO: operações
// ═══════════════════════════════════════════════════════════════════════════

const OPS_REDACAO = [
    {
        id: 'dissertacao', sub: 'Redação', emoji: '📄', titulo: 'Estrutura da dissertação',
        descricao: 'Mostra a estrutura da dissertação do ENEM',
        ajuda: 'A dissertação argumentativa do ENEM tem quatro ou cinco parágrafos, cada um com uma função.',
        usage: '[tema]', examples: ['sem nada — mostra a estrutura', 'violência no trânsito — aplica ao tema'],
        run: (t) => {
            const tema = String(t).trim()
            return {
                intro: tema ? 'Estrutura da dissertação aplicada a: ' + tema + '.' : 'A estrutura da dissertação argumentativa do ENEM.',
                blocos: [
                    B('1️⃣', 'Introdução (4 a 6 linhas)', [
                        'Contextualize com repertório: um fato, uma lei, um autor.',
                        'Apresente o problema.',
                        'Feche com a tese e os dois argumentos que virão.'
                    ]),
                    B('2️⃣', 'Desenvolvimento 1 (7 a 9 linhas)', [
                        'Primeira frase: o argumento, anunciado.',
                        'Repertório que sustenta.',
                        'Explicação de como aquilo prova o argumento.',
                        'Fechamento retomando a tese.'
                    ]),
                    B('3️⃣', 'Desenvolvimento 2 (7 a 9 linhas)', [
                        'Mesmo esqueleto, com argumento de outra natureza.',
                        'Se o primeiro foi estrutural, este pode ser cultural.'
                    ]),
                    B('4️⃣', 'Conclusão (5 a 7 linhas)', [
                        'Retome a tese em outras palavras.',
                        'Apresente a proposta de intervenção com os cinco elementos.'
                    ]),
                    B('📏', 'Conta de linhas', ['O mínimo é 8 linhas e o máximo é 30. Mire entre 25 e 30.'])
                ]
            }
        }
    },
    {
        id: 'tese', sub: 'Redação', emoji: '🎯', titulo: 'Montar a tese',
        descricao: 'Ajuda a montar a tese a partir do tema',
        ajuda: 'Mande o tema e eu monto uma tese possível, com a fórmula para você montar as suas.',
        usage: '<tema>', examples: ['desafios da educação no Brasil — monta uma tese'],
        run: (t) => {
            const r = montarTese(t || 'o tema proposto')
            return {
                intro: 'Tese para: ' + r.tema,
                blocos: [
                    B('🎯', 'Uma tese possível', [r.tese]),
                    B('🧮', 'A fórmula', [r.formula]),
                    B('🪜', 'Passo a passo', r.passos),
                    B('⚠️', 'Erro comum', [r.erro])
                ]
            }
        }
    },
    {
        id: 'argumento', sub: 'Redação', emoji: '🧱', titulo: 'Montar um argumento',
        descricao: 'Monta o esqueleto do parágrafo argumentativo',
        ajuda: 'Mande o tema e eu devolvo o esqueleto do parágrafo, com repertório se eu tiver.',
        usage: '<tema>', examples: ['educação — esqueleto com repertório da área'],
        run: (t) => {
            const r = montarArgumento(t || 'o tema')
            return {
                intro: 'Esqueleto de argumento para: ' + (r.tema || 'o tema'),
                blocos: [
                    B('🧱', 'As cinco partes do parágrafo', r.esqueleto),
                    r.repertorio ? B('📚', 'Repertório de ' + r.area, r.repertorio) : B('💡', 'Sobre repertório',
                        ['Não reconheci a área do tema. Áreas que eu conheço: ' + Object.keys(REPERTORIOS).join(', ') + '.']),
                    B('⚠️', 'Cuidado', ['Repertório citado e abandonado não vale ponto. Explique numa frase o que ele prova.'])
                ]
            }
        }
    },
    {
        id: 'repertorio', sub: 'Redação', emoji: '📚', titulo: 'Repertório por tema',
        descricao: 'Sugere repertório legitimado para o tema',
        ajuda: 'Repertório é o conhecimento de fora que você traz: lei, dado, autor, obra, fato histórico.',
        usage: '<área do tema>', examples: ['meio ambiente — traz leis e acordos', 'sem nada — lista as áreas'],
        run: (t) => {
            const p = normal(t)
            const chave = Object.keys(REPERTORIOS).find(k => p && (normal(k).includes(p) || p.includes(normal(k))))
            if (!chave) {
                return {
                    intro: 'Escolha uma área para eu trazer o repertório.',
                    blocos: [
                        B('📚', 'Áreas que eu tenho', Object.keys(REPERTORIOS).map(k => '• ' + k)),
                        B('💡', 'O que serve de repertório', ['Lei e Constituição', 'Dado de órgão oficial', 'Filósofo ou sociólogo', 'Obra literária, filme ou série', 'Fato histórico'])
                    ]
                }
            }
            return {
                intro: 'Repertório para temas de ' + chave + '.',
                blocos: [
                    B('📚', 'Pode usar', REPERTORIOS[chave].map(r => '• ' + r)),
                    B('✍️', 'Como encaixar', ['Cite em uma frase, explique em outra e ligue ao seu argumento na terceira. Três frases bastam.'])
                ]
            }
        }
    },
    {
        id: 'intervencao', sub: 'Redação', emoji: '🛠️', titulo: 'Proposta de intervenção',
        descricao: 'Monta a proposta com os cinco elementos',
        ajuda: 'A competência 5 vale 200 pontos e é a mais fácil de garantir: são cinco elementos.',
        usage: '<tema>', examples: ['evasão escolar — monta a proposta pronta'],
        run: (t) => {
            const r = montarIntervencao(t)
            return {
                intro: 'Proposta de intervenção para: ' + r.tema,
                blocos: [
                    B('🧩', 'Os cinco elementos', r.elementos.map(([nome, oque]) => '*' + nome + ':* ' + oque)),
                    B('✍️', 'Modelo pronto', [r.modelo]),
                    B('✅', 'Confira antes de entregar', [r.conferencia]),
                    B('🚫', 'O que zera a competência', ['Proposta que fere os direitos humanos zera esta competência inteira.'])
                ]
            }
        }
    },
    {
        id: 'introducao', sub: 'Redação', emoji: '🚪', titulo: 'Abrir a redação',
        descricao: 'Ensina a montar o parágrafo de introdução',
        ajuda: 'A introdução tem três movimentos e cabe em cinco linhas.',
        usage: '[tema]', examples: ['saúde mental — mostra um modelo com o tema'],
        run: (t) => {
            const tema = String(t).trim() || 'o tema da prova'
            return {
                intro: 'Como abrir a redação sobre ' + tema + '.',
                blocos: [
                    B('🪜', 'Os três movimentos', [
                        '1. *Contextualização:* comece pelo mundo, não pelo tema. Uma lei, um autor, um fato.',
                        '2. *Apresentação do problema:* estreite até o recorte exato da proposta.',
                        '3. *Tese:* sua posição, com os dois argumentos anunciados.'
                    ]),
                    B('✍️', 'Modelo', [
                        'A Constituição de 1988 garante direitos que, na prática, esbarram na desigualdade. ' +
                        'Nesse cenário, ' + tema + ' permanece sem solução no Brasil. ' +
                        'Isso ocorre pela ausência de políticas públicas eficazes e pela naturalização cultural do problema.'
                    ]),
                    B('🚫', 'Como não abrir', [
                        'Nada de "desde os primórdios" nem de "nos dias de hoje".',
                        'Nada de pergunta retórica no lugar da tese.',
                        'Nada de repetir o texto motivador palavra por palavra.'
                    ])
                ]
            }
        }
    },
    {
        id: 'desenvolvimento', sub: 'Redação', emoji: '🏗️', titulo: 'Parágrafo de desenvolvimento',
        descricao: 'Ensina a construir o parágrafo do meio',
        ajuda: 'Cada parágrafo de desenvolvimento defende um argumento e só um.',
        usage: '[tema]', examples: ['tecnologia — mostra o modelo com o tema'],
        run: (t) => {
            const tema = String(t).trim() || 'o problema discutido'
            return {
                intro: 'Como construir o parágrafo de desenvolvimento sobre ' + tema + '.',
                blocos: [
                    B('🧱', 'A ordem das frases', [
                        '1. *Tópico frasal:* o argumento em uma frase.',
                        '2. *Repertório:* a prova externa.',
                        '3. *Costura:* o que essa prova mostra.',
                        '4. *Consequência:* o efeito no mundo real.',
                        '5. *Fechamento:* retomada da tese.'
                    ]),
                    B('🔗', 'Comece com conectivo', [CONECTIVOS.adição.slice(0, 4).join(', ') + '.']),
                    B('⚠️', 'Um por parágrafo', ['Dois argumentos no mesmo parágrafo viram dois argumentos mal explicados.'])
                ]
            }
        }
    },
    {
        id: 'conclusao', sub: 'Redação', emoji: '🏁', titulo: 'Fechar a redação',
        descricao: 'Ensina a montar o parágrafo de conclusão',
        ajuda: 'A conclusão retoma a tese e traz a proposta de intervenção.',
        usage: '[tema]', examples: ['violência urbana — mostra um fechamento pronto'],
        run: (t) => {
            const tema = String(t).trim() || 'o problema'
            const r = montarIntervencao(tema)
            return {
                intro: 'Como fechar a redação sobre ' + tema + '.',
                blocos: [
                    B('🪜', 'Os dois movimentos', [
                        '1. *Retomada:* repita a tese com outras palavras, em uma frase.',
                        '2. *Intervenção:* os cinco elementos, em uma ou duas frases.'
                    ]),
                    B('🔗', 'Conectivos de conclusão', [CONECTIVOS.conclusão.join(', ') + '.']),
                    B('✍️', 'Modelo', [r.modelo]),
                    B('🚫', 'O que não fazer', ['Não traga argumento novo na conclusão.', 'Não termine com pergunta.', 'Não escreva "espero ter ajudado".'])
                ]
            }
        }
    },
    {
        id: 'conectivos', sub: 'Redação', emoji: '🔗', titulo: 'Conectivos por função',
        descricao: 'Lista conectivos separados pela função',
        ajuda: 'Conectivo errado muda o sentido da frase. Escolha pela função, não pela beleza.',
        usage: '[função]', examples: ['oposição — só os de oposição', 'sem nada — todos'],
        run: (t) => {
            const p = normal(t)
            const chave = Object.keys(CONECTIVOS).find(k => p && normal(k).includes(p))
            if (chave) {
                return {
                    intro: 'Conectivos de ' + chave + '.',
                    blocos: [
                        B('🔗', 'Pode usar', CONECTIVOS[chave].map(c => '• ' + c)),
                        B('💡', 'Como usar', ['Varie: repetir o mesmo conectivo no começo de todos os parágrafos derruba a competência 4.'])
                    ]
                }
            }
            return {
                intro: 'Conectivos organizados por função.',
                blocos: Object.entries(CONECTIVOS).slice(0, 8).map(([f, lista]) => B('🔗', maiuscula(f), [lista.slice(0, 5).join(', ') + '.']))
            }
        }
    },
    {
        id: 'paragrafo', sub: 'Redação', emoji: '🔬', titulo: 'Raio X do parágrafo',
        descricao: 'Mede o parágrafo que você escrever',
        ajuda: 'Cole o parágrafo e eu conto palavras, acho repetição, frase longa e marca de oralidade.',
        usage: '<seu parágrafo>', examples: ['cole o parágrafo da sua redação e eu meço tudo'],
        run: (t) => {
            const r = analisarParagrafo(t)
            return {
                intro: r.palavras + ' palavras, ' + r.frases + ' frase(s), cerca de ' + r.linhas + ' linhas na folha.',
                blocos: [
                    B('📊', 'Medidas', [
                        '*Palavras:* ' + r.palavras,
                        '*Frases:* ' + r.frases,
                        '*Média por frase:* ' + r.mediaPorFrase + ' palavras',
                        '*Linhas estimadas:* ' + r.linhas + ' (cerca de 45 caracteres por linha)'
                    ]),
                    r.longas.length ? B('📏', 'Frase longa demais', r.longas.map(f => f.n + ' palavras: ' + recortar(f.frase, 90))) : null,
                    r.repetidas.length ? B('♻️', 'Palavras repetidas', r.repetidas.map(x => '*' + x.palavra + ':* ' + x.n + ' vezes')) : null,
                    r.oralidade.length ? B('💬', 'Marca de oralidade', [r.oralidade.join(', ') + ' — troque por vocabulário formal.']) : null,
                    r.cliches.length ? B('🥱', 'Clichê de abertura', [r.cliches.join(', ') + ' — o corretor lê isso mil vezes por dia.']) : null,
                    r.pessoal.length ? B('🙋', 'Primeira pessoa', [r.pessoal.join(', ') + ' — a dissertação do ENEM é impessoal.']) : null,
                    r.conectivos.length ? B('🔗', 'Conectivos usados', r.conectivos) : B('🔗', 'Conectivos', ['Não achei conectivo nenhum. Sem eles, a competência 4 cai.'])
                ].filter(Boolean)
            }
        }
    },
    {
        id: 'repeticao', sub: 'Redação', emoji: '♻️', titulo: 'Caçar repetição',
        descricao: 'Mostra as palavras repetidas no seu texto',
        ajuda: 'Repetição é o erro de coesão mais comum e o mais fácil de arrumar.',
        usage: '<seu texto>', examples: ['cole o parágrafo e eu conto as repetições'],
        run: (t) => {
            const r = analisarParagrafo(t)
            return {
                intro: r.repetidas.length ? 'Achei ' + r.repetidas.length + ' palavra(s) repetida(s) três vezes ou mais.' : 'Nenhuma palavra repetida três vezes ou mais. Bom sinal.',
                blocos: [
                    r.repetidas.length ? B('♻️', 'Repetidas', r.repetidas.map(x => '*' + x.palavra + ':* ' + x.n + ' vezes')) : null,
                    B('🔧', 'Como resolver sem dicionário', [
                        'Troque por pronome: "o problema" vira "ele".',
                        'Troque por expressão que retoma: "tal questão", "esse cenário".',
                        'Corte: às vezes a palavra repetida nem precisava estar lá.',
                        'Reescreva a frase de outro jeito, em vez de caçar sinônimo difícil.'
                    ])
                ].filter(Boolean)
            }
        }
    },
    {
        id: 'fraselonga', sub: 'Redação', emoji: '📏', titulo: 'Caçar frase longa',
        descricao: 'Aponta as frases longas demais do texto',
        ajuda: 'Frase com mais de 25 palavras costuma esconder erro de concordância.',
        usage: '<seu texto>', examples: ['cole o parágrafo e eu meço cada frase'],
        run: (t) => {
            const r = analisarParagrafo(t)
            return {
                intro: r.longas.length ? 'Achei ' + r.longas.length + ' frase(s) longa(s) demais.' : 'Nenhuma frase passou de 25 palavras. Está no tamanho certo.',
                blocos: [
                    r.longas.length ? B('📏', 'As longas', r.longas.map(f => f.n + ' palavras: ' + recortar(f.frase, 100))) : null,
                    B('📊', 'Sua média', ['*Média por frase:* ' + r.mediaPorFrase + ' palavras. O bom fica entre 15 e 22.']),
                    B('🔧', 'Como cortar', [
                        'Ache o "que" e troque por um ponto final.',
                        'Uma ideia por frase.',
                        'Leia em voz alta: se faltar ar, a frase é longa demais.'
                    ])
                ].filter(Boolean)
            }
        }
    },
    {
        id: 'oralidade', sub: 'Redação', emoji: '💬', titulo: 'Caçar marca de oralidade',
        descricao: 'Aponta gíria e fala coloquial no texto',
        ajuda: 'O que serve na conversa derruba a competência 1 na prova.',
        usage: '<seu texto>', examples: ['A gente vê que tá muito ruim — aponta as marcas'],
        run: (t) => {
            const r = analisarParagrafo(t)
            return {
                intro: r.oralidade.length ? 'Achei ' + r.oralidade.length + ' marca(s) de oralidade.' : 'Não achei marca de oralidade da minha lista.',
                blocos: [
                    r.oralidade.length ? B('💬', 'Para trocar', r.oralidade.map(o => '*' + o + '* — troque por vocabulário formal')) : null,
                    B('🔁', 'Trocas diretas', [
                        'a gente → nós, a sociedade, os cidadãos',
                        'pra → para', 'tá → está', 'né → (corte)',
                        'coisa → fator, elemento, aspecto', 'tipo → como, a exemplo de'
                    ]),
                    r.pessoal.length ? B('🙋', 'Primeira pessoa', [r.pessoal.join(', ') + ' — na dissertação do ENEM, evite.']) : null
                ].filter(Boolean)
            }
        }
    },
    {
        id: 'contarpalavras', sub: 'Redação', emoji: '🧮', titulo: 'Contar palavras e linhas',
        descricao: 'Conta palavras e estima as linhas na folha',
        ajuda: 'A folha do ENEM tem 30 linhas. Conto o que você escreveu e estimo quantas linhas dá.',
        usage: '<seu texto>', examples: ['cole o texto e eu conto tudo'],
        run: (t) => {
            const r = analisarParagrafo(t)
            const situacao = r.linhas < 8 ? 'Abaixo do mínimo: menos de 8 linhas recebe nota zero.'
                : r.linhas > 30 ? 'Acima de 30 linhas: o que passar da folha não é corrigido.'
                    : r.linhas < 20 ? 'Dá para crescer: mire entre 25 e 30 linhas.'
                        : 'Tamanho bom para a folha do ENEM.'
            return {
                intro: r.palavras + ' palavras, ' + r.caracteres + ' caracteres, cerca de ' + r.linhas + ' linhas.',
                blocos: [
                    B('📊', 'Contagem', [
                        '*Palavras:* ' + r.palavras,
                        '*Caracteres:* ' + r.caracteres,
                        '*Frases:* ' + r.frases,
                        '*Linhas estimadas:* ' + r.linhas
                    ]),
                    B('📐', 'Leitura', [situacao]),
                    B('⚠️', 'Sobre a estimativa', ['A conta usa 45 caracteres por linha. Letra grande ocupa mais, letra miúda ocupa menos.'])
                ]
            }
        }
    },
    {
        id: 'coesao', sub: 'Redação', emoji: '🧷', titulo: 'Coesão do texto',
        descricao: 'Confere os conectivos e as retomadas do texto',
        ajuda: 'Coesão é o que amarra uma frase na outra. Sem ela, o texto vira lista.',
        usage: '<seu texto>', examples: ['cole dois parágrafos e eu olho a amarração'],
        run: (t) => {
            const r = analisarParagrafo(t)
            return {
                intro: r.conectivos.length ? 'Achei ' + r.conectivos.length + ' conectivo(s) no seu texto.' : 'Não achei conectivo nenhum: a coesão está solta.',
                blocos: [
                    r.conectivos.length ? B('🔗', 'Conectivos usados', r.conectivos) : null,
                    r.repetidas.length ? B('♻️', 'Retomadas que viraram repetição', r.repetidas.map(x => '*' + x.palavra + ':* ' + x.n + ' vezes')) : null,
                    B('🧰', 'Os dois tipos de coesão', [
                        '*Referencial:* retomar sem repetir — pronome, sinônimo, expressão resumidora.',
                        '*Sequencial:* ligar as ideias — conectivos de adição, oposição, causa, conclusão.'
                    ]),
                    B('💡', 'Regra prática', ['Um conectivo diferente abrindo cada parágrafo, e pelo menos dois dentro de cada um.'])
                ].filter(Boolean)
            }
        }
    },
    {
        id: 'errosnota', sub: 'Redação', emoji: '⚠️', titulo: 'Erros que mais tiram nota',
        descricao: 'Lista os erros que mais derrubam a nota',
        ajuda: 'A lista do que o corretor mais desconta, em ordem de estrago.',
        usage: '[palavra]', examples: ['fuga — procura o erro de fuga ao tema', 'sem nada — mostra tudo'],
        run: (t) => {
            const p = normal(t)
            const achados = p ? ERROS_QUE_TIRAM_NOTA.filter(e => normal(e).includes(p)) : ERROS_QUE_TIRAM_NOTA
            return {
                intro: 'O que mais derruba nota na redação.',
                blocos: [
                    B('⚠️', 'A lista', achados.length ? achados : ERROS_QUE_TIRAM_NOTA),
                    B('💡', 'O mais caro de todos', ['Fuga ao tema zera a redação inteira. Antes de escrever, sublinhe o recorte da proposta e não saia dele.'])
                ]
            }
        }
    },
    {
        id: 'cronograma', sub: 'Redação', emoji: '⏱️', titulo: 'Tempo de prova',
        descricao: 'Divide o tempo da redação minuto a minuto',
        ajuda: 'Sessenta minutos de redação, divididos em seis blocos.',
        usage: '[minutos disponíveis]', examples: ['90 — refaz a conta para 90 minutos'],
        run: (t) => {
            const min = parseInt(String(t).replace(/[^\d]/g, ''), 10)
            const total = Number.isFinite(min) && min >= 20 && min <= 300 ? min : 60
            const fator = total / 60
            return {
                intro: 'Como dividir ' + total + ' minutos de redação.',
                blocos: [
                    B('⏱️', 'Bloco a bloco', CRONOGRAMA_REDACAO.map(([tempo, oque]) => {
                        const n = Math.round(parseInt(tempo, 10) * fator)
                        return '*' + n + ' min:* ' + oque
                    })),
                    B('💡', 'A regra que salva', ['Passe a limpo com pelo menos 10 minutos de sobra. Rascunho incompleto na folha oficial não é corrigido.'])
                ]
            }
        }
    },
    {
        id: 'titulo', sub: 'Redação', emoji: '🏷️', titulo: 'Título da redação',
        descricao: 'Ajuda a criar o título e diz quando usar',
        ajuda: 'No ENEM o título é opcional. Se for pôr, que seja curto e sem ponto final.',
        usage: '<tema>', examples: ['desafios do transporte público — sugere títulos'],
        run: (t) => {
            const tema = String(t).trim() || 'o tema'
            const limpo = tema.replace(/^(os|as|o|a)\s+/i, '')
            return {
                intro: 'Títulos possíveis para: ' + tema,
                blocos: [
                    B('🏷️', 'Sugestões', [
                        'O desafio de enfrentar ' + limpo,
                        limpo.charAt(0).toUpperCase() + limpo.slice(1) + ': um problema de todos',
                        'Entre o direito e a realidade: ' + limpo
                    ]),
                    B('📏', 'Regras do título', [
                        'Sem ponto final.',
                        'Curto: até oito palavras.',
                        'Não pode ser a cópia do tema.',
                        'No ENEM é opcional: título ruim atrapalha mais do que ajuda.'
                    ])
                ]
            }
        }
    },
    {
        id: 'temas', sub: 'Redação', emoji: '🗞️', titulo: 'Temas para treinar',
        descricao: 'Sugere temas de redação para treinar',
        ajuda: 'Temas na linha do que costuma cair: problema social brasileiro com solução possível.',
        usage: '[área]', examples: ['saúde — temas dessa área', 'sem nada — mostra várias áreas'],
        run: (t) => {
            const p = normal(t)
            const temas = {
                educação: ['Caminhos para reduzir a evasão escolar no ensino médio', 'O desafio da inclusão de alunos com deficiência na escola pública'],
                saúde: ['Desafios do cuidado com a saúde mental de jovens no Brasil', 'O combate à desinformação sobre vacinas'],
                tecnologia: ['Os limites da vigilância digital no Brasil', 'Trabalho por aplicativo e a falta de direitos'],
                'meio ambiente': ['Caminhos para o descarte consciente de lixo eletrônico', 'A crise hídrica nas grandes cidades'],
                cultura: ['A valorização das culturas indígenas no Brasil', 'O acesso ao livro em um país de poucas bibliotecas'],
                cidadania: ['O envelhecimento da população e o direito à cidade', 'Caminhos para combater a violência contra a mulher']
            }
            const chave = Object.keys(temas).find(k => p && normal(k).includes(p))
            const escolhidos = chave ? temas[chave] : Object.values(temas).flat()
            return {
                intro: chave ? 'Temas de ' + chave + ' para treinar.' : 'Temas para treinar redação.',
                blocos: [
                    B('🗞️', 'Escolha um', escolhidos.map(x => '• ' + x)),
                    B('💡', 'Como treinar', ['Escreva uma por semana, cronometrada, e corrija pelas cinco competências. Uma redação corrigida vale dez sem correção.'])
                ]
            }
        }
    },
    {
        id: 'checklist', sub: 'Redação', emoji: '✅', titulo: 'Conferir antes de entregar',
        descricao: 'Lista de conferência antes de entregar a prova',
        ajuda: 'Os últimos cinco minutos valem muito: é onde se acha o erro bobo.',
        usage: '[seu texto]', examples: ['cole o texto e eu confiro o que dá para medir'],
        run: (t) => {
            const texto = String(t).trim()
            const r = texto ? analisarParagrafo(texto) : null
            return {
                intro: 'O que conferir antes de entregar.',
                blocos: [
                    B('✅', 'Lista de conferência', [
                        'O texto responde ao recorte exato do tema?',
                        'A tese aparece na introdução e volta na conclusão?',
                        'Cada parágrafo de desenvolvimento tem um argumento só?',
                        'A proposta de intervenção tem os cinco elementos?',
                        'Cada parágrafo começa com um conectivo diferente?',
                        'Tem entre 25 e 30 linhas?',
                        'A letra está legível?',
                        'Não sobrou gíria, "a gente" nem "pra"?'
                    ]),
                    r ? B('🔬', 'O que eu medi no seu texto', [
                        '*Palavras:* ' + r.palavras + ' | *Linhas estimadas:* ' + r.linhas,
                        '*Oralidade:* ' + (r.oralidade.length ? r.oralidade.join(', ') : 'nada encontrado'),
                        '*Repetições:* ' + (r.repetidas.length ? r.repetidas.map(x => x.palavra).join(', ') : 'nenhuma'),
                        '*Conectivos:* ' + (r.conectivos.length || 0)
                    ]) : null
                ].filter(Boolean)
            }
        }
    },
    {
        id: 'reescrever', sub: 'Redação', emoji: '✏️', titulo: 'Deixar a frase formal',
        descricao: 'Mostra como formalizar a frase que você mandar',
        ajuda: 'Mande a frase como você falaria e eu mostro o que trocar para a escrita formal.',
        usage: '<frase>', examples: ['A gente tem que fazer alguma coisa pra melhorar isso'],
        run: (t) => {
            const original = String(t).trim()
            const trocas = [
                [/\ba gente\b/giu, 'nós / a sociedade'],
                [/\bpra\b/giu, 'para'], [/\bpro\b/giu, 'para o'], [/\btá\b/giu, 'está'],
                [/\bnéh?\b/giu, '(corte)'], [/\btipo\b/giu, 'como'], [/\bcoisa\b/giu, 'fator'],
                [/\bum monte de\b/giu, 'grande parte de'], [/\btem que\b/giu, 'deve'],
                [/\bmuito\s+muito\b/giu, 'extremamente'], [/\bfazer alguma coisa\b/giu, 'adotar medidas']
            ]
            const achadas = []
            let reescrita = original
            for (const [re, certo] of trocas) {
                if (re.test(original)) {
                    achadas.push('*' + original.match(re)[0] + '* → ' + certo)
                    reescrita = reescrita.replace(re, certo.split(' / ')[0].replace('(corte)', ''))
                }
            }
            return {
                intro: achadas.length ? 'Achei ' + achadas.length + ' troca(s) para deixar a frase formal.' : 'Não achei marca de informalidade da minha lista nessa frase.',
                blocos: [
                    achadas.length ? B('🔁', 'Trocas', achadas) : null,
                    achadas.length ? B('✏️', 'Como ficaria', [reescrita.replace(/\s{2,}/g, ' ').trim()]) : null,
                    B('📚', 'O que é escrita formal', [
                        'Terceira pessoa: nada de "eu acho".',
                        'Vocabulário preciso, sem gíria.',
                        'Frases curtas e conectadas.',
                        'Nada de abreviação nem de emoji.'
                    ])
                ].filter(Boolean)
            }
        }
    }
]

// Competências do ENEM: uma ficha para cada.
for (const comp of COMPETENCIAS) {
    OPS_REDACAO.push({
        id: 'comp' + comp.n, sub: 'Redação', emoji: '5️⃣'.replace('5', String(comp.n)), titulo: 'Competência ' + comp.n,
        descricao: 'Competência ' + comp.n + ': ' + comp.nome,
        ajuda: 'A competência ' + comp.n + ' vale 200 pontos: ' + comp.nome + '.',
        usage: '[seu texto]', examples: ['sem nada — mostra a ficha da competência'],
        run: () => ({
            intro: 'Competência ' + comp.n + ' — ' + comp.nome + ' (200 pontos).',
            blocos: [
                B('📖', 'O que a banca pede', [comp.oque]),
                B('✅', 'Como ganhar ponto', comp.ganha),
                B('❌', 'Como perder ponto', comp.perde)
            ]
        })
    })
}

// Conectivos por função: um comando para as funções que mais aparecem.
for (const funcao of ['adição', 'oposição', 'causa', 'conclusão', 'exemplificação', 'finalidade']) {
    OPS_REDACAO.push({
        id: 'conec_' + normal(funcao), sub: 'Redação', emoji: '🔗', titulo: 'Conectivos de ' + funcao,
        descricao: 'Conectivos de ' + funcao + ' para a redação',
        ajuda: 'Os conectivos que marcam ' + funcao + ' entre as ideias.',
        usage: '[sem nada]', examples: ['sem nada — lista os conectivos dessa função'],
        run: () => ({
            intro: 'Conectivos de ' + funcao + '.',
            blocos: [
                B('🔗', 'Pode usar', CONECTIVOS[funcao].map(c => '• ' + c)),
                B('✍️', 'Exemplo de uso', ['"' + maiuscula(CONECTIVOS[funcao][0]) + ', o problema continua sem solução."']),
                B('💡', 'Dica', ['Escolha um diferente para cada parágrafo. Repetir o mesmo é o erro mais comum da competência 4.'])
            ]
        })
    })
}

// Modelos de outros gêneros de texto.
for (const [chave, modelo] of Object.entries(MODELOS_TEXTO)) {
    OPS_REDACAO.push({
        id: 'modelo_' + chave, sub: 'Redação', emoji: '📋', titulo: modelo.titulo,
        descricao: 'Como escrever: ' + modelo.titulo.toLowerCase(),
        ajuda: 'A estrutura de ' + modelo.titulo.toLowerCase() + ', parte por parte.',
        usage: '[assunto]', examples: ['sem nada — mostra a estrutura'],
        run: (t) => {
            const assunto = String(t).trim()
            return {
                intro: modelo.titulo + (assunto ? ' sobre ' + assunto : '') + '.',
                blocos: [
                    B('🧱', 'Estrutura', modelo.partes.map((p, i) => (i + 1) + '. ' + p)),
                    B('💡', 'O que faz diferença', [modelo.dica])
                ]
            }
        }
    })
}

// ═══════════════════════════════════════════════════════════════════════════
// LITERATURA: operações
// ═══════════════════════════════════════════════════════════════════════════

const OPS_LITERATURA = []

for (const [chave, e] of Object.entries(ESCOLAS)) {
    OPS_LITERATURA.push({
        id: 'esc_' + chave, sub: 'Literatura', emoji: '🏛️', titulo: e.nome,
        descricao: 'Escola literária: ' + e.nome,
        ajuda: e.nome + ': ' + e.periodo + '. Mande um nome de autor ou obra para eu procurar dentro da escola.',
        usage: '[autor ou obra]', examples: ['sem nada — ficha da escola', 'autores — só a lista de autores'],
        run: (t) => {
            const filtro = normal(t)
            const blocos = [
                B('📅', 'Quando e onde', ['*Período:* ' + e.periodo, '*Marco inicial:* ' + e.marco]),
                B('🌍', 'Contexto', [e.contexto]),
                B('🔑', 'Características', e.caracteristicas),
                B('✍️', 'Autores', [e.autores.join(', ') + '.']),
                B('📚', 'Obras', [e.obras.join('; ') + '.'])
            ]
            if (filtro) {
                const achados = [
                    ...e.autores.filter(a => normal(a).includes(filtro)).map(a => 'Autor desta escola: ' + a),
                    ...e.obras.filter(o => normal(o).includes(filtro)).map(o => 'Obra desta escola: ' + o),
                    ...e.caracteristicas.filter(c => normal(c).includes(filtro))
                ]
                blocos.unshift(B('🔍', 'Sua busca', achados.length ? achados : ['Não achei "' + String(t).trim() + '" dentro desta escola.']))
            }
            return { intro: e.nome + ' — ' + e.periodo + '.', blocos }
        }
    })
}

const OBRAS_DESTAQUE = ['domcasmurro', 'memoriaspostumas', 'ocortico', 'iracema', 'oguarani',
    'memoriassargento', 'vidassecas', 'capitaesdaareia', 'macunaima', 'grandesertao',
    'horadaestrela', 'ossertoes', 'oslusiadas', 'tortoarado']

/** Monta a ficha de uma obra da tabela. */
function fichaDeObra(o) {
    return {
        intro: '*' + o.titulo + '*, de ' + o.autor + ' (' + o.ano + ') — ' + o.escola + ', ' + o.genero + '.',
        blocos: [
            B('📖', 'Enredo', [o.enredo]),
            B('👥', 'Personagens', o.personagens.map(p => '• ' + p)),
            B('🔑', 'Temas', [o.temas.join(', ') + '.']),
            B('🎯', 'Por que cai na prova', [o.porqueCai])
        ]
    }
}

for (const chave of OBRAS_DESTAQUE) {
    const o = OBRAS[chave]
    OPS_LITERATURA.push({
        id: 'obra_' + chave, sub: 'Literatura', emoji: '📕', titulo: o.titulo,
        descricao: 'Ficha da obra: ' + o.titulo,
        ajuda: 'Ficha de ' + o.titulo + ', de ' + o.autor + ': enredo, personagens, temas e o que cai.',
        usage: '[sem nada]', examples: ['sem nada — mostra a ficha completa'],
        run: () => fichaDeObra(o)
    })
}

OPS_LITERATURA.push(
    {
        id: 'obra', sub: 'Literatura', emoji: '🔎', titulo: 'Procurar uma obra',
        descricao: 'Procura a ficha de qualquer obra da lista',
        ajuda: 'Mande o nome da obra ou do autor e eu trago a ficha.',
        usage: '<obra ou autor>', examples: ['cortiço — traz a ficha de O Cortiço', 'Machado — lista as obras dele'],
        run: (t) => {
            const p = normal(t)
            if (!p) {
                return {
                    intro: 'Tenho ficha destas obras.',
                    blocos: [B('📚', 'Catálogo', Object.values(OBRAS).map(o => '• ' + o.titulo + ' — ' + o.autor))]
                }
            }
            const achada = Object.values(OBRAS).find(o => normal(o.titulo).includes(p))
            if (achada) return fichaDeObra(achada)
            const doAutor = Object.values(OBRAS).filter(o => normal(o.autor).includes(p))
            if (doAutor.length) {
                return {
                    intro: 'Obras de ' + doAutor[0].autor + ' que eu tenho.',
                    blocos: [
                        B('📚', 'Fichas disponíveis', doAutor.map(o => '• ' + o.titulo + ' (' + o.ano + ') — ' + o.escola)),
                        B('💡', 'Para ver uma delas', ['Mande o nome da obra em vez do nome do autor.'])
                    ]
                }
            }
            return {
                intro: 'Não achei "' + String(t).trim() + '" no meu catálogo.',
                blocos: [B('📚', 'O que eu tenho', Object.values(OBRAS).map(o => '• ' + o.titulo + ' — ' + o.autor))]
            }
        }
    },
    {
        id: 'glossarioliterario', sub: 'Literatura', emoji: '📔', titulo: 'Glossário de literatura',
        descricao: 'Explica os termos usados em literatura',
        ajuda: 'Mande o termo e eu explico; sem termo, mostro o glossário inteiro.',
        usage: '[termo]', examples: ['eu lírico — explica o termo', 'sem nada — mostra o glossário'],
        run: (t) => {
            const p = normal(t)
            const achados = p ? GLOSSARIO_LITERARIO.filter(([termo, oque]) => normal(termo).includes(p) || normal(oque).includes(p)) : GLOSSARIO_LITERARIO
            return {
                intro: p ? 'Glossário: "' + String(t).trim() + '".' : 'Glossário de literatura.',
                blocos: [
                    B('📔', 'Termos', (achados.length ? achados : GLOSSARIO_LITERARIO).slice(0, 30).map(([termo, oque]) => '*' + termo + ':* ' + oque)),
                    achados.length ? null : B('💡', 'Não achei', ['Esse termo não está no meu glossário. Mostrei a lista inteira.'])
                ].filter(Boolean)
            }
        }
    },
    {
        id: 'narrador', sub: 'Literatura', emoji: '🗣️', titulo: 'Tipos de narrador',
        descricao: 'Explica os tipos de narrador e foco narrativo',
        ajuda: 'Quem conta a história muda tudo o que a gente sabe dela.',
        usage: '[trecho]', examples: ['sem nada — explica os tipos'],
        run: (t) => {
            const trecho = String(t).trim()
            const primeiraPessoa = /\b(eu|meu|minha|nós|nosso)\b/i.test(trecho)
            return {
                intro: 'Os tipos de narrador.',
                blocos: [
                    B('🗣️', 'Os três principais', [
                        '*Narrador personagem:* está dentro da história e conta em primeira pessoa. Sabe só o que viveu.',
                        '*Narrador observador:* está fora e conta em terceira pessoa. Vê, mas não entra na cabeça de ninguém.',
                        '*Narrador onisciente:* está fora e sabe tudo, inclusive o pensamento das personagens.'
                    ]),
                    trecho ? B('🔍', 'No seu trecho', [
                        primeiraPessoa ? 'Achei pronome de primeira pessoa: provavelmente é narrador personagem.'
                            : 'Não achei primeira pessoa: provavelmente é narrador em terceira pessoa, observador ou onisciente.'
                    ]) : null,
                    B('⚠️', 'Narrador não confiável', [
                        'Quando o narrador tem interesse no que conta, a versão dele pode não ser a verdade.',
                        'É o caso de Bentinho em Dom Casmurro e de Paulo Honório em São Bernardo.'
                    ])
                ].filter(Boolean)
            }
        }
    },
    {
        id: 'versificacao', sub: 'Literatura', emoji: '🎼', titulo: 'Verso, rima e escansão',
        descricao: 'Explica verso, estrofe, rima e contagem poética',
        ajuda: 'Mande um verso e eu conto as sílabas poéticas dele.',
        usage: '[verso]', examples: ['Minha terra tem palmeiras — conta as sílabas poéticas'],
        run: (t) => {
            const verso = String(t).trim()
            let contagem = null
            if (verso) {
                const ps = palavrasDe(verso)
                const ultima = ps[ps.length - 1] || ''
                const c = classificarTonica(ultima)
                const todas = ps.flatMap(p => silabasDe(p))
                const depoisDaTonica = c ? (c.silabas.length - 1 - c.indice) : 0
                contagem = { total: todas.length, poeticas: Math.max(1, todas.length - depoisDaTonica), silabas: todas }
            }
            const nomes = ['', 'monossílabo', 'dissílabo', 'trissílabo', 'tetrassílabo', 'pentassílabo (redondilha menor)',
                'hexassílabo', 'heptassílabo (redondilha maior)', 'octossílabo', 'eneassílabo', 'decassílabo',
                'hendecassílabo', 'dodecassílabo (alexandrino)']
            return {
                intro: contagem ? 'Seu verso tem cerca de ' + contagem.poeticas + ' sílabas poéticas.' : 'Como se conta um verso.',
                blocos: [
                    contagem ? B('🔢', 'A conta', [
                        '*Sílabas gramaticais:* ' + contagem.total,
                        '*Sílabas poéticas:* ' + contagem.poeticas + (nomes[contagem.poeticas] ? ' — ' + nomes[contagem.poeticas] : ''),
                        'A contagem para na última sílaba tônica: o que vem depois não conta.'
                    ]) : null,
                    B('📏', 'Vocabulário', [
                        '*Verso:* cada linha do poema.',
                        '*Estrofe:* grupo de versos.',
                        '*Escansão:* a contagem das sílabas poéticas.',
                        '*Redondilha maior:* sete sílabas, o verso do cordel.',
                        '*Decassílabo:* dez sílabas, o verso de Os Lusíadas.'
                    ]),
                    B('🎵', 'Rimas', [
                        '*Rica:* entre classes diferentes.',
                        '*Pobre:* entre palavras da mesma classe.',
                        '*Consoante:* vogais e consoantes coincidem.',
                        '*Toante:* só as vogais coincidem.',
                        '*Branco:* verso sem rima. *Livre:* verso sem métrica fixa.'
                    ]),
                    B('⚠️', 'Sobre a minha conta', ['A escansão poética junta vogais de palavras vizinhas, e isso varia com a leitura. Trate o número como estimativa.'])
                ].filter(Boolean)
            }
        }
    },
    {
        id: 'generos', sub: 'Literatura', emoji: '🎭', titulo: 'Gêneros literários',
        descricao: 'Explica os gêneros lírico, épico e dramático',
        ajuda: 'Os três gêneros clássicos e os formatos da prosa moderna.',
        usage: '[gênero]', examples: ['épico — explica o gênero', 'sem nada — mostra todos'],
        run: (t) => {
            const p = normal(t)
            const generos = [
                ['lírico', 'expressa o sentimento de um eu lírico, em geral em verso — poema, soneto, elegia'],
                ['épico', 'narra feitos heroicos de um povo, em verso longo — epopeia, como Os Lusíadas'],
                ['dramático', 'escrito para ser encenado, só com falas — tragédia, comédia, auto'],
                ['narrativo', 'conta uma história em prosa — conto, novela, romance, crônica']
            ]
            const achados = p ? generos.filter(([g, o]) => normal(g).includes(p) || normal(o).includes(p)) : generos
            return {
                intro: 'Os gêneros literários.',
                blocos: [
                    B('🎭', 'Gêneros', (achados.length ? achados : generos).map(([g, o]) => '*' + g + ':* ' + o)),
                    B('📚', 'Na prosa moderna', [
                        '*Conto:* curto, um conflito só.',
                        '*Novela:* média, vários núcleos em sequência.',
                        '*Romance:* longa, vários conflitos ao mesmo tempo.',
                        '*Crônica:* curta, sobre o cotidiano, entre o jornal e a literatura.'
                    ])
                ]
            }
        }
    },
    {
        id: 'vestibular', sub: 'Literatura', emoji: '🎓', titulo: 'Literatura para a prova',
        descricao: 'Diz o que mais cai de literatura na prova',
        ajuda: 'O que costuma cair e como estudar sem ler tudo.',
        usage: '[escola ou obra]', examples: ['modernismo — o que cai dessa escola'],
        run: (t) => {
            const p = normal(t)
            const achadas = p ? Object.values(OBRAS).filter(o => normal(o.escola).includes(p) || normal(o.titulo).includes(p) || normal(o.autor).includes(p)) : []
            return {
                intro: achadas.length ? 'Obras de "' + String(t).trim() + '" que costumam cair.' : 'Como estudar literatura para a prova.',
                blocos: [
                    achadas.length ? B('🎯', 'O que cai', achadas.map(o => '*' + o.titulo + ':* ' + o.porqueCai)) : null,
                    B('🪜', 'Ordem de estudo', [
                        '1. Aprenda o contexto histórico de cada escola: a prova quase sempre parte dele.',
                        '2. Decore o marco inicial e três características de cada escola.',
                        '3. Leia resumo e análise das obras da sua lista, e leia na íntegra as duas mais cobradas.',
                        '4. Treine comparação entre escolas: o ENEM gosta de pôr dois textos lado a lado.'
                    ]),
                    B('📌', 'As mais cobradas', [
                        'Dom Casmurro e Memórias Póstumas (Machado).',
                        'O Cortiço (Naturalismo).',
                        'Vidas Secas e Capitães da Areia (Modernismo de 30).',
                        'Macunaíma (Modernismo de 22).',
                        'Os Lusíadas e Auto da Barca do Inferno (literatura portuguesa).'
                    ])
                ].filter(Boolean)
            }
        }
    }
)

// ═══════════════════════════════════════════════════════════════════════════
// CATÁLOGO E PORTA DE ENTRADA
// ═══════════════════════════════════════════════════════════════════════════

const OPS = [].concat(OPS_PORTUGUES, OPS_REDACAO, OPS_LITERATURA)
const POR_ID = new Map(OPS.map(o => [o.id, o]))

function opDe(id) {
    const op = POR_ID.get(id)
    if (!op) throw new Error('Operação de português desconhecida: ' + id)
    return op
}

/**
 * Pega o texto: o que a pessoa digitou ou, se não digitou nada, o texto da
 * mensagem respondida.
 */
function entradaDe(args = [], info = null) {
    const direto = Array.isArray(args) ? args.join(' ').trim() : String(args || '').trim()
    if (direto) return limitarEntrada(direto)
    const citada = info?.message?.extendedTextMessage?.contextInfo?.quotedMessage
    if (citada) {
        const texto = citada.conversation
            || citada.extendedTextMessage?.text
            || citada.imageMessage?.caption
            || citada.videoMessage?.caption
            || citada.documentMessage?.caption
            || ''
        if (String(texto).trim()) return limitarEntrada(String(texto).trim())
    }
    return ''
}

/** Roda a operação crua: entra texto, sai o resultado sem apresentação. */
function aplicar(id, bruto) {
    const op = opDe(id)
    return op.run(limitarEntrada(bruto)) || {}
}

/** Tela de "como usar", quando a pessoa chama o comando sem escrever nada. */
function telaDeAjuda(id, { prefix = '.', nome = '' } = {}) {
    const op = opDe(id)
    const exemplos = (op.examples || []).map(e => {
        const [args, oque] = String(e).split(' — ')
        const arg = /^sem nada/i.test(args) ? '' : args
        return '`' + prefix + nome + (arg ? ' ' + arg : '') + '`' + (oque ? ' — ' + oque : '')
    })
    return limitarTela({
        emoji: op.emoji, titulo: op.titulo, prefix,
        intro: op.ajuda,
        secoes: [
            B('✍️', 'Digite assim', ['`' + prefix + nome + ' ' + op.usage + '`']),
            B('💬', 'Exemplo pronto', exemplos)
        ],
        dica: op.dica || 'Você também pode responder a uma mensagem com esse comando, sem digitar o texto de novo.'
    })
}

/** Tela do resultado, pronta para F.tela. */
function telaDeResultado(id, bruto, { prefix = '.', nome = '' } = {}) {
    const op = opDe(id)
    const r = aplicar(id, bruto)
    const secoes = []
    for (const b of (r.blocos || [])) if (b) secoes.push(b)
    if (r.texto !== undefined) secoes.push(B('📄', r.rotulo || 'Resultado', [cortarSaida(r.texto)]))
    return limitarTela({
        emoji: op.emoji, titulo: op.titulo, prefix,
        intro: r.intro || (op.descricao.charAt(0).toUpperCase() + op.descricao.slice(1) + '.'),
        secoes,
        dica: r.dica || op.dica || ''
    })
}

module.exports = {
    // catálogo
    OPS, POR_ID, opDe,
    // porta de entrada
    entradaDe, aplicar, telaDeAjuda, telaDeResultado,
    // fonética e morfologia
    silabasDe, indiceTonica, classificarTonica, encontrosVocalicos, encontrosConsonantais,
    regraDeAcento, pluralDe, pluralComposto, femininoDe, masculinoDe, diminutivoDe,
    aumentativoDe, grausDe,
    // verbos
    conjugar, tipoDeVerbo, infinitivoDe, IRREGULARES,
    // sintaxe
    classificarPalavra, classesDaFrase, analiseSintatica, analisarPeriodo, paraVozPassiva,
    pareceVerbo, pareceAdjetivo,
    // usos que confundem
    analisarCrase, analisarPorque, analisarPar, PARES, ocorrenciasDe,
    analisarConcordanciaVerbal, analisarConcordanciaNominal, analisarRegenciaVerbal,
    analisarColocacao, analisarVirgula,
    // vocabulário e estilo
    VOCABULARIO, COLETIVOS, PARONIMOS, HOMONIMOS, FIGURAS, VICIOS,
    acharFiguras, acharVicios, corrigirOrtografia, analisarHifen, porExtenso, ordinalPorExtenso,
    // redação
    COMPETENCIAS, CONECTIVOS, REPERTORIOS, MODELOS_TEXTO, analisarParagrafo, montarTese,
    montarArgumento, montarIntervencao,
    // literatura
    ESCOLAS, OBRAS, GLOSSARIO_LITERARIO,
    // helpers usados pelos testes
    limitarEntrada, cortarSaida, recortar, limitarTela, tirarAcento, normal, palavrasDe,
    frasesDe, regexPalavra, primeiraPalavra,
    LIMITE_ENTRADA, LIMITE_SAIDA, LIMITE_TELA
}







