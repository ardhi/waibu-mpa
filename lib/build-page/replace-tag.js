async function replace ({ el, cmp, reply, locals = {} } = {}) {
  const { objectToAttrs } = this.app.waibuMpa
  const { isEmpty } = this.app.bajo.lib._

  const tag = el.name.slice(cmp.namespace.length)
  const params = {
    html: cmp.$(el).html(),
    attr: el.attribs ?? {}
  }
  let html = await cmp.buildTag({ tag, params, reply, el, locals })
  if (html) {
    html = `${params.prepend ?? ''}${html}${params.append ?? ''}`
    cmp.$(el).replaceWith(html)
    return
  }
  if (isEmpty(params.attr.class)) delete params.attr.class
  if (isEmpty(params.attr.style)) delete params.attr.style
  switch (this.config.theme.component.unknownTag) {
    case 'remove': cmp.$(el).remove(); break
    case 'divReplace': {
      const html = await cmp._render('div', { params, insertCtagAsAttr: true })
      cmp.$(el).replaceWith(html)
      break
    }
    default: {
      const ohtml = cmp.$(el).html().replaceAll('<!-- unknown component ', '').replaceAll(' -->', '')
      let attrs = objectToAttrs(params.attr)
      if (!isEmpty(attrs)) attrs = ' ' + attrs
      cmp.$(el).replaceWith(`<!-- unknown component <${el.name}${attrs}>${ohtml}</${el.name}> -->`)
    }
  }
}

async function replaceTag ({ el, cmp, reply, locals = {} } = {}) {
  const me = this
  const children = cmp.$(el).children()
  if (children.length > 0) {
    for (const child of children) {
      await replaceTag.call(this, { el: child, cmp, reply, locals })
      if (child.name.startsWith(cmp.namespace)) await replace.call(me, { el: child, cmp, reply, locals })
    }
  }
}

export default replaceTag
