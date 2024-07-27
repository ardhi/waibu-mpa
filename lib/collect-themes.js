import Theme from './class/theme.js'
import Component from './class/component.js'

async function loadResource (mod, item) {
  mod[item] = mod[item] ?? []
  const { breakNsPath, readConfig } = this.app.bajo
  const { isArray } = this.app.bajo.lib._
  const { routePath } = this.app.wakatobiStatic
  const items = []
  const extItems = []
  for (const i in mod[item]) {
    if (mod[item][i].startsWith('/')) items.push(mod.css[i])
    else {
      const [ns, path, subNs] = breakNsPath(mod[item][i])
      if (subNs === 'load') extItems.push({ ns, path })
      else items.push(routePath(mod[item][i]))
    }
  }
  for (const c of extItems) {
    let emod = await readConfig(`${c.ns}:${c.path}`, { ns: c.ns })
    if (!isArray(emod)) emod = [emod]
    for (const m of emod) {
      items.push(m.startsWith('/') ? m : routePath(m))
    }
  }
  return items
}

async function collectThemes (ctx) {
  const { eachPlugins, importModule } = this.app.bajo
  const { isEmpty, isFunction, omit } = this.app.bajo.lib._

  this.themes = []
  this.log.debug('Collect themes')
  const me = this
  await eachPlugins(async function ({ file, ns }) {
    let mod = await importModule(file)
    if (isFunction(mod)) mod = await mod.call(this, ctx)
    mod.meta = mod.meta ?? []
    mod.css = await loadResource.call(this, mod, 'css')
    mod.scripts = await loadResource.call(this, mod, 'scripts')
    const theme = new Theme(this, mod.name)
    Object.assign(theme, omit(mod, ['name']))
    const plugin = this
    theme.createComponent = function ($) {
      const cmp = new Component(plugin, $, theme)
      if (!isEmpty(mod.component)) Object.assign(cmp, mod.component)
      return cmp
    }
    me.themes.push(theme)
    me.log.trace('- %s@%s', theme.name, ns)
  }, { glob: 'theme.js', baseNs: this.name })
}

export default collectThemes
