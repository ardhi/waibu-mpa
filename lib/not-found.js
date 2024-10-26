function redirSvc (req, reply) {
  const { trim, find, get } = this.app.bajo.lib._
  const { outmatch } = this.app.bajo.lib
  let match = false
  let [prefix, ...args] = trim(req.url, '/').split('/')
  args = '/' + args.join('/')
  const plugin = find(this.app.bajo.pluginNames, p => {
    return get(this, `app.${p}.config.waibu.prefix`) === prefix
  })
  if (!plugin) return false
  const items = get(this, `app.${plugin}.config.waibuMpa.redirect`, {})
  for (const k in items) {
    const isMatch = outmatch(k, args)
    if (isMatch) {
      match = items[k]
      break
    }
  }
  return match
}

export async function handler (req, reply) {
  const redirectTo = await redirSvc.call(this, req, reply)
  if (redirectTo) return reply.redirectTo(redirectTo)
  const message = this.print.write('Route \'%s (%s)\' not found', req.url, req.method)
  reply.code(404)
  return await reply.view('waibuMpa.template:/404.html', { message })
}

async function notFound (ctx) {
  const me = this
  await ctx.setNotFoundHandler(async function (req, reply) {
    return await handler.call(me, req, reply)
  })
}

export default notFound
