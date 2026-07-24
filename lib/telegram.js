const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

export async function sendTelegramMessage(chatId, text, options = {}) {
  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', ...options }),
  });
  return res.json();
}

// Kirim pesan + tombol inline (Terima/Tolak dll)
export async function sendTelegramButtons(chatId, text, buttons) {
  // buttons: [[{ text: 'Terima', callback_data: 'x' }, { text: 'Tolak', callback_data: 'y' }]]
  return sendTelegramMessage(chatId, text, { reply_markup: { inline_keyboard: buttons } });
}

// Wajib dipanggil tiap terima callback_query, biar spinner tombol di Telegram hilang
export async function answerCallbackQuery(callbackQueryId, text = '') {
  const res = await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
  });
  return res.json();
}

// Kata kunci sederhana buat deteksi permintaan info sensitif (bukan AI, cuma keyword match)
export function detectSensitiveIntent(text) {
  const lower = (text || '').toLowerCase();
  const waKeywords = ['wa ', 'whatsapp', 'nomor', 'no hp', 'no wa', 'kontak'];
  const alamatKeywords = ['alamat', 'lokasi', 'dimana', 'di mana', 'maps'];
  if (waKeywords.some((k) => lower.includes(k))) return 'wa';
  if (alamatKeywords.some((k) => lower.includes(k))) return 'alamat';
  return null;
}
