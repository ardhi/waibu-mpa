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

export default replaceTag
