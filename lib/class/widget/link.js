async function linkFactory () {
  class Link extends this.app.baseClass.MpaWidget {
    constructor (options) {
      super(options)
      this.component.normalizeAttr(this.params)
      this.params.tag = 'link'
      this.params.selfClosing = true
    }

    build = async () => {
      const { routePath } = this.app.waibu
      const { isEmpty } = this.app.lib._
      if (isEmpty(this.params.attr.href)) return
      this.params.attr.href = routePath(this.params.attr.href)
    }
  }
  return Link
}
export default linkFactory
