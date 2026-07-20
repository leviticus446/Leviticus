import GoldRule from '@/components/GoldRule';
import CornerFrame from '@/components/CornerFrame';
import ProductCard from '@/components/ProductCard';

const featuredMenu = [
  { name: 'Nasi Goreng Leviticus', price: 65000, image: '/images/dish-1.jpg', description: 'Telur mata sapi, kerupuk, sambal khas' },
  { name: 'Sup Iga Rempah', price: 85000, image: '/images/dish-2.jpg', description: 'Kaldu rempah, iga empuk, sambal terasi' },
  { name: 'Aneka Gorengan Leviticus', price: 55000, image: '/images/dish-3.jpg', description: 'Cocok untuk berbagi bersama' },
];

export default function HomePage() {
  return (
    <main>
      <section className="relative h-[100svh] min-h-[560px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/60 via-charcoal/30 to-charcoal/70" />

        <div className="relative z-10 text-center px-6">
          <GoldRule className="mb-6" />
          <h1 className="font-display text-6xl md:text-7xl text-ivory tracking-wide">
            LEVITICUS 11
          </h1>
          <p className="mt-4 text-xs md:text-sm tracking-widest2 uppercase text-gold">
            We Serve You Clean Food
          </p>
          <GoldRule className="mt-6" />

          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <a
              href="/menu"
              className="border border-gold text-gold px-7 py-3 text-sm tracking-wide uppercase hover:bg-gold hover:text-charcoal transition-colors"
            >
              Lihat Menu
            </a>
            <a
              href="/reservasi"
              className="bg-gold text-charcoal px-7 py-3 text-sm tracking-wide uppercase hover:bg-ivory transition-colors"
            >
              Reservasi
            </a>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 md:px-16 bg-ivory">
        <div className="text-center mb-14">
          <p className="text-gold text-xs tracking-widest2 uppercase mb-3">Signature</p>
          <h2 className="font-display text-4xl md:text-5xl text-forest">Menu Unggulan</h2>
          <GoldRule className="mt-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
          {featuredMenu.map((item) => (
            <ProductCard key={item.name} {...item} />
          ))}
        </div>
      </section>

      <section className="py-24 px-6 md:px-16 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <CornerFrame className="overflow-hidden rounded-sm">
            <div
              className="aspect-[4/5] bg-cover bg-center"
              style={{ backgroundImage: "url('/images/story.jpg')" }}
            />
          </CornerFrame>

          <div>
            <p className="text-gold text-xs tracking-widest2 uppercase mb-3">Cerita Kita</p>
            <h2 className="font-display text-4xl text-forest mb-6">
              We Serve You Clean Food
            </h2>
            <p className="text-forest/70 leading-relaxed mb-4">
              Nama Leviticus 11 diambil dari pasal Alkitab tentang makanan yang bersih —
              filosofi itu yang kami bawa ke setiap piring: bahan segar, proses yang jujur,
              dan rasa Indonesia-Asia yang otentik.
            </p>
            <p className="text-forest/70 leading-relaxed">
              Di ruang hijau yang teduh, dikelilingi tanaman rambat dan cahaya alami,
              kami ingin setiap tamu merasa seperti makan di rumah kaca milik keluarga sendiri —
              nyaman, tenang, dan penuh perhatian pada detail.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 md:px-16 bg-ivory">
        <div className="text-center mb-14">
          <p className="text-gold text-xs tracking-widest2 uppercase mb-3">Ambiance</p>
          <h2 className="font-display text-4xl md:text-5xl text-forest">Galeri Suasana</h2>
          <GoldRule className="mt-6" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {['gallery-1.jpg', 'gallery-2.jpg', 'gallery-3.jpg', 'gallery-4.jpg', 'gallery-5.jpg', 'gallery-6.jpg'].map((img, i) => (
            <div
              key={img}
              className={`bg-cover bg-center rounded-sm ${i === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'}`}
              style={{ backgroundImage: `url(/images/${img})` }}
            />
          ))}
        </div>
      </section>

      <footer className="bg-charcoal text-ivory py-16 px-6 md:px-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10">
          <div>
            <h3 className="font-display text-2xl text-gold mb-3">LEVITICUS 11</h3>
            <p className="text-ivory/60 text-sm leading-relaxed">
              Jl. Penyelesaian Tomang II No.1, RT.9/RW.10,
              Meruya Utara, Kembangan, Jakarta Barat 11620
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
