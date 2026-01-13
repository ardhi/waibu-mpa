async function templateFactory () {
  class Template extends this.app.baseClass.MpaWidget {
    constructor (options) {
      super(options)
      this.component.normalizeAttr(this.params)
      this.params.tag = 'style'
    }
  }
  return Template
}

export default templateFactory
