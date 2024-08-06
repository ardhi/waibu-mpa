class Iconset {
  constructor (plugin, opts) {
    this.plugin = plugin
    this.init(opts)
  }

  init (opts) {
    const { isArray, kebabCase, find, get } = this.plugin.app.bajo.lib._
    const { isSet } = this.plugin.app.bajo
    this.name = opts.name
    this.css = opts.css ?? []
    this.scripts = opts.scripts ?? []
    this.inlineCss = opts.inlineCss
    this.inlineScript = opts.inlineScript
    this.mapping = opts.mapping ?? {}
    this.handler = opts.handler

    if (!isArray(this.css)) this.css = [this.css]
    if (!isArray(this.scripts)) this.scripts = [this.scripts]
    const name = get(this.plugin, 'config.iconset.default')
    const def = find(this.plugin.app.waibuMpa.iconsets, { name })
    for (const m of this.plugin.app.waibuMpa.mappingKeys) {
      let v = this.mapping[m]
      if (isSet(v)) {
        if (v === '') v = kebabCase(m)
        if (opts.prefix && v !== '~') v = opts.prefix + v
        if (v === '~' && def) v = get(def, `mapping.${m}`)
      } else if (def) {
        if (get(this, 'plugin.config.iconset.missing') === 'useDefault') v = get(def, `mapping.${m}`)
        else if (get(this, 'plugin.config.iconset.missing') === 'useNotFound') v = get(def, 'mapping._notFound')
      }
      if (v) this.mapping[m] = v
    }
  }
}

export default Iconset
