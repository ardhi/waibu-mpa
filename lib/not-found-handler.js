async function notFoundHandler (err, req, reply) {
  const welcome = req.url.split('?')[0] === '/'
  const { resolveTemplate } = this.app.bajoTemplate
  const msg = req.t('routeNotFound%s%s', req.url, req.method)
  const error = err ?? this.error(msg)
  if (err) error.message = msg
  error.statusCode = 404
  reply.code(404)
  if (error.noContent) return ''
  const ns = error.ns ?? this.ns
  let tpl = welcome ? `${this.ns}.template:/welcome.html` : `${ns}.template:/404.html`
  try {
    await resolveTemplate(tpl)
  } catch (err) {
    tpl = `${this.ns}.template:/404.html`
  }
  if (reply.view) return await reply.view(tpl, { error })
}

export default notFoundHandler
