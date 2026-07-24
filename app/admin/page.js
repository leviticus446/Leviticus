'use client';
import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState('produk');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('lev11_admin_token');
    if (saved) {
      setToken(saved);
      setUnlocked(true);
    }
    setChecking(false);
  }, []);

  function handleLogin() {
    localStorage.setItem('lev11_admin_token', token);
    setUnlocked(true);
  }

  function handleLogout() {
    localStorage.removeItem('lev11_admin_token');
    setToken('');
    setUnlocked(false);
  }

  if (checking) {
    return <main className="min-h-screen bg-ivory pt-16" />; // hindari kedip form login sebelum cek localStorage
  }

  if (!unlocked) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-ivory pt-16">
        <div className="bg-white p-8 rounded-lg shadow max-w-sm w-full">
          <h1 className="font-display text-2xl text-forest mb-4">Admin Leviticus 11</h1>
          <input type="password" placeholder="Admin token" className="w-full border p-2 rounded mb-3"
            value={token} onChange={(e) => setToken(e.target.value)} />
          <button className="w-full bg-forest text-ivory py-2 rounded" onClick={handleLogin}>
            Masuk
          </button>
        </div>
      </main>
    );
  }

  const tabs = [
    { key: 'produk', label: 'Produk / Menu' },
    { key: 'galeri', label: 'Galeri & Video' },
    { key: 'cerita', label: 'Cerita Kita' },
    { key: 'pengaturan', label: 'Pengaturan' },
  ];

  return (
    <main className="min-h-screen bg-ivory p-6 md:p-10 pt-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl text-forest">Kelola Website</h1>
        <button onClick={handleLogout} className="text-sm text-forest/50 hover:text-forest underline">
          Logout
        </button>
      </div>

      <div className="flex gap-2 mb-8 border-b border-forest/10 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm whitespace-nowrap ${tab === t.key ? 'border-b-2 border-gold text-forest font-semibold' : 'text-forest/50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'produk' && <ProdukTab token={token} />}
      {tab === 'galeri' && <GaleriTab token={token} />}
      {tab === 'cerita' && <CeritaTab token={token} />}
      {tab === 'pengaturan' && <PengaturanTab token={token} />}
    </main>
  );
}

// ============ TAB: PRODUK ============
function ProdukTab({ token }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', slug: '', price: '', description: '', category: '' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data.products || []);
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', headers: { 'x-admin-token': token }, body: fd });
    const data = await res.json();
    setUploading(false);
    if (data.url) setImageUrls((prev) => [...prev, data.url]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ ...form, price: Number(form.price), imageUrls }),
    });
    setForm({ name: '', slug: '', price: '', description: '', category: '' });
    setImageUrls([]);
    load();
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow max-w-xl space-y-3 mb-10">
        <input placeholder="Nama produk" className="w-full border p-2 rounded" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Slug (contoh: nasi-goreng-spesial)" className="w-full border p-2 rounded" value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
        <input placeholder="Harga" type="number" className="w-full border p-2 rounded" value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <input placeholder="Kategori" className="w-full border p-2 rounded" value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <textarea placeholder="Deskripsi" className="w-full border p-2 rounded" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="flex items-center gap-3">
          <input type="file" accept="image/*,video/*" onChange={(e) => setFile(e.target.files[0])} />
          <button type="button" onClick={handleUpload} disabled={uploading}
            className="bg-gold text-white px-3 py-1 rounded text-sm">
            {uploading ? 'Mengunggah...' : 'Upload'}
          </button>
        </div>
        {imageUrls.length > 0 && <p className="text-xs text-forest/70">{imageUrls.length} file terunggah</p>}
        <button type="submit" className="bg-forest text-ivory px-4 py-2 rounded">Simpan Produk</button>
      </form>

      <h2 className="font-display text-xl text-forest mb-3">Daftar Produk ({products.length})</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p) => (
          <div key={p.id} className="bg-white rounded-lg p-3 shadow text-sm">
            {p.image_urls?.[0] && <img src={p.image_urls[0]} alt={p.name} className="rounded mb-2 aspect-square object-cover" />}
            <p className="font-semibold text-forest">{p.name}</p>
            <p className="text-gold">Rp {p.price?.toLocaleString('id-ID')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ TAB: GALERI & VIDEO ============
function GaleriTab({ token }) {
  const [gallery, setGallery] = useState([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [backdropUrl, setBackdropUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await fetch('/api/content');
    const data = await res.json();
    setGallery(data.content?.gallery_images || []);
    setVideoUrl(data.content?.showcase_video_url || '');
    setBackdropUrl(data.content?.showcase_backdrop_image || '');
  }

  async function uploadFile(file, onDone) {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', headers: { 'x-admin-token': token }, body: fd });
    const data = await res.json();
    setUploading(false);
    if (data.url) onDone(data.url);
  }

  async function saveAll() {
    await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({
        updates: {
          gallery_images: gallery,
          showcase_video_url: videoUrl || null,
          showcase_backdrop_image: backdropUrl || null,
        },
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-xl space-y-8">
      <div>
        <h3 className="font-semibold text-forest mb-2">Foto Galeri Suasana</h3>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {gallery.map((img, i) => (
            <div key={i} className="relative">
              <img src={img} className="aspect-square object-cover rounded" />
              <button onClick={() => setGallery(gallery.filter((_, idx) => idx !== i))}
                className="absolute top-1 right-1 bg-charcoal/70 text-white text-xs rounded-full w-5 h-5">×</button>
            </div>
          ))}
        </div>
        <input type="file" accept="image/*" onChange={(e) => e.target.files[0] &&
          uploadFile(e.target.files[0], (url) => setGallery((prev) => [...prev, url]))} />
      </div>

      <div>
        <h3 className="font-semibold text-forest mb-2">Video Showcase (di bawah 1 menit)</h3>
        {videoUrl && <video src={videoUrl} controls className="w-full rounded mb-2" />}
        <input type="file" accept="video/*" onChange={(e) => e.target.files[0] &&
          uploadFile(e.target.files[0], setVideoUrl)} />
        {uploading && <p className="text-xs text-forest/60 mt-1">Mengunggah, tunggu sebentar (video butuh waktu lebih lama)...</p>}
      </div>

      <div>
        <h3 className="font-semibold text-forest mb-2">Foto Backdrop Blur (di belakang video)</h3>
        {backdropUrl && <img src={backdropUrl} className="w-full aspect-video object-cover rounded mb-2" />}
        <input type="file" accept="image/*" onChange={(e) => e.target.files[0] &&
          uploadFile(e.target.files[0], setBackdropUrl)} />
      </div>

      <button onClick={saveAll} className="w-full bg-forest text-ivory py-2 rounded">
        {saved ? 'Tersimpan ✓' : 'Simpan Semua Perubahan'}
      </button>
    </div>
  );
}

// ============ TAB: CERITA KITA ============
function CeritaTab({ token }) {
  const [title, setTitle] = useState('');
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [image, setImage] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await fetch('/api/content');
    const data = await res.json();
    setTitle(data.content?.cerita_title || '');
    setText1(data.content?.cerita_text_1 || '');
    setText2(data.content?.cerita_text_2 || '');
    setImage(data.content?.cerita_image || '');
  }

  async function uploadImage(file) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', headers: { 'x-admin-token': token }, body: fd });
    const data = await res.json();
    if (data.url) setImage(data.url);
  }

  async function save() {
    await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({
        updates: { cerita_title: title, cerita_text_1: text1, cerita_text_2: text2, cerita_image: image },
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-xl space-y-4">
      <input placeholder="Judul" className="w-full border p-2 rounded" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea placeholder="Paragraf 1" rows={4} className="w-full border p-2 rounded" value={text1} onChange={(e) => setText1(e.target.value)} />
      <textarea placeholder="Paragraf 2" rows={4} className="w-full border p-2 rounded" value={text2} onChange={(e) => setText2(e.target.value)} />
      {image && <img src={image} className="w-full aspect-[4/5] object-cover rounded" />}
      <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && uploadImage(e.target.files[0])} />
      <button onClick={save} className="w-full bg-forest text-ivory py-2 rounded">
        {saved ? 'Tersimpan ✓' : 'Simpan Perubahan'}
      </button>
    </div>
  );
}

// ============ TAB: PENGATURAN ============
function PengaturanTab({ token }) {
  const [wa, setWa] = useState('');
  const [phone, setPhone] = useState('');
  const [saved, setSaved] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ telegram_chat_id: '', telegram_username: '', name: '' });

  useEffect(() => { load(); loadAdmins(); }, []);

  async function load() {
    const res = await fetch('/api/content');
    const data = await res.json();
    setWa(data.content?.contact_whatsapp || '');
    setPhone(data.content?.contact_phone || '');
  }

  async function loadAdmins() {
    const res = await fetch('/api/telegram-admins', { headers: { 'x-admin-token': token } });
    const data = await res.json();
    setAdmins(data.admins || []);
  }

  async function saveContact() {
    await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ updates: { contact_whatsapp: wa, contact_phone: phone } }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function addAdmin() {
    if (!newAdmin.telegram_chat_id) return;
    await fetch('/api/telegram-admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify(newAdmin),
    });
    setNewAdmin({ telegram_chat_id: '', telegram_username: '', name: '' });
    loadAdmins();
  }

  async function removeAdmin(id) {
    await fetch(`/api/telegram-admins?id=${id}`, { method: 'DELETE', headers: { 'x-admin-token': token } });
    loadAdmins();
  }

  return (
    <div className="space-y-8 max-w-xl">
      <div className="bg-white p-6 rounded-lg shadow space-y-3">
        <h3 className="font-semibold text-forest mb-2">Kontak (WA & Telepon)</h3>
        <input placeholder="Nomor WA (format: 62812xxxxxxx, tanpa +)" className="w-full border p-2 rounded"
          value={wa} onChange={(e) => setWa(e.target.value)} />
        <input placeholder="Nomor telepon tampilan (contoh: 0812-8123-2311)" className="w-full border p-2 rounded"
          value={phone} onChange={(e) => setPhone(e.target.value)} />
        <button onClick={saveContact} className="w-full bg-forest text-ivory py-2 rounded">
          {saved ? 'Tersimpan ✓' : 'Simpan Kontak'}
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow space-y-3">
        <h3 className="font-semibold text-forest mb-2">Admin Telegram (penerima chat pembeli)</h3>
        {admins.map((a) => (
          <div key={a.id} className="flex items-center justify-between border rounded p-2 text-sm">
            <div>
              <p className="font-medium">{a.name || '(tanpa nama)'} {a.telegram_username ? `· ${a.telegram_username}` : ''}</p>
              <p className="text-forest/50 text-xs">{a.telegram_chat_id}</p>
            </div>
            <button onClick={() => removeAdmin(a.id)} className="text-red-500 text-xs">Hapus</button>
          </div>
        ))}
        <div className="pt-2 border-t space-y-2">
          <input placeholder="Telegram Chat ID (dari /register di bot)" className="w-full border p-2 rounded text-sm"
            value={newAdmin.telegram_chat_id} onChange={(e) => setNewAdmin({ ...newAdmin, telegram_chat_id: e.target.value })} />
          <input placeholder="Username Telegram (contoh: @nama_admin)" className="w-full border p-2 rounded text-sm"
            value={newAdmin.telegram_username} onChange={(e) => setNewAdmin({ ...newAdmin, telegram_username: e.target.value })} />
          <input placeholder="Nama (buat tampilan doang)" className="w-full border p-2 rounded text-sm"
            value={newAdmin.name} onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })} />
          <button onClick={addAdmin} className="w-full bg-gold text-charcoal py-2 rounded text-sm">
            Tambah Admin
          </button>
        </div>
      </div>
    </div>
  );
}
