import path from 'path'

async function decorate (ctx) {
  const { importPkg } = this.app.bajo
  const { isEmpty } = this.app.lib._
  const mime = await importPkg('waibu:mime')
  const cfg = this.config
  const me = this
  ctx.decorateRequest('theme', cfg.theme.default)
  ctx.decorateRequest('iconset', cfg.iconset.default)
  ctx.decorateRequest('darkMode', cfg.darkMode.default)
  ctx.decorateRequest('referer', '')
  ctx.decorateReply('ctags', null)
  ctx.decorateReply('view', async function (tpl, params = {}) {
    let ext = path.extname(tpl)
    if (ext === '.md') ext = '.html'
    let mimeType = isEmpty(ext) ? 'text/html' : mime.getType(ext)
    mimeType += `; charset=${cfg.page.charset}`
    this.header('Content-Type', mimeType)
    this.header('Content-Language', this.request.lang)
    const opts = { req: this.request, reply: this }
    if (me.themes.length === 1) this.request.theme = me.themes[0].name
    if (me.iconsets.length === 1) this.request.iconset = me.iconsets[0].name
    const result = await me.render(tpl, params, opts)
    if (this.request.session) {
      ext = path.extname(this.request.url)
      if (isEmpty(ext) || ['.html'].includes(ext)) {
        if (this.request.session.prevUrl !== this.request.url) this.request.session.prevUrl = this.request.url
        else this.request.session.prevUrl = ''
      }
    }
    return result
  })
}

export default decorate
