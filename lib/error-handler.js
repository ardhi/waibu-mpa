import notFoundHandler from './not-found-handler.js'

async function errorHandler (err, req, reply) {
  const { fs } = this.app.lib
  const { resolveTemplate, compile } = this.app.bajoTemplate
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
    tpl = resolveTemplate(tpl)
  } catch (err) {
    tpl = resolveTemplate(`${this.ns}.template:/500.html`)
  }
  const content = fs.readFileSync(tpl.file, 'utf8')
  return await compile(content, { error: err })
}

export default errorHandler
