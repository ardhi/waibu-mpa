async function replace ({ el, cmp = {}, opts = {} } = {}) {
  const { parseAttribs, stringifyAttribs } = this.app.waibuMpa
  const { isEmpty, camelCase } = this.app.lib._
  const { reply } = opts

  const tag = camelCase(el.name.slice(cmp.namespace.length))
  const html = cmp.$(el).html()
  const attr = parseAttribs(el.attribs)
  if (reply) {
    reply.ctags = reply.ctags ?? []
    if (!reply.ctags.includes(tag)) reply.ctags.push(tag)
  }
  attr.octag = tag
  const params = { tag, attr, html, el, opts }
  const result = await cmp.buildTag(params)
  if (result) {
    cmp.$(el).replaceWith(result)
    return
  }
  if (isEmpty(attr.class)) delete attr.class
  if (isEmpty(attr.style)) delete attr.style
  switch (this.config.theme.component.unknownTag) {
    case 'remove': cmp.$(el).remove(); break
    case 'comment': {
      const ohtml = cmp.$(el).html().replaceAll('<!-- unknown component ', '').replaceAll(' -->', '')
      let attrs = stringifyAttribs(attr)
      if (!isEmpty(attrs)) attrs = ' ' + attrs
      cmp.$(el).replaceWith(`<!-- unknown component <${el.name}${attrs}>${ohtml}</${el.name}> -->`)
      break
    }
    default: {
      const result = await cmp.render({ tag: 'div', attr, html: params.html })
      cmp.$(el).replaceWith(result)
    }
  }
}

async function replaceTag ({ el, cmp = {}, opts = {} } = {}) {
  const me = this
  const children = cmp.$(el).children()
  if (children.length > 0) {
    for (const child of children) {
      await replaceTag.call(this, { el: child, cmp, opts })
      if (child.name.startsWith(cmp.namespace)) {
        await replace.call(me, { el: child, cmp, opts })
      }
    }
  }
}

export default replaceTag
