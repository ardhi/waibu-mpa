class Factory {
  static scripts = []
  static css = []
  static inlineScript = null
  static inlineCss = null

  constructor (options = {}) {
    this.component = options.component
    this.plugin = this.component.plugin
    this.params = options.params ?? {}
  }

  async build () {
  }
}

export default Factory
