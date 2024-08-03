import Theme from './class/theme.js'
import Component from './class/component.js'
import loadResource from './load-resource.js'
import path from 'path'

async function loadComponentMethods (cmp) {
  const { importModule } = this.app.bajo
  const { camelCase, isEmpty, omit, isPlainObject, isFunction } = this.app.bajo.lib._
  const { fastGlob } = this.app.bajo.lib

  const component = {}
  const selector = {}
  const files = await fastGlob(`${this.config.dir.pkg}/waibuMpa/theme/component/*.js`)
  for (const file of files) {
    const baseName = path.basename(file, path.extname(file))
    let key = camelCase(baseName)
    if (baseName.slice(0, 1) === '_') key = '_' + key
    const mod = await importModule(file)
    if (isPlainObject(mod)) {
      selector[key] = mod.selector
      component[key] = mod.handler
    } else if (isFunction(mod)) {
      selector[key] = key
      component[key] = mod
    }
  }
  if (!isEmpty(component)) Object.assign(cmp, omit(component, cmp.nativeProps))
  cmp.selector = selector
}

async function collectThemes (ctx) {
  const { eachPlugins, importModule } = this.app.bajo
  const { isFunction, omit, isArray, find, isEmpty, cloneDeep } = this.app.bajo.lib._

  this.themes = []
  if (this.config.theme === false) {
    this.log.warn('%s support is disabled', this.log.write('Theme'))
    return
  }
  this.log.debug('Collect %s', this.log.write('themes'))
  const me = this
  const modso = []
  const modsf = []
  await eachPlugins(async function ({ file }) {
    const plugin = this
    let mod = await importModule(file)
    if (isFunction(mod)) mod = await mod.call(this, ctx)
    if (!isArray(mod)) mod = [mod]
    mod = mod.map(m => Object.assign(m, { plugin }))
    for (const m of mod) {
      if (m.framework) modsf.push(m)
      else modso.push(m)
    }
  }, { glob: 'theme.js', baseNs: this.name })
  for (const mod of modso) {
    mod.meta = mod.meta ?? []
    if (!isArray(mod.meta)) mod.meta = [mod.meta]
    mod.css = await loadResource.call(this, mod, 'css')
    mod.scripts = await loadResource.call(this, mod, 'scripts')
    const theme = new Theme(this, mod.name)
    Object.assign(theme, omit(mod, ['name']))
    theme.createComponent = async function ($) {
      const cmp = new Component(mod.plugin, $, theme)
      await loadComponentMethods.call(mod.plugin, cmp)
      return cmp
    }
    me.themes.push(theme)
    me.log.trace('- %s@%s', theme.name, mod.name)
  }
  for (const mod of modsf) {
    const fw = find(modso, { name: mod.framework })
    if (!fw) throw this.error('Can\'t find theme framework \'%s\'', mod.framework)
    mod.meta = mod.meta ?? []
    if (!isArray(mod.meta)) mod.meta = [mod.meta]
    if (isEmpty(mod.meta)) mod.meta = cloneDeep(fw.meta)
    mod.css = await loadResource.call(this, mod, 'css')
    if (isEmpty(mod.css)) mod.css = cloneDeep(fw.css)
    mod.scripts = await loadResource.call(this, mod, 'scripts')
    if (isEmpty(mod.scripts)) mod.scripts = cloneDeep(fw.scripts)
    const theme = new Theme(this, mod.name)
    Object.assign(theme, omit(mod, ['name']))
    theme.createComponent = async function ($) {
      const cmp = new Component(fw.plugin, $, theme)
      await loadComponentMethods.call(fw.plugin, cmp)
      return cmp
    }
    me.themes.push(theme)
    me.log.trace('- %s@%s', theme.name, mod.name)
  }
}

export default collectThemes
