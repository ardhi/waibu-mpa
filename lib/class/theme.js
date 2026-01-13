async function themeFactory () {
  class MpaTheme extends this.app.baseClass.MpaTools {
    constructor (plugin, name) {
      super(plugin)
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

  this.app.baseClass.MpaTheme = MpaTheme
  return MpaTheme
}

export default themeFactory
