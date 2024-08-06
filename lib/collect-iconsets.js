import Iconset from './class/iconset.js'
import loadResource from './load-resource.js'

async function collectIconsets (ctx) {
  const { eachPlugins, importModule } = this.app.bajo
  const { isFunction, isArray, pullAt, findIndex, cloneDeep } = this.app.bajo.lib._

  this.iconsets = []
  if (this.config.iconset === false) {
    this.log.warn('%s support is disabled', this.log.write('Iconset'))
    return
  }
  this.log.debug('Collect %s', this.log.write('iconsets'))
  const me = this
  const all = []
  await eachPlugins(async function ({ file, ns }) {
    let mod = await importModule(file)
    if (isFunction(mod)) mod = await mod.call(this, ctx)
    if (!isArray(mod)) mod = [mod]
    for (const m of mod) {
      m.css = await loadResource.call(me, m, 'css')
      m.scripts = await loadResource.call(me, m, 'scripts')
      all.push(m)
      me.log.trace('- %s@%s', m.name, ns)
    }
  }, { glob: 'iconset.js', baseNs: this.name })
  const defIdx = findIndex(all, { name: this.config.iconset.default })
  if (defIdx > -1) {
    const def = cloneDeep(all[defIdx])
    pullAt(all, defIdx)
    all.unshift(def)
  }
  for (const a of all) {
    const iconset = new Iconset(this, a)
    this.iconsets.push(iconset)
  }
}

export default collectIconsets
