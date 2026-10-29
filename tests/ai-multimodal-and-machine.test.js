/**
 * Testes Unitários: Multimodal Vision, Áudio Instantâneo, Machine Learning & NLP
 */

process.env.NODE_ENV = 'test';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const llmService = require('../src/services/llmService');
const aiService = require('../src/services/aiService');
const machineCmd = require('../src/commands/general/machine');
const analisarTextoCmd = require('../src/commands/general/analisartexto');
const transcricaoLonga = require('../src/services/transcricaoLonga');
const dispatcher = require('../src/handlers/commandDispatcher');

dispatcher.loadCommands();

console.log('🧪 Iniciando testes de Multimodalidade, Machine Learning e Áudio Direto...\n');

async function runTests() {
    let passed = 0;

    // 1. Verificação de Registro e Aliases do Machine Learning
    const regMachine = dispatcher.getCommands().get('machine');
    assert.ok(regMachine, 'Comando principal machine deve estar registrado');
    const getTargetName = (alias) => {
        const item = dispatcher.getAliases().get(alias);
        return typeof item === 'object' ? item.name : item;
    };
    assert.strictEqual(getTargetName('ml'), 'machine', 'Alias ml deve apontar para machine');
    assert.strictEqual(getTargetName('machinelearning'), 'machine', 'Alias machinelearning deve apontar para machine');
    assert.strictEqual(getTargetName('mlearning'), 'machine', 'Alias mlearning deve apontar para machine');
    assert.strictEqual(getTargetName('treinamentoia'), 'machine', 'Alias treinamentoia deve apontar para machine');
    console.log('  ✅ PASS: Registro do comando .machine e aliases (.ml, .machinelearning, .mlearning, .treinamentoia)');
    passed++;

    // 2. Subcomandos de .machine
    let replyMsg = '';
    const mockCtx = {
        from: 'grupo-teste-ml@g.us',
        sender: '5511999990001@s.whatsapp.net',
        prefix: '.',
        reply: (msg) => { replyMsg = msg; return msg; }
    };

    // Painel principal
    await machineCmd.execute({ ...mockCtx, args: [] });
    assert.ok(replyMsg.includes('PERFIL DE MACHINE LEARNING'), 'Painel principal deve ser exibido');
    assert.ok(!replyMsg.includes('5511999990001'), 'Não mostra o número do usuário');

    // Subcomando ON/OFF
    await machineCmd.execute({ ...mockCtx, args: ['on'] });
    assert.ok(replyMsg.includes('MODO CHATGPT CONVERSACIONAL') && replyMsg.includes('ATIVADO 24H'), 'Deve ativar modo ChatGPT 24h');

    await machineCmd.execute({ ...mockCtx, args: ['off'] });
    assert.ok(replyMsg.includes('MODO CHATGPT CONVERSACIONAL') && replyMsg.includes('DESATIVADO'), 'Deve desativar modo ChatGPT');

    // Subcomando TRAIN
    await machineCmd.execute({ ...mockCtx, args: ['train', 'termo_proibido_unit_test'] });
    assert.ok(replyMsg.includes('APRENDIZADO CONCLUÍDO'), 'Deve registrar aprendizado de novo termo');
    assert.ok(replyMsg.includes('termo_proibido_unit_test'), 'Termo treinado deve estar na resposta');

    // Subcomando ROAMING
    await machineCmd.execute({ ...mockCtx, args: ['roaming'] });
    assert.ok(replyMsg.includes('MACHINE LEARNING ROAMING'), 'Deve executar roaming de aprendizado');

    // Subcomando STATUS
    await machineCmd.execute({ ...mockCtx, args: ['status'] });
    assert.ok(replyMsg.includes('STATUS DO MOTOR MACHINE'), 'Deve exibir métricas do motor');
    console.log('  ✅ PASS: Subcomandos de .machine (painel, on/off 24h, train, roaming, status)');
    passed++;

    // 3. Multimodal Vision: Análise e Inspeção Visual com Sharp
    const sampleBuffer = await require('sharp')({ create: { width: 800, height: 600, channels: 3, background: '#888888' } }).jpeg().toBuffer();
    const visionReport = await aiService.analyzeImage(sampleBuffer, 'image/jpeg', 'Verifique a imagem');
    assert.ok(visionReport.includes('Inspeção Técnica de Imagem'), 'Deve gerar relatório de inspeção de imagem');
    assert.ok(visionReport.includes('JPEG'), 'Deve detectar formato da imagem');
    assert.ok(visionReport.includes('px'), 'Deve detectar dimensões em pixels');
    assert.ok(visionReport.includes('Horizontal') || visionReport.includes('Retrato') || visionReport.includes('Quadrada'), 'Deve calcular orientação e proporção');
    console.log('  ✅ PASS: aiService.analyzeImage inspeciona imagem com dimensões, proporção e metadados');
    passed++;

    // 4. Análise Textual Avançada (NLP + Sentimento + Estatísticas)
    const analisePositiva = aiService.analisarTexto('Esse bot é sensacional, maravilhoso e perfeito!');
    assert.strictEqual(analisePositiva.palavras, 7);
    assert.ok(analisePositiva.sentimento.includes('Positivo'), 'Deve detectar tom positivo');

    const analiseNegativa = aiService.analisarTexto('Muito ruim, horrível, erro grave e péssimo desempenho.');
    assert.strictEqual(analiseNegativa.palavras, 8);
    assert.ok(analiseNegativa.sentimento.includes('Negativo'), 'Deve detectar tom negativo');

    let replyCard = '';
    await analisarTextoCmd.execute({
        quotedText: 'Texto citado para teste com múltiplas palavras e frases completas.',
        reply: (msg) => { replyCard = msg; return msg; }
    });
    assert.ok(replyCard.includes('ANÁLISE DE TEXTO & NLP'), 'Comando .analisartexto deve aceitar mensagem citada');
    assert.ok(replyCard.includes('*Total de Palavras:* 10'), 'Deve contar 10 palavras');
    console.log('  ✅ PASS: Análise de texto (NLP, sentimentos, contagens, aceitação de texto citado)');
    passed++;

    // 5. Áudio: Resiliência sem ffmpeg / ffprobe no Sistema
    const dummyAudio = Buffer.alloc(35000); // ~10 segundos estimados
    const duracaoEstimada = await transcricaoLonga.medirDuracao('arquivo_inexistente.ogg', dummyAudio);
    assert.strictEqual(duracaoEstimada, 10, 'Deve estimar 10s para buffer de 35KB sem ffprobe');

    const tempJobDir = path.join(__dirname, '../temp/teste_audio_sem_ffmpeg');
    fs.mkdirSync(tempJobDir, { recursive: true });
    const dummyEntrada = path.join(tempJobDir, 'entrada.bin');
    fs.writeFileSync(dummyEntrada, dummyAudio);

    const trechos = await transcricaoLonga.cortarEmTrechos(dummyEntrada, tempJobDir, 10);
    assert.ok(trechos.length >= 1, 'Deve retornar ao menos 1 trecho mesmo sem ffmpeg instalado');
    fs.rmSync(tempJobDir, { recursive: true, force: true });
    console.log('  ✅ PASS: transcricaoLonga opera com resiliência sem ffmpeg/ffprobe no PATH');
    passed++;

    // 6. Direct Transcription sem travar
    const directResult = await aiService.transcribeAudioDirect(dummyAudio, 'audio/ogg');
    assert.strictEqual(directResult, null, 'Sem chaves configuradas, retorna null imediatamente sem erro');
    console.log('  ✅ PASS: transcribeAudioDirect responde com rapidez sem exceções não tratadas');
    passed++;

    // 7. hasProvider() integridade
    assert.strictEqual(llmService.hasProvider(), false, 'Sem chaves, hasProvider() deve ser false');
    console.log('  ✅ PASS: hasProvider() mantém integridade para evitar delays de timeout desnecessários');
    passed++;

    console.log('\n======================================================');
    console.log(`📊 SUCESSO: Todos os ${passed} testes de IA Multimodal & Machine passaram!`);
    console.log('======================================================\n');
}

runTests().catch(err => {
    console.error('❌ Falha nos testes:', err);
    process.exit(1);
});
