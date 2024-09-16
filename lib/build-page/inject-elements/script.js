async function script (options) {
  const { runHook } = this.app.bajo
  const { routePath } = this.app.waibu
  const { map, uniq, get } = this.app.bajo.lib._
  const { $, reply } = options ?? {}

  let items = []
  // not inline
  for (const item of ['theme', 'iconset']) {
    if (this.config[item] && this.config[item].autoInsert.includes('scripts')) {
      const scripts = get(options, `${item}.scripts`)
      await runHook(`${this.name}.${item}:beforeInjectScripts`, { scripts, items, reply })
      if (scripts) items.push(...scripts)
      await runHook(`${this.name}.${item}:afterInjectScripts`, { scripts, items, reply })
    }
  }
  items = map(items, i => `<script src="${routePath(i)}"></script>`)
  if (items.length > 0) $('body').append(uniq(items).join('\n'))
  // inline
  items = []
  for (const item of ['theme', 'iconset']) {
    if (this.config[item] && this.config[item].autoInsert.includes('scripts')) {
      const inlineScript = get(options, `${item}.inlineScript`)
      await runHook(`${this.name}.${item}:beforeInjectInlineScript`, { inlineScript, items, reply })
      if (inlineScript) items.push(inlineScript)
      await runHook(`${this.name}.${item}:afterInjectInlineScript`, { inlineScript, items, reply })
    }
  }
  if (items.length > 0) $('body').append(`<script>\n${uniq(items).join('\n')}\n</script>`)
}

export default script
