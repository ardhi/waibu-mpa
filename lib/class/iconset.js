class Iconset {
  constructor (plugin, opts) {
    this.plugin = plugin
    this.init(opts)
  }

  init (opts) {
    const { isArray } = this.plugin.app.bajo.lib._
    this.name = opts.name
    this.css = opts.css ?? []
    this.scripts = opts.scripts ?? []
    this.inlineCss = opts.inlineCss
    this.inlineScript = opts.inlineScript
    this.prefix = opts.prefix ?? ''
    this.mapping = opts.mapping ?? {}
    this.handler = opts.handler

    if (!isArray(this.css)) this.css = [this.css]
    if (!isArray(this.scripts)) this.scripts = [this.scripts]
  }

  resolve (name) {
    const { isEmpty, has, find, kebabCase } = this.plugin.app.bajo.lib._
    const item = find(this.plugin.app.waibuMpa.iconsetMappings, rec => {
      return has(this.mapping, name) && rec.name === name
    })
    if (!item) return ''
    let value = this.mapping[name]
    if (isEmpty(value)) value = kebabCase(name)
    return `${this.prefix}${value}`
  }
}

export default Iconset
