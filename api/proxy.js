// Vercel serverless function: forwards /api/* to the FastAPI backend on EC2.
//
// The site is served over https, the backend over plain http. Browsers block an https page from
// calling an http API (mixed content), so the browser calls this same-origin function instead and
// the request to the backend is made server-side, where http is allowed. vercel.json rewrites
// /api/<path> to /api/proxy?path=<path>.
//
// Backend address: BACKEND_URL, or the existing VITE_API_BASE_URL (e.g. http://<ec2-host>:8000).

const SKIP_REQUEST_HEADERS = new Set(['host', 'connection', 'content-length', 'accept-encoding', 'x-forwarded-host'])
const SKIP_RESPONSE_HEADERS = new Set(['content-encoding', 'content-length', 'transfer-encoding', 'connection'])

function envelope(status, code, message) {
  return Response.json({ error: { code, message, details: null, request_id: null } }, { status })
}

async function proxy(request) {
  const target = (process.env.BACKEND_URL || process.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')
  if (!/^https?:\/\//.test(target)) {
    return envelope(503, 'PROXY_NOT_CONFIGURED', 'Set BACKEND_URL (the backend address) in the Vercel project settings.')
  }

  const url = new URL(request.url)
  const path = (url.searchParams.get('path') || '').replace(/^\/+/, '')
  url.searchParams.delete('path')
  const query = url.searchParams.toString()
  const destination = `${target}/api/${path}${query ? `?${query}` : ''}`

  const headers = new Headers()
  for (const [name, value] of request.headers) {
    if (!SKIP_REQUEST_HEADERS.has(name.toLowerCase())) headers.set(name, value)
  }
  const hasBody = !['GET', 'HEAD'].includes(request.method)

  let response
  try {
    response = await fetch(destination, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: 'manual',
      signal: AbortSignal.timeout(25_000),
    })
  } catch {
    return envelope(502, 'BACKEND_UNREACHABLE', 'The backend server did not answer. Is it running on EC2?')
  }

  const out = new Headers()
  for (const [name, value] of response.headers) {
    if (!SKIP_RESPONSE_HEADERS.has(name.toLowerCase())) out.set(name, value)
  }
  return new Response(response.body, { status: response.status, headers: out })
}

export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy
export const OPTIONS = proxy
