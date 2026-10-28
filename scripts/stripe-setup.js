/**
 * Script de Verificação e Configuração do Stripe para o GOATBOT
 * 
 * Uso:
 *   node scripts/stripe-setup.js
 *   ou
 *   node scripts/stripe-setup.js sk_live_... [whsec_...]
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const ENV_PATH = path.resolve(__dirname, '../.env');

async function testStripeKey(secretKey) {
    try {
        const res = await axios.get('https://api.stripe.com/v1/account', {
            headers: { Authorization: `Bearer ${secretKey}` },
            timeout: 10000
        });
        return { ok: true, account: res.data };
    } catch (err) {
        const msg = err.response?.data?.error?.message || err.message;
        return { ok: false, error: msg };
    }
}

async function testPixCapability(secretKey) {
    try {
        const params = new URLSearchParams();
        params.append('mode', 'payment');
        params.append('success_url', 'https://stripe.com');
        params.append('cancel_url', 'https://stripe.com');
        params.append('line_items[0][price_data][currency]', 'brl');
        params.append('line_items[0][price_data][unit_amount]', '1500');
        params.append('line_items[0][price_data][product_data][name]', 'Teste Pix');
        params.append('line_items[0][quantity]', '1');
        params.append('payment_method_types[0]', 'card');
        params.append('payment_method_types[1]', 'pix');

        const res = await axios.post('https://api.stripe.com/v1/checkout/sessions', params.toString(), {
            headers: {
                Authorization: `Bearer ${secretKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            timeout: 15000
        });

        if (res.data?.id) {
            try {
                await axios.post(`https://api.stripe.com/v1/checkout/sessions/${res.data.id}/expire`, '', {
                    headers: { Authorization: `Bearer ${secretKey}` },
                    timeout: 5000
                });
            } catch (_) {}
        }

        return { pixOk: true };
    } catch (err) {
        const msg = err.response?.data?.error?.message || err.message;
        return { pixOk: false, reason: msg };
    }
}

function updateEnv(key, value) {
    let content = '';
    if (fs.existsSync(ENV_PATH)) {
        content = fs.readFileSync(ENV_PATH, 'utf8');
    }
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
        content = content.replace(regex, `${key}=${value}`);
    } else {
        content += (content.endsWith('\n') || content === '' ? '' : '\n') + `${key}=${value}\n`;
    }
    fs.writeFileSync(ENV_PATH, content, 'utf8');
}

async function main() {
    console.log('\n======================================================');
    console.log('   💳 DIAGNÓSTICO & CONFIGURAÇÃO DO STRIPE (BOT XP)   ');
    console.log('======================================================\n');

    let key = process.argv[2] || process.env.STRIPE_SECRET_KEY;
    let whsec = process.argv[3] || process.env.STRIPE_WEBHOOK_SECRET;

    if (!key) {
        console.log('❌ Nenhuma STRIPE_SECRET_KEY encontrada no .env nem nos argumentos.\n');
        console.log('👉 Para obter sua chave secreta da Stripe:');
        console.log('   1. Acesse: https://dashboard.stripe.com/apikeys');
        console.log('   2. Copie sua "Secret key" (começa com sk_live_ para produção ou sk_test_ para teste)');
        console.log('   3. Execute: node scripts/stripe-setup.js <sua_chave_secreta> [whsec_opcional]\n');
        return;
    }

    console.log('⏳ Testando conexão com a API do Stripe...');
    const accTest = await testStripeKey(key);

    if (!accTest.ok) {
        console.log(`❌ Erro ao validar chave secreta: ${accTest.error}\n`);
        return;
    }

    const acc = accTest.account;
    const isProd = key.startsWith('sk_live_') || key.startsWith('rk_live_');
    console.log('✅ Chave válida e autenticada com sucesso!');
    console.log(`   • Modo: ${isProd ? '🟢 PRODUÇÃO (Live Key)' : '🟡 TESTE (Test Key)'}`);
    console.log(`   • ID da Conta: ${acc.id}`);
    console.log(`   • Nome Comercial: ${acc.business_profile?.name || acc.settings?.dashboard?.display_name || '(Não definido)'}`);
    console.log(`   • País: ${acc.country || 'BR'}`);
    console.log(`   • Moeda Padrão: ${(acc.default_currency || 'brl').toUpperCase()}`);
    console.log(`   • Cobranças Habilitadas: ${acc.charges_enabled ? 'Sim ✅' : 'Não ❌'}`);

    console.log('\n⏳ Verificando suporte ao PIX na sua conta Stripe...');
    const pixTest = await testPixCapability(key);

    if (pixTest.pixOk) {
        console.log('🎉 PIX ESTÁ 100% HABILITADO E FUNCIONAL NA SUA CONTA STRIPE!');
        console.log('   O comando .assinar irá gerar pagamentos com PIX e Cartão de Crédito automaticamente.\n');
    } else {
        console.log('⚠️ PIX AINDA NÃO ESTÁ ATIVO NESTA CONTA STRIPE.');
        console.log(`   Motivo retornado pela Stripe: ${pixTest.reason}`);
        console.log('   👉 COMO ATIVAR O PIX COM 1 CLIQUE:');
        console.log('   1. Acesse: https://dashboard.stripe.com/settings/payment_methods');
        console.log('   2. Procure "Pix" na lista de métodos de pagamento.');
        console.log('   3. Clique em "Ativar" (Turn on).');
        console.log('   Enquanto o Pix não estiver ativo, o bot aceitará pagamentos via Cartão de Crédito perfeitamente!\n');
    }

    // Salva no .env
    updateEnv('STRIPE_SECRET_KEY', key);
    console.log('💾 STRIPE_SECRET_KEY salva no arquivo .env!');

    if (whsec) {
        updateEnv('STRIPE_WEBHOOK_SECRET', whsec);
        console.log('💾 STRIPE_WEBHOOK_SECRET salva no arquivo .env!');
    } else if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.log('\n📌 CONFIGURAÇÃO DO WEBHOOK (CONFIRMAÇÃO AUTOMÁTICA):');
        console.log('   1. Acesse: https://dashboard.stripe.com/webhooks');
        console.log('   2. Clique em "Adicionar endpoint"');
        console.log('   3. URL do endpoint: http://SEU_IP_VPS_ANTIGO:3000/stripe/webhook');
        console.log('   4. Eventos a ouvir: checkout.session.completed');
        console.log('   5. Copie o "Segredo de assinatura" (whsec_...) e adicione no .env:\n');
        console.log('      STRIPE_WEBHOOK_SECRET=whsec_...\n');
    }

    console.log('✨ Tudo pronto! O comando .assinar já está apto a operar.\n');
}

main().catch(console.error);
