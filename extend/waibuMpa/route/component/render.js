const component = {
  method: 'POST',
  handler: async function (req, reply) {
    req.referer = req.headers['x-referer']
    const { ext = '.html' } = req.body
    reply.header('Content-Type', `text/html; charset=${this.config.page.charset}`)
    reply.header('Content-Language', req.lang)
    const opts = { req, reply, partial: true, ext, theme: req.headers['x-theme'], iconset: req.headers['x-iconset'] }
    return this.renderString(req.body, req.query, opts)
  }
}

export default component
