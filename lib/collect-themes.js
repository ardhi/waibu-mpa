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
  const after = {}
  const files = await fastGlob(`${this.dir.pkg}/waibuMpa/theme/component/*.js`)
  for (const file of files) {
    const baseName = path.basename(file, path.extname(file))
    let key = camelCase(baseName)
    if (baseName.slice(0, 1) === '_') key = '_' + key
    const mod = await importModule(file)
    if (isPlainObject(mod)) {
      selector[key] = mod.selector
      component[key] = mod.handler
      if (mod.after) after[key] = mod.after
    } else if (isFunction(mod)) {
      selector[key] = key
      component[key] = mod
    }
  }
  if (!isEmpty(component)) Object.assign(cmp, omit(component, cmp.nativeProps))
  cmp.selector = selector
  cmp.afterHook = after
}

async function build (mod, fw) {
  const { runHook } = this.app.bajo
  const { omit } = this.app.bajo.lib._

  await runHook(`${this.name}.${mod.name}:beforeCollectTheme`, mod, fw)
  const theme = new Theme(this, mod.name)
  Object.assign(theme, omit(mod, ['name']))
  theme.createComponent = async function ({ $, iconset, req, reply, locals }) {
    const cmp = new Component({ plugin: fw ? fw.plugin : mod.plugin, $, theme, iconset, req, reply, locals })
    for (const key in mod.component ?? {}) {
      cmp[key] = mod.component[key]
    }
    await loadComponentMethods.call(fw ? fw.plugin : mod.plugin, cmp)
    return cmp
  }
  this.themes.push(theme)
  this.log.trace('- %s@%s', theme.name, mod.name)
  await runHook(`${this.name}.${mod.name}:afterCollectTheme`, theme)
}

async function collectThemes (ctx) {
  const { eachPlugins, importModule } = this.app.bajo
  const { isFunction, isArray, find, without } = this.app.bajo.lib._

  this.themes = []
  if (this.config.theme === false) {
    this.log.warn('%s support is disabled', this.log.write('Theme'))
    return
  }
  this.log.debug('Collect %s', this.log.write('themes'))
  const modso = []
  const modsf = []
  await eachPlugins(async function ({ file }) {
    const plugin = this
    let mod = await importModule(file)
    if (isFunction(mod)) mod = await mod.call(this, ctx)
    if (!isArray(mod)) mod = [mod]
    mod = mod.map(m => Object.assign(m, { plugin }))
    for (const m of mod) {
      m.meta = m.meta ?? []
      if (!isArray(m.meta)) m.meta = [m.meta]
      m.metaExcludes = m.metaExcludes ?? []
      if (!isArray(m.metaExcludes)) m.metaExcludes = [m.metaExcludes]
      m.css = await loadResource.call(this, m, 'css')
      m.scripts = await loadResource.call(this, m, 'scripts')
      m.cssExcludes = await loadResource.call(this, m, 'cssExcludes')
      m.scriptsExcludes = await loadResource.call(this, m, 'scriptsExcludes')
      if (m.framework) modsf.push(m)
      else modso.push(m)
    }
  }, { glob: 'theme.js', prefix: this.name })
  for (const mod of modso) {
    await build.call(this, mod)
  }
  for (const mod of modsf) {
    const fw = find(modso, { name: mod.framework })
    if (!fw) throw this.error('Can\'t find theme framework \'%s\'', mod.framework)
    mod.meta.push(...without(fw.meta, ...mod.metaExcludes))
    mod.css.push(...without(fw.css, ...mod.cssExcludes))
    mod.scripts.push(...without(fw.scripts, ...mod.scriptsExcludes))
    await build.call(this, mod, fw)
  }
}

export default collectThemes
