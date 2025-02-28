import applyFormat from '../apply-format.js'

class ViewEngine {
  constructor (plugin, name, fileExts = []) {
    this.plugin = plugin
    this.name = name
    this.fileExts = typeof fileExts === 'string' ? [fileExts] : fileExts
    this.history = {}
  }

  _applySetting (opts = {}) {
    const { req } = opts
    const { get } = this.plugin.app.bajo.lib._
    const reqNs = get(req, 'routeOptions.config.ns')
    const setting = get(this, `app.${reqNs}.config.waibuMpa`, {})
    opts.iconset = get(setting, 'iconset', req.iconset)
    opts.theme = get(setting, 'theme', req.theme)
  }

  async render (tpl, locals = {}, opts = {}) {
    this._applySetting(opts)
    opts.postProcessor = applyFormat.bind(this.plugin)
    return await this.plugin.app.bajoTemplate.render(tpl, locals, opts)
  }

  async renderString (content, locals = {}, opts = {}) {
    this._applySetting(opts)
    opts.postProcessor = applyFormat.bind(this.plugin)
    return await this.plugin.app.bajoTemplate.renderString(content, locals, opts)
  }
}

export default ViewEngine
