// Banco de teste separado: sem isto o teste gravava no data/database.sqlite real
// (agendamentos de fechamento, usuários falsos).
process.env.NODE_ENV = 'test'
