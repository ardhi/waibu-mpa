const component = {
  method: 'POST',
  handler: async function (req, reply) {
    const { ext = '.html' } = req.body
    reply.header('Content-Type', `text/html; charset=${this.config.page.charset}`)
    reply.header('Content-Language', req.lang)
    const opts = { req, reply, partial: true, ext }
    return this.renderString(req.body, req.query, opts)
  }
}

export default component
