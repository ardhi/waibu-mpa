import BaseFactory from '../base-factory.js'

class Template extends BaseFactory {
  constructor (options) {
    super(options)
    this.component.normalizeAttr(this.params)
    this.params.tag = 'style'
  }
}

export default Template
