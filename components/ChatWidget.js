'use client';
import { useState, useEffect, useRef } from 'react';

export default function ChatWidget({ productId }) {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [status, setStatus] = useState(null); // pending | active | rejected | closed
  const [messages, setMessages] = useState([]);
  const [buyerName, setBuyerName] = useState('');
  const [input, setInput] = useState('');
  const pollRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('lev11_chat_session');
    if (saved) setSessionId(saved);
  }, []);

  useEffect(() => {
    if (!sessionId || !open) return;
    async function poll() {
      const res = await fetch(`/api/chat/messages?sessionId=${sessionId}`);
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
      if (data.status) setStatus(data.status);
    }
    poll();
    pollRef.current = setInterval(poll, 3000);
    return () => clearInterval(pollRef.current);
  }, [sessionId, open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function startChat() {
    const res = await fetch('/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, buyerName: buyerName || 'Pengunjung' }),
    });
    const data = await res.json();
    if (data.sessionId) {
      setSessionId(data.sessionId);
      setStatus(data.status);
      localStorage.setItem('lev11_chat_session', data.sessionId);
    }
  }

  async function sendMessage() {
    if (!input.trim()) return;
    const text = input;
    setInput('');
    await fetch('/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, message: text }),
    });
  }

  async function endChat() {
    await fetch('/api/chat/stop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    localStorage.removeItem('lev11_chat_session');
    setSessionId(null);
    setStatus(null);
    setMessages([]);
  }

  return (
    <>
      {/* Tombol mengambang */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-40 bg-gold text-charcoal px-5 py-3 rounded-full shadow-lg text-sm font-semibold tracking-wide"
      >
        {open ? 'Tutup' : '💬 Chat Penjual'}
      </button>

      {open && (
        <div className="fixed bottom-20 right-5 z-40 w-[88vw] max-w-sm bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden" style={{ height: '60vh' }}>
          <div className="bg-charcoal text-ivory px-4 py-3 flex items-center justify-between">
            <span className="font-display text-lg text-gold">Chat Penjual</span>
            {sessionId && status === 'active' && (
              <button onClick={endChat} className="text-xs text-ivory/60 underline">Akhiri Obrolan</button>
            )}
          </div>

          {!sessionId && (
            <div className="p-4 flex-1 flex flex-col justify-center gap-3">
              <p className="text-sm text-forest/70">Kenalan dulu yuk, siapa nama kamu?</p>
              <input
                placeholder="Nama kamu"
                className="border p-2 rounded text-sm"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
              />
              <button onClick={startChat} className="bg-forest text-ivory py-2 rounded text-sm">
                Mulai Chat
              </button>
            </div>
          )}

          {sessionId && status === 'pending' && (
            <div className="p-4 flex-1 flex items-center justify-center text-center text-sm text-forest/60">
              Menunggu penjual menerima chat kamu...
            </div>
          )}

          {sessionId && status === 'rejected' && (
            <div className="p-4 flex-1 flex items-center justify-center text-center text-sm text-forest/60">
              Penjual belum bisa merespon sekarang. Coba lagi nanti ya.
            </div>
          )}

          {sessionId && status === 'closed' && (
            <div className="p-4 flex-1 flex flex-col items-center justify-center text-center gap-3">
              <p className="text-sm text-forest/60">Percakapan sudah diakhiri.</p>
              <button
                onClick={() => { localStorage.removeItem('lev11_chat_session'); setSessionId(null); setStatus(null); setMessages([]); }}
                className="text-xs text-gold underline"
              >
                Mulai obrolan baru
              </button>
            </div>
          )}

          {sessionId && status === 'active' && (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-ivory">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[80%] text-sm px-3 py-2 rounded-lg ${
                      m.sender_type === 'buyer'
                        ? 'bg-forest text-ivory ml-auto'
                        : m.sender_type === 'system'
                        ? 'bg-gold/20 text-forest mx-auto text-center text-xs'
                        : 'bg-white text-forest'
                    }`}
                  >
                    {m.message}
                    {m.image_url && <img src={m.image_url} className="mt-1 rounded max-w-full" />}
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="p-2 border-t flex gap-2">
                <input
                  placeholder="Ketik pesan..."
                  className="flex-1 border rounded px-3 py-2 text-sm"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button onClick={sendMessage} className="bg-gold text-charcoal px-4 rounded text-sm">Kirim</button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
