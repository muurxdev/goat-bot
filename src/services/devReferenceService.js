/**
 * Referência técnica do Skycode.
 *
 * A pasta dev já tinha 150 ferramentas que FAZEM coisas — hash, encode,
 * gerador, cheatsheet. O que faltava era o material de consulta: qual a
 * complexidade de um algoritmo, quando usar uma estrutura em vez de outra, o
 * que um padrão de projeto resolve.
 *
 * Tudo é catálogo estático e local: responde na hora e não depende de rede.
 * Comandos desta seção não passam pelo tradutor do Reino — aqui o termo
 * técnico é o assunto.
 */

/** Complexidades, da melhor para a pior, com o que cada uma significa na prática. */
const COMPLEXIDADES = {
    constante: {
        notacao: 'O(1)', nome: 'Constante',
        significado: 'O tempo não muda com o tamanho da entrada.',
        exemplo: 'Acessar um índice de array, ler de um hash map.',
        em1milhao: '1 operação'
    },
    logaritmica: {
        notacao: 'O(log n)', nome: 'Logarítmica',
        significado: 'Dobrar a entrada acrescenta um passo só.',
        exemplo: 'Busca binária, altura de árvore balanceada.',
        em1milhao: '~20 operações'
    },
    linear: {
        notacao: 'O(n)', nome: 'Linear',
        significado: 'O tempo cresce junto com a entrada.',
        exemplo: 'Percorrer uma lista, buscar sem índice.',
        em1milhao: '1 milhão de operações'
    },
    linearitmica: {
        notacao: 'O(n log n)', nome: 'Linearítmica',
        significado: 'O melhor possível para ordenação por comparação.',
        exemplo: 'Merge sort, quick sort no caso médio.',
        em1milhao: '~20 milhões de operações'
    },
    quadratica: {
        notacao: 'O(n²)', nome: 'Quadrática',
        significado: 'Dobrar a entrada quadruplica o tempo.',
        exemplo: 'Laço dentro de laço, bubble sort.',
        em1milhao: '1 trilhão de operações — inviável'
    },
    cubica: {
        notacao: 'O(n³)', nome: 'Cúbica',
        significado: 'Três laços aninhados. Só serve para entrada pequena.',
        exemplo: 'Multiplicação de matrizes ingênua.',
        em1milhao: 'impossível na prática'
    },
    exponencial: {
        notacao: 'O(2ⁿ)', nome: 'Exponencial',
        significado: 'Cada item a mais dobra o trabalho.',
        exemplo: 'Força bruta em subconjuntos, Fibonacci recursivo sem memo.',
        em1milhao: 'não termina nunca'
    },
    fatorial: {
        notacao: 'O(n!)', nome: 'Fatorial',
        significado: 'Todas as ordens possíveis. Explode a partir de 10 itens.',
        exemplo: 'Caixeiro-viajante por força bruta, permutações.',
        em1milhao: 'não termina nunca'
    }
}

/** Estruturas de dados, com o custo real de cada operação. */
const ESTRUTURAS = {
    array: {
        nome: 'Array (lista contígua)',
        acesso: 'O(1)', busca: 'O(n)', insercao: 'O(n)', remocao: 'O(n)',
        quando: 'Quando você acessa por índice e o tamanho muda pouco.',
        cuidado: 'Inserir no meio empurra todo o resto.'
    },
    listaligada: {
        nome: 'Lista ligada',
        acesso: 'O(n)', busca: 'O(n)', insercao: 'O(1)', remocao: 'O(1)',
        quando: 'Muita inserção e remoção nas pontas.',
        cuidado: 'Não tem acesso por índice: percorrer custa caro.'
    },
    hashmap: {
        nome: 'Tabela hash (mapa)',
        acesso: 'O(1)', busca: 'O(1)', insercao: 'O(1)', remocao: 'O(1)',
        quando: 'Busca por chave. É o padrão para quase tudo.',
        cuidado: 'Não guarda ordem, e colisão degrada para O(n).'
    },
    pilha: {
        nome: 'Pilha (LIFO)',
        acesso: 'O(n)', busca: 'O(n)', insercao: 'O(1)', remocao: 'O(1)',
        quando: 'Desfazer, histórico de navegação, avaliação de expressão.',
        cuidado: 'Só o topo é acessível.'
    },
    fila: {
        nome: 'Fila (FIFO)',
        acesso: 'O(n)', busca: 'O(n)', insercao: 'O(1)', remocao: 'O(1)',
        quando: 'Processar na ordem de chegada.',
        cuidado: 'Fila com array simples tem remoção O(n); use deque.'
    },
    arvorebinaria: {
        nome: 'Árvore binária de busca',
        acesso: 'O(log n)', busca: 'O(log n)', insercao: 'O(log n)', remocao: 'O(log n)',
        quando: 'Dados ordenados com busca por faixa.',
        cuidado: 'Sem balanceamento degenera para lista: O(n).'
    },
    heap: {
        nome: 'Heap (fila de prioridade)',
        acesso: 'O(1) no topo', busca: 'O(n)', insercao: 'O(log n)', remocao: 'O(log n)',
        quando: 'Sempre precisar do maior ou do menor.',
        cuidado: 'Não é ordenado: só o topo tem garantia.'
    },
    conjunto: {
        nome: 'Conjunto (set)',
        acesso: '—', busca: 'O(1)', insercao: 'O(1)', remocao: 'O(1)',
        quando: 'Testar pertencimento e eliminar repetição.',
        cuidado: 'Não guarda ordem nem repetidos.'
    },
    grafo: {
        nome: 'Grafo',
        acesso: '—', busca: 'O(V+E)', insercao: 'O(1)', remocao: 'O(V)',
        quando: 'Relações entre coisas: rotas, redes, dependências.',
        cuidado: 'Escolher matriz ou lista de adjacência muda tudo.'
    },
    trie: {
        nome: 'Trie (árvore de prefixos)',
        acesso: 'O(m)', busca: 'O(m)', insercao: 'O(m)', remocao: 'O(m)',
        quando: 'Autocompletar e busca por prefixo.',
        cuidado: 'Gasta muita memória; m é o tamanho da palavra.'
    }
}

/** Algoritmos clássicos com complexidade e quando fazem sentido. */
const ALGORITMOS = {
    buscabinaria: {
        nome: 'Busca binária', tipo: 'busca',
        melhor: 'O(1)', medio: 'O(log n)', pior: 'O(log n)', memoria: 'O(1)',
        exige: 'Dados já ordenados.',
        quando: 'Achar item em coleção grande e ordenada.'
    },
    buscalinear: {
        nome: 'Busca linear', tipo: 'busca',
        melhor: 'O(1)', medio: 'O(n)', pior: 'O(n)', memoria: 'O(1)',
        exige: 'Nada.',
        quando: 'Coleção pequena ou desordenada.'
    },
    bubblesort: {
        nome: 'Bubble sort', tipo: 'ordenação',
        melhor: 'O(n)', medio: 'O(n²)', pior: 'O(n²)', memoria: 'O(1)',
        exige: 'Nada.',
        quando: 'Nunca em produção. Serve para ensinar.'
    },
    insertionsort: {
        nome: 'Insertion sort', tipo: 'ordenação',
        melhor: 'O(n)', medio: 'O(n²)', pior: 'O(n²)', memoria: 'O(1)',
        exige: 'Nada.',
        quando: 'Listas pequenas ou quase ordenadas — aí é rápido de verdade.'
    },
    mergesort: {
        nome: 'Merge sort', tipo: 'ordenação',
        melhor: 'O(n log n)', medio: 'O(n log n)', pior: 'O(n log n)', memoria: 'O(n)',
        exige: 'Memória extra.',
        quando: 'Precisa de garantia de desempenho e ordenação estável.'
    },
    quicksort: {
        nome: 'Quick sort', tipo: 'ordenação',
        melhor: 'O(n log n)', medio: 'O(n log n)', pior: 'O(n²)', memoria: 'O(log n)',
        exige: 'Boa escolha de pivô.',
        quando: 'Padrão da maioria das bibliotecas. Pior caso é raro com pivô aleatório.'
    },
    heapsort: {
        nome: 'Heap sort', tipo: 'ordenação',
        melhor: 'O(n log n)', medio: 'O(n log n)', pior: 'O(n log n)', memoria: 'O(1)',
        exige: 'Nada.',
        quando: 'Garantia de tempo sem gastar memória extra.'
    },
    bfs: {
        nome: 'Busca em largura (BFS)', tipo: 'grafo',
        melhor: 'O(V+E)', medio: 'O(V+E)', pior: 'O(V+E)', memoria: 'O(V)',
        exige: 'Fila.',
        quando: 'Menor caminho em grafo sem peso.'
    },
    dfs: {
        nome: 'Busca em profundidade (DFS)', tipo: 'grafo',
        melhor: 'O(V+E)', medio: 'O(V+E)', pior: 'O(V+E)', memoria: 'O(V)',
        exige: 'Pilha ou recursão.',
        quando: 'Detectar ciclo, ordenar dependências, explorar tudo.'
    },
    dijkstra: {
        nome: 'Dijkstra', tipo: 'grafo',
        melhor: 'O(E log V)', medio: 'O(E log V)', pior: 'O(E log V)', memoria: 'O(V)',
        exige: 'Pesos não negativos.',
        quando: 'Menor caminho com peso — rotas, custo de rede.'
    },
    memoizacao: {
        nome: 'Memoização', tipo: 'otimização',
        melhor: 'O(n)', medio: 'O(n)', pior: 'O(n)', memoria: 'O(n)',
        exige: 'Função pura, mesma entrada mesma saída.',
        quando: 'Recursão que repete subproblemas — troca tempo por memória.'
    },
    doisponteiros: {
        nome: 'Dois ponteiros', tipo: 'técnica',
        melhor: 'O(n)', medio: 'O(n)', pior: 'O(n)', memoria: 'O(1)',
        exige: 'Geralmente dados ordenados.',
        quando: 'Substitui laço aninhado em problemas de par ou janela.'
    }
}

/** Padrões de projeto: o problema que cada um resolve. */
const PADROES = {
    singleton: {
        nome: 'Singleton', familia: 'criação',
        problema: 'Precisa existir uma instância só, acessível de todo lugar.',
        solucao: 'A classe controla a própria instância e devolve sempre a mesma.',
        cuidado: 'Vira estado global disfarçado e complica teste.'
    },
    factory: {
        nome: 'Factory', familia: 'criação',
        problema: 'O código decide qual classe instanciar e fica cheio de if.',
        solucao: 'Uma função centraliza a criação e devolve a implementação certa.',
        cuidado: 'Não use quando existe só uma implementação.'
    },
    builder: {
        nome: 'Builder', familia: 'criação',
        problema: 'Construtor com dez parâmetros opcionais.',
        solucao: 'Monta o objeto por etapas encadeadas.',
        cuidado: 'Exagero para objeto de três campos.'
    },
    adapter: {
        nome: 'Adapter', familia: 'estrutura',
        problema: 'Duas interfaces incompatíveis precisam conversar.',
        solucao: 'Uma casca traduz a chamada de uma para a outra.',
        cuidado: 'Adapter em cima de adapter esconde o problema real.'
    },
    decorator: {
        nome: 'Decorator', familia: 'estrutura',
        problema: 'Acrescentar comportamento sem alterar a classe.',
        solucao: 'Envolve o objeto e acrescenta antes ou depois.',
        cuidado: 'Muitas camadas dificultam achar de onde vem o efeito.'
    },
    facade: {
        nome: 'Facade', familia: 'estrutura',
        problema: 'Um subsistema complexo exige muitos passos para usar.',
        solucao: 'Uma porta de entrada simples esconde os passos.',
        cuidado: 'Facade que só repassa chamadas não serve para nada.'
    },
    observer: {
        nome: 'Observer', familia: 'comportamento',
        problema: 'Vários pontos precisam reagir a uma mudança.',
        solucao: 'Interessados se inscrevem e recebem aviso.',
        cuidado: 'Cadeia de eventos vira fluxo impossível de seguir.'
    },
    strategy: {
        nome: 'Strategy', familia: 'comportamento',
        problema: 'Um if grande escolhe entre algoritmos parecidos.',
        solucao: 'Cada algoritmo vira um objeto trocável.',
        cuidado: 'Desnecessário quando existem só duas opções fixas.'
    },
    repository: {
        nome: 'Repository', familia: 'acesso a dados',
        problema: 'Regra de negócio misturada com consulta ao banco.',
        solucao: 'Uma camada isola a persistência do resto.',
        cuidado: 'Repository que só repassa o ORM não isola nada.'
    },
    command: {
        nome: 'Command', familia: 'comportamento',
        problema: 'Ação precisa ser enfileirada, desfeita ou registrada.',
        solucao: 'A ação vira objeto com executar e desfazer.',
        cuidado: 'Peso desnecessário quando não há desfazer nem fila.'
    }
}

/** Linguagens, com o que cada uma faz bem e mal. */
const LINGUAGENS = {
    javascript: { nome: 'JavaScript', tipagem: 'dinâmica, fraca', paradigma: 'multiparadigma', forte: 'Roda em todo lugar; ecossistema enorme.', fraco: 'Coerções surpreendentes; assíncrono confunde no começo.', usa: 'web, servidor, ferramentas' },
    typescript: { nome: 'TypeScript', tipagem: 'estática, gradual', paradigma: 'multiparadigma', forte: 'Erros aparecem antes de rodar, sem sair do JavaScript.', fraco: 'Tipos só existem em desenvolvimento; some ao compilar.', usa: 'web, servidor, projetos grandes' },
    python: { nome: 'Python', tipagem: 'dinâmica, forte', paradigma: 'multiparadigma', forte: 'Legível; biblioteca para quase tudo.', fraco: 'Lento em laço puro; paralelismo limitado.', usa: 'dados, automação, ciência, servidor' },
    java: { nome: 'Java', tipagem: 'estática, forte', paradigma: 'orientado a objetos', forte: 'Maduro, previsível, ótimo ferramental.', fraco: 'Verboso; muita cerimônia para pouca coisa.', usa: 'corporativo, Android, servidor' },
    go: { nome: 'Go', tipagem: 'estática, forte', paradigma: 'imperativo', forte: 'Concorrência simples; compila para binário único.', fraco: 'Pouca abstração; tratamento de erro repetitivo.', usa: 'rede, infraestrutura, serviços' },
    rust: { nome: 'Rust', tipagem: 'estática, forte', paradigma: 'multiparadigma', forte: 'Segurança de memória sem coletor de lixo.', fraco: 'Curva de aprendizado íngreme; compilação lenta.', usa: 'sistemas, desempenho crítico' },
    c: { nome: 'C', tipagem: 'estática, fraca', paradigma: 'imperativo', forte: 'Controle total da máquina; rapidez máxima.', fraco: 'Nenhuma rede de proteção: erro de memória é seu.', usa: 'sistemas, embarcado, kernel' },
    cpp: { nome: 'C++', tipagem: 'estática, forte', paradigma: 'multiparadigma', forte: 'Desempenho com abstração; controle fino.', fraco: 'Enorme e cheio de armadilhas históricas.', usa: 'jogos, sistemas, desempenho' },
    csharp: { nome: 'C#', tipagem: 'estática, forte', paradigma: 'multiparadigma', forte: 'Linguagem moderna com ferramental excelente.', fraco: 'Historicamente ligada ao ecossistema Microsoft.', usa: 'corporativo, jogos (Unity), servidor' },
    php: { nome: 'PHP', tipagem: 'dinâmica, fraca', paradigma: 'multiparadigma', forte: 'Publicar na web é trivial; melhorou muito.', fraco: 'Base histórica inconsistente.', usa: 'web, sites, APIs' },
    ruby: { nome: 'Ruby', tipagem: 'dinâmica, forte', paradigma: 'orientado a objetos', forte: 'Expressiva e agradável de escrever.', fraco: 'Desempenho modesto; comunidade menor hoje.', usa: 'web, automação' },
    kotlin: { nome: 'Kotlin', tipagem: 'estática, forte', paradigma: 'multiparadigma', forte: 'Java sem a verbosidade; nulo tratado no tipo.', fraco: 'Preso ao ecossistema da JVM.', usa: 'Android, servidor' },
    swift: { nome: 'Swift', tipagem: 'estática, forte', paradigma: 'multiparadigma', forte: 'Moderna e segura para o ecossistema da Apple.', fraco: 'Fora da Apple, pouco usada.', usa: 'iOS, macOS' },
    sql: { nome: 'SQL', tipagem: 'declarativa', paradigma: 'declarativo', forte: 'Descreve O QUE quer; o banco decide como buscar.', fraco: 'Cada banco tem seu dialeto.', usa: 'consulta a dados' },
    bash: { nome: 'Bash', tipagem: 'sem tipos', paradigma: 'imperativo', forte: 'Cola perfeita entre programas do sistema.', fraco: 'Aspas e espaços quebram tudo; ilegível quando cresce.', usa: 'automação, scripts de sistema' }
}

/** Busca uma entrada em qualquer catálogo pelo nome. */
function procurar(termo) {
    const t = String(termo || '').toLowerCase().trim()
    if (!t) return []
    const achados = []
    const catalogos = [
        ['complexidade', COMPLEXIDADES], ['estrutura', ESTRUTURAS],
        ['algoritmo', ALGORITMOS], ['padrão', PADROES], ['linguagem', LINGUAGENS]
    ]
    for (const [tipo, cat] of catalogos) {
        for (const [chave, item] of Object.entries(cat)) {
            if (chave.includes(t) || String(item.nome).toLowerCase().includes(t)) {
                achados.push({ tipo, chave, nome: item.nome })
            }
        }
    }
    return achados
}

/** Compara duas estruturas operação a operação. */
function compararEstruturas(a, b) {
    const ea = ESTRUTURAS[a], eb = ESTRUTURAS[b]
    if (!ea || !eb) return null
    const ops = ['acesso', 'busca', 'insercao', 'remocao']
    return { a: ea, b: eb, linhas: ops.map(op => ({ operacao: op, a: ea[op], b: eb[op] })) }
}

module.exports = {
    COMPLEXIDADES,
    ESTRUTURAS,
    ALGORITMOS,
    PADROES,
    LINGUAGENS,
    procurar,
    compararEstruturas
}
