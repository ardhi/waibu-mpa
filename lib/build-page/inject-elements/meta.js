function meta (options) {
  const { map } = this.app.bajo.lib._
  const { $, theme } = options ?? {}
  if (this.config.theme && this.config.theme.autoInsert.includes('meta')) {
    const meta = map(theme.meta ?? [], m => {
      const attrs = this.objectToAttrs(m)
      return `<meta ${attrs} />`
    })
    $('head').prepend(meta.join('\n'))
  }
}

export default meta
