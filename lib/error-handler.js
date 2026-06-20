import notFoundHandler from './not-found-handler.js'

async function errorHandler (err, req, reply) {
  const { resolveTemplate, compile } = this.app.bajoTemplate
  const { fs } = this.app.lib
  err.statusCode = err.statusCode ?? 500
  reply.code(err.statusCode)
  reply.header('Content-Type', `text/html; charset=${this.config.page.charset}`)
  reply.header('Content-Language', req.lang)
  if (err.message === '_notFound' || err.statusCode === 404) {
    return await notFoundHandler.call(this, err, req, reply)
  }
  if (err.noContent) return ''
  let tpl = `${this.ns}.template:/${err.statusCode}.html`
  try {
    resolveTemplate(tpl)
  } catch (err) {
    tpl = `${this.ns}.template:/500.html`
  }
  try {
    req.webApp = this.ns
    return await this.renderView({ reply, tpl, params: { error: err }, opts: { noFlash: true } })
  } catch (err) {
    // only going here if something happened in reply.view
    const content = fs.readFileSync(resolveTemplate(tpl).file, 'utf8')
    return await compile(content, { error: err })
  }
}

export default errorHandler
