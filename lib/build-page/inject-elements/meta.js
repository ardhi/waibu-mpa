async function meta (options) {
  const { runHook } = this.app.bajo
  const { map, uniq, isArray, merge, kebabCase, keys, omit } = this.app.bajo.lib._
  const { $, theme, req, locals } = options ?? {}
  const { page = {} } = locals
  let items = []
  // meta
  const links = ['preconnect', 'dnsPrefetch']
  const omitted = ['css', 'style', 'scripts', 'ns', 'appTitle', 'title', 'fullTitle']
  for (const attr of keys(omit(locals.page, [...links, ...omitted]))) {
    if (!page[attr]) continue
    items.push({
      name: attr,
      content: isArray(page[attr]) ? page[attr].join(', ') : page[attr]
    })
  }
  // link
  for (const attr of links) {
    if (!page[attr]) continue
    items.push(merge({}, page[attr], { rel: kebabCase(attr), tag: 'link' }))
  }
  if (this.config.theme && this.config.theme.autoInsert.meta) {
    await runHook(`${this.name}.${theme.name}:beforeInjectMeta`, { meta: theme.meta, items, req })
    items.push(...(theme.meta ?? []))
    await runHook(`${this.name}.${theme.name}:afterInjectMeta`, { meta: theme.meta, items, req })
  }
  items = map(items, m => {
    const tag = m.tag ?? 'meta'
    delete m.tag
    const attrs = this.attribsStringify(m)
    return `<${tag} ${attrs} />`
  })
  $('head').prepend(uniq(items).join('\n'))
  $('head').append(`<title>${page.fullTitle ?? page.title}</title>`)
}

export default meta
