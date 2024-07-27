import { handler } from './not-found.js'

const extHandler = async function (ctx, err, req, reply) {
  if (err.message === 'notfound' || err.statusCode === 404) {
    return await handler.call(this, req, reply)
  }
  return await reply.view('wakatobiMpa:/500.html', { error: err })
}

async function error (ctx) {
  const { importModule } = this.app.bajo
  const errorHandler = await importModule('wakatobi:/lib/webapp-scope/error-handler.js')
  await errorHandler.call(this, ctx, extHandler)
}

export default error
