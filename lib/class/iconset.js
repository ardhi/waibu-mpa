class Iconset {
  constructor (plugin, { name, css, mapping }) {
    this.plugin = plugin
    this.name = name
    this.css = Array.isArray(css) ? css : [css]
    this.mapping = mapping
  }
}

export default Iconset
