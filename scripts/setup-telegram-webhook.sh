#!/bin/bash
set -e
source .env.local 2>/dev/null || export $(grep -v '^#' .env.local | xargs)

if [ -z "$1" ]; then
  echo "Pakai: ./scripts/setup-telegram-webhook.sh https://domain-vercel-kamu.vercel.app"
  exit 1
fi

DOMAIN=$1

curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"${DOMAIN}/api/telegram/webhook\", \"secret_token\": \"${TELEGRAM_WEBHOOK_SECRET}\"}"

echo ""
echo "Webhook di-set ke: ${DOMAIN}/api/telegram/webhook"
echo "Buka chat @leviticus11bot di Telegram, kirim:"
echo "  /register ${ADMIN_SECRET}"
