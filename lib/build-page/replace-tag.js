async function replace ({ el, cmp = {} } = {}) {
  const { attribsParse, attribsStringify } = this.app.waibuMpa
  const { isEmpty, camelCase } = this.app.bajo.lib._

  const tag = camelCase(el.name.slice(cmp.namespace.length))
  const html = cmp.$(el).html()
  const attr = attribsParse(el.attribs)
  attr.octag = tag
  const result = await cmp.buildTag({ tag, attr, html, el })
  if (result) {
    cmp.$(el).replaceWith(result)
    return
  }
  if (isEmpty(attr.class)) delete attr.class
  if (isEmpty(attr.style)) delete attr.style
  switch (this.config.theme.component.unknownTag) {
    case 'remove': cmp.$(el).remove(); break
    case 'divReplace': {
      const result = await cmp._render('div', { attr, html })
      cmp.$(el).replaceWith(result)
      break
    }
    default: {
      const ohtml = cmp.$(el).html().replaceAll('<!-- unknown component ', '').replaceAll(' -->', '')
      let attrs = attribsStringify(attr)
      if (!isEmpty(attrs)) attrs = ' ' + attrs
      cmp.$(el).replaceWith(`<!-- unknown component <${el.name}${attrs}>${ohtml}</${el.name}> -->`)
    }
  }
}

async function replaceTag ({ el, cmp = {} } = {}) {
  const me = this
  const children = cmp.$(el).children()
  if (children.length > 0) {
    for (const child of children) {
      await replaceTag.call(this, { el: child, cmp })
      if (child.name.startsWith(cmp.namespace)) {
        await replace.call(me, { el: child, cmp })
      }
    }
  }
}

export default replaceTag
