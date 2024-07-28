import path from 'path'

async function theme (ctx) {
  const { importModule } = this.app.bajo
  const { camelCase } = this.app.bajo.lib._
  const { fastGlob } = this.app.bajo.lib

  const component = {}
  const files = await fastGlob(`${this.config.dir.pkg}/waibuMpa/theme/component/*.js`)
  for (const file of files) {
    const key = camelCase(path.basename(file, path.extname(file)))
    component[key] = await importModule(file)
  }

  const css = [
    'waibuMpa.virtual:/purecss/pure-min.css'
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
    component,
    css,
    scripts,
    meta
  }
}

export default theme
