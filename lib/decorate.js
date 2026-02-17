import path from 'path'

async function decorate () {
  const { importPkg } = this.app.bajo
  const { isEmpty } = this.app.lib._
  const mime = await importPkg('waibu:mime')
  const cfg = this.config
  const me = this
  this.webAppCtx.decorateRequest('theme', cfg.theme.set)
  this.webAppCtx.decorateRequest('iconset', cfg.iconset.set)
  this.webAppCtx.decorateRequest('darkMode', cfg.darkMode.set)
  this.webAppCtx.decorateRequest('referer', '')
  this.webAppCtx.decorateReply('ctags', null)
  this.webAppCtx.decorateReply('view', async function (tpl, params = {}, opts = {}) {
    let ext = path.extname(tpl)
    if (ext === '.md') ext = '.html'
    let mimeType = isEmpty(ext) ? 'text/html' : mime.getType(ext)
    mimeType += `; charset=${cfg.page.charset}`
    this.header('Content-Type', mimeType)
    this.header('Content-Language', this.request.lang)
    opts.req = this.request
    opts.reply = this
    for (const item of ['theme', 'iconset']) {
      if (!this.request[item]) this.request[item] = me[item + 's'][0].name
      if (me[item + 's'].length === 1) this.request[item] = me[item + 's'][0].name
    }
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
