async function meta (options) {
  const { runHook } = this.app.bajo
  const { map, uniq } = this.app.bajo.lib._
  const { $, theme, reply } = options ?? {}
  if (this.config.theme && this.config.theme.autoInsert.includes('meta')) {
    let items = []
    await runHook(`${this.name}:beforeInjectMeta`, { meta: theme.meta, items, reply })
    items.push(...(theme.meta ?? []))
    await runHook(`${this.name}:afterInjectMeta`, { meta: theme.meta, items, reply })
    items = map(items, m => {
      const attrs = this.objectToAttrs(m)
      return `<meta ${attrs} />`
    })
    $('head').prepend(uniq(items).join('\n'))
  }
}

export default meta
