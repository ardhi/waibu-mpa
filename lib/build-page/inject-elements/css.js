async function css (options) {
  const { runHook } = this.app.bajo
  const { get, map, uniq } = this.app.bajo.lib._
  const { $, reply } = options ?? {}

  let items = []
  // inline
  for (const item of ['theme', 'iconset']) {
    if (this.config[item] && this.config[item].autoInsert.includes('css')) {
      const inlineCss = get(options, `${item}.inlineCss`)
      await runHook(`${this.name}.${item}:beforeInjectInlineCss`, { inlineCss, items, reply })
      if (inlineCss) items.push(options[item].inlineCss)
      await runHook(`${this.name}.${item}:afterInjectInlineCss`, { inlineCss, items, reply })
    }
  }
  if (items.length > 0) $('head').prepend(`<style>\n${items.join('\n')}\n</style>`)
  // not inline
  items = []
  for (const item of ['theme', 'iconset']) {
    if (this.config[item] && this.config[item].autoInsert.includes('css')) {
      const css = get(options, `${item}.css`)
      await runHook(`${this.name}.${item}:beforeInjectCss`, { css, items, reply })
      if (css) items.push(...css)
      await runHook(`${this.name}.${item}:afterInjectCss`, { css, items, reply })
    }
  }
  items = map(uniq(items), item => {
    return `<link href="${item}" rel="stylesheet" type="text/css" />`
  })
  if (items.length > 0) $('head').prepend(items.join('\n'))
}

export default css
