import Theme from './class/theme.js'
import Component from './class/component.js'
import loadResource from './load-resource.js'
import path from 'path'

async function loadComponentMethods (cmp) {
  const { importModule } = this.app.bajo
  const { camelCase, isEmpty, omit, kebabCase } = this.app.bajo.lib._
  const { fastGlob } = this.app.bajo.lib

  const component = {}
  const files = await fastGlob(`${this.config.dir.pkg}/waibuMpa/theme/component/*.js`)
  for (const file of files) {
    const baseName = path.basename(file, path.extname(file))
    let key = camelCase(baseName)
    if (baseName.slice(0, 1) === '_') key = '_' + key
    component[key] = await importModule(file)
  }
  if (!isEmpty(component)) Object.assign(cmp, omit(component, cmp.nativeProps))
  const selector = {}
  for (const m in cmp) {
    if (!cmp._isValidMethod(m)) continue
    const params = { attr: { class: [], style: {} } }
    let result = await cmp[m]({ params })
    if (!result) {
      if (!params.noTag) {
        result = params.tag
        if (params.attr.type) result += `[type=${params.attr.type}]`
      }
    }
    selector[kebabCase(m)] = result
  }
  cmp.selector = selector
}

async function collectThemes (ctx) {
  const { eachPlugins, importModule } = this.app.bajo
  const { isFunction, omit, isArray } = this.app.bajo.lib._

  this.themes = []
  this.log.debug('Collect themes')
  const me = this
  await eachPlugins(async function ({ file, ns }) {
    const plugin = this
    let mod = await importModule(file)
    if (isFunction(mod)) mod = await mod.call(this, ctx)
    if (!isArray(mod)) mod = [mod]
    for (const m of mod) {
      m.meta = m.meta ?? []
      m.css = await loadResource.call(this, m, 'css')
      m.scripts = await loadResource.call(this, m, 'scripts')
      const theme = new Theme(this, m.name)
      Object.assign(theme, omit(m, ['name']))
      theme.createComponent = async function ($) {
        const cmp = new Component(plugin, $, theme)
        await loadComponentMethods.call(plugin, cmp)
        return cmp
      }
      me.themes.push(theme)
      me.log.trace('- %s@%s', theme.name, ns)
    }
  }, { glob: 'theme.js', baseNs: this.name })
}

export default collectThemes
