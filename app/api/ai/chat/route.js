import { groq, SITE_CONTEXT } from '@/lib/groq';

export async function POST(req) {
  try {
    const { message, history = [] } = await req.json();
    if (!message) return Response.json({ error: 'Pesan kosong' }, { status: 400 });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SITE_CONTEXT },
        ...history.map((h) => ({ role: h.role, content: h.content })),
        { role: 'user', content: message },
      ],
      temperature: 0.4,
      max_tokens: 500,
    });

    const reply = completion.choices[0]?.message?.content || 'Maaf, ada kendala. Coba lagi ya.';
    return Response.json({ reply });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
