/**
 * Donos explícitos de aliases disputados.
 *
 * Quando um alias é declarado por mais de um comando, o loader normalmente aplica
 * "first-wins" (o primeiro a registrar mantém). Este mapa sobrepõe essa regra para
 * os casos em que o vencedor precisa ser um comando específico — em especial os que
 * têm efeito colateral destrutivo se resolverem para o comando errado.
 *
 *   alias (lowercase) -> nome do comando que deve possuí-lo
 */
module.exports = {
    // Efeito destrutivo se resolver errado — prioridade máxima:
    abrir: 'abrirgrupo',   // não pode virar "abrir baú" etc.
    fechar: 'fechargrupo',
    sacar: 'banco',        // sacar dinheiro do banco, não abrir baú
    hit: 'blackjack',      // "hit" é termo do jogo, não atacar boss
    // Ambiguidades de UX:
    falar: 'tts',          // "falar" = texto para voz
    socorro: 'help',       // quem pede socorro quer ajuda, não economia
    audio: 'play',         // alias mais usado
    desligar: 'shutdown',  // desligar o bot (não desligar módulo)
    jobs: 'queue',         // fila de processamento de mídia
    comandos: 'menu',      // lista do menu geral
    pergunta: 'quiz',      // jogo de perguntas
    bolsa: 'acoes',        // bolsa de valores
    telemetria: 'botstats' // estatísticas de telemetria do sistema
}
