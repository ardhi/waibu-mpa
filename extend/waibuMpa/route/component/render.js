const component = {
  method: 'POST',
  noCacheReq: true,
  handler: async function (req, reply) {
    const { getPluginDataDir } = this.app.bajo
    const { fs } = this.app.lib
    const { merge, get } = this.app.lib._
    req.referer = req.headers['x-referer']
    const pageId = req.headers['x-req-id']
    const { ext = '.html' } = req.body
    let params = req.query
    reply.header('Content-Type', `text/html; charset=${this.config.page.charset}`)
    reply.header('Content-Language', req.lang)
    if (pageId) {
      try {
        const file = `${getPluginDataDir(this.ns)}/cache/req/${pageId}/locals.json`
        const locals = JSON.parse(fs.readFileSync(file, 'utf8'))
        params = merge({}, locals, params)
      } catch (err) {}
    }
    const theme = get(req, 'headers.x-theme', get(params, '_meta.theme.name'))
    const iconset = get(req, 'headers.x-iconset', get(params, '_meta.iconset.name'))
    const opts = { pageId, req, reply, partial: true, ext, theme, iconset }
    return this.renderString(req.body, params, opts)
  }
}

export default component
