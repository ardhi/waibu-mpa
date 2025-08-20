async function resolveFile (req) {
  const { getPlugin } = this.app.bajo
  const { camelCase } = this.lib._
  const { fastGlob } = this.lib
  const id = camelCase(req.params.id)
  const plugin = getPlugin(id)
  let type = ''
  if (req.query.type) type = `-${req.query.type}`
  const files = await fastGlob(`${plugin.dir.pkg}/extend/logo${type}.*`)
  if (files.length === 0) throw this.error('_notFound')
  return files[0]
}

async function logo (req, reply) {
  const { importModule } = this.app.bajo
  const handler = await importModule('waibu:/lib/handle-download.js')
  return await handler.call(this, resolveFile, req, reply)
}

export default logo
