import BaseFactory from '../base-factory.js'

class Datalist extends BaseFactory {
  constructor (options) {
    super(options)
    this.component.normalizeAttr(this.params)
    this.params.tag = 'datalist'
    if (this.params.attr.options) this.params.html = this.component.buildOptions(this.params)
  }
}

export default Datalist
