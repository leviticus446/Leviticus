import cloudinary from '@/lib/cloudinary';

export async function POST(req) {
  const adminToken = req.headers.get('x-admin-token');
  if (adminToken !== process.env.ADMIN_SECRET) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file');
  if (!file) return Response.json({ error: 'File wajib diisi' }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

  try {
    const result = await cloudinary.uploader.upload(base64, {
      folder: 'leviticus11',
      resource_type: 'auto',
    });
    return Response.json({ url: result.secure_url, publicId: result.public_id, resourceType: result.resource_type });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
