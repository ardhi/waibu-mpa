import * as cheerio from 'cheerio'

async function replaceTag (el, cmp, reply) {
  const tag = el.name.slice(2)
  const params = {
    html: cmp.$(el).html(),
    attr: el.attribs ?? {}
  }
  const result = await cmp.buildTag(tag, params, reply)
  if (!result) return
  cmp.$(el).replaceWith(result)
}

async function walk (el, cmp, reply) {
  const me = this
  const children = cmp.$(el).children()
  if (children.length > 0) {
    for (const child of children) {
      await walk.call(me, child, cmp, reply)
      if (child.name.startsWith(cmp.namespace)) await replaceTag.call(me, child, cmp, reply)
    }
  }
}

async function parseComponents ({ text, theme, iconset, reply, partial = false } = {}) {
  if (!this.config.theme.component || !theme.createComponent) return text
  const { map } = this.app.bajo.lib._
  const $ = cheerio.load(text, {
    xml: {
      xmlMode: false,
      recognizeSelfClosing: true
    }
  }, !partial)
  const cmp = await theme.createComponent($)
  cmp.iconset = iconset
  await walk.call(this, $.root(), cmp, reply)
  if (!partial) $('html').attr('lang', reply.request.lang)
  // inject css
  if (this.config.theme.autoInsert.includes('css')) {
    const css = map(theme.css, c => `<link href="${c}" rel="stylesheet" type="text/css" />`)
    $('head').prepend(css.join('\n'))
  }
  if (this.config.iconset.autoInsert.includes('css')) {
    const css = map(iconset.css, c => `<link href="${c}" rel="stylesheet" type="text/css" />`)
    $('head').prepend(css.join('\n'))
  }
  // inject meta
  if (this.config.theme.autoInsert.includes('meta')) {
    const meta = map(theme.meta, m => {
      const attrs = this.objectToAttrs(m)
      return `<meta ${attrs} />`
    })
    $('head').prepend(meta.join('\n'))
  }
  // inject script
  if (this.config.theme.autoInsert.includes('scripts')) {
    const scripts = map(theme.scripts, s => `<script src="${s}"></script>`)
    $('body').append(scripts.join('\n'))
  }
  text = $.root().html()
  text = text.replaceAll(cmp.tmpPrefix, cmp.namespace)
  return text
}

export default parseComponents
