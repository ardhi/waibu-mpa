async function resolveFile (req) {
  const { getPlugin, getPluginDataDir } = this.app.bajo
  const { camelCase } = this.app.lib._
  const { fastGlob } = this.app.lib
  const id = camelCase(req.params.id)
  let type = ''
  let files
  if (req.query.type) type = `-${req.query.type}`
  if (id !== 'main') {
    const plugin = getPlugin(id)
    files = await fastGlob(`${plugin.dir.pkg}/logo${type}.*`)
    if (files.length > 0) return files[0]
    throw this.error('_notFound')
  }
  // 1. main
  files = await fastGlob(`${this.app.main.dir.pkg}/logo${type}.*`)
  // 2. site attachment
  if (files.length > 0) return files[0]
  let dir = getPluginDataDir('dobo')
  files = await fastGlob(`${dir}/attachment/SumbaSite/${req.site.id}/file/logo${type}.*`)
  if (files.length > 0) return files[0]
  // 3. theme
  const theme = this.app.waibuMpa.themes.find(item => item.name === req.theme)
  files = await fastGlob(`${theme.plugin.dir.pkg}/extend/waibuStatic/asset/logo${type}.*`)
  if (files.length > 0) return files[0]
  // 4. default
  dir = this.app.waibu.dir.pkg
  files = await fastGlob(`${dir}/logo${type}.*`)
  if (files.length > 0) return files[0]
  throw this.error('_notFound')
}

async function logo (req, reply) {
  const { importModule } = this.app.bajo
  const handler = await importModule('waibu:/lib/handle-download.js')
  return await handler.call(this, resolveFile, req, reply)
}

export default logo
