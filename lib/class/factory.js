class Factory {
  constructor (options = {}) {
    this.component = options.component
    this.plugin = this.component.plugin
    this.scripts = []
    this.css = []
    this.params = options.params ?? {}
  }

  async build () {
  }
}

export default Factory
