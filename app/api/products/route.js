import { supabaseAdmin, supabasePublic } from '@/lib/supabaseClient';

export async function GET() {
  const { data, error } = await supabasePublic
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ products: data });
}

export async function POST(req) {
  const adminToken = req.headers.get('x-admin-token');
  if (adminToken !== process.env.ADMIN_SECRET) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { id, name, slug, description, price, category, imageUrls, videoUrl, isActive } = body;

  const db = supabaseAdmin();
  const payload = {
    name,
    slug,
    description,
    price,
    category,
    image_urls: imageUrls || [],
    video_url: videoUrl || null,
    is_active: isActive ?? true,
    updated_at: new Date().toISOString(),
  };

  const query = id
    ? db.from('products').update(payload).eq('id', id).select().single()
    : db.from('products').insert(payload).select().single();

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ product: data });
}
