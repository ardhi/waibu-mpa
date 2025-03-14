class Theme {
  constructor (plugin, name) {
    this.plugin = plugin
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
    const { find } = this.plugin.lib._

    if (!this.framework) return undefined
    return find(this.plugin.app.waibuMpa.themes, { name: this.framework })
  }

  createComponent = async ($) => {}
}

export default Theme
