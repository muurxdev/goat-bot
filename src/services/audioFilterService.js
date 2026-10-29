/**
 * Serviço de Filtros e Processamento de Áudio via FFmpeg
 * Oferece presets de equalização, modulação, alteração de pitch/tempo e acústica espacial
 */

const { spawn } = require('child_process');
const logger = require('../core/logger');

const AUDIO_FILTERS = {
    // Pitch & Tempo
    nightcore: {
        id: 'nightcore',
        name: 'Nightcore Pitch',
        category: 'pitch_tempo',
        emoji: '⚡',
        filter: 'asetrate=44100*1.25,aresample=44100,atempo=1.06',
        description: 'Acelera o áudio e eleva o pitch vocal, criando a clássica sonoridade Nightcore energética.',
        specs: { rate: '55.1 kHz -> 44.1 kHz', tempo: '+6%', pitch: '+25%' }
    },
    vaporwave: {
        id: 'vaporwave',
        name: 'Vaporwave Nostalgia',
        category: 'pitch_tempo',
        emoji: '🌆',
        filter: 'asetrate=44100*0.82,aresample=44100,atempo=1.0,aecho=0.8:0.88:60:0.4',
        description: 'Desacelera a frequência e aplica eco suave para evocar estética retrô dos anos 80 e 90.',
        specs: { rate: '36.1 kHz', pitch: '-18%', echo: '60ms delay' }
    },
    slowed: {
        id: 'slowed',
        name: 'Slowed + Reverb',
        category: 'pitch_tempo',
        emoji: '🌙',
        filter: 'atempo=0.85,aecho=0.8:0.9:1000:0.35',
        description: 'Reduz o andamento para 85% e mergulha a trilha em reverberação imersiva estilo lo-fi room.',
        specs: { tempo: '-15%', reverbDelay: '1000ms', decay: '0.35' }
    },
    fast: {
        id: 'fast',
        name: 'Velocidade Dupla (2x)',
        category: 'pitch_tempo',
        emoji: '⏩',
        filter: 'atempo=2.0',
        description: 'Dobra o andamento da faixa mantendo a afinação vocal original sem distorção harmônica.',
        specs: { tempo: '+100%', pitchPreserved: true }
    },
    slow: {
        id: 'slow',
        name: 'Slow Motion (0.75x)',
        category: 'pitch_tempo',
        emoji: '🐢',
        filter: 'atempo=0.75',
        description: 'Reduz a velocidade em 25% preservando a tonalidade natural da voz e dos instrumentos.',
        specs: { tempo: '-25%', pitchPreserved: true }
    },
    chipmunk: {
        id: 'chipmunk',
        name: 'Voz de Esquilo',
        category: 'pitch_tempo',
        emoji: '🐿️',
        filter: 'asetrate=44100*1.5,aresample=44100',
        description: 'Dobra a frequência vocal simulando voz aguda cômica de esquilo de desenho animado.',
        specs: { pitch: '+50%', formants: 'Shifted Up' }
    },
    darthvader: {
        id: 'darthvader',
        name: 'Lorde Sombrio (Darth Vader)',
        category: 'pitch_tempo',
        emoji: '🦹',
        filter: 'asetrate=44100*0.65,aresample=44100,lowpass=f=3000',
        description: 'Afunda o tom em graves cavernosos com corte de agudos em 3kHz para voz de vilão galáctico.',
        specs: { pitch: '-35%', lowpass: '3000 Hz' }
    },
    reverse: {
        id: 'reverse',
        name: 'Áudio Invertido',
        category: 'pitch_tempo',
        emoji: '🔄',
        filter: 'areverse',
        description: 'Inverte totalmente o fluxo temporal do áudio do fim para o começo.',
        specs: { direction: 'Backwards' }
    },

    // Equalização & Dinâmica
    bassboost: {
        id: 'bassboost',
        name: 'Bass Boost Pesado',
        category: 'equalizer',
        emoji: '🔊',
        filter: 'equalizer=f=60:width_type=h:width=50:g=15,volume=1.3',
        description: 'Reforço massivo de sub-graves na frequência de 60Hz com ganho de +15dB para impacto sonoro.',
        specs: { freq: '60 Hz', width: '50 Hz', gain: '+15 dB' }
    },
    sub_bass: {
        id: 'sub_bass',
        name: 'Sub-Bass Treme Terra',
        category: 'equalizer',
        emoji: '💥',
        filter: 'equalizer=f=40:width_type=h:width=30:g=18,volume=1.2',
        description: 'Foco extremo na faixa de 40Hz projetado para caixas de som e subwoofers potentes.',
        specs: { freq: '40 Hz', width: '30 Hz', gain: '+18 dB' }
    },
    treble_boost: {
        id: 'treble_boost',
        name: 'Treble Brilho Alto',
        category: 'equalizer',
        emoji: '✨',
        filter: 'equalizer=f=8000:width_type=h:width=1000:g=12',
        description: 'Realce de frequências altas a 8kHz conferindo clareza cristalina aos pratos e vocais.',
        specs: { freq: '8000 Hz', width: '1000 Hz', gain: '+12 dB' }
    },
    earrape: {
        id: 'earrape',
        name: 'Distorção Extrema (Overdrive)',
        category: 'equalizer',
        emoji: '💥',
        filter: 'volume=15,acrossover=split=500[l][h];[l]equalizer=f=80:g=20[l2];[h]equalizer=f=3000:g=15[h2];[l2][h2]amix',
        description: 'Saturação destrutiva máxima de sinal com ganho extremo para memes sonoros.',
        specs: { gain: '+20 dB', distortion: 'Hard Clip' }
    },
    karaoke: {
        id: 'karaoke',
        name: 'Remover Vocal (Karaokê)',
        category: 'equalizer',
        emoji: '🎤',
        filter: 'pan=stereo|c0=c0-c1|c1=c1-c0',
        description: 'Cancela o canal central eliminando a maioria dos vocais gravados em estéreo.',
        specs: { method: 'Stereo Phase Cancellation' }
    },

    // Espacial & Acústica
    audio8d: {
        id: 'audio8d',
        name: 'Áudio 8D Imersivo',
        category: 'spatial',
        emoji: '🎧',
        filter: 'apulsator=hz=0.125:amount=0.95',
        description: 'Simula a sensação do som girando 360 graus ao redor da cabeça com fones de ouvido.',
        specs: { orbitSpeed: '0.125 Hz (8s rotação)', depth: '95%' }
    },
    reverb: {
        id: 'reverb',
        name: 'Reverb Catedral',
        category: 'spatial',
        emoji: '🏛️',
        filter: 'aecho=0.8:0.9:1000|1800:0.3|0.25',
        description: 'Imersão espacial em eco múltiplo simulando a acústica de um templo ou grande salão de pedra.',
        specs: { delays: '1000ms / 1800ms', feedback: '0.3 / 0.25' }
    },
    underwater: {
        id: 'underwater',
        name: 'Efeito Embaixo D’água',
        category: 'spatial',
        emoji: '🌊',
        filter: 'lowpass=f=450,volume=1.5',
        description: 'Filtro passa-baixa radical cortando sons acima de 450Hz para simular mergulho profundo.',
        specs: { cutoff: '450 Hz', rollOff: '12 dB/oct' }
    },

    // Vintage & Modulação
    lofi: {
        id: 'lofi',
        name: 'Fita Cassete Lo-Fi',
        category: 'vintage',
        emoji: '📻',
        filter: 'lowpass=f=3200,highpass=f=250,vibrato=f=4:d=0.2',
        description: 'Limitação de banda analógica com leve instabilidade de fita cassete (wow & flutter).',
        specs: { bandpass: '250 Hz - 3.2 kHz', flutter: '4 Hz' }
    },
    robot: {
        id: 'robot',
        name: 'Voz Robótica Vocoder',
        category: 'vintage',
        emoji: '🤖',
        filter: 'afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\'',
        description: 'Achata a fase harmônica transformando qualquer voz humana em sintetizador de androide.',
        specs: { transform: 'Zero-phase FFT' }
    },
    telephone: {
        id: 'telephone',
        name: 'Telefone Antigo',
        category: 'vintage',
        emoji: '☎️',
        filter: 'highpass=f=300,lowpass=f=3400,volume=1.8',
        description: 'Banda estreita padrão telecomunicação analógica dos telefones residenciais dos anos 90.',
        specs: { bandpass: '300 Hz - 3.4 kHz', gain: '+5 dB' }
    },
    radio: {
        id: 'radio',
        name: 'Rádio Walkie-Talkie',
        category: 'vintage',
        emoji: '📡',
        filter: 'highpass=f=500,lowpass=f=2800,volume=2.0',
        description: 'Transmissão militar em ondas curtas com saturação e corte agressivo de extremos.',
        specs: { bandpass: '500 Hz - 2.8 kHz' }
    },
    vibrato: {
        id: 'vibrato',
        name: 'Vibrato Ondulante',
        category: 'vintage',
        emoji: '〰️',
        filter: 'vibrato=f=7:d=0.5',
        description: 'Modulação de pitch periódica criando ondas e oscilações sonoras dramáticas.',
        specs: { rate: '7 Hz', depth: '0.5' }
    },
    tremolo: {
        id: 'tremolo',
        name: 'Trêmolo Pulsante',
        category: 'vintage',
        emoji: '⚡',
        filter: 'tremolo=f=8:d=0.7',
        description: 'Modulação cíclica de amplitude produzindo batimento rápido característico de amplificador valvulado.',
        specs: { rate: '8 Hz', depth: '0.7' }
    }
};

/**
 * Retorna os detalhes de um filtro pelo id
 */
function getFilter(filterId) {
    if (!filterId) return null;
    const key = String(filterId).toLowerCase().replace(/[^a-z0-9_]/g, '');
    return AUDIO_FILTERS[key] || null;
}

/**
 * Lista todos os filtros por categoria ou completo
 */
function listFilters(category = null) {
    const list = Object.values(AUDIO_FILTERS);
    if (!category) return list;
    return list.filter(f => f.category === category);
}

/**
 * Gera texto explicativo sobre o filtro
 */
function explainFilter(filterId) {
    const filter = getFilter(filterId);
    if (!filter) return null;

    const M = require('../utils/moldura');
    const specLines = Object.entries(filter.specs).map(([k, v]) => `• *${k}:* ${v}`);

    return [
        M.cabecalho(filter.emoji, `Filtro de Áudio: ${filter.name}`),
        `🎛️ *Categoria:* ${filter.category.toUpperCase()}`,
        `📝 *Efeito:* ${filter.description}`,
        M.secao('⚙️', 'Especificações Técnicas FFmpeg', [
            `• *Filtro AF:* \`${filter.filter}\``,
            ...specLines
        ]),
        `💡 *Como aplicar:*\nResponda a um áudio ou nota de voz com \`.${filter.id}\` para processar e receber o áudio transformado.`,
        M.assinatura('➳ᴹᴿ᭄𝕸𝖊𝖘𝖘𝖎✤ Audio Engine')
    ].join('\n\n');
}

/**
 * Processa um buffer de áudio usando FFmpeg
 * @param {Buffer} inputBuffer Buffer do áudio original
 * @param {string} filterId Nome do filtro
 * @returns {Promise<Buffer>}
 */
function processAudio(inputBuffer, filterId) {
    const filter = getFilter(filterId);
    if (!filter) {
        return Promise.reject(new Error(`Filtro "${filterId}" não encontrado.`));
    }

    return new Promise((resolve, reject) => {
        const ffmpegArgs = [
            '-i', 'pipe:0',
            '-af', filter.filter,
            '-f', 'mp3',
            '-c:a', 'libmp3lame',
            '-b:a', '192k',
            'pipe:1'
        ];

        const ff = spawn('ffmpeg', ffmpegArgs);
        const chunks = [];
        let stderr = '';

        ff.stdout.on('data', chunk => chunks.push(chunk));
        ff.stderr.on('data', data => { stderr += data.toString(); });

        ff.on('close', code => {
            if (code === 0 && chunks.length > 0) {
                resolve(Buffer.concat(chunks));
            } else {
                reject(new Error(`FFmpeg erro código ${code}: ${stderr.slice(-300)}`));
            }
        });

        ff.on('error', err => {
            reject(new Error(`Falha ao invocar FFmpeg: ${err.message}`));
        });

        ff.stdin.write(inputBuffer);
        ff.stdin.end();
    });
}

module.exports = {
    AUDIO_FILTERS,
    getFilter,
    listFilters,
    explainFilter,
    processAudio
};
