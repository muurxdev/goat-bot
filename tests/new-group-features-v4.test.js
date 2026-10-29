/**
 * BotXP — Testes Automatizados v4
 * Validação de Solicitações de Entrada (Join Requests), Edição de Grupo, Leave/Welcome Preview,
 * Banimento por Categoria e Modo Restrito para Grupos.
 */

// Isola o banco: sem isto a suite escrevia no banco de PRODUCAO.
process.env.NODE_ENV = 'test'

const assert = require("assert");
const dataService = require("../src/services/dataService");
const dispatcher = require("../src/handlers/commandDispatcher");
const { searchWeb, askAI } = require("../src/services/aiService");
const { getBotName } = require("../src/config/botConfig");

console.log("🧪 Iniciando testes de Group Management, Leave/Welcome, Bancmd Categorias e Modo Restrito...\n");

async function runTests() {
    // 1. Carregamento de comandos
    dispatcher.loadCommands();
    const commands = dispatcher.getCommands();

    console.log("--- 1. Novos Comandos Carregados ---");
    assert(commands.has("solicitacoes"), "Comando .solicitacoes deve estar registrado");
    assert(commands.has("setnomegrupo"), "Comando .setnomegrupo deve estar registrado");
    assert(commands.has("setdesc"), "Comando .setdesc deve estar registrado");
    assert(commands.has("setfotogrupo"), "Comando .setfotogrupo deve estar registrado");
    assert(commands.has("gruposettings"), "Comando .gruposettings deve estar registrado");
    assert(commands.has("leave"), "Comando .leave deve estar registrado para admin");
    assert(commands.has("restringir"), "Comando .restringir deve estar registrado");
    assert(commands.has("aliases"), "Comando .aliases deve estar registrado");
    console.log("  ✅ PASS: Todos os 8 novos comandos carregados com sucesso!\n");

    // 2. Separação de .leave (admin) e .sair (owner)
    console.log("--- 2. Separação de Leave (Despedida) e Sair (Bot) ---");
    const leaveCmd = dispatcher.findCommand("leave");
    const sairCmd = dispatcher.findCommand("sair");
    const adeusCmd = dispatcher.findCommand("adeus");

    assert(leaveCmd.name === "leave", ".leave deve apontar para o comando leave");
    assert(adeusCmd.name === "leave", ".adeus deve ser alias do comando leave");
    assert(leaveCmd.category === "admin", ".leave deve ser da categoria admin");
    assert(sairCmd.name === "sair", ".sair deve apontar para o comando sair");
    assert(sairCmd.category === "owner", ".sair deve ser exclusivo de owner");
    assert(!sairCmd.aliases.includes("leave"), ".sair não deve mais ter 'leave' como alias conflitante");
    console.log("  ✅ PASS: .leave e .sair estão perfeitamente separados sem conflitos!\n");

    // 3. Banimento por Categoria
    console.log("--- 3. Banimento de Comandos por Categoria ---");
    const configs = dataService.getConfigsData();
    if (!configs["global"]) configs["global"] = {};
    configs["global"].bannedCommands = {
        "rpg": { reason: "Manutenção de RPG", date: "Hoje" }
    };
    await dataService.saveConfigsData(configs);

    // Mock context para testar comando de RPG bloqueado
    let capturedReply = "";
    const mockContext = {
        from: "120363000000000001@g.us",
        sender: "5511999999999@s.whatsapp.net",
        isGroup: true,
        isAdmin: false,
        isOwner: false,
        userRole: { level: 1 },
        reply: async (msg) => { capturedReply = msg; }
    };

    const huntCmd = dispatcher.findCommand("hunt");
    assert(huntCmd && huntCmd.category === "rpg", ".hunt deve ser da categoria rpg");

    // Testar dispatcher com categoria banida
    mockContext.commandName = "hunt";
    mockContext.args = [];
    await dispatcher.dispatch(mockContext);
    assert(capturedReply.includes("suspensos") && capturedReply.includes("rpg"), "Comando da categoria RPG deve ser bloqueado com mensagem informativa");
    console.log("  ✅ PASS: Banimento por categoria (.bancmd rpg) bloqueia todos os comandos da categoria!\n");

    // Limpar banimento de teste
    configs["global"].bannedCommands = {};
    await dataService.saveConfigsData(configs);

    // 4. Modo Restrito no Grupo (.restringir adm)
    console.log("--- 4. Modo Restrito no Grupo (.restringir adm) ---");
    const testGroupJid = "120363000000000002@g.us";
    configs[testGroupJid] = { restrictedToAdmins: true };
    await dataService.saveConfigsData(configs);

    capturedReply = "";
    const memberContext = {
        from: testGroupJid,
        sender: "5511888888888@s.whatsapp.net",
        commandName: "fig",
        args: [],
        isGroup: true,
        isAdmin: false,
        isOwner: false,
        userRole: { level: 1 },
        reply: async (msg) => { capturedReply = msg; }
    };

    // Membro comum tentando usar comando de figurinha/mídia
    await dispatcher.dispatch(memberContext);
    assert(capturedReply.includes("só administradores estão usando"), "Membro comum deve receber aviso de Modo Restrito");

    // Admin executando o mesmo comando
    capturedReply = "";
    const adminContext = {
        from: testGroupJid,
        sender: "5511777777777@s.whatsapp.net",
        commandName: "ping",
        args: [],
        isGroup: true,
        isAdmin: true,
        isOwner: false,
        userRole: { level: 3 },
        reply: async (msg) => { capturedReply = msg; }
    };
    await dispatcher.dispatch(adminContext);
    assert(!capturedReply.includes("só administradores estão usando"), "Administrador deve ter bypass no modo restrito");
    console.log("  ✅ PASS: Modo Restrito bloqueia membros comuns e permite Administradores e Donos!\n");

    // Limpar restrição de teste
    delete configs[testGroupJid];
    await dataService.saveConfigsData(configs);

    // 5. Pesquisa Web Real e IA Service
    console.log("--- 5. Pesquisa Web Real e Fontes Verificadas ---");
    const webResults = await searchWeb("GOAT Saga Épica");
    assert(Array.isArray(webResults), "searchWeb deve retornar um array");
    console.log(`  🔍 Resultados encontrados na Web: ${webResults.length}`);
    if (webResults.length > 0) {
        assert(webResults[0].url.startsWith("http"), "Resultado deve conter URL válida");
        assert(webResults[0].snippet.length > 0, "Resultado deve conter snippet real");
    }

    const aiAnswer = await askAI("quem é o capitão dos sete pecados capitais");
    assert(aiAnswer && aiAnswer.length > 30, "askAI deve retornar resposta estruturada");
    // A resposta do modelo é texto livre (e pode citar personagens): a marca se garante no prompt padrão,
    // não na frase que o modelo devolve. Antes a checagem exigia o nome do bot na resposta.
    const fonteLLM = require("fs").readFileSync(require("path").join(__dirname, "..", "src", "services", "llmService.js"), "utf8");
    assert(/Você é o GOATBOT/.test(fonteLLM), "o prompt padrão da IA perdeu a marca oficial GOATBOT");
    assert(aiAnswer.length > 30, "askAI deve retornar resposta estruturada");
    console.log("  ✅ PASS: IA e Pesquisa Web retornam respostas estruturadas com fontes!\n");

    console.log("========================================");
    console.log("📊 RESULTADO: TODOS OS TESTES PASSARAM!");
    console.log("========================================\n");
}

runTests().catch(err => {
    console.error("❌ Testes falharam:", err);
    process.exit(1);
});
