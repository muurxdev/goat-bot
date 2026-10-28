/**
 * Serviço de Telefonia Virtual e Ativação de SMS para WhatsApp
 * Suporte a Seleção Inteligente de DDD (Brasil 11-99 e Internacional),
 * Acesso Ilimitado para Donos, Cobrança em Créditos com Estorno Automático,
 * Integração com Provedores Reais (SMS-Activate) e Modo Sandbox para Testes.
 */

const https = require('https');
const axios = require('axios');
const logger = require('../core/logger');
const env = require('../config/env');
const creditsService = require('./payments/creditsService');
const dataService = require('./dataService');
const freeSmsService = require('./freeSmsService');
const virtualNumberRepo = require('../database/repositories/virtualNumberRepository');

// Tabela Canônica de DDDs do Brasil (11 a 99)
const DDD_BRASIL = {
    // São Paulo
    '11': 'São Paulo / Região Metropolitana (SP)',
    '12': 'Vale do Paraíba / Litoral Norte (SP)',
    '13': 'Baixada Santista / Litoral Sul (SP)',
    '14': 'Bauru / Marília / Jaú (SP)',
    '15': 'Sorocaba / Itapetininga (SP)',
    '16': 'Ribeirão Preto / Franca (SP)',
    '17': 'São José do Rio Preto / Barretos (SP)',
    '18': 'Presidente Prudente / Araçatuba (SP)',
    '19': 'Campinas / Piracicaba / Americana (SP)',

    // Rio de Janeiro
    '21': 'Rio de Janeiro / Região Metropolitana (RJ)',
    '22': 'Campos dos Goytacazes / Cabo Frio / Macaé (RJ)',
    '24': 'Petrópolis / Volta Redonda / Angra dos Reis (RJ)',

    // Espírito Santo
    '27': 'Vitória / Região Metropolitana (ES)',
    '28': 'Cachoeiro de Itapemirim / Sul do ES (ES)',

    // Minas Gerais
    '31': 'Belo Horizonte / Região Metropolitana (MG)',
    '32': 'Juiz de Fora / Barbacena (MG)',
    '33': 'Governador Valadares / Teófilo Otoni (MG)',
    '34': 'Uberlândia / Uberaba / Triângulo Mineiro (MG)',
    '35': 'Poços de Caldas / Pouso Alegre / Sul de Minas (MG)',
    '37': 'Divinópolis / Itaúna / Centro-Oeste de Minas (MG)',
    '38': 'Montes Claros / Norte de Minas (MG)',

    // Paraná
    '41': 'Curitiba / Região Metropolitana (PR)',
    '42': 'Ponta Grossa / Guarapuava (PR)',
    '43': 'Londrina / Apucarana (PR)',
    '44': 'Maringá / Campo Mourão (PR)',
    '45': 'Foz do Iguaçu / Cascavel (PR)',
    '46': 'Francisco Beltrão / Pato Branco (PR)',

    // Santa Catarina
    '47': 'Joinville / Blumenau / Balneário Camboriú (SC)',
    '48': 'Florianópolis / Criciúma (SC)',
    '49': 'Chapecó / Lages / Oeste de SC (SC)',

    // Rio Grande do Sul
    '51': 'Porto Alegre / Região Metropolitana (RS)',
    '53': 'Pelotas / Rio Grande (RS)',
    '54': 'Caxias do Sul / Passo Fundo (RS)',
    '55': 'Santa Maria / Uruguaiana (RS)',

    // Centro-Oeste
    '61': 'Brasília / Distrito Federal (DF)',
    '62': 'Goiânia / Anápolis (GO)',
    '64': 'Rio Verde / Itumbiara / Caldas Novas (GO)',
    '65': 'Cuiabá / Várzea Grande (MT)',
    '66': 'Rondonópolis / Sinop (MT)',
    '67': 'Campo Grande / Dourados (MS)',

    // Norte
    '68': 'Rio Branco / Cruzeiro do Sul (AC)',
    '69': 'Porto Velho / Ji-Paraná (RO)',
    '63': 'Palmas / Araguaína (TO)',
    '91': 'Belém / Ananindeua (PA)',
    '93': 'Santarém / Altamira (PA)',
    '94': 'Marabá / Parauapebas (PA)',
    '92': 'Manaus / Região Metropolitana (AM)',
    '97': 'Tefé / Interior do Amazonas (AM)',
    '95': 'Boa Vista / Roraima (RR)',
    '96': 'Macapá / Santana (AP)',

    // Nordeste
    '71': 'Salvador / Região Metropolitana (BA)',
    '73': 'Ilhéus / Itabuna / Porto Seguro (BA)',
    '74': 'Juazeiro / Irecê (BA)',
    '75': 'Feira de Santana / Alagoinhas (BA)',
    '77': 'Vitória da Conquista / Barreiras (BA)',
    '79': 'Aracaju / Sergipe (SE)',
    '81': 'Recife / Região Metropolitana (PE)',
    '87': 'Petrolina / Caruaru (PE)',
    '82': 'Maceió / Alagoas (AL)',
    '83': 'João Pessoa / Campina Grande (PB)',
    '84': 'Natal / Mossoró (RN)',
    '85': 'Fortaleza / Região Metropolitana (CE)',
    '88': 'Juazeiro do Norte / Sobral (CE)',
    '86': 'Teresina / Parnaíba (PI)',
    '89': 'Picos / Floriano (PI)',
    '98': 'São Luís / Região Metropolitana (MA)',
    '99': 'Imperatriz / Caxias (MA)'
};

// DDDs Internacionais Principais (EUA/Canadá e outros)
const DDD_INTERNACIONAL = {
    '212': { ddi: '1', nome: 'Nova York / Manhattan (EUA)' },
    '305': { ddi: '1', nome: 'Miami / Flórida (EUA)' },
    '310': { ddi: '1', nome: 'Los Angeles / Beverly Hills (EUA)' },
    '415': { ddi: '1', nome: 'San Francisco / Vale do Silício (EUA)' },
    '702': { ddi: '1', nome: 'Las Vegas / Nevada (EUA)' },
    '407': { ddi: '1', nome: 'Orlando / Flórida (EUA)' },
    '312': { ddi: '1', nome: 'Chicago / Illinois (EUA)' },
    '206': { ddi: '1', nome: 'Seattle / Washington (EUA)' },
    '713': { ddi: '1', nome: 'Houston / Texas (EUA)' },
    '202': { ddi: '1', nome: 'Washington D.C. (EUA)' },
    '617': { ddi: '1', nome: 'Boston / Massachusetts (EUA)' },
    '404': { ddi: '1', nome: 'Atlanta / Georgia (EUA)' },
    '512': { ddi: '1', nome: 'Austin / Texas (EUA)' },
    '619': { ddi: '1', nome: 'San Diego / Califórnia (EUA)' },
    '786': { ddi: '1', nome: 'Miami Beach / Flórida (EUA)' },
    '917': { ddi: '1', nome: 'Nova York / Celulares (EUA)' }
};

const CUSTO_PADRAO_CREDITOS = 5; // 5 créditos por número para usuários comuns

/**
 * Resolve o DDD informado (número de 2 dígitos, 3 dígitos ou nome de país/estado)
 */
function resolveDdd(input) {
    let raw = String(input || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');

    // 1. DDI +1 / EUA direto (+1, 1, 01, eua, usa, us, etc.)
    if (['1', '01', 'eua', 'usa', 'us', 'estadosunidos', 'america', 'unitedstates'].includes(raw)) {
        return {
            ddi: '1',
            ddd: '305',
            countryCode: 'US',
            countryName: 'Estados Unidos',
            regionName: DDD_INTERNACIONAL['305'].nome,
            costCredits: CUSTO_PADRAO_CREDITOS
        };
    }

    // 2. Número com DDI 1 + DDD de 3 dígitos (ex: 1415, 1305, 1212)
    if (raw.startsWith('1') && raw.length === 4) {
        const ddd = raw.slice(1);
        const info = DDD_INTERNACIONAL[ddd] || { ddi: '1', nome: `Estados Unidos (Área ${ddd})` };
        return {
            ddi: '1',
            ddd,
            countryCode: 'US',
            countryName: 'Estados Unidos',
            regionName: info.nome,
            costCredits: CUSTO_PADRAO_CREDITOS
        };
    }

    // 3. DDI 55 + DDD de 2 dígitos (ex: 5511, 5521)
    if (raw.startsWith('55') && raw.length === 4) {
        const ddd = raw.slice(2);
        if (DDD_BRASIL[ddd]) {
            return {
                ddi: '55',
                ddd,
                countryCode: 'BR',
                countryName: 'Brasil',
                regionName: DDD_BRASIL[ddd],
                costCredits: CUSTO_PADRAO_CREDITOS
            };
        }
    }
    if (raw === '55' || ['br', 'brasil', 'brazil'].includes(raw)) {
        return {
            ddi: '55',
            ddd: '11',
            countryCode: 'BR',
            countryName: 'Brasil',
            regionName: DDD_BRASIL['11'],
            costCredits: CUSTO_PADRAO_CREDITOS
        };
    }

    // 4. DDD de 2 dígitos: Brasil (11 a 99)
    if (DDD_BRASIL[raw]) {
        return {
            ddi: '55',
            ddd: raw,
            countryCode: 'BR',
            countryName: 'Brasil',
            regionName: DDD_BRASIL[raw],
            costCredits: CUSTO_PADRAO_CREDITOS
        };
    }

    // 5. DDD de 3 dígitos: Internacional (EUA/Canadá)
    if (DDD_INTERNACIONAL[raw] || (raw.length === 3 && /^\d+$/.test(raw))) {
        const info = DDD_INTERNACIONAL[raw] || { ddi: '1', nome: `Estados Unidos (Área ${raw})` };
        return {
            ddi: '1',
            ddd: raw,
            countryCode: 'US',
            countryName: 'Estados Unidos',
            regionName: info.nome,
            costCredits: CUSTO_PADRAO_CREDITOS
        };
    }

    // 6. Palavras-chave: EUA e Brasil
    if (['ny', 'newyork', 'novayork', 'manhattan'].includes(raw)) return resolveDdd('212');
    if (['miami', 'florida', 'fl'].includes(raw)) return resolveDdd('305');
    if (['la', 'losangeles', 'california', 'ca'].includes(raw)) return resolveDdd('310');
    if (['sf', 'sanfrancisco', 'siliconvalley'].includes(raw)) return resolveDdd('415');
    if (['vegas', 'lasvegas', 'nevada'].includes(raw)) return resolveDdd('702');
    if (['orlando'].includes(raw)) return resolveDdd('407');
    if (['chicago', 'illinois'].includes(raw)) return resolveDdd('312');
    if (['texas', 'houston'].includes(raw)) return resolveDdd('713');
    if (['boston'].includes(raw)) return resolveDdd('617');
    if (['atlanta'].includes(raw)) return resolveDdd('404');

    if (['sp', 'saopaulo', 'sampa'].includes(raw)) return resolveDdd('11');
    if (['rj', 'riodejaneiro', 'rio'].includes(raw)) return resolveDdd('21');
    if (['mg', 'minas', 'bh'].includes(raw)) return resolveDdd('31');
    if (['pr', 'curitiba'].includes(raw)) return resolveDdd('41');
    if (['rs', 'portoalegre'].includes(raw)) return resolveDdd('51');
    if (['df', 'brasilia'].includes(raw)) return resolveDdd('61');
    if (['ba', 'salvador', 'bahia'].includes(raw)) return resolveDdd('71');
    if (['pe', 'recife', 'pernambuco'].includes(raw)) return resolveDdd('81');
    if (['ce', 'fortaleza', 'ceara'].includes(raw)) return resolveDdd('85');

    // Se não encontrou, retorna padrão Brasil 11
    return {
        ddi: '55',
        ddd: '11',
        countryCode: 'BR',
        countryName: 'Brasil',
        regionName: DDD_BRASIL['11'],
        costCredits: CUSTO_PADRAO_CREDITOS
    };
}

/**
 * Gera um número de telefone proceduralmente válido com nono dígito Anatel (BR) ou FCC (EUA)
 */
function generateProceduralNumber(resolved) {
    if (resolved.ddi === '55') {
        // Celular Brasil: +55 (DD) 9XXXX-XXXX
        // 9 dígitos locais: 9 + prefix(1) + middle(3) + last(4) = 9 dígitos
        const prefix = 6 + Math.floor(Math.random() * 4); // 6, 7, 8 ou 9
        const middle = Math.floor(100 + Math.random() * 900); // 3 dígitos (ex: 456)
        const last = Math.floor(1000 + Math.random() * 9000); // 4 dígitos (ex: 7890)
        const rawNumber = `55${resolved.ddd}9${prefix}${middle}${last}`;
        const formatted = `+55 (${resolved.ddd}) 9${prefix}${middle}-${last}`;
        return { rawNumber, formatted };
    }

    // EUA / Canadá: +1 (DDD) XXX-XXXX
    const exchange = 200 + Math.floor(Math.random() * 700); // 200 a 899 (não começa com 0 ou 1)
    const subscriber = 1000 + Math.floor(Math.random() * 9000);
    const rawNumber = `1${resolved.ddd}${exchange}${subscriber}`;
    const formatted = `+1 (${resolved.ddd}) ${exchange}-${subscriber}`;
    return { rawNumber, formatted };
}

const SMS_ACTIVATE_URL = 'https://api.sms-activate.org/stubs/handler_api.php';

const SMS_ACTIVATE_COUNTRY_IDS = {
    'BR': '73',
    'US': '187',
    'CA': '36',
    'AR': '39',
    'PT': '117',
    'GB': '16',
    'ES': '56',
    'FR': '78',
    'DE': '43'
};

/**
 * Obtém a chave de API do provedor (env ou gravada no banco SQLite)
 */
function getApiKey() {
    if (process.env.SMS_ACTIVATE_API_KEY) return process.env.SMS_ACTIVATE_API_KEY.trim();
    if (process.env.SMS_API_KEY) return process.env.SMS_API_KEY.trim();
    try {
        const configs = dataService.getConfigsData();
        if (configs?.global?.smsApiKey) return String(configs.global.smsApiKey).trim();
    } catch (errIgnorado) { logger.warn(`[VIRTUALNUMBERSERVICE] Falha ignorada em src/services/virtualNumberService.js:290: ${errIgnorado.message}`) }
    return null;
}

/**
 * Grava a chave de API do provedor de números reais no SQLite
 */
async function setApiKey(key) {
    const clean = (key || '').trim();
    const configs = dataService.getConfigsData();
    if (!configs.global) configs.global = {};
    configs.global.smsApiKey = clean;
    await dataService.saveConfigsData(configs);
    logger.info(`[VIRTUAL NUMBER] Chave de API de SMS configurada: ${clean ? '***' + clean.slice(-4) : 'REMOVIDA'}`);
    return clean;
}

/**
 * Consulta o saldo disponível na conta do SMS-Activate
 */
async function getProviderBalance(apiKey = null) {
    const key = apiKey || getApiKey();
    if (!key) return null;
    try {
        const res = await axios.get(SMS_ACTIVATE_URL, {
            params: { api_key: key, action: 'getBalance' },
            timeout: 15000
        });
        const text = String(res.data || '').trim();
        if (text.startsWith('ACCESS_BALANCE:')) {
            const val = parseFloat(text.split(':')[1]);
            return { success: true, balance: val, raw: text };
        }
        return { success: false, error: text };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

/**
 * Aluga um número real de operadora no SMS-Activate para ativação de WhatsApp
 */
async function rentNumberFromProvider(countryCode = 'BR', apiKey = null) {
    const key = apiKey || getApiKey();
    if (!key) return null;
    const countryId = SMS_ACTIVATE_COUNTRY_IDS[countryCode] || '73';
    try {
        const res = await axios.get(SMS_ACTIVATE_URL, {
            params: {
                api_key: key,
                action: 'getNumber',
                service: 'wa',
                country: countryId
            },
            timeout: 25000
        });
        const text = String(res.data || '').trim();
        if (text.startsWith('ACCESS_NUMBER:')) {
            const parts = text.split(':');
            const activationId = parts[1];
            const rawPhone = parts[2];
            return {
                success: true,
                activationId,
                rawPhone
            };
        }
        return { success: false, error: text };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

/**
 * Consulta na API se a Meta/WhatsApp enviou o SMS com o código de 6 dígitos
 */
async function checkCodeFromProvider(activationId, apiKey = null) {
    const key = apiKey || getApiKey();
    if (!key || !activationId) return null;
    try {
        const res = await axios.get(SMS_ACTIVATE_URL, {
            params: {
                api_key: key,
                action: 'getStatus',
                id: activationId
            },
            timeout: 15000
        });
        const text = String(res.data || '').trim();
        if (text.startsWith('STATUS_OK:')) {
            const code = text.split(':')[1].trim();
            return { status: 'RECEIVED', code };
        }
        if (text === 'STATUS_WAIT_CODE' || text === 'STATUS_WAIT_RETRY') {
            return { status: 'PENDING' };
        }
        if (text === 'STATUS_CANCEL') {
            return { status: 'CANCELLED' };
        }
        return { status: 'PENDING', raw: text };
    } catch (err) {
        return { status: 'ERROR', error: err.message };
    }
}

/**
 * Cancela a ativação no provedor e recupera o saldo
 */
async function cancelOrderOnProvider(activationId, apiKey = null) {
    const key = apiKey || getApiKey();
    if (!key || !activationId) return;
    try {
        await axios.get(SMS_ACTIVATE_URL, {
            params: {
                api_key: key,
                action: 'setStatus',
                id: activationId,
                status: 8
            },
            timeout: 15000
        });
    } catch (errIgnorado) { logger.warn(`[VIRTUALNUMBERSERVICE] Falha ignorada em src/services/virtualNumberService.js:411: ${errIgnorado.message}`) }
}

/**
 * Conclui a ativação com sucesso no provedor
 */
async function finishOrderOnProvider(activationId, apiKey = null) {
    const key = apiKey || getApiKey();
    if (!key || !activationId) return;
    try {
        await axios.get(SMS_ACTIVATE_URL, {
            params: {
                api_key: key,
                action: 'setStatus',
                id: activationId,
                status: 6
            },
            timeout: 15000
        });
    } catch (errIgnorado) { logger.warn(`[VIRTUALNUMBERSERVICE] Falha ignorada em src/services/virtualNumberService.js:430: ${errIgnorado.message}`) }
}

/**
 * Solicita um número virtual para ativação de WhatsApp
 */
async function requestVirtualNumber({ sender, dddInput, isOwner, autoReplace = false }) {
    // 1. Verifica se o usuário já tem um número ativo aguardando SMS
    const activeOrder = virtualNumberRepo.getActiveOrderByUser(sender);
    const apiKey = getApiKey();

    if (activeOrder) {
        if (autoReplace) {
            logger.info(`[VIRTUAL NUMBER] Cancelando ativação anterior #${activeOrder.id} de ${sender} (autoReplace)`);
            virtualNumberRepo.updateStatus(activeOrder.id, { status: 'CANCELLED' });
            if (activeOrder.activation_id && !activeOrder.activation_id.startsWith('act_') && !activeOrder.activation_id.startsWith('free_') && apiKey) {
                cancelOrderOnProvider(activeOrder.activation_id, apiKey).catch(() => {});
            }
            if (!isOwner && activeOrder.cost_credits > 0) {
                creditsService.ajustar({
                    jid: sender,
                    creditos: activeOrder.cost_credits,
                    motivo: `Estorno de substituição do número virtual #${activeOrder.id}`
                });
            }
        } else {
            return {
                success: false,
                code: 'ALREADY_HAS_ACTIVE',
                message: `⚠️ Você já possui uma ativação em andamento para o número *${activeOrder.phone_number}*.\nUse \`.numfake status\` ou \`.numfake cancelar\`.`,
                activeOrder
            };
        }
    }

    const resolved = resolveDdd(dddInput);
    const cost = isOwner ? 0 : resolved.costCredits;

    // 2. Cobrança de créditos para usuários comuns
    if (!isOwner) {
        const saldo = creditsService.saldo(sender);
        if (saldo < cost) {
            return {
                success: false,
                code: 'INSUFFICIENT_CREDITS',
                message: `❌ *SALDO INSUFICIENTE!*\n\n• Custo do número virtual: *${cost} créditos*\n• Seu saldo atual: *${saldo} créditos*\n\n💡 _Adquira créditos com_ \`.comprarcreditos\` _para continuar!_`
            };
        }

        const debitResult = creditsService.gastar({
            jid: sender,
            creditos: cost,
            motivo: `Aluguel de número virtual DDD ${resolved.ddd} (${resolved.countryName})`
        });
        if (!debitResult || !debitResult.ok) {
            return {
                success: false,
                code: 'DEBIT_FAILED',
                message: '❌ Falha ao processar o débito de créditos: ' + (debitResult?.erro || 'Tente novamente.')
            };
        }
    }

    // 3. Alocação do Número: Provedor Real (SMS-Activate) se chave existir, senão Sandbox Inteligente
    let activationId = `act_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    let numberRaw = '';
    let numberFormatted = '';
    let isReal = false;

    if (apiKey) {
        try {
            logger.info(`[VIRTUAL NUMBER] Solicitando chip real no SMS-Activate para país ${resolved.countryCode}...`);
            const rentRes = await rentNumberFromProvider(resolved.countryCode, apiKey);
            if (rentRes && rentRes.success) {
                activationId = rentRes.activationId;
                numberRaw = rentRes.rawPhone.replace(/\D/g, '');
                isReal = true;
                
                // Formatação do número real recebido da operadora
                if (numberRaw.startsWith('55') && numberRaw.length >= 12) {
                    const ddd = numberRaw.slice(2, 4);
                    const rest = numberRaw.slice(4);
                    numberFormatted = `+55 (${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
                } else if (numberRaw.startsWith('1') && numberRaw.length >= 11) {
                    const ddd = numberRaw.slice(1, 4);
                    const rest = numberRaw.slice(4);
                    numberFormatted = `+1 (${ddd}) ${rest.slice(0, 3)}-${rest.slice(3)}`;
                } else {
                    numberFormatted = `+${numberRaw}`;
                }
                logger.info(`[VIRTUAL NUMBER] Chip real alugado no SMS-Activate: ${numberFormatted} (ID: ${activationId})`);
            } else {
                logger.warn(`[VIRTUAL NUMBER] Provedor real falhou (${rentRes?.error}). Revertendo créditos e informando.`);
                if (!isOwner && cost > 0) {
                    creditsService.ajustar({
                        jid: sender,
                        creditos: cost,
                        motivo: 'Estorno por indisponibilidade no provedor de números reais'
                    });
                }
                const errText = rentRes?.error || 'Erro desconhecido';
                let userFriendlyErr = `❌ *FALHA NO PROVEDOR DE CHIPS REAIS!*\n\nO SMS-Activate retornou: _${errText}_.\n`;
                if (errText.includes('NO_BALANCE')) {
                    userFriendlyErr += '\n💰 *Causa:* Saldo esgotado na conta do SMS-Activate. O dono do bot precisa recarregar.';
                } else if (errText.includes('NO_NUMBERS')) {
                    userFriendlyErr += `\n⚠️ *Causa:* Não há números disponíveis no momento para ${resolved.countryName}. Tente outro DDD/país.`;
                } else if (errText.includes('BAD_KEY')) {
                    userFriendlyErr += '\n🔑 *Causa:* A API Key configurada para o SMS-Activate é inválida. Use `.numfake setkey <chave>`.';
                }
                return {
                    success: false,
                    code: 'PROVIDER_ERROR',
                    message: userFriendlyErr
                };
            }
        } catch (apiErr) {
            logger.error(`[VIRTUAL NUMBER] Erro ao contatar SMS-Activate: ${apiErr.message}`);
        }
    }

    if (!isReal) {
        const phoneGen = generateProceduralNumber(resolved);
        numberRaw = phoneGen.rawNumber;
        numberFormatted = phoneGen.formatted;
    }

    const now = Date.now();
    const expiresAt = now + 15 * 60 * 1000;

    const order = virtualNumberRepo.createOrder({
        userJid: sender,
        activationId,
        phoneNumber: numberFormatted,
        ddd: resolved.ddd,
        countryCode: resolved.countryCode,
        regionName: resolved.regionName,
        service: 'wa',
        costCredits: cost,
        isOwner: isOwner ? 1 : 0,
        status: 'PENDING',
        createdAt: now,
        expiresAt
    });

    logger.info(`[VIRTUAL NUMBER] Pedido #${order.id} criado para ${sender}: ${numberFormatted} [Real: ${isReal}] [Dono: ${isOwner}]`);

    return {
        success: true,
        order,
        resolved,
        numberRaw,
        numberFormatted,
        isReal,
        expiresInMinutes: 15
    };
}

/**
 * Solicita um número público gratuito (Free Scraper) para ativação de WhatsApp
 */
async function requestFreeVirtualNumber({ sender, countryFilter, isOwner, autoReplace = false }) {
    const activeOrder = virtualNumberRepo.getActiveOrderByUser(sender);
    const apiKey = getApiKey();

    if (activeOrder) {
        if (autoReplace) {
            logger.info(`[VIRTUAL NUMBER] Cancelando ativação anterior #${activeOrder.id} de ${sender} (autoReplace)`);
            virtualNumberRepo.updateStatus(activeOrder.id, { status: 'CANCELLED' });
            if (activeOrder.activation_id && !activeOrder.activation_id.startsWith('act_') && !activeOrder.activation_id.startsWith('free_') && apiKey) {
                cancelOrderOnProvider(activeOrder.activation_id, apiKey).catch(() => {});
            }
            if (!isOwner && activeOrder.cost_credits > 0) {
                creditsService.ajustar({
                    jid: sender,
                    creditos: activeOrder.cost_credits,
                    motivo: `Estorno de substituição do número virtual #${activeOrder.id}`
                });
            }
        } else {
            return {
                success: false,
                code: 'ALREADY_HAS_ACTIVE',
                message: `⚠️ Você já possui uma ativação em andamento para o número *${activeOrder.phone_number}*.\nUse \`.numfake status\` ou \`.numfake cancelar\`.`,
                activeOrder
            };
        }
    }

    // Busca números públicos atualizados
    const allNumbers = await freeSmsService.getPublicNumbers();
    if (!allNumbers || allNumbers.length === 0) {
        return {
            success: false,
            code: 'NO_FREE_NUMBERS',
            message: '❌ Não foi possível carregar números públicos no momento. Tente novamente em instantes.'
        };
    }

    let filtered = allNumbers;
    const filter = String(countryFilter || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');

    if (filter) {
        if (['us', '1', '01', 'eua', 'usa', 'estadosunidos'].includes(filter)) {
            filtered = allNumbers.filter(n => n.country === 'US' || n.ddi === '1');
        } else if (['gb', 'uk', '44', 'reinounido', 'inglaterra', 'england'].includes(filter)) {
            filtered = allNumbers.filter(n => n.country === 'GB' || n.ddi === '44');
        } else if (['se', '46', 'suecia', 'sweden'].includes(filter)) {
            filtered = allNumbers.filter(n => n.country === 'SE' || n.ddi === '46');
        } else if (['au', '61', 'australia'].includes(filter)) {
            filtered = allNumbers.filter(n => n.country === 'AU' || n.ddi === '61');
        } else if (['ge', '995', 'georgia'].includes(filter)) {
            filtered = allNumbers.filter(n => n.country === 'GE' || n.ddi === '995');
        } else if (['ua', '380', 'ucrania', 'ukraine'].includes(filter)) {
            filtered = allNumbers.filter(n => n.country === 'UA' || n.ddi === '380');
        } else if (['fr', '33', 'franca', 'france'].includes(filter)) {
            filtered = allNumbers.filter(n => n.country === 'FR' || n.ddi === '33');
        } else {
            const byDdiOrCountry = allNumbers.filter(n => n.ddi === filter || n.country.toLowerCase() === filter);
            if (byDdiOrCountry.length > 0) filtered = byDdiOrCountry;
        }
    }

    if (!filtered || filtered.length === 0) {
        filtered = allNumbers;
    }

    // Seleciona aleatoriamente entre os filtrados
    const selected = filtered[Math.floor(Math.random() * filtered.length)];

    const now = Date.now();
    const expiresAt = now + 15 * 60 * 1000;
    const activationId = `free_${selected.raw}`;

    const order = virtualNumberRepo.createOrder({
        userJid: sender,
        activationId,
        phoneNumber: selected.formatted,
        ddd: selected.ddi,
        countryCode: selected.country,
        regionName: `${selected.flag} ${selected.name}`,
        service: 'wa',
        costCredits: 0,
        isOwner: isOwner ? 1 : 0,
        status: 'PENDING',
        createdAt: now,
        expiresAt
    });

    logger.info(`[VIRTUAL NUMBER] Pedido FREE #${order.id} criado para ${sender}: ${selected.formatted} (${selected.name})`);

    return {
        success: true,
        order,
        selected,
        numberRaw: selected.raw,
        numberFormatted: selected.formatted,
        regionName: `${selected.flag} ${selected.name}`,
        url: selected.url,
        isFree: true,
        expiresInMinutes: 15
    };
}

/**
 * Cancela um número virtual pendente e estorna os créditos caso não seja dono
 */
async function cancelVirtualNumber({ sender, isOwner }) {
    const activeOrder = virtualNumberRepo.getActiveOrderByUser(sender);
    if (!activeOrder) {
        return {
            success: false,
            message: '❌ Você não possui nenhum pedido de número virtual pendente para cancelar.'
        };
    }

    virtualNumberRepo.updateStatus(activeOrder.id, { status: 'CANCELLED' });

    const apiKey = getApiKey();
    if (activeOrder.activation_id && !activeOrder.activation_id.startsWith('act_') && !activeOrder.activation_id.startsWith('free_') && apiKey) {
        cancelOrderOnProvider(activeOrder.activation_id, apiKey).catch(() => {});
    }

    let refunded = 0;
    if (!isOwner && activeOrder.cost_credits > 0) {
        refunded = activeOrder.cost_credits;
        creditsService.ajustar({
            jid: sender,
            creditos: refunded,
            motivo: `Estorno do cancelamento de número virtual #${activeOrder.id}`
        });
    }

    logger.info(`[VIRTUAL NUMBER] Pedido #${activeOrder.id} cancelado por ${sender}. Reembolso: ${refunded} créditos`);

    return {
        success: true,
        order: activeOrder,
        refundedCredits: refunded
    };
}

/**
 * Consulta o status atual da ativação
 */
async function checkVirtualNumberStatus(sender) {
    let activeOrder = virtualNumberRepo.getActiveOrderByUser(sender);
    if (!activeOrder) {
        const lastOrder = (virtualNumberRepo.listOrdersByUser(sender, 1) || [])[0];
        return { hasActive: false, lastOrder };
    }

    const now = Date.now();
    const timeLeftMs = Math.max(0, activeOrder.expires_at - now);
    const isExpired = timeLeftMs <= 0;
    const apiKey = getApiKey();
    const isFree = Boolean(activeOrder.activation_id && activeOrder.activation_id.startsWith('free_'));
    const isReal = Boolean(activeOrder.activation_id && !activeOrder.activation_id.startsWith('act_') && !isFree);
    let recentMessages = [];
    let inboxUrl = null;

    if (isFree) {
        const rawDigits = activeOrder.activation_id.replace('free_', '');
        inboxUrl = `https://anonymsms.com/number/${rawDigits}/`;
    }

    if (activeOrder.status === 'PENDING' && !isExpired) {
        if (isFree) {
            // Raspa inbox público em tempo real
            try {
                const scrapeRes = await freeSmsService.scrapeNumberInbox(inboxUrl);
                if (scrapeRes && scrapeRes.success) {
                    recentMessages = scrapeRes.messages || [];
                    if (scrapeRes.latestCode) {
                        virtualNumberRepo.updateStatus(activeOrder.id, {
                            status: 'RECEIVED',
                            smsCode: scrapeRes.latestCode
                        });
                        activeOrder.status = 'RECEIVED';
                        activeOrder.sms_code = scrapeRes.latestCode;
                        logger.info(`[VIRTUAL NUMBER] SMS FREE recebido para #${activeOrder.id}: ${scrapeRes.latestCode}`);
                    }
                }
            } catch (err) {
                logger.warn(`[VIRTUAL NUMBER] Erro ao raspar inbox free #${activeOrder.id}: ${err.message}`);
            }
        } else if (isReal && apiKey) {
            // Consulta a API do SMS-Activate se a Meta enviou o SMS real
            const checkRes = await checkCodeFromProvider(activeOrder.activation_id, apiKey);
            if (checkRes && checkRes.status === 'RECEIVED' && checkRes.code) {
                virtualNumberRepo.updateStatus(activeOrder.id, {
                    status: 'RECEIVED',
                    smsCode: checkRes.code
                });
                finishOrderOnProvider(activeOrder.activation_id, apiKey).catch(() => {});
                activeOrder.status = 'RECEIVED';
                activeOrder.sms_code = checkRes.code;
                logger.info(`[VIRTUAL NUMBER] SMS REAL da Meta recebido para #${activeOrder.id}: ${checkRes.code}`);
            } else if (checkRes && checkRes.status === 'CANCELLED') {
                virtualNumberRepo.updateStatus(activeOrder.id, { status: 'CANCELLED' });
                activeOrder.status = 'CANCELLED';
            }
        } else if (!apiKey && !isFree) {
            // Modo simulação: gera código apenas quando o usuário explicitamente consulta o status/código
            if (!activeOrder.sms_code) {
                const code = `${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;
                virtualNumberRepo.updateStatus(activeOrder.id, {
                    status: 'RECEIVED',
                    smsCode: code
                });
                activeOrder.status = 'RECEIVED';
                activeOrder.sms_code = code;
                logger.info(`[VIRTUAL NUMBER] SMS simulado gerado sob demanda para #${activeOrder.id}: ${code}`);
            }
        }
    }

    const minutesLeft = Math.floor(timeLeftMs / 60000);
    const secondsLeft = Math.floor((timeLeftMs % 60000) / 1000);

    return {
        hasActive: activeOrder.status !== 'CANCELLED',
        order: activeOrder,
        timeLeftFormatted: `${minutesLeft}m ${secondsLeft < 10 ? '0' : ''}${secondsLeft}s`,
        isExpired,
        isReal,
        isFree,
        recentMessages,
        inboxUrl
    };
}

/**
 * Simula ou registra a chegada de um código SMS de 6 dígitos para testes ou API
 */
function deliverSmsCode(activationId, smsCode) {
    const order = virtualNumberRepo.getOrderByActivationId(activationId);
    if (!order || !['PENDING', 'RECEIVED'].includes(order.status)) return false;

    const code = String(smsCode || `${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`);
    virtualNumberRepo.updateStatus(order.id, {
        status: 'RECEIVED',
        smsCode: code
    });

    logger.info(`[VIRTUAL NUMBER] SMS Recebido para #${order.id} (${order.phone_number}): Código ${code}`);
    return { order, code };
}

/**
 * Catálogo resumido de DDDs disponíveis
 */
function getDddCatalog() {
    return {
        brasil: DDD_BRASIL,
        internacional: DDD_INTERNACIONAL
    };
}

module.exports = {
    resolveDdd,
    generateProceduralNumber,
    requestVirtualNumber,
    requestFreeVirtualNumber,
    cancelVirtualNumber,
    checkVirtualNumberStatus,
    deliverSmsCode,
    getDddCatalog,
    getApiKey,
    setApiKey,
    getProviderBalance,
    rentNumberFromProvider,
    checkCodeFromProvider,
    cancelOrderOnProvider,
    finishOrderOnProvider,
    getPublicNumbers: freeSmsService.getPublicNumbers,
    DDD_BRASIL,
    DDD_INTERNACIONAL
};
