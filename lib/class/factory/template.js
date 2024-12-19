import Factory from '../factory.js'

class Template extends Factory {
  constructor (options) {
    super(options)
    this.component.normalizeAttr(this.params)
    this.params.tag = 'style'
  }
}

export default Template
