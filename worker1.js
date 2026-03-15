addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const BOT_API = 'http://de1.bot-hosting.net:20600'

async function handleRequest(request) {
  const url = new URL(request.url)

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      }
    })
  }

  if (url.pathname.startsWith('/botapi/')) {
    const botPath = url.pathname.replace('/botapi', '')
    const botUrl = BOT_API + botPath + url.search

    const newRequest = new Request(botUrl, {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null
    })

    try {
      const response = await fetch(newRequest)
      const newHeaders = new Headers(response.headers)
      newHeaders.set('Access-Control-Allow-Origin', '*')
      newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, X-API-Key')
      return new Response(response.body, {
        status: response.status,
        headers: newHeaders
      })
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Bot unreachable' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      })
    }
  }

  return fetch(request)
}
