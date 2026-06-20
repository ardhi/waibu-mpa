async function notFoundHandler (err, req, reply) {
  const welcome = req.url.split('?')[0] === '/'
  const msg = req.t('routeNotFound%s%s', req.url, req.method)
  const error = err ?? this.error(msg)
  if (err) error.message = msg
  if (!welcome) {
    error.statusCode = 404
    reply.code(404)
  }
  reply.header('Content-Type', `text/html; charset=${this.config.page.charset}`)
  reply.header('Content-Language', req.lang)
  if (error.noContent) return ''
  const tpl = welcome ? `${this.ns}.template:/welcome.html` : `${this.ns}.template:/404.html`
  req.webApp = this.ns
  return await this.renderView({ reply, tpl, params: { error } })
}

export default notFoundHandler
