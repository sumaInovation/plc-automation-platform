export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get('url');
  if (!fileUrl || !fileUrl.startsWith('https://res.cloudinary.com/')) {
    return new Response('Invalid file URL', { status: 400 });
  }
  const upstream = await fetch(fileUrl);
  if (!upstream.ok) return new Response('File not found', { status: 404 });
  const buf = await upstream.arrayBuffer();
  return new Response(buf, {
    headers: {
      'Content-Type': upstream.headers.get('content-type') || 'text/html',
      'Content-Disposition': 'inline',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}