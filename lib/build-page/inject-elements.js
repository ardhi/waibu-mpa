function injectElements (options) {
  const { routePath } = this.app.waibu
  const { map, uniq } = this.app.bajo.lib._
  const { $, theme, reply } = options ?? {}
  // html
  $('html').attr('lang', reply.request.lang)
  // css
  let items = []
  for (const item of ['theme', 'iconset']) {
    if (this.config[item].autoInsert.includes('css')) {
      items.push(...(options[item].css ?? []))
    }
  }
  const exts = [
    routePath('waibuMpa.virtual:/phosphor/regular/style.css')
  ] // 'always available' css
  items.push(...exts)
  items = map(uniq(items), item => {
    return `<link href="${item}" rel="stylesheet" type="text/css" />`
  })
  $('head').prepend(items.join('\n'))
  // inject meta
  if (this.config.theme.autoInsert.includes('meta')) {
    const meta = map(theme.meta ?? [], m => {
      const attrs = this.objectToAttrs(m)
      return `<meta ${attrs} />`
    })
    $('head').prepend(meta.join('\n'))
  }
  // inject script
  items = []
  for (const item of ['theme', 'iconset']) {
    if (this.config[item].autoInsert.includes('script')) {
      items.push(...(options[item].scripts ?? []))
    }
  }
  items = map(uniq(items), item => {
    return `<script src="${item}"></script>`
  })
  $('body').append(items.join('\n'))
}

export default injectElements
