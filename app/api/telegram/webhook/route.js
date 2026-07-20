import { supabaseAdmin } from '@/lib/supabaseClient';
import { sendTelegramMessage } from '@/lib/telegram';

export async function POST(req) {
  const secret = req.headers.get('x-telegram-bot-api-secret-token');
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  const update = await req.json();
  const message = update.message;
  if (!message) return Response.json({ ok: true });

  const chatId = String(message.chat.id);
  const text = message.text || '';
  const db = supabaseAdmin();

  if (text.startsWith('/register')) {
    const parts = text.split(' ');
    const providedSecret = parts[1];
    if (providedSecret !== process.env.ADMIN_SECRET) {
      await sendTelegramMessage(chatId, '❌ Kode registrasi salah.');
      return Response.json({ ok: true });
    }
    await db
      .from('telegram_admins')
      .upsert({ telegram_chat_id: chatId, name: message.from?.first_name || 'Admin', is_active: true }, { onConflict: 'telegram_chat_id' });
    await sendTelegramMessage(chatId, `✅ Terdaftar sebagai admin Leviticus 11. Chat ID kamu: <code>${chatId}</code>`);
    return Response.json({ ok: true });
  }

  const repliedText = message.reply_to_message?.text || '';
  const sessionMatch = repliedText.match(/\[Sesi ([a-f0-9]{8})\]|Sesi: ([a-f0-9-]{36})/i);
  const shortId = sessionMatch ? (sessionMatch[1] || sessionMatch[2]) : null;

  if (shortId) {
    const { data: sessions } = await db
      .from('chat_sessions')
      .select('*')
      .ilike('id', `${shortId}%`)
      .limit(1);

    const session = sessions?.[0];
    if (session) {
      await db.from('chat_messages').insert({
        session_id: session.id,
        sender_type: 'admin',
        message: text || null,
      });
      return Response.json({ ok: true });
    }
  }

  await sendTelegramMessage(
    chatId,
    'Untuk membalas pembeli, REPLY langsung ke pesan forward yang ada tag [Sesi ...].'
  );
  return Response.json({ ok: true });
}
