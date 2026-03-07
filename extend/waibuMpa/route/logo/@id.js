async function resolveFile (req) {
  const { getPlugin, getPluginDataDir } = this.app.bajo
  const { camelCase } = this.app.lib._
  const { fastGlob } = this.app.lib
  const id = camelCase(req.params.id)
  const plugin = getPlugin(id)
  let type = ''
  if (req.query.type) type = `-${req.query.type}`
  if (id === 'main' && req.site) {
    // check site logo first, if any
    const dir = getPluginDataDir('dobo')
    const files = await fastGlob(`${dir}/attachment/SumbaSite/${req.site.id}/file/logo${type}.*`)
    if (files.length > 0) return files[0]
  }
  const files = await fastGlob(`${plugin.dir.pkg}/logo${type}.*`)
  if (files.length === 0) throw this.error('_notFound')
  return files[0]
}

async function logo (req, reply) {
  const { importModule } = this.app.bajo
  const handler = await importModule('waibu:/lib/handle-download.js')
  return await handler.call(this, resolveFile, req, reply)
}

export default logo
