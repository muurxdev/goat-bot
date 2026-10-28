#!/usr/bin/env bash
# ==========================================
# 📲 SCANNER DE QR CODE REMOTO DA VPS NO SEU TERMINAL LOCAL
# ==========================================

set -e

if [ -z "$1" ]; then
    echo "=================================================="
    echo "📲 SCANNER DE QR CODE REMOTO"
    echo "=================================================="
    echo "Informe o IP ou host SSH da sua VPS Hostinger."
    echo ""
    echo "📌 Exemplos de uso:"
    echo "   ./scripts/vps-qr.sh 185.xxx.xxx.xxx"
    echo "   ./scripts/vps-qr.sh root@185.xxx.xxx.xxx"
    echo "=================================================="
    exit 1
fi

TARGET="$1"
CLEAN_IP=$(echo "$TARGET" | sed 's/.*@//')

echo "=================================================="
echo "🌐 Conectando à VPS: $CLEAN_IP (Porta 3000)"
echo "📲 Buscando QR Code em tempo real..."
echo "=================================================="

# Loop de polling do QR code até conectar
LAST_QR=""

while true; do
    # Tenta obter status da VPS
    STATUS_JSON=$(curl -s --connect-timeout 4 "http://$CLEAN_IP:3000/status" 2>/dev/null || echo "")

    if [[ "$STATUS_JSON" == *"\"connected\":true"* ]]; then
        echo ""
        echo "=================================================="
        echo "🎉 [SUCESSO] BOT CONECTADO COM SUCESSO NO WHATSAPP!"
        echo "🚀 O GOATBot já está ativo e operando na sua VPS."
        echo "=================================================="
        exit 0
    fi

    # Tenta obter o QR code em formato texto puro
    QR_RAW=$(curl -s --connect-timeout 4 "http://$CLEAN_IP:3000/qr.raw" 2>/dev/null || echo "")

    if [ -n "$QR_RAW" ] && [ "$QR_RAW" != "$LAST_QR" ]; then
        LAST_QR="$QR_RAW"
        clear || true
        echo "=================================================="
        echo "📲 ESCANEIE O QR CODE ABAIXO NO SEU WHATSAPP:"
        echo "🌐 Ou abra no seu navegador: http://$CLEAN_IP:3000"
        echo "=================================================="
        echo ""
        
        # Renderiza no terminal usando node qrcode-terminal
        node -e "try { const q = require('qrcode-terminal'); q.generate('$QR_RAW', { small: true }); } catch(e) { console.log('$QR_RAW'); }"
        
        echo ""
        echo "⏳ Aguardando leitura do QR Code pelo seu celular..."
    fi

    sleep 2
done

