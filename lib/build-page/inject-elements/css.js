async function css (options) {
  const { runHook } = this.app.bajo
  const { routePath } = this.app.waibu
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
  if (items.length > 0) $('head').prepend(`<style>\n${uniq(items).join('\n')}\n</style>`)
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
  items = map(items, i => `<link href="${routePath(i)}" rel="stylesheet" type="text/css" />`)
  if (items.length > 0) $('head').prepend(uniq(items).join('\n'))
}

export default css
