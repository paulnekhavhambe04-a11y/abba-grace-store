export const json = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  body: JSON.stringify(body)
})

// Public base URL of the site. Set SITE_URL in Netlify (e.g. https://abbagracestore.netlify.app).
export const siteUrl = (headers: Record<string, string | undefined>) => {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, '')
  const host = headers.host ?? ''
  return `${/^(localhost|127\.)/.test(host) ? 'http' : 'https'}://${host}`
}

export const MAX_DOWNLOADS = 5
