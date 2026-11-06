// Contact form -> n8n webhook. The webhook address and its optional auth header come from
// environment variables (never the repo): NUXT_CONTACT_WEBHOOK_URL, and optionally
// NUXT_CONTACT_WEBHOOK_AUTH_HEADER + NUXT_CONTACT_WEBHOOK_AUTH_VALUE for n8n "Header Auth".
// Always answers { ok, message? } so the page can show the sent or failed popup.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const TRY_AGAIN = 'We could not send your message just now. Please try again, or email us at enquiries@effer-ventures.com.'

function field(body: Record<string, unknown>, key: string, max: number): string {
  const v = body[key]
  return typeof v === 'string' ? v.trim().slice(0, max) : ''
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event).catch(() => null)
  if (!body || typeof body !== 'object') {
    setResponseStatus(event, 400)
    return { ok: false, message: TRY_AGAIN }
  }

  // Honeypot: real visitors never see or fill this field, bots do. Pretend it worked.
  if (field(body, 'company', 200)) return { ok: true }

  const firstName = field(body, 'first_name', 100)
  const lastName = field(body, 'last_name', 100)
  const email = field(body, 'email', 200)
  const phone = field(body, 'phone', 50)
  const message = field(body, 'message', 5000)

  const problems: string[] = []
  if (!firstName) problems.push('your first name')
  if (!lastName) problems.push('your last name')
  if (!EMAIL.test(email)) problems.push('a valid email address')
  if (!message) problems.push('a message')
  if (problems.length) {
    setResponseStatus(event, 400)
    const list = problems.length > 1 ? problems.slice(0, -1).join(', ') + ' and ' + problems.at(-1) : problems[0]
    return { ok: false, message: `Please add ${list}, then send it again.` }
  }

  const config = useRuntimeConfig(event)
  if (!config.contactWebhookUrl) {
    console.error('contact: NUXT_CONTACT_WEBHOOK_URL is not set')
    setResponseStatus(event, 500)
    return { ok: false, message: TRY_AGAIN }
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (config.contactWebhookAuthHeader && config.contactWebhookAuthValue) {
    headers[config.contactWebhookAuthHeader] = config.contactWebhookAuthValue
  }

  try {
    await $fetch(config.contactWebhookUrl, {
      method: 'POST',
      headers,
      timeout: 10000,
      body: {
        firstName,
        lastName,
        email,
        phone,
        message,
        source: 'effer-ventures.com',
        submittedAt: new Date().toISOString(),
      },
    })
  } catch (err) {
    const status = (err as { statusCode?: number })?.statusCode
    console.error('contact: webhook failed', status ?? (err as Error)?.message)
    setResponseStatus(event, 502)
    return { ok: false, message: TRY_AGAIN }
  }

  return { ok: true }
})
