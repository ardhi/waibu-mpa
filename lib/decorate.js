import path from 'path'
import buildLocals from './build-locals.js'

async function decorate (ctx) {
  const { importPkg } = this.app.bajo
  const { isEmpty } = this.app.bajo.lib._
  const mime = await importPkg('waibu:mime')
  const cfg = this.config
  const me = this
  ctx.decorateRequest('i18n', null)
  ctx.decorateRequest('theme', cfg.theme.default)
  ctx.decorateRequest('iconset', cfg.iconset.default)
  ctx.decorateRequest('darkMode', cfg.darkMode.default)
  // tpl format: <ns>:<path>[:theme]
  ctx.decorateReply('view', async function (template, params = {}) {
    const ext = path.extname(template)
    const mimeType = isEmpty(ext) ? `text/html; charset=${cfg.page.charset}` : mime.getType(ext)
    this.header('Content-Type', mimeType)
    this.header('Content-Language', this.request.lang)
    const locals = await buildLocals.call(me, template, params, this)
    const opts = {}
    const [, partialPath] = template.split(':')
    if (partialPath.startsWith('/partial/')) opts.partial = true
    return await me.render(template, locals, this, opts)
  })
}

export default decorate
