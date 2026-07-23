import GoldRule from '@/components/GoldRule';
import CornerFrame from '@/components/CornerFrame';
import ProductCard from '@/components/ProductCard';
import Carousel3D from '@/components/Carousel3D';
import AmbientBackdrop from '@/components/AmbientBackdrop';
import { supabasePublic } from '@/lib/supabaseClient';

async function getContent() {
  const { data } = await supabasePublic.from('site_content').select('key, value');
  const content = {};
  (data || []).forEach((row) => (content[row.key] = row.value));
  return content;
}

async function getProducts() {
  const { data } = await supabasePublic
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  return data || [];
}

export const revalidate = 0; // selalu ambil data terbaru dari admin panel

export default async function HomePage() {
  const content = await getContent();
  const products = await getProducts();

  const fallbackMenu = [
    { id: 'f1', name: 'Nasi Goreng Leviticus', price: 65000, image_urls: ['/images/dish-1.jpg'], description: 'Telur mata sapi, kerupuk, sambal khas' },
    { id: 'f2', name: 'Sup Iga Rempah', price: 85000, image_urls: ['/images/dish-2.jpg'], description: 'Kaldu rempah, iga empuk, sambal terasi' },
    { id: 'f3', name: 'Aneka Gorengan Leviticus', price: 55000, image_urls: ['/images/dish-3.jpg'], description: 'Cocok untuk berbagi bersama' },
  ];
  const menuItems = products.length > 0 ? products : fallbackMenu;

  const galleryImages = content.gallery_images || [
    '/images/gallery-1.jpg', '/images/gallery-2.jpg', '/images/gallery-3.jpg',
    '/images/gallery-4.jpg', '/images/gallery-5.jpg', '/images/gallery-6.jpg',
  ];
  const showcaseVideo = content.showcase_video_url || null;
  const showcaseBackdrop = content.showcase_backdrop_image || '/images/hero.jpg';

  return (
    <main>
      {/* ================= HERO ================= */}
      <section className="relative h-[100svh] min-h-[560px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/hero.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/60 via-charcoal/30 to-charcoal/70" />

        <div className="relative z-10 text-center px-6">
          <GoldRule className="mb-6" />
          <h1 className="font-display text-6xl md:text-7xl text-ivory tracking-wide">LEVITICUS 11</h1>
          <p className="mt-4 text-xs md:text-sm tracking-widest2 uppercase text-gold">We Serve You Clean Food</p>
          <GoldRule className="mt-6" />

          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <a href="#menu" className="bg-ivory text-charcoal px-7 py-3 text-sm tracking-wide uppercase hover:bg-gold transition-colors">
              Lihat Menu
            </a>
            <a href="/reservasi" className="border border-gold text-gold px-7 py-3 text-sm tracking-wide uppercase hover:bg-gold hover:text-charcoal transition-colors">
              Reservasi
            </a>
          </div>
        </div>
      </section>

      {/* ================= VIDEO SHOWCASE ================= */}
      {showcaseVideo && (
        <section className="relative py-24 px-6 md:px-16 overflow-hidden">
          <AmbientBackdrop image={showcaseBackdrop} />
          <div className="max-w-3xl mx-auto">
            <CornerFrame className="overflow-hidden rounded-sm">
              <video
                src={showcaseVideo}
                autoPlay
                muted
                loop
                playsInline
                className="w-full aspect-video object-cover"
              />
            </CornerFrame>
          </div>
        </section>
      )}

      {/* ================= MENU UNGGULAN (Carousel 3D) ================= */}
      <section id="menu" className="py-24 bg-ivory scroll-mt-16">
        <div className="text-center mb-14 px-6">
          <p className="text-gold text-xs tracking-widest2 uppercase mb-3">Signature</p>
          <h2 className="font-display text-4xl md:text-5xl text-forest">Menu Unggulan</h2>
          <GoldRule className="mt-6" />
        </div>

        <Carousel3D>
          {menuItems.map((item) => (
            <ProductCard
              key={item.id}
              name={item.name}
              price={item.price}
              image={item.image_urls?.[0] || '/images/dish-1.jpg'}
              description={item.description}
            />
          ))}
        </Carousel3D>
      </section>

      {/* ================= CERITA KITA ================= */}
      <section id="cerita" className="py-24 px-6 md:px-16 bg-white scroll-mt-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <CornerFrame className="overflow-hidden rounded-sm">
            <div className="aspect-[4/5] bg-cover bg-center" style={{ backgroundImage: `url('${content.cerita_image || '/images/story.jpg'}')` }} />
          </CornerFrame>

          <div>
            <p className="text-gold text-xs tracking-widest2 uppercase mb-3">Cerita Kita</p>
            <h2 className="font-display text-4xl text-forest mb-6">
              {content.cerita_title || 'We Serve You Clean Food'}
            </h2>
            <p className="text-forest/70 leading-relaxed mb-4">
              {content.cerita_text_1 || ''}
            </p>
            <p className="text-forest/70 leading-relaxed">
              {content.cerita_text_2 || ''}
            </p>
          </div>
        </div>
      </section>

      {/* ================= GALERI SUASANA (Carousel 3D) ================= */}
      <section id="galeri" className="py-24 bg-ivory scroll-mt-16">
        <div className="text-center mb-14 px-6">
          <p className="text-gold text-xs tracking-widest2 uppercase mb-3">Ambiance</p>
          <h2 className="font-display text-4xl md:text-5xl text-forest">Galeri Suasana</h2>
          <GoldRule className="mt-6" />
        </div>

        <Carousel3D>
          {galleryImages.map((img, i) => (
            <div
              key={i}
              className="aspect-[4/5] bg-cover bg-center rounded-sm"
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
        </Carousel3D>
      </section>

      {/* ================= FOOTER ================= */}
      <footer id="kontak" className="bg-charcoal text-ivory py-16 px-6 md:px-16 scroll-mt-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10">
          <div>
            <h3 className="font-display text-2xl text-gold mb-3">LEVITICUS 11</h3>
            <p className="text-ivory/60 text-sm leading-relaxed">
              Jl. Penyelesaian Tomang II No.1, RT.9/RW.10, Meruya Utara, Kembangan, Jakarta Barat 11620
            </p>
          </div>
          <div>
            <p className="text-gold text-xs tracking-widest2 uppercase mb-3">Jam Buka</p>
            <ul className="text-ivory/60 text-sm space-y-1">
              <li>Minggu–Kamis: 08.00–21.00</li>
              <li>Jumat: 08.00–17.00</li>
              <li>Sabtu: 18.00–22.00</li>
            </ul>
          </div>
          <div>
            <p className="text-gold text-xs tracking-widest2 uppercase mb-3">Kontak</p>
            <ul className="text-ivory/60 text-sm space-y-1">
              <li>0812-8123-2311</li>
              <li>WhatsApp / Telegram</li>
            </ul>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-12 pt-6 border-t border-ivory/10 text-center text-ivory/40 text-xs">
          © {new Date().getFullYear()} Leviticus 11 — We Serve You Clean Food
        </div>
      </footer>
    </main>
  );
}
