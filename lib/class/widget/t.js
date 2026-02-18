async function tFactory () {
  class T extends this.app.baseClass.MpaWidget {
    constructor (options) {
      super(options)
      const { attrToArray } = this.app.waibu
      this.component.normalizeAttr(this.params)

      this.params.noTag = true
      const value = attrToArray(this.params.attr.value, '|')
      this.params.html = this.component.req.t(this.params.html, ...value)
    }
  }
  return T
}

export default tFactory
