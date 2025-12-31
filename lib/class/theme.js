class Theme {
  constructor (plugin, name) {
    this.plugin = plugin
    this.app = plugin.app
    this.name = name
    this.css = []
    this.meta = []
    this.moveToEnd = ''
    this.scipts = undefined
    this.inlineCss = undefined
    this.inlineScript = undefined
    this.framework = undefined
  }

  getFramework = () => {
    const { find } = this.app.lib._

    if (!this.framework) return undefined
    return find(this.app.waibuMpa.themes, { name: this.framework })
  }

  createComponent = async (options) => {}
}

export default Theme
