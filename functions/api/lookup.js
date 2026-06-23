export async function onRequest(context) {
  const { request } = context
  const url = new URL(request.url)
  const targetUrl = new URL('https://itunes.apple.com/lookup')
  url.searchParams.forEach((value, key) => targetUrl.searchParams.set(key, value))

  const response = await fetch(targetUrl.toString(), {
    headers: { Accept: 'application/json' }
  })

  const data = await response.json()

  return new Response(JSON.stringify(data), {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300'
    }
  })
}
