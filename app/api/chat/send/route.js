import { supabaseAdmin } from '@/lib/supabaseClient';
import { sendTelegramMessage, sendTelegramButtons, detectSensitiveIntent } from '@/lib/telegram';

export async function POST(req) {
  try {
    const body = await req.json();
    const { sessionId, productId, buyerName, message, imageUrl } = body;

    if (!message && !imageUrl && sessionId) {
      return Response.json({ error: 'Pesan kosong' }, { status: 400 });
    }

    const db = supabaseAdmin();
    let session;

    if (sessionId) {
      const { data, error } = await db.from('chat_sessions').select('*').eq('id', sessionId).single();
      if (error || !data) return Response.json({ error: 'Sesi tidak ditemukan' }, { status: 404 });
      session = data;
    } else {
      // Sesi baru: status 'pending' sampai admin Terima
      const { data: admins, error: adminErr } = await db
        .from('telegram_admins').select('*').eq('is_active', true).limit(1);

      if (adminErr || !admins || admins.length === 0) {
        return Response.json({ error: 'Belum ada admin aktif' }, { status: 503 });
      }

      let productName = '';
      if (productId) {
        const { data: product } = await db.from('products').select('name').eq('id', productId).single();
        productName = product?.name || '';
      }

      const { data: newSession, error: sessErr } = await db
        .from('chat_sessions')
        .insert({
          product_id: productId || null,
          buyer_name: buyerName || 'Pengunjung',
          assigned_admin_chat_id: admins[0].telegram_chat_id,
          status: 'pending',
        })
        .select()
        .single();

      if (sessErr) return Response.json({ error: sessErr.message }, { status: 500 });
      session = newSession;

      const shortId = session.id.slice(0, 8);
      await sendTelegramButtons(
        session.assigned_admin_chat_id,
        `💬 <b>Ada pelanggan baru mau ngobrol</b>\nDari: ${session.buyer_name}${productName ? `\nProduk: ${productName}` : ''}\nSesi: <code>${shortId}</code>`,
        [[
          { text: '✅ Terima', callback_data: `accept_chat:${shortId}` },
          { text: '❌ Tolak', callback_data: `reject_chat:${shortId}` },
        ]]
      );

      // Kalau belum ada pesan pertama, sesi selesai dibuat, tunggu admin terima dulu
      if (!message && !imageUrl) {
        return Response.json({ sessionId: session.id, status: 'pending' });
      }
    }

    // Simpan pesan buyer (selalu disimpan, tapi baru di-forward ke admin kalau sesi udah 'active')
    const { error: msgErr } = await db.from('chat_messages').insert({
      session_id: session.id,
      sender_type: 'buyer',
      message: message || null,
      image_url: imageUrl || null,
    });
    if (msgErr) return Response.json({ error: msgErr.message }, { status: 500 });

    if (session.status === 'active' && session.assigned_admin_chat_id) {
      const shortId = session.id.slice(0, 8);
      const forwardText = imageUrl
        ? `[Sesi ${shortId}] 📷 ${message || ''}`
        : `[Sesi ${shortId}] ${message}`;
      await sendTelegramMessage(session.assigned_admin_chat_id, forwardText);

      // Deteksi permintaan info sensitif (WA / alamat) dari pesan pembeli
      const intent = detectSensitiveIntent(message);
      if (intent) {
        const label = intent === 'wa' ? 'nomor WA' : 'alamat/lokasi';
        await sendTelegramButtons(
          session.assigned_admin_chat_id,
          `⚠️ Pelanggan sesi <code>${shortId}</code> sepertinya minta <b>${label}</b>. Kasih tau?`,
          [[
            { text: '✅ Kasih tau', callback_data: `accept_info:${shortId}:${intent}` },
            { text: '❌ Jangan', callback_data: `reject_info:${shortId}:${intent}` },
          ]]
        );
      }
    }

    return Response.json({ sessionId: session.id, status: session.status });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
