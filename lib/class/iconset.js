class Iconset {
  constructor (plugin, opts) {
    this.plugin = plugin
    this.app = plugin.app
    this.init(opts)
  }

  init = (opts) => {
    const { isArray } = this.app.lib._
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

  resolve = (name) => {
    const { iconsetMappings } = this.app.waibuMpa.constructor
    const { isEmpty, has, kebabCase } = this.app.lib._
    const item = iconsetMappings[name]
    if (!item || !has(this.mapping, name)) return ''
    let value = this.mapping[name]
    if (isEmpty(value)) value = kebabCase(name)
    return `${this.prefix}${value}`
  }
}

export default Iconset
