const component = {
  method: 'POST',
  handler: async function (req, reply) {
    req.referer = req.headers['waibu-referer']
    const { ext = '.html' } = req.body
    reply.header('Content-Type', `text/html; charset=${this.config.page.charset}`)
    reply.header('Content-Language', req.lang)
    const opts = { req, reply, partial: true, ext, theme: req.params.theme ?? req.query.theme, iconset: req.params.iconset ?? req.query.iconset }
    return this.renderString(req.body, req.query, opts)
  }
}

export default component
