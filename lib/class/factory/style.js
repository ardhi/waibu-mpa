import BaseFactory from '../base-factory.js'

class Style extends BaseFactory {
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

export default Style
