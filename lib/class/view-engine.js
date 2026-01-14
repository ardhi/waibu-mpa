import applyFormat from '../apply-format.js'

async function viewEngineFactory () {
  class MpaViewEngine extends this.app.baseClass.MpaTools {
    constructor (plugin, name, fileExts = []) {
      super(plugin)
      this.name = name
      this.fileExts = typeof fileExts === 'string' ? [fileExts] : fileExts
      this.history = {}
    }

    _applySetting = (locals = {}, opts = {}) => {
      const { req } = opts
      const { get } = this.app.lib._
      for (const key of ['theme', 'iconset']) {
        let item = get(this.app.waibuMpa, `config.${key}.set`, req[key])
        item = item ?? 'default'
        opts[key] = opts[key] ?? item
        req[key] = opts[key]
      }
      opts.postProcessor = applyFormat.bind(this.plugin)
      opts.groupId = opts.req.id
      opts.lang = opts.req.lang
    }

    render = async (tpl, locals = {}, opts = {}) => {
      this._applySetting(locals, opts)
      return await this.app.bajoTemplate.render(tpl, locals, opts)
    }

    renderString = async (content, locals = {}, opts = {}) => {
      this._applySetting(locals, opts)
      return await this.app.bajoTemplate.renderString(content, locals, opts)
    }
  }

  this.app.baseClass.MpaViewEngine = MpaViewEngine
  return MpaViewEngine
}

export default viewEngineFactory
