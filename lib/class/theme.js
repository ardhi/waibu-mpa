class Theme {
  constructor (plugin, name) {
    this.plugin = plugin
    this.name = name
    this.css = []
    this.meta = []
  }

  createComponent ($) {}
}

export default Theme
