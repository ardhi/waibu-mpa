function injectElements (options) {
  const { routePath } = this.app.waibu
  const { map, uniq } = this.app.bajo.lib._
  // inject css
  let items = []
  for (const item of ['theme', 'iconset']) {
    if (this.config[item].autoInsert.includes('css')) {
      items.push(...(options[item].css ?? []))
    }
  }
  const exts = [
    routePath('waibuMpa.virtual:/phosphor/regular/style.css')
  ] // always available css
  items.push(...exts)
  items = map(uniq(items), item => {
    return `<link href="${item}" rel="stylesheet" type="text/css" />`
  })
  options.$('head').prepend(items.join('\n'))
  // inject meta
  if (this.config.theme.autoInsert.includes('meta')) {
    const meta = map(options.theme.meta ?? [], m => {
      const attrs = this.objectToAttrs(m)
      return `<meta ${attrs} />`
    })
    options.$('head').prepend(meta.join('\n'))
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
  options.$('body').append(items.join('\n'))
}

export default injectElements
