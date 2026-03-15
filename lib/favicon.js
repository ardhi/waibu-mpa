async function handleFavicon () {
  if (!this.config.favicon) return
  const { getPluginFile, importModule, getPluginDataDir } = this.app.bajo
  const { fs } = this.app.lib
  const handleDownload = await importModule('waibu:/lib/handle-download.js')
  const me = this
  this.webAppCtx.get('/favicon.:ext', async function (req, reply) {
    // 1. main favicon
    let file = getPluginFile(`main:/favicon.${req.params.ext}`)
    if (!fs.existsSync(file)) {
      const dir = getPluginDataDir('dobo')
      // 2. site attachment
      file = `${dir}/attachment/SumbaSite/${req.site.id}/file/favicon.${req.params.ext}`
    }
    if (!fs.existsSync(file)) {
      const theme = me.app.waibuMpa.themes.find(item => item.name === req.theme)
      // 3. static dir of theme
      file = `${theme.plugin.dir.pkg}/extend/waibuStatic/asset/favicon.${req.params.ext}`
    }
    // 4. Default
    if (!fs.existsSync(file)) file = getPluginFile('waibu:/favicon.png')
    reply.header('cache-control', 'max-age=86400')
    return await handleDownload.call(me, file, req, reply)
  })
}

export default handleFavicon
