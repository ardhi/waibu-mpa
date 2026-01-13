async function styleFactory () {
  class Style extends this.app.baseClass.MpaWidget {
    constructor (options) {
      super(options)
      const { kebabCase, camelCase } = this.app.lib._
      const { selector } = this.component
      this.component.normalizeAttr(this.params)
      this.params.tag = 'style'
      let html = this.params.html
      for (const item in selector) {
        html = html.replace(camelCase(item), selector[item])
          .replace(kebabCase(item), selector[item])
      }
      this.params.html = html
    }
  }
  return Style
}

export default styleFactory
