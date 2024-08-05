import Iconset from './class/iconset.js'
import loadResource from './load-resource.js'

async function collectIconsets (ctx) {
  const { eachPlugins, importModule } = this.app.bajo
  const { omit, get, isFunction, isArray, forOwn, kebabCase, find, has, pick, cloneDeep } = this.app.bajo.lib._

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
      m.mapping = m.mapping ?? {}
      m.omapping = cloneDeep(m.mapping)
      forOwn(m.mapping, (v, k) => {
        if (v === '') v = kebabCase(k)
        if (m.prefix && v !== '~') v = m.prefix + v
        m.mapping[k] = v
      })
      all.push(m)
      me.log.trace('- %s@%s', m.name, ns)
    }
  }, { glob: 'iconset.js', baseNs: this.name })
  const def = cloneDeep(find(all, { name: 'phosphor' }))
  for (const a of all) {
    a.mapping = pick(a.mapping, Object.keys(def.mapping))
    if (a.mappingClone) {
      const cloned = find(all, { name: a.mappingClone })
      if (cloned) {
        a.mapping = {}
        forOwn(cloned.omapping, (v, k) => {
          if (v === '') v = kebabCase(k)
          if (cloned.prefix && v !== '~') v = a.prefix + v
          a.mapping[k] = v
        })
      }
    }
    forOwn(def.omapping, (v, k) => {
      if (has(a.mapping, k) && a.mapping[k] !== '~') return undefined
      if (a.mapping[k] === '~') {
        a.mapping[k] = get(def, `mapping.${k}`)
        return undefined
      }
      if (get(this, 'config.iconset.missing') === 'useDefault') a.mapping[k] = get(def, `mapping.${k}`)
      else if (get(this, 'config.iconset.missing') === 'useNotFound') a.mapping[k] = get(def, 'mapping._notFound')
    })
    const iconset = new Iconset(this, omit(a, ['omapping', 'prefix']))
    this.iconsets.push(iconset)
  }
}

export default collectIconsets
