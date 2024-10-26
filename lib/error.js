import { handler } from './not-found.js'

const extHandler = async function (err, req, reply) {
  const { getPluginFile } = this.app.bajo
  const { fs } = this.app.bajo.lib
  const { template } = this.app.bajo.lib._

  if (err.message === 'notFound' || err.statusCode === 404) {
    return await handler.call(this, req, reply)
  }
  let result
  try {
    result = await reply.view('waibuMpa.template:/500.html', { error: err })
  } catch (err) {
    const file = getPluginFile(`${this.name}:/waibuMpa/template/_500.html`)
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
