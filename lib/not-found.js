export async function handler (req, reply) {
  const message = this.print.write('Route \'%s (%s)\' not found', req.url, req.method)
  reply.code(404)
  return await reply.view('waibuMpa:/404.html', { message })
}

async function notFound (ctx) {
  const me = this
  await ctx.setNotFoundHandler(async function (req, reply) {
    return await handler.call(me, req, reply)
  })
}

export default notFound
