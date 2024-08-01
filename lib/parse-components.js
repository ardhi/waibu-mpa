import * as cheerio from 'cheerio'

function hacks ($) {
  const { forOwn } = this.app.bajo.lib._
  // c:include hacks
  const incs = {}
  $('div[c=include]').each(function () {
    incs[this.attribs.id] = {
      before: this.attribs.before,
      after: this.attribs.after,
      html: $(this).html()
    }
    $(this).replaceWith(this.attribs.id)
  })
  let text = $.root().html()
  forOwn(incs, (v, k) => {
    text = text.replace(k, `${v.before ?? ''}${v.html}${v.after ?? ''}`)
  })
  return text
}

function inject ({ $, theme, iconset }) {
  const { map } = this.app.bajo.lib._
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
}

async function replaceTag ({ el, cmp, reply, locals = {} } = {}) {
  const tag = el.name.slice(2)
  const params = {
    html: cmp.$(el).html(),
    attr: el.attribs ?? {}
  }
  let html = await cmp.buildTag({ tag, params, reply, el, locals })
  if (!html) return
  html = `${params.before ?? ''}${html}${params.after ?? ''}`
  if (params.wrap) {
    const parts = params.wrap.split('><')
    html = `${parts[0]}>${html}<${parts[1]}`
  }
  cmp.$(el).replaceWith(html)
}

async function walk ({ el, cmp, reply, locals = {} } = {}) {
  const me = this
  const children = cmp.$(el).children()
  if (children.length > 0) {
    for (const child of children) {
      await walk.call(me, { el: child, cmp, reply, locals })
      if (child.name.startsWith(cmp.namespace)) await replaceTag.call(me, { el: child, cmp, reply, locals })
    }
  }
}

async function parseComponents ({ text, theme, iconset, reply, locals = {}, partial = false } = {}) {
  if (!this.config.theme.component || !theme.createComponent) return text
  const $ = cheerio.load(text, {
    xml: {
      xmlMode: false,
      recognizeSelfClosing: true
    }
  }, !partial)
  const cmp = await theme.createComponent($)
  cmp.iconset = iconset
  await walk.call(this, { el: $.root(), cmp, reply, locals })
  if (!partial) {
    $('html').attr('lang', reply.request.lang)
    inject.call(this, { $, theme, iconset })
    text = hacks.call(this, $)
  } else {
    text = $.root().html()
  }
  return text
}

export default parseComponents
