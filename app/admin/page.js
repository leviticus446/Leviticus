'use client';
import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', slug: '', price: '', description: '', category: '' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);

  useEffect(() => {
    if (unlocked) loadProducts();
  }, [unlocked]);

  async function loadProducts() {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data.products || []);
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'x-admin-token': token },
      body: fd,
    });
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
    loadProducts();
  }

  if (!unlocked) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-ivory">
        <div className="bg-white p-8 rounded-lg shadow max-w-sm w-full">
          <h1 className="font-display text-2xl text-forest mb-4">Admin Leviticus 11</h1>
          <input
            type="password"
            placeholder="Admin token"
            className="w-full border p-2 rounded mb-3"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <button
            className="w-full bg-forest text-ivory py-2 rounded"
            onClick={() => setUnlocked(true)}
          >
            Masuk
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ivory p-8">
      <h1 className="font-display text-3xl text-forest mb-6">Kelola Produk</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow max-w-xl space-y-3 mb-10">
        <input placeholder="Nama produk" className="w-full border p-2 rounded"
          value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Slug (contoh: nasi-goreng-spesial)" className="w-full border p-2 rounded"
          value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
        <input placeholder="Harga" type="number" className="w-full border p-2 rounded"
          value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <input placeholder="Kategori" className="w-full border p-2 rounded"
          value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <textarea placeholder="Deskripsi" className="w-full border p-2 rounded"
          value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

        <div className="flex items-center gap-3">
          <input type="file" accept="image/*,video/*" onChange={(e) => setFile(e.target.files[0])} />
          <button type="button" onClick={handleUpload} disabled={uploading}
            className="bg-gold text-white px-3 py-1 rounded text-sm">
            {uploading ? 'Mengunggah...' : 'Upload'}
          </button>
        </div>
        {imageUrls.length > 0 && (
          <p className="text-xs text-forest/70">{imageUrls.length} file terunggah</p>
        )}

        <button type="submit" className="bg-forest text-ivory px-4 py-2 rounded">
          Simpan Produk
        </button>
      </form>

      <h2 className="font-display text-xl text-forest mb-3">Daftar Produk</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p) => (
          <div key={p.id} className="bg-white rounded-lg p-3 shadow text-sm">
            {p.image_urls?.[0] && (
              <img src={p.image_urls[0]} alt={p.name} className="rounded mb-2 aspect-square object-cover" />
            )}
            <p className="font-semibold text-forest">{p.name}</p>
            <p className="text-gold">Rp {p.price?.toLocaleString('id-ID')}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
