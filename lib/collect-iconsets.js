import Iconset from './class/iconset.js'
import loadResource from './load-resource.js'

async function collectIconsets (ctx) {
  const { eachPlugins, importModule } = this.app.bajo
  const { isFunction, isArray, forOwn, kebabCase, find, has, pick, cloneDeep } = this.app.bajo.lib._

  this.iconsets = []
  if (this.config.theme === false) {
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
      m.omapping = cloneDeep(m.mapping)
      forOwn(m.mapping, (v, k) => {
        if (v === '') v = kebabCase(k)
        if (m.prefix) v = m.prefix + v
        m.mapping[k] = v
      })
      all.push(m)
      me.log.trace('- %s@%s', m.name, ns)
    }
  }, { glob: 'iconset.js', baseNs: this.name })
  const def = cloneDeep(find(all, { name: 'phosphor' }))
  for (const a of all) {
    a.mapping = pick(a.mapping, Object.keys(def.mapping))
    forOwn(def.omapping, (v, k) => {
      if (has(a.mapping, k)) return undefined
      if (v === '') v = kebabCase(k)
      a.mapping[k] = a.prefix ? (a.prefix + v) : v
    })
    delete a.omapping
    const iconset = new Iconset(this, a)
    this.iconsets.push(iconset)
  }
}

export default collectIconsets
