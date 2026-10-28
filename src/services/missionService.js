function gerarMissao() {
    const lista = [
        {
            tipo: 'mensagens',
            titulo: '💬 Comunicador Dev',
            descricao: 'Envie 20 mensagens hoje.',
            meta: 20,
            xp: 120,
            coins: 200
        },
        {
            tipo: 'boss',
            titulo: '🐉 Caçador de Boss',
            descricao: 'Ataque o Boss 3 vezes.',
            meta: 3,
            xp: 200,
            coins: 300
        },
        {
            tipo: 'quiz',
            titulo: '🧠 Mestre do Código',
            descricao: 'Acerte 2 perguntas do quiz.',
            meta: 2,
            xp: 150,
            coins: 250
        }
    ]
    return lista[Math.floor(Math.random() * lista.length)]
}

module.exports = {
    gerarMissao
}

