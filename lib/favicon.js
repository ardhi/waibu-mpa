async function handleFavicon () {
  if (!this.config.favicon) return
  const { getPluginFile, importModule, getPluginDataDir } = this.app.bajo
  const { fs, fastGlob } = this.app.lib
  const handleDownload = await importModule('waibu:/lib/handle-download.js')
  const me = this
  this.webAppCtx.get('/favicon.:ext', async function (req, reply) {
    let file = getPluginFile('waibu:/favicon.png')
    if (req.site) {
      const dir = getPluginDataDir('dobo')
      const files = await fastGlob(`${dir}/attachment/SumbaSite/${req.site.id}/file/favicon.*`)
      if (files.length > 0) file = files[0]
    }
    if (!fs.existsSync(file)) return reply.code(404).send()
    reply.header('cache-control', 'max-age=86400')
    return await handleDownload.call(me, file, req, reply)
  })
}

export default handleFavicon
