import BaseFactory from '../base-factory.js'

class T extends BaseFactory {
  constructor (options) {
    super(options)
    const { attrToArray } = this.plugin.app.waibuMpa
    this.component.normalizeAttr(this.params)

    this.params.noTag = true
    const value = attrToArray(this.params.attr.value, '|')
    this.params.html = this.component.req.t(this.params.html, ...value)
  }
}

export default T
