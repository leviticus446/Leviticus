import GoldRule from '@/components/GoldRule';
import { supabasePublic } from '@/lib/supabaseClient';

export const metadata = {
  title: 'Reservasi | Leviticus 11',
};

export const revalidate = 0;

async function getContent() {
  const { data } = await supabasePublic.from('site_content').select('key, value');
  const content = {};
  (data || []).forEach((row) => (content[row.key] = row.value));
  return content;
}

export default async function ReservasiPage() {
  const content = await getContent();
  const phone = content.contact_phone || '0812-8123-2311';
  const wa = content.contact_whatsapp || '6281281232311';

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 bg-ivory">
      <div className="max-w-lg mx-auto text-center">
        <p className="text-gold text-xs tracking-widest2 uppercase mb-3">Reservasi</p>
        <h1 className="font-display text-4xl text-forest mb-6">Pesan Meja Lebih Dulu</h1>
        <GoldRule className="mb-8" />

        <p className="text-forest/70 leading-relaxed mb-8">
          Tempat kami sering ramai, jadi kami sarankan reservasi dulu sebelum datang —
          terutama untuk makan siang, makan malam, atau rombongan.
        </p>

        <div className="bg-white rounded-lg shadow p-6 space-y-4 text-left">
          <div>
            <p className="text-gold text-xs tracking-widest2 uppercase mb-1">Telepon / WhatsApp</p>
            <a href={`tel:${phone.replace(/[^0-9]/g, '')}`} className="text-forest text-lg font-semibold">{phone}</a>
          </div>
          <div>
            <p className="text-gold text-xs tracking-widest2 uppercase mb-1">Jam Buka</p>
            <ul className="text-forest/70 text-sm space-y-1">
              <li>Minggu–Kamis: 08.00–21.00</li>
              <li>Jumat: 08.00–17.00</li>
              <li>Sabtu: 18.00–22.00</li>
            </ul>
          </div>
          <a
            href={`https://wa.me/${wa}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center bg-forest text-ivory py-3 rounded uppercase text-sm tracking-wide"
          >
            Chat via WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}
