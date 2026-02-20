async function notFoundHandler (err, req, reply) {
  const welcome = req.url.split('?')[0] === '/'
  const { fs } = this.app.lib
  const { resolveTemplate, compile } = this.app.bajoTemplate
  const msg = req.t('routeNotFound%s%s', req.url, req.method)
  const error = err ?? this.error(msg)
  if (err) error.message = msg
  error.statusCode = 404
  reply.code(404)
  reply.header('Content-Type', `text/html; charset=${this.config.page.charset}`)
  reply.header('Content-Language', req.lang)
  if (error.noContent) return ''
  const ns = error.ns ?? this.ns
  let tpl = welcome ? `${this.ns}.template:/welcome.html` : `${ns}.template:/404.html`
  try {
    tpl = resolveTemplate(tpl)
  } catch (err) {
    tpl = resolveTemplate(`${this.ns}.template:/404.html`)
  }
  const content = fs.readFileSync(tpl.file, 'utf8')
  return await compile(content, { error: err })
}

export default notFoundHandler
