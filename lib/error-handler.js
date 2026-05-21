import notFoundHandler from './not-found-handler.js'

async function errorHandler (err, req, reply) {
  const { resolveTemplate } = this.app.bajoTemplate
  err.statusCode = err.statusCode ?? 500
  reply.code(err.statusCode)
  reply.header('Content-Type', `text/html; charset=${this.config.page.charset}`)
  reply.header('Content-Language', req.lang)

  if (err.message === '_notFound' || err.statusCode === 404) {
    return await notFoundHandler.call(this, err, req, reply)
  }
  if (err.noContent) return ''
  const ns = err.ns ?? this.ns
  // let result
  let tpl = `${ns}.template:/${err.statusCode ?? 500}.html`
  try {
    resolveTemplate(tpl)
  } catch (err) {
    tpl = `${this.ns}.template:/500.html`
  }
  return reply.view(tpl, { error: err }, { noFlash: true })
}

export default errorHandler
