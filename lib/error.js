import { handler } from './not-found.js'

const extHandler = async function (ctx, err, req, reply) {
  if (err.message === 'notfound' || err.statusCode === 404) {
    return await handler.call(this, req, reply)
  }
  let result
  try {
    result = await reply.view('waibuMpa:/500.html', { error: err })
  } catch (err) {
    result = `Error: ${err.message}` // TODO: static HTML file
  }
  return result
}

async function error (ctx) {
  const { importModule } = this.app.bajo
  const errorHandler = await importModule('waibu:/lib/webapp-scope/error-handler.js')
  await errorHandler.call(this, ctx, extHandler)
}

export default error
