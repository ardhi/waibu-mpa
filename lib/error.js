import { handler } from './not-found.js'

const extHandler = async function (err, req, reply) {
  const { getPluginFile } = this.app.bajo
  const { fs } = this.lib
  const { resolveTemplate } = this.app.bajoTemplate
  const { template } = this.lib._
  err.statusCode = err.statusCode ?? 500
  reply.code(err.statusCode)

  if (err.message === '_notFound' || err.statusCode === 404) {
    return await handler.call(this, req, reply, err)
  }
  if (err.noContent) return ''
  const ns = err.ns ?? this.name
  let result
  let tpl = `${ns}.template:/${err.statusCode ?? 500}.html`
  try {
    await resolveTemplate(tpl)
  } catch (err) {
    tpl = `${this.name}.template:/500.html`
  }
  try {
    result = await reply.view(tpl, { error: err })
  } catch (err) {
    // only getting here when there is error on view rendering
    console.error(err)
    const file = getPluginFile(`${this.name}:/extend/bajoTemplate/template/_500.html`)
    const content = fs.readFileSync(file)
    const compiled = template(content)
    result = compiled({ error: err })
  }
  return result
}

async function error (ctx) {
  const { importModule } = this.app.bajo
  const errorHandler = await importModule('waibu:/lib/webapp-scope/error-handler.js')
  await errorHandler.call(this, ctx, extHandler)
}

export default error
