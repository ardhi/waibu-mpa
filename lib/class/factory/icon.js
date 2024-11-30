import Factory from '../factory.js'

class Icon extends Factory {
  constructor (options) {
    super(options)
    this.params.tag = 'i'
    this.params.html = ''
  }

  async build () {
    const { has, omit, isEmpty } = this.plugin.app.bajo.lib._
    const { iconset } = this.component
    if (has(this.params.attr, 'oname')) this.params.attr.class.unshift(this.params.attr.oname)
    else if (iconset) {
      if (iconset.handler) await iconset.handler(this.params)
      else {
        const item = iconset.resolve(this.params.attr.name)
        if (!isEmpty(item)) this.params.attr.class.unshift(item)
      }
    }
    this.params.attr = omit(this.params.attr, ['name', 'oname'])
    this.params.html = await this.component.render(this.params)
  }
}

export default Icon
