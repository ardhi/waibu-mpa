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
  // tpl format: <ns>:<path>[?theme=themeName[&=layout=layoutName]]
  ctx.decorateReply('view', async function (template, params = {}) {
    const ext = path.extname(template)
    const mimeType = isEmpty(ext) ? `text/html; charset=${cfg.page.charset}` : mime.getType(ext)
    this.header('Content-Type', mimeType)
    this.header('Content-Language', this.request.lang)
    const opts = {}
    const [, partialPath] = template.split(':')
    if (partialPath.includes('/partial/')) opts.partial = true
    return await me.render(template, params, this, opts)
  })
}

export default decorate
