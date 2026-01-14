import iconsetFactory from './class/iconset.js'
import loadResource from './load-resource.js'

async function collectIconsets (ctx) {
  const { eachPlugins, importModule, runHook } = this.app.bajo
  const { omit, isFunction, isArray, pullAt, findIndex, cloneDeep } = this.app.lib._

  this.iconsets = []
  if (this.config.iconset === false) {
    this.log.warn('supportDisabled%s', this.t('Iconset'))
    return
  }
  this.log.debug('collect%s', this.t('iconsets'))
  const me = this
  const all = []
  await eachPlugins(async function ({ file }) {
    const { ns } = this
    let mod = await importModule(file)
    if (isFunction(mod)) mod = await mod.call(this, ctx)
    if (!isArray(mod)) mod = [mod]
    for (const m of mod) {
      for (const key of ['css', 'links', 'scripts']) {
        m[key] = await loadResource.call(me, m, key)
      }
      m.ns = ns
      all.push(m)
    }
  }, { glob: 'iconset.js', prefix: this.ns })
  const defIdx = findIndex(all, { name: this.config.iconset.default })
  if (defIdx > -1) {
    const def = cloneDeep(all[defIdx])
    pullAt(all, defIdx)
    all.unshift(def)
  }
  for (const a of all) {
    await runHook(`${this.ns}.${a.ns}:beforeCollectIconset`, a)
    const Cls = await iconsetFactory.call(this)
    const iconset = new Cls(this.app[a.ns], omit(a, ['ns']))
    this.iconsets.push(iconset)
    this.log.trace('- %s@%s', iconset.name, iconset.plugin.ns)
    await runHook(`${this.ns}.${a.ns}:afterCollectIconset`, iconset)
  }
}

export default collectIconsets
