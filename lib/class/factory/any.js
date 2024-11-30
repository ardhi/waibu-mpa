import Factory from '../factory.js'

class Any extends Factory {
  constructor (options) {
    super(options)
    this.component.normalizeAttr(this.params)
    const { htmlTags } = this.plugin.app.waibuMpa
    if (!htmlTags.includes(this.params.tag)) this.params.html = false
  }
}

export default Any
