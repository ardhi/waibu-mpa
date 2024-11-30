import Factory from '../factory.js'

class Icon extends Factory {
  constructor (options) {
    super(options)
    this.component.normalizeAttr(this.params)
    this.params.tag = 'i'
    this.params.html = ''
  }

  async build () {
    const { has, omit, isEmpty } = this.plugin.app.bajo.lib._
    if (has(this.params.attr, 'oname')) this.params.attr.class.unshift(this.params.attr.oname)
    else if (this.component.iconset) {
      if (this.component.iconset.handler) await this.component.iconset.handler(this.params)
      else {
        const item = this.component.iconset.resolve(this.params.attr.name)
        if (!isEmpty(item)) this.params.attr.class.unshift(item)
      }
    }
    this.params.attr = omit(this.params.attr, ['name', 'oname'])
    await this.component.render(this.params)
  }
}

export default Icon
