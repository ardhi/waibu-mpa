import * as cheerio from 'cheerio'

const tmpPrefix = 'xcx:'
const namespace = 'c:'

async function replaceTag (el, cmp, reply) {
  const { forOwn, isEmpty, isArray, isPlainObject, isString } = this.app.bajo.lib._

  let tag = el.name.slice(2)
  let prefix = tmpPrefix
  let params = {
    html: cmp.$(el).html(),
    attr: el.attribs ?? {}
  }
  if (isString(params.attr.class)) params.attr.class = this.attrToArray(params.attr.class)
  if (isString(params.attr.style)) params.attr.style = this.attrToObject(params.attr.style)
  let attrs = []
  const result = await cmp.buildTag(tag, params, reply)
  if (result) {
    if (this.config.theme.component.insertCtag) attrs.push(`ctag="${namespace}${tag}"`)
    params = result
    prefix = ''
    tag = params.tag ?? this.config.theme.component.defaultTag
  }
  forOwn(params.attr, (v, k) => {
    if (isEmpty(v)) return undefined
    if (isArray(v)) v = this.arrayToAttr(v)
    if (isPlainObject(v)) v = this.objectToAttr(v)
    attrs.push(`${k}="${v}"`)
  })
  attrs = attrs.join(' ')
  if (!isEmpty(attrs)) attrs = ' ' + attrs
  if (params.noTag) cmp.$(el).replaceWith(params.html)
  else cmp.$(el).replaceWith(`<${prefix}${tag}${attrs}>${params.selfClosing ? '' : params.html}</${prefix}${tag}>`)
}

async function walk (el, cmp, reply) {
  const me = this
  const children = cmp.$(el).children()
  if (children.length > 0) {
    for (const child of children) {
      await walk.call(me, child, cmp, reply)
      if (child.name.startsWith(namespace)) await replaceTag.call(me, child, cmp, reply)
    }
  }
}

async function parseComponents (text, theme, reply, partial = false) {
  if (!this.config.theme.component || !theme.createComponent) return text
  const { map } = this.app.bajo.lib._
  const $ = cheerio.load(text, {
    xml: {
      xmlMode: false,
      recognizeSelfClosing: true
    }
  }, !partial)
  const cmp = theme.createComponent($)
  await walk.call(this, $.root(), cmp, reply)
  if (!partial) $('html').attr('lang', reply.request.lang)
  // inject css
  if (this.config.theme.autoInsert.includes('css')) {
    const css = map(theme.css, c => `<link href="${c}" rel="stylesheet" />`)
    $('head').prepend(css.join('\n'))
  }
  // inject script
  if (this.config.theme.autoInsert.includes('scripts')) {
    const scripts = map(theme.scripts, s => `<script src="${s}"></script>`)
    $('body').append(scripts.join('\n'))
  }
  // inject meta
  if (this.config.theme.autoInsert.includes('meta')) {
    const meta = map(theme.meta, m => {
      const attrs = this.objectToAttrs(m)
      return `<meta ${attrs} />`
    })
    $('head').prepend(meta.join('\n'))
  }
  text = $.root().html()
  text = text.replaceAll(tmpPrefix, namespace)
  return text
}

export default parseComponents
