/**
 * LORE DO REINO — fonte única do vocabulário que o usuário lê.
 *
 * Por que existe: quem usa o bot não deve ler "SQL", "buffer", "servidor" ou
 * "Dev Junior". O mundo do RPG é Reino; fora dele, o bot fala português
 * simples, como um atendente. Este arquivo concentra três coisas:
 *
 *   1. PATENTES / RANKS — as hierarquias que aparecem em perfil e ranking.
 *   2. GLOSSARIO — jargão técnico → português simples, aplicado de forma
 *      dinâmica em services/loreService.js sobre tudo que sai para o usuário.
 *      É a rede de segurança: mensagens de erro de biblioteca ("ENOENT",
 *      "timeout") vazam jargão que nenhuma revisão manual pegaria.
 *      Antes o destino era fantasia ("servidor" → "Castelo Central"); o dono
 *      trocou para português simples em 2026-09-15 porque a fantasia confundia
 *      instruções (".modulo on" explicado como "liga este Domínio").
 *   3. ERROS — as frases padrão de falha.
 *
 * Mudar o tom do bot inteiro é mudar este arquivo. Nada de jargão espalhado
 * por milhares de arquivos.
 */

// ══════════════════════════════════════════════════════════════
// HIERARQUIAS
// ══════════════════════════════════════════════════════════════

/**
 * Patente do jogador por nível. Ordem decrescente: o primeiro que couber vence.
 * Substitui a antiga escada de cargos de tecnologia ("Dev Junior", "CTO").
 */
const PATENTES = [
    { min: 1000, nome: (lvl) => `🌌 Divindade Suprema (Era ${Math.floor(lvl / 100)})` },
    { min: 500,  nome: (lvl) => `👹 Rei dos Demônios (Era ${Math.floor(lvl / 50)})` },
    { min: 300,  nome: (lvl) => `✨ Membro do Clã das Deusas (Era ${Math.floor(lvl / 30)})` },
    { min: 200,  nome: (lvl) => `🐲 Demônio Superior (Era ${Math.floor(lvl / 20)})` },
    { min: 150,  nome: (lvl) => `⚔️ Portador de um Mandamento (Era ${Math.floor(lvl / 15)})` },
    { min: 100,  nome: (lvl) => `🌟 Guardião Central (Era ${Math.floor(lvl / 10)})` },
    { min: 75,   nome: () => '💎 Traço Marcante' },
    { min: 50,   nome: () => '👑 Grão-Mestre dos Cavaleiros' },
    { min: 40,   nome: () => '🔥 Grande Cavaleiro Sagrado' },
    { min: 30,   nome: () => '⚡ Cavaleiro Sagrado de Elite' },
    { min: 20,   nome: () => '🛡️ Cavaleiro Sagrado' },
    { min: 10,   nome: () => '🗡️ Aprendiz de Cavaleiro' },
    { min: 0,    nome: () => '🍺 Andarilho do Reino' }
]

/** Escala de poder, usada onde o texto pede "rank" em vez de patente. */
const RANKS = [
    { min: 1000, nome: (lvl) => `🌌 Onipotente (Era ${Math.floor(lvl / 100)})` },
    { min: 500,  nome: () => '👑 Supremo' },
    { min: 300,  nome: () => '🐉 Mítico' },
    { min: 200,  nome: () => '⚡ Divino' },
    { min: 150,  nome: () => '⚔️ Ancestral' },
    { min: 100,  nome: () => '🌟 Celestial' },
    { min: 75,   nome: () => '💎 Diamante' },
    { min: 50,   nome: () => '👑 Lendário' },
    { min: 40,   nome: () => '🔥 Mestre' },
    { min: 30,   nome: () => '⚡ Elite' },
    { min: 20,   nome: () => '🛡️ Veterano' },
    { min: 10,   nome: () => '🗡️ Escudeiro' },
    { min: 0,    nome: () => '🍺 Novato' }
]

function resolverEscala(escala, level) {
    const lvl = Number(level) || 0
    const faixa = escala.find(f => lvl >= f.min) || escala[escala.length - 1]
    return faixa.nome(lvl)
}

// ══════════════════════════════════════════════════════════════
// GLOSSÁRIO — jargão técnico → português simples
// ══════════════════════════════════════════════════════════════

/**
 * Constrói a regra de troca com bordas de palavra que entendem acento.
 *
 * `\b` do JavaScript é ASCII: em "Análise" ele enxerga uma borda entre "n" e
 * "á", e uma regra para "NaN" chegava a casar ali dentro, produzindo
 * "incalculávelálise". As bordas abaixo tratam qualquer letra Unicode como
 * caractere de palavra, então só casam termo inteiro de verdade.
 */
function regra(padrao) {
    return new RegExp(`(?<![\\p{L}\\p{N}_])(?:${padrao})(?![\\p{L}\\p{N}_])`, 'giu')
}

/**
 * Cada entrada é [regex, substituição].
 *
 * Duas regras que evitam português quebrado:
 *
 *  1. GÊNERO: a troca tem o mesmo gênero do termo técnico. "o servidor" vira
 *     "o sistema", "a API" vira "a integração". Assim o artigo que já estava na
 *     frase continua concordando, sem reescrever a frase inteira. É por isso
 *     que algumas trocas não são a palavra mais curta possível.
 *  2. NÚMERO: plurais têm regra própria e vêm ANTES da singular.
 *
 * Termos compostos vêm antes dos simples pelo mesmo motivo de ordem.
 * Variantes sem acento existem porque muita mensagem é escrita sem eles.
 */
const GLOSSARIO = [
    // ── armazenamento ──
    [regra('bancos de dados'), 'registros'],
    [regra('banco de dados'), 'registro'],
    [regra('bases? de dados'), 'base de registros'],
    // "SQLite WAL" virava "registro WAL": o modo de gravação não diz nada a quem lê.
    [regra('SQLite3?\\s+WAL'), 'registro'],
    [regra('SQLite3?'), 'registro'],
    [regra('databases'), 'registros'],
    [regra('database'), 'registro'],
    [regra('queries'), 'consultas'],
    [regra('querys?'), 'consulta'],
    [regra('SQL'), 'registro'],
    [regra('caches'), 'arquivos temporários'],
    [regra('cache'), 'arquivo temporário'],
    [regra('backups'), 'salvamentos'],
    [regra('backup'), 'salvamento'],
    [regra('snapshots'), 'salvamentos'],
    [regra('snapshot'), 'salvamento'],

    // ── infraestrutura ──
    [regra('servidores'), 'sistemas'],
    [regra('servidor'), 'sistema'],
    [regra('servers'), 'sistemas'],
    [regra('server'), 'sistema'],
    [regra('VPS'), 'sistema'],
    // Cada peça com o seu nome: quando tudo virava "sistema", o .status
    // mostrava "SISTEMA & SISTEMA" (servidor & Node) e "Linguagem: sistema".
    [regra('Docker'), 'ambiente do bot'],
    [regra('containers'), 'sistemas'],
    [regra('container(es)?'), 'sistema'],
    [regra('deploys'), 'envios de atualização'],
    [regra('deploy'), 'envio de atualização'],
    [regra('backend'), 'sistema'],
    [regra('endpoints'), 'endereços'],
    [regra('endpoint'), 'endereço'],
    [regra('uptime'), 'tempo no ar'],
    [regra('heap'), 'uso de memória'],
    [regra('mem[óo]ria RAM'), 'memória'],
    [regra('RAM'), 'memória'],
    [regra('CPU'), 'capacidade de processamento'],
    [regra('PID'), 'identificador'],
    [regra('threads'), 'tarefas'],
    [regra('thread'), 'tarefa'],

    // ── rede ──
    [regra('HTTPS?'), 'conexão'],
    [regra('APIs'), 'integrações'],
    [regra('API'), 'integração'],
    [regra('webhooks'), 'avisos automáticos'],
    [regra('webhook'), 'aviso automático'],
    [regra('sockets'), 'canais de conexão'],
    [regra('socket'), 'canal de conexão'],
    [regra('payloads'), 'conteúdos enviados'],
    [regra('payload'), 'conteúdo enviado'],
    [regra('prox(y|ies)'), 'intermediário'],

    // ── linguagens e formatos ──
    [regra('Node\\.?js'), 'motor do bot'],
    [regra('NodeJS'), 'motor do bot'],
    [regra('JavaScript'), 'código do bot'],
    [regra('JSON'), 'arquivo de dados'],
    [regra('XML'), 'arquivo de dados'],
    [regra('YAML'), 'arquivo de dados'],
    [regra('base64'), 'codificação'],
    [regra('UTF-?8'), 'codificação de texto'],
    [regra('padr[ãa]o regex'), 'padrão de busca'],
    [regra('express[õo]es regulares'), 'padrões de busca'],
    [regra('express[ãa]o regular'), 'padrão de busca'],
    [regra('regex'), 'padrão de busca'],
    [regra('scripts'), 'programas'],
    [regra('script'), 'programa'],
    [regra('stacktraces?'), 'detalhes do erro'],
    [regra('stack'), 'detalhes do erro'],

    // ── execução ──
    [regra('buffers'), 'blocos de dados'],
    [regra('buffer'), 'bloco de dados'],
    [regra('timeouts'), 'tempos esgotados'],
    [regra('timeout'), 'tempo esgotado'],
    [regra('callbacks'), 'respostas'],
    [regra('callback'), 'resposta'],
    [regra('parsing'), 'leitura'],
    [regra('parse(ar|d)?'), 'ler'],
    // 'processo' sozinho é português comum ('processo seletivo', 'processo de
    // configuração'). Só o sentido técnico traduz.
    [regra('processos do sistema'), 'tarefas do sistema'],
    [regra('processo do sistema'), 'tarefa do sistema'],
    [regra('processos? (?:node(?:\\.?js)?|filho|principal do bot)'), 'tarefa do bot'],
    [regra('tokens'), 'códigos de acesso'],
    [regra('token'), 'código de acesso'],
    [regra('hashes'), 'códigos de verificação'],
    [regra('hash'), 'código de verificação'],
    [regra('UUIDs'), 'identificadores'],
    [regra('UUID'), 'identificador'],

    // ── valores vazios que nunca deveriam chegar ao usuário ──
    [regra('undefined'), 'desconhecido'],
    [regra('null'), 'vazio'],
    [regra('NaN'), 'incalculável'],
    [regra('Infinity'), 'sem limite'],

    // ── tipos ──
    [regra('booleanos?'), 'sim ou não'],
    [regra('arrays'), 'conjuntos'],
    [regra('array'), 'conjunto'],

    // ── vocabulário do próprio bot ──
    [regra('m[óo]dulos'), 'recursos'],
    [regra('m[óo]dulo'), 'recurso'],
    [regra('stderr'), 'registro de falhas'],
    [regra('stdout'), 'saída'],
    [regra('CLI'), 'terminal'],
    [regra('SDK'), 'biblioteca'],
    [regra('commits'), 'ajustes'],
    [regra('commit'), 'ajuste'],
    [regra('debug(ar|ging)?'), 'diagnóstico']
]

// ══════════════════════════════════════════════════════════════
// FRASES PADRÃO
// ══════════════════════════════════════════════════════════════

/**
 * Mensagens de falha, por tipo. Voz de atendente: o que houve + o que fazer,
 * em primeira pessoa, sem culpar quem pediu.
 */
const ERROS = {
    generico: '❌ Algo deu errado agora. Tente de novo em instantes.',
    indisponivel: '⏸️ Isso não está disponível no momento. Tente mais tarde.',
    semPermissao: '🔒 Esse comando é só para administradores.',
    semRegistro: '📜 Você ainda não tem nome nos registros Central. Crie com `.login <seu nick>`.',
    naoEncontrado: '🔍 Não encontrei o que você procurou.',
    tempoEsgotado: '⏳ Demorou demais e eu desisti. Tente de novo.',
    semRecurso: '🪙 Você não tem moedas suficientes para isso.',
    forcaInsuficiente: '⚔️ Sua força ainda não é suficiente para este desafio.',
    aguarde: '⏳ Espere um pouco antes de usar de novo.'
}

/** Selo assinado ao pé de mensagens de sistema. */
const ASSINATURA = '🏆 _Clube dos Campeões | GOAT_'

module.exports = {
    PATENTES,
    RANKS,
    GLOSSARIO,
    ERROS,
    ASSINATURA,
    resolverEscala
}
