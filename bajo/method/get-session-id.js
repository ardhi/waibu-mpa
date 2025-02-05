async function getSessionId (rawCookie, secure) {
  const { importPkg } = this.app.bajo
  const fcookie = await importPkg('waibu:@fastify/cookie')
  const cookie = fcookie.parse(rawCookie) ?? {}
  const key = this.config.session.cookieName
  const text = cookie[key] ?? ''
  if (secure) return text
  return text.split('.')[0]
}

export default getSessionId
