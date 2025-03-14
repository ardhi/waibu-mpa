import Factory from '../factory.js'

class Link extends Factory {
  constructor (options) {
    super(options)
    this.component.normalizeAttr(this.params)
    this.params.tag = 'link'
    this.params.selfClosing = true
  }

  build = async () => {
    const { routePath } = this.plugin.app.waibu
    const { isEmpty } = this.plugin.lib._
    if (isEmpty(this.params.attr.href)) return
    this.params.attr.href = routePath(this.params.attr.href)
  }
}

export default Link
