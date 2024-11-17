import path from 'path'

async function decorate (ctx) {
  const { importPkg } = this.app.bajo
  const { isEmpty } = this.app.bajo.lib._
  const mime = await importPkg('waibu:mime')
  const cfg = this.config
  const me = this
  ctx.decorateRequest('theme', cfg.theme.default)
  ctx.decorateRequest('iconset', cfg.iconset.default)
  ctx.decorateRequest('darkMode', cfg.darkMode.default)
  ctx.decorateRequest('referer', '')
  // tpl format: <ns>:<path>[?theme=themeName[&=layout=layoutName]]
  ctx.decorateReply('ctags', null)
  ctx.decorateReply('view', async function (template, params = {}) {
    let ext = path.extname(template)
    if (ext === '.md') ext = '.html'
    let mimeType = isEmpty(ext) ? 'text/html' : mime.getType(ext)
    mimeType += `; charset=${cfg.page.charset}`
    this.header('Content-Type', mimeType)
    this.header('Content-Language', this.request.lang)
    const opts = { req: this.request, reply: this }
    return await me.render(template, params, opts)
  })
}

export default decorate
