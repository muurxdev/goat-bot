process.env.NODE_ENV = 'test';
const assert = require('assert');
const crypto = require('crypto');
const mercadoPago = require('../src/services/payments/mercadoPagoService');
const rentalPackages = require('../src/services/payments/rentalPackagesService');
const rentalRepo = require('../src/database/repositories/rentalRepository');
const creditsService = require('../src/services/payments/creditsService');

async function runTests() {
    console.log('--- Testes de Integração e Pagamento Mercado Pago & PIX ---');

    // 1. Verificação inicial do serviço
    console.log('1. Verificando configuração e modo...');
    const modo = mercadoPago.modo();
    assert(['producao', 'teste', 'simulacao'].includes(modo), 'Modo deve ser válido');
    console.log(`  ✅ PASS: Modo atual é "${modo}"`);

    // 2. Geração de Buffer QR Code
    console.log('2. Testando geração de Buffer PNG a partir de Copia e Cola...');
    const testPixCode = '00020126580014BR.GOV.BCB.PIX0136test-pix-copia-cola5204000053039865802BR5915GOAT BOT6009SAO PAULO62070503***6304ABCD';
    const qrBuffer = await mercadoPago.gerarQrCodeBuffer(testPixCode);
    assert(Buffer.isBuffer(qrBuffer), 'Deve retornar um Buffer');
    assert(qrBuffer.length > 500, 'Buffer do QR Code deve conter dados PNG válidos');
    // Checa cabeçalho PNG: 89 50 4E 47
    assert(qrBuffer[0] === 0x89 && qrBuffer[1] === 0x50 && qrBuffer[2] === 0x4E && qrBuffer[3] === 0x47, 'Deve ser imagem PNG válida');
    console.log(`  ✅ PASS: QR Code PNG gerado com sucesso (${qrBuffer.length} bytes)`);

    // 3. Criação de cobrança PIX
    console.log('3. Testando criação de pagamento PIX...');
    const cobranca = await mercadoPago.criarPixPayment({
        valorCentavos: 3500,
        descricao: 'Aluguel Grupo Mensal',
        metadata: {
            pacote: 'g2',
            targetJid: '5511999990001@s.whatsapp.net',
            requestedBy: '5511999990001@s.whatsapp.net',
            dias: '30'
        },
        payerEmail: 'teste@goat-bot.local',
        payerName: 'Comprador Teste'
    });

    assert(cobranca && cobranca.id, 'Cobrança deve ter um ID');
    assert(cobranca.copiaCola && cobranca.copiaCola.includes('000201'), 'Deve conter payload PIX Copia e Cola');
    assert(cobranca.qrCodeBuffer && Buffer.isBuffer(cobranca.qrCodeBuffer), 'Deve conter buffer do QR Code');
    assert.strictEqual(cobranca.valorCentavos, 3500, 'Valor deve bater com 3500 centavos');
    console.log(`  ✅ PASS: Cobrança PIX criada com sucesso (ID: ${cobranca.id})`);

    // 4. Validação de assinatura de Webhook do Mercado Pago
    console.log('4. Testando validação de assinatura HMAC-SHA256 (x-signature)...');
    process.env.MERCADO_PAGO_WEBHOOK_SECRET = 'segredo_teste_123456';
    const dataId = '1234567890';
    const ts = String(Date.now());
    const manifest = `id:${dataId.toLowerCase()};ts:${ts};`;
    const v1 = crypto.createHmac('sha256', 'segredo_teste_123456').update(manifest).digest('hex');

    const headersValidos = {
        'x-signature': `ts=${ts},v1=${v1}`
    };
    const signatureOk = mercadoPago.verificarAssinatura(headersValidos, dataId);
    assert.strictEqual(signatureOk, true, 'Assinatura válida deve ser aceita');

    const headersInvalidos = {
        'x-signature': `ts=${ts},v1=forged_bad_hash`
    };
    const signatureFail = mercadoPago.verificarAssinatura(headersInvalidos, dataId);
    assert.strictEqual(signatureFail, false, 'Assinatura forjada deve ser recusada');
    console.log('  ✅ PASS: Validação criptográfica de Webhook funciona com segurança');

    // 5. Processamento idempotente de aprovação
    console.log('5. Testando processamento e liberação automática de aluguel...');
    const testTarget = '5511888880001@s.whatsapp.net';
    const testPaymentId = `TEST_PAY_${Date.now()}`;

    const resAprov = await mercadoPago.processarAprovacao({
        paymentId: testPaymentId,
        pacoteId: 'g2',
        targetJid: testTarget,
        requestedBy: testTarget,
        dias: 30,
        valorCentavos: 3500
    });

    assert(resAprov.ok, 'Processamento deve retornar ok');
    const aluguelAtual = rentalRepo.getRental(testTarget);
    assert(aluguelAtual && aluguelAtual.isActive, 'Aluguel deve estar ativo');
    assert(aluguelAtual.expiresAt > Date.now(), 'Vencimento deve estar no futuro');
    console.log('  ✅ PASS: Aluguel ativado no banco de dados');

    // Idempotência: reprocessar o mesmo paymentId não deve somar de novo
    const vencimentoAnterior = aluguelAtual.expiresAt;
    const resRepetido = await mercadoPago.processarAprovacao({
        paymentId: testPaymentId,
        pacoteId: 'g2',
        targetJid: testTarget,
        requestedBy: testTarget,
        dias: 30,
        valorCentavos: 3500
    });
    assert(resRepetido.repetido === true, 'Deve identificar pagamento repetido');
    const aluguelDepois = rentalRepo.getRental(testTarget);
    assert.strictEqual(aluguelDepois.expiresAt, vencimentoAnterior, 'Vencimento não deve ser estendido duas vezes');
    console.log('  ✅ PASS: Idempotência de pagamento garantida');

    // 6. Sincronização de pacotes com Mercado Pago
    console.log('6. Testando sincronização de pacotes do catálogo...');
    const syncRes = await rentalPackages.sincronizarTodosComMercadoPago();
    assert(Array.isArray(syncRes) && syncRes.length > 0, 'Deve retornar lista sincronizada');
    assert(syncRes.every(s => s.ok), 'Todos os pacotes devem estar ok');
    console.log(`  ✅ PASS: ${syncRes.length} pacotes sincronizados com Mercado Pago`);

    // 7. Comando .assinar execute
    console.log('7. Testando execução do comando .assinar...');
    const assinarCmd = require('../src/commands/owner/assinar');
    let respostaTexto = '';
    let respostaImg = false;

    const fakeClient = {
        sendMessage: async (jid, msg) => {
            if (msg.image) respostaImg = true;
            if (msg.text) respostaTexto += msg.text;
            if (msg.caption) respostaTexto += msg.caption;
            return { key: { id: 'msg-1' } };
        }
    };

    await assinarCmd.execute({
        sender: '5511999990001@s.whatsapp.net',
        from: '5511999990001@s.whatsapp.net',
        isGroup: false,
        args: ['g2'],
        reply: async (txt) => { respostaTexto += txt; },
        client: fakeClient,
        info: { message: {} },
        isOwner: false,
        userRole: 'comum'
    });

    assert(respostaTexto.includes('PIX') || respostaTexto.includes('Cobrança'), 'Deve gerar resposta de PIX');
    assert(respostaImg, 'Deve enviar imagem com o QR Code do PIX');
    console.log('  ✅ PASS: Comando .assinar gerou PIX com QR Code imagem');

    console.log('\n======================================================');
    console.log('🎉 TODOS OS TESTES DO MERCADO PAGO E PIX PASSARAM! ✅');
    console.log('======================================================\n');
}

runTests().then(() => {
    process.exit(0);
}).catch(err => {
    console.error('❌ Falha nos testes do Mercado Pago:', err);
    process.exit(1);
});
