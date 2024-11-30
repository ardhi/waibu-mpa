import Factory from '../factory.js'

class Include extends Factory {
  constructor (options) {
    super(options)
    this.component.normalizeAttr(this.params)
    const { generateId } = this.plugin.app.bajo
    this.params.tag = 'div'
    this.params.attr.c = 'include'
    this.params.attr.id = generateId()
  }

  async build () {
    const { render } = this.plugin.app.waibuMpa
    const { merge, omit } = this.plugin.app.bajo.lib._
    const { locals, req, reply } = this.component

    if (!this.params.attr.resource) return
    const attr = { attr: omit(this.params.attr, ['resource', 'c', 'id', 'octag', 'content', 'class', 'style']) }
    const merged = merge({}, locals, attr)
    const options = { partial: true, req, reply }
    this.params.html = await render(this.params.attr.resource, merged, options)
  }
}

export default Include
