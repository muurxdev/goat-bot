/**
 * REGISTRO DE CONFIGURAÇÕES DO BOT.
 *
 * Fonte única do que é configurável, com que escopos aceita e qual o padrão.
 *
 * O bot já resolvia várias configurações por escopo (`configs[grupo].prefix ||
 * configs.global.prefix || padrão`), mas isso vivia espalhado em cada arquivo:
 * não havia lugar para descobrir o que existe, e metade das opções acabou
 * ficando só global por esquecimento, não por decisão.
 *
 * ESCOPOS, do mais específico ao mais geral:
 *   grupo  → JID do grupo        (vale só naquele grupo)
 *   pv     → JID do usuário      (vale só na conversa privada dele)
 *   global → todos os ambientes  (rede de segurança)
 *
 * Quem resolve a precedência é o `settingsService`.
 */

const SETTINGS = [
    {
        chave: 'prefix',
        label: 'Prefixo de comandos',
        tipo: 'texto',
        padrao: '.',
        escopos: ['grupo', 'pv', 'global'],
        descricao: 'Caractere que inicia os comandos. Ex.: "." ou "7" ou "!"'
    },
    {
        chave: 'conversaNatural',
        label: 'Conversa natural',
        tipo: 'bool',
        padrao: true,
        escopos: ['grupo', 'global'],
        descricao: 'Responder perguntas sobre o bot sem precisar de comando'
    },
    {
        chave: 'reacoes',
        label: 'Reações de emoji',
        tipo: 'bool',
        padrao: true,
        escopos: ['grupo', 'global'],
        descricao: 'Marcar a mensagem com o andamento do comando'
    },
    {
        chave: 'warnLimit',
        label: 'Limite de advertências',
        tipo: 'numero',
        padrao: 3,
        escopos: ['grupo', 'global'],
        descricao: 'Quantas advertências até a punição'
    },
    {
        chave: 'antilink',
        label: 'Antilink',
        tipo: 'bool',
        padrao: false,
        escopos: ['grupo'],
        descricao: 'Bloquear links enviados por não-administradores'
    },
    {
        chave: 'antispam',
        label: 'Antispam',
        tipo: 'bool',
        padrao: false,
        escopos: ['grupo'],
        descricao: 'Punir mensagens repetidas em sequência'
    },
    {
        chave: 'antitrava',
        label: 'Antitrava',
        tipo: 'bool',
        padrao: false,
        escopos: ['grupo'],
        descricao: 'Bloquear mensagens gigantes que travam o aparelho'
    },
    {
        chave: 'restrictedToAdmins',
        label: 'Só administradores',
        tipo: 'bool',
        padrao: false,
        escopos: ['grupo'],
        descricao: 'Somente admins podem usar comandos neste grupo'
    },
    {
        chave: 'strictModeration',
        label: 'Moderação rígida',
        tipo: 'bool',
        padrao: false,
        escopos: ['grupo'],
        descricao: 'Aplica as regras também aos administradores'
    },
    {
        chave: 'allowPvXpFarm',
        label: 'XP no privado',
        tipo: 'bool',
        padrao: false,
        escopos: ['pv', 'global'],
        descricao: 'Permitir ganho de XP conversando no privado'
    },
    {
        chave: 'blockAllDMs',
        label: 'Bloquear privado',
        tipo: 'bool',
        padrao: false,
        escopos: ['global'],
        descricao: 'Fechar o atendimento no privado para todos'
    },
    {
        chave: 'autoRejectInvites',
        label: 'Recusar convites',
        tipo: 'bool',
        padrao: false,
        escopos: ['global'],
        descricao: 'Recusar automaticamente convites para grupos'
    }
]

const SETTING_BY_KEY = {}
for (const s of SETTINGS) SETTING_BY_KEY[s.chave] = s

/** Aceita a chave em qualquer caixa e com apelidos comuns. */
const ALIASES = {
    prefixo: 'prefix', prefixos: 'prefix',
    conversa: 'conversaNatural', papo: 'conversaNatural',
    reacao: 'reacoes', emojis: 'reacoes',
    advertencias: 'warnLimit', warns: 'warnLimit',
    somenteadmins: 'restrictedToAdmins', soadmin: 'restrictedToAdmins'
}

/**
 * Resolve a chave canônica de uma configuração.
 * @param {string} entrada
 * @returns {string|null}
 */
function resolveSettingKey(entrada) {
    const bruto = String(entrada || '').trim()
    if (!bruto) return null
    if (SETTING_BY_KEY[bruto]) return bruto
    const minusculo = bruto.toLowerCase().replace(/[^a-z]/g, '')
    if (ALIASES[minusculo]) return ALIASES[minusculo]
    const achado = Object.keys(SETTING_BY_KEY).find(k => k.toLowerCase() === minusculo)
    return achado || null
}

module.exports = { SETTINGS, SETTING_BY_KEY, ALIASES, resolveSettingKey }
