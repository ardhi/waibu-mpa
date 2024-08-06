function script (options) {
  const { routePath } = this.app.waibu
  const { map, uniq, find, get } = this.app.bajo.lib._
  const { $ } = options ?? {}

  const defIconset = find(this.iconsets, { name: get(this.config, 'iconset.default') })
  let items = []
  // not inline
  for (const item of ['theme', 'iconset']) {
    if (this.config[item] && this.config[item].autoInsert.includes('scripts')) {
      if (options[item]) items.push(...(options[item].scripts ?? []))
    }
  }
  const exts = [] // 'always available' scripts
  if (defIconset) {
    const scripts = map(defIconset.scripts, c => routePath(c))
    exts.push(...scripts)
  }
  items.push(...exts)
  items = map(uniq(items), item => {
    return `<script src="${item}"></script>`
  })
  if (items.length > 0) $('body').append(items.join('\n'))
  items = []
  for (const item of ['theme', 'iconset']) {
    if (this.config[item] && this.config[item].autoInsert.includes('scripts')) {
      if (options[item] && options[item].inlineScript) items.push(options[item].inlineScript)
    }
  }
  if (defIconset && defIconset.inlineScript) items.push(defIconset.inlineScript)
  if (items.length > 0) $('body').append(`<script>\n${uniq(items).join('\n')}\n</script>`)
}

export default script
