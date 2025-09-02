const omitted = ['css', 'style', 'scripts', 'ns', 'appTitle', 'title', 'fullTitle']
const names = ['description', 'keywords', 'robots', 'viewport', 'author', 'publisher',
  'application-name', 'generator', 'referrer', 'theme-color', 'googlebot'
]

async function meta (options) {
  const { runHook } = this.app.bajo
  const { map, uniq, isArray, merge, kebabCase, keys, omit, get, isFunction } = this.app.lib._
  const { sprintf } = this.app.lib
  const { $, theme, req, locals } = options ?? {}
  const { page = {} } = locals
  let items = []
  // meta
  const links = ['preconnect', 'dnsPrefetch']
  for (const attr of keys(omit(locals.page, [...links, ...omitted]))) {
    if (!page[attr]) continue
    if (!names.includes(attr)) continue
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
    await runHook(`${this.ns}.${theme.name}:beforeInjectMeta`, { meta: theme.meta, items, req })
    items.push(...(theme.meta ?? []))
    await runHook(`${this.ns}.${theme.name}:afterInjectMeta`, { meta: theme.meta, items, req })
  }
  items = map(items, m => {
    const tag = m.tag ?? 'meta'
    delete m.tag
    const attrs = this.attribsStringify(m)
    return `<${tag} ${attrs} />`
  })
  $('head').prepend(uniq(items).join('\n'))
  const mainTitle = get(this, 'app.main.config.waibu.title', 'Waibu App')
  const formatter = get(this, 'app.waibu.pageTitleFormat', '%s : %s')
  const title = page.fullTitle ?? page.title
  let pageTitle
  if (isFunction(formatter)) pageTitle = await formatter.call(this, title, mainTitle, locals)
  else pageTitle = sprintf(formatter, title, mainTitle)
  $('head').append(`<title>${pageTitle}</title>`)
}

export default meta
