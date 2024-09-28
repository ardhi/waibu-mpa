export function printLink (link) {
  const { routePath } = this.app.waibu
  return `<link href="${routePath(link)}" rel="stylesheet" type="text/css" />`
}

async function css (options) {
  const { runHook } = this.app.bajo
  const { get, map, uniq, filter } = this.app.bajo.lib._
  const { $, req } = options ?? {}

  let items = []
  // inline
  for (const item of ['theme', 'iconset']) {
    if (this.config[item] && this.config[item].autoInsert.css) {
      const inlineCss = get(options, `${item}.inlineCss`)
      await runHook(`${this.name}.${item}:beforeInjectInlineCss`, { inlineCss, items, req })
      if (inlineCss) items.push(options[item].inlineCss)
      await runHook(`${this.name}.${item}:afterInjectInlineCss`, { inlineCss, items, req })
    }
  }
  if (items.length > 0) $('head').prepend(`<style>\n${uniq(items).join('\n')}\n</style>`)
  // not inline
  items = []
  for (const item of ['theme', 'iconset']) {
    if (this.config[item] && this.config[item].autoInsert.css) {
      const css = get(options, `${item}.css`)
      await runHook(`${this.name}.${item}:beforeInjectCss`, { css, items, req })
      if (css) items.push(...css)
      await runHook(`${this.name}.${item}:afterInjectCss`, { css, items, req })
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
  items = map(items, i => printLink.call(this, i))
  if (items.length > 0) $('head').prepend(uniq(items).join('\n'))
}

export default css
