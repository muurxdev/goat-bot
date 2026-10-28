/**
 * GOATBOT — Suíte de Testes: Validação de 500 Comandos e Funcionalidades
 */

process.env.NODE_ENV = "test";

const assert = require("assert");
const { loadCommands, getCommands, getAliases } = require("../src/handlers/commandDispatcher");
const { getCookiesFilePath, validateCookiesFile } = require("../src/services/media/mediaArgs");

console.log("🧪 Iniciando Validação da Expansão de 500 Comandos (+1.748 Aliases)...\n");

let passCount = 0;
let failCount = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`  ✅ PASS: ${name}`);
        passCount++;
    } catch (err) {
        console.error(`  ❌ FAIL: ${name}`);
        console.error(`     Erro: ${err.message}`);
        failCount++;
    }
}

// 1. Carregar Comandos
loadCommands();
const commands = getCommands();
const aliases = getAliases();

// 2. Testes de Contagem e Registro
test("Dispatcher deve carregar 500 ou mais comandos principais (meta de 500+ atingida)", () => {
    assert.ok(commands.size >= 500, `Esperado >= 500 comandos, obtido: ${commands.size}`);
});

test("Dispatcher deve registrar mais de 1.700 aliases", () => {
    assert.ok(aliases.size >= 1700, `Esperado >= 1700 aliases, obtido: ${aliases.size}`);
});

test("Todos os 500 comandos devem possuir metadados válidos (name, category, execute)", () => {
    for (const [name, cmd] of commands.entries()) {
        assert.ok(cmd.name, `Comando sem name: ${name}`);
        assert.ok(cmd.category, `Comando sem category: ${name}`);
        assert.strictEqual(typeof cmd.execute, "function", `Comando sem função execute: ${name}`);
    }
});

// 3. Testes dos Requisitos Críticos Solicitados pelo Usuário
test("Módulo 1: Anti-link granular e Comunicação em Massa (tagall, hidetag, dmall)", () => {
    assert.ok(commands.has("antilink"), "Falta comando antilink");
    assert.ok(commands.has("tagall"), "Falta comando tagall");
    assert.ok(commands.has("hidetag"), "Falta comando hidetag");
    assert.ok(commands.has("dmall"), "Falta comando dmall");
    assert.ok(commands.has("chamada"), "Falta comando chamada");
    assert.ok(commands.has("notificar"), "Falta comando notificar");
    assert.ok(commands.has("anuncio"), "Falta comando anuncio");
});

test("Módulo 2: Transcrição de Áudio e 25 Efeitos FFmpeg", () => {
    assert.ok(commands.has("transcrever"), "Falta comando transcrever");
    assert.ok(commands.has("slowed"), "Falta comando slowed");
    assert.ok(commands.has("nightcore"), "Falta comando nightcore");
    assert.ok(commands.has("audio8d"), "Falta comando audio8d");
    assert.ok(commands.has("bassboost"), "Falta comando bassboost");
    assert.ok(commands.has("removervocal"), "Falta comando removervocal");
    assert.ok(commands.has("extrairvocal"), "Falta comando extrairvocal");
    assert.ok(commands.has("audiovtuber"), "Falta comando audiovtuber");
    assert.ok(commands.has("audiomixer"), "Falta comando audiomixer");
});

test("Módulo 3: Conversores & Geradores de Documentos e PDFs IA", () => {
    assert.ok(commands.has("gerarpdf"), "Falta comando gerarpdf");
    assert.ok(commands.has("img2pdf"), "Falta comando img2pdf");
    assert.ok(commands.has("word2pdf"), "Falta comando word2pdf");
    assert.ok(commands.has("txt2pdf"), "Falta comando txt2pdf");
    assert.ok(commands.has("md2pdf"), "Falta comando md2pdf");
    assert.ok(commands.has("html2pdf"), "Falta comando html2pdf");
    assert.ok(commands.has("gerarcontrato"), "Falta comando gerarcontrato");
    assert.ok(commands.has("gerarrecibo"), "Falta comando gerarrecibo");
});

test("Módulo 4: RPG & Reino 2.0 (Torre 100 Andares, Boss Mundial, Alquimia)", () => {
    assert.ok(commands.has("torre"), "Falta comando torre");
    assert.ok(commands.has("bossmundial"), "Falta comando bossmundial");
    assert.ok(commands.has("montaria"), "Falta comando montaria");
    assert.ok(commands.has("alquimia"), "Falta comando alquimia");
    assert.ok(commands.has("reforja"), "Falta comando reforja");
    assert.ok(commands.has("arenarank"), "Falta comando arenarank");
    assert.ok(commands.has("cacarecompensa"), "Falta comando cacarecompensa");
    assert.ok(commands.has("deusas"), "Falta comando deusas");
    assert.ok(commands.has("selotrevas"), "Falta comando selotrevas");
});

test("Módulo 5: Jogos & Inteligência (Akinator, Termo, Genius, Batalha Naval)", () => {
    assert.ok(commands.has("akinator"), "Falta comando akinator");
    assert.ok(commands.has("termo"), "Falta comando termo");
    assert.ok(commands.has("genius"), "Falta comando genius");
    assert.ok(commands.has("batalhanaval"), "Falta comando batalhanaval");
    assert.ok(commands.has("campominado"), "Falta comando campominado");
    assert.ok(commands.has("unocards"), "Falta comando unocards");
    assert.ok(commands.has("sudoku"), "Falta comando sudoku");
});

test("Módulo 6: Produtividade, Finanças Pessoais & Dev Tools", () => {
    assert.ok(commands.has("calculadoraimc"), "Falta comando calculadoraimc");
    assert.ok(commands.has("salarioclt"), "Falta comando salarioclt");
    assert.ok(commands.has("conversorunidades"), "Falta comando conversorunidades");
    assert.ok(commands.has("geradordecpf"), "Falta comando geradordecpf");
    assert.ok(commands.has("geradordecnpj"), "Falta comando geradordecnpj");
    assert.ok(commands.has("geradordecartao"), "Falta comando geradordecartao");
    assert.ok(commands.has("formatarcodigo"), "Falta comando formatarcodigo");
});

test("Módulo 7: Efeitos Visuais & Arte (VHS, Glitch, Noir, Cartoon, Polaroid)", () => {
    assert.ok(commands.has("vhs"), "Falta comando vhs");
    assert.ok(commands.has("glitch"), "Falta comando glitch");
    assert.ok(commands.has("noir"), "Falta comando noir");
    assert.ok(commands.has("cartoon"), "Falta comando cartoon");
    assert.ok(commands.has("fotopolaroid"), "Falta comando fotopolaroid");
    assert.ok(commands.has("bannerboasvindas"), "Falta comando bannerboasvindas");
    assert.ok(commands.has("bannerdespedida"), "Falta comando bannerdespedida");
});

test("Módulo 8: Donos, Servidor VPS & Cookies Globais", () => {
    assert.ok(commands.has("clearcache"), "Falta comando clearcache");
    assert.ok(commands.has("dbexport"), "Falta comando dbexport");
    assert.ok(commands.has("serverinfo"), "Falta comando serverinfo");
    assert.ok(commands.has("reloadcmd"), "Falta comando reloadcmd");
    assert.ok(commands.has("cookiesstatus"), "Falta comando cookiesstatus");
    assert.ok(commands.has("totalcomandos"), "Falta comando totalcomandos");

    const cookiesPath = getCookiesFilePath();
    assert.ok(cookiesPath.endsWith("data/cookies.txt"), "Caminho dos cookies deve ser global e persistente");
});

console.log(`\n================================`);
console.log(`🎯 Resultados da Validação dos 500 Comandos:`);
console.log(`   ✅ PASSOU: ${passCount}`);
console.log(`   ❌ FALHOU: ${failCount}`);
console.log(`================================\n`);

if (failCount > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
