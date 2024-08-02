async function theme (ctx) {
  const css = [
    'waibuMpa.virtual:/purecss/pure-min.css',
    'waibuMpa.virtual:/purecss/grids-responsive-min.css',
    'waibuMpa.asset:/css/pure-ext.css'
    // 'waibuMpaFontawesome.load:/waibuMpa/theme/css.json'
  ]
  const scripts = [
    // 'waibuMpaLibs.load:/waibuMpa/theme/script.js'
  ]
  const meta = [{
    name: 'viewport',
    content: 'width=device-width, initial-scale=1'
  }]
  return {
    name: 'default',
    css,
    scripts,
    meta
  }
}

export default theme
