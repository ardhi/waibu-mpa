function css (options) {
  const { routePath } = this.app.waibu
  const { map, uniq, find, get } = this.app.bajo.lib._
  const { $ } = options ?? {}

  let items = []
  const defIconset = find(this.iconsets, { name: get(this.config, 'iconset.default') })
  // inline
  for (const item of ['theme', 'iconset']) {
    if (this.config[item] && this.config[item].autoInsert.includes('css')) {
      if (options[item] && options[item].inlineCss) items.push(options[item].inlineCss)
    }
  }
  if (defIconset && defIconset.inlineCss) items.push(defIconset.inlineCss)
  if (items.length > 0) $('head').prepend(`<style>\n${items.join('\n')}\n</style>`)
  // not inline
  items = []
  for (const item of ['theme', 'iconset']) {
    if (this.config[item] && this.config[item].autoInsert.includes('css')) {
      if (options[item]) items.push(...(options[item].css ?? []))
    }
  }
  const exts = [] // 'always available' css
  if (defIconset) {
    const css = map(defIconset.css, c => routePath(c))
    exts.push(...css)
  }
  items.push(...exts)
  items = map(uniq(items), item => {
    return `<link href="${item}" rel="stylesheet" type="text/css" />`
  })
  if (items.length > 0) $('head').prepend(items.join('\n'))
}

export default css
