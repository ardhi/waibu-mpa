import Iconset from './class/iconset.js'
import loadResource from './load-resource.js'

async function collectIconsets (ctx) {
  const { eachPlugins, importModule, runHook } = this.app.bajo
  const { omit, isFunction, isArray, pullAt, findIndex, cloneDeep } = this.lib._

  this.iconsets = []
  if (this.config.iconset === false) {
    this.log.warn('supportDisabled%s', this.log.write('Iconset'))
    return
  }
  this.log.debug('collect%s', this.log.write('iconsets'))
  const me = this
  const all = []
  await eachPlugins(async function ({ file }) {
    const { name: ns } = this
    let mod = await importModule(file)
    if (isFunction(mod)) mod = await mod.call(this, ctx)
    if (!isArray(mod)) mod = [mod]
    for (const m of mod) {
      m.css = await loadResource.call(me, m, 'css')
      m.scripts = await loadResource.call(me, m, 'scripts')
      m.ns = ns
      all.push(m)
    }
  }, { glob: 'iconset.js', prefix: this.name })
  const defIdx = findIndex(all, { name: this.config.iconset.default })
  if (defIdx > -1) {
    const def = cloneDeep(all[defIdx])
    pullAt(all, defIdx)
    all.unshift(def)
  }
  for (const a of all) {
    await runHook(`${this.name}.${a.name}:beforeCollectIconset`, a)
    const iconset = new Iconset(this.app[a.ns], omit(a, ['ns']))
    this.iconsets.push(iconset)
    this.log.trace('- %s@%s', iconset.name, iconset.plugin.name)
    await runHook(`${this.name}.${a.name}:afterCollectIconset`, iconset)
  }
}

export default collectIconsets
