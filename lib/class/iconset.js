class Iconset {
  constructor (plugin, { name, css, scripts, mapping } = {}) {
    this.plugin = plugin
    this.name = name
    this.css = css
    this.scripts = scripts
    this.mapping = mapping
  }
}

export default Iconset
