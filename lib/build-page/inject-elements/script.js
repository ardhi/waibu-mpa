export function printScript (script) {
  const { routePath } = this.app.waibu
  return `<script src="${routePath(script)}"></script>`
}

async function script (options) {
  const { runHook } = this.app.bajo
  const { map, uniq, get, filter } = this.app.bajo.lib._
  const { $, reply } = options ?? {}

  let items = []
  // not inline
  for (const item of ['theme', 'iconset']) {
    if (this.config[item] && this.config[item].autoInsert.scripts) {
      const scripts = get(options, `${item}.scripts`)
      await runHook(`${this.name}.${item}:beforeInjectScripts`, { scripts, items, reply })
      if (scripts) items.push(...scripts)
      await runHook(`${this.name}.${item}:afterInjectScripts`, { scripts, items, reply })
    }
  }
  const first = []
  const last = []

  items = filter(items, item => {
    if (item[0] === '^') first.push(item.slice(1))
    else if (item[0] === '$') last.push(item.slice(1))
    return !['^', '$'].includes(item[0])
  })
  items.unshift(...first)
  items.push(...last)
  items = map(items, i => printScript.call(this, i))
  if (items.length > 0) $('body').append(uniq(items).join('\n'))
  // inline
  items = []
  for (const item of ['theme', 'iconset']) {
    if (this.config[item] && this.config[item].autoInsert.scripts) {
      const inlineScript = get(options, `${item}.inlineScript`)
      await runHook(`${this.name}.${item}:beforeInjectInlineScript`, { inlineScript, items, reply })
      if (inlineScript) items.push(inlineScript)
      await runHook(`${this.name}.${item}:afterInjectInlineScript`, { inlineScript, items, reply })
    }
  }
  if (items.length > 0) $('body').append(`<script>\n${uniq(items).join('\n')}\n</script>`)
}

export default script
