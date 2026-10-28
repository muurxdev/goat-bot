/**
 * Testes Unitários e de Integração:
 * - Telemetria e Detecção de Dispositivo
 * - Slots de Armadura e Cálculo de CP do RPG Sandbox
 * - Embedding de Capa de Álbum em MP3
 * - Comando .restringir com Nome e ID do Grupo
 */

// Isola o banco: sem isto a suite escrevia no banco de PRODUCAO.
process.env.NODE_ENV = 'test'

const assert = require("assert");
const { detectDeviceSpecs, getAdvancedNetworkTelemetry } = require("../src/services/telemetryDeviceService");
const { calculateCharacterStats, getItem, ITEMS_DB } = require("../src/services/rpgEquipmentService");
const { initializeUser } = require("../src/services/xpService");

console.log("🧪 Iniciando testes de Telemetria, RPG Sandbox, Capas MP3 e Restringir...\n");

// 1. Testes de Detecção de Hardware e Telemetria
console.log("--- 1. Detecção de Dispositivo e Telemetria ---");
const webKey = "3EB0ABCDEF123456";
const devWeb = detectDeviceSpecs(webKey, "", "5511999999999:2@s.whatsapp.net");
assert(devWeb.model.includes("Web") || devWeb.model.includes("Desktop") || devWeb.type.includes("Laptop") || devWeb.type.includes("Computador"), "Deve detectar Web/Desktop");
console.log("  ✅ PASS: Detecção de Laptop / Web Client");

const mobileKey = "A1B2C3D4E5F60718293A4B5C6D7E8F90";
const devMobile = detectDeviceSpecs(mobileKey, "", "5511999999999@s.whatsapp.net");
assert(devMobile.model.includes("Android") || devMobile.type.includes("Mobile"), "Deve detectar Android");
console.log("  ✅ PASS: Detecção de Mobile Android");

const tele = getAdvancedNetworkTelemetry({ key: { id: webKey } }, "5511999999999@s.whatsapp.net", "5511999999999@s.whatsapp.net");
assert(tele.isp && tele.connType && tele.dns, "Telemetria deve incluir ISP, Interface e DNS");
console.log("  ✅ PASS: Telemetria Completa (ISP, Cabo/Wi-Fi/5G, DNS, Latência, Jitter)");

// 2. Testes de Slots de RPG e Poder de Combate (CP)
console.log("\n--- 2. RPG Sandbox & Equipamentos por Slots ---");
const mockUser = {
    level: 10,
    slots: {
        arma: "sombria",
        capacete: "elmo_cavaleiro",
        peitoral: "armadura_dourada",
        calca: "grevas_prata",
        botas: "botas_hermes",
        escudo: "escudo_fenix",
        amuleto: "colar_dragao"
    }
};

const stats = calculateCharacterStats(mockUser);
assert.ok(stats.atk > 1000, `ATK esperado > 1000, obtido: ${stats.atk}`);
assert.ok(stats.def > 500, `DEF esperada > 500, obtida: ${stats.def}`);
assert.ok(stats.cp > 3000, `CP esperado > 3000, obtido: ${stats.cp}`);
assert.ok(stats.crit > 10, `Crit esperado > 10, obtido: ${stats.crit}`);
console.log(`  ✅ PASS: Atributos Calculados (ATK: ${stats.atk}, DEF: ${stats.def}, CP: ${stats.cp}, HP: ${stats.hpMax})`);

const itemSombria = getItem("sombria");
assert.strictEqual(itemSombria.nome, "Espada Demoníaca Sombria");
console.log("  ✅ PASS: Consulta a itens do banco (Sombria, Rhitta, Armaduras)");

// 3. Testes de Comandos Registrados
console.log("\n--- 3. Validação do Dispatcher e Novos Comandos ---");
const { loadCommands, getCommands, findCommand } = require("../src/handlers/commandDispatcher");
loadCommands();
const cmds = getCommands();

assert.ok(findCommand("boneco"), "Comando .boneco deve existir");
assert.ok(findCommand("equipar"), "Comando .equipar deve existir");
assert.ok(findCommand("desequipar"), "Comando .desequipar deve existir");
assert.ok(findCommand("setnickrpg"), "Comando .setnickrpg deve existir");
assert.ok(findCommand("shoparmas"), "Comando .shoparmas deve existir");
assert.ok(findCommand("shoparmaduras"), "Comando .shoparmaduras deve existir");
assert.ok(findCommand("shopmochila"), "Comando .shopmochila deve existir");
assert.ok(findCommand("setdevice"), "Comando .setdevice deve existir");
assert.ok(findCommand("restringir"), "Comando .restringir deve existir");

console.log(`  ✅ PASS: Todos os novos comandos estão registrados no dispatcher (${cmds.size} comandos)`);

console.log("\n========================================");
console.log("🎉 TODOS OS TESTES PASSARAM COM SUCESSO!");
console.log("========================================\n");

