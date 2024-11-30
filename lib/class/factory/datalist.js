import Factory from '../factory.js'

class Datalist extends Factory {
  constructor (options) {
    super(options)
    this.params.tag = 'datalist'
    if (this.params.attr.options) this.params.html = this.component.buildOptions(this.params)
  }
}

export default Datalist
