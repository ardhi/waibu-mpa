async function replaceTag ({ el, cmp, reply, locals = {} } = {}) {
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
  if (this.config.theme.component.removeIfUnknown) cmp.$(el).remove()
  else {
    const ohtml = cmp.$(el).html().replaceAll('<!-- unknown component ', '').replaceAll(' -->', '')
    let attrs = objectToAttrs(params.attr)
    if (!isEmpty(attrs)) attrs = ' ' + attrs
    cmp.$(el).replaceWith(`<!-- unknown component <${el.name}${attrs}>${ohtml}</${el.name}> -->`)
  }
}

export default replaceTag
