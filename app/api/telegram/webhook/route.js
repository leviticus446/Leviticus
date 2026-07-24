import { supabaseAdmin } from '@/lib/supabaseClient';
import { sendTelegramMessage, answerCallbackQuery } from '@/lib/telegram';

async function findSessionByShortId(db, shortId) {
  const { data } = await db.from('chat_sessions').select('*').ilike('id', `${shortId}%`).limit(1);
  return data?.[0] || null;
}

export async function POST(req) {
  const secret = req.headers.get('x-telegram-bot-api-secret-token');
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  const update = await req.json();
  const db = supabaseAdmin();

  // ============ Tombol Terima/Tolak dipencet ============
  if (update.callback_query) {
    const cq = update.callback_query;
    const adminChatId = String(cq.message.chat.id);
    const [action, shortId, extra] = cq.data.split(':');

    const session = await findSessionByShortId(db, shortId);
    if (!session) {
      await answerCallbackQuery(cq.id, 'Sesi tidak ditemukan');
      return Response.json({ ok: true });
    }

    if (action === 'accept_chat') {
      await db.from('chat_sessions').update({ status: 'active' }).eq('id', session.id);
      await db.from('chat_messages').insert({
        session_id: session.id,
        sender_type: 'system',
        message: 'Penjual sudah siap, silakan kirim pesan Anda 😊',
      });
      await answerCallbackQuery(cq.id, 'Diterima');
      await sendTelegramMessage(adminChatId, `✅ Kamu terima chat sesi <code>${shortId}</code>. Balas dengan REPLY ke pesan forward dari pembeli.`);
    }

    if (action === 'reject_chat') {
      await db.from('chat_sessions').update({ status: 'rejected' }).eq('id', session.id);
      await db.from('chat_messages').insert({
        session_id: session.id,
        sender_type: 'system',
        message: 'Mohon maaf, penjual belum bisa merespon sekarang. Silakan coba lagi nanti.',
      });
      await answerCallbackQuery(cq.id, 'Ditolak');
    }

    if (action === 'accept_info' || action === 'reject_info') {
      const infoType = extra; // 'wa' | 'alamat'
      const { data: contentRows } = await db
        .from('site_content')
        .select('key, value')
        .in('key', ['contact_whatsapp', 'contact_phone']);
      const content = {};
      (contentRows || []).forEach((r) => (content[r.key] = r.value));

      if (action === 'accept_info') {
        const info =
          infoType === 'wa'
            ? `Nomor WhatsApp kami: ${content.contact_phone || content.contact_whatsapp || '-'}`
            : `Alamat kami: Jl. Penyelesaian Tomang II No.1, RT.9/RW.10, Meruya Utara, Kembangan, Jakarta Barat 11620`;
        await db.from('chat_messages').insert({ session_id: session.id, sender_type: 'system', message: info });
        await answerCallbackQuery(cq.id, 'Info dikirim ke pembeli');
      } else {
        const { data: adminRow } = await db
          .from('telegram_admins')
          .select('telegram_username')
          .eq('telegram_chat_id', session.assigned_admin_chat_id)
          .single();
        const username = adminRow?.telegram_username;
        const declineMsg =
          `Mohon maaf kami tidak bisa memberikan informasi tersebut. ` +
          `Silakan kunjungi https://leviticus11.vercel.app untuk melihat lokasi lengkapnya atau mulai memesan.` +
          (username ? ` Untuk info lebih lengkap, silakan hubungi ${username} di Telegram.` : '');
        await db.from('chat_messages').insert({ session_id: session.id, sender_type: 'system', message: declineMsg });
        await answerCallbackQuery(cq.id, 'Ditolak, pembeli diarahkan ke website');
      }
    }

    return Response.json({ ok: true });
  }

  // ============ Pesan biasa (register admin, atau balasan reply) ============
  const message = update.message;
  if (!message) return Response.json({ ok: true });

  const chatId = String(message.chat.id);
  const text = message.text || '';

  if (text.trim() === '/start' || text.trim().startsWith('/start ')) {
    await sendTelegramMessage(
      chatId,
      `👋 Halo! Ini bot admin toko <b>Leviticus 11</b>.\n\n` +
      `Bot ini menghubungkan kamu (penjual) dengan pembeli yang chat lewat website.\n\n` +
      `Kalau kamu penjual/admin toko, daftar dulu dengan kirim:\n` +
      `<code>/register KODE_RAHASIA</code>\n\n` +
      `(kode rahasianya minta ke yang pegang admin panel website)`
    );
    return Response.json({ ok: true });
  }

  if (text.startsWith('/register')) {
    const parts = text.split(' ');
    const providedSecret = parts[1];
    if (providedSecret !== process.env.ADMIN_SECRET) {
      await sendTelegramMessage(chatId, '❌ Kode registrasi salah.');
      return Response.json({ ok: true });
    }
    const username = message.from?.username ? `@${message.from.username}` : null;
    await db.from('telegram_admins').upsert(
      { telegram_chat_id: chatId, name: message.from?.first_name || 'Admin', telegram_username: username, is_active: true },
      { onConflict: 'telegram_chat_id' }
    );
    await sendTelegramMessage(chatId, `✅ Terdaftar sebagai admin Leviticus 11. Chat ID: <code>${chatId}</code>`);
    return Response.json({ ok: true });
  }

  const repliedText = message.reply_to_message?.text || '';
  const sessionMatch = repliedText.match(/\[Sesi ([a-f0-9]{8})\]|Sesi: ([a-f0-9-]{36})|Sesi <code>([a-f0-9]{8})/i);
  const shortId = sessionMatch ? (sessionMatch[1] || sessionMatch[2] || sessionMatch[3]) : null;

  // Admin akhiri percakapan: reply ke pesan sesi itu dengan teks /stop
  if (text.trim() === '/stop') {
    if (!shortId) {
      await sendTelegramMessage(chatId, 'Reply ke salah satu pesan sesi yang mau kamu akhiri, baru kirim /stop.');
      return Response.json({ ok: true });
    }
    const session = await findSessionByShortId(db, shortId);
    if (!session) {
      await sendTelegramMessage(chatId, 'Sesi tidak ditemukan.');
      return Response.json({ ok: true });
    }
    await db.from('chat_sessions').update({ status: 'closed' }).eq('id', session.id);
    await db.from('chat_messages').insert({
      session_id: session.id,
      sender_type: 'system',
      message: 'Percakapan diakhiri oleh penjual. Terima kasih sudah menghubungi kami 🙏',
    });
    await sendTelegramMessage(chatId, `✅ Sesi <code>${shortId}</code> ditutup.`);
    return Response.json({ ok: true });
  }

  if (shortId) {
    const session = await findSessionByShortId(db, shortId);
    if (session) {
      if (session.status !== 'active') {
        await sendTelegramMessage(chatId, `Sesi <code>${shortId}</code> sudah ${session.status === 'closed' ? 'ditutup' : session.status}, pesan ini gak diteruskan ke pembeli.`);
        return Response.json({ ok: true });
      }
      await db.from('chat_messages').insert({ session_id: session.id, sender_type: 'admin', message: text || null });
      return Response.json({ ok: true });
    }
  }

  await sendTelegramMessage(chatId, 'Untuk membalas pembeli, REPLY langsung ke pesan forward yang ada tag [Sesi ...].');
  return Response.json({ ok: true });
}
