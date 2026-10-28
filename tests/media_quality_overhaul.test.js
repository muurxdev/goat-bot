const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { resolveDownloadFormat } = require('../src/services/media/formatResolver');

console.log('🧪 Iniciando testes de overhaul na qualidade de áudio e vídeo...');

// 1. Teste de formato de download de áudio MP3 no formatResolver
const mp3Cfg = resolveDownloadFormat({ format: 'mp3' });
console.log('Argumentos de download MP3:', mp3Cfg.args);

assert(mp3Cfg.args.includes('320K'), 'Deve solicitar qualidade 320K de áudio');
assert(mp3Cfg.args.includes('FFmpegExtractAudio:-c:a libmp3lame -b:a 320k -q:a 0'), 'Deve conter postprocessor de alta fidelidade -q:a 0');

// 2. Teste estático do código de conversão de vídeo em mediaProcessor.js
const processorCode = fs.readFileSync(path.join(__dirname, '../src/services/media/mediaProcessor.js'), 'utf8');

assert(!processorCode.includes("teto < 2500"), 'Não deve conter o teto asfixiante de 2500k');
assert(!processorCode.includes("'-maxrate'"), 'Não deve aplicar maxrate limitador em conversões gerais');
assert(processorCode.includes("'-crf', '18'"), 'Deve utilizar CRF 18 para qualidade cristalina sem quadriculados');
assert(processorCode.includes("'-profile:v', 'high'"), 'Deve utilizar High Profile do H.264');
assert(processorCode.includes("'-b:a', '320k'"), 'Deve utilizar áudio AAC 320k');

// 3. Teste estático de compressão em videoSender.js
const videoSenderCode = fs.readFileSync(path.join(__dirname, '../src/services/media/videoSender.js'), 'utf8');
assert(videoSenderCode.includes("'-crf', '18'"), 'videoSender deve utilizar CRF 18');
assert(videoSenderCode.includes("'-b:a', '320k'"), 'videoSender deve utilizar áudio AAC 320k');

// 4. Teste estático de áudio em audioStreamService.js
const audioStreamCode = fs.readFileSync(path.join(__dirname, '../src/services/audioStreamService.js'), 'utf8');
assert(audioStreamCode.includes('"-q:a", "0"') || audioStreamCode.includes("'-q:a', '0'"), 'streamToMp3 deve habilitar -q:a 0');
assert(audioStreamCode.includes("FFmpegExtractAudio:-c:a libmp3lame -b:a 320k -q:a 0"), 'downloadDirectYtDlpAudio deve habilitar -q:a 0');

console.log('✅ Todos os testes de qualidade de áudio e vídeo passaram com sucesso!');
