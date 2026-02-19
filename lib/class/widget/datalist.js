async function datalistFactory () {
  class Datalist extends this.app.baseClass.MpaWidget {
    constructor (options) {
      super(options)
      this.component.normalizeAttr(this.params)
      this.params.tag = 'datalist'
    }

    build = async () => {
      if (this.params.attr.options) this.params.html = await this.component.buildOptions(this.params)
    }
  }

  return Datalist
}

export default datalistFactory
