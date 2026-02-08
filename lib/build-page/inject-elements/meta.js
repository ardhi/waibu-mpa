import path from 'path'

const omitted = ['css', 'style', 'links', 'scripts', 'ns', 'appTitle', 'title', 'fullTitle']
const names = ['description', 'keywords', 'robots', 'viewport', 'author', 'publisher',
  'application-name', 'generator', 'referrer', 'theme-color', 'googlebot'
]

async function meta (options) {
  const { runHook, importPkg } = this.app.bajo
  const { map, uniq, isArray, keys, omit, get, isFunction } = this.app.lib._
  const { sprintf } = this.app.lib
  const { $, theme, req, locals } = options ?? {}
  const { page = {} } = locals
  let items = []
  // meta
  for (const attr of keys(omit(locals.page, [...omitted]))) {
    if (!page[attr]) continue
    if (!names.includes(attr)) continue
    items.push({
      name: attr,
      content: isArray(page[attr]) ? page[attr].join(', ') : page[attr]
    })
  }
  if (this.config.theme && this.config.theme.autoInsert.meta) {
    await runHook(`${this.ns}.${theme.name}:beforeInjectMeta`, { meta: theme.meta, items, req })
    items.push(...(theme.meta ?? []))
    await runHook(`${this.ns}.${theme.name}:afterInjectMeta`, { meta: theme.meta, items, req })
  }
  // title
  const formatter = get(this, 'app.waibuMpa.pageTitleFormat', '%s : %s')
  const title = page.fullTitle ?? page.title
  let pageTitle
  if (isFunction(formatter)) pageTitle = await formatter.call(this, locals)
  else pageTitle = sprintf(formatter, title, this.app.waibuMpa.getAppTitle(req.lang))
  $('head').append(`<title>${pageTitle}</title>`)
  // favicon
  const favicon = this.app.waibu.config.favicon
  if (favicon) {
    const mime = await importPkg('waibu:mime')
    const ext = favicon === true ? '.ico' : path.extname(favicon)
    const type = mime.getType(ext)
    items.push({ tag: 'link', href: `/favicon${ext}`, rel: 'icon', type })
  }
  // meta
  items = map(items, m => {
    const tag = m.tag ?? 'meta'
    delete m.tag
    const attrs = this.stringifyAttribs(m)
    return `<${tag} ${attrs} />`
  })
  $('head').append(uniq(items).join('\n'))
}

export default meta
