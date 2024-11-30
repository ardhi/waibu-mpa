import Theme from './class/theme.js'
import Component from './class/component.js'
import loadResource from './load-resource.js'
import path from 'path'

async function addItem ({ file, container, prefix = '' } = {}) {
  const { importModule } = this.app.bajo
  const { camelCase } = this.app.bajo.lib._
  const baseName = path.basename(file, path.extname(file))
  const key = camelCase(`${prefix} ${baseName}`)
  const mod = await importModule(file)
  container[key] = mod
}

async function loadItems (type, theme) {
  const { eachPlugins } = this.app.bajo
  const { fastGlob } = this.app.bajo.lib
  const me = this

  const container = {}
  // main
  const files = await fastGlob(`${this.dir.pkg}/waibuMpa/theme/component/${type}/*.js`)
  for (const file of files) {
    await addItem.call(this, { file, container })
  }
  // extender
  await eachPlugins(async function ({ file }) {
    await addItem.call(me, { file, container, prefix: this.alias })
  }, { glob: `theme/component/${type}/*.js`, prefix: this.name })
  theme[type] = container
}

async function build (mod, fw) {
  const { runHook } = this.app.bajo
  const { omit, merge, find } = this.app.bajo.lib._
  const me = this

  await runHook(`${this.name}.${mod.name}:beforeCollectTheme`, mod, fw)
  const theme = new Theme(this, mod.name)
  Object.assign(theme, omit(mod, ['name']))
  await loadItems.call(mod.plugin, 'factory', theme)
  await loadItems.call(mod.plugin, 'method', theme)
  theme.createComponent = async function ({ $, iconset, req, reply, locals }) {
    const cmp = new Component({ plugin: fw ? fw.plugin : mod.plugin, $, theme, iconset, req, reply, locals })
    await cmp.loadBaseFactories()
    const framework = theme.framework ? find(me.themes, { name: theme.framework }) : undefined
    merge(cmp.factory, framework ? framework.factory : theme.factory)
    Object.assign(cmp, framework ? framework.method : theme.method)
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
      m.component = {}
      if (m.framework) modsf.push(m) // module needs framework
      else modso.push(m) // independent module
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
    mod.moveToEnd = fw.moveToEnd
    await build.call(this, mod, fw)
  }
}

export default collectThemes
