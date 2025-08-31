function redirSvc (req) {
  const { trim, find, get } = this.app.lib._
  const { outmatch } = this.app.lib
  let match = false
  let [prefix, ...args] = trim(req.url, '/').split('/')
  args = '/' + args.join('/')
  let plugin = find(this.app.getPluginNames, p => {
    return get(this, `app.${p}.config.waibu.prefix`) === prefix
  })
  if (!plugin) {
    plugin = 'main'
    args = `/${prefix}`
  }
  const items = get(this, `app.${plugin}.config.waibuMpa.redirect`, {})
  for (const k in items) {
    const isMatch = outmatch(k)
    if (isMatch(args)) {
      match = items[k]
      break
    }
  }
  return match
}

export async function handler (req, reply, err) {
  const { getMethod } = this.app.bajo
  const { resolveTemplate } = this.app.bajoTemplate
  let redirectTo = await redirSvc.call(this, req, reply)
  if (redirectTo !== false) {
    const fn = getMethod(redirectTo, false)
    if (fn) redirectTo = await fn(req)
    if (redirectTo) return reply.redirectTo(redirectTo)
  }
  const welcome = req.url.split('?')[0] === '/'
  const msg = req.t('routeNotFound%s%s', req.url, req.method)
  const error = err ?? this.error(msg)
  if (err) error.message = msg
  error.statusCode = 404
  reply.code(404)
  if (error.noContent) return ''
  const ns = error.ns ?? this.name
  let tpl = welcome ? `${this.name}.template:/welcome.html` : `${ns}.template:/404.html`
  try {
    await resolveTemplate(tpl)
  } catch (err) {
    tpl = `${this.name}.template:/404.html`
  }
  if (reply.view) return await reply.view(tpl, { error })
}

async function notFound (ctx) {
  const me = this
  await ctx.setNotFoundHandler(async function (req, reply) {
    return await handler.call(me, req, reply)
  })
}

export default notFound
