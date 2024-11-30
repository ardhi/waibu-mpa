import Factory from '../factory.js'

class Style extends Factory {
  constructor (options) {
    super(options)
    const { kebabCase, camelCase } = this.plugin.app.bajo.lib._
    const { selector } = this.component
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
